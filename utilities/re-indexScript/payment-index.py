import requests
import json
import time
import logging
from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional,Set
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
        self.payment_service_url = config.get('payment_service_url', 'http://collection-services.egov:8080')
        self.boundary_service_url = config.get('boundary_service_url','http://egov-location.egov:8080')
        self.mdms_service_url = config.get('mdms_service_url', 'http://egov-mdms-service.egov:8080')
        self.elasticsearch_url = config.get('elasticsearch_url', 'http://elasticsearch-data-v1.es-cluster.svc.cluster.local:9200/')
        
        # Index configuration
        self.index_name = "paymentsindex-v1"
        self.bulk_file = "bulk_payment_api.jsonl"
        
        # Request info template
        self.request_info = {
            "apiId": "org.egov.pt",
            "ver": "1.0",
            "ts": int(time.time() * 1000),
            "action": "search",
            "did": "paymentsindex-v1",
            "key": "payment-search",
            "msgId": str(uuid.uuid4()),
            "requesterId": "aymentsindex-v1",
            "authToken": config.get('auth_token', ''),
            "userInfo": {
                "id": 1,
                "uuid": "aymentsindex-v1-api-uuid",
                "type": "EMPLOYEE",
                "tenantId": "pb",
                "roles": [{"name": "Employee", "code": "EMPLOYEE", "tenantId": "pb"}]
            }
        }

        # Thread-safe tenant cache
        self._tenant_cache = {}
        self._tenant_cache_lock = threading.Lock()

        # Thread-safe boundary cache
        self._boundary_cache = {}
        self._boundary_cache_lock = threading.Lock()

    def fetch_payments_via_api(self,tenant_id: str,fromDate: Optional[int] = None,toDate: Optional[int] = None,businessServices: Optional[Set[str]] = None,limit: int = 1000,offset: int = 0) -> List[Dict]:
        url = f"{self.payment_service_url}/collection-services/payments/_plainsearch"
        payload = {"RequestInfo": self.request_info}
        params = {
        "tenantId": tenant_id,
        "limit": limit,
        "offset": offset
        }
        if fromDate is not None:
            params["fromDate"] = fromDate
        if toDate is not None:
            params["toDate"] = toDate
        if businessServices:
            params["businessServices"] = list(businessServices)


        try:
            logger.info(f"Calling payment search API: tenant={tenant_id}, fromDate={fromDate},toDate={toDate},businessServices={businessServices}, limit={limit}, offset={offset}")
            logger.debug(f"URL: {url}")
            logger.debug(f"Params: {params}")
        
            resp = self.session.post(url, json=payload, params=params, timeout=120)
            resp.raise_for_status()
            data = resp.json()
        
            properties = data.get('Payments', [])
            logger.info(f"Plain search API returned {len(properties)} properties")
            
            return properties
        except Exception as e:
            logger.error(f"Error fetching payments: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response text: {e.response.text}")
            return []

    def fetch_all_payments_via_api(self, tenant_ids: List[str],fromDate: Optional[int] = None,toDate: Optional[int] = None,businessServices: Optional[Set[str]] = None, batch_size: int = 1000, total_limit: int = None) -> List[Dict]:
        """Fetch all payments from all tenants using plain search API"""
        all_properties = []
        total_fetched = 0
        
        for tenant_id in tenant_ids:
            logger.info(f"Processing tenant: {tenant_id}")
            offset = 0
            
            while True:
                # Check if we've reached the total limit
                if total_limit and total_fetched >= total_limit:
                    logger.info(f"Reached total limit of {total_limit} payments")
                    break
                
                # Adjust batch size if approaching limit
                current_limit = batch_size
                if total_limit:
                    remaining = total_limit - total_fetched
                    current_limit = min(batch_size, remaining)
                
                properties = self.fetch_payments_via_api(
                    tenant_id=tenant_id,
                    fromDate=fromDate,
                    toDate=toDate,
                    businessServices=businessServices,
                    limit=current_limit,
                    offset=offset
                )
                if not properties:
                    logger.info(f"No more payments found for tenant {tenant_id}")
                    break
                    
                all_properties.extend(properties)
                total_fetched += len(properties)
                
                logger.info(f"Tenant {tenant_id}: Fetched {len(properties)} payments (Total: {total_fetched:,})")
                
                # Add progress indicator for large datasets
                if total_fetched > 0 and total_fetched % 10000 == 0:
                    logger.info(f"🔄 Progress: {total_fetched:,} payments processed so far...")
                
                # Break if we got fewer properties than requested (last page) or reached limit
                if len(properties) < current_limit or (total_limit and total_fetched >= total_limit):
                    break
                    
                offset += current_limit
                
            # Break if we've reached the total limit
            if total_limit and total_fetched >= total_limit:
                break
                
        logger.info(f"Total properties fetched via API: {len(all_properties)}")
        return all_properties

    def fetch_boundary_data(self, tenant_id: str) -> Optional[Dict]:
        """Fetch boundary/ward information from location service"""

        """Fetch boundary/ward information from location service, but only once per tenant_id (thread-safe)"""
        with self._boundary_cache_lock:
            if tenant_id in self._boundary_cache:
                return self._boundary_cache[tenant_id]
        # Not cached: fetch from API
            
        url = f"{self.boundary_service_url}/egov-location/location/v11/boundarys/_search"
        payload = {
            "RequestInfo": self.request_info
        }
        
        params = {
            "hierarchyTypeCode": "REVENUE",
            "boundaryType": "Block",
            "tenantId": tenant_id
        }
        
        try:
            response = self.session.post(url, json=payload, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            tenant_boundary = data.get('TenantBoundary', [])
                        
            result = tenant_boundary[0]['boundary'][0] if tenant_boundary and tenant_boundary[0].get('boundary') else None
            with self._boundary_cache_lock:
                self._boundary_cache[tenant_id] = result
            return result
                
        except Exception as e:
            logger.warning(f"Error fetching boundary data for : {e}")
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

    def enrich_property_parallel(self, property_data: Dict) -> Dict:
        """Enrich a single payment with external API data using parallel calls:
        - property address/ward: fetch_property_address
        - tenant data: fetch_tenant_data
        - locality_code is optional
        """
        # locality_code = property_data.get('address', {}).get('locality', {}).get('code', None)
        tenant_id = property_data.get('tenantId', '')
        
        # Use ThreadPoolExecutor for parallel API calls
        enrichment_data = {
            'ward_data': None,
            "tenant_data": None

        }
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = {}
            futures['ward_data'] = executor.submit(self.fetch_boundary_data,tenant_id)

            if tenant_id:
                futures['tenant_data'] = executor.submit(self.fetch_tenant_data, tenant_id)

            for future_name, future in futures.items():
                try:
                    result = future.result(timeout=10)  # 10 seconds per API call
                    enrichment_data[future_name] = result
                except Exception as e:
                    logger.warning(f"Error in {future_name} enrichment: {e}")

        return enrichment_data

    def transform_payment_to_index_format(self, payment_data: Dict) -> Dict:
        enrichment = payment_data.get('_enrichment', {})
        audit_details = payment_data.get("auditDetails", {})
        payer = {
            "id": payment_data.get("payerId", ""),
            "name": payment_data.get("payerName", "")
        }

        doc = {
            "_index": self.index_name,
            "_id": payment_data.get("id", ""),
            "_source": {
                "Data": {
                    "tenantId": payment_data.get("tenantId", ""),
                    "id": payment_data.get("id", ""),
                    "transactionNumber": payment_data.get("transactionNumber", ""),
                    "transactionDate": payment_data.get("transactionDate", 1),
                    "paymentMode": payment_data.get("paymentMode", ""),
                    "paymentStatus": payment_data.get("paymentStatus", ""),
                    "payer": payer,
                    "paidBy": payment_data.get("paidBy", ""),
                    "paymentDetails": payment_data.get("paymentDetails", {}),
                    "auditDetails": audit_details,
                    "additionalDetails": payment_data.get("additionalDetails", {}),
                    "tenantData": enrichment.get("tenant_data", {}),
                    "@timestamp": audit_details.get("createdTime", int(time.time()*1000)),
                    "ward": enrichment.get("ward_data", {})
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

    def trigger_dashboard_ingest(self):
        """Trigger dashboard-ingest API after successful Elasticsearch upload"""
        url = "http://collection-services:8080/dashboard-ingest/ingest/migrate/paymentsindex-v1/v1"

        payload = {
            "RequestInfo": {
                "apiId": "string",
                "ver": "string",
                "ts": None,
                "action": "string",
                "did": "string",
                "key": "string",
                "msgId": "string",
                "authToken": "b843ef27-1ac6-49b8-ab71-cd0c22f4e50e",
                "userInfo": {
                    "id": 23299,
                    "uuid": "e721639b-c095-40b3-86e2-acecb2cb6efb",
                    "userName": "9337682030",
                    "name": "Abhilash Seth",
                    "type": "CITIZEN",
                    "mobileNumber": "9337682030",
                    "emailId": "abhilash.seth@gmail.com",
                    "roles": [
                        {
                            "id": 281,
                            "name": "Citizen"
                        }
                    ]
                }
            }
        }

        headers = {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json"
        }

        try:
            logger.info("Triggering dashboard-ingest API for paymentsindex-v1...")
            response = self.session.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            logger.info(f"Dashboard ingest triggered successfully: {response.status_code}")
            logger.debug(f"Response: {response.text}")
        except Exception as e:
            logger.error(f"Error triggering dashboard-ingest API: {e}")
            if hasattr(e, "response") and e.response is not None:
                logger.error(f"Response: {e.response.text}")



    def run_indexing(self, tenant_ids: List[str],fromDate: Optional[int] = None,toDate: Optional[int] = None,businessServices: Optional[Set[str]] = None,enable_enrichment: bool = True, batch_size: int = 1000, total_limit: int = None, elastricsearch_chunk_size: int = 500, process_batch_size: int = 100):
        """Main method to run the property indexing process"""
        logger.info("Starting payment indexing process using Plain Search API...")
        start_time = time.time()
        
        try:
            # Step 1: Fetch all payment data
            logger.info("Step 1: Fetching payment using Plain Search API...")
            properties = self.fetch_all_payments_via_api(tenant_ids,fromDate,toDate,businessServices, batch_size, total_limit)
            
            if not properties:
                logger.warning("No payment found to index")
                return
            
            # Step 2: Transform and enrich in parallel
            logger.info("Step 2: Transforming and enriching payment data...")
            documents = []
            
            # Process payment in batches for better memory management
            process_batch_size = process_batch_size   # Process 50 at a time for better efficiency
            for batch_start in range(0, len(properties), process_batch_size):
                batch_end = min(batch_start + process_batch_size, len(properties))
                batch_properties = properties[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//process_batch_size + 1}/{(len(properties) + process_batch_size - 1)//process_batch_size} "
                           f"({batch_start + 1}-{batch_end}/{len(properties)} payment)...")
                
                # Run enrichment in parallel for 10 properties at a time
                if enable_enrichment:

                    with ThreadPoolExecutor(max_workers=10) as executor:
                        future_to_property = {executor.submit(self.enrich_property_parallel, property_data): property_data for property_data in batch_properties}
                        for future in as_completed(future_to_property):
                            property_data = future_to_property[future]
                            try:
                                enrichment = future.result()
                                property_data['_enrichment'] = enrichment
                                document = self.transform_payment_to_index_format(property_data)
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

            # # Step 5: Trigger dashboard-ingest API
            # logger.info("Step 5: Triggering dashboard-ingest API...")
            # self.trigger_dashboard_ingest()
            
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
        
        # External Service URLs (for enrichment)
        'boundary_service_url': 'http://egov-location.egov:8080',
        'payment_service_url': 'http://collection-services.egov:8080',
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
        'pb.adampur',
        'pb.adampur',
        'pb.amritsar',
        'pb.patiala',
        'pb.testing'
    ]

    # Processing options - optimized batches for stable processing
    ENABLE_ENRICHMENT = True    # Keep disabled for performance with large datasets
    BATCH_SIZE = 5000             # max. 5000 records per API call
    TOTAL_LIMIT = None          # No limit - process all data
    FROM_DATE = 1743465600000          # Not used in plain search API
    TO_DATE = 1774915200000            # Not used in plain search API
    
    # Performance tuning for stable processing
    ELASTICSEARCH_CHUNK_SIZE = 2000     # max. 2000 documents per ES bulk request
    PROCESS_BATCH_SIZE = 2000           # max. process 2000 properties at once in memory
    BUSINESS_SERVICES = {'PT'}  # Filter by business services if needed
    
    # =============================================================================
    # EXECUTION
    # =============================================================================
    
    logger.info("=" * 80)
    logger.info("payment INDEXER - PLAIN SEARCH API TO ELASTICSEARCH")
    logger.info("=" * 80)
    logger.info("Configuration:")
    logger.info(f"  • Payment Service: {config['payment_service_url']}")
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
            fromDate=FROM_DATE,
            toDate=TO_DATE,
            elastricsearch_chunk_size=ELASTICSEARCH_CHUNK_SIZE,
            process_batch_size=PROCESS_BATCH_SIZE,
            businessServices=BUSINESS_SERVICES
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