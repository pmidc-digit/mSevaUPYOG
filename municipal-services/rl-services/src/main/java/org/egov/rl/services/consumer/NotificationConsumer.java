package org.egov.rl.services.consumer;

import java.util.HashMap;

import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.kafka.support.KafkaHeaders;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationConsumer {

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private ObjectMapper mapper;

	@KafkaListener(topics = { "${save.rl.allotment}", "${update.rl.allotment}" },concurrency = "${kafka.consumer.config.concurrency.count}")
	public void listen(final String record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

		AllotmentRequest allotmentRequest = new AllotmentRequest();
		try {

			log.debug("Consuming record in RL for notification: " + record.toString());
			allotmentRequest = mapper.readValue(record, AllotmentRequest.class);
		} catch (final Exception e) {

			log.error("Error while listening to value: " + record + " on topic: " + topic + ": " + e);
		}

		log.info("RL Application Received: " + allotmentRequest.getAllotment().get(0).getApplicationNumber());
		
		notificationService.process(allotmentRequest);
	}

}
