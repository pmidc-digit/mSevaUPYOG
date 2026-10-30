package org.egov.garbagecollection.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.garbagecollection.service.DiffService;
import org.egov.garbagecollection.service.GcServiceImpl;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.util.EncryptionDecryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class EditWorkFlowNotificationConsumer {
	
	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private GcServiceImpl gcServiceImpl;
	
	@Autowired
	private DiffService diffService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;

	/**
	 * Consumes the water connection record and send the edit notification
	 * 
	 * @param record Received Topic Record
	 * @param topic Name of the Topic
	 */
	@KafkaListener(topics = { "${gc.editnotification.topic}"}, concurrency = "${kafka.consumer.config.concurrency.count}")
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		try {
			GarbageConnectionRequest garbageConnectionRequest = mapper.convertValue(record, GarbageConnectionRequest.class);
			/*
			 * WaterConnection waterConnection =
			 * garbageConnectionRequest.getWaterConnection(); SearchCriteria criteria =
			 * SearchCriteria.builder().applicationNumber(Collections.singleton(
			 * waterConnection.getApplicationNo()))
			 * .tenantId(garbageConnectionRequest.getWaterConnection().getTenantId()).
			 * isInternalCall(Boolean.TRUE).build();
			 *
			 * List<WaterConnection> waterConnections = waterServiceImpl.search(criteria,
			 * garbageConnectionRequest.getRequestInfo());
			 *
			* WaterConnection searchResult = waterConnections.get(0); */
			Map <String , String> adddetails=(Map<String, String>) garbageConnectionRequest.getGarbageConnection().getAdditionalDetails();
			if (!garbageConnectionRequest.isOldDataEncryptionRequest() && !adddetails.containsKey("meterMakeentry"))
				diffService.checkDifferenceAndSendEditNotification(garbageConnectionRequest);
		}
		catch (Exception ex) {
			StringBuilder builder = new StringBuilder("Error while listening to value: ").append(record)
					.append("on topic: ").append(topic);
			log.error(builder.toString(), ex);
		}
	}

}
