package org.egov.waterconnection.consumer;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;

import org.egov.waterconnection.config.WSConfiguration;
import org.egov.waterconnection.repository.ServiceRequestRepository;
import org.egov.waterconnection.repository.WaterDaoImpl;
import org.egov.waterconnection.web.models.*;
import org.egov.waterconnection.web.models.collection.Bill;
import org.egov.waterconnection.web.models.collection.BillDetail;
import org.egov.waterconnection.web.models.collection.PaymentDetail;
import org.egov.waterconnection.web.models.collection.PaymentRequest;
import org.egov.waterconnection.util.EncryptionDecryptionUtil;
import org.egov.waterconnection.validator.ValidateProperty;
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
public class WaterGisIntegrationConsumer {

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private WSConfiguration configs;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private WaterDaoImpl waterDaoImpl;

    @Autowired
    private EncryptionDecryptionUtil encryptionDecryptionUtil;

	@Autowired
	private ValidateProperty validateProperty;
    
    @KafkaListener(topics = { "${gis.water.receipt.topic}" })
    public void listenWaterPaymentUpdate(final HashMap<String, Object> record, 
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

        List<WaterConnection> waterConnections = waterDaoImpl.getWaterConnectionList(criteria, requestInfo);
        log.info("Water Connections: " + waterConnections.toString());
        
        if (waterConnections.isEmpty()) {
            log.error("No water connection found for consumer code: " + paymentDetails.get(0).getBill().getConsumerCode());
            return;
        }

        WaterConnection waterConnection = encryptionDecryptionUtil.decryptObject(
                waterConnections.get(0), 
                "WaterConnection", 
                WaterConnection.class, 
                requestInfo);

        StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
        StringBuilder searchUrl = new StringBuilder(configs.getGisHost().concat(configs.getGissearchPath()));
        boolean hasParams = false;

        if (waterConnection.getConnectionNo() != null) {
            searchUrl.append("?connectionno=").append(waterConnection.getConnectionNo());
            hasParams = true;
        }
        if (waterConnection.getTenantId() != null) {
            searchUrl.append(hasParams ? "&" : "?").append("tenantid=").append(waterConnection.getTenantId());
        }

        Optional<Object> gisResponse = serviceRequestRepository.saveGisData(searchUrl, waterConnection);
        if (gisResponse.isPresent()) {
            Map<String, Object> waterConnectionJson = extractWaterTaxJson(
                    null, 
                    waterConnection, 
                     
                    paymentRequest, 
                    yearToAmountMap, 
                    null,
                    gisResponse);
            
            waterConnectionJson.put("assessmentyear", year);
            waterConnectionJson.put("createdtime", System.currentTimeMillis());
            waterConnectionJson.put("lastmodifiedtime", System.currentTimeMillis());

            Optional<Object> saveResponse = serviceRequestRepository.saveGisData(url, waterConnectionJson);
            if (saveResponse.isPresent()) {
                log.info("Successfully updated watertax record for connection: " + waterConnection.getConnectionNo());
            } else {
                log.warn("No response received from GIS Save service.");
            }
        } else {
            log.warn("No response received from GIS service.");
        }
    }

    @KafkaListener(topics = { "${gis.save.water.topic}" })
    public void listenWaterConnectionUpdate(final HashMap<String, Object> record, 
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        try {
            StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
            Map<String, Object> waterConnectionJson = new HashMap<>();
            WaterConnection waterConnection = null;

            if (topic.equalsIgnoreCase(configs.getGisWaterTopic())) {
                WaterConnectionRequest waterConnectionRequest = mapper.convertValue(record, WaterConnectionRequest.class);
                if (waterConnectionRequest.getWaterConnection() != null) {
                    log.info("Processing water connection for GIS: " + waterConnectionRequest);
                    
            		Property property = validateProperty.getOrValidateProperty(waterConnectionRequest);
					if (property == null) {
						log.error("Property not found for water connection: " + waterConnectionRequest.getWaterConnection().getConnectionNo());
						return;
					}
                    waterConnection = waterConnectionRequest.getWaterConnection();
                    waterConnectionJson = extractWaterTaxJson(
                            waterConnectionRequest, null, null,  null, property, Optional.empty());
                }
            }

            if (!waterConnectionJson.isEmpty()) {
                waterConnectionJson.put("createdtime", System.currentTimeMillis());
                waterConnectionJson.put("lastmodifiedtime", System.currentTimeMillis());
                
                Optional<Object> saveResponse = serviceRequestRepository.saveGisData(url, waterConnectionJson);
                if (saveResponse.isPresent()) {
                    log.info("Successfully created/updated watertax record");
                }
            }
        } catch (final Exception e) {
            log.error("Error while processing GIS update: ", e);
        }
    }

