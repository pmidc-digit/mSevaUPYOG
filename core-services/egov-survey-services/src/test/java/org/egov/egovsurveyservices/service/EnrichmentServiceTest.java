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

import java.util.ArrayList;
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
}