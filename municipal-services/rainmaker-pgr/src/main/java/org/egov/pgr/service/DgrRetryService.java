package org.egov.pgr.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.consumer.DgrIntegration;
import org.egov.pgr.contract.ServiceReqSearchCriteria;
import org.egov.pgr.contract.ServiceRequest;
import org.egov.pgr.contract.ServiceResponse;
import org.egov.pgr.model.user.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

/**
 * DgrRetryService handles:
 * 1. Polling & reprocessing failed records directly from the Kafka topic "dgr-failed-records".
 * 2. Retrying specific serviceRequestIds provided as a comma-separated list or JSON array.
 * 3. Checking topic lag / message count on "dgr-failed-records".
 */
@Service
@Slf4j
public class DgrRetryService {

    @Autowired
    private DgrIntegration dgrIntegration;

    @Autowired
    private GrievanceService grievanceService;

    @Value("${kafka.config.bootstrap_server_config:localhost:9092}")
    private String bootstrapServers;

    @Value("${kafka.topic.store.failed.topic:dgr-failed-records}")
    private String failedDgrTopic;

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * API 1: Process failed records directly from Kafka topic "dgr-failed-records".
     *
     * @param requestInfo   RequestInfo (if null, will use the RequestInfo from each Kafka record)
     * @param limit         Max records to poll and process in this run (default: 100)
     * @param fromBeginning If true, rewinds consumer offset to offset 0 before polling
     * @return Summary with totalLag, processedCount, successCount, failedCount, and results
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> processFailedTopicRecords(
            RequestInfo requestInfo, Integer limit, Boolean fromBeginning) {

        int maxToProcess = (limit != null && limit > 0 && limit <= 500) ? limit : 100;
        List<Map<String, Object>> results = new ArrayList<>();
        int successCount = 0;
        int failedCount = 0;
        long totalMessagesInTopic = 0;

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "rainmaker-pgr-dgr-failed-retry-processor");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, maxToProcess);

        log.info("Starting DGR failed topic processing on topic [{}] from bootstrap [{}]", failedDgrTopic, bootstrapServers);

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {

            List<PartitionInfo> partitionInfos = consumer.partitionsFor(failedDgrTopic);
            if (partitionInfos == null || partitionInfos.isEmpty()) {
                log.warn("Topic [{}] does not exist or has no partitions.", failedDgrTopic);
                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("topic", failedDgrTopic);
                summary.put("status", "TOPIC_NOT_FOUND_OR_EMPTY");
                summary.put("totalMessages", 0);
                summary.put("processedCount", 0);
                summary.put("results", results);
                return summary;
            }

            List<TopicPartition> partitions = new ArrayList<>();
            for (PartitionInfo pi : partitionInfos) {
                partitions.add(new TopicPartition(pi.topic(), pi.partition()));
            }
            consumer.assign(partitions);

            // Calculate total messages in topic
            Map<TopicPartition, Long> endOffsets = consumer.endOffsets(partitions);
            Map<TopicPartition, Long> beginningOffsets = consumer.beginningOffsets(partitions);
            for (TopicPartition tp : partitions) {
                long start = beginningOffsets.getOrDefault(tp, 0L);
                long end = endOffsets.getOrDefault(tp, 0L);
                totalMessagesInTopic += Math.max(0, end - start);
            }

            log.info("Topic [{}] total messages: {}", failedDgrTopic, totalMessagesInTopic);

            if (Boolean.TRUE.equals(fromBeginning)) {
                log.info("Seeking to beginning for topic [{}]", failedDgrTopic);
                consumer.seekToBeginning(partitions);
            }

            // Generate token once for the retry batch
            String bearerToken = dgrIntegration.generateLoginToken();
            if (bearerToken == null || bearerToken.trim().isEmpty()
                    || "Invalid credentials!".equalsIgnoreCase(bearerToken.trim())) {
                log.error("Failed to generate DGR token. Aborting failed topic processing.");
                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("topic", failedDgrTopic);
                summary.put("totalMessages", totalMessagesInTopic);
                summary.put("status", "TOKEN_GENERATION_FAILED");
                summary.put("results", results);
                return summary;
            }

            int processed = 0;
            // Poll in a loop until we reach maxToProcess or no more messages
            while (processed < maxToProcess) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(3000));
                if (records == null || records.isEmpty()) {
                    log.info("No more records polled from topic [{}]", failedDgrTopic);
                    break;
                }

                log.info("Polled {} records from topic [{}]", records.count(), failedDgrTopic);

                for (ConsumerRecord<String, String> record : records) {
                    if (processed >= maxToProcess) break;

                    String value = record.value();
                    Map<String, Object> entryResult = new HashMap<>();
                    entryResult.put("partition", record.partition());
                    entryResult.put("offset", record.offset());

                    try {
                        Map<String, Object> payload = mapper.readValue(value, Map.class);
                        Object serviceReqObj = payload.get("serviceRequest");

                        if (serviceReqObj == null) {
                            entryResult.put("status", "SKIPPED_NO_SERVICE_REQUEST");
                            results.add(entryResult);
                            processed++;
                            continue;
                        }

                        ServiceRequest serviceReqRequest = mapper.convertValue(serviceReqObj, ServiceRequest.class);

                        if (serviceReqRequest.getServices() == null || serviceReqRequest.getServices().isEmpty()) {
                            entryResult.put("status", "SKIPPED_EMPTY_SERVICES");
                            results.add(entryResult);
                            processed++;
                            continue;
                        }

                        String serviceRequestId = serviceReqRequest.getServices().get(0).getServiceRequestId();
                        String tenantId = serviceReqRequest.getServices().get(0).getTenantId();
                        String accountId = serviceReqRequest.getServices().get(0).getAccountId();

                        entryResult.put("serviceRequestId", serviceRequestId);
                        entryResult.put("tenantId", tenantId);

                        // Use caller's RequestInfo if provided, otherwise the one in the record
                        RequestInfo effectiveReqInfo = requestInfo != null ? requestInfo : serviceReqRequest.getRequestInfo();
                        if (effectiveReqInfo != null) {
                            serviceReqRequest.setRequestInfo(effectiveReqInfo);
                        }

                        // Fetch user details for the grievance
                        UserResponse userResponse = null;
                        try {
                            if (accountId != null && !accountId.trim().isEmpty()) {
                                Long userId = Long.valueOf(accountId.trim());
                                String userTenantId = tenantId.contains(".") ? tenantId.split("\\.")[0] : tenantId;
                                userResponse = grievanceService.getUsers(
                                        effectiveReqInfo, userTenantId, Collections.singletonList(userId));
                            }
                        } catch (Exception e) {
                            log.warn("Could not fetch user for serviceRequestId={}: {}", serviceRequestId, e.getMessage());
                        }

                        // Call CreateGrievance (this automatically uploads docs and pushes to update-dgr-pgrid on success)
                        String grievanceApiResponse = dgrIntegration.createGrievance(
                                serviceReqRequest, bearerToken, userResponse);

                        if (grievanceApiResponse != null && grievanceApiResponse.contains("Grievance_id")) {
                            entryResult.put("status", "SUCCESS");
                            entryResult.put("dgrResponse", grievanceApiResponse);
                            successCount++;
                        } else {
                            entryResult.put("status", "FAILED");
                            entryResult.put("dgrResponse", grievanceApiResponse);
                            failedCount++;
                        }

                    } catch (Exception ex) {
                        log.error("Error processing failed topic record at offset {}: {}", record.offset(), ex.getMessage(), ex);
                        entryResult.put("status", "ERROR");
                        entryResult.put("error", ex.getMessage());
                        failedCount++;
                    }

                    results.add(entryResult);
                    processed++;
                }

                // Commit consumer offsets after each batch
                consumer.commitSync();
            }

        } catch (Exception e) {
            log.error("Exception in processFailedTopicRecords: {}", e.getMessage(), e);
            Map<String, Object> errSummary = new LinkedHashMap<>();
            errSummary.put("topic", failedDgrTopic);
            errSummary.put("error", e.getMessage());
            return errSummary;
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("topic", failedDgrTopic);
        summary.put("totalMessagesInTopic", totalMessagesInTopic);
        summary.put("processedCount", results.size());
        summary.put("successCount", successCount);
        summary.put("failedCount", failedCount);
        summary.put("results", results);
        return summary;
    }

    /**
     * API 2: Retry specific serviceRequestIds (passed as comma-separated or list).
     *
     * @param requestInfo       RequestInfo from caller
     * @param serviceRequestIds List of service request IDs to retry
     * @return Summary with totalRequested, successCount, failedCount, and results
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> retryByServiceRequestIds(
            RequestInfo requestInfo, List<String> serviceRequestIds) {

        List<Map<String, Object>> results = new ArrayList<>();
        int successCount = 0;
        int failedCount = 0;

        if (serviceRequestIds == null || serviceRequestIds.isEmpty()) {
            Map<String, Object> emptySummary = new LinkedHashMap<>();
            emptySummary.put("totalRequested", 0);
            emptySummary.put("successCount", 0);
            emptySummary.put("failedCount", 0);
            emptySummary.put("results", results);
            return emptySummary;
        }

        // Generate token once
        String bearerToken = dgrIntegration.generateLoginToken();
        if (bearerToken == null || bearerToken.trim().isEmpty()
                || "Invalid credentials!".equalsIgnoreCase(bearerToken.trim())) {
            log.error("Failed to generate DGR token for retry-by-ids.");
            Map<String, Object> errSummary = new LinkedHashMap<>();
            errSummary.put("totalRequested", serviceRequestIds.size());
            errSummary.put("error", "Failed to generate DGR token");
            return errSummary;
        }

        for (String rawId : serviceRequestIds) {
            if (rawId == null || rawId.trim().isEmpty()) continue;
            String serviceRequestId = rawId.trim();

            Map<String, Object> entryResult = new HashMap<>();
            entryResult.put("serviceRequestId", serviceRequestId);

            try {
                log.info("Retrying serviceRequestId={}", serviceRequestId);

                // Fetch the service request details using plain search
                ServiceReqSearchCriteria criteria = ServiceReqSearchCriteria.builder()
                        .serviceRequestId(Collections.singletonList(serviceRequestId))
                        .active(true)
                        .build();

                Object searchResponse = grievanceService.getServiceRequestDetailsForPlainSearch(
                        requestInfo, criteria);

                ServiceResponse serviceResponse = mapper.convertValue(searchResponse, ServiceResponse.class);

                if (serviceResponse == null
                        || serviceResponse.getServices() == null
                        || serviceResponse.getServices().isEmpty()) {
                    log.warn("Service request [{}] not found in DB.", serviceRequestId);
                    entryResult.put("status", "FAILED");
                    entryResult.put("error", "Service request not found in DB");
                    failedCount++;
                    results.add(entryResult);
                    continue;
                }

                String tenantId = serviceResponse.getServices().get(0).getTenantId();
                String accountId = serviceResponse.getServices().get(0).getAccountId();
                entryResult.put("tenantId", tenantId);

                // Build ServiceRequest
                ServiceRequest serviceReqRequest = new ServiceRequest();
                serviceReqRequest.setRequestInfo(requestInfo);
                serviceReqRequest.setServices(serviceResponse.getServices());

                if (serviceResponse.getActionHistory() != null
                        && !serviceResponse.getActionHistory().isEmpty()
                        && serviceResponse.getActionHistory().get(0).getActions() != null
                        && !serviceResponse.getActionHistory().get(0).getActions().isEmpty()) {
                    serviceReqRequest.setActionInfo(serviceResponse.getActionHistory().get(0).getActions());
                }

                // Fetch user
                UserResponse userResponse = null;
                try {
                    if (accountId != null && !accountId.trim().isEmpty()) {
                        Long userId = Long.valueOf(accountId.trim());
                        String userTenantId = tenantId.contains(".") ? tenantId.split("\\.")[0] : tenantId;
                        userResponse = grievanceService.getUsers(
                                requestInfo, userTenantId, Collections.singletonList(userId));
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch user for serviceRequestId={}: {}", serviceRequestId, e.getMessage());
                }

                // Call CreateGrievance
                String grievanceApiResponse = dgrIntegration.createGrievance(
                        serviceReqRequest, bearerToken, userResponse);

                if (grievanceApiResponse != null && grievanceApiResponse.contains("Grievance_id")) {
                    entryResult.put("status", "SUCCESS");
                    entryResult.put("dgrResponse", grievanceApiResponse);
                    successCount++;
                } else {
                    entryResult.put("status", "FAILED");
                    entryResult.put("dgrResponse", grievanceApiResponse);
                    failedCount++;
                }

            } catch (Exception e) {
                log.error("Exception retrying serviceRequestId={}: {}", serviceRequestId, e.getMessage(), e);
                entryResult.put("status", "ERROR");
                entryResult.put("error", e.getMessage());
                failedCount++;
            }

            results.add(entryResult);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRequested", serviceRequestIds.size());
        summary.put("successCount", successCount);
        summary.put("failedCount", failedCount);
        summary.put("results", results);
        return summary;
    }

    /**
     * Helper to inspect topic status / message count.
     */
    public Map<String, Object> getFailedTopicStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("topic", failedDgrTopic);

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "dgr-topic-status-checker");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            List<PartitionInfo> partitionInfos = consumer.partitionsFor(failedDgrTopic);
            if (partitionInfos == null || partitionInfos.isEmpty()) {
                status.put("status", "TOPIC_NOT_FOUND");
                status.put("totalMessages", 0);
                return status;
            }

            List<TopicPartition> partitions = new ArrayList<>();
            for (PartitionInfo pi : partitionInfos) {
                partitions.add(new TopicPartition(pi.topic(), pi.partition()));
            }

            Map<TopicPartition, Long> endOffsets = consumer.endOffsets(partitions);
            Map<TopicPartition, Long> beginningOffsets = consumer.beginningOffsets(partitions);
            long total = 0;
            for (TopicPartition tp : partitions) {
                long start = beginningOffsets.getOrDefault(tp, 0L);
                long end = endOffsets.getOrDefault(tp, 0L);
                total += Math.max(0, end - start);
            }

            status.put("status", "ACTIVE");
            status.put("partitions", partitions.size());
            status.put("totalMessages", total);
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("error", e.getMessage());
        }

        return status;
    }
}
