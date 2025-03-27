package org.egov.ndc.consumer;

import java.util.HashMap;

import org.egov.ndc.service.notification.NDCNotificationService;
import org.egov.ndc.web.model.NdcRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
@Slf4j
@Component
public class NDCConsumer {

	@Autowired
	private NDCNotificationService notificationService;
	
	@KafkaListener(topics = { "${persister.save.ndc.topic}", "${persister.update.ndc.topic}",
			"${persister.update.ndc.workflow.topic}" })
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		ObjectMapper mapper = new ObjectMapper();
		NdcRequest ndcRequest = new NdcRequest();
		try {
			log.debug("Consuming record: " + record);
			ndcRequest = mapper.convertValue(record, NdcRequest.class);
		} catch (final Exception e) {
			log.error("Error while listening to value: " + record + " on topic: " + topic + ": " + e);
		}
		log.debug("BPA Received: " + ndcRequest.getNdc().getApplicationNo());
		notificationService.process(ndcRequest);
	}
}
