import requests
import json
import time
import logging
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional
import urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PropertyIndexerAPI:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session = requests.Session()
        self.session.verify = False  # Disable SSL verification for internal services
        
        # API endpoints
        self.property_service_url = config.get('property_service_url', 'http://property-services.egov:8080')
        self.location_service_url = config.get('location_service_url', 'http://egov-location.egov:8080')
#         self.workflow_service_url = config.get('workflow_service_url', 'http://localhost:8082')
        self.mdms_service_url = config.get('mdms_service_url', 'http://egov-mdms-service.egov:8080')
        self.elasticsearch_url = config.get('elasticsearch_url', 'http://elasticsearch-data-v1.es-cluster.svc.cluster.local:9200/')
        
        # Index configuration
        self.index_name = "property-services-temp"
        self.bulk_file = "bulk_properties_api.jsonl"
        
        # Request info template
        self.request_info = {
            "apiId": "org.egov.pt",
            "ver": "1.0",
            "ts": int(time.time() * 1000),
            "action": "search",
            "did": "property-indexer-api",
            "key": "property-search",
            "msgId": str(uuid.uuid4()),
            "requesterId": "property-indexer-api",
            "authToken": config.get('auth_token', ''),
            "userInfo": {
                "id": 1,
                "uuid": "property-indexer-api-uuid",
                "type": "EMPLOYEE",
                "tenantId": "pb",
                "roles": [{"name": "Employee", "code": "EMPLOYEE", "tenantId": "pb"}]
            }
        }

        # Thread-safe tenant cache
        self._tenant_cache = {}
        self._tenant_cache_lock = threading.Lock()

    def fetch_properties_via_plainsearch_api(self, tenant_id: str,from_date:int,to_date:int, limit: int = 1000, offset: int = 0) -> List[Dict]:
        """Fetch properties using the plain search API"""
        url = f"{self.property_service_url}/property-services/property/_plainsearch"
        
        # Plain search payload
        payload = {
            "RequestInfo": self.request_info
        }
        
        # Parameters for plain search
        params = {
            "tenantId": tenant_id,
            "limit": limit,
            "offset": offset
        }
        
            # Add date range filters if provided
        if from_date:
            params["fromDate"] = from_date
        if to_date:
            params["toDate"] = to_date
        try:
            logger.info(f"Calling plain search API: tenant={tenant_id}, limit={limit}, offset={offset}")
            logger.debug(f"URL: {url}")
            logger.debug(f"Params: {params}")
            
            response = self.session.post(url, json=payload, params=params, timeout=120)
            response.raise_for_status()
            
            data = response.json()
            properties = data.get('Properties', [])
            logger.info(f"Plain search API returned {len(properties)} properties")
            
            return properties
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling plain search API: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response text: {e.response.text}")
            return []

    def fetch_all_properties_via_api(self, tenant_ids: List[str],from_date:int,to_date:int, batch_size: int = 1000, total_limit: int = None) -> List[Dict]:
        """Fetch all properties for all tenants using offset-based parallelism"""
        all_properties = []

        def fetch_page(tenant_id, offset):
            return self.fetch_properties_via_plainsearch_api(tenant_id, from_date, to_date, batch_size, offset)

        for tenant_id in tenant_ids:
            results = []
            offsets_to_fetch = [0]
            seen_offsets = set()
            futures = {}

            with ThreadPoolExecutor(max_workers=10) as executor:
                while offsets_to_fetch or futures:
                    # Schedule new fetch tasks for available offsets
                    while offsets_to_fetch:
                        offset = offsets_to_fetch.pop(0)
                        if offset not in seen_offsets:
                            seen_offsets.add(offset)
                            futures[executor.submit(fetch_page, tenant_id, offset)] = offset

                    for future in as_completed(list(futures.keys())):
                        offset = futures[future]
                        try:
                            properties = future.result()
                            results.extend(properties)
                            if total_limit and len(results) >= total_limit:
                                break
                            # Only schedule a next offset if full batch was returned
                            if len(properties) == batch_size:
                                next_offset = offset + batch_size
                                if not (total_limit and len(results) >= total_limit) and next_offset not in seen_offsets:
                                    offsets_to_fetch.append(next_offset)
                            futures.pop(future)
                            if total_limit and len(results) >= total_limit:
                                break
                        except Exception as e:
                            logger.error(f"Error fetching properties for offset {offset}: {e}")
                            futures.pop(future)
                    # If a batch shorter than batch_size, we stop fetching further
                    if total_limit and len(results) >= total_limit:
                        break
            all_properties.extend(results)
            logger.info(f"Tenant {tenant_id}: fetched {len(results)} properties via parallel offset paging.")
        logger.info(f"Total properties fetched: {len(all_properties)}")
        return all_properties

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
        """Fetch tenant information from MDMS, but only once per tenant_id (thread-safe)"""
        with self._tenant_cache_lock:
            if tenant_id in self._tenant_cache:
                return self._tenant_cache[tenant_id]
        # Not cached: fetch from API
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
            
            result = tenants[0] if tenants else None
            with self._tenant_cache_lock:
                self._tenant_cache[tenant_id] = result
            return result
            # if tenants:
            #     return tenants[0]
                
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
            # 'history_data': [],
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
                    # elif future_name == 'history':
                    #     enrichment_data['history_data'] = result or []
                    elif future_name == 'tenant':
                        enrichment_data['tenant_data'] = result
                    elif future_name == 'usage_category' and result:
                        enrichment_data['usage_category_name'] = result
                        
                except Exception as e:
                    logger.warning(f"Error in {future_name} enrichment for property {property_id}: {e}")
        
        return enrichment_data

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
        no_of_floors = property_data.get('noOfFloors', '') if property_data.get('noOfFloors') is not None else None
        land_area = property_data.get('landArea', '') if property_data.get('landArea') is not None else None
        super_built_up_area = property_data.get('superBuiltUpArea') if property_data.get('superBuiltUpArea') is not None else None
        source = property_data.get('source', '')
        channel = property_data.get('channel', '')
        status = property_data.get('status', '')
        
        # Extract other fields
        units = property_data.get('units', {})
        audit_details = property_data.get('auditDetails', {})
        created_time_epoch = property_data.get("auditDetails", {}).get("lastModifiedTime", int(time.time() * 1000))
        # Convert epoch (milliseconds) to ISO date string
        created_time_iso = datetime.utcfromtimestamp(created_time_epoch / 1000).isoformat() + "Z"
        prop_id = property_data.get('id', '')
        survey_id = property_data.get('surveyId', '')
        linked_properties = property_data.get('linkedProperties', {})
        account_id = property_data.get('accountId', '')
        old_property_id = property_data.get('oldPropertyId', '')
        
        # Get enrichment data if available
        enrichment = property_data.get('_enrichment', {})
        ward_data = enrichment.get('ward_data')
        # history_data = enrichment.get('history_data', [])
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
                    "noOfFloors": no_of_floors,
                    "@timestamp": created_time_iso,
                    
                    # Enriched data from external APIs
                    "ward": ward_data,
                    # "history": history_data,
                    "tenantData": tenant_data,
                    
                    # Additional useful fields
                    # "address": address,
                    "locality": address.get('locality', {}).get('code'),
                    # "coordinates": {
                    #     "latitude": address.get('latitude', 0),
                    #     "longitude": address.get('longitude', 0)
                    # }
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
                            "_type": "general",
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
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                chunk = []
                line_count = 0
                
                for line in f:
                    chunk.append(line)
                    line_count += 1
                    
                    # Upload when chunk size is reached (multiply by 2 for index + source lines)
                    if len(chunk) >= chunk_size * 2:
                        self._upload_chunk(url, headers, chunk)
                        chunk = []
                
                # Upload remaining data
                if chunk:
                    self._upload_chunk(url, headers, chunk)
                    
                logger.info(f"Completed upload. Total lines processed: {line_count}")
                
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
                    
                    # Log successful and failed document IDs
                    successful_count = 0
                    failed_count = 0
                    
                    for item in result.get('items', []):
                        if 'index' in item:
                            doc_id = item['index'].get('_id', 'unknown')
                            if 'error' not in item['index']:
                                successful_count += 1
                                logger.info(f"✓ Successfully pushed document _id: {doc_id}")
                            else:
                                failed_count += 1
                                error = item['index']['error']
                                logger.error(f"✗ Failed to push document _id: {doc_id}, error: {error}")
                    
                    if result.get('errors'):
                        logger.warning(f"Upload completed with errors - Success: {successful_count}, Failed: {failed_count}")
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

    def run_indexing(self, tenant_ids: List[str], from_date:int,to_date:int, enable_enrichment: bool = True, batch_size: int = 1000,elasticsearch_chunk_size:int =2000,process_batch_size:int=1000, total_limit: int = None):
        """Main method to run the property indexing process"""
        logger.info("Starting property indexing process using Plain Search API...")
        start_time = time.time()
        
        try:
            # Step 1: Fetch properties using Plain Search API
            logger.info("Step 1: Fetching properties using Plain Search API...")
            properties = self.fetch_all_properties_via_api(tenant_ids,from_date, to_date, batch_size, total_limit)
            
            if not properties:
                logger.warning("No properties found to index")
                return
            
            # Step 2: Transform and enrich properties
            logger.info("Step 2: Transforming and enriching property data...")
            documents = []
            
            # Process properties in batches for better memory management
            process_batch_size = process_batch_size   # Process 50 at a time for better efficiency
            for batch_start in range(0, len(properties), process_batch_size):
                batch_end = min(batch_start + process_batch_size, len(properties))
                batch_properties = properties[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//process_batch_size + 1}/{(len(properties) + process_batch_size - 1)//process_batch_size} "
                           f"({batch_start + 1}-{batch_end}/{len(properties)} properties)...")
                
                
                # Run enrichment in parallel for 10 properties at a time
                if enable_enrichment:

                    with ThreadPoolExecutor(max_workers=5) as executor:
                        future_to_property = {executor.submit(self.enrich_property_parallel, property_data): property_data for property_data in batch_properties}
                        for future in as_completed(future_to_property):
                            property_data = future_to_property[future]
                            try:
                                enrichment = future.result()
                                property_data['_enrichment'] = enrichment
                                document = self.transform_property_to_index_format(property_data)
                                documents.append(document)
                            except Exception as e:
                                logger.error(f"Error processing property {property_data.get('propertyId', 'unknown')}: {e}")
                                continue


                # # Process batch with optional parallel enrichment
                # for property_data in batch_properties:
                #     try:
                #         if enable_enrichment:
                #             # Get enrichment data
                #             enrichment = self.enrich_property_parallel(property_data)
                #             # Add enrichment data to property
                #             property_data['_enrichment'] = enrichment
                        
                #         document = self.transform_property_to_index_format(property_data)
                #         documents.append(document)
                        
                #     except Exception as e:
                #         logger.error(f"Error processing property {property_data.get('propertyId', 'unknown')}: {e}")
                #         continue
            
            logger.info(f"Successfully processed {len(documents)} properties for indexing")
            
            # Step 3: Write to bulk file
            logger.info("Step 3: Writing bulk index file...")
            self.write_bulk_file(documents, self.bulk_file)
            
            # Step 4: Upload to Elasticsearch
            logger.info("Step 4: Uploading to Elasticsearch...")
            self.upload_to_elasticsearch(self.bulk_file, chunk_size=elasticsearch_chunk_size)
            
            # Summary
            end_time = time.time()
            elapsed_time = end_time - start_time
            
            logger.info("=" * 60)
            logger.info("PROPERTY INDEXING COMPLETED")
            logger.info(f"Properties processed: {len(documents)}")
            logger.info(f"Data source: Plain Search API")
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
    
    # Service configuration
    config = {
        # Property service API
        'property_service_url': 'http://property-services.egov:8080',
        
        # External Service URLs (for enrichment)
        'location_service_url': 'http://egov-location.egov:8080',
#         'workflow_service_url': 'http://localhost:8082',
        'mdms_service_url': 'http://egov-mdms-service.egov:8080',
        
        # Elasticsearch configuration
        'elasticsearch_url': 'http://elasticsearch-data-v1.es-cluster.svc.cluster.local:9200/',
        
        # Authentication token (if required)
        'auth_token': ''  # Add token here if required
    }
    
    # =============================================================================
    # PROCESSING CONFIGURATION
    # =============================================================================
    
    # Tenant IDs to process - all tenants for full data load
    tenant_ids = [
        'pb.abohar',
        'pb.ahmedgarh',
        'pb.ajnala',
        'pb.amritsar',
        'pb.anandpursahib',
        'pb.baghapurana',
        'pb.balachaur',
        'pb.banga',
        'pb.bariwala',
        'pb.barnala',
        'pb.bassipathana',
        'pb.begowal',
        'pb.bhadson',
        'pb.bhawanigarh',
        'pb.bhogpur',
        'pb.bhuchomandi',
        'pb.cheema',
        'pb.dasuya',
        'pb.dharamkot',
        'pb.dhariwal',
        'pb.dhilwan',
        'pb.dhuri',
        'pb.faridkot',
        'pb.ferozepur',
        'pb.garhdiwala',
        'pb.goniana',
        'pb.goraya',
        'pb.gurdaspur',
        'pb.hariana',
        'pb.hoshiarpur',
        'pb.jagraon',
        'pb.jaitu',
        'pb.khanna',
        'pb.kharar',
        'pb.kotfatta',
        'pb.kurali',
        'pb.lalru',
        'pb.lehragaga',
        'pb.longowal',
        'pb.maloud',
        'pb.malout',
        'pb.mandigobindgarh',
        'pb.maur',
        'pb.mohali',
        'pb.moonak',
        'pb.morinda',
        'pb.mullanpur',
        'pb.nabha',
        'pb.nangal',
        'pb.nawanshahr',
        'pb.nihalsinghwala',
        'pb.nurmahal',
        'pb.patiala',
        'pb.payal',
        'pb.phagwara',
        'pb.phillaur',
        'pb.quadian',
        'pb.rajasansi',
        'pb.rajpura',
        'pb.raman',
        'pb.rayya',
        'pb.ropar',
        'pb.samana',
        'pb.sanaur',
        'pb.sangrur',
        'pb.sardulgarh',
        'pb.sirhind',
        'pb.talwandibhai',
        'pb.testing',
        'pb.urmartanda'
        'pb.zira'
    ]
    
    # Processing options - optimized batches for stable processing
    ENABLE_ENRICHMENT = True    # Keep disabled for performance with large datasets
    BATCH_SIZE = 5000             # 5000 records per API call
    TOTAL_LIMIT = None          # No limit - process all data
    FROM_DATE = 1743465600000          # Not used in plain search API
    TO_DATE = 1774915200000            # Not used in plain search API
    
    # Performance tuning for stable processing
    ELASTICSEARCH_CHUNK_SIZE = 2000     # 50 documents per ES bulk request
    PROCESS_BATCH_SIZE = 1000           # Process 1000 properties at once in memory
    
    # =============================================================================
    # EXECUTION
    # =============================================================================
    
    logger.info("=" * 80)
    logger.info("PROPERTY INDEXER - PLAIN SEARCH API TO ELASTICSEARCH")
    logger.info("=" * 80)
    logger.info("Configuration:")
    logger.info(f"  • Property Service: {config['property_service_url']}")
    logger.info(f"  • Elasticsearch: {config['elasticsearch_url']}")
    logger.info(f"  • Tenant IDs: {tenant_ids}")
    logger.info(f"  • External API Enrichment: {'ENABLED' if ENABLE_ENRICHMENT else 'DISABLED'}")
    logger.info(f"  • API Batch Size: {BATCH_SIZE}")
    logger.info(f"  • ES Chunk Size: {ELASTICSEARCH_CHUNK_SIZE}")
    logger.info(f"  • Process Batch Size: {PROCESS_BATCH_SIZE}")
    logger.info(f"  • Total Limit: {TOTAL_LIMIT if TOTAL_LIMIT else 'ALL'}")
    logger.info("=" * 80)
    
    # Create indexer and run
    try:
        indexer = PropertyIndexerAPI(config)
        indexer.run_indexing(
            tenant_ids=tenant_ids,
            enable_enrichment=ENABLE_ENRICHMENT,
            batch_size=BATCH_SIZE,
            elasticsearch_chunk_size=ELASTICSEARCH_CHUNK_SIZE,
            process_batch_size=PROCESS_BATCH_SIZE,
            total_limit=TOTAL_LIMIT,
            from_date=FROM_DATE,
            to_date=TO_DATE,
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