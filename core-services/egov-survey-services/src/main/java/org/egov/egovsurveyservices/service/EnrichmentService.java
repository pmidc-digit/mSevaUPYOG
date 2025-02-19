package org.egov.egovsurveyservices.service;

import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.*;


@Service
@Slf4j
public class EnrichmentService {

    public void enrichSurveyEntity(SurveyRequest surveyRequest) {
        SurveyEntity surveyEntity = surveyRequest.getSurveyEntity();
        surveyEntity.setStatus(ACTIVE);
        surveyEntity.setActive(Boolean.TRUE);
        surveyEntity.setAuditDetails(AuditDetails.builder()
                .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .build());
        surveyEntity.setPostedBy(surveyRequest.getRequestInfo().getUserInfo().getName());

        for(int i = 0; i < surveyEntity.getQuestions().size(); i++) {
            Question question = surveyEntity.getQuestions().get(i);
            question.setQorder((long)i+1);
            question.setUuid(UUID.randomUUID().toString());
            question.setSurveyId(surveyEntity.getUuid());
            if(ObjectUtils.isEmpty(question.getStatus()))
                question.setStatus(Status.ACTIVE);
            question.setAuditDetails(AuditDetails.builder()
                    .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                    .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                    .createdTime(System.currentTimeMillis())
                    .lastModifiedTime(System.currentTimeMillis())
                    .build());
        }
    }

    /*public void enrichScorecardSurveyEntity(ScorecardSurveyRequest surveyRequest) {
        ScorecardSurveyEntity
                surveyEntity = surveyRequest.getSurveyEntity();
        surveyEntity.setStatus(ACTIVE);
        surveyEntity.setActive(Boolean.TRUE);
        surveyEntity.setAuditDetails(AuditDetails.builder()
                .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .build());
        surveyEntity.setPostedBy(surveyRequest.getRequestInfo().getUserInfo().getName());

        //fix this
        for(int i = 0; i < surveyEntity.getQuestions().size(); i++) {
            Question question = surveyEntity.getQuestions().get(i);
            question.setQorder((long)i+1);
            question.setUuid(UUID.randomUUID().toString());
            question.setSurveyId(surveyEntity.getUuid());
            if(ObjectUtils.isEmpty(question.getStatus()))
                question.setStatus(Status.ACTIVE);
            question.setAuditDetails(AuditDetails.builder()
                    .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                    .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                    .createdTime(System.currentTimeMillis())
                    .lastModifiedTime(System.currentTimeMillis())
                    .build());
        }
    }*/
    
    public void enrichScorecardSurveyEntity(ScorecardSurveyRequest surveyRequest) {
        ScorecardSurveyEntity surveyEntity = surveyRequest.getSurveyEntity();
        surveyEntity.setActive(Boolean.TRUE);
        surveyEntity.setAuditDetails(AuditDetails.builder()
                .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .build());
        surveyEntity.setPostedBy(surveyRequest.getRequestInfo().getUserInfo().getName());

        List<Section> sections = surveyEntity.getSections(); //get all the sections
        Integer countOfSections = sections.size();
        if (CollectionUtils.isEmpty(sections)) {
            log.warn("No sections found in survey: {}", surveyEntity.getUuid());
            return;
        }

        int totalSectionWeightage = 0;

        for (int i = 0; i < countOfSections; i++) {
        	Section section = surveyEntity.getSections().get(i);
        	totalSectionWeightage += section.getWeightage(); // Track section weightage sum
            section.setUuid(UUID.randomUUID().toString());
            section.setTitle(surveyEntity.getSections().get(i).getTitle());   
            section.setWeightage(surveyEntity.getSections().get(i).getWeightage());
            List<QuestionWeightage> questionWeightages = section.getQuestions(); //get qns
            Integer qnws = questionWeightages.size();
            if (CollectionUtils.isEmpty(questionWeightages)) {
                log.warn("No questions found in section: {}", section.getUuid());
                continue;
            }

            int totalQuestionWeightage = 0;

            for (int j = 0; j < qnws; j++) {
                QuestionWeightage questionWeightage = questionWeightages.get(j);
                questionWeightage.setQuestionUuid(UUID.randomUUID().toString());
                questionWeightage.setSectionUuid(section.getUuid());
                questionWeightage.setQorder((long) j + 1);
                Question question = questionWeightage.getQuestion();
                totalQuestionWeightage += questionWeightage.getWeightage(); // Track question weightage sum

                if (question == null) {
                    log.warn("Skipping null question in section: {}", section.getUuid());
                    continue;
                }

                question.setQorder((long) j + 1);
                question.setUuid(UUID.randomUUID().toString());
                question.setSurveyId(surveyEntity.getUuid());

                if (ObjectUtils.isEmpty(question.getStatus())) {
                    question.setStatus(Status.ACTIVE);
                }

                question.setAuditDetails(AuditDetails.builder()
                        .createdBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                        .lastModifiedBy(surveyRequest.getRequestInfo().getUserInfo().getUuid())
                        .createdTime(System.currentTimeMillis())
                        .lastModifiedTime(System.currentTimeMillis())
                        .build());
            }

            if (totalQuestionWeightage != 100) {
                throw new IllegalArgumentException("Total question weightage in section " + section.getUuid() + " is not 100, found: " + totalQuestionWeightage);
            }
        }

        if (totalSectionWeightage != 100) {
            throw new IllegalArgumentException("Total section weightage in survey " + surveyEntity.getUuid() + " is not 100, found: " + totalSectionWeightage);
        }

        log.info("Survey enrichment completed for survey: {}", surveyEntity.getUuid());
    }

    public void enrichAnswerEntity(AnswerRequest answerRequest) {
        RequestInfo requestInfo = answerRequest.getRequestInfo();
        AnswerEntity answerEntity = answerRequest.getAnswerEntity();
        answerEntity.getAnswers().forEach(answer -> {
            answer.setUuid(UUID.randomUUID().toString());
            answer.setCitizenId(requestInfo.getUserInfo().getUuid());
            answer.setAuditDetails(AuditDetails.builder()
                    .createdBy(requestInfo.getUserInfo().getUuid())
                    .lastModifiedBy(requestInfo.getUserInfo().getUuid())
                    .createdTime(System.currentTimeMillis())
                    .lastModifiedTime(System.currentTimeMillis())
                    .build());
        });
    }
}