package org.egov.pt.calculator.consumer;

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
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AssessmentSchedulerConsumer {

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
    public void listen(List<AssessmentRequest> batch) {

        log.info("Assessment Scheduler Consumer | Received batch size={}", batch.size());

        for (AssessmentRequest assessmentReq : batch) {

            Assessment assessment = assessmentReq.getAssessment();

            try {
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

                log.info("Assessment created successfully | propertyId={}",
                        createdAssessment.getPropertyId());

            } catch (Exception e) {

                repository.saveAssessmentGenerationDetails(
                        assessment,
                        "FAILED",
                        "Assessment",
                        e.toString()
                );

                log.error("Assessment creation failed | propertyId={} | error={}",
                        assessment != null ? assessment.getPropertyId() : "N/A",
                        e.getMessage());
            }
        }
    }
}
