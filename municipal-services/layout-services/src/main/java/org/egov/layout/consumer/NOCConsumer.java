package org.egov.layout.consumer;

import java.util.HashMap;

import org.egov.layout.service.notification.NOCNotificationService;
import org.egov.layout.web.model.LayoutRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
@Slf4j
@Component
public class NOCConsumer {

	@Autowired
	private NOCNotificationService notificationService;
	
	@KafkaListener(topics = { "${persister.save.layout.topic}", "${persister.update.layout.topic}",
			"${persister.update.layout.workflow.topic}" })
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		ObjectMapper mapper = new ObjectMapper();
		LayoutRequest nocRequest = new LayoutRequest();
		try {
			log.debug("Consuming record: " + record);
			nocRequest = mapper.convertValue(record, LayoutRequest.class);
		} catch (final Exception e) {
			log.error("Error while listening to value: " + record + " on topic: " + topic + ": " + e);
		}
		log.debug("BPA Received: " + nocRequest.getLayout().getApplicationNo());
		notificationService.process(nocRequest);
	}
}
