package com.ingestpipeline.consumer;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import com.ingestpipeline.model.ErrorWrapper;
import com.ingestpipeline.model.IncomingData;
import com.ingestpipeline.producer.IngestProducer;
import com.ingestpipeline.service.IngestService;
import com.ingestpipeline.util.Constants;

@Service
public class IngestConsumer {
	public static final Logger LOGGER = LoggerFactory.getLogger(IngestConsumer.class);
	
	@Autowired
	private IngestService ingestService;

	@Autowired
	private IngestProducer ingestProducer;

	@Value("${kafka.topics.dlq:" + Constants.KafkaTopics.DLQ_TOPIC + "}")
	private String dlqTopic;
	
	@KafkaListener(topics = { "${kafka.topics.incoming.collection}" }, containerFactory = Constants.BeanContainerFactory.INCOMING_KAFKA_LISTENER)
	public void processMessage(Map data,
							   @Header(KafkaHeaders.RECEIVED_TOPIC) final String topic) {
		LOGGER.info("##KafkaMessageAlert## : key:" + topic + ":" + "value:" + data.size());
		try {
			LOGGER.info("IngestConsumer ## get data ## " + data + " ## TOPIC ## " + topic);
			IncomingData incomingData = ingestService.getContextForIncomingTopic(topic);
			incomingData.setDataObject(data.get("Data"));
			ingestService.ingestToPipeline(incomingData);
		} catch (final Exception e) {
			LOGGER.error("Exception Encountered while processing the received message : " + e.getMessage(), e);
			try {
				ErrorWrapper error = new ErrorWrapper("INGEST_CONSUMER", "INGEST_ERROR", e.getMessage(), data);
				ingestProducer.pushToPipeline(error, dlqTopic, null);
			} catch (final Exception ex) {
				LOGGER.error("Failed to push to DLQ topic : " + ex.getMessage(), ex);
			}
		}
	}
}
