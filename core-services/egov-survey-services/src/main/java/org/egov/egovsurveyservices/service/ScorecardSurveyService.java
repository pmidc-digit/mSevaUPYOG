package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.repository.SurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.SurveyEntity;
import org.egov.egovsurveyservices.web.models.SurveySearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.ACTIVE;
import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.INACTIVE;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    private ScorecardSurveyRepository surveyRepository;

    @Autowired
    private ScorecardSurveyUtil surveyUtil;

    @Autowired
    private ApplicationProperties applicationProperties;
    /**
     * Creates the survey based on the request object and pushes to Create Scorecard Survey Topic
     * @param surveyRequest Request object containing details of survey
     */
    public ScorecardSurveyEntity createSurvey(ScorecardSurveyRequest surveyRequest) {
        ScorecardSurveyEntity surveyEntity = surveyRequest.getSurveyEntity();

        surveyValidator.validateUserType(surveyRequest.getRequestInfo());
        surveyValidator.validateQuestionsAndSections(surveyEntity);
        
        if (surveyEntity.getSurveyTitle() == null || surveyEntity.getSurveyTitle().isEmpty()) {
            throw new IllegalArgumentException("Survey title is empty");
        }

        String tenantId = surveyEntity.getTenantId();
        List<String> listOfSurveyIds = surveyUtil.getIdList(surveyRequest.getRequestInfo(), tenantId, "ss.surveyid", "SY-[cy:yyyy-MM-dd]-[SEQ_EG_DOC_ID]", 1);
        log.info(listOfSurveyIds.toString());

        surveyEntity.setUuid(listOfSurveyIds.get(0));      
        surveyEntity.setTenantId(tenantId);
        
        enrichmentService.enrichScorecardSurveyEntity(surveyRequest);
        log.info(surveyRequest.getSurveyEntity().toString());

        producer.push(applicationProperties.getCreateScorecardSurveyTopic(), surveyRequest);

        return surveyEntity;
    }
    
    /**
     * Searches surveys based on the criteria request and fetches details
     * @param ScorecardSurveySearchCriteria Request object containing criteria filters of survey to be searched
     */
    
    public List<ScorecardSurveyEntity> searchSurveys(ScorecardSurveySearchCriteria criteria, Boolean isCitizen) {
        // If UUID is present, fetch only one record
        if (StringUtils.isNotBlank(criteria.getUuid())) {
            List<ScorecardSurveyEntity> surveyEntities = surveyRepository.fetchSurveys(criteria);
            return !surveyEntities.isEmpty() ? surveyEntities : new ArrayList<>();
        }

        // If UUID is absent, check if tenantId or title is provided
        if (StringUtils.isNotBlank(criteria.getTenantId()) || StringUtils.isNotBlank(criteria.getTitle())) {
            return surveyRepository.fetchSurveys(criteria); // Fetch based on tenantId, title, or both
        }

        // If no valid search criteria is given, return an empty list
        return new ArrayList<>();
    }
    
}