    private Map<String, Object> extractWaterTaxJson(
            WaterConnectionRequest waterConnectionRequest,
            WaterConnection waterConnection,
            PaymentRequest paymentRequest,
            Map<String, BigDecimal> yearToAmountMap,
            Property property,
            Optional<Object> gisResponse) {

        Map<String, Object> waterTaxJson = new HashMap<>();

        // Determine the source of water connection
        if (waterConnection == null) {
            if (waterConnectionRequest != null && waterConnectionRequest.getWaterConnection() != null) {
                waterConnection = waterConnectionRequest.getWaterConnection();
            } 
          
            } 
            else if (paymentRequest != null) {
                SearchCriteria criteria = SearchCriteria.builder()
                        .connectionNumber(Sets.newHashSet(
                                paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode()))
                        .tenantId(paymentRequest.getPayment().getTenantId())
                        .build();

                List<WaterConnection> waterConnections = waterDaoImpl.getWaterConnectionList(
                        criteria, paymentRequest.getRequestInfo());

                if (!waterConnections.isEmpty()) {
                    waterConnection = waterConnections.get(0);
                }
            }
		String assessmentYear=null;
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
        waterTaxJson.put("connectionno", waterConnection.getConnectionNo());
        waterTaxJson.put("tenantid", waterConnection.getTenantId());
        waterTaxJson.put("propertyid", waterConnection.getPropertyId());
        waterTaxJson.put("surveyid", property != null ? property.getSurveyId() : null);
        waterTaxJson.put("oldpropertyid", property != null ? property.getOldPropertyId() : null);
        
        // Address related fields
        waterTaxJson.put("address", fullAddress != null ? fullAddress.toString() : null);
        waterTaxJson.put("localityname", locality != null ? locality.getName() : null);
        waterTaxJson.put("blockname", locality != null ? locality.getName() : null);
        
        // Property characteristics
        waterTaxJson.put("nooffloors", property != null ? property.getNoOfFloors() : null);
        waterTaxJson.put("plotsize", property != null ? property.getLandArea() : null);
        waterTaxJson.put("superbuilduparea", property != null ? property.getSuperBuiltUpArea() : null);
        waterTaxJson.put("propertytype", property != null ? property.getPropertyType() : null);
        waterTaxJson.put("propertyusagetype", property != null ? property.getUsageCategory() : null);
        waterTaxJson.put("ownershipcategory",property != null ? property.getOwnershipCategory() : null);

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
				waterTaxJson.put("paymentdate", paymentDetail.getReceiptDate());
				waterTaxJson.put("receiptnumber", paymentDetail.getReceiptNumber());
				if (assessmentYearMatched!= null && !assessmentYearMatched.isEmpty()) {
					waterTaxJson.put("assessmentyear", assessmentYearMatched);
				waterTaxJson.put("amountpaid", amountPaid);
				waterTaxJson.put("billamount", paymentDetail.getBill().getTotalAmount());
				}
				 else {
					log.info("Year to Amount Map: " + assessmentYear);
					waterTaxJson.put("amountpaid", paymentRequest.getPayment().getTotalAmountPaid());

				}
			} else {
				waterTaxJson.put("paymentdate", null);
				waterTaxJson.put("receiptnumber", null);
			}


		}
       
        return waterTaxJson;
    }
}
