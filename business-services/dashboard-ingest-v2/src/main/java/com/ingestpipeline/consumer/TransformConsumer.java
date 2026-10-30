package com.ingestpipeline.consumer;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import com.ingestpipeline.model.ErrorWrapper;
import com.ingestpipeline.producer.IngestProducer;
import com.ingestpipeline.service.TransformService;
import com.ingestpipeline.util.ApplicationProperties;
import com.ingestpipeline.util.Constants;

@Service
public class TransformConsumer implements KafkaConsumer {

	public static final Logger LOGGER = LoggerFactory.getLogger(TransformConsumer.class);
	public static final String INTENT = "transform";

	@Autowired
	@Qualifier(Constants.Qualifiers.TRANSFORM_COLLECTION_SERVICE)
	private TransformService collectiontransformService;

	@Autowired
	@Qualifier(Constants.Qualifiers.TRANSFORM_SERVICE)
	private TransformService defaulttransformService;

	@Autowired
	private IngestProducer ingestProducer;
	
	@Autowired
	private ApplicationProperties applicationProperties; 

	@Value("${kafka.topics.dlq:" + Constants.KafkaTopics.DLQ_TOPIC + "}")
	private String dlqTopic;

	@Override
	@KafkaListener(id = INTENT, groupId = INTENT, topics = { Constants.KafkaTopics.VALID_DATA }, containerFactory = Constants.BeanContainerFactory.INCOMING_KAFKA_LISTENER)
	public void processMessage(Map incomingData,
							   @Header(KafkaHeaders.RECEIVED_TOPIC) final String topic) {
		LOGGER.info("##KafkaMessageAlert## : key:" + topic + ":" + "value:" + incomingData.size());
		try {
			boolean isTransformed = false;
			String dataContext = incomingData.get(Constants.DATA_CONTEXT) != null ? incomingData.get(Constants.DATA_CONTEXT).toString() : "";
			if (dataContext.equals(Constants.TransformationType.COLLECTION)) {
				isTransformed = collectiontransformService.transformData(incomingData);
			} else {
				isTransformed = defaulttransformService.transformData(incomingData);
			}
			if (isTransformed) {
				ingestProducer.pushToPipeline(incomingData, applicationProperties.getTransactionTransformationTopic(), null);
			} else {
				LOGGER.error("Transformation returned false for incomingData on context: {}", dataContext);
				ErrorWrapper error = new ErrorWrapper("TRANSFORM", "TRANSFORMATION_FAILED", "Transformation returned false", incomingData);
				ingestProducer.pushToPipeline(error, dlqTopic, null);
			}
		} catch (final Exception e) {
			LOGGER.error("Exception Encountered while processing the received message : " + e.getMessage(), e);
			try {
				ErrorWrapper error = new ErrorWrapper("TRANSFORM", "PROCESSING_EXCEPTION", e.getMessage(), incomingData);
				ingestProducer.pushToPipeline(error, dlqTopic, null);
			} catch (final Exception ex) {
				LOGGER.error("Failed to push to DLQ topic : " + ex.getMessage(), ex);
			}
		}
	}
}
