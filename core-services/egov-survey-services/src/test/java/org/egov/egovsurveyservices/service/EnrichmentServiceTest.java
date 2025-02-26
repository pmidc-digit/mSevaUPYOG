package org.egov.egovsurveyservices.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EnrichmentServiceTest {

    @InjectMocks
    private EnrichmentService enrichmentService;

    private RequestInfo requestInfo;

    @BeforeEach
    void setUp() {
        requestInfo = RequestInfo.builder()
                .userInfo(User.builder()
                        .uuid("12345")
                        .name("Test User")
                        .build())
                .build();
    }

    @Test
    public void testEnrichSurveyEntity() {
        SurveyEntity surveyEntity = SurveyEntity.builder()
                .uuid("123")
                .build();
        List<Question> questions = new ArrayList<>();
        questions.add(Question.builder().build());
        questions.add(Question.builder().status(Status.ACTIVE).build());
        surveyEntity.setQuestions(questions);
        SurveyRequest surveyRequest = SurveyRequest.builder()
                .surveyEntity(surveyEntity)
                .requestInfo(requestInfo)
                .build();

        enrichmentService.enrichSurveyEntity(surveyRequest);

        assertEquals(Status.ACTIVE.toString(), surveyEntity.getStatus());
        assertTrue(surveyEntity.getActive());
        assertEquals("12345", surveyEntity.getAuditDetails().getCreatedBy());
        assertEquals("12345", surveyEntity.getAuditDetails().getLastModifiedBy());
        assertNotNull(surveyEntity.getAuditDetails().getCreatedTime());
        assertNotNull(surveyEntity.getAuditDetails().getLastModifiedTime());
        assertEquals("Test User", surveyEntity.getPostedBy());
        assertEquals(1L, surveyEntity.getQuestions().get(0).getQorder());
        assertEquals(2L, surveyEntity.getQuestions().get(1).getQorder());
        assertNotNull(surveyEntity.getQuestions().get(0).getUuid());
        assertNotNull(surveyEntity.getQuestions().get(1).getUuid());
        assertEquals(surveyEntity.getUuid(), surveyEntity.getQuestions().get(0).getSurveyId());
        assertEquals(surveyEntity.getUuid(), surveyEntity.getQuestions().get(1).getSurveyId());
        assertEquals(Status.ACTIVE, surveyEntity.getQuestions().get(0).getStatus());
        assertEquals("12345", surveyEntity.getQuestions().get(0).getAuditDetails().getCreatedBy());
        assertEquals("12345", surveyEntity.getQuestions().get(0).getAuditDetails().getLastModifiedBy());
        assertNotNull(surveyEntity.getQuestions().get(0).getAuditDetails().getCreatedTime());
        assertNotNull(surveyEntity.getQuestions().get(0).getAuditDetails().getLastModifiedTime());
    }

    @Test
    public void testEnrichAnswerEntity() {
        AnswerEntity answerEntity = AnswerEntity.builder()
                .build();
        List<Answer> answers = new ArrayList<>();
        answers.add(Answer.builder().build());
        answers.add(Answer.builder().build());
        answerEntity.setAnswers(answers);
        AnswerRequest answerRequest = AnswerRequest.builder()
                .answerEntity(answerEntity)
                .requestInfo(requestInfo)
                .build();

        enrichmentService.enrichAnswerEntity(answerRequest);

        assertNotNull(answerEntity.getAnswers().get(0).getUuid());
        assertNotNull(answerEntity.getAnswers().get(1).getUuid());
        assertEquals("12345", answerEntity.getAnswers().get(0).getCitizenId());
        assertEquals("12345", answerEntity.getAnswers().get(1).getCitizenId());
        assertEquals("12345", answerEntity.getAnswers().get(0).getAuditDetails().getCreatedBy());
        assertEquals("12345", answerEntity.getAnswers().get(0).getAuditDetails().getLastModifiedBy());
        assertNotNull(answerEntity.getAnswers().get(0).getAuditDetails().getCreatedTime());
        assertNotNull(answerEntity.getAnswers().get(0).getAuditDetails().getLastModifiedTime());
    }
    
    @Test
    void testEnrichScorecardSurveyEntity_InvalidSectionWeightage_ShouldThrowException() {
        // Arrange
        ScorecardSurveyEntity surveyEntity = new ScorecardSurveyEntity();
        surveyEntity.setUuid("survey-001");
        surveyEntity.setSections(Arrays.asList(
            new Section("section-001", "Section 1", 60, new ArrayList<>()),
            new Section("section-002", "Section 2", 50, new ArrayList<>()) // Total = 110 (Invalid)
        ));

        ScorecardSurveyRequest request = new ScorecardSurveyRequest();
        request.setSurveyEntity(surveyEntity);
        request.setRequestInfo(requestInfo);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, 
            () -> enrichmentService.enrichScorecardSurveyEntity(request));
        
        assertEquals("Total section weightage in survey survey-001 is not 100, found: 110", thrown.getMessage());
    }

    @Test
    void testEnrichScorecardSurveyEntity_InvalidQuestionWeightage_ShouldThrowException() {
        // Arrange
        Section section = new Section("section-001", "Section 1", 100, Arrays.asList(
            new QuestionWeightage("q-001", new Question(), 40),
            new QuestionWeightage("q-002", new Question(), 70) // Total = 110 (Invalid)
        ));

        ScorecardSurveyEntity surveyEntity = new ScorecardSurveyEntity();
        surveyEntity.setUuid("survey-001");
        surveyEntity.setSections(Collections.singletonList(section));

        ScorecardSurveyRequest request = new ScorecardSurveyRequest();
        request.setSurveyEntity(surveyEntity);
        request.setRequestInfo(requestInfo);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, 
            () -> enrichmentService.enrichScorecardSurveyEntity(request));
        
        assertTrue(thrown.getMessage().contains("Total question weightage in section"));
    }
}