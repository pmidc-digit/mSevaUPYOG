package org.egov.bpa.consumer;

import java.util.HashMap;

import org.egov.bpa.service.notification.BPANotificationService;
import org.egov.bpa.util.BPAConstants;
import org.egov.bpa.web.model.BPARequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class BPAConsumer {

	@Autowired
	private BPANotificationService notificationService;
	
	@KafkaListener(
			topics = {
					"${persister.update.buildingplan.topic}",
					"${persister.save.buildingplan.topic}",
					"${kafka.consumer.config.concurrency.count}"
			},
			concurrency = "${kafka.consumer.config.concurrency.count}",
			groupId = "${spring.kafka.consumer.group-id}"
	)

	public void listen(final String rawRecord) {
		ObjectMapper mapper = new ObjectMapper();
		BPARequest bpaRequest = new BPARequest();
		try {
			log.debug("Consuming record: " + rawRecord);
			bpaRequest = mapper.convertValue(rawRecord, BPARequest.class);
		} catch (final Exception e) {
			log.error("Error while listening to value: " + rawRecord  + ": " + e);
		}
		log.info("BPA Received: " + bpaRequest.getBPA().getApplicationNo());
		if(!bpaRequest.getBPA().getWorkflow().getAction().equalsIgnoreCase(BPAConstants.ACTION_PAY))
			notificationService.process(bpaRequest, rawRecord);
	}
}
