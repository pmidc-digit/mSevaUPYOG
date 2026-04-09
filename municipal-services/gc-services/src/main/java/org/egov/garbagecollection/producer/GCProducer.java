package org.egov.garbagecollection.producer;

import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GCProducer {

	@Autowired
	private CustomKafkaTemplate<String, Object> kafkaTemplate;

	/**
	 * Pushes message to Kafka topic with key for better partitioning
	 * @param topic Kafka topic name
	 * @param key Partition key (e.g., tenantId, connectionNo)
	 * @param value Message payload
	 */
	public void push(String topic, String key, Object value) {
		log.info("Pushing message to topic: {} with key: {}", topic, key);
		kafkaTemplate.send(topic, key, value);
	}
}