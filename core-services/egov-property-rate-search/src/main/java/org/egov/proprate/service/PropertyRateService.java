package org.egov.proprate.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.proprate.producer.PropertyRateProducer;
import org.egov.proprate.repository.PropertyRateRepository;
import org.egov.proprate.repository.propertyvalidator.PropertyRateValidator;
import org.egov.proprate.web.models.AddPropertyRate;
import org.egov.proprate.web.models.PropertyRateRequest;
import org.egov.proprate.web.models.RateSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PropertyRateService {

    @Value("${property.rate.create.topic}")
    private String createTopic;

    @Value("${property.rate.update.topic}")
    private String updateTopic;

    @Value("${egov.user.host}")
    private String userHost;

    @Value("${egov.user.search.endpoint}")
    private String userSearchEndpoint;

    private final PropertyRateRepository repository;
    private final RestTemplate restTemplate;
    private final PropertyRateValidator validator;
    private final PropertyRateProducer producer;

    @Autowired
    public PropertyRateService(PropertyRateRepository repository,
                               RestTemplate restTemplate,
                               PropertyRateValidator validator,
                               PropertyRateProducer producer) {
        this.repository = repository;
        this.restTemplate = restTemplate;
        this.validator = validator;
        this.producer = producer;
    }

    /**
     * Searches for existing property rates based on criteria.
     */
    public List<Map<String, Object>> searchRates(RateSearchRequest request) {
        log.info("Received search request: {}", request);
        return repository.search(request);
    }

    /**
     * Creates new property rates. Generates UUIDs and sets initial AuditDetails.
     */
    public List<AddPropertyRate> create(PropertyRateRequest request) {
        validator.validateCreateRequest(request);
        
        enrichCreate(request);

        log.info("Pushing to Create Topic: {}", createTopic);
        producer.push(createTopic, request);
        
        return request.getPropertyRates();
    }

    /**
     * Updates existing property rates. Validates existence and updates AuditDetails.
     */
    public List<AddPropertyRate> update(PropertyRateRequest request) {
        // 1. Validate that the records exist in the system
        validator.validateUpdateRequest(request);

        // 2. Enrich only update-specific fields (LastModified)
        enrichUpdate(request);

        // 3. Push to Kafka for the Persister to handle the DB update
        log.info("Pushing to Update Topic: {}", updateTopic);
        producer.push(updateTopic, request);

        return request.getPropertyRates();
    }

    /**
     * Logic for missing revenue properties (Search and User Enrichment)
     */
    public List<Map<String, Object>> searchMissingRevenueProperties(String tenantId, String localityCode, Integer limit, Boolean isMissing, String propertyid) {
        // 1. Fetch raw data from the repository
        List<Map<String, Object>> results = repository.searchMissingRevenueProperties(tenantId, localityCode, limit, isMissing, propertyid);

        if (results == null || results.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Extract all unique Owner UUIDs to make a bulk call to the User Service
        Set<String> allOwnerUuids = new HashSet<>();
        for (Map<String, Object> row : results) {
            // Handle both potential case sensitivities from DB results
            String ownerCsv = (String) (row.containsKey("ownerUuid") ? row.get("ownerUuid") : row.get("owneruuid"));
            if (ownerCsv != null && !ownerCsv.isEmpty()) {
                for (String uuid : ownerCsv.split(",")) {
                    allOwnerUuids.add(uuid.trim());
                }
            }
        }

        // 3. Fetch User details (Name, Guardian Name, etc.) based on UUIDs
        // The searchUsers method returns Map<UUID, Map<UserAttributes, Values>>
        Map<String, Map<String, Object>> userMap = searchUsers(new ArrayList<>(allOwnerUuids), tenantId, new RequestInfo());

        // 4. Enrich the Result Set and Structure into Objects
        return results.stream().map(r -> {
            // Create a fresh map to avoid modifying the read-only repository map
            Map<String, Object> enrichedMap = new HashMap<>(r);
            
            // Extract CSV strings from the row
            String ownerCsv = (String) (r.containsKey("ownerUuid") ? r.get("ownerUuid") : r.get("owneruuid"));
            String percentCsv = (String) (r.containsKey("ownerPercentages") ? r.get("ownerPercentages") : r.get("ownerpercentages"));

            List<Map<String, Object>> ownersList = new ArrayList<>();

            if (ownerCsv != null && !ownerCsv.isEmpty()) {
                String[] uuids = ownerCsv.split(",");
                String[] percents = (percentCsv != null) ? percentCsv.split(",") : new String[0];

                for (int i = 0; i < uuids.length; i++) {
                    String trimmedUuid = uuids[i].trim();
                    Map<String, Object> ownerDetail = new HashMap<>();
                    
                    ownerDetail.put("ownerUuid", trimmedUuid);
                    
                    // DATA ENRICHMENT FROM USER-MAP
                    if (userMap != null && userMap.containsKey(trimmedUuid)) {
                        Map<String, Object> user = userMap.get(trimmedUuid);
                        
                        ownerDetail.put("name", user.getOrDefault("name", "NA"));
                        ownerDetail.put("mobileNumber", user.getOrDefault("mobileNumber", "NA"));
                        ownerDetail.put("gender", user.getOrDefault("gender", "NA"));
                        
                        // Fields specifically requested from your log data
                        ownerDetail.put("guardianName", user.getOrDefault("fatherOrHusbandName", "NA"));
                        ownerDetail.put("relationship", user.getOrDefault("relationship", "NA"));
                    } else {
                        // Fallback if user service doesn't return the UUID
                        ownerDetail.put("name", "NA");
                        ownerDetail.put("mobileNumber", "NA");
                        ownerDetail.put("guardianName", "NA");
                        ownerDetail.put("relationship", "NA");
                        ownerDetail.put("gender", "NA");
                    }

                    // Handle ownership percentage logic
                    if (i < percents.length) {
                        ownerDetail.put("percentage", percents[i].trim());
                    } else {
                        ownerDetail.put("percentage", "0");
                    }

                    ownersList.add(ownerDetail);
                }
            }

            // 5. CLEANUP: Remove raw CSV strings to keep the API response clean
            enrichedMap.remove("owneruuid");        
            enrichedMap.remove("ownerUuid");        
            enrichedMap.remove("ownerpercentages");
            enrichedMap.remove("ownerPercentages");
            
            // 6. Final Structured Output
            enrichedMap.put("owners", ownersList);

            return enrichedMap;
        }).collect(Collectors.toList());
    }
    
    
    
    // --- Helper Methods ---

    private void enrichCreate(PropertyRateRequest request) {
        String userId = getUserId(request.getRequestInfo());
        long time = System.currentTimeMillis();

        request.getPropertyRates().forEach(rate -> {
            rate.setId(UUID.randomUUID());
            rate.setCreatedBy(userId);
            rate.setCreatedTime(time);
            rate.setIsVerified(false);

                    });
    }

    private void enrichUpdate(PropertyRateRequest request) {
        String userId = getUserId(request.getRequestInfo());
        long time = System.currentTimeMillis();
        request.getPropertyRates().forEach(rate -> {
            rate.setLastModifiedBy(userId);
            rate.setLastModifiedTime(time);
            rate.setIsVerified(true);
            // Note: We do NOT overwrite createdBy/createdTime during update
        });
    }

    private String getUserId(RequestInfo requestInfo) {
        if (requestInfo != null && requestInfo.getUserInfo() != null) {
            return requestInfo.getUserInfo().getUuid();
        }
        return "SYSTEM";
    }

    private Map<String, Map<String, Object>> searchUsers(List<String> uuids, String tenantId, RequestInfo requestInfo) {
        if (uuids.isEmpty()) return Collections.emptyMap();
        
        String url = userHost + userSearchEndpoint;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("RequestInfo", requestInfo);
        requestBody.put("uuid", uuids);
        requestBody.put("tenantId", tenantId.split("\\.")[0]); // Get base tenant if needed

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> users = (List<Map<String, Object>>) response.getBody().get("user");
                if (users != null) {
                    return users.stream().collect(Collectors.toMap(u -> (String) u.get("uuid"), u -> u, (a, b) -> a));
                }
            }
        } catch (Exception e) {
            log.error("Error fetching user details from User Service", e);
        }
        return Collections.emptyMap();
    }
}