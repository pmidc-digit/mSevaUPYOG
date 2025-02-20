package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.AnswerRepository;
import org.egov.egovsurveyservices.repository.QuestionRepository;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.repository.SurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private AnswerRepository answerRepository;

    @Autowired
    private EnrichmentService enrichmentService;

    @Autowired
    private ScorecardSurveyRepository surveyRepository;

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

        surveyValidator.validateUserType(surveyRequest.getRequestInfo());
        surveyValidator.validateQuestionsAndSections(surveyEntity);

        String tenantId = surveyEntity.getTenantId();
//        Integer countOfSurveyEntities = 1;
//        List<String> listOfSurveyIds = surveyUtil.getIdList(surveyRequest.getRequestInfo(), tenantId, "ss.surveyid", "SY-[cy:yyyy-MM-dd]-[SEQ_EG_DOC_ID]", countOfSurveyEntities);
//        log.info(listOfSurveyIds.toString());

        surveyEntity.setUuid(UUID.randomUUID().toString());
        surveyEntity.setTenantId(tenantId);
        enrichmentService.enrichScorecardSurveyEntity(surveyRequest);
        log.info(surveyRequest.getSurveyEntity().toString());

        producer.push(applicationProperties.getCreateScorecardSurveyTopic(), surveyRequest);

        return surveyEntity;
    }

//    @Autowired
//    private AnswerRepository answerRepository;
//
//    public SurveyResponse saveSurveyResponse(SurveyResponse surveyResponse) {
//        surveyResponse.setAuditDetails(AuditDetails.builder()
//                .createdBy(surveyResponse.getCitizenId())
//                .lastModifiedBy(surveyResponse.getCitizenId())
//                .createdTime(System.currentTimeMillis())
//                .lastModifiedTime(System.currentTimeMillis())
//                .build());
//
//        for (SectionResponse sectionResponse : surveyResponse.getSectionResponses()) {
//            for (QuestionResponse questionResponse : sectionResponse.getQuestionResponses()) {
//                Answer answer = Answer.builder()
//                        .uuid(UUID.randomUUID().toString())
//                        .surveyUuid(surveyResponse.getSurveyUuid())
//                        .sectionUuid(sectionResponse.getSectionUuid())
//                        .questionUuid(questionResponse.getQuestionUuid())
//                        .answer(questionResponse.getAnswer())
//                        .comments(questionResponse.getComments())
//                        .auditDetails(surveyResponse.getAuditDetails())
//                        .citizenId(surveyResponse.getCitizenId())
//                        .build();
//
//                answerRepository.saveAnswer(answer);
//            }
//        }
//        return null;
//    }

    public ScorecardAnswerResponse submitResponse(AnswerRequest answerRequest) {
        AnswerEntity answerEntity = answerRequest.getAnswerEntity();
        RequestInfo requestInfo = answerRequest.getRequestInfo();
        surveyValidator.validateUserTypeForAnsweringSurvey(requestInfo);
        String uuid = requestInfo.getUserInfo().getUuid();
        surveyValidator.validateWhetherCitizenAlreadyResponded(answerEntity, uuid);
        surveyValidator.validateAnswers(answerEntity);
        // Collect answers to enrich SurveyResponse
        List<ScorecardSectionResponse> enrichedSectionResponses = answerEntity.getAnswers().stream()
                .collect(Collectors.groupingBy(Answer::getSectionUuid)).entrySet().stream()
                .map(entry -> {
                    List<ScorecardQuestionResponse> enrichedQuestionResponses = entry.getValue().stream()
                            .map(answer -> {
                                // Fetch question statement from repository
                                String questionStatement = questionRepository.findQuestionStatementByUuid(answer.getQuestionUuid());
                                //add validation for question existence

                                Answer enrichedAnswer = Answer.builder()
                                        .uuid(UUID.randomUUID().toString())
                                        .surveyUuid(answerEntity.getSurveyId())
                                        .sectionUuid(answer.getSectionUuid())
                                        .questionUuid(answer.getQuestionUuid())
                                        .answer(answer.getAnswer())
                                        .comments(answer.getComments())
                                        .auditDetails(answer.getAuditDetails())
                                        .citizenId(answer.getCitizenId())
                                        .build();

                                answerRepository.saveAnswer(enrichedAnswer);

                                return ScorecardQuestionResponse.builder()
                                        .questionUuid(answer.getQuestionUuid())
                                        .questionStatement(questionStatement)  // Ensure questionStatement is included
                                        .answer(answer.getAnswer())
                                        .comments(answer.getComments())
                                        .build();
                            }).collect(Collectors.toList());

                    return ScorecardSectionResponse.builder()
                            .sectionUuid(entry.getKey())
                            .questionResponses(enrichedQuestionResponses)
                            .build();
                }).collect(Collectors.toList());

        ScorecardAnswerResponse surveyResponse = ScorecardAnswerResponse.builder()
                .surveyUuid(answerEntity.getSurveyId())
                .citizenId(uuid)
                .sectionResponses(enrichedSectionResponses)
                .auditDetails(AuditDetails.builder()
                        .createdBy(uuid)
                        .lastModifiedBy(uuid)
                        .createdTime(System.currentTimeMillis())
                        .lastModifiedTime(System.currentTimeMillis())
                        .build())
                .build();

        return surveyResponse;
    }

    public void submitsResponse(AnswerRequest answerRequest) {
        RequestInfo requestInfo = answerRequest.getRequestInfo();
        AnswerEntity answerEntity = answerRequest.getAnswerEntity();

        // Validations

        // 1. Validate whether userType is citizen or not
        surveyValidator.validateUserTypeForAnsweringSurvey(requestInfo);
        // 2. Validate if survey for which citizen is responding exists
        if(CollectionUtils.isEmpty(surveyRepository.fetchSurveys(SurveySearchCriteria.builder().isCountCall(Boolean.FALSE).uuid(answerEntity.getSurveyId()).build())))
            throw new CustomException("EG_SY_DOES_NOT_EXIST_ERR", "The survey for which citizen responded does not exist");
        // 3. Validate if citizen has already responded or not
        surveyValidator.validateWhetherCitizenAlreadyResponded(answerEntity, requestInfo.getUserInfo().getUuid());
        // 4. Validate answers
        surveyValidator.validateAnswers(answerEntity);

        // Enrich answer request
        enrichmentService.enrichAnswerEntity(answerRequest);

        // Persist response if it passes all validations
        producer.push("save-ss-answer", answerRequest);
    }

    public boolean hasCitizenAlreadyResponded(AnswerEntity answerEntity, String citizenId) {
        if(ObjectUtils.isEmpty(answerEntity.getSurveyId()))
            throw new CustomException("EG_SY_FETCH_CITIZEN_RESP_ERR", "Cannot fetch citizen's response without surveyId");
        return surveyRepository.fetchWhetherCitizenAlreadyResponded(answerEntity.getSurveyId(), citizenId);
    }

    public List<Question> fetchQuestionListBasedOnSurveyId(String surveyId) {
        List<Question> questionList = surveyRepository.fetchQuestionsList(surveyId);
        if(CollectionUtils.isEmpty(questionList))
            return new ArrayList<>();
        return questionList;
    }
}