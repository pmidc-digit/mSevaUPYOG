package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.SurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class ScorecardSurveyService {
    @Autowired
    private ScorecardSurveyValidator surveyValidator;

    @Autowired
    private Producer producer;

    @Autowired
    private EnrichmentService enrichmentService;

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private ScorecardSurveyUtil surveyUtil;

    @Autowired
    private ApplicationProperties applicationProperties;
    /**
     * Creates the survey based on the request object and pushes to Save Survey Topic
     * @param surveyRequest Request object containing details of survey
     */
    public ScorecardSurveyEntity createSurvey(ScorecardSurveyRequest surveyRequest) {
        ScorecardSurveyEntity surveyEntity = surveyRequest.getSurveyEntity();

        // Validate user type
        surveyValidator.validateUserType(surveyRequest.getRequestInfo());

        // Validate questions and sections
        surveyValidator.validateQuestionsAndSections(surveyEntity);

        // Persist survey if it passes all validations
        System.out.println("surveyEntity: " + surveyEntity);
//        List<String> listOfTenantIds = new ArrayList<>(surveyEntity.getTenantIds());
        String tenantId = surveyEntity.getTenantId();
//        Integer countOfSurveyEntities = listOfTenantIds.size();
        Integer countOfSurveyEntities = 1;
        List<String> listOfSurveyIds = surveyUtil.getIdList(surveyRequest.getRequestInfo(), tenantId, "ss.surveyid", "SY-[cy:yyyy-MM-dd]-[SEQ_EG_DOC_ID]", countOfSurveyEntities);
        log.info(listOfSurveyIds.toString());
        
        surveyEntity.setUuid(listOfSurveyIds.get(0));
        surveyEntity.setTenantId(tenantId);
        // Enrich survey entity
        enrichmentService.enrichScorecardSurveyEntity(surveyRequest);
        log.info(surveyRequest.getSurveyEntity().toString());
        System.out.println(surveyRequest.getSurveyEntity().toString());
        producer.push(applicationProperties.getCreateScorecardSurveyTopic(), surveyRequest);

//        for (int i = 0; i < countOfSurveyEntities; i++) {
//            surveyEntity.setUuid(listOfSurveyIds.get(i));
////            surveyEntity.setTenantId(listOfTenantIds.get(i));
//            surveyEntity.setTenantId(tenantId);
//
//            // Enrich survey entity
//            enrichmentService.enrichScorecardSurveyEntity(surveyRequest);
//
//            log.info(surveyRequest.getSurveyEntity().toString());
//            System.out.println(surveyRequest.getSurveyEntity().toString());
//            producer.push(applicationProperties.getCreateScorecardSurveyTopic(), surveyRequest);
//        }

        return surveyEntity;
    }
}