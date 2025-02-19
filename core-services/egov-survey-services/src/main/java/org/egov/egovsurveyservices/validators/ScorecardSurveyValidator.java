package org.egov.egovsurveyservices.validators;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

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
            throw new CustomException("EG_SY_SUBMIT_RESPONSE_ERR", "Survey can only be answered by citizens.");
    }

    public void validateWhetherCitizenAlreadyResponded(AnswerEntity answerEntity, String citizenId) {
        if(surveyService.hasCitizenAlreadyResponded(answerEntity, citizenId))
            throw new CustomException("EG_CITIZEN_ALREADY_RESPONDED", "The citizen has already responded to this survey.");
    }

    public void validateAnswers(AnswerEntity answerEntity) {
        List<Question> questionsList = surveyService.fetchQuestionListBasedOnSurveyId(answerEntity.getSurveyId());
        HashSet<String> mandatoryQuestionsUuids = new HashSet<>();
        HashSet<String> allQuestionsUuids = new HashSet<>();
        List<String> questionsThatAreAnsweredUuids = new ArrayList<>();
        questionsList.forEach(question -> {
            allQuestionsUuids.add(question.getUuid());
            if(question.getRequired())
                mandatoryQuestionsUuids.add(question.getUuid());
        });
        answerEntity.getAnswers().forEach(answer -> {
            questionsThatAreAnsweredUuids.add(answer.getQuestionUuid());
        });
        // Check to validate whether all answers belong to same survey
        if(!allQuestionsUuids.containsAll(questionsThatAreAnsweredUuids))
            throw new CustomException("EG_SY_DIFF_QUES_ANSWERED_ERR", "A question belonging to some other survey has been answered.");
        // Check to validate whether all mandatory questions have been answered or not
        if(!questionsThatAreAnsweredUuids.containsAll(mandatoryQuestionsUuids))
            throw new CustomException("EG_SY_MANDATORY_QUES_NOT_ANSWERED_ERR", "A mandatory question was not answered");
    }


}
