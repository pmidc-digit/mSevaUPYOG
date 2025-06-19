package org.egov.swservice.consumer;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.swservice.config.SWConfiguration;
import org.egov.swservice.repository.ServiceRequestRepository;
import org.egov.swservice.repository.SewerageDaoImpl;
import org.egov.swservice.web.models.*;
import org.egov.swservice.web.models.collection.Bill;
import org.egov.swservice.web.models.collection.BillDetail;
import org.egov.swservice.web.models.collection.PaymentDetail;
import org.egov.swservice.web.models.collection.PaymentRequest;
import org.egov.swservice.util.EncryptionDecryptionUtil;
import org.egov.swservice.validator.ValidateProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.google.common.collect.Sets;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SewerageGisIntegrationConsumer {

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private SWConfiguration configs;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private SewerageDaoImpl sewerageDaoImpl;

    @Autowired
    private EncryptionDecryptionUtil encryptionDecryptionUtil;

    @Autowired
    private ValidateProperty validateProperty;
    
    @KafkaListener(topics = { "${gis.sewerage.receipt.topic}" })
    public void listenSeweragePaymentUpdate(final HashMap<String, Object> record, 
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) throws JsonProcessingException {
        
        PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
        RequestInfo requestInfo = paymentRequest.getRequestInfo();

        List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
        Map<String, BigDecimal> yearToAmountMap = new HashMap<>();
        String year = null;
        
        BillDetail billDetail = paymentDetails.get(0).getBill().getBillDetails().get(0);
        if (billDetail != null) {
            Long fromEpoch = billDetail.getFromPeriod();
            Long toEpoch = billDetail.getToPeriod();
            BigDecimal amount = billDetail.getAmountPaid();

            if (fromEpoch != null && toEpoch != null && amount != null) {
                int fromYear = Instant.ofEpochMilli(fromEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
                int toYear = Instant.ofEpochMilli(toEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
                year = fromYear + "-" + String.valueOf(toYear).substring(2);
                yearToAmountMap.put(year, amount);
            }
        }

        SearchCriteria criteria = SearchCriteria.builder()
                .connectionNumber(Sets.newHashSet(paymentDetails.get(0).getBill().getConsumerCode()))
                .tenantId(paymentRequest.getPayment().getTenantId())
                .build();

        List<SewerageConnection> sewerageConnections = sewerageDaoImpl.getSewerageConnectionList(criteria, requestInfo);
        log.info("Sewerage Connections: " + sewerageConnections.toString());
        
        if (sewerageConnections.isEmpty()) {
            log.error("No sewerage connection found for consumer code: " + paymentDetails.get(0).getBill().getConsumerCode());
            return;
        }

        SewerageConnection sewerageConnection = encryptionDecryptionUtil.decryptObject(
                sewerageConnections.get(0), 
                "SewerageConnection", 
                SewerageConnection.class, 
                requestInfo);

        StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
        StringBuilder searchUrl = new StringBuilder(configs.getGisHost().concat(configs.getGissearchPath()));
        boolean hasParams = false;

        if (sewerageConnection.getConnectionNo() != null) {
            searchUrl.append("?connectionno=").append(sewerageConnection.getConnectionNo());
            hasParams = true;
        }
        if (sewerageConnection.getTenantId() != null) {
            searchUrl.append(hasParams ? "&" : "?").append("tenantid=").append(sewerageConnection.getTenantId());
        }

        Optional<Object> gisResponse = serviceRequestRepository.saveGisData(searchUrl, sewerageConnection);
        if (gisResponse.isPresent()) {
            Map<String, Object> sewerageConnectionJson = extractSewerageTaxJson(
                    null, 
                    sewerageConnection, 
                    paymentRequest, 
                    yearToAmountMap, 
                    null,
                    gisResponse);
            
            sewerageConnectionJson.put("assessmentyear", year);
            sewerageConnectionJson.put("createdtime", System.currentTimeMillis());
            sewerageConnectionJson.put("lastmodifiedtime", System.currentTimeMillis());

            Optional<Object> saveResponse = serviceRequestRepository.saveGisData(url, sewerageConnectionJson);
            if (saveResponse.isPresent()) {
                log.info("Successfully updated seweragetax record for connection: " + sewerageConnection.getConnectionNo());
            } else {
                log.warn("No response received from GIS Save service.");
            }
        } else {
            log.warn("No response received from GIS service.");
        }
    }

    @KafkaListener(topics = { "${gis.save.sewerage.topic}" })
    public void listenSewerageConnectionUpdate(final HashMap<String, Object> record, 
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        try {
            StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
            Map<String, Object> sewerageConnectionJson = new HashMap<>();
            SewerageConnection sewerageConnection = null;

            if (topic.equalsIgnoreCase(configs.getGissewerageTopic() )) {
                SewerageConnectionRequest sewerageConnectionRequest = mapper.convertValue(record, SewerageConnectionRequest.class);
                if (sewerageConnectionRequest.getSewerageConnection() != null) {
                    log.info("Processing sewerage connection for GIS: " + sewerageConnectionRequest);
                    
                    Property property = validateProperty.getOrValidateProperty(sewerageConnectionRequest);
                    if (property == null) {
                        log.error("Property not found for sewerage connection: " + sewerageConnectionRequest.getSewerageConnection().getConnectionNo());
                        return;
                    }
                    sewerageConnection = sewerageConnectionRequest.getSewerageConnection();
                    sewerageConnectionJson = extractSewerageTaxJson(
                            sewerageConnectionRequest, null, null, null, property, Optional.empty());
                }
            }

            if (!sewerageConnectionJson.isEmpty()) {
                sewerageConnectionJson.put("createdtime", System.currentTimeMillis());
                sewerageConnectionJson.put("lastmodifiedtime", System.currentTimeMillis());
                
                Optional<Object> saveResponse = serviceRequestRepository.saveGisData(url, sewerageConnectionJson);
                if (saveResponse.isPresent()) {
                    log.info("Successfully created/updated seweragetax record");
                }
            }
        } catch (final Exception e) {
            log.error("Error while processing GIS update: ", e);
        }
    }

    private Map<String, Object> extractSewerageTaxJson(
            SewerageConnectionRequest sewerageConnectionRequest,
            SewerageConnection sewerageConnection,
            PaymentRequest paymentRequest,
            Map<String, BigDecimal> yearToAmountMap,
            Property property,
            Optional<Object> gisResponse) {

        Map<String, Object> sewerageTaxJson = new HashMap<>();

        // Determine the source of sewerage connection
        if (sewerageConnection == null) {
            if (sewerageConnectionRequest != null && sewerageConnectionRequest.getSewerageConnection() != null) {
                sewerageConnection = sewerageConnectionRequest.getSewerageConnection();
            } 
            else if (paymentRequest != null) {
                SearchCriteria criteria = SearchCriteria.builder()
                        .connectionNumber(Sets.newHashSet(
                                paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode()))
                        .tenantId(paymentRequest.getPayment().getTenantId())
                        .build();

                List<SewerageConnection> sewerageConnections = sewerageDaoImpl.getSewerageConnectionList(
                        criteria, paymentRequest.getRequestInfo());

                if (!sewerageConnections.isEmpty()) {
                    sewerageConnection = sewerageConnections.get(0);
                }
            }
        }

        String assessmentYear = null;
        String assessmentYearMatched = null;

        Address address = property.getAddress();
        Locality locality = (address != null) ? address.getLocality() : null;

        // Build full address string
        StringBuilder fullAddress = new StringBuilder();
        if (address != null) {
            if (address.getDoorNo() != null)
                fullAddress.append(address.getDoorNo()).append(", ");
            if (address.getPlotNo() != null)
                fullAddress.append("Plot ").append(address.getPlotNo()).append(", ");
            if (address.getBuildingName() != null)
                fullAddress.append(address.getBuildingName()).append(", ");
            if (address.getStreet() != null)
                fullAddress.append(address.getStreet()).append(", ");
            if (locality != null && locality.getName() != null)
                fullAddress.append(locality.getName()).append(", ");
            if (address.getLandmark() != null)
                fullAddress.append("Landmark: ").append(address.getLandmark()).append(", ");
            if (address.getCity() != null)
                fullAddress.append(address.getCity()).append(", ");
            if (address.getDistrict() != null)
                fullAddress.append(address.getDistrict()).append(", ");
            if (address.getRegion() != null)
                fullAddress.append(address.getRegion()).append(", ");
            if (address.getState() != null)
                fullAddress.append(address.getState()).append(", ");
            if (address.getCountry() != null)
                fullAddress.append(address.getCountry()).append(", ");
            if (address.getPincode() != null)
                fullAddress.append("PIN - ").append(address.getPincode()).append(", ");
        }
        if (fullAddress.length() > 2) {
            fullAddress.setLength(fullAddress.length() - 2); // Remove trailing comma and space
        }

        // Basic connection info
        sewerageTaxJson.put("connectionno", sewerageConnection.getConnectionNo());
        sewerageTaxJson.put("tenantid", sewerageConnection.getTenantId());
        sewerageTaxJson.put("propertyid", sewerageConnection.getPropertyId());
        sewerageTaxJson.put("surveyid", property != null ? property.getSurveyId() : null);
        sewerageTaxJson.put("oldpropertyid", property != null ? property.getOldPropertyId() : null);
        
        // Address related fields
        sewerageTaxJson.put("address", fullAddress != null ? fullAddress.toString() : null);
        sewerageTaxJson.put("localityname", locality != null ? locality.getName() : null);
        sewerageTaxJson.put("blockname", locality != null ? locality.getName() : null);
        
        // Property characteristics
        sewerageTaxJson.put("nooffloors", property != null ? property.getNoOfFloors() : null);
        sewerageTaxJson.put("plotsize", property != null ? property.getLandArea() : null);
        sewerageTaxJson.put("superbuilduparea", property != null ? property.getSuperBuiltUpArea() : null);
        sewerageTaxJson.put("propertytype", property != null ? property.getPropertyType() : null);
        sewerageTaxJson.put("propertyusagetype", property != null ? property.getUsageCategory() : null);
        sewerageTaxJson.put("ownershipcategory", property != null ? property.getOwnershipCategory() : null);

        // Payment related fields (if available)
        if (paymentRequest != null) {
            // Handle payment related fields
            BigDecimal amountPaid = BigDecimal.ZERO;
            if (gisResponse != null && gisResponse.isPresent()) {
                try {
                    String jsonResponse = new ObjectMapper().writeValueAsString(gisResponse.get());
                    JsonNode dataArray = new ObjectMapper().readTree(jsonResponse);
                    if (dataArray.isArray()) {
                        for (JsonNode entry : dataArray) {
                            assessmentYear = entry.path("assessmentyear").asText();
                            if (assessmentYear != null && !assessmentYear.isEmpty()) {
                                if (yearToAmountMap != null && yearToAmountMap.containsKey(assessmentYear)) {
                                    amountPaid = yearToAmountMap.get(assessmentYear);
                                    assessmentYearMatched = assessmentYear;
                                    log.info("Matched assessment year: " + assessmentYear + " with amount: " + amountPaid);
                                    break;
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.info("Failed to parse GIS response: " + e.getMessage());
                }
            }

            List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
            if (paymentDetails != null && !paymentDetails.isEmpty()) {
                PaymentDetail paymentDetail = paymentDetails.get(0);
                sewerageTaxJson.put("paymentdate", paymentDetail.getReceiptDate());
                sewerageTaxJson.put("receiptnumber", paymentDetail.getReceiptNumber());
                if (assessmentYearMatched != null && !assessmentYearMatched.isEmpty()) {
                    sewerageTaxJson.put("assessmentyear", assessmentYearMatched);
                    sewerageTaxJson.put("amountpaid", amountPaid);
                    sewerageTaxJson.put("billamount", paymentDetail.getBill().getTotalAmount());
                } else {
                    log.info("Year to Amount Map: " + assessmentYear);
                    sewerageTaxJson.put("amountpaid", paymentRequest.getPayment().getTotalAmountPaid());
                }
            } else {
                sewerageTaxJson.put("paymentdate", null);
                sewerageTaxJson.put("receiptnumber", null);
            }
        }
       
        return sewerageTaxJson;
    }
}