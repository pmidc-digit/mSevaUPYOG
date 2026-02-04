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
        log.info("Searching missing properties for Tenant: {}, Locality: {}", tenantId, localityCode);
        List<Map<String, Object>> results = repository.searchMissingRevenueProperties(tenantId, localityCode, limit,isMissing, propertyid);

        if (results == null || results.isEmpty()) return Collections.emptyList();

        Set<String> ownerUuids = results.stream()
                .map(r -> (String) r.get("ownerUuid"))
                .filter(uuid -> uuid != null && !uuid.isEmpty())
                .collect(Collectors.toSet());

        Map<String, Map<String, Object>> userMap = searchUsers(new ArrayList<>(ownerUuids), tenantId, new RequestInfo());

        return results.stream().map(r -> {
            Map<String, Object> map = new HashMap<>(r); // Using existing fields from DB result
            String ownerUuid = (String) r.get("ownerUuid");
            
            // Enrich with User Service data
            if (userMap.containsKey(ownerUuid)) {
                Map<String, Object> user = userMap.get(ownerUuid);
                map.put("ownerName", user.get("name"));
                map.put("ownerMobile", user.get("mobileNumber"));
            } else {
                map.put("ownerName", "NA");
                map.put("ownerMobile", "NA");
            }
            return map;
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
            rate.setLastModifiedBy(userId);
            rate.setLastModifiedTime(time);
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