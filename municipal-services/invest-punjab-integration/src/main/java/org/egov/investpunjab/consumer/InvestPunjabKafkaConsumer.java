package org.egov.investpunjab.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.constants.InvestPunjabConstants;
import org.egov.investpunjab.models.InvestPunjabEventResult;
import org.egov.investpunjab.models.InvestPunjabStatusUpdatePayload;
import org.egov.investpunjab.models.InvestPunjabStatusUpdateRequest;
import org.egov.investpunjab.producer.InvestPunjabKafkaProducer;
import org.egov.investpunjab.service.InvestPunjabStatusService;
import org.egov.investpunjab.service.MunicipalServiceStatusMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class InvestPunjabKafkaConsumer {

    private final InvestPunjabStatusService statusService;
    private final InvestPunjabKafkaProducer kafkaProducer;
    private final MunicipalServiceStatusMapper statusMapper;
    private final ObjectMapper objectMapper;
    private final InvestPunjabConfiguration config;

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern(InvestPunjabConstants.DATE_TIME_FORMAT);

    @Autowired
    public InvestPunjabKafkaConsumer(InvestPunjabStatusService statusService,
                                     InvestPunjabKafkaProducer kafkaProducer,
                                     MunicipalServiceStatusMapper statusMapper,
                                     ObjectMapper objectMapper,
                                     InvestPunjabConfiguration config) {
        this.statusService = statusService;
        this.kafkaProducer = kafkaProducer;
        this.statusMapper = statusMapper;
        this.objectMapper = objectMapper;
        this.config = config;
    }

    /**
     * Converts raw Kafka message (ConsumerRecord, String, byte[], Map, or JsonNode) into a JsonNode.
     */
    private JsonNode parseToJsonNode(Object record) {
        if (record == null) return null;
        try {
            if (record instanceof ConsumerRecord) {
                record = ((ConsumerRecord<?, ?>) record).value();
                if (record == null) return null;
            }
            if (record instanceof JsonNode) {
                return (JsonNode) record;
            } else if (record instanceof String) {
                return objectMapper.readTree((String) record);
            } else if (record instanceof byte[]) {
                return objectMapper.readTree((byte[]) record);
            } else {
                return objectMapper.valueToTree(record);
            }
        } catch (Exception e) {
            log.error("Failed to parse Kafka record to JsonNode: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 1. Direct Kafka Listener:
     * Consumes explicit status update requests on dedicated topic: update-invest-punjab-status
     */
    @KafkaListener(
            topics = "${kafka.topics.invest.punjab.status.update:${kafka.topics.pdc.status.update:update-invest-punjab-status}}",
            concurrency = "${spring.kafka.consumer.concurrency.count:3}"
    )
    public void consumeDirectStatusUpdate(Object record) {
        log.info("Received message on direct Invest Punjab topic: {}", config.getKafkaTopicsStatusUpdate());
        InvestPunjabStatusUpdateRequest request = null;

        try {
            JsonNode root = parseToJsonNode(record);
            if (root == null) return;

            if (root.has("payload")) {
                request = objectMapper.treeToValue(root, InvestPunjabStatusUpdateRequest.class);
            } else if (root.has("iPin") || root.has("AppId") || root.has("appid")) {
                InvestPunjabStatusUpdatePayload payload = objectMapper.treeToValue(root, InvestPunjabStatusUpdatePayload.class);
                request = InvestPunjabStatusUpdateRequest.builder()
                        .payload(payload)
                        .tenantId(root.has("tenantId") ? root.get("tenantId").asText() : null)
                        .serviceType(root.has("serviceType") ? root.get("serviceType").asText() : null)
                        .build();
            } else {
                request = objectMapper.treeToValue(root, InvestPunjabStatusUpdateRequest.class);
            }

            statusService.updateStatus(request);

        } catch (Exception ex) {
            log.error("Error processing direct Invest Punjab status update message from Kafka: {}", record, ex);
            publishKafkaError(request, ex.getMessage());
        }
    }

    /**
     * 2. Trade License (TL) Listener:
     * Listens to tl-services topics (save-tl-tradelicense, update-tl-tradelicense, update-tl-workflow).
     * If an application has an iPin in additionalDetail, updates Invest Punjab automatically.
     */
    @KafkaListener(
            topics = {
                    "${kafka.topics.tl.save:save-tl-tradelicense}",
                    "${kafka.topics.tl.update:update-tl-tradelicense}",
                    "${kafka.topics.tl.workflow:update-tl-workflow}"
            },
            concurrency = "${spring.kafka.consumer.concurrency.count:3}"
    )
    public void consumeTradeLicenseEvent(Object record) {
        log.info("Received event on Trade License Kafka topic. Processing...");
        try {
            JsonNode root = parseToJsonNode(record);
            if (root == null) return;

            JsonNode licensesNode = root.has("Licenses") ? root.get("Licenses") : root.get("licenses");
            if (licensesNode == null || !licensesNode.isArray()) {
                log.debug("No Licenses array found in TL message.");
                return;
            }

            for (JsonNode license : licensesNode) {
                processTradeLicenseNode(license);
            }
        } catch (Exception e) {
            log.error("Error parsing Trade License event in Invest Punjab consumer: {}", e.getMessage(), e);
        }
    }

    private void processTradeLicenseNode(JsonNode license) {
        try {
            JsonNode detailNode = license.has("tradeLicenseDetail") ? license.get("tradeLicenseDetail") : null;
            if (detailNode == null) return;

            JsonNode additionalDetail = detailNode.has("additionalDetail") ? detailNode.get("additionalDetail")
                    : detailNode.get("additionalDetails");

            String iPin = extractFieldCaseInsensitive(additionalDetail, "iPin");
            if (StringUtils.isBlank(iPin)) {
                log.debug("No iPin found in Trade License additionalDetail. Skipping non-Invest-Punjab license.");
                return;
            }

            String appId = extractFieldCaseInsensitive(additionalDetail, "appId");
            if (StringUtils.isBlank(appId)) {
                appId = extractFieldCaseInsensitive(additionalDetail, "appid");
            }
            String appNumber = license.has("applicationNumber") ? license.get("applicationNumber").asText() : "";
            if (StringUtils.isBlank(appId)) {
                appId = appNumber;
            }

            String tenantId = license.has("tenantId") ? license.get("tenantId").asText() : "";
            String rawStatus = license.has("status") ? license.get("status").asText() : "";
            String licenseNumber = (license.has("licenseNumber") && !license.get("licenseNumber").isNull())
                    ? license.get("licenseNumber").asText() : "NA";

            // Extract applicant / owner name if available
            String applicantName = "Applicant";
            if (detailNode.has("owners") && detailNode.get("owners").isArray() && detailNode.get("owners").size() > 0) {
                JsonNode firstOwner = detailNode.get("owners").get(0);
                if (firstOwner.has("name")) {
                    applicantName = firstOwner.get("name").asText();
                }
            }

            Integer statusId = statusMapper.mapStatus(InvestPunjabConstants.SERVICE_TRADE_LICENSE, rawStatus);
            String statusDesc = statusMapper.getStatusDescription(statusId);

            log.info("Detected Invest Punjab Trade License application! iPin: {}, AppId: {}, Status: {} -> StatusId: {}",
                    iPin, appId, rawStatus, statusId);

            InvestPunjabStatusUpdatePayload payload = InvestPunjabStatusUpdatePayload.builder()
                    .iPin(iPin.trim())
                    .appId(appId.trim())
                    .statusId(statusId)
                    .statusDesc(statusDesc)
                    .senderName(applicantName)
                    .senderDesignation("Applicant")
                    .receiverName("Department of Local Government")
                    .receiverDesignation("Officer")
                    .comments("Status synced from Trade License: " + rawStatus)
                    .licenseNo(StringUtils.isNotBlank(licenseNumber) && !"null".equalsIgnoreCase(licenseNumber) ? licenseNumber : "NA")
                    .statusDate(LocalDateTime.now().format(DATE_TIME_FORMATTER))
                    .integrationSource(config.getDefaultSource())
                    .deemedApproval("false")
                    .processDays(0)
                    .actionSlno(1)
                    .totalActionsOnApplication(1)
                    .build();

            InvestPunjabStatusUpdateRequest request = InvestPunjabStatusUpdateRequest.builder()
                    .tenantId(tenantId)
                    .serviceType(InvestPunjabConstants.SERVICE_TRADE_LICENSE)
                    .serviceCode(InvestPunjabConstants.SERVICE_CODE_REGISTRATION)
                    .payload(payload)
                    .build();

            statusService.updateStatus(request);

        } catch (Exception e) {
            log.error("Failed to process Invest Punjab Trade License record: {}", e.getMessage(), e);
        }
    }

    /**
     * 3. Water Connection (WS) Listener:
     * Listens to ws-services topics (save-ws-connection, update-ws-connection, update-ws-workflow).
     * If an application has an iPin in additionalDetails, updates Invest Punjab automatically.
     */
    @KafkaListener(
            topics = {
                    "${kafka.topics.ws.save:save-ws-connection}",
                    "${kafka.topics.ws.update:update-ws-connection}",
                    "${kafka.topics.ws.workflow:update-ws-workflow}"
            },
            concurrency = "${spring.kafka.consumer.concurrency.count:3}"
    )
    public void consumeWaterConnectionEvent(Object record) {
        log.info("Received event on Water Connection Kafka topic. Processing payload...");
        try {
            JsonNode root = parseToJsonNode(record);
            if (root == null) {
                log.warn("Could not parse Water Connection event to JSON.");
                return;
            }

            JsonNode connectionNode = root.has("WaterConnection") ? root.get("WaterConnection")
                    : root.has("waterConnection") ? root.get("waterConnection")
                    : root.has("WaterConnections") ? root.get("WaterConnections")
                    : root.get("waterConnections");

            if (connectionNode == null) {
                log.debug("No WaterConnection node found in Kafka record.");
                return;
            }

            if (connectionNode.isArray()) {
                for (JsonNode node : connectionNode) {
                    processWaterConnectionNode(node);
                }
            } else {
                processWaterConnectionNode(connectionNode);
            }
        } catch (Exception e) {
            log.error("Error parsing Water Connection event in Invest Punjab consumer: {}", e.getMessage(), e);
        }
    }

    private void processWaterConnectionNode(JsonNode connection) {
        try {
            JsonNode additionalDetails = connection.has("additionalDetails") ? connection.get("additionalDetails")
                    : connection.get("additionalDetail");

            if (additionalDetails == null || additionalDetails.isNull()) {
                log.debug("WaterConnection has no additionalDetails.");
                return;
            }

            String iPin = extractFieldCaseInsensitive(additionalDetails, "iPin");
            if (StringUtils.isBlank(iPin)) {
                log.debug("No iPin found in WaterConnection additionalDetails. Skipping non-Invest-Punjab connection.");
                return;
            }

            String appId = extractFieldCaseInsensitive(additionalDetails, "appId");
            if (StringUtils.isBlank(appId)) {
                appId = extractFieldCaseInsensitive(additionalDetails, "appid");
            }
            String appNo = connection.has("applicationNo") ? connection.get("applicationNo").asText() : "";
            if (StringUtils.isBlank(appId)) {
                appId = appNo;
            }

            String tenantId = connection.has("tenantId") ? connection.get("tenantId").asText() : "";
            String rawStatus = connection.has("applicationStatus") ? connection.get("applicationStatus").asText()
                    : connection.has("status") ? connection.get("status").asText() : "";
            String connectionNo = (connection.has("connectionNo") && !connection.get("connectionNo").isNull())
                    ? connection.get("connectionNo").asText() : "NA";

            Integer statusId = statusMapper.mapStatus(InvestPunjabConstants.SERVICE_WATER_CONNECTION, rawStatus);
            String statusDesc = statusMapper.getStatusDescription(statusId);

            log.info("Detected Invest Punjab Water Connection application! iPin: {}, AppId: {}, Status: {} -> StatusId: {}",
                    iPin, appId, rawStatus, statusId);

            InvestPunjabStatusUpdatePayload payload = InvestPunjabStatusUpdatePayload.builder()
                    .iPin(iPin.trim())
                    .appId(appId.trim())
                    .statusId(statusId)
                    .statusDesc(statusDesc)
                    .senderName("Applicant")
                    .senderDesignation("Applicant")
                    .receiverName("Water & Sanitation Department")
                    .receiverDesignation("Junior Engineer / SDO")
                    .comments("Status synced from Water Connection: " + rawStatus)
                    .licenseNo(StringUtils.isNotBlank(connectionNo) && !"null".equalsIgnoreCase(connectionNo) ? connectionNo : "NA")
                    .statusDate(LocalDateTime.now().format(DATE_TIME_FORMATTER))
                    .integrationSource(config.getDefaultSource())
                    .deemedApproval("false")
                    .processDays(0)
                    .actionSlno(1)
                    .totalActionsOnApplication(1)
                    .build();

            InvestPunjabStatusUpdateRequest request = InvestPunjabStatusUpdateRequest.builder()
                    .tenantId(tenantId)
                    .serviceType(InvestPunjabConstants.SERVICE_WATER_CONNECTION)
                    .serviceCode(InvestPunjabConstants.SERVICE_CODE_REGISTRATION)
                    .payload(payload)
                    .build();

            statusService.updateStatus(request);

        } catch (Exception e) {
            log.error("Failed to process Invest Punjab Water Connection record: {}", e.getMessage(), e);
        }
    }

    /**
     * 4. Sewerage Connection (SW) Listener:
     * Listens to sw-services topics (save-sw-connection, update-sw-connection, update-sw-workflow).
     * If an application has an iPin in additionalDetails, updates Invest Punjab automatically.
     */
    @KafkaListener(
            topics = {
                    "${kafka.topics.sw.save:save-sw-connection}",
                    "${kafka.topics.sw.update:update-sw-connection}",
                    "${kafka.topics.sw.workflow:update-sw-workflow}"
            },
            concurrency = "${spring.kafka.consumer.concurrency.count:3}"
    )
    public void consumeSewerageConnectionEvent(Object record) {
        log.info("Received event on Sewerage Connection Kafka topic. Processing payload...");
        try {
            JsonNode root = parseToJsonNode(record);
            if (root == null) return;

            JsonNode connectionNode = root.has("SewerageConnection") ? root.get("SewerageConnection")
                    : root.has("sewerageConnection") ? root.get("sewerageConnection")
                    : root.has("SewerageConnections") ? root.get("SewerageConnections")
                    : root.get("sewerageConnections");

            if (connectionNode == null) return;

            if (connectionNode.isArray()) {
                for (JsonNode node : connectionNode) {
                    processSewerageConnectionNode(node);
                }
            } else {
                processSewerageConnectionNode(connectionNode);
            }
        } catch (Exception e) {
            log.error("Error parsing Sewerage Connection event in Invest Punjab consumer: {}", e.getMessage(), e);
        }
    }

    private void processSewerageConnectionNode(JsonNode connection) {
        try {
            JsonNode additionalDetails = connection.has("additionalDetails") ? connection.get("additionalDetails")
                    : connection.get("additionalDetail");

            if (additionalDetails == null || additionalDetails.isNull()) return;

            String iPin = extractFieldCaseInsensitive(additionalDetails, "iPin");
            if (StringUtils.isBlank(iPin)) {
                log.debug("No iPin found in SewerageConnection. Skipping non-Invest-Punjab connection.");
                return;
            }

            String appId = extractFieldCaseInsensitive(additionalDetails, "appId");
            if (StringUtils.isBlank(appId)) {
                appId = extractFieldCaseInsensitive(additionalDetails, "appid");
            }
            String appNo = connection.has("applicationNo") ? connection.get("applicationNo").asText() : "";
            if (StringUtils.isBlank(appId)) {
                appId = appNo;
            }

            String tenantId = connection.has("tenantId") ? connection.get("tenantId").asText() : "";
            String rawStatus = connection.has("applicationStatus") ? connection.get("applicationStatus").asText()
                    : connection.has("status") ? connection.get("status").asText() : "";
            String connectionNo = (connection.has("connectionNo") && !connection.get("connectionNo").isNull())
                    ? connection.get("connectionNo").asText() : "NA";

            Integer statusId = statusMapper.mapStatus(InvestPunjabConstants.SERVICE_SEWER_CONNECTION, rawStatus);
            String statusDesc = statusMapper.getStatusDescription(statusId);

            log.info("Detected Invest Punjab Sewerage Connection application! iPin: {}, AppId: {}, Status: {} -> StatusId: {}",
                    iPin, appId, rawStatus, statusId);

            InvestPunjabStatusUpdatePayload payload = InvestPunjabStatusUpdatePayload.builder()
                    .iPin(iPin.trim())
                    .appId(appId.trim())
                    .statusId(statusId)
                    .statusDesc(statusDesc)
                    .senderName("Applicant")
                    .senderDesignation("Applicant")
                    .receiverName("Sewerage Department")
                    .receiverDesignation("Junior Engineer / SDO")
                    .comments("Status synced from Sewerage Connection: " + rawStatus)
                    .licenseNo(StringUtils.isNotBlank(connectionNo) && !"null".equalsIgnoreCase(connectionNo) ? connectionNo : "NA")
                    .statusDate(LocalDateTime.now().format(DATE_TIME_FORMATTER))
                    .integrationSource(config.getDefaultSource())
                    .deemedApproval("false")
                    .processDays(0)
                    .actionSlno(1)
                    .totalActionsOnApplication(1)
                    .build();

            InvestPunjabStatusUpdateRequest request = InvestPunjabStatusUpdateRequest.builder()
                    .tenantId(tenantId)
                    .serviceType(InvestPunjabConstants.SERVICE_SEWER_CONNECTION)
                    .serviceCode(InvestPunjabConstants.SERVICE_CODE_REGISTRATION)
                    .payload(payload)
                    .build();

            statusService.updateStatus(request);

        } catch (Exception e) {
            log.error("Failed to process Invest Punjab Sewerage Connection record: {}", e.getMessage(), e);
        }
    }

    /**
     * Case-insensitive field extractor from JSON node (handles iPin, ipin, IPIN, appId, appid, etc.)
     */
    private String extractFieldCaseInsensitive(JsonNode node, String targetKey) {
        if (node == null || node.isNull()) {
            return null;
        }

        // If string representation of JSON was passed
        if (node.isTextual()) {
            try {
                JsonNode parsed = objectMapper.readTree(node.asText());
                return extractFieldCaseInsensitive(parsed, targetKey);
            } catch (Exception ignored) {}
        }

        if (node.isObject()) {
            if (node.has(targetKey)) {
                return node.get(targetKey).asText();
            }
            // Check case-insensitively
            java.util.Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                if (entry.getKey().equalsIgnoreCase(targetKey)) {
                    return entry.getValue().asText();
                }
            }
        }
        return null;
    }

    private void publishKafkaError(InvestPunjabStatusUpdateRequest request, String errorMsg) {
        InvestPunjabEventResult failureEvent = InvestPunjabEventResult.builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(System.currentTimeMillis())
                .eventType("FAILED")
                .errorMessage("Kafka Consumer Processing Error: " + errorMsg)
                .errorCode(InvestPunjabConstants.IPBF102)
                .build();

        if (request != null && request.getPayload() != null) {
            failureEvent.setIPin(request.getPayload().getIPin());
            failureEvent.setAppId(request.getPayload().getAppId());
            failureEvent.setStatusId(request.getPayload().getStatusId());
            failureEvent.setPayload(request.getPayload());
        }

        kafkaProducer.pushErrorEvent(failureEvent);
    }
}
