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
        groupId = "rainmaker-pt-calculator-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void listen(List<List<HashMap<String, Object>>> records) {

        log.info("Assessment Scheduler Consumer | outerBatchSize={}", records.size());

        for (List<HashMap<String, Object>> innerBatch : records) {

            for (HashMap<String, Object> record : innerBatch) {

                Assessment assessment = null;

                try {
                    AssessmentRequest assessmentReq =
                            mapper.convertValue(record, AssessmentRequest.class);

                    assessment = assessmentReq.getAssessment();

                    String url = configs.getAssessmentServiceHost()
                            + configs.getAssessmentCreateEndpoint();

                    AssessmentResponse response = restTemplate.postForObject(
                            url,
                            new HttpEntity<>(assessmentReq),
                            AssessmentResponse.class
                    );

                    Assessment createdAssessment =
                            response.getAssessments().get(0);

                    repository.saveAssessmentGenerationDetails(
                            createdAssessment,
                            "SUCCESS",
                            "Assessment",
                            null
                    );

                    log.info("Assessment created | propertyId={}",
                            createdAssessment.getPropertyId());

                } catch (HttpClientErrorException e) {

                    log.error("HTTP error | propertyId={}",
                            assessment != null ? assessment.getPropertyId() : "NA", e);

                    repository.saveAssessmentGenerationDetails(
                            assessment,
                            "FAILED",
                            "Assessment",
                            e.getResponseBodyAsString()
                    );

                } catch (Exception e) {

                    log.error("Unexpected error | propertyId={}",
                            assessment != null ? assessment.getPropertyId() : "NA", e);

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
}
