package org.egov.infra.indexer.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.egov.infra.indexer.service.IndexerService;
import org.egov.infra.indexer.service.IndexerException;
import org.egov.tracer.kafka.ErrorQueueProducer;
import org.egov.tracer.model.ErrorQueueContract;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.stereotype.Service;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CoreIndexMessageListener implements MessageListener<String, String> {

	private static final String CORRELATION_ID_MDC_STRING = "CORRELATION_ID";
	private static final String TENANTID_MDC_STRING = "TENANTID";

	@Autowired
	private IndexerService indexerService;

	@Autowired
	private ErrorQueueProducer errorQueueProducer;

	@Value("${tracer.errorsTopic}")
	private String errorTopic;

	@Value("${tracer.errorsPublish}")
	private boolean publishErrors;

	@Value("${egov.statelevel.tenantId}")
	private String stateLevelTenantId;

	@Override
	/**
	 * Messages listener which acts as consumer. This message listener is injected
	 * inside a kafkaContainer. This consumer is a start point to the following
	 * index jobs: 1. Re-index 2. Legacy Index 3. PGR custom index 4. PT custom
	 * index 5. Core indexing
	 */
	public void onMessage(ConsumerRecord<String, String> data) {
		log.info("Topic from CoreIndexMessageListener: " + data.topic());
		
		// Extract correlation ID from message body
		String correlationId = extractCorrelationId(data.value());
		if (correlationId != null) {
			MDC.put(CORRELATION_ID_MDC_STRING, correlationId);
		}
		
		// Adding in MDC so that tracer can add it in header
		MDC.put(TENANTID_MDC_STRING, stateLevelTenantId);
		
		try {
			indexerService.esIndexer(data.topic(), data.value());
		} catch (Exception e) {
			log.error("error while indexing: ", e);
			
			// Send directly to DLQ using tracer's ErrorQueueProducer
			if (publishErrors) {
				try {
					// Extract actual index names from IndexerException if available
					String targetIndexNames = "unknown";
					if (e instanceof IndexerException) {
						IndexerException indexerEx = (IndexerException) e;
						targetIndexNames = indexerEx.getTargetIndexNames();
					}
					
					String source = "egov-indexer -> " + targetIndexNames;
					
					log.info("DLQ Debug - Topic: {}, TargetIndexes: {}, Source: {}", data.topic(), targetIndexNames, source);
					sendToDLQ(data.value(), e, correlationId, source);
					log.info("Successfully sent failed message to DLQ topic: {} for indexes: {}", errorTopic, targetIndexNames);
					// Don't re-throw - message has been handled and sent to DLQ
					return;
				} catch (Exception dlqException) {
					log.error("Failed to send message to DLQ: ", dlqException);
					// Fall back to re-throwing if DLQ fails
				}
			}
			
			throw new RuntimeException("Failed to index message - routing to DLQ", e); // Re-throw as fallback
		}
	}

	/**
	 * Send failed message to DLQ using tracer's ErrorQueueProducer
	 */
	private void sendToDLQ(String messageBody, Exception exception, String correlationId, String enhancedSource) {
		try {
			// Create ErrorQueueContract using the correct field names from tracer library
			StackTraceElement[] elements = exception.getStackTrace();
			
			ErrorQueueContract errorContract = ErrorQueueContract.builder()
					.id(UUID.randomUUID().toString())
					.correlationId(correlationId)
					.body(messageBody)
					.source(enhancedSource)
					.ts(new Date().getTime())
					.exception(Arrays.asList(elements))
					.message(exception.getMessage())
					.build();
			
			// Send to DLQ using tracer's ErrorQueueProducer
			errorQueueProducer.sendMessage(errorContract);
		} catch (Exception e) {
			log.error("Failed to create or send ErrorQueueContract to DLQ", e);
			throw e;
		}
	}

	/**
	 * Extract correlation ID from Kafka message body
	 */
	private String extractCorrelationId(String messageBody) {
		try {
			// Try to extract correlation ID from RequestInfo
			return JsonPath.read(messageBody, "$.RequestInfo.correlationId");
		} catch (Exception e) {
			try {
				// Fallback: try to extract from different path
				return JsonPath.read(messageBody, "$.correlationId");
			} catch (Exception ex) {
				log.debug("Could not extract correlation ID from message: {}", ex.getMessage());
				return null;
			}
		}
	}


}
