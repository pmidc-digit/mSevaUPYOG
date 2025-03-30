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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

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
    void testValidateCityIsProvided_ValidCity() {
        assertDoesNotThrow(() -> validator.validateCityIsProvided("New York"));
    }
    
    @Test
    void testValidateCityIsProvided_NullCity_ShouldThrowException() {
        CustomException thrown = assertThrows(CustomException.class, () -> validator.validateCityIsProvided(null));

        assertEquals("EG_SS_CITY_MISSING", thrown.getCode());
        assertEquals("provide a valid city", thrown.getMessage());
    }

    @Test
    void testValidateCityIsProvided_EmptyCity_ShouldThrowException() {
        CustomException thrown = assertThrows(CustomException.class, () -> validator.validateCityIsProvided(""));

        assertEquals("EG_SS_CITY_MISSING", thrown.getCode());
        assertEquals("provide a valid city", thrown.getMessage());
    }

    @Test
    void testValidateCityIsProvided_BlankCity_ShouldThrowException() {
        CustomException thrown = assertThrows(CustomException.class, () -> validator.validateCityIsProvided("   "));

        assertEquals("EG_SS_CITY_MISSING", thrown.getCode());
        assertEquals("provide a valid city", thrown.getMessage());
    }
    
    @Test
    void testValidateAnswers_ValidAnswers() {
        AnswerEntity answerEntity = new AnswerEntity();
        answerEntity.setSurveyId("survey123");
        answerEntity.setAnswers(Arrays.asList(
                new Answer("ans1", "city1", "survey123", "section1", "question1", "statement1", "comments1", Collections.singletonList("yes"), null, "citizen1"),
                new Answer("ans2", "city1", "survey123", "section1", "question2", "statement2", "comments2", Collections.singletonList("no"), null, "citizen1")));

        Section section = new Section();
        section.setUuid("section1");
        section.setTitle("sectiontitle");
        
        Question question1 = new Question();
        question1.setQuestionStatement("questionst1");
        question1.setUuid("question1");
        question1.setRequired(true);
        
        Question question2 = new Question();
        question2.setQuestionStatement("questionst2");
        question2.setUuid("question2");
        question2.setRequired(false);

        QuestionWeightage qw1 = new QuestionWeightage();
        qw1.setSectionUuid("section1");
        qw1.setQuestion(question1);
        QuestionWeightage qw2 = new QuestionWeightage();
        qw2.setSectionUuid("section1");
        qw2.setQuestion(question2);

        when(surveyService.fetchSectionListBasedOnSurveyId("survey123"))
                .thenReturn(Collections.singletonList(section));
        when(surveyService.fetchQuestionsWeightageListBySurveyAndSection("survey123", "section1"))
                .thenReturn(Arrays.asList(qw1, qw2));

        assertDoesNotThrow(() -> validator.validateAnswers(answerEntity));
    }

    @Test
    void testValidateAnswers_InvalidSection() {
        AnswerEntity answerEntity = new AnswerEntity();
        answerEntity.setSurveyId("survey123");
        answerEntity.setAnswers(Collections.singletonList(
                new Answer("ans1", "city1", "survey123", "invalidSection", "question1", "statement1", "comments1", Collections.singletonList("yes"), null, "citizen1")));

        Section section = new Section();
        section.setUuid("section1");
        section.setTitle("sectiontitle");

        when(surveyService.fetchSectionListBasedOnSurveyId("survey123"))
                .thenReturn(Collections.singletonList(section));

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateAnswers(answerEntity));
        assertEquals("EG_SY_INVALID_SECTION_ERR", exception.getCode());
    }

    @Test
    void testValidateAnswers_MissingMandatoryQuestion() {
        AnswerEntity answerEntity = new AnswerEntity();
        answerEntity.setSurveyId("survey123");
        answerEntity.setAnswers(Collections.singletonList(
                new Answer("ans2", "city1", "survey123", "section1", "question2", "statement2", "comments2", Collections.singletonList("no"), null, "citizen1")));

        Section section = new Section();
        section.setUuid("section1");
        section.setTitle("sectiontitle");
        
        Question question1 = new Question();
        question1.setQuestionStatement("questionst1");
        question1.setUuid("question1");
        question1.setRequired(true);
        Question question2 = new Question();
        question2.setQuestionStatement("questionst2");
        question2.setUuid("question2");
        question2.setRequired(false);

        QuestionWeightage qw1 = new QuestionWeightage();
        qw1.setSectionUuid("section1");
        qw1.setQuestion(question1);
        QuestionWeightage qw2 = new QuestionWeightage();
        qw2.setSectionUuid("section1");
        qw2.setQuestion(question2);

        when(surveyService.fetchSectionListBasedOnSurveyId("survey123"))
                .thenReturn(Collections.singletonList(section));
        when(surveyService.fetchQuestionsWeightageListBySurveyAndSection("survey123", "section1"))
                .thenReturn(Arrays.asList(qw1, qw2));

        CustomException exception = assertThrows(CustomException.class, () -> validator.validateAnswers(answerEntity));
        assertEquals("EG_SY_MANDATORY_QUES_NOT_ANSWERED_ERR", exception.getCode());
    }

    /*** Helper Method to Create Valid Survey ***/
    private ScorecardSurveyEntity getValidSurveyEntity() {
        return ScorecardSurveyEntity.builder()
                .sections(Arrays.asList(
                        Section.builder()
                                .title("section1")
                                .weightage(new BigDecimal("100.00")) // Valid weightage
                                .questions(Arrays.asList(
                                        QuestionWeightage.builder()
                                                .weightage(new BigDecimal("50.00"))
                                                .build(),
                                        QuestionWeightage.builder()
                                                .weightage(new BigDecimal("50.00"))
                                                .build()))
                                .build()
                ))
                .build();
    }
}
