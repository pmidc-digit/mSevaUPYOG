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
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
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

    @KafkaListener(
        topics = "${kafka.topics.assessment.save.service}",
        groupId = "rainmaker-pt-calculator-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void listen(List<List<HashMap<String, Object>>> recordBatches) {

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

                    // 2. Prepare the API Call
                    String url = configs.getAssessmentServiceHost() + configs.getAssessmentCreateEndpoint();
                    
                    log.info("Processing assessment for property: {}", assessmentReq.getAssessment().getPropertyId());

                    // 3. Hit the synchronous Assessment Service
                    AssessmentResponse response = restTemplate.postForObject(
                            url,
                            new HttpEntity<>(assessmentReq),
                            AssessmentResponse.class
                    );

                    // 4. Record Success
                    if (response != null && !response.getAssessments().isEmpty()) {
                        Assessment createdAssessment = response.getAssessments().get(0);
                        repository.saveAssessmentGenerationDetails(
                                createdAssessment,
                                "SUCCESS",
                                "Assessment",
                                null
                        );
                    }

                } catch (Exception e) {
                    log.error("Failed to process assessment request", e);
                    
                    // Attempt to record failure if the object was at least partially parsed
                    if (assessmentReq != null && assessmentReq.getAssessment() != null) {
                        repository.saveAssessmentGenerationDetails(
                                assessmentReq.getAssessment(),
                                "FAILED",
                                "Assessment",
                                e.getMessage()
                        );
                    }
                }
            }
        }
    }
}