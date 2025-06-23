package org.egov.waterconnection.consumer;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;

import org.egov.common.contract.request.RequestInfo;
import org.egov.waterconnection.config.WSConfiguration;
import org.egov.waterconnection.repository.ServiceRequestRepository;
import org.egov.waterconnection.repository.WaterDaoImpl;
import org.egov.waterconnection.web.models.*;
import org.egov.waterconnection.web.models.collection.BillDetail;
import org.egov.waterconnection.web.models.collection.PaymentDetail;
import org.egov.waterconnection.web.models.collection.PaymentRequest;
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
//... [imports remain unchanged]

@Slf4j
@Component
public class WaterGisIntegrationConsumer {

 private static final String ASSESSMENT_YEAR = "assessmentyear";
 private static final String AMOUNT_PAID = "amountpaid";
 private static final String BILL_AMOUNT = "billamount";
 private static final String CONNECTION_NO = "connectionno";
 private static final String TENANT_ID = "tenantid";

 @Autowired
 private ObjectMapper mapper;

 @Autowired
 private WSConfiguration configs;

 @Autowired
 private ServiceRequestRepository serviceRequestRepository;

 @Autowired
 private WaterDaoImpl waterDaoImpl;

 @Autowired
 private ValidateProperty validateProperty;

 @KafkaListener(topics = { "${gis.water.receipt.topic}" })
 public void listenWaterPaymentUpdate(final HashMap<String, Object> record,
         @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) throws JsonProcessingException {

     try {
         PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
         RequestInfo requestInfo = paymentRequest.getRequestInfo();
         List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();

         if (paymentDetails == null || paymentDetails.isEmpty()) {
             log.warn("No payment details found in payment request");
             return;
         }

         Map<String, BigDecimal> yearToAmountPaidMap = new HashMap<>();
         Map<String, BigDecimal> yearToBillAmountMap = new HashMap<>();
         Map<String, Long[]> yearToPeriodMap = new HashMap<>();

         for (PaymentDetail paymentDetail : paymentDetails) {
             if (paymentDetail.getBill() != null) {
                 for (BillDetail billDetail : paymentDetail.getBill().getBillDetails()) {
                     if (billDetail.getFromPeriod() != null && billDetail.getToPeriod() != null) {
                         LocalDate fromDate = Instant.ofEpochMilli(billDetail.getFromPeriod())
                                 .atZone(ZoneId.systemDefault()).toLocalDate();
                         LocalDate toDate = Instant.ofEpochMilli(billDetail.getToPeriod())
                                 .atZone(ZoneId.systemDefault()).toLocalDate();

                         String yearKey = String.format("%04d-%02d to %04d-%02d",
                                 fromDate.getYear(), fromDate.getMonthValue(),
                                 toDate.getYear(), toDate.getMonthValue());

                         BigDecimal currentPaid = billDetail.getAmountPaid() != null ?
                                 billDetail.getAmountPaid() : BigDecimal.ZERO;
                         BigDecimal currentBill = billDetail.getAmount() != null ?
                                 billDetail.getAmount() : BigDecimal.ZERO;

                         yearToAmountPaidMap.merge(yearKey, currentPaid, BigDecimal::add);
                         yearToBillAmountMap.merge(yearKey, currentBill, BigDecimal::add);
                         yearToPeriodMap.putIfAbsent(yearKey, new Long[]{billDetail.getFromPeriod(), billDetail.getToPeriod()});
                     }
                 }
             }
         }

         String consumerCode = paymentDetails.get(0).getBill().getConsumerCode();
         String tenantId = paymentRequest.getPayment().getTenantId();

         WaterConnection waterConnection = getWaterConnection(consumerCode, tenantId, requestInfo);
         if (waterConnection == null) {
             log.error("No valid water connection found for consumer code: {}", consumerCode);
             return;
         }

         Property property = validateProperty(waterConnection, requestInfo);
         if (property == null) {
             log.error("Property validation failed for connection: {}", waterConnection.getConnectionNo());
             return;
         }

         Optional<Object> gisSearchResponse = searchGisRecords(waterConnection, tenantId);
         Object gisData = gisSearchResponse.orElse(null);

         for (Map.Entry<String, BigDecimal> entry : yearToAmountPaidMap.entrySet()) {
             String yearKey = entry.getKey();
             BigDecimal currentAmountPaid = entry.getValue();
             BigDecimal billAmount = yearToBillAmountMap.getOrDefault(yearKey, BigDecimal.ZERO);
             Long[] period = yearToPeriodMap.get(yearKey);

             if (period == null) continue;

             BigDecimal previousAmountPaid = (gisData != null) ? getPreviousAmountFromGis(gisData, yearKey) : BigDecimal.ZERO;
             BigDecimal totalAmountPaid = previousAmountPaid.add(currentAmountPaid);

             Map<String, BigDecimal> amountMap = new HashMap<>();
             amountMap.put(AMOUNT_PAID, totalAmountPaid);
             amountMap.put(BILL_AMOUNT, billAmount);

             Map<String, Object> waterJson = buildWaterTaxJson(
                     null,
                     waterConnection,
                     paymentRequest,
                     property,
                     Optional.ofNullable(gisData),
                     amountMap);

             waterJson.put(ASSESSMENT_YEAR, yearKey);
             waterJson.put("createdtime", System.currentTimeMillis());
             waterJson.put("lastmodifiedtime", System.currentTimeMillis());

             saveGisRecord(waterJson);
         }

     } catch (Exception e) {
         log.error("Error processing water payment update: ", e);
     }
 }

