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
        self.assessment_service_url = config.get('assessment_service_url', 'http://property-services.egov:8080')
        self.mdms_service_url = config.get('mdms_service_url', 'http://egov-mdms-service.egov:8080')
        self.elasticsearch_url = config.get('elasticsearch_url', 'http://elasticsearch-data-v1.es-cluster.svc.cluster.local:9200/')
        
        # Index configuration
        self.index_name = "property-assessments-test19"
        self.bulk_file = "bulk_properties_api.jsonl"
        
        # Request info template
        self.request_info = {
            "apiId": "org.egov.pt",
            "ver": "1.0",
            "ts": int(time.time() * 1000),
            "action": "search",
            "did": "assessment-indexer-api",
            "key": "assessment-search",
            "msgId": str(uuid.uuid4()),
            "requesterId": "assessment-indexer-api",
            "authToken": config.get('auth_token', ''),
            "userInfo": {
                "id": 1,
                "uuid": "assessment-indexer-api-uuid",
                "type": "EMPLOYEE",
                "tenantId": "pb",
                "roles": [{"name": "Employee", "code": "EMPLOYEE", "tenantId": "pb"}]
            }
        }

        # Thread-safe tenant cache
        self._tenant_cache = {}
        self._tenant_cache_lock = threading.Lock()

    def fetch_assessments_via_api(self, tenant_id: str,from_date:int,to_date:int, limit: int = 1000, offset: int = 0) -> List[Dict]:
        url = f"{self.assessment_service_url}/property-services/assessment/_search"
        payload = {"RequestInfo": self.request_info}
        params = {"tenantId": tenant_id, "limit": limit, "offset": offset}

            # Add date range filters if provided
        if from_date:
            params["fromDate"] = from_date
        if to_date:
            params["toDate"] = to_date

        try:
            logger.info(f"Calling assessment search API: tenant={tenant_id}, from ={from_date}, to ={to_date} , limit={limit}, offset={offset}")
            logger.debug(f"URL: {url}")
            logger.debug(f"Params: {params}")
        
            resp = self.session.post(url, json=payload, params=params, timeout=120)
            resp.raise_for_status()
            data = resp.json()
        
            properties = data.get('Assessments', [])
            logger.info(f"Plain search API returned {len(properties)} properties")
            
            return properties
        except Exception as e:
            logger.error(f"Error fetching assessments: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response text: {e.response.text}")
            return []

    def fetch_all_assessments_via_api(self, tenant_ids: List[str],from_date:int,to_date:int, batch_size: int = 1000, total_limit: int = None) -> List[Dict]:
        """Fetch all assessments from all tenants using plain search API"""
        all_properties = []
        total_fetched = 0
        
        for tenant_id in tenant_ids:
            logger.info(f"Processing tenant: {tenant_id}")
            offset = 0
            
            while True:
                # Check if we've reached the total limit
                if total_limit and total_fetched >= total_limit:
                    logger.info(f"Reached total limit of {total_limit} assessments")
                    break
                
                # Adjust batch size if approaching limit
                current_limit = batch_size
                if total_limit:
                    remaining = total_limit - total_fetched
                    current_limit = min(batch_size, remaining)
                
                properties = self.fetch_assessments_via_api(tenant_id, from_date,to_date,current_limit, offset)
                
                if not properties:
                    logger.info(f"No more assessments found for tenant {tenant_id}")
                    break
                    
                all_properties.extend(properties)
                total_fetched += len(properties)
                
                logger.info(f"Tenant {tenant_id}: Fetched {len(properties)} assessments (Total: {total_fetched:,})")
                
                # Add progress indicator for large datasets
                if total_fetched > 0 and total_fetched % 10000 == 0:
                    logger.info(f"🔄 Progress: {total_fetched:,} assessments processed so far...")
                
                # Break if we got fewer properties than requested (last page) or reached limit
                if len(properties) < current_limit or (total_limit and total_fetched >= total_limit):
                    break
                    
                offset += current_limit
                
            # Break if we've reached the total limit
            if total_limit and total_fetched >= total_limit:
                break
                
        logger.info(f"Total properties fetched via API: {len(all_properties)}")
        return all_properties

    def fetch_property_address(self, property_id: str, tenant_id: str) -> Optional[Dict]:
        """fecthing the property information"""
        if not property_id or not tenant_id:
            return None
        url = f"{self.property_service_url}/property-services/property/_search"

        payload = {"RequestInfo": self.request_info}

        params = {"propertyIds": property_id, "tenantId": tenant_id}

        try:
            resp = self.session.post(url, json=payload, params=params, timeout=10)
            resp.raise_for_status()
            properties = resp.json().get('Properties', [])
            return properties[0].get('address', {}) if properties else None

        except Exception as e:
            logger.warning(f"Error fetching property address: {e}")
            return None

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
        except Exception as e:
            logger.warning(f"Error fetching tenant data for {tenant_id}: {e}")
            return None
    
    # def fetch_tenant_data(self, tenant_id: str) -> Optional[Dict]:
    #     """Fetch tenant information from MDMS"""
    #     url = f"{self.mdms_service_url}/egov-mdms-service/v1/_search"
        
    #     payload = {
    #         "RequestInfo": self.request_info,
    #         "MdmsCriteria": {
    #             "tenantId": "pb",
    #             "moduleDetails": [
    #                 {
    #                     "moduleName": "tenant",
    #                     "masterDetails": [
    #                         {
    #                             "name": "tenants",
    #                             "filter": f"[?(@.code == '{tenant_id}')]"
    #                         }
    #                     ]
    #                 }
    #             ]
    #         }
    #     }
        
    #     try:
    #         response = self.session.post(url, json=payload, timeout=10)
    #         response.raise_for_status()
            
    #         data = response.json()
    #         tenants = data.get('MdmsRes', {}).get('tenant', {}).get('tenants', [])
            
    #         if tenants:
    #             return tenants[0]
                
    #     except Exception as e:
    #         logger.warning(f"Error fetching tenant data for {tenant_id}: {e}")
            
    #     return None

    def enrich_property_parallel(self, property_data: Dict) -> Dict:
        """Enrich a single assessment with external API data using parallel calls:
        - property address/ward: fetch_property_address
        - tenant data: fetch_tenant_data"""
        property_id = property_data.get('propertyId', '')
        tenant_id = property_data.get('tenantId', '')
        
        # Use ThreadPoolExecutor for parallel API calls
        enrichment_data = {
            "property_address": None,
            "tenant_data": None

        }

        
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = {}

            if property_id and tenant_id:
                futures['property_address'] = executor.submit(self.fetch_property_address, property_id, tenant_id)
            
            if tenant_id:
                    futures['tenant_data'] = executor.submit(self.fetch_tenant_data, tenant_id)

            for future_name, future in futures.items():
                try:
                    result = future.result(timeout=10)  # 10 seconds per API call
                    enrichment_data[future_name] = result
                except Exception as e:
                    logger.warning(f"Error in {future_name} enrichment: {e}")

        return enrichment_data

    def transform_assessment_to_index_format(self, property_data: Dict) -> Dict:
        enrichment = property_data.get('_enrichment', {})
        created_time_epoch = property_data.get("auditDetails", {}).get("createdTime", int(time.time() * 1000))
        # Convert epoch (milliseconds) to ISO date string
        created_time_iso = datetime.utcfromtimestamp(created_time_epoch / 1000).isoformat() + "Z"
        doc = {
            "_index": self.index_name,
            "_id": f"{property_data.get('assessmentNumber','')}{property_data.get('tenantId','')}",
            "_source": {
                "Data": {
                    "id": property_data.get("id", ""),
                    "tenantId": property_data.get("tenantId", ""),
                    "additionalDetails": property_data.get("additionalDetails", ""),
                    "assessmentNumber": property_data.get("assessmentNumber", ""),
                    "financialYear": property_data.get("financialYear", ""),
                    "propertyId": property_data.get("propertyId", ""),
                    "assessmentDate": property_data.get("assessmentDate", ""),
                    "status": property_data.get("status", ""),
                    "source": property_data.get("source", ""),
                    "unitUsageList": property_data.get("unitUsageList", {}),
                    "channel": property_data.get("channel", ""),
                    "auditDetails": property_data.get("auditDetails", {}),
                    "@timestamp": created_time_iso,
                    "ward": enrichment.get('property_address', {}),
                    "tenantData": enrichment.get('tenant_data', {})
                }
            }
        }
        return doc

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

    def run_indexing(self, tenant_ids: List[str], from_date:int,to_date:int, enable_enrichment: bool = True, batch_size: int = 1000, total_limit: int = None, elastricsearch_chunk_size: int = 500, process_batch_size: int = 100):
        """Main method to run the property indexing process"""
        logger.info("Starting assessment indexing process using Plain Search API...")
        start_time = time.time()
        
        try:
            # Step 1: Fetch all assessment data
            logger.info("Step 1: Fetching assessment using Plain Search API...")
            properties = self.fetch_all_assessments_via_api(tenant_ids, from_date, to_date, batch_size, total_limit)
            
            if not properties:
                logger.warning("No assessment found to index")
                return
            
            # Step 2: Transform and enrich in parallel
            logger.info("Step 2: Transforming and enriching assessment data...")
            documents = []
            
            # Process assessment in batches for better memory management
            process_batch_size =  process_batch_size  # Process 50 at a time for better efficiency
            for batch_start in range(0, len(properties), process_batch_size):
                batch_end = min(batch_start + process_batch_size, len(properties))
                batch_properties = properties[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//process_batch_size + 1}/{(len(properties) + process_batch_size - 1)//process_batch_size} "
                           f"({batch_start + 1}-{batch_end}/{len(properties)} assessment)...")
                
                # Run enrichment in parallel for 10 properties at a time
                if enable_enrichment:

                    with ThreadPoolExecutor(max_workers=10) as executor:
                        future_to_property = {executor.submit(self.enrich_property_parallel, property_data): property_data for property_data in batch_properties}
                        for future in as_completed(future_to_property):
                            property_data = future_to_property[future]
                            try:
                                enrichment = future.result()
                                property_data['_enrichment'] = enrichment
                                document = self.transform_assessment_to_index_format(property_data)
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
            self.upload_to_elasticsearch(self.bulk_file, chunk_size=elastricsearch_chunk_size)
            
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
        'assessment_service_url': 'http://property-services.egov:8080',
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
        'pb.anandpursahib',
        'pb.adampur',
        'pb.ahmedgarh',
        'pb.ajnala',
        'pb.alawalpur',
        'pb.amargarh',
        'pb.amloh',
        'pb.amritsar',
        'pb.arniwala',
        'pb.badhnikalan',
        'pb.baghapurana',
        'pb.balachaur',
        'pb.banga',
        'pb.banur',
        'pb.bareta',
        'pb.bariwala',
        'pb.barnala',
        'pb.bassipathana',
        'pb.batala',
        'pb.begowal',
        'pb.bhadaur',
        'pb.bhadson',
        'pb.bhagtabhai',
        'pb.bhairoopa',
        'pb.bhawanigarh',
        'pb.bhikhi',
        'pb.bhikhiwind',
        'pb.bhogpur',
        'pb.bhuchomandi',
        'pb.bhulath',
        'pb.bilga',
        'pb.boha',
        'pb.budhlada',
        'pb.chamkaursahib',
        'pb.cheema',
        'pb.dasuya',
        'pb.derababananak',
        'pb.derabassi',
        'pb.dhanaula',
        'pb.dharamkot',
        'pb.dhariwal',
        'pb.dhilwan',
        'pb.dhuri',
        'pb.dinanagar',
        'pb.dirba',
        'pb.doraha',
        'pb.faridkot',
        'pb.fatehgarhchurian',
        'pb.fazilka',
        'pb.ferozepur',
        'pb.garhdiwala',
        'pb.garhshankar',
        'pb.ghagga',
        'pb.ghanaur',
        'pb.gidderbaha',
        'pb.goniana',
        'pb.goraya',
        'pb.gurdaspur',
        'pb.guruharsahai',
        'pb.handiaya',
        'pb.hariana',
        'pb.hoshiarpur',
        'pb.jagraon',
        'pb.jaitu',
        'pb.jalalabad',
        'pb.jalandhar',
        'pb.jandialaguru',
        'pb.kapurthala',
        'pb.kartarpur',
        'pb.khamano',
        'pb.khanauri',
        'pb.khanna',
        'pb.kharar',
        'pb.khemkaran',
        'pb.kiratpur',
        'pb.kotfatta',
        'pb.kothaguru',
        'pb.kotissekhan',
        'pb.kotkapura',
        'pb.kurali',
        'pb.lalru',
        'pb.lehragaga',
        'pb.lehramohabbat',
        'pb.lohiankhas',
        'pb.longowal',
        'pb.machhiwara',
        'pb.mahilpur',
        'pb.majitha',
        'pb.makhu',
        'pb.malerkotla',
        'pb.mallanwala',
        'pb.maloud',
        'pb.malout',
        'pb.maluka',
        'pb.mamdot',
        'pb.mandigobindgarh',
        'pb.mansa',
        'pb.maur',
        'pb.mehatpur',
        'pb.mehraj',
        'pb.moga',
        'pb.mohali',
        'pb.moonak',
        'pb.morinda',
        'pb.mudki',
        'pb.mukerian',
        'pb.muktsar',
        'pb.mullanpur',
        'pb.nabha',
        'pb.nadala',
        'pb.nakodar',
        'pb.nangal',
        'pb.nathana',
        'pb.nawanshahr',
        'pb.nayagaon',
        'pb.nihalsinghwala',
        'pb.nurmahal',
        'pb.pathankot',
        'pb.patiala',
        'pb.patran',
        'pb.patti',
        'pb.payal',
        'pb.phagwara',
        'pb.phillaur',
        'pb.quadian',
        'pb.rahon',
        'pb.raikot',
        'pb.rajasansi',
        'pb.rajpura',
        'pb.raman',
        'pb.ramdass',
        'pb.rampuraphul',
        'pb.rayya',
        'pb.ropar',
        'pb.sahnewal',
        'pb.samana',
        'pb.samrala',
        'pb.sanaur',
        'pb.sangatmandi',
        'pb.sangrur',
        'pb.sardulgarh',
        'pb.shahkot',
        'pb.shamchurasi',
        'pb.sirhind',
        'pb.srihargobindpur',
        'pb.sujanpur',
        'pb.sultanpurlodhi',
        'pb.sunam',
        'pb.talwandibhai',
        'pb.talwandisabo',
        'pb.talwara',
        'pb.tapa',
        'pb.tarntaran',
        'pb.testing',
        'pb.urmartanda',
        'pb.zira',
        'pb.zirakpur',
        'pb.narotjaimalsingh',
        'pb.fatehgarhpanjtoor'
    ]
    
    # Processing options - optimized batches for stable processing
    ENABLE_ENRICHMENT = True    # Keep disabled for performance with large datasets
    BATCH_SIZE = 5000             # max. 5000 records per API call
    TOTAL_LIMIT = None          # No limit - process all data
    FROM_DATE = 1711929600000          # Not used in plain search API
    TO_DATE = 1758153600000            # Not used in plain search API
    
    # Performance tuning for stable processing
    ELASTICSEARCH_CHUNK_SIZE = 2000     # max. 2000 documents per ES bulk request
    PROCESS_BATCH_SIZE = 2000           # max. process 2000 properties at once in memory
    
    # =============================================================================
    # EXECUTION
    # =============================================================================
    
    logger.info("=" * 80)
    logger.info("assessment INDEXER - PLAIN SEARCH API TO ELASTICSEARCH")
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
            total_limit=TOTAL_LIMIT,
            from_date=FROM_DATE,
            to_date=TO_DATE,
            elastricsearch_chunk_size=ELASTICSEARCH_CHUNK_SIZE,
            process_batch_size=PROCESS_BATCH_SIZE
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