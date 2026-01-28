package org.egov.proprate.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.proprate.repository.PropertyRateRepository;
// Make sure this import matches your actual Validator package path
import org.egov.proprate.repository.propertyvalidator.PropertyRateValidator;
import org.egov.proprate.web.models.AddPropertyRate;
import org.egov.proprate.web.models.PropertyRateRequest;
import org.egov.proprate.web.models.RateSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.egov.proprate.producer.PropertyRateProducer; // Import the producer
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PropertyRateService {
	
	@Value("${property.rate.create.topic}")
    private String createTopic;

    @Value("${egov.user.host}")
    private String userHost;

    @Value("${egov.user.search.endpoint}")
    private String userSearchEndpoint;

    private final PropertyRateRepository repository;
    private final RestTemplate restTemplate;
    private final PropertyRateValidator validator;
    private final PropertyRateProducer producer; // 2. Add Producer field

    @Autowired
    public PropertyRateService(PropertyRateRepository repository, 
                               RestTemplate restTemplate,
                               PropertyRateValidator validator,
                               PropertyRateProducer producer) { // 3. Add to Constructor
        this.repository = repository;
        this.restTemplate = restTemplate;
        this.validator = validator;
        this.producer = producer;
    }

    public List<Map<String, Object>> searchRates(RateSearchRequest request) {
        log.info("Received search request with criteria: {}", request);
        List<Map<String, Object>> results = repository.search(request);
        log.info("Search completed. Found {} records.", results != null ? results.size() : 0);
        return results;
    }

    public List<Map<String, Object>> searchMissingRevenueProperties(String tenantId, String localityCode, Integer limit) {
        // ... (Your existing search logic remains unchanged) ...
        // Keeping it concise for this answer, assuming you copy your existing logic here.
        log.info("Entry: searchMissingRevenueProperties. Tenant: {}, Locality: {}, Limit: {}", tenantId, localityCode, limit);
        List<Map<String, Object>> results = repository.searchMissingRevenueProperties(tenantId, localityCode, limit);
        
        if (results == null || results.isEmpty()) return Collections.emptyList();

        Set<String> ownerUuids = results.stream()
                .map(r -> (String) r.get("ownerUuid"))
                .filter(uuid -> uuid != null && !uuid.isEmpty())
                .collect(Collectors.toSet());

        Map<String, Map<String, Object>> userMap = searchUsers(new ArrayList<>(ownerUuids), tenantId, new RequestInfo());

        return results.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            String ownerUuid = (String) r.get("ownerUuid");
            map.put("propertyId", r.get("propertyid"));
            map.put("tenantId", r.get("tenantid"));
            map.put("ownerUuid", ownerUuid);
            map.put("landArea", r.get("landarea"));
            map.put("superBuiltUpArea", r.get("superbuiltuparea"));
            map.put("propertyType", r.get("propertytype"));
            map.put("usageCategory", r.get("usagecategory"));
            map.put("buildingName", r.get("buildingname"));

            Map<String, Object> address = new HashMap<>();
            address.put("doorNo", r.get("doorno"));
            address.put("plotNo", r.get("plotno"));
            address.put("street", r.get("street"));
            address.put("landmark", r.get("landmark"));
            address.put("city", r.get("city"));
            address.put("pincode", r.get("pincode"));
            address.put("localityCode", r.get("locality"));
            address.put("district", r.get("district"));
            address.put("state", r.get("state"));
            address.put("latitude", r.get("latitude"));
            address.put("longitude", r.get("longitude"));
            map.put("propertyAddress", address);

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

    private Map<String, Map<String, Object>> searchUsers(List<String> uuids, String tenantId, RequestInfo requestInfo) {
        if (uuids.isEmpty()) return Collections.emptyMap();
        String url = userHost + userSearchEndpoint + "?tenantId=pb"; // check tenant logic
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("RequestInfo", requestInfo);
        requestBody.put("uuid", uuids);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> users = (List<Map<String, Object>>) response.getBody().get("user");
                if (users != null) {
                    return users.stream().collect(Collectors.toMap(u -> (String) u.get("uuid"), u -> u, (a, b) -> a));
                }
            }
        } catch (Exception e) {
            log.error("Error fetching users", e);
        }
        return Collections.emptyMap();
    }

    // FIX 2: Updated Create Method with Enrichment
    public List<AddPropertyRate> create(PropertyRateRequest request) {

        // 1. Validate
        validator.validateCreateRequest(request);

        // 2. Enrich (Generate IDs and Audit Details)
        List<AddPropertyRate> rates = request.getPropertyRates();
        String userId = "SYSTEM"; // Default
        if (request.getRequestInfo() != null && request.getRequestInfo().getUserInfo() != null) {
            userId = request.getRequestInfo().getUserInfo().getUuid();
        }
        long time = System.currentTimeMillis();

        for (AddPropertyRate rate : rates) {
            rate.setId(UUID.randomUUID());
            rate.setCreatedBy(userId);
            rate.setCreatedTime(time);            
            // Set defaults if null
            if(rate.getIsActive() == null) rate.setIsActive(true);
            if(rate.getIsProrataCal() == null) rate.setIsProrataCal(false);
        }
        producer.push(createTopic, request);
        // 3. Save
        return rates;       
    }
}