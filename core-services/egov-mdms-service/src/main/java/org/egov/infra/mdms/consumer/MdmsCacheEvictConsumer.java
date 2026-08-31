package org.egov.infra.mdms.consumer;

import java.util.Map;

import org.egov.infra.mdms.service.MdmsCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class MdmsCacheEvictConsumer {
	
	
	private MdmsCacheService mdmsCacheService;

	@Autowired
	public MdmsCacheEvictConsumer(MdmsCacheService mdmsCacheService) {
		this.mdmsCacheService = mdmsCacheService;
	}
	
	
	@KafkaListener(topics = "${egov.mdms.data.update.topic}", groupId = "${egov.mdms.cache.consumer.group}")
	public void consumeMdmsUpdateCacheListener(Map<String, Object> message) {
		 mdmsCacheService.updateCache(message);
	}
	
	@KafkaListener(topics = "${egov.mdms.data.save.topic}", groupId = "${egov.mdms.cache.consumer.group}")
	public void consumeMdmsCreateCacheListener(Map<String, Object> message) {
		 mdmsCacheService.updateCache(message);
	}

}
