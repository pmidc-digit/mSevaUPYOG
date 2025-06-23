package org.egov.swservice.consumer;

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
import org.egov.swservice.config.SWConfiguration;
import org.egov.swservice.repository.ServiceRequestRepository;
import org.egov.swservice.repository.SewerageDaoImpl;
import org.egov.swservice.web.models.*;
import org.egov.swservice.web.models.collection.BillDetail;
import org.egov.swservice.web.models.collection.PaymentDetail;
import org.egov.swservice.web.models.collection.PaymentRequest;
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

    private static final String ASSESSMENT_YEAR = "assessmentyear";
    private static final String AMOUNT_PAID = "amountpaid";
    private static final String BILL_AMOUNT = "billamount";
    private static final String CONNECTION_NO = "connectionno";
    private static final String TENANT_ID = "tenantid";

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private SWConfiguration configs;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private SewerageDaoImpl sewerageDaoImpl;

    @Autowired
    private ValidateProperty validateProperty;

    @KafkaListener(topics = { "${gis.sewerage.receipt.topic}" })
    public void listenSeweragePaymentUpdate(final HashMap<String, Object> record,
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

            SewerageConnection sewerageConnection = getSewerageConnection(consumerCode, tenantId, requestInfo);
            if (sewerageConnection == null) {
                log.error("No valid sewerage connection found for consumer code: {}", consumerCode);
                return;
            }

            Property property = validateProperty(sewerageConnection, requestInfo);
            if (property == null) {
                log.error("Property validation failed for connection: {}", sewerageConnection.getConnectionNo());
                return;
            }

            Optional<Object> gisSearchResponse = searchGisRecords(sewerageConnection, tenantId);
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

                Map<String, Object> sewerageJson = buildSewerageTaxJson(
                        null,
                        sewerageConnection,
                        paymentRequest,
                        property,
                        Optional.ofNullable(gisData),
                        amountMap);

                sewerageJson.put(ASSESSMENT_YEAR, yearKey);
                sewerageJson.put("createdtime", System.currentTimeMillis());
                sewerageJson.put("lastmodifiedtime", System.currentTimeMillis());

                saveGisRecord(sewerageJson);
            }

        } catch (Exception e) {
            log.error("Error processing sewerage payment update: ", e);
        }
    }

    @KafkaListener(topics = { "${gis.save.sewerage.topic}" })
    public void listenSewerageConnectionUpdate(final HashMap<String, Object> record,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        try {
            if (!topic.equalsIgnoreCase(configs.getGissewerageTopic())) return;

            SewerageConnectionRequest sewerageConnectionRequest = mapper.convertValue(record, SewerageConnectionRequest.class);
            if (sewerageConnectionRequest.getSewerageConnection() == null) {
                log.warn("No sewerage connection found in request");
                return;
            }

            Property property = validateProperty.getOrValidateProperty(sewerageConnectionRequest);
            if (property == null) {
                log.error("Property not found for sewerage connection: {}", 
                        sewerageConnectionRequest.getSewerageConnection().getConnectionNo());
                return;
            }

            Map<String, Object> sewerageConnectionJson = buildSewerageTaxJson(
                    sewerageConnectionRequest, 
                    null, 
                    null, 
                    property, 
                    Optional.empty());

            if (!sewerageConnectionJson.isEmpty()) {
                saveGisRecord(sewerageConnectionJson);
            }
        } catch (Exception e) {
            log.error("Error processing sewerage connection update: ", e);
        }
    }

    private SewerageConnection getSewerageConnection(String consumerCode, String tenantId, RequestInfo requestInfo) {
        SearchCriteria criteria = SearchCriteria.builder()
                .connectionNumber(Sets.newHashSet(consumerCode))
                .tenantId(tenantId)
                .build();

        List<SewerageConnection> connections = sewerageDaoImpl.getSewerageConnectionList(criteria, requestInfo);
        return connections.isEmpty() ? null : connections.get(0);
    }

    private Property validateProperty(SewerageConnection connection, RequestInfo requestInfo) {
        SewerageConnectionRequest request = SewerageConnectionRequest.builder()
                .sewerageConnection(connection)
                .requestInfo(requestInfo)
                .build();
        return validateProperty.getOrValidateProperty(request);
    }

    private Optional<Object> searchGisRecords(SewerageConnection connection, String tenantId) {
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

    private Map<String, Object> buildSewerageTaxJson(SewerageConnectionRequest request,
                                                   SewerageConnection connection,
                                                   PaymentRequest paymentRequest,
                                                   Property property,
                                                   Optional<Object> gisResponse) {
        return buildSewerageTaxJson(request, connection, paymentRequest, property, gisResponse, null);
    }

    private Map<String, Object> buildSewerageTaxJson(SewerageConnectionRequest request,
                                                   SewerageConnection connection,
                                                   PaymentRequest paymentRequest,
                                                   Property property,
                                                   Optional<Object> gisResponse,
                                                   Map<String, BigDecimal> amountMap) {
        if (connection == null) {
            if (request != null) {
                connection = request.getSewerageConnection();
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
        json.put(AMOUNT_PAID, amountMap.getOrDefault(AMOUNT_PAID, BigDecimal.ZERO));
        json.put(BILL_AMOUNT, amountMap.getOrDefault(BILL_AMOUNT, BigDecimal.ZERO));
    }

    private SewerageConnection getConnectionFromPayment(PaymentRequest paymentRequest) {
        String consumerCode = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
        String tenantId = paymentRequest.getPayment().getTenantId();

        SearchCriteria criteria = SearchCriteria.builder()
                .connectionNumber(Sets.newHashSet(consumerCode))
                .tenantId(tenantId)
                .build();

        List<SewerageConnection> connections = sewerageDaoImpl.getSewerageConnectionList(
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