 @KafkaListener(topics = { "${gis.save.water.topic}" })
 public void listenWaterConnectionUpdate(final HashMap<String, Object> record,
                                         @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
     try {
         if (!topic.equalsIgnoreCase(configs.getGisWaterTopic())) return;

         WaterConnectionRequest waterConnectionRequest = mapper.convertValue(record, WaterConnectionRequest.class);
         if (waterConnectionRequest.getWaterConnection() == null) {
             log.warn("No water connection found in request");
             return;
         }

         Property property = validateProperty.getOrValidateProperty(waterConnectionRequest);
         if (property == null) {
             log.error("Property not found for water connection: {}", 
                     waterConnectionRequest.getWaterConnection().getConnectionNo());
             return;
         }

         Map<String, Object> waterConnectionJson = buildWaterTaxJson(
                 waterConnectionRequest, 
                 null, 
                 null, 
                 property, 
                 Optional.empty());

         if (!waterConnectionJson.isEmpty()) {
             saveGisRecord(waterConnectionJson);
         }
     } catch (Exception e) {
         log.error("Error processing water connection update: ", e);
     }
 }

 private WaterConnection getWaterConnection(String consumerCode, String tenantId, RequestInfo requestInfo) {
     SearchCriteria criteria = SearchCriteria.builder()
             .connectionNumber(Sets.newHashSet(consumerCode))
             .tenantId(tenantId)
             .build();

     List<WaterConnection> connections = waterDaoImpl.getWaterConnectionList(criteria, requestInfo);
     return connections.isEmpty() ? null : connections.get(0);
 }

 private Property validateProperty(WaterConnection connection, RequestInfo requestInfo) {
     WaterConnectionRequest request = WaterConnectionRequest.builder()
             .waterConnection(connection)
             .requestInfo(requestInfo)
             .build();
     return validateProperty.getOrValidateProperty(request);
 }

 private Optional<Object> searchGisRecords(WaterConnection connection, String tenantId) {
     StringBuilder searchUrl = new StringBuilder(configs.getGisHost())
             .append(configs.getGissearchPath())
             .append("?").append(CONNECTION_NO).append("=").append(connection.getConnectionNo())
             .append("&").append(TENANT_ID).append("=").append(tenantId);

     return serviceRequestRepository.saveGisData(searchUrl, connection);
 }

 private BigDecimal getPreviousAmountFromGis(Object gisResponse, String yearKey) {
     try {
         String jsonResponse = mapper.writeValueAsString(gisResponse);
         JsonNode dataArray = mapper.readTree(jsonResponse);
         if (dataArray.isArray()) {
             for (JsonNode entry : dataArray) {
                 if (yearKey.equals(entry.path(ASSESSMENT_YEAR).asText())) {
                     JsonNode amountNode = entry.path(AMOUNT_PAID);
                     if (!amountNode.isMissingNode()) {
                         return new BigDecimal(amountNode.asText());
                     }
                 }
             }
         }
     } catch (Exception e) {
         log.error("Error extracting previous amount for period {}: {}", yearKey, e.getMessage());
     }
     return BigDecimal.ZERO;
 }

 private Map<String, Object> buildWaterTaxJson(WaterConnectionRequest request,
                                               WaterConnection connection,
                                               PaymentRequest paymentRequest,
                                               Property property,
                                               Optional<Object> gisResponse) {
     return buildWaterTaxJson(request, connection, paymentRequest, property, gisResponse, null);
 }

