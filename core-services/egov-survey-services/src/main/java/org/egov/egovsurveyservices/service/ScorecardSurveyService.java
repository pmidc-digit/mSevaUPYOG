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
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

        if (surveyEntity.getStartDate() == null) {
        	throw new IllegalArgumentException("Survey startDate is required");
    	}
        if (surveyEntity.getEndDate() == null) {
        	throw new IllegalArgumentException("Survey endDate is required");
    	}
        if (surveyEntity.getStartDate() >= surveyEntity.getEndDate()) {
            throw new CustomException("INVALID_DATE_RANGE", "Start date must be before end date");
        }
        surveyValidator.validateUserType(surveyRequest.getRequestInfo());

        if (surveyEntity.getSurveyTitle() == null || surveyEntity.getSurveyTitle().isEmpty()) {
            throw new IllegalArgumentException("Survey title is empty");
        }

        String tenantId = surveyEntity.getTenantId();

        List<String> questionUuids = surveyEntity.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .map(QuestionWeightage::getQuestionUuid)
                .collect(Collectors.toList());

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



//    public ScorecardAnswerResponse submitResponse(AnswerRequest answerRequest) {
//        AnswerEntity answerEntity = answerRequest.getAnswerEntity();
//        String tenantIdBasedOnSurveyId = fetchTenantIdBasedOnSurveyId(answerEntity.getSurveyId());
//        //populating eg_ss_survey_response
//        NewScorecardSurveyResponse surveyResponse = answerEntity.getSurveyResponse(); //this we need to populate to save in db
//        surveyResponse.setUuid(UUID.randomUUID().toString());
//        surveyResponse.setSurveyUuid(answerEntity.getSurveyId());
//        surveyResponse.setTenantId(answerEntity.getCity());
//
//        // Validate tenant ID based on survey response
//        if(StringUtils.equalsIgnoreCase(tenantIdBasedOnSurveyId,"pb.punjab")){
//            surveyValidator.validateCityIsProvided(answerEntity.getCity());
////            surveyValidator.validateCityIsProvided(surveyResponse.getTenantId());
//        }
//        surveyValidator.validateUserTypeForAnsweringScorecardSurvey(answerRequest);
//        String uuid = answerRequest.getUser().getUuid();
////        surveyValidator.validateWhetherCitizenAlreadyResponded(answerEntity, uuid);
//        surveyValidator.validateAnswers(answerEntity);
//
//        AuditDetails auditDetails = AuditDetails.builder()
//                .createdBy(uuid)
//                .lastModifiedBy(uuid)
//                .createdTime(System.currentTimeMillis())
//                .lastModifiedTime(System.currentTimeMillis())
//                .build();
//        List<ScorecardSectionResponse> enrichedSectionResponses = answerEntity.getAnswers().stream()
//                .collect(Collectors.groupingBy(Answer::getSectionUuid)).entrySet().stream()
//                .map(entry -> {
//                    List<ScorecardQuestionResponse> enrichedQuestionResponses = entry.getValue().stream()
//                            .map(answer -> {
//                                String questionStatement = questionRepository.findQuestionStatementByUuid(answer.getQuestionUuid());
//
//                                String existingUuid = getExistingAnswerUuid(answer.getUuid());
//                                String uuidToUse = existingUuid != null ? existingUuid : UUID.randomUUID().toString();
//                                if (StringUtils.isBlank(questionStatement)) {
//                                    throw new CustomException("EG_SS_QUESTION_NOT_FOUND", "question not found with id " + answer.getQuestionUuid());
//                                }
//                                answer.setUuid(uuidToUse);
////                                answer.setSurveyUuid(answerEntity.getSurveyId());
//                                answer.setSurveyResponseUuid(surveyResponse.getUuid());
//                                answer.setAuditDetails(auditDetails);
////                                answer.setCitizenId(uuid);
//                                surveyResponse.setCitizenId(uuid);
//
//                                return ScorecardQuestionResponse.builder()
//                                        .city(answerEntity.getCity())
//                                        .questionUuid(answer.getQuestionUuid())
//                                        .questionStatement(questionStatement)
//                                        .answerUuid(answer.getAnswerUuid())
//                                        .answer(answer.getAnswer())
//                                        .comments(answer.getComments())
//                                        .build();
//                            }).collect(Collectors.toList());
//                    producer.push(applicationProperties.getSubmitAnswerScorecardSurveyTopic(), answerRequest);
//                    return ScorecardSectionResponse.builder()
//                            .sectionUuid(entry.getKey())
//                            .questionResponses(enrichedQuestionResponses)
//                            .build();
//                }).collect(Collectors.toList());
//
//        return ScorecardAnswerResponse.builder()
//                .surveyUuid(answerEntity.getSurveyId())
//                .citizenId(uuid)
//                .sectionResponses(enrichedSectionResponses)
//                .auditDetails(auditDetails)
//                .build();
//
//    }

    public ScorecardSubmitResponse submitResponse(AnswerRequestNew answerRequest) {
        SurveyResponseNew surveyResponse = answerRequest.getSurveyResponse();
        String tenantIdBasedOnSurveyId = fetchTenantIdBasedOnSurveyId(surveyResponse.getSurveyUuid());
        surveyResponse.setUuid(UUID.randomUUID().toString());
//        if(surveyResponse.getStatus()==null) {
//            surveyResponse.setStatus("draft");
//        }
//        if(surveyResponse.getStatus()=="submitted"){
//        }
        // Validate tenant ID based on survey response
        if(StringUtils.equalsIgnoreCase(tenantIdBasedOnSurveyId,"pb.punjab")){
            surveyValidator.validateCityIsProvided(surveyResponse.getTenantId());
//            surveyValidator.validateCityIsProvided(surveyResponse.getTenantId());
        }
        surveyValidator.validateUserTypeForAnsweringScorecardSurvey(answerRequest);
        String uuid = answerRequest.getUser().getUuid();
//        surveyValidator.validateWhetherCitizenAlreadyResponded(surveyResponse, uuid);
        surveyValidator.validateAnswers(surveyResponse);

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(uuid)
                .lastModifiedBy(uuid)
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .build();
        List<ScorecardSectionResponse> enrichedSectionResponses = surveyResponse.getAnswers().stream()
                .collect(Collectors.groupingBy(AnswerNew::getSectionUuid)).entrySet().stream()
                .map(entry -> {
                    List<ScorecardQuestionResponse> enrichedQuestionResponses = entry.getValue().stream()
                            .map(answer -> {
                                List<Question> questionById = questionRepository.getQuestionById(answer.getQuestionUuid());
                                Question question = questionById.get(0);
                                String existingUuid = getExistingAnswerUuid(answer.getUuid());
                                String uuidToUse = existingUuid != null ? existingUuid : UUID.randomUUID().toString();
                                if (StringUtils.isBlank(question.getQuestionStatement())) {
                                    throw new CustomException("EG_SS_QUESTION_NOT_FOUND", "question not found with id " + answer.getQuestionUuid());
                                }
                                answer.setUuid(uuidToUse);
//                                answer.setSurveyUuid(surveyResponseNew.getSurveyId());
//                                answer.setSurveyResponseUuid(surveyResponse.getUuid());
                                answer.setAuditDetails(auditDetails);
                                if (answer.getAnswerDetails() != null) {
                                    answer.getAnswerDetails().forEach(detail -> {
                                        detail.setUuid(UUID.randomUUID().toString());
                                        detail.setAnswerUuid(answer.getUuid());
                                        detail.setAuditDetails(auditDetails);
                                        detail.setAnswerType(question.getType().toString());
                                    });
                                }
//                                answer.setCitizenId(uuid);
                                surveyResponse.setCitizenId(uuid);

                                return ScorecardQuestionResponse.builder()
//                                        .city(surveyResponse.getTenantId())
                                        .questionUuid(answer.getQuestionUuid())
                                        .questionStatement(question.getQuestionStatement())
                                        .answerUuid(answer.getUuid())
                                        .comments(answer.getComments())
                                        .answerResponse(answer)
                                        .build();
                            }).collect(Collectors.toList());
                    producer.push(applicationProperties.getSubmitAnswerScorecardSurveyTopic(), answerRequest);
                    return ScorecardSectionResponse.builder()
                            .sectionUuid(entry.getKey())
                            .questionResponses(enrichedQuestionResponses)
                            .build();
                }).collect(Collectors.toList());

        ScorecardAnswerResponse scorecardAnswerResponse = ScorecardAnswerResponse.builder()
                .locality(surveyResponse.getLocality())
                .tenantId(surveyResponse.getTenantId())
                .status(surveyResponse.getStatus())
                .surveyUuid(surveyResponse.getSurveyUuid())
                .citizenId(surveyResponse.getCitizenId())
                .sectionResponses(enrichedSectionResponses)
                .auditDetails(auditDetails)
                .build();

        return ScorecardSubmitResponse.builder().scorecardAnswerResponse(scorecardAnswerResponse).build();

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

    public String fetchTenantIdBasedOnSurveyId(String surveyId) {
        return surveyRepository.fetchTenantIdBasedOnSurveyId(surveyId);
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
//                    .city(answer.getCity())
                    .questionStatement(answer.getQuestionStatement())
//                    .answerResponse(answer)//correct this for getAnswers
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