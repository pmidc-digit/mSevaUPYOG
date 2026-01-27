package org.egov.pt.consumer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.pt.config.PropertyConfiguration; // Corrected Import
import org.egov.pt.models.Assessment;
import org.egov.pt.producer.PropertyProducer;
import org.egov.pt.service.AssessmentService;
import org.egov.pt.web.contracts.AssessmentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AssessmentSchedulerConsumer {

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private PropertyConfiguration configs; // Corrected Class Type
    
    @Autowired
	private PropertyProducer producer;


    @KafkaListener(
        topics = "${kafka.topics.assessment.save.service}"
    )
    public void listen(List<List<HashMap<String, Object>>> recordBatches,  @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        log.info("Received batch size: {}", recordBatches.size());

        for (List<HashMap<String, Object>> innerList : recordBatches) {
            
            for (HashMap<String, Object> map : innerList) {
                
                AssessmentRequest assessmentReq = null;
                
                try {
                    // 1. Convert the Map to the Request Object
                    assessmentReq = mapper.convertValue(map, AssessmentRequest.class);
                    
                    if (assessmentReq == null || assessmentReq.getAssessment() == null) {
                        log.error("Empty assessment request received in map: {}", map);
                        continue;
                    }

                    Assessment response = assessmentService.createAssessment(assessmentReq);

                    // 4. Record Success
                    if (response != null ) {
                    	Map<String, Object> successEvent = new HashMap<>();
                    	successEvent.put("assessment", assessmentReq.getAssessment());
                    	successEvent.put("tenantId", assessmentReq.getAssessment().getTenantId());
                    	successEvent.put("status", "SUCCESS");
                    	successEvent.put("timestamp", System.currentTimeMillis());
                    	String key = response.getAssessmentNumber();
                		producer.push(configs.getAssessmentPerisiterTopic(), key, successEvent);


                    }

                } catch (Exception e) {
                    log.error("Failed to process assessment request", e);
                    
                    Map<String, Object> failureEvent = new HashMap<>();
                    String tenantId = null;
                    String assessmentNumber = "UNKNOWN";

                    if (assessmentReq != null && assessmentReq.getAssessment() != null) {
                        tenantId = assessmentReq.getAssessment().getTenantId();
                        assessmentNumber = assessmentReq.getAssessment().getAssessmentNumber();
                        failureEvent.put("assessment", assessmentReq.getAssessment());
                    } else {
                        // Put a dummy assessment object or handle null in YAML
                        failureEvent.put("assessment", new HashMap<>()); 
                    }

                    failureEvent.put("tenantId", tenantId);
                    failureEvent.put("status", "FAILURE");
                    failureEvent.put("error", e.getMessage());
                    failureEvent.put("timestamp", System.currentTimeMillis());

                    // Use the safe assessmentNumber or a generic key
                    producer.push(configs.getAssessmentPerisiterTopic(), assessmentNumber, failureEvent);
                }
                }
        }
    }
}