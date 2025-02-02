package org.egov.egovsurveyservices.repository.rowmapper;

import org.checkerframework.checker.units.qual.A;
import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Category;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionRowMapperTest {

    @Mock
    private ResultSet rs;

    @Test
    public void testExtractData_SingleQuestion() throws SQLException, DataAccessException {
        String uuid = "test-uuid";
        String tenantId = "default";
        String surveyId = "survey-123";
        String questionStatement = "What is your name?";
        Status status = Status.ACTIVE;
        boolean required = true;
        String options = "option1,option2";
        Type type = Type.MULTIPLE_ANSWER_TYPE;
        String categoryId = "category-id";
        String categoryLabel = "Category Label";
        when(rs.getString("uuid")).thenReturn(uuid);
        when(rs.getString("tenantid")).thenReturn(tenantId);
        when(rs.getString("surveyid")).thenReturn(surveyId);
        when(rs.getString("questionstatement")).thenReturn(questionStatement);
        when(rs.getString("status")).thenReturn(status.toString());
        when(rs.getBoolean("required")).thenReturn(required);
        when(rs.getString("options")).thenReturn(options);
        when(rs.getString("type")).thenReturn(type.toString());
        when(rs.getString("categoryid")).thenReturn(categoryId);
        when(rs.getString("category_id")).thenReturn(categoryId);
        when(rs.getString("category_label")).thenReturn(categoryLabel);
        when(rs.getString("createdby")).thenReturn("creator");
        when(rs.getLong("createdtime")).thenReturn(System.currentTimeMillis());
        when(rs.getString("lastmodifiedby")).thenReturn("creator");
        when(rs.getLong("lastmodifiedtime")).thenReturn(System.currentTimeMillis());
        when(rs.next()).thenReturn(true, false);
        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(1, questions.size());

        Question question = questions.get(0);
        assertEquals(uuid, question.getUuid());
        assertEquals(tenantId, question.getTenantId());
        assertEquals(surveyId, question.getSurveyId());
        assertEquals(questionStatement, question.getQuestionStatement());
        assertEquals(status, question.getStatus());
        assertEquals(required, question.getRequired());
        assertEquals(Arrays.asList(options.split(",")), question.getOptions());
        assertEquals(type, question.getType());
        assertEquals(categoryId, question.getCategory().getId());
        assertEquals(categoryLabel, question.getCategory().getLabel());

        verify(rs,times(2)).getString("uuid");
        verify(rs).getString("tenantid");
        verify(rs).getString("surveyid");
        verify(rs).getString("questionstatement");
        verify(rs).getString("status");
        verify(rs).getBoolean("required");
        verify(rs).getString("options");
        verify(rs).getString("type");
        verify(rs).getString("categoryid");
        verify(rs).getString("category_label");
    }

    @Test
    public void testExtractData_SQLException() throws SQLException {
        when(rs.next()).thenThrow(new SQLException("Database Error"));

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        assertThrows(SQLException.class, () -> questionRowMapper.extractData(rs));
    }

    @Test
    public void testExtractData_NoRows() throws SQLException {
        when(rs.next()).thenReturn(false);

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(Collections.emptyList(), questions);
    }

    @Test
    public void testExtractData_NullCategoryId() throws SQLException, DataAccessException {
        String uuid = "test-uuid";
        String tenantId = "default";
        String surveyId = "survey-123";
        String questionStatement = "What is your name?";
        Status status = Status.ACTIVE;
        boolean required = true;
        String options = "option1,option2";
        Type type = Type.MULTIPLE_ANSWER_TYPE;

        when(rs.next()).thenReturn(true,false);
        when(rs.getString("uuid")).thenReturn(uuid);
        when(rs.getString("tenantid")).thenReturn(tenantId);
        when(rs.getString("surveyid")).thenReturn(surveyId);
        when(rs.getString("questionstatement")).thenReturn(questionStatement);
        when(rs.getString("status")).thenReturn(status.toString());
        when(rs.getBoolean("required")).thenReturn(required);
        when(rs.getString("options")).thenReturn(options);
        when(rs.getString("type")).thenReturn(type.toString());
        when(rs.getString("categoryid")).thenReturn(null);
        when(rs.getString("category_id")).thenReturn(null);
        when(rs.getString("createdby")).thenReturn("creator");
        when(rs.getLong("createdtime")).thenReturn(1L);
        when(rs.getString("lastmodifiedby")).thenReturn("creator");
        when(rs.getLong("lastmodifiedtime")).thenReturn(1L);

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(1, questions.size());
        assertNull(questions.get(0).getCategory());
    }

    @Test
    public void testExtractData_MultipleData() throws SQLException, DataAccessException {
        String tenantId = "default";
        String surveyId = "survey-123";
        String questionStatement = "What is your name?";
        Status status = Status.ACTIVE;
        boolean required = true;
        String options = "option1,option2";
        Type type = Type.MULTIPLE_ANSWER_TYPE;

        when(rs.next()).thenReturn(true,true,false);
        when(rs.getString("uuid")).thenReturn("1","2");
        when(rs.getString("tenantid")).thenReturn(tenantId);
        when(rs.getString("surveyid")).thenReturn(surveyId);
        when(rs.getString("questionstatement")).thenReturn(questionStatement);
        when(rs.getString("status")).thenReturn(status.toString());
        when(rs.getBoolean("required")).thenReturn(required);
        when(rs.getString("options")).thenReturn(options);
        when(rs.getString("type")).thenReturn(type.toString());
        when(rs.getString("categoryid")).thenReturn("category1","category2");
        when(rs.getString("category_id")).thenReturn("category1","category2");
        when(rs.getString("createdby")).thenReturn("creator");
        when(rs.getLong("createdtime")).thenReturn(1L);
        when(rs.getString("lastmodifiedby")).thenReturn("creator");
        when(rs.getLong("lastmodifiedtime")).thenReturn(1L);

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(2, questions.size());
    }

    @Test
    public void testExtractData_MultipleData_conditionalCoverage() throws SQLException, DataAccessException {
        String tenantId = "default";
        String surveyId = "survey-123";
        String questionStatement = "What is your name?";
        Status status = Status.ACTIVE;
        boolean required = true;
        String options = "option1,option2";
        Type type = Type.MULTIPLE_ANSWER_TYPE;

        when(rs.next()).thenReturn(true,true,false);
        when(rs.getString("uuid")).thenReturn("1","1");
        when(rs.getString("tenantid")).thenReturn(tenantId);
        when(rs.getString("surveyid")).thenReturn(surveyId);
        when(rs.getString("questionstatement")).thenReturn(questionStatement);
        when(rs.getString("status")).thenReturn(status.toString());
        when(rs.getBoolean("required")).thenReturn(required);
        when(rs.getString("options")).thenReturn(options);
        when(rs.getString("type")).thenReturn(type.toString());
        when(rs.getString("categoryid")).thenReturn("category1","category2");
        when(rs.getString("category_id")).thenReturn("category1","category2");
        when(rs.getString("createdby")).thenReturn("creator");
        when(rs.getLong("createdtime")).thenReturn(1L);
        when(rs.getString("lastmodifiedby")).thenReturn("creator");
        when(rs.getLong("lastmodifiedtime")).thenReturn(1L);

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(1, questions.size());
    }

    @Test
    public void testExtractData_MultipleData_conditionalCoverage2() throws SQLException, DataAccessException {
        String tenantId = "default";
        String surveyId = "survey-123";
        String questionStatement = "What is your name?";
        Status status = Status.ACTIVE;
        boolean required = true;
        String options = "option1,option2";
        Type type = Type.MULTIPLE_ANSWER_TYPE;

        when(rs.next()).thenReturn(true,true,false);
        when(rs.getString("uuid")).thenReturn("1","1");
        when(rs.getString("tenantid")).thenReturn(tenantId);
        when(rs.getString("surveyid")).thenReturn(surveyId);
        when(rs.getString("questionstatement")).thenReturn(questionStatement);
        when(rs.getString("status")).thenReturn(status.toString());
        when(rs.getBoolean("required")).thenReturn(required);
        when(rs.getString("options")).thenReturn(options);
        when(rs.getString("type")).thenReturn(type.toString());
        when(rs.getString("categoryid")).thenReturn("category1");
        when(rs.getString("category_id")).thenReturn("category1");
        when(rs.getString("category_label")).thenThrow(new SQLException("Database Error"));
        when(rs.getString("createdby")).thenReturn("creator");
        when(rs.getLong("createdtime")).thenReturn(1L);
        when(rs.getString("lastmodifiedby")).thenReturn("creator");
        when(rs.getLong("lastmodifiedtime")).thenReturn(1L);

        QuestionRowMapper questionRowMapper = new QuestionRowMapper();
        List<Question> questions = questionRowMapper.extractData(rs);

        assertEquals(1, questions.size());
    }
}