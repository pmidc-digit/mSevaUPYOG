package org.egov.egovsurveyservices.repository.rowmapper;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Category;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.egov.egovsurveyservices.repository.rowmapper.ScorecardSurveyRowMapper;
import org.egov.egovsurveyservices.web.models.*;


@ExtendWith(MockitoExtension.class)
public class ScorecardSurveyRowMapperTest {

    private ScorecardSurveyRowMapper rowMapper;

    @Mock
    private ResultSet resultSet;

    @BeforeEach
    void setUp() {
        rowMapper = new ScorecardSurveyRowMapper();
    }

    @Test
    void testExtractData_Success() throws SQLException {
        when(resultSet.next()).thenReturn(true, true, false);
        when(resultSet.getString("survey_uuid")).thenReturn("survey-123");
        when(resultSet.getString("survey_tenantid")).thenReturn("pb.testing");
        when(resultSet.getString("survey_title")).thenReturn("Survey on Feedback");
        when(resultSet.getString("survey_category")).thenReturn("Feedback");
        when(resultSet.getString("survey_description")).thenReturn("Survey on service quality");
        when(resultSet.getLong("survey_startdate")).thenReturn(1672531200000L);
        when(resultSet.getLong("survey_enddate")).thenReturn(1675219600000L);
        when(resultSet.getString("survey_postedby")).thenReturn("admin");
        when(resultSet.getBoolean("survey_active")).thenReturn(true);
        when(resultSet.getLong("survey_answerscount")).thenReturn(100L);
        when(resultSet.getBoolean("survey_hasresponded")).thenReturn(false);
        when(resultSet.getLong("survey_createdtime")).thenReturn(1672531200000L);
        when(resultSet.getLong("survey_lastmodifiedtime")).thenReturn(1675219600000L);
        when(resultSet.getString("survey_createdby")).thenReturn("creatorUser");
        when(resultSet.getString("survey_lastmodifiedby")).thenReturn("modifierUser");

        
        when(resultSet.getString("section_uuid")).thenReturn("section-123");
        when(resultSet.getString("section_title")).thenReturn("General Feedback");
        when(resultSet.getInt("section_weightage")).thenReturn(10);

        
        when(resultSet.getString("question_uuid")).thenReturn("question-123", "question-456");
        when(resultSet.getString("question_surveyid")).thenReturn("survey-123");
        when(resultSet.getString("question_statement")).thenReturn("How satisfied are you?", "Would you recommend us?");
        when(resultSet.getString("question_options")).thenReturn("Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied", "Yes,No");
        when(resultSet.getString("question_type")).thenReturn("MCQ", "Yes/No");
        when(resultSet.getString("question_status")).thenReturn("ACTIVE", "ACTIVE");
        when(resultSet.getBoolean("question_required")).thenReturn(true, true);
        when(resultSet.getString("question_createdby")).thenReturn("questionCreator", "questionCreator");
        when(resultSet.getString("question_lastmodifiedby")).thenReturn("questionModifier", "questionModifier");
        when(resultSet.getLong("question_createdtime")).thenReturn(1672531200000L, 1672531200000L);
        when(resultSet.getLong("question_lastmodifiedtime")).thenReturn(1675219600000L, 1675219600000L);
        when(resultSet.getLong("question_order")).thenReturn(1L, 2L);
        when(resultSet.getString("question_categoryid")).thenReturn("cat-123", "cat-456");
        when(resultSet.getString("question_tenantid")).thenReturn("pb.testing", "pb.testing");
        when(resultSet.getInt("question_weightage")).thenReturn(5, 3);

        
        List<ScorecardSurveyEntity> result = rowMapper.extractData(resultSet);

        
        assertNotNull(result);
        assertEquals(1, result.size()); 

        ScorecardSurveyEntity survey = result.get(0);
        assertEquals("survey-123", survey.getUuid());
        assertEquals("Survey on Feedback", survey.getSurveyTitle());
        assertEquals("Feedback", survey.getSurveyCategory());

        
        assertNotNull(survey.getAuditDetails());
        assertEquals("creatorUser", survey.getAuditDetails().getCreatedBy());
        assertEquals("modifierUser", survey.getAuditDetails().getLastModifiedBy());
        assertEquals(1672531200000L, survey.getAuditDetails().getCreatedTime());
        assertEquals(1675219600000L, survey.getAuditDetails().getLastModifiedTime());

        
        assertEquals(1, survey.getSections().size());
        Section section = survey.getSections().get(0);
        assertEquals("section-123", section.getUuid());
        assertEquals("General Feedback", section.getTitle());

        
        assertEquals(2, section.getQuestions().size());
        for (QuestionWeightage qw : section.getQuestions()) {
            Question question = qw.getQuestion();
            assertNotNull(question.getAuditDetails());
            assertEquals("questionCreator", question.getAuditDetails().getCreatedBy());
            assertEquals("questionModifier", question.getAuditDetails().getLastModifiedBy());
            assertEquals(1672531200000L, question.getAuditDetails().getCreatedTime());
            assertEquals(1675219600000L, question.getAuditDetails().getLastModifiedTime());
        }

        
        verify(resultSet, atLeastOnce()).next();
        verify(resultSet, atLeastOnce()).getString("survey_uuid");
    }

    @Test
    void testExtractData_EmptyResultSet() throws SQLException {
        
        when(resultSet.next()).thenReturn(false);

        List<ScorecardSurveyEntity> result = rowMapper.extractData(resultSet);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testExtractData_ExceptionHandling() throws SQLException {
      
        when(resultSet.next()).thenThrow(new SQLException("Database Error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> rowMapper.extractData(resultSet));

        assertTrue(exception.getMessage().contains("Error while extracting survey data"));
    }
}
