package org.egov.egovsurveyservices.validators;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;

import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.google.gson.Gson;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ScorecardSurveyValidatorTest {

    @InjectMocks
    private ScorecardSurveyValidator validator;

    @Mock
    private ScorecardSurveyService surveyService;

    private RequestInfo requestInfo;

    @BeforeEach
    void setUp() {
        requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
    }

    @Test
    void testValidateUserType_ValidEmployee() {
        requestInfo.getUserInfo().setType("EMPLOYEE");
        assertDoesNotThrow(() -> validator.validateUserType(requestInfo));
    }

    @Test
    void testValidateUserType_InvalidUser() {
        requestInfo.getUserInfo().setType("CITIZEN");

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateUserType(requestInfo));

        assertEquals("EG_SY_ACCESS_ERR", exception.getCode());
        assertEquals("Survey can only be created/updated/deleted by employees.", exception.getMessage());
    }

    @Test
    void testValidateUserTypeForAnsweringSurvey_ValidCitizen() {
        requestInfo.getUserInfo().setType("CITIZEN");
        assertDoesNotThrow(() -> validator.validateUserTypeForAnsweringSurvey(requestInfo));
    }

    @Test
    void testValidateUserTypeForAnsweringSurvey_InvalidUser() {
        requestInfo.getUserInfo().setType("EMPLOYEE");

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateUserTypeForAnsweringSurvey(requestInfo));

        assertEquals("EG_SS_SUBMIT_RESPONSE_ERR", exception.getCode());
        assertEquals("Survey can only be answered by citizens.", exception.getMessage());
    }

    @Test
    void testValidateQuestionsAndSections_ValidWeightages() {
        ScorecardSurveyEntity surveyEntity = getValidSurveyEntity();
        assertDoesNotThrow(() -> validator.validateQuestionsAndSections(surveyEntity));
    }

    @Test
    void testValidateQuestionsAndSections_InvalidSectionWeightage() {
        ScorecardSurveyEntity surveyEntity = getValidSurveyEntity();
        surveyEntity.getSections().get(0).setWeightage(90); // Invalid weightage

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateQuestionsAndSections(surveyEntity));

        assertEquals("INVALID_SECTION_WEIGHTAGE", exception.getCode());
        assertEquals("Total section weightage must be 100", exception.getMessage());
    }

    @Test
    void testValidateQuestionsAndSections_InvalidQuestionWeightage() {
        ScorecardSurveyEntity surveyEntity = getValidSurveyEntity();
        surveyEntity.getSections().get(0).getQuestions().get(0).setWeightage(60); // Invalid question weightage

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateQuestionsAndSections(surveyEntity));

        assertEquals("INVALID_QUESTION_WEIGHTAGE", exception.getCode());
        assertEquals("Total question weightage for section section1 must be 100", exception.getMessage());
    }

    /*** Helper Method to Create Valid Survey ***/
    private ScorecardSurveyEntity getValidSurveyEntity() {
        return ScorecardSurveyEntity.builder()
                .sections(Arrays.asList(
                        Section.builder()
                                .title("section1")
                                .weightage(100) // Valid weightage
                                .questions(Arrays.asList(
                                        QuestionWeightage.builder()
                                                .weightage(50)
                                                .build(),
                                        QuestionWeightage.builder()
                                                .weightage(50)
                                                .build()))
                                .build()
                ))
                .build();
    }
}
