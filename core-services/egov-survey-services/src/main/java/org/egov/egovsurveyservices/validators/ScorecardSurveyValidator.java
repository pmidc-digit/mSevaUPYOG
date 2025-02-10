package org.egov.egovsurveyservices.validators;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.Section;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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




}
