package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.repository.SurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.SurveyEntity;
import org.egov.egovsurveyservices.web.models.SurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.UpdateSurveyActiveRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import java.util.stream.Collectors;

import javax.validation.Valid;

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

        if (surveyEntity.getStartDate() == null || surveyEntity.getStartDate() < 1577836800000L) {
        	throw new IllegalArgumentException("Survey valid startDate is required");
    	}
        if (surveyEntity.getEndDate() == null) {
        	throw new IllegalArgumentException("Survey endDate is required");
    	}
        if (surveyEntity.getStartDate() >= surveyEntity.getEndDate()) {
            throw new CustomException("INVALID_DATE_RANGE", "Start date must be before end date");
        }
        surveyValidator.validateUserType(surveyRequest.getRequestInfo());
        surveyValidator.validateQuestionsAndSections(surveyEntity);
        
        if (surveyEntity.getSurveyTitle() == null || surveyEntity.getSurveyTitle().isEmpty()) {
            throw new IllegalArgumentException("Survey title is empty");
        }

        String tenantId = surveyEntity.getTenantId();
        
        // Collect all question UUIDs
        List<String> questionUuids = surveyEntity.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .map(QuestionWeightage::getQuestionUuid)
                .collect(Collectors.toList());
        
        // Check if all the questions in the given sections exist
        if (!allQuestionsExist(questionUuids)) {
            throw new IllegalArgumentException("One or more questions do not exist in the database.");
        }
        
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
     * @param criteria Request object containing criteria filters of survey to be searched
     */
    
    public List<ScorecardSurveyEntity> searchSurveys(ScorecardSurveySearchCriteria criteria, Boolean isCitizen) {
        // If UUID is present
        if (StringUtils.isNotBlank(criteria.getUuid())) {
            List<ScorecardSurveyEntity> surveyEntities = surveyRepository.fetchSurveys(criteria);
            return !surveyEntities.isEmpty() ? surveyEntities : new ArrayList<>();
        }

        //check either if tenantId or title or active or openSurveyFlag true is provided
        if (StringUtils.isNotBlank(criteria.getTenantId()) || StringUtils.isNotBlank(criteria.getTitle()) || Boolean.TRUE.equals(criteria.getOpenSurveyFlag()) || criteria.getActive() != null) {
            return surveyRepository.fetchSurveys(criteria); // Fetch based on tenantId, title, or both
        }

        return new ArrayList<>();
    }

	public void updateSurveyActive(@Valid UpdateSurveyActiveRequest request) {
		// Validate UUID
	    if (request.getUuid() == null || request.getUuid().trim().isEmpty()) {
	        throw new IllegalArgumentException("UUID must not be null or empty");
	    }

	    // Validate Active status
	    if (request.getActive() == null) {
	        throw new IllegalArgumentException("Active status must not be null");
	    }
		ScorecardSurveySearchCriteria criteria = new ScorecardSurveySearchCriteria();
		
		//check uuid is present in database
		criteria.setUuid(request.getUuid());
		List<ScorecardSurveyEntity> surveyEntities = surveyRepository.fetchSurveys(criteria);
		if(surveyEntities.isEmpty()) {
			log.warn("No survey found in database for this uuid: {}", request.getUuid());
			throw new IllegalArgumentException("UUID does not exist in database, Update failed!");
		}
		else {
			request.setLastModifiedTime(System.currentTimeMillis());
			request.setLastModifiedBy(request.getRequestInfo().getUserInfo().getUuid());
			producer.push(applicationProperties.getUpdateActiveSurveyTopic(), request);
		}
	}
	
	private boolean allQuestionsExist(List<String> questionUuids) {
        return surveyRepository.allQuestionsExist(questionUuids);
    }
    
}