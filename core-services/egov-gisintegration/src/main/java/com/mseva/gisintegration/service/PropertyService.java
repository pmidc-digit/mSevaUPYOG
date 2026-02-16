package com.mseva.gisintegration.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mseva.gisintegration.model.Property;
import com.mseva.gisintegration.repository.PropertyRepository;
import com.mseva.gisintegration.repository.ServiceRequestRepository;
import org.egov.common.contract.request.RequestInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class PropertyService {

    private static final Logger log = LoggerFactory.getLogger(PropertyService.class);

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ObjectMapper mapper;

    @Value("${egov.propertyservice.host}")
    private String propertyHost;

    @Value("${egov.propertyservice.search.endpoint}")
    private String propertySearchEndpoint;

    /**
     * Entry point for Assessment Topic Consumer.
     */
    public void handleAssessmentSync(JsonNode assessment, RequestInfo requestInfo) {
        String propertyId = assessment.path("propertyId").asText();
        String tenantId = assessment.path("tenantId").asText();
        String financialYear = assessment.path("financialYear").asText();

        log.info("Syncing Assessment for Property: {} Year: {}", propertyId, financialYear);

        try {
            // Step 1: Search Property Service for full master data
            JsonNode propertyNode = fetchPropertyDataFromService(propertyId, tenantId, requestInfo);

            if (propertyNode != null) {
                Property p = new Property();
                
                // Step 2: Map GIS Master Data (Survey ID, Address, etc.)
                mapGisFields(p, propertyNode);
                
                // Step 3: Map Assessment-specific data
                p.setTenantid(tenantId);
                p.setPropertyid(propertyId);
                p.setAssessmentyear(financialYear);
                
                // Since this is just an assessment, we set payment fields to empty/zero
                p.setAmoutpaid("0");
                p.setReceiptnumber("ASSESSMENT_PENDING");

                // Step 4: Persist
                this.createOrUpdateProperty(p);
            }
        } catch (Exception e) {
            log.error("Error in handleAssessmentSync for propertyId: " + propertyId, e);
        }
    }

    /**
     * Entry point for Payment Consumer.
     */
    public void processPayment(JsonNode detail, JsonNode payment, RequestInfo requestInfo) {
        String propertyId = detail.path("bill").path("consumerCode").asText();
        String tenantId = detail.path("tenantId").asText();

        try {
            JsonNode propertyNode = fetchPropertyDataFromService(propertyId, tenantId, requestInfo);
            
            if (propertyNode != null) {
                Property p = new Property();
                mapGisFields(p, propertyNode);
                mapTransactionalFields(p, detail, payment);
                this.createOrUpdateProperty(p);
            }
        } catch (Exception e) {
            log.error("Error in processPayment for propertyId: " + propertyId, e);
        }
    }

    // --- HELPER METHODS ---

    private JsonNode fetchPropertyDataFromService(String propertyId, String tenantId, RequestInfo requestInfo) {
        StringBuilder url = new StringBuilder(propertyHost)
                .append(propertySearchEndpoint)
                .append("?tenantId=").append(tenantId)
                .append("&propertyIds=").append(propertyId);

        Map<String, Object> request = new HashMap<>();
        request.put("RequestInfo", requestInfo);

        Object response = serviceRequestRepository.fetchResult(url, request);
        JsonNode root = mapper.valueToTree(response);
        JsonNode properties = root.path("Properties");

        return (properties.isArray() && properties.size() > 0) ? properties.get(0) : null;
    }

    private void mapGisFields(Property p, JsonNode node) {
        p.setPropertyid(node.path("propertyId").asText());
        p.setSurveyid(node.path("surveyId").asText());
        p.setOldpropertyid(node.path("oldPropertyId").asText());
        
        // Handling potentially missing owners node
        JsonNode owners = node.path("owners");
        if (owners.isArray() && owners.size() > 0) {
            p.setFirmbusinessname(owners.get(0).path("name").asText());
        }

        p.setPropertytype(node.path("propertyType").asText());
        p.setPropertyusagetype(node.path("usageCategory").asText());
        p.setOwnershipcategory(node.path("ownershipCategory").asText());
        p.setPlotsize(node.path("landArea").asText());
        
        JsonNode addr = node.path("address");
        String fullAddress = String.format("%s, %s, %s", 
                addr.path("doorNo").asText(""), 
                addr.path("street").asText(""), 
                addr.path("locality").path("name").asText(""));
        
        p.setAddress(fullAddress);
        p.setLocalityname(addr.path("locality").path("name").asText());
        p.setLocalitycode(addr.path("locality").path("code").asText());
        p.setBlockname(addr.path("locality").path("name").asText());
        p.setZonename(addr.path("city").asText());
    }

    private void mapTransactionalFields(Property p, JsonNode detail, JsonNode payment) {
        p.setTenantid(detail.path("tenantId").asText());
        p.setReceiptnumber(detail.path("receiptNumber").asText());
        p.setAmoutpaid(detail.path("totalAmountPaid").asText());
        p.setPaymentdate(payment.path("transactionDate").asText());

        JsonNode billDetails = detail.path("bill").path("billDetails");
        if (billDetails.isArray() && billDetails.size() > 0) {
            long fromPeriod = billDetails.get(0).path("fromPeriod").asLong();
            int year = Instant.ofEpochMilli(fromPeriod).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
            p.setAssessmentyear(year + "-" + String.valueOf(year + 1).substring(2));
        }
    }

    // --- REPOSITORY LOGIC ---

    public Map<String, Object> createOrUpdateProperty(Property property) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> responseInfo = new HashMap<>();
        responseInfo.put("status", "successful");

        List<Property> existing = propertyRepository.findByPropertyid(property.getPropertyid(), property.getTenantid());

        Property match = null;
        if (existing != null) {
            match = existing.stream()
                    .filter(e -> property.getAssessmentyear() != null && property.getAssessmentyear().equals(e.getAssessmentyear()))
                    .findFirst().orElse(null);
        }

        if (match != null) {
            updateFields(match, property);
            response.put("Property", propertyRepository.save(match));
            responseInfo.put("method", "update");
        } else {
            response.put("Property", propertyRepository.save(property));
            responseInfo.put("method", "create");
        }
        
        response.put("ResponseInfo", responseInfo);
        return response;
    }

    private void updateFields(Property existing, Property source) {
        if (source.getTenantid() != null) existing.setTenantid(source.getTenantid());
        if (source.getSurveyid() != null) existing.setSurveyid(source.getSurveyid());
        if (source.getAddress() != null) existing.setAddress(source.getAddress());
        if (source.getPlotsize() != null) existing.setPlotsize(source.getPlotsize());
        
        // Only update payment fields if they aren't default "0" or "PENDING"
        if (source.getAmoutpaid() != null && !source.getAmoutpaid().equals("0")) {
            existing.setAmoutpaid(source.getAmoutpaid());
        }
        if (source.getReceiptnumber() != null && !source.getReceiptnumber().equals("ASSESSMENT_PENDING")) {
            existing.setReceiptnumber(source.getReceiptnumber());
        }
        if (source.getPaymentdate() != null) existing.setPaymentdate(source.getPaymentdate());
    }
}