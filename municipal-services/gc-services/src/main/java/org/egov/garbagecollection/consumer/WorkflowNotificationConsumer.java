package org.egov.garbagecollection.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.Role;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.service.GcService;
import org.egov.garbagecollection.service.GcServiceImpl;
import org.egov.garbagecollection.service.WorkflowNotificationService;
import org.egov.garbagecollection.util.EncryptionDecryptionUtil;
import org.egov.garbagecollection.web.models.OwnerInfo;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

import static org.egov.garbagecollection.constants.GCConstants.*;

@Service
@Slf4j
public class WorkflowNotificationConsumer {
	
	@Autowired
	WorkflowNotificationService workflowNotificationService;

	@Autowired
	GcService gcService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private GcServiceImpl gcServiceImpl;

	/**
	 * Consumes the water connection record and send notification
	 * 
	 * @param record
	 * @param topic
	 */
	@KafkaListener(topics = { "${egov.garbageservice.creategarbageconnection.topic}" ,"${egov.garbageservice.updategarbageconnection.topic}", "${egov.garbageservice.updategarbageconnection.workflow.topic}"}, concurrency = "${kafka.consumer.config.concurrency.count}")
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		log.info("Record received in update Water connectuion is"+ record);
		try {
			GarbageConnectionRequest garbageConnectionRequest = mapper.convertValue(record, GarbageConnectionRequest.class);
			GarbageConnection garbageConnection = garbageConnectionRequest.getGarbageConnection();
			String applicationStatus = garbageConnection.getApplicationStatus();
			if (!GCConstants.NOTIFICATION_ENABLE_FOR_STATUS.contains(garbageConnection.getProcessInstance().getAction() + "_" + applicationStatus)) {
				log.info("Notification Disabled For State :" + garbageConnection.getProcessInstance().getAction() + "_" + applicationStatus);
				return;
			}
			List<Role> roles = garbageConnectionRequest.getRequestInfo().getUserInfo().getRoles();
			boolean isCitizenRole = false;
			for(Role role : roles){
				if(role.getCode().equals(CITIZEN_ROLE_CODE)) {
					isCitizenRole = true;
				}
			}
			if(!isCitizenRole) {
				garbageConnection.setConnectionHolders(encryptionDecryptionUtil.decryptObject(garbageConnection.getConnectionHolders(),
						WNS_OWNER_PLAIN_DECRYPTION_MODEL, OwnerInfo.class, garbageConnectionRequest.getRequestInfo()));
				//garbageConnectionRequest.setWaterConnection(encryptionDecryptionUtil.decryptObject(garbageConnection,
					//	WNS_PLUMBER_PLAIN_DECRYPTION_MODEL, WaterConnection.class, garbageConnectionRequest.getRequestInfo()));
			}
			log.info("garbageConnectionRequest is "+ garbageConnectionRequest);

			//if (!garbageConnectionRequest.isOldDataEncryptionRequest())
				workflowNotificationService.process(garbageConnectionRequest, topic);
		} catch (Exception ex) {
			StringBuilder builder = new StringBuilder("Error while listening to value: ").append(record)
					.append("on topic: ").append(topic).append(". Exception :").append(ex.getMessage());
			log.error(builder.toString(), ex);
		}
	}

}
