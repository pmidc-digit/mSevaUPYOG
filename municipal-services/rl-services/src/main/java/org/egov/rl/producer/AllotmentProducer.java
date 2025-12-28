
package org.egov.rl.producer;

import java.util.Arrays;

import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.util.RLConstants;
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
		kafkaTemplate.send(topic, value);
	}

	public void pushAfterEncrytpion(String topic, AllotmentRequest request) {
		request.setAllotment(Arrays.asList(encryptionDecryptionUtil.encryptObject(request.getAllotment().get(0), RLConstants.RL_ALLOTMENT_MODEL, AllotmentDetails.class)));
		push(topic, request);
	}
}
