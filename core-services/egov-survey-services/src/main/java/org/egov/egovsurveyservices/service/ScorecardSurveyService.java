package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.repository.SurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.repository.QuestionRepository;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.SurveyEntity;
import org.egov.egovsurveyservices.web.models.SurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.ACTIVE;
import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.INACTIVE;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
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
    private QuestionRepository questionRepository;

    @Autowired
    private ScorecardSurveyRepository surveyRepository;
    private EnrichmentService enrichmentService;

    @Autowired
    private ScorecardSurveyRepository surveyRepository;

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

        surveyEntity.setUuid(UUID.randomUUID().toString());
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


    public ScorecardAnswerResponse submitResponse(AnswerRequest answerRequest) {
        AnswerEntity answerEntity = answerRequest.getAnswerEntity();
        RequestInfo requestInfo = answerRequest.getRequestInfo();
        surveyValidator.validateUserTypeForAnsweringSurvey(requestInfo);
        String uuid = requestInfo.getUserInfo().getUuid();
        surveyValidator.validateWhetherCitizenAlreadyResponded(answerEntity, uuid);
        surveyValidator.validateAnswers(answerEntity);

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(uuid)
                .lastModifiedBy(uuid)
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .build();
        List<ScorecardSectionResponse> enrichedSectionResponses = answerEntity.getAnswers().stream()
                .collect(Collectors.groupingBy(Answer::getSectionUuid)).entrySet().stream()
                .map(entry -> {
                    List<ScorecardQuestionResponse> enrichedQuestionResponses = entry.getValue().stream()
                            .map(answer -> {
                                String questionStatement = questionRepository.findQuestionStatementByUuid(answer.getQuestionUuid());

                                if(StringUtils.isBlank(questionStatement)){
                                    throw new CustomException("EG_SS_QUESTION_NOT_FOUND","question not found with id "+answer.getQuestionUuid());
                                }
                                answer.setUuid(UUID.randomUUID().toString());
                                answer.setSurveyUuid(answerEntity.getSurveyId());
                                answer.setAuditDetails(auditDetails);
                                answer.setCitizenId(uuid);

                                return ScorecardQuestionResponse.builder()
                                        .questionUuid(answer.getQuestionUuid())
                                        .questionStatement(questionStatement)  // Ensure questionStatement is included
                                        .answer(answer.getAnswer())
                                        .comments(answer.getComments())
                                        .build();
                            }).collect(Collectors.toList());
                    producer.push(applicationProperties.getSubmitAnswerScorecardSurveyTopic(),answerRequest);
                    return ScorecardSectionResponse.builder()
                            .sectionUuid(entry.getKey())
                            .questionResponses(enrichedQuestionResponses)
                            .build();
                }).collect(Collectors.toList());

        return ScorecardAnswerResponse.builder()
                .surveyUuid(answerEntity.getSurveyId())
                .citizenId(uuid)
                .sectionResponses(enrichedSectionResponses)
                .auditDetails(auditDetails)
                .build();

    }

    public boolean hasCitizenAlreadyResponded(AnswerEntity answerEntity, String citizenId) {
        if(ObjectUtils.isEmpty(answerEntity.getSurveyId()))
            throw new CustomException("EG_SS_FETCH_CITIZEN_RESP_ERR", "Cannot fetch citizen's response without surveyId");
        return surveyRepository.fetchWhetherCitizenAlreadyResponded(answerEntity.getSurveyId(), citizenId);
    }

    public List<Section> fetchSectionListBasedOnSurveyId(String surveyId) {
        List<Section> sectionList = surveyRepository.fetchSectionListBasedOnSurveyId(surveyId);
        if (CollectionUtils.isEmpty(sectionList))
            return new ArrayList<>();
        return sectionList;
    }

    public List<QuestionWeightage> fetchQuestionsWeightageListBySurveyAndSection(String surveyId, String sectionId) {
        List<QuestionWeightage> questionList = surveyRepository.fetchQuestionsWeightageListBySurveyAndSection(surveyId, sectionId);
        if (CollectionUtils.isEmpty(questionList))
            return new ArrayList<>();
        return questionList;
    }
}