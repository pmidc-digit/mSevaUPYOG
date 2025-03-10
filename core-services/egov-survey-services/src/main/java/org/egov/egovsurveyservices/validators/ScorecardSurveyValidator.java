package org.egov.egovsurveyservices.validators;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.CITIZEN;
import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.EMPLOYEE;

@Slf4j
@Component
public class ScorecardSurveyValidator {

    @Autowired
    ScorecardSurveyService surveyService;

    /**
     * Validates whether the user trying to create/update/delete a survey is an Employee
     * @param requestInfo RequestInfo of the request
     */
    public void validateUserType(RequestInfo requestInfo) {
        if(!requestInfo.getUserInfo().getType().equalsIgnoreCase(EMPLOYEE))
            throw new CustomException("EG_SY_ACCESS_ERR", "Survey can only be created/updated/deleted by employees.");
    }

    public void validateQuestionsAndSections(ScorecardSurveyEntity surveyEntity) {
        // Validate that the total weightage for sections equals 100
        int totalSectionWeightage = surveyEntity.getSections().stream()
                .mapToInt(Section::getWeightage)
                .sum();

        if (totalSectionWeightage != 100) {
            throw new CustomException("INVALID_SECTION_WEIGHTAGE", "Total section weightage must be 100");
        }

        // Validate that the total weightage for questions in each section equals 100
        surveyEntity.getSections().forEach(section -> {
            int totalQuestionWeightage = section.getQuestions().stream()
                    .mapToInt(QuestionWeightage::getWeightage)
                    .sum();

            if (totalQuestionWeightage != 100) {
                throw new CustomException("INVALID_QUESTION_WEIGHTAGE", "Total question weightage for section " + section.getTitle() + " must be 100");
            }
        });
    }

    /**
     * Validates whether the user trying to answer a survey is a Citizen
     * @param requestInfo RequestInfo of the request
     */
    public void validateUserTypeForAnsweringSurvey(RequestInfo requestInfo) {
        if(!requestInfo.getUserInfo().getType().equalsIgnoreCase(CITIZEN))
            throw new CustomException("EG_SS_SUBMIT_RESPONSE_ERR", "Survey can only be answered by citizens.");
    }

    public void validateUserTypeForAnsweringScorecardSurvey(AnswerRequest requestInfo) {
        if(requestInfo.getUser()==null){
            throw new CustomException("EG_SS_USER_INFO_MISSING", "Please provide citizen info.");
        }

        if(requestInfo.getUser().getType()==null || !requestInfo.getUser().getType().equalsIgnoreCase(CITIZEN))
            throw new CustomException("EG_SS_SUBMIT_RESPONSE_ERR", "Survey can only be answered by citizens.");
    }

    public void validateWhetherCitizenAlreadyResponded(AnswerEntity answerEntity, String citizenId) {
        if(surveyService.hasCitizenAlreadyResponded(answerEntity, citizenId))
            throw new CustomException("EG_SS_CITIZEN_ALREADY_RESPONDED", "The citizen has already responded to this survey.");
    }

    public void validateAnswers(AnswerEntity answerEntity) {

        List<Section> sectionList = surveyService.fetchSectionListBasedOnSurveyId(answerEntity.getSurveyId());
        Map<String, Set<String>> sectionQuestionMap = new HashMap<>();
        HashSet<String> mandatoryQuestionsUuids = new HashSet<>();
        List<String> questionsThatAreAnsweredUuids = new ArrayList<>();
        HashSet<String> validSectionUuids = new HashSet<>();

        // Fetch valid sections for the survey
        sectionList.forEach(section -> validSectionUuids.add(section.getUuid()));

        // Fetch questions for the survey and sections
        sectionList.forEach(section -> {
            List<QuestionWeightage> questionWeightageList = surveyService.fetchQuestionsWeightageListBySurveyAndSection(answerEntity.getSurveyId(), section.getUuid());
            questionWeightageList.forEach(questionWeightage -> {
                Question question = questionWeightage.getQuestion();
                sectionQuestionMap.computeIfAbsent(questionWeightage.getSectionUuid(), k -> new HashSet<>()).add(question.getUuid());
                if (question.getRequired())
                    mandatoryQuestionsUuids.add(question.getUuid());
            });
        });

        // Validate section IDs and track answered questions
        answerEntity.getAnswers().forEach(answer -> {
            questionsThatAreAnsweredUuids.add(answer.getQuestionUuid());
            if (!validSectionUuids.contains(answer.getSectionUuid())) {
                throw new CustomException("EG_SY_INVALID_SECTION_ERR", "The section ID provided does not belong to the given survey.");
            }
        });

        // Validate whether all answers belong to the correct survey and section
        answerEntity.getAnswers().forEach(answer -> {
            if (!sectionQuestionMap.containsKey(answer.getSectionUuid()) || !sectionQuestionMap.get(answer.getSectionUuid()).contains(answer.getQuestionUuid())) {
                throw new CustomException("EG_SY_DIFF_QUES_ANSWERED_ERR", "A question belonging to a different survey or section has been answered.");
            }
        });

        // Validate whether all mandatory questions have been answered
        if (!new HashSet<>(questionsThatAreAnsweredUuids).containsAll(mandatoryQuestionsUuids)) {
            throw new CustomException("EG_SY_MANDATORY_QUES_NOT_ANSWERED_ERR", "A mandatory question was not answered.");
        }
    }
}
