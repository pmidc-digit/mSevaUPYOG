package org.egov.egovsurveyservices.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.QuestionRepository;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.egov.egovsurveyservices.web.models.UpdateSurveyActiveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.*;
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
    private QuestionRepository questionRepository;

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
     *
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

    public List<ScorecardSurveyEntity> searchSurveys(ScorecardSurveySearchCriteria criteria) {
        // If UUID is present, fetch only one record
        if (StringUtils.isNotBlank(criteria.getUuid())) {
            List<ScorecardSurveyEntity> surveyEntities = surveyRepository.fetchSurveys(criteria);
            return !surveyEntities.isEmpty() ? surveyEntities : new ArrayList<>();
        }

        // If UUID is absent, check if tenantId or title is provided
        if (StringUtils.isNotBlank(criteria.getTenantId()) || StringUtils.isNotBlank(criteria.getTitle()) || Boolean.TRUE.equals(criteria.getOpenSurveyFlag())) {
            return surveyRepository.fetchSurveys(criteria); // Fetch based on tenantId, title, or both
        }

        // If no valid search criteria is given, return an empty list
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



    public ScorecardAnswerResponse submitResponse(AnswerRequest answerRequest) {
        AnswerEntity answerEntity = answerRequest.getAnswerEntity();
        RequestInfo requestInfo = answerRequest.getRequestInfo();
        surveyValidator.validateUserTypeForAnsweringScorecardSurvey(answerRequest);
        String uuid = answerRequest.getUser().getUuid();
//        surveyValidator.validateWhetherCitizenAlreadyResponded(answerEntity, uuid);
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

                                String existingUuid = getExistingAnswerUuid(answer.getAnswerUuid());
                                String uuidToUse = existingUuid != null ? existingUuid : UUID.randomUUID().toString();
                                if (StringUtils.isBlank(questionStatement)) {
                                    throw new CustomException("EG_SS_QUESTION_NOT_FOUND", "question not found with id " + answer.getQuestionUuid());
                                }
                                answer.setAnswerUuid(uuidToUse);
                                answer.setSurveyUuid(answerEntity.getSurveyId());
                                answer.setAuditDetails(auditDetails);
                                answer.setCitizenId(uuid);

                                return ScorecardQuestionResponse.builder()
                                        .questionUuid(answer.getQuestionUuid())
                                        .questionStatement(questionStatement)
                                        .answerUuid(answer.getAnswerUuid())
                                        .answer(answer.getAnswer())
                                        .comments(answer.getComments())
                                        .build();
                            }).collect(Collectors.toList());
                    producer.push(applicationProperties.getSubmitAnswerScorecardSurveyTopic(), answerRequest);
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
        if (ObjectUtils.isEmpty(answerEntity.getSurveyId()))
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

    private String getExistingAnswerUuid(String answerUuid) {
       return surveyRepository.getExistingAnswerUuid(answerUuid);
    }

    public ScorecardAnswerResponse getAnswers(AnswerFetchCriteria criteria) {
        if(criteria.getSurveyUuid()==null || criteria.getCitizenId()==null){
            throw new CustomException("EG_SS_SURVEY_UUID_CITIZEN_UUID_ERR","surveyUuid and citizenUuid cannot be null");
        }
            List<Answer> answers = surveyRepository.getAnswers(criteria.getSurveyUuid(),criteria.getCitizenId());
        return buildScorecardAnswerResponse(answers,criteria);
    }

    private ScorecardAnswerResponse buildScorecardAnswerResponse(List<Answer> answers, AnswerFetchCriteria criteria) {
        Map<String, List<ScorecardQuestionResponse>> sectionResponsesMap = new HashMap<>();

        for (Answer answer : answers) {
            ScorecardQuestionResponse questionResponse = ScorecardQuestionResponse.builder()
                    .questionUuid(answer.getQuestionUuid())
                    .questionStatement(answer.getQuestionStatement())
                    .answer(answer.getAnswer())
                    .answerUuid(answer.getAnswerUuid())
                    .comments(answer.getComments())
                    .build();
            sectionResponsesMap.computeIfAbsent(answer.getSectionUuid(), k -> new ArrayList<>()).add(questionResponse);
        }

        List<ScorecardSectionResponse> sectionResponses = sectionResponsesMap.entrySet().stream()
                .map(entry -> ScorecardSectionResponse.builder()
                        .sectionUuid(entry.getKey())
                        .questionResponses(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        return ScorecardAnswerResponse.builder()
                .surveyUuid(criteria.getSurveyUuid())
                .citizenId(criteria.getCitizenId())
                .sectionResponses(sectionResponses)
                .build();
    }
}