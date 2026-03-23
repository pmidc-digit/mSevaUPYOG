package org.egov.garbagecollection.consumer;

import java.util.HashMap;

import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.service.MeterReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MeterReadingConsumer {

	@Autowired
	private MeterReadingService meterReadingService;

	@Autowired
	private ObjectMapper mapper;

	/**
	 * Water connection object
	 * 
	 * @param record
	 * @param topic
	 */
	@KafkaListener(topics = { "${gc.meterreading.create.topic}" }, concurrency = "${kafka.consumer.config.concurrency.count}")
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		try {
			log.info("Received request to add Meter Reading on topic - " + topic);
			GarbageConnectionRequest garbageConnectionRequest = mapper.convertValue(record, GarbageConnectionRequest.class);
			if (!StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionType())
					&& GCConstants.METERED_CONNECTION
							.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				meterReadingService.process(garbageConnectionRequest, topic);
			}
		} catch (Exception ex) {
			StringBuilder builder = new StringBuilder("Error while listening to value: ").append(record)
					.append("on topic: ").append(topic);
			log.error(builder.toString(), ex);
		}
	}
}
