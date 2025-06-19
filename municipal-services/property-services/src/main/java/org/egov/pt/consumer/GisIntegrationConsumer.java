package org.egov.pt.consumer;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.pt.config.PropertyConfiguration;
import org.egov.pt.models.Address;
import org.egov.pt.models.Assessment;
import org.egov.pt.models.Locality;
import org.egov.pt.models.Property;
import org.egov.pt.models.PropertyCriteria;
import org.egov.pt.models.collection.Bill;
import org.egov.pt.models.collection.BillDetail;
import org.egov.pt.models.collection.BillResponse;
import org.egov.pt.models.collection.Payment;
import org.egov.pt.models.collection.PaymentDetail;
import org.egov.pt.models.collection.PaymentRequest;
import org.egov.pt.repository.PropertyRepository;
import org.egov.pt.repository.ServiceRequestRepository;
import org.egov.pt.service.AssessmentNotificationService;
import org.egov.pt.service.BillingService;
import org.egov.pt.service.NotificationService;
import org.egov.pt.service.PaymentUpdateService;
import org.egov.pt.service.PropertyService;
import org.egov.pt.util.PTConstants;
import org.egov.pt.web.contracts.AssessmentRequest;
import org.egov.pt.web.contracts.PropertyRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.collect.Sets;

@Component
@Slf4j
public class GisIntegrationConsumer {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PropertyConfiguration configs;


	@Autowired
	ServiceRequestRepository serviceRequestRepository;
	
	@Autowired
	private BillingService billingService;

	@Autowired
	private PropertyRepository propertyRepository;

