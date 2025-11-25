import requests
import json
import time
import logging
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional
import urllib3
import psycopg2
import psycopg2.extras
from concurrent.futures import ThreadPoolExecutor, as_completed

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PropertyIndexer:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session = requests.Session()
        self.session.verify = False  # Disable SSL verification for internal services
        
        # API endpoints for enrichment
        self.location_service_url = config.get('location_service_url', 'http://egov-location.egov:8080')
#         self.workflow_service_url = config.get('workflow_service_url', 'http://egov-workflow-v2.egov:8080')
        self.mdms_service_url = config.get('mdms_service_url', 'http://egov-mdms-service.egov:8080')
        self.elasticsearch_url = config.get('elasticsearch_url', 'https://elasticsearch-data.es-upgrade.svc.cluster.local:9200/')
        
        # Database connection
        self.db_config = {
            'host': config.get('db_host', '<db_url>'),
            'port': config.get('db_port', 5432),
            'database': config.get('db_name', '<db_name>'),
            'user': config.get('db_user', '<db_username>'),
            'password': config.get('db_password', '<db_password>')
        }
        
        # Index configuration
        self.index_name = "property-services-sql1"
        self.bulk_file = "bulk_properties.jsonl"
        
        # Request info template for external API calls
        self.request_info = {
            "apiId": "org.egov.pt",
            "ver": "1.0",
            "ts": int(time.time() * 1000),
            "action": "search",
            "did": "property-indexer",
            "key": "property-search",
            "msgId": str(uuid.uuid4()),
            "requesterId": "property-indexer",
            "authToken": config.get('auth_token', ''),
            "userInfo": {
                "id": 1,
                "uuid": "property-indexer-uuid",
                "type": "EMPLOYEE",
                "tenantId": "pb",
                "roles": [{"name": "Employee", "code": "EMPLOYEE", "tenantId": "pb"}]
            }
        }

    def get_db_connection(self):
        """Get database connection"""
        try:
            logger.info(f"Attempting to connect to database at {self.db_config['host']}:{self.db_config['port']}")
            conn = psycopg2.connect(**self.db_config)
            conn.set_session(autocommit=True)
            logger.info("Database connection successful")
            return conn
        except Exception as e:
            logger.error(f"Error connecting to database: {e}")
            return None


    def fetch_properties_via_sql(self, tenant_ids: List[str], limit: int = None, offset: int = 0) -> List[Dict]:
        """Fetch properties directly from database using SQL query"""
        
        # SQL query to fetch complete property data including related tables
        sql_query = """
        SELECT 
            -- Property basic info
            p.id as property_id,
            p.propertyid as property_number,
            p.tenantid as tenant_id,
            p.acknowldgementnumber as acknowledgement_number,
            p.propertytype as property_type,
            p.ownershipcategory as ownership_category,
            p.usagecategory as usage_category,
            p.nooffloors as no_of_floors,
            p.landarea as land_area,
            p.superbuiltuparea as super_built_up_area,
            p.source as source,
            p.channel as channel,
            p.creationreason as creation_reason,
            p.status as status,
            p.surveyid as survey_id,
            p.accountid as account_id,
            p.oldpropertyid as old_property_id,
            p.createdby as property_created_by,
            p.lastmodifiedby as property_last_modified_by,
            p.createdtime as property_created_time,
            p.lastmodifiedtime as property_last_modified_time,
            
            -- Address info
            addr.id as address_id,
            addr.doorno as door_no,
            addr.plotno as plot_no,
            addr.buildingname as building_name,
            addr.street as street,
            addr.locality as locality_code,
            addr.landmark as landmark,
            addr.city as city,
            addr.pincode as pincode,
            addr.detail as address_detail,
            addr.registrationid as registration_id,
            
            -- Owner info (will be aggregated)
            array_agg(DISTINCT o.name) as owner_names,
            array_agg(DISTINCT o.uuid) as owner_uuids,
            array_agg(DISTINCT o.mobilenumber) as owner_mobile_numbers,
            array_agg(DISTINCT o.emailid) as owner_emails,
            array_agg(DISTINCT o.fatherorhusband) as owner_fathers_husbands,
            array_agg(DISTINCT o.relationship) as owner_relationships,
            array_agg(DISTINCT o.ownertype) as owner_types,
            array_agg(DISTINCT o.gender) as owner_genders,
            
            -- Unit info (will be JSON aggregated)
            json_agg(DISTINCT jsonb_build_object(
                'id', u.id,
                'tenantId', u.tenantid,
                'floorNo', u.floorno,
                'unitType', u.unittype,
                'unitArea', u.unitarea,
                'usageCategory', u.usagecategory,
                'usageSubCategory', u.usagesubcategory,
                'occupancyType', u.occupancytype,
                'occupancyDate', u.occupancydate,
                'constructionType', u.constructiontype,
                'constructionSubType', u.constructionsubtype,
                'arv', u.arv,
                'active', u.active
            )) FILTER (WHERE u.id IS NOT NULL) as units,
            
            -- Document info (will be JSON aggregated)
            json_agg(DISTINCT jsonb_build_object(
                'id', d.id,
                'documentType', d.documenttype,
                'fileStoreId', d.filestoreid,
                'documentUid', d.documentuid,
                'status', d.status
            )) FILTER (WHERE d.id IS NOT NULL) as documents
            
        FROM eg_pt_property p
        LEFT JOIN eg_pt_address addr ON p.id = addr.property
        LEFT JOIN eg_pt_owner o ON p.id = o.property AND o.status = 'ACTIVE'
        LEFT JOIN eg_pt_unit u ON p.id = u.property AND u.active = true
        LEFT JOIN eg_pt_document d ON p.id = d.property AND d.status = 'ACTIVE'
        
        WHERE p.tenantid = ANY(%s)
        AND p.status IN ('ACTIVE', 'INACTIVE')
        
        GROUP BY 
            p.id, p.propertyid, p.tenantid, p.acknowldgementnumber, p.propertytype,
            p.ownershipcategory, p.usagecategory, p.nooffloors, p.landarea,
            p.superbuiltuparea, p.source, p.channel, p.creationreason, p.status,
            p.surveyid, p.accountid, p.oldpropertyid, p.createdby, p.lastmodifiedby,
            p.createdtime, p.lastmodifiedtime,
            addr.id, addr.doorno, addr.plotno, addr.buildingname, addr.street,
            addr.locality, addr.landmark, addr.city, addr.pincode, addr.detail,
            addr.registrationid
        
        ORDER BY p.lastmodifiedtime DESC
        """
        
        # Add pagination if needed
        if limit:
            sql_query += f" LIMIT {limit} OFFSET {offset}"
        
        conn = self.get_db_connection()
        if not conn:
            return []
        
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(sql_query, (tenant_ids,))
                rows = cursor.fetchall()
                
                logger.info(f"SQL query returned {len(rows)} properties")
                
                # Convert rows to property format
                properties = []
                for row in rows:
                    property_data = self._convert_sql_row_to_property(dict(row))
                    properties.append(property_data)
                
                return properties
                
        except Exception as e:
            logger.error(f"Error executing SQL query: {e}")
            return []
        finally:
            conn.close()

    def _convert_sql_row_to_property(self, row: Dict) -> Dict:
        """Convert SQL row to property format matching plain search response"""
        
        # Build owners array
        owners = []
        if row.get('owner_names') and any(row.get('owner_names')):
            for i, name in enumerate(row.get('owner_names', [])):
                if name:  # Skip null names
                    owner = {
                        'name': name,
                        'uuid': row.get('owner_uuids', [])[i] if i < len(row.get('owner_uuids', [])) else None,
                        'mobileNumber': row.get('owner_mobile_numbers', [])[i] if i < len(row.get('owner_mobile_numbers', [])) else None,
                        'emailId': row.get('owner_emails', [])[i] if i < len(row.get('owner_emails', [])) else None,
                        'fatherOrHusband': row.get('owner_fathers_husbands', [])[i] if i < len(row.get('owner_fathers_husbands', [])) else None,
                        'relationship': row.get('owner_relationships', [])[i] if i < len(row.get('owner_relationships', [])) else None,
                        'ownerType': row.get('owner_types', [])[i] if i < len(row.get('owner_types', [])) else None,
                        'gender': row.get('owner_genders', [])[i] if i < len(row.get('owner_genders', [])) else None
                    }
                    owners.append(owner)
        
        # Build address
        address = {
            'id': row.get('address_id'),
            'doorNo': row.get('door_no'),
            'plotNo': row.get('plot_no'),
            'buildingName': row.get('building_name'),
            'street': row.get('street'),
            'landmark': row.get('landmark'),
            'city': row.get('city'),
            'pincode': row.get('pincode'),
            'detail': row.get('address_detail'),
            'registrationId': row.get('registration_id'),
            'locality': {
                'code': row.get('locality_code'),
                'name': None,  # Will be enriched later
                'label': None,
                'latitude': None,
                'longitude': None
            },
            'tenantId': row.get('tenant_id'),
            'type': 'CORRESPONDENCE'
        }
        
        # Build audit details
        audit_details = {
            'createdBy': row.get('property_created_by'),
            'lastModifiedBy': row.get('property_last_modified_by'),
            'createdTime': int(row.get('property_created_time', 0) * 1000) if row.get('property_created_time') else None,
            'lastModifiedTime': int(row.get('property_last_modified_time', 0) * 1000) if row.get('property_last_modified_time') else None
        }
        
        # Build property object
        property_data = {
            'id': row.get('property_id'),
            'propertyId': row.get('property_number'),
            'tenantId': row.get('tenant_id'),
            'acknowldgementNumber': row.get('acknowledgement_number'),
            'propertyType': row.get('property_type'),
            'ownershipCategory': row.get('ownership_category'),
            'usageCategory': row.get('usage_category'),
            'noOfFloors': row.get('no_of_floors'),
            'landArea': row.get('land_area'),
            'superBuiltUpArea': row.get('super_built_up_area'),
            'source': row.get('source'),
            'channel': row.get('channel'),
            'creationReason': row.get('creation_reason'),
            'status': row.get('status'),
            'surveyId': row.get('survey_id'),
            'accountId': row.get('account_id'),
            'oldPropertyId': row.get('old_property_id'),
            'owners': owners,
            'address': address,
            'units': row.get('units', []) or [],
            'documents': row.get('documents', []) or [],
            'auditDetails': audit_details
        }
        
        return property_data

    def fetch_all_properties(self, tenant_ids: List[str], limit: int = None) -> List[Dict]:
        """Fetch all properties using direct SQL query"""
        logger.info(f"Fetching properties via SQL for tenants: {tenant_ids}")
        properties = self.fetch_properties_via_sql(tenant_ids, limit=limit)
        logger.info(f"Total properties fetched: {len(properties)}")
        return properties

    def fetch_boundary_data(self, locality_code: str, tenant_id: str) -> Optional[Dict]:
        """Fetch boundary/ward information from location service"""
        if not locality_code:
            return None
            
        url = f"{self.location_service_url}/egov-location/location/v11/boundarys/_search"
        
        payload = {
            "RequestInfo": self.request_info
        }
        
        params = {
            "hierarchyTypeCode": "REVENUE",
            "boundaryType": "Block",
            "codes": locality_code,
            "tenantId": tenant_id
        }
        
        try:
            response = self.session.post(url, json=payload, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            tenant_boundary = data.get('TenantBoundary', [])
            
            if tenant_boundary and tenant_boundary[0].get('boundary'):
                return tenant_boundary[0]['boundary'][0]
                
        except Exception as e:
            logger.warning(f"Error fetching boundary data for {locality_code}: {e}")
            
        return None

#     def fetch_workflow_history(self, acknowledgement_number: str, tenant_id: str) -> List[Dict]:
#         """Fetch workflow history from workflow service"""
#         if not acknowledgement_number:
#             return []
#
#         url = f"{self.workflow_service_url}/egov-workflow-v2/egov-wf/process/_search"
#
#         payload = {
#             "RequestInfo": self.request_info
#         }
#
#         params = {
#             "businessIds": acknowledgement_number,
#             "history": "true",
#             "tenantId": tenant_id
#         }
#
#         try:
#             response = self.session.post(url, json=payload, params=params, timeout=10)
#             response.raise_for_status()
#
#             data = response.json()
#             return data.get('ProcessInstances', [])
#
#         except Exception as e:
#             logger.warning(f"Error fetching workflow history for {acknowledgement_number}: {e}")
#
#         return []

    def fetch_tenant_data(self, tenant_id: str) -> Optional[Dict]:
        """Fetch tenant information from MDMS"""
        url = f"{self.mdms_service_url}/egov-mdms-service/v1/_search"
        
        payload = {
            "RequestInfo": self.request_info,
            "MdmsCriteria": {
                "tenantId": "pb",
                "moduleDetails": [
                    {
                        "moduleName": "tenant",
                        "masterDetails": [
                            {
                                "name": "tenants",
                                "filter": f"[?(@.code == '{tenant_id}')]"
                            }
                        ]
                    }
                ]
            }
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            tenants = data.get('MdmsRes', {}).get('tenant', {}).get('tenants', [])
            
            if tenants:
                return tenants[0]
                
        except Exception as e:
            logger.warning(f"Error fetching tenant data for {tenant_id}: {e}")
            
        return None

    def fetch_usage_category_data(self, usage_category: str) -> Optional[str]:
        """Fetch usage category name from MDMS"""
        if not usage_category:
            return None
            
        url = f"{self.mdms_service_url}/egov-mdms-service/v1/_search"
        
        payload = {
            "RequestInfo": self.request_info,
            "MdmsCriteria": {
                "tenantId": "pb",
                "moduleDetails": [
                    {
                        "moduleName": "PropertyTax",
                        "masterDetails": [
                            {
                                "name": "UsageCategory",
                                "filter": f"[?(@.code == '{usage_category}')]"
                            }
                        ]
                    }
                ]
            }
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            categories = data.get('MdmsRes', {}).get('PropertyTax', {}).get('UsageCategory', [])
            
            if categories:
                return categories[0].get('name')
                
        except Exception as e:
            logger.warning(f"Error fetching usage category data for {usage_category}: {e}")
            
        return None

    def transform_property_to_index_format(self, property_data: Dict) -> Dict:
        """Transform property data to match the legacy index configuration"""
        
        # Extract basic property information
        property_id = property_data.get('propertyId', '')
        tenant_id = property_data.get('tenantId', '')
        acknowledgement_number = property_data.get('acknowldgementNumber', '')
        
        # Extract owner information
        owners = property_data.get('owners', [])
        owner_names = [owner.get('name', '') for owner in owners if owner.get('name')]
        owner_uuids = [owner.get('uuid', '') for owner in owners if owner.get('uuid')]
        
        # Extract address information
        address = property_data.get('address', {})
        door_no = address.get('doorNo', '')
        street = address.get('street', '')
        locality_code = address.get('locality', {}).get('code', '') if address.get('locality') else ''
        
        # Extract property details
        property_type = property_data.get('propertyType', '')
        ownership_category = property_data.get('ownershipCategory', '')
        creation_reason = property_data.get('creationReason', '')
        usage_category = property_data.get('usageCategory', '')
        no_of_floors = str(property_data.get('noOfFloors', ''))
        land_area = str(property_data.get('landArea', ''))
        super_built_up_area = str(property_data.get('superBuiltUpArea', ''))
        source = property_data.get('source', '')
        channel = property_data.get('channel', '')
        status = property_data.get('status', '')
        
        # Extract other fields
        units = property_data.get('units', {})
        audit_details = property_data.get('auditDetails', {})
        prop_id = property_data.get('id', '')
        survey_id = property_data.get('surveyId', '')
        linked_properties = property_data.get('linkedProperties', {})
        account_id = property_data.get('accountId', '')
        old_property_id = property_data.get('oldPropertyId', '')
        
        # Get enrichment data if available
        enrichment = property_data.get('_enrichment', {})
        ward_data = enrichment.get('ward_data')
#         history_data = enrichment.get('history_data', [])
        tenant_data = enrichment.get('tenant_data')
        usage_category_name = enrichment.get('usage_category_name', usage_category)
        
        # Create the indexed document structure
        indexed_document = {
            "_index": self.index_name,
            "_id": f"{property_id}{tenant_id}",
            "_source": {
                "Data": {
                    # Direct field mappings from config
                    "ownerNames": owner_names,
                    "doorNo": door_no,
                    "street": street,
                    "owners": owner_uuids,
                    "acknowldgementNumber": acknowledgement_number,
                    "propertyType": property_type,
                    "ownershipCategory": ownership_category,
                    "creationReason": creation_reason,
                    "usageCategory": usage_category_name,
                    "noOfFloors": no_of_floors,
                    "landArea": land_area,
                    "superBuiltUpArea": super_built_up_area,
                    "source": source,
                    "channel": channel,
                    "units": units,
                    "auditDetails": audit_details,
                    "id": prop_id,
                    "propertyId": property_id,
                    "surveyId": survey_id,
                    "linkedProperties": linked_properties,
                    "tenantId": tenant_id,
                    "accountId": account_id,
                    "oldPropertyId": old_property_id,
                    "status": status,
                    "@timestamp": int(time.time() * 1000),
                    
                    # Enriched data from external APIs
                    "ward": ward_data,
#                     "history": history_data,
                    "tenantData": tenant_data,
                    
                    # Additional useful fields
                    "address": address,
                    "locality": address.get('locality', {}),
                    "coordinates": {
                        "latitude": address.get('latitude', 0),
                        "longitude": address.get('longitude', 0)
                    }
                }
            }
        }
        
        return indexed_document

    def write_bulk_file(self, documents: List[Dict], file_path: str):
        """Write documents to bulk index file"""
        logger.info(f"Writing {len(documents)} documents to {file_path}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            for doc in documents:
                try:
                    # Write index command
                    index_cmd = {
                        "index": {
                            "_index": doc["_index"],
                            "_id": doc["_id"]
                        }
                    }
                    f.write(json.dumps(index_cmd) + '\n')
                    
                    # Write document source
                    f.write(json.dumps(doc["_source"]) + '\n')
                    
                except Exception as e:
                    logger.error(f"Error writing document {doc.get('_id', 'unknown')}: {e}")
                    continue
                    
        logger.info(f"Successfully wrote bulk file: {file_path}")

    def upload_to_elasticsearch(self, file_path: str, chunk_size: int = 500):
        """Upload bulk data to Elasticsearch"""
        url = f"{self.elasticsearch_url}{self.index_name}/_bulk"
        
        headers = {
            "Content-Type": "application/x-ndjson",
            "Authorization": "Basic ZWxhc3RpYzpaRFJsT0RJME1UQTNNV1ppTVRGbFptRms="
        }
        
        logger.info(f"Starting upload to Elasticsearch:")
        logger.info(f"  • URL: {url}")
        logger.info(f"  • File: {file_path}")
        logger.info(f"  • Chunk size: {chunk_size} documents")
        
        total_documents_uploaded = 0
        total_chunks = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                chunk = []
                line_count = 0
                
                for line in f:
                    chunk.append(line)
                    line_count += 1
                    
                    # Upload when chunk size is reached (multiply by 2 for index + source lines)
                    if len(chunk) >= chunk_size * 2:
                        chunk_docs = len(chunk) // 2
                        total_chunks += 1
                        logger.info(f"Uploading chunk {total_chunks} with {chunk_docs} documents...")
                        success = self._upload_chunk(url, headers, chunk, chunk_number=total_chunks)
                        if success:
                            total_documents_uploaded += chunk_docs
                        chunk = []
                
                # Upload remaining data
                if chunk:
                    chunk_docs = len(chunk) // 2
                    total_chunks += 1
                    logger.info(f"Uploading final chunk {total_chunks} with {chunk_docs} documents...")
                    success = self._upload_chunk(url, headers, chunk, chunk_number=total_chunks)
                    if success:
                        total_documents_uploaded += chunk_docs
                    
                logger.info(f"Upload completed:")
                logger.info(f"  • Total chunks processed: {total_chunks}")
                logger.info(f"  • Total documents uploaded: {total_documents_uploaded}")
                logger.info(f"  • Total lines processed: {line_count}")
                
        except Exception as e:
            logger.error(f"Error uploading to Elasticsearch: {e}")

    def _upload_chunk(self, url: str, headers: Dict, chunk: List[str], max_retries: int = 3):
        """Upload a single chunk to Elasticsearch"""
        data = ''.join(chunk)
        
        for attempt in range(1, max_retries + 1):
            try:
                response = self.session.post(url, headers=headers, data=data, timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('errors'):
                        logger.warning(f"Some documents in chunk failed to index (attempt {attempt})")
                        # Log first few errors
                        for item in result.get('items', [])[:3]:
                            if 'index' in item and 'error' in item['index']:
                                logger.warning(f"Index error: {item['index']['error']}")
                    else:
                        logger.info(f"Chunk uploaded successfully ({len(chunk)//2} documents)")
                    return True
                    
                else:
                    logger.warning(f"Upload failed (attempt {attempt}): {response.status_code}")
                    
            except Exception as e:
                logger.error(f"Upload error (attempt {attempt}): {e}")
                
            if attempt < max_retries:
                time.sleep(2)
        
        logger.error("Chunk upload failed after all retries")
        return False

    def enrich_property_parallel(self, property_data: Dict) -> Dict:
        """Enrich a single property with external API data using parallel calls"""
        property_id = property_data.get('propertyId', '')
        tenant_id = property_data.get('tenantId', '')
        acknowledgement_number = property_data.get('acknowldgementNumber', '')
        locality_code = property_data.get('address', {}).get('locality', {}).get('code', '')
        usage_category = property_data.get('usageCategory', '')
        
        # Use ThreadPoolExecutor for parallel API calls
        enrichment_data = {
            'ward_data': None,
            'history_data': [],
            'tenant_data': None,
            'usage_category_name': usage_category
        }
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            # Submit all API calls
            futures = {}
            
            if locality_code:
                futures['ward'] = executor.submit(self.fetch_boundary_data, locality_code, tenant_id)
            
#             if acknowledgement_number:
#                 futures['history'] = executor.submit(self.fetch_workflow_history, acknowledgement_number, tenant_id)
            
            if tenant_id:
                futures['tenant'] = executor.submit(self.fetch_tenant_data, tenant_id)
            
            if usage_category:
                futures['usage_category'] = executor.submit(self.fetch_usage_category_data, usage_category)
            
            # Collect results
            for future_name, future in futures.items():
                try:
                    result = future.result(timeout=10)  # 10 second timeout per API call
                    
                    if future_name == 'ward':
                        enrichment_data['ward_data'] = result
                    elif future_name == 'history':
                        enrichment_data['history_data'] = result or []
                    elif future_name == 'tenant':
                        enrichment_data['tenant_data'] = result
                    elif future_name == 'usage_category' and result:
                        enrichment_data['usage_category_name'] = result
                        
                except Exception as e:
                    logger.warning(f"Error in {future_name} enrichment for property {property_id}: {e}")
        
        return enrichment_data

    def run_indexing(self, tenant_ids: List[str], enable_enrichment: bool = True, limit: int = None):
        """Main method to run the property indexing process"""
        logger.info("Starting property indexing process...")
        start_time = time.time()
        
        try:
            # Step 1: Fetch properties from database using SQL query
            logger.info("Step 1: Fetching properties from database using SQL query...")
            properties = self.fetch_all_properties(tenant_ids, limit=limit)
            
            if not properties:
                logger.warning("No properties found to index")
                return
            
            # Step 2: Transform and enrich properties
            logger.info("Step 2: Transforming and enriching property data...")
            documents = []
            
            # Process properties in batches for better memory management
            process_batch_size = 100
            for batch_start in range(0, len(properties), process_batch_size):
                batch_end = min(batch_start + process_batch_size, len(properties))
                batch_properties = properties[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//process_batch_size + 1}/{(len(properties) + process_batch_size - 1)//process_batch_size} "
                           f"({batch_start + 1}-{batch_end}/{len(properties)} properties)...")
                
                # Process batch with optional parallel enrichment
                for property_data in batch_properties:
                    try:
                        if enable_enrichment:
                            # Get enrichment data
                            enrichment = self.enrich_property_parallel(property_data)
                            # Add enrichment data to property
                            property_data['_enrichment'] = enrichment
                        
                        document = self.transform_property_to_index_format(property_data)
                        documents.append(document)
                        
                    except Exception as e:
                        logger.error(f"Error processing property {property_data.get('propertyId', 'unknown')}: {e}")
                        continue
            
            logger.info(f"Successfully processed {len(documents)} properties for indexing")
            
            # Step 3: Write to bulk file
            logger.info("Step 3: Writing bulk index file...")
            self.write_bulk_file(documents, self.bulk_file)
            
            # Step 4: Upload to Elasticsearch
            logger.info("Step 4: Uploading to Elasticsearch...")
            self.upload_to_elasticsearch(self.bulk_file)
            
            # Summary
            end_time = time.time()
            elapsed_time = end_time - start_time
            
            logger.info("=" * 60)
            logger.info("PROPERTY INDEXING COMPLETED")
            logger.info(f"Properties processed: {len(documents)}")
            logger.info(f"Data source: Direct SQL Query")
            logger.info(f"Enrichment enabled: {enable_enrichment}")
            logger.info(f"Bulk file: {self.bulk_file}")
            logger.info(f"Elasticsearch index: {self.index_name}")
            logger.info(f"Time taken: {elapsed_time:.2f} seconds ({elapsed_time/60:.1f} minutes)")
            logger.info("=" * 60)
            
        except Exception as e:
            logger.exception(f"Error during indexing process: {e}")


def main():
    """Main function - All configurations are set here for easy manual execution"""
    
    # =============================================================================
    # CONFIGURATION - MODIFY THESE VALUES AS NEEDED
    # =============================================================================
    
    # Database configuration (Production Database)
    config = {
        'db_host': '10.44.237.25',
        'db_port': 5432,
        'db_name': 'egov_prod_db',
        'db_user': 'egovuser_uat',
        'db_password': 'ynER45@@klPae',
        
        # External Service URLs (for enrichment) - using .egov namespace
        'location_service_url': 'http://egov-location.egov:8080',
        'workflow_service_url': 'http://egov-workflow-v2.egov:8080',
        'mdms_service_url': 'http://egov-mdms-service.egov:8080',
        
        # Elasticsearch configuration
        'elasticsearch_url': 'https://elasticsearch-data.es-upgrade.svc.cluster.local:9200/',
        
        # Authentication token (for external API calls)
        'auth_token': ''  # Add token here if required for external services
    }
    
    # =============================================================================
    # PROCESSING CONFIGURATION
    # =============================================================================
    
    # Tenant IDs to process
    tenant_ids = [
        'pb.amritsar',
        'pb.jalandhar', 
        'pb.ludhiana',
        'pb.mohali',
        'pb.patiala'
    ]
    
    # Processing options
    ENABLE_ENRICHMENT = True     # True: Call external APIs for enrichment, False: Skip enrichment for faster processing
    LIMIT_RECORDS = 10          # Set to number for testing (e.g., 10), None for all records
    
    # =============================================================================
    # EXECUTION
    # =============================================================================
    
    logger.info("=" * 80)
    logger.info("PROPERTY INDEXER - PRODUCTION DATABASE TO ELASTICSEARCH")
    logger.info("=" * 80)
    logger.info("Configuration:")
    logger.info(f"  • Database: {config['db_host']}:{config['db_port']}/{config['db_name']}")
    logger.info(f"  • User: {config['db_user']}")
    logger.info(f"  • Elasticsearch: {config['elasticsearch_url']}")
    logger.info(f"  • Tenant IDs: {tenant_ids}")
    logger.info(f"  • External API Enrichment: {'ENABLED' if ENABLE_ENRICHMENT else 'DISABLED'}")
    logger.info(f"  • Record Limit: {LIMIT_RECORDS if LIMIT_RECORDS else 'ALL'}")
    logger.info("=" * 80)
    
    # Create indexer and run
    try:
        indexer = PropertyIndexer(config)
        indexer.run_indexing(
            tenant_ids=tenant_ids,
            enable_enrichment=ENABLE_ENRICHMENT,
            limit=LIMIT_RECORDS
        )
    except KeyboardInterrupt:
        logger.info("\n" + "=" * 80)
        logger.info("PROCESS INTERRUPTED BY USER")
        logger.info("=" * 80)
    except Exception as e:
        logger.error("\n" + "=" * 80)
        logger.error(f"PROCESS FAILED: {e}")
        logger.error("=" * 80)
        raise


if __name__ == "__main__":
    main()