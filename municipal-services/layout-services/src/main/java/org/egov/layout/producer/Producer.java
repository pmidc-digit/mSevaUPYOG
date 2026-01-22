package org.egov.layout.producer;

import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Producer {

	@Autowired
	private CustomKafkaTemplate<String, Object> kafkaTemplate;

	public void push(String topic,String Key, Object value) {
		kafkaTemplate.send(topic,Key, value);
	}
}
