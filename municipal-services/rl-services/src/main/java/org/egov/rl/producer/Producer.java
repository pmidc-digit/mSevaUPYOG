
package org.egov.rl.producer;

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
public class Producer {

	@Autowired
	private CustomKafkaTemplate<String, Object> kafkaTemplate;

	@Autowired
	private EncryptionDecryptionUtil encryptionDecryptionUtil;
	
	public void push(String topic, Object value) {
		kafkaTemplate.send(topic, value);
	}

	public void pushAfterEncrytpion(String topic, AllotmentRequest request) {
		request.setAllotment(encryptionDecryptionUtil.encryptObject(request.getAllotment(), RLConstants.PROPERTY_MODEL, AllotmentDetails.class));
		push(topic, request);
	}
}