 private Map<String, Object> buildWaterTaxJson(WaterConnectionRequest request,
                                               WaterConnection connection,
                                               PaymentRequest paymentRequest,
                                               Property property,
                                               Optional<Object> gisResponse,
                                               Map<String, BigDecimal> amountMap) {
     if (connection == null) {
         if (request != null) {
             connection = request.getWaterConnection();
         } else if (paymentRequest != null) {
             connection = getConnectionFromPayment(paymentRequest);
         }
     }

     Map<String, Object> json = new HashMap<>();
     json.put("connectionno", connection.getConnectionNo());
     json.put("tenantid", connection.getTenantId());
     json.put("propertyid", connection.getPropertyId());

     if (property != null) {
         addPropertyDetails(json, property);
         addAddressDetails(json, property);
     }

     if (paymentRequest != null && amountMap != null) {
         addPaymentDetails(json, paymentRequest, amountMap, gisResponse);
     }

     return json;
 }

 private void addPropertyDetails(Map<String, Object> json, Property property) {
     json.put("surveyid", property.getSurveyId());
     json.put("oldpropertyid", property.getOldPropertyId());
     json.put("nooffloors", property.getNoOfFloors());
     json.put("plotsize", property.getLandArea());
     json.put("superbuilduparea", property.getSuperBuiltUpArea());
     json.put("propertytype", property.getPropertyType());
     json.put("propertyusagetype", property.getUsageCategory());
     json.put("ownershipcategory", property.getOwnershipCategory());
 }

 private void addAddressDetails(Map<String, Object> json, Property property) {
     Address address = property.getAddress();
     if (address == null) return;

     Locality locality = address.getLocality();
     String localityName = locality != null ? locality.getName() : null;

     json.put("address", buildFullAddress(address));
     json.put("localityname", localityName);
     json.put("blockname", localityName);
 }

 private String buildFullAddress(Address address) {
     StringBuilder sb = new StringBuilder();
     appendAddressPart(sb, address.getDoorNo());
     appendAddressPart(sb, "Plot " + address.getPlotNo());
     appendAddressPart(sb, address.getBuildingName());
     appendAddressPart(sb, address.getStreet());

     if (address.getLocality() != null) {
         appendAddressPart(sb, address.getLocality().getName());
     }

     appendAddressPart(sb, "Landmark: " + address.getLandmark());
     appendAddressPart(sb, address.getCity());
     appendAddressPart(sb, address.getDistrict());
     appendAddressPart(sb, address.getRegion());
     appendAddressPart(sb, address.getState());
     appendAddressPart(sb, address.getCountry());
     appendAddressPart(sb, "PIN - " + address.getPincode());

     if (sb.length() > 0) sb.setLength(sb.length() - 2);
     return sb.toString();
 }

 private void appendAddressPart(StringBuilder sb, String part) {
     if (part != null && !part.isEmpty()) {
         sb.append(part).append(", ");
     }
 }

 private void addPaymentDetails(Map<String, Object> json,
                                PaymentRequest paymentRequest,
                                Map<String, BigDecimal> amountMap,
                                Optional<Object> gisResponse) {
     List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
     if (paymentDetails == null || paymentDetails.isEmpty()) {
         json.put("paymentdate", null);
         json.put("receiptnumber", null);
         return;
     }

     PaymentDetail detail = paymentDetails.get(0);
     json.put("paymentdate", detail.getReceiptDate());
     json.put("receiptnumber", detail.getReceiptNumber());

     if (amountMap != null) {
         json.put(AMOUNT_PAID, amountMap.getOrDefault(AMOUNT_PAID, BigDecimal.ZERO));
         json.put(BILL_AMOUNT, amountMap.getOrDefault(BILL_AMOUNT, BigDecimal.ZERO));
     }
 }

 private WaterConnection getConnectionFromPayment(PaymentRequest paymentRequest) {
     String consumerCode = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
     String tenantId = paymentRequest.getPayment().getTenantId();

     SearchCriteria criteria = SearchCriteria.builder()
             .connectionNumber(Sets.newHashSet(consumerCode))
             .tenantId(tenantId)
             .build();

     List<WaterConnection> connections = waterDaoImpl.getWaterConnectionList(
             criteria, paymentRequest.getRequestInfo());

     return connections.isEmpty() ? null : connections.get(0);
 }

 private void saveGisRecord(Map<String, Object> record) {
     StringBuilder url = new StringBuilder(configs.getGisHost())
             .append(configs.getGiscreatePath());

     Optional<Object> response = serviceRequestRepository.saveGisData(url, record);
     if (response.isPresent()) {
         log.info("Successfully saved GIS record for connection: {}", record.get("connectionno"));
     } else {
         log.warn("Failed to save GIS record for connection: {}", record.get("connectionno"));
     }
 }
}
