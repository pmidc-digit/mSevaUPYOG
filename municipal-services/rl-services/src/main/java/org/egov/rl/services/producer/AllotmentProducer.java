
package org.egov.rl.services.producer;

import java.util.Arrays;
import java.util.UUID;

import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.util.EncryptionDecryptionUtil;
import org.egov.rl.services.util.RLConstants;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AllotmentProducer {

	@Autowired
	private CustomKafkaTemplate<String, Object> kafkaTemplate;

	@Autowired
	private EncryptionDecryptionUtil encryptionDecryptionUtil;

	public void push(String topic, Object value) {
		addedKeyPush(topic, value);
	}

	public void addedKeyPush(String topic, Object value) {
		String key = UUID.randomUUID().toString();
		kafkaTemplate.send(topic, key, value);
	}

	public void pushAfterEncrytpion(String topic, AllotmentRequest request) {
		request.setAllotment(Arrays.asList(encryptionDecryptionUtil.encryptObject(request.getAllotment().get(0),
				RLConstants.RL_ALLOTMENT_MODEL, AllotmentDetails.class)));
		push(topic, request);
	}
}
