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
        // Mock ResultSet behavior for multiple rows (same survey, multiple sections/questions)
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

        // Mock Section Data
        when(resultSet.getString("section_uuid")).thenReturn("section-123");
        when(resultSet.getString("section_title")).thenReturn("General Feedback");
        when(resultSet.getInt("section_weightage")).thenReturn(10);

        // Mock Question Data for multiple questions
        when(resultSet.getString("question_uuid")).thenReturn("question-123", "question-456");
        when(resultSet.getString("question_surveyid")).thenReturn("survey-123");
        when(resultSet.getString("question_statement")).thenReturn("How satisfied are you?", "Would you recommend us?");
        when(resultSet.getString("question_options")).thenReturn("Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied", "Yes,No");
        when(resultSet.getString("question_type")).thenReturn("MCQ", "Yes/No");
        when(resultSet.getString("question_status")).thenReturn("ACTIVE", "ACTIVE");
        when(resultSet.getBoolean("question_required")).thenReturn(true, true);
        when(resultSet.getString("question_createdby")).thenReturn("admin", "admin");
        when(resultSet.getString("question_lastmodifiedby")).thenReturn("admin", "admin");
        when(resultSet.getLong("question_createdtime")).thenReturn(1672531200000L, 1672531200000L);
        when(resultSet.getLong("question_lastmodifiedtime")).thenReturn(1675219600000L, 1675219600000L);
        when(resultSet.getLong("question_order")).thenReturn(1L, 2L);
        when(resultSet.getString("question_categoryid")).thenReturn("cat-123", "cat-456");
        when(resultSet.getString("question_tenantid")).thenReturn("pb.testing", "pb.testing");
        when(resultSet.getInt("question_weightage")).thenReturn(5, 3);

        // Execute row mapper
        List<ScorecardSurveyEntity> result = rowMapper.extractData(resultSet);

        // Assertions
        assertNotNull(result);
        assertEquals(1, result.size()); // Should return 1 survey

        ScorecardSurveyEntity survey = result.get(0);
        assertEquals("survey-123", survey.getUuid());
        assertEquals("Survey on Feedback", survey.getSurveyTitle());
        assertEquals("Feedback", survey.getSurveyCategory());

        // Check Section
        assertEquals(1, survey.getSections().size());
        Section section = survey.getSections().get(0);
        assertEquals("section-123", section.getUuid());
        assertEquals("General Feedback", section.getTitle());

        // Check Questions
        assertEquals(2, section.getQuestions().size());
        Set<String> questionUuids = section.getQuestions().stream()
                .map(QuestionWeightage::getQuestionUuid)
                .collect(Collectors.toSet());
        assertTrue(questionUuids.contains("question-123"));
        assertTrue(questionUuids.contains("question-456"));

        // Verify interactions with ResultSet
        verify(resultSet, atLeastOnce()).next();
        verify(resultSet, atLeastOnce()).getString("survey_uuid");
    }

    @Test
    void testExtractData_EmptyResultSet() throws SQLException {
        // Mocking empty result set
        when(resultSet.next()).thenReturn(false);

        // Execute row mapper
        List<ScorecardSurveyEntity> result = rowMapper.extractData(resultSet);

        // Assertions
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testExtractData_ExceptionHandling() throws SQLException {
        // Simulate SQLException
        when(resultSet.next()).thenThrow(new SQLException("Database Error"));

        // Execute and assert exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> rowMapper.extractData(resultSet));

        assertTrue(exception.getMessage().contains("Error while extracting survey data"));
    }
}
