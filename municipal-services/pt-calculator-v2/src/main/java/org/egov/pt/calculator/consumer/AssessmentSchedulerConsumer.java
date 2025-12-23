package org.egov.pt.calculator.consumer;

import java.util.HashMap;
import java.util.List;

import org.egov.pt.calculator.repository.AssessmentRepository;
import org.egov.pt.calculator.util.Configurations;
import org.egov.pt.calculator.web.models.Assessment;
import org.egov.pt.calculator.web.models.AssessmentRequest;
import org.egov.pt.calculator.web.models.AssessmentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
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
    private AssessmentRepository repository;

    @Autowired
    private Configurations configs;

    /**
     * Kafka payload format:
     * [
     *   [
     *     { AssessmentRequest }
     *   ]
     * ]
     */
    @KafkaListener(
    	    topics = "${kafka.topics.assessment.save.service}",
    	    groupId = "rainmaker-pt-calculator-group"
    	)
    	public void listen(
    	        org.apache.kafka.clients.consumer.ConsumerRecord<String, List<HashMap<String, Object>>> record
    	) {

    	    String key = record.key();
    	    List<HashMap<String, Object>> batch = record.value();

    	    log.info("Assessment Scheduler Consumer | key={} | batchSize={}", key, batch.size());

    	    for (HashMap<String, Object> payload : batch) {

    	        Assessment assessment = null;

    	        try {
    	            AssessmentRequest assessmentReq =
    	                    mapper.convertValue(payload, AssessmentRequest.class);

    	            assessment = assessmentReq.getAssessment();

    	            String url = configs.getAssessmentServiceHost()
    	                    + configs.getAssessmentCreateEndpoint();

    	            AssessmentResponse response = restTemplate.postForObject(
    	                    url,
    	                    new HttpEntity<>(assessmentReq),
    	                    AssessmentResponse.class
    	            );

    	            Assessment createdAssessment = response.getAssessments().get(0);

    	            repository.saveAssessmentGenerationDetails(
    	                    createdAssessment,
    	                    "SUCCESS",
    	                    "Assessment",
    	                    null
    	            );

    	            log.info("Assessment created | propertyId={}",
    	                    createdAssessment.getPropertyId());

    	        } catch (HttpClientErrorException e) {

    	            repository.saveAssessmentGenerationDetails(
    	                    assessment,
    	                    "FAILED",
    	                    "Assessment",
    	                    e.getResponseBodyAsString()
    	            );

    	        } catch (Exception e) {

    	            repository.saveAssessmentGenerationDetails(
    	                    assessment,
    	                    "FAILED",
    	                    "Assessment",
    	                    e.toString()
    	            );
    	        }
    	    }
    	}
}