	@KafkaListener(topics = { "${gis.reciept.topic}" })
	public void listengisupdate(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic)
			throws JsonProcessingException {
		int yearFrom = 0;

		PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
		RequestInfo requestInfo = paymentRequest.getRequestInfo();

		List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
		Map<String, BigDecimal> yearToAmountMap = new HashMap<>();
		String year = null;
		Bill bill = paymentDetails.get(0).getBill();
		if (bill != null && bill.getBillDetails() != null && !bill.getBillDetails().isEmpty()) {
			for (BillDetail billDetail : bill.getBillDetails()) {
				Long fromEpoch = billDetail.getFromPeriod();
				Long toEpoch = billDetail.getToPeriod();
				BigDecimal amount = billDetail.getAmountPaid();

				if (fromEpoch != null && toEpoch != null && amount != null) {
					int fromYear = Instant.ofEpochMilli(fromEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
					int toYear = Instant.ofEpochMilli(toEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
					String assessmentYearStr = fromYear + "-" + String.valueOf(toYear).substring(2);
					year=assessmentYearStr;
					yearToAmountMap.merge(assessmentYearStr, amount, BigDecimal::add);
				}
			}
		}
		PropertyCriteria criteria = PropertyCriteria.builder().propertyIds(Sets.newHashSet(bill.getConsumerCode()))
				.tenantId(paymentRequest.getPayment().getTenantId()).build();

		List<Property> properties = propertyRepository.getPropertiesWithOwnerInfo(criteria, requestInfo, true);

		log.info("Prop" + properties.toString());
		Property property = properties.get(0);

		StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
		StringBuilder searchurl = new StringBuilder(configs.getGisHost().concat(configs.getGissearchPath()));
		boolean hasParams = false;

		if (property.getPropertyId() != null && !property.getPropertyId().isEmpty()) {
			searchurl.append("?propertyid=").append(property.getPropertyId());
			hasParams = true;
		}
		if (property.getTenantId() != null && !property.getTenantId().isEmpty()) {
			searchurl.append(hasParams ? "&" : "?").append("tenantid=").append(property.getTenantId());
			hasParams = true;
		}
		if (property.getSurveyId() != null && !property.getSurveyId().isEmpty()) {
			searchurl.append(hasParams ? "&" : "?").append("surveyid=").append(property.getSurveyId());
		}

		Optional<Object> gisResponse = serviceRequestRepository.savegisdata(searchurl, property);
		if (gisResponse.isPresent()) {
			Object responseObj = gisResponse.get();
			String jsonResponse = mapper.writeValueAsString(responseObj);
			log.info("GIS Search Response JSON: {}", jsonResponse);
			// Calculate new amount paid as previous + current but not exceeding bill amount
			BigDecimal totalSettledAmountPaid = BigDecimal.ZERO;
			Map<String, BigDecimal> previousAmountPaidPerYear = new HashMap<>();
			if (gisResponse != null && gisResponse.isPresent()) {
				try {
					String jsonResponseInner = new ObjectMapper().writeValueAsString(gisResponse.get());
					JsonNode dataArray = new ObjectMapper().readTree(jsonResponseInner);
					if (dataArray.isArray()) {
						for (JsonNode entry : dataArray) {
							if (entry.has("amountpaid") && entry.has("assessmentyear")) {
								String assessmentYearStr = entry.get("assessmentyear").asText();
								BigDecimal amountPaid = new BigDecimal(entry.get("amountpaid").asText());
								previousAmountPaidPerYear.put(assessmentYearStr, amountPaid);
								log.info("Previous amount paid for assessment year {}: {}", assessmentYearStr, amountPaid);
							}
						}
					}
				} catch (Exception e) {
					log.info("Failed to parse GIS response for previous amount paid: " + e.getMessage());
				}
			}
			if (bill != null && bill.getBillDetails() != null) {
				for (BillDetail billDetail : bill.getBillDetails()) {
					Long fromEpoch = billDetail.getFromPeriod();
					Long toEpoch = billDetail.getToPeriod();
					BigDecimal billAmountForYear = billDetail.getAmount();
					if (fromEpoch != null && toEpoch != null && billAmountForYear != null) {
						int fromYear = Instant.ofEpochMilli(fromEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
						int toYear = Instant.ofEpochMilli(toEpoch).atZone(ZoneId.systemDefault()).toLocalDate().getYear();
						String assessmentYearStr = fromYear + "-" + String.valueOf(toYear).substring(2);
						BigDecimal previousAmountPaid = previousAmountPaidPerYear.getOrDefault(assessmentYearStr, BigDecimal.ZERO);
						BigDecimal currentAmountPaidForYear = yearToAmountMap.getOrDefault(assessmentYearStr, BigDecimal.ZERO);
						BigDecimal newAmountPaidForYear = previousAmountPaid.add(currentAmountPaidForYear);
						if (newAmountPaidForYear.compareTo(billAmountForYear) > 0) {
							newAmountPaidForYear = billAmountForYear;
						}
						totalSettledAmountPaid = totalSettledAmountPaid.add(newAmountPaidForYear);
					}
				}
			}
			BigDecimal newAmountPaid = totalSettledAmountPaid;

			Map<String, Object> propertyJson = extractUnifiedPropertyJson(null, property, null, paymentRequest, yearToAmountMap, gisResponse);
			propertyJson.put("amountpaid", newAmountPaid);
			 if (propertyJson.get("assessmentyear") == null) {
				 propertyJson.put("assessmentyear", year); 
			 }
			 if (propertyJson.get("billamount") == null) {
				 propertyJson.put("billamount", bill.getBillDetails().get(0).getAmount());
			 }
			log.info(" Peor " + propertyJson.toString());
			Optional<Object> gisResponse1 = serviceRequestRepository.savegisdata(url, propertyJson);
			if (gisResponse1.isPresent()) {
				Object responseObj1 = gisResponse1.get();
				String jsonResponse1 = mapper.writeValueAsString(responseObj1);
				log.info("GIS Save Response JSON: {}", jsonResponse1);
			} else {
				log.warn("No response received from GIS Save service.");
			}

		} else {
			log.warn("No response received from GIS service.");
		}

	}

	@KafkaListener(topics = { "${gis.save.property.topic}", "${egov.gis.assessment.create.topic}" })
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

		try {
			StringBuilder url = new StringBuilder(configs.getGisHost().concat(configs.getGiscreatePath()));
			StringBuilder searchurl = new StringBuilder(configs.getGisHost().concat(configs.getGissearchPath()));
			boolean hasParams = false;
			Map<String, Object> propertyJson = new HashMap<>();
			Property property = null;

			if (topic.equalsIgnoreCase(configs.getGisassessmentTopic())) {
				AssessmentRequest assessmentRequest = mapper.convertValue(record, AssessmentRequest.class);
				log.info("Saving Assessment data In Gis Record --> " + assessmentRequest);

				PropertyCriteria criteria = PropertyCriteria.builder()
						.propertyIds(Sets.newHashSet(assessmentRequest.getAssessment().getPropertyId()))
						.tenantId(assessmentRequest.getAssessment().getTenantId()).build();

				List<Property> properties = propertyRepository.getPropertiesWithOwnerInfo(criteria,
						assessmentRequest.getRequestInfo(), true);

				log.info("Prop" + properties.toString());
				property = properties.get(0);

				if (property.getPropertyId() != null && !property.getPropertyId().isEmpty()) {
					searchurl.append("?propertyid=").append(property.getPropertyId());
					hasParams = true;
				}
				if (property.getTenantId() != null && !property.getTenantId().isEmpty()) {
					searchurl.append(hasParams ? "&" : "?").append("tenantid=").append(property.getTenantId());
					hasParams = true;
				}
				if (property.getSurveyId() != null && !property.getSurveyId().isEmpty()) {
					searchurl.append(hasParams ? "&" : "?").append("surveyid=").append(property.getSurveyId());
				}

				Optional<Object> gisResponse = serviceRequestRepository.savegisdata(searchurl, property);
				if (gisResponse.isPresent()) {
					Object responseObj = gisResponse.get();
					String jsonResponse = mapper.writeValueAsString(responseObj);
					log.info("GIS Search Response JSON: {}", jsonResponse);
					propertyJson = extractUnifiedPropertyJson(null, property, assessmentRequest, null, null, gisResponse);
					log.info(" Peor " + propertyJson.toString());
					
					Optional<Object> gisResponse1 = serviceRequestRepository.savegisdata(url, propertyJson);
					if (gisResponse1.isPresent()) {
						Object responseObj1 = gisResponse1.get();
						String jsonResponse1 = mapper.writeValueAsString(responseObj1);
						log.info("GIS Save Response JSON: {}", jsonResponse1);
					} else {
						log.warn("No response received from GIS Save service.");
					}

				} else {
					log.warn("No response received from GIS service.");
				}

			} else if (topic.equalsIgnoreCase(configs.getGisPropertyTopic())) {
				PropertyRequest propertyRequest = mapper.convertValue(record, PropertyRequest.class);
				if (propertyRequest.getProperty() != null && propertyRequest.getProperty().getWorkflow() != null) {
					log.error("Saving Property data In Gis Record --> " + record);
					if (propertyRequest.getProperty().getWorkflow().getAction().equalsIgnoreCase("APPROVE")) {
						property = propertyRequest.getProperty();
						propertyJson = extractUnifiedPropertyJson(propertyRequest, null, null, null, null, null);

						Optional<Object> gisResponse = serviceRequestRepository.savegisdata(url, propertyJson);
						if (gisResponse.isPresent()) {
							Object responseObj = mapper.writeValueAsString(gisResponse.get());
							log.info("GIS Response JSON: {}", responseObj);
						} else {
							log.warn("No response received from GIS service.");
						}

					}
				}
			}

		} catch (final Exception e) {
			log.error("Error while listening to value: " + record + " on topic: " + topic + ": ", e);
		}
	}

	public Map<String, Object> extractUnifiedPropertyJson(PropertyRequest propertyRequest, Property property,
			AssessmentRequest assessmentRequest, PaymentRequest paymentRequest, Map<String, BigDecimal> yearToAmountMap,
			Optional<Object> gisResponse) {
		Map<String, Object> propertyJson = new HashMap<>();
		String assessmentYearMatched = null;

		// Determine the source of property and address
		if (property == null) {
			if (propertyRequest != null && propertyRequest.getProperty() != null) {
				property = propertyRequest.getProperty();
			} else if (assessmentRequest != null && assessmentRequest.getAssessment() != null) {
				// Extract property from assessmentRequest if possible
				property = new Property();
				property.setPropertyId(assessmentRequest.getAssessment().getPropertyId());
				property.setTenantId(assessmentRequest.getAssessment().getTenantId());
				// Additional property fields can be set if available
			} else if (paymentRequest != null) {
				// Extract property from paymentRequest if possible
				// Assuming paymentRequest has tenantId and consumerCode as propertyId
				property = new Property();
				property.setPropertyId(paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode());
				property.setTenantId(paymentRequest.getPayment().getTenantId());
				// Additional property fields can be set if available
			} else {
				return propertyJson; // No property info available
			}
		}
		String assessmentYear=null;

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

		// Common fields
		propertyJson.put("tenantid", property.getTenantId());
		propertyJson.put("propertyid", property.getPropertyId());
		propertyJson.put("surveyid", property.getSurveyId());
		propertyJson.put("oldpropertyid", property.getOldPropertyId());
		propertyJson.put("firmbusinessname", address != null ? address.getBuildingName() : null);
		propertyJson.put("address", fullAddress.toString());
		propertyJson.put("localitycode", locality != null ? locality.getCode() : null);
		propertyJson.put("localityname", locality != null ? locality.getName() : null);
		propertyJson.put("blockname", locality != null ? locality.getCode() : null);
		propertyJson.put("zonename", locality != null ? locality.getCode() : null);
		propertyJson.put("plotsize", property.getLandArea());
		propertyJson.put("propertyusagetype", property.getUsageCategory());
		propertyJson.put("propertytype", property.getPropertyType());
		propertyJson.put("ownershipcategory", property.getOwnershipCategory());
		propertyJson.put("service", "PT");

		// Specific fields based on input type
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
				propertyJson.put("paymentdate", paymentDetail.getReceiptDate());
				propertyJson.put("receiptnumber", paymentDetail.getReceiptNumber());
				if (assessmentYearMatched!= null && !assessmentYearMatched.isEmpty()) {
					propertyJson.put("assessmentyear", assessmentYearMatched);
				propertyJson.put("amountpaid", amountPaid);
				propertyJson.put("billamount", paymentDetail.getBill().getTotalAmount());
				}
				 else {
					log.info("Year to Amount Map: " + assessmentYear);
					propertyJson.put("amountpaid", paymentRequest.getPayment().getTotalAmountPaid());

				}
			} else {
				propertyJson.put("paymentdate", null);
				propertyJson.put("receiptnumber", null);
			}


		} else if (assessmentRequest != null) {
			// Handle assessment related fields
			Optional<Object> response = Optional.ofNullable(billingService.fetchBill(property, assessmentRequest.getRequestInfo()));
			BigDecimal grandTotal = BigDecimal.ZERO;

			if (response.isPresent() && response.get() instanceof BillResponse) {
			    BillResponse billResponse = (BillResponse) response.get();

			    grandTotal = billResponse.getBill().stream()
			        .map(Bill::getTotalAmount)
			        .reduce(BigDecimal.ZERO, BigDecimal::add);
			    propertyJson.put("billamount", grandTotal);
			    }
			propertyJson.put("paymentdate", null);
			propertyJson.put("receiptnumber", null);
			propertyJson.put("amountpaid", null);
			propertyJson.put("assessmentyear", assessmentRequest.getAssessment().getFinancialYear());
		} else {
			// Default for propertyRequest only
			propertyJson.put("paymentdate", null);
			propertyJson.put("receiptnumber", null);
			propertyJson.put("amountpaid", null);
			propertyJson.put("assessmentyear", null);
		}

		return propertyJson;
	}

}
