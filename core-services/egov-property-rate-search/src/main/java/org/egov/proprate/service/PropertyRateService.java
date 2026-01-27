package org.egov.proprate.service;

import lombok.extern.slf4j.Slf4j;

import org.egov.common.contract.request.RequestInfo;
import org.egov.proprate.repository.PropertyRateRepository;
import org.egov.proprate.web.models.RateSearchRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PropertyRateService {

	@Value("${egov.user.host}")
    private String userHost;

    @Value("${egov.user.search.endpoint}")
    private String userSearchEndpoint;
    private final PropertyRateRepository repository;
    private final RestTemplate restTemplate;
    
    public PropertyRateService(PropertyRateRepository repository, RestTemplate restTemplate) {
        this.repository = repository;
        this.restTemplate = restTemplate;
    }
    public List<Map<String, Object>> searchRates(RateSearchRequest request) {
        log.info("Received search request with criteria: {}", request);
        
        List<Map<String, Object>> results = repository.search(request);
        
        log.info("Search completed. Found {} records.", results != null ? results.size() : 0);
        return results;
    }
    
public List<Map<String, Object>> searchMissingRevenueProperties(String tenantId, String localityCode, Integer limit) {
        
        // LOG 1: Entry Point
        log.info("Entry: searchMissingRevenueProperties. Tenant: {}, Locality: {}, Limit: {}", tenantId, localityCode, limit);

        // 1. Call repository
        List<Map<String, Object>> results = repository.searchMissingRevenueProperties(tenantId, localityCode, limit);

        // LOG 2: DB Result Count
        int dbCount = (results != null) ? results.size() : 0;
        log.info("Repository returned {} records.", dbCount);

        RequestInfo requestInfo = new RequestInfo();
        if (results == null || results.isEmpty()) {
            log.info("No records found in DB. Returning empty list.");
            return Collections.emptyList();
        }

        // 2. Extract all ownerUuids into a list for batch fetching
        Set<String> ownerUuids = results.stream()
                .map(r -> (String) r.get("ownerUuid"))
                .filter(uuid -> uuid != null && !uuid.isEmpty())
                .collect(Collectors.toSet());

        // LOG 3: UUID Extraction
        log.info("Extracted {} unique Owner UUIDs from DB results.", ownerUuids.size());

        // 3. Call User Service (Batch Call)
        // Note: Passing ArrayList because searchUsers expects List, not Set
        Map<String, Map<String, Object>> userMap = searchUsers(new ArrayList<>(ownerUuids), tenantId, requestInfo);

        // LOG 4: User Service Result Count
        log.info("User Service returned details for {} users.", userMap.size());

        // 4. Map results and Enrich with User and Address Data
        List<Map<String, Object>> processedResults = results.stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    String ownerUuid = (String) r.get("ownerUuid");

                    // --- Root Level Fields ---
                    map.put("propertyId", r.get("propertyid"));
                    map.put("tenantId", r.get("tenantid"));
                    map.put("ownerUuid", ownerUuid);
                    
                    map.put("landArea", r.get("landarea"));
                    	map.put("superBuiltUpArea", r.get("superbuiltuparea"));
                    	map.put("propertyType", r.get("propertytype"));
                    	map.put("usageCategory", r.get("usagecategory"));
                    // Requirement: Building Name must be at Root Level
                    map.put("buildingName", r.get("buildingname")); 

                    // --- Nested Address Object ---
                    Map<String, Object> address = new HashMap<>();
                    // Use getOrDefault or simple get() depending on if you want nulls or empty strings
                    address.put("doorNo", r.get("doorno"));
                    address.put("plotNo", r.get("plotno"));
                    // Note: buildingname is explicitly NOT here as it is moved to root
                    address.put("street", r.get("street"));
                    address.put("landmark", r.get("landmark"));
                    address.put("city", r.get("city"));
                    address.put("pincode", r.get("pincode"));
                    address.put("localityCode", r.get("locality")); // Mapped from DB column 'locality'
                    address.put("district", r.get("district"));
                    address.put("state", r.get("state"));
                    address.put("latitude", r.get("latitude"));
                    address.put("longitude", r.get("longitude"));

                    map.put("propertyAddress", address);
                    
                    // --- User Enrichment ---
                    if (userMap.containsKey(ownerUuid)) {
                        Map<String, Object> user = userMap.get(ownerUuid);
                        map.put("ownerName", user.get("name"));
                        map.put("ownerMobile", user.get("mobileNumber"));
                    } else {
                        map.put("ownerName", "NA");
                        map.put("ownerMobile", "NA");
                    }
                    return map;
                })
                .collect(Collectors.toList());

        // LOG 5: Final Exit
        log.info("Exit: Returning {} enriched records.", processedResults.size());
        return processedResults;
    }

    /**
     * Helper method to call the User Service via RestTemplate
     */
    private Map<String, Map<String, Object>> searchUsers(List<String> uuids, String tenantId, RequestInfo requestInfo) {
        if (uuids.isEmpty()) {
            log.info("No UUIDs to fetch. Skipping User Service call.");
            return Collections.emptyMap();
        }

        // Note: Your hardcoded "tenantId=pb" is here. Ensure this is intentional.
        String url = userHost + userSearchEndpoint + "?tenantId=pb";
        
        // LOG 7: URL Check
        log.info("Calling User Service URL: {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("RequestInfo", requestInfo);
        requestBody.put("uuid", uuids);

        // LOG 8: Payload Check (Crucial for debugging bad requests)
        log.info("User Service Request Body {}", requestBody);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            // LOG 9: Response Status
            log.info("User Service Response Status: {}", response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                if(body.get("user") == null) {
                    log.warn("User Service response body does not contain 'user' key: {}", body);
                }

                List<Map<String, Object>> users = (List<Map<String, Object>>) body.get("user");

                if (users != null) {
                    log.info("User Service returned {} user objects.", users.size());
                    
                    return users.stream().collect(Collectors.toMap(
                            u -> (String) u.get("uuid"),
                            u -> u,
                            (existing, replacement) -> existing
                    ));
                }
            } else {
                log.warn("User Service call failed or body is null. Body: {}", response.getBody());
            }
        } catch (Exception e) {
            // LOG 10: Exception details
            log.error("CRITICAL: Error fetching users from User Service: ", e);
        }

        return Collections.emptyMap();
    }


}