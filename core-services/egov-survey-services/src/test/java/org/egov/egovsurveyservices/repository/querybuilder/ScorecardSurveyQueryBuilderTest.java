package org.egov.egovsurveyservices.repository.querybuilder;

import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.repository.rowmapper.AnswerRowMapper;
import org.egov.egovsurveyservices.web.models.Answer;
import org.egov.egovsurveyservices.web.models.CategorySearchCriteria;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class ScorecardSurveyQueryBuilderTest {

    @InjectMocks
    private ScorecardSurveyQueryBuilder queryBuilder;

    @Mock
    private ApplicationProperties config;

    private List<Object> preparedStmtList;
    private ScorecardSurveySearchCriteria criteria;

    @BeforeEach
    void setUp() {
        preparedStmtList = new ArrayList<>();
        criteria = new ScorecardSurveySearchCriteria();
    }

    @Test
    public void testGetSurveySearchQuery_WithUuid() {
        criteria.setUuid("test-uuid");
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("WHERE survey.uuid = ?"));
        assertEquals(1, preparedStmtList.size());
        assertEquals("test-uuid", preparedStmtList.get(0));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveySearchQuery_WithTenantId() {
        criteria.setTenantId("test-tenant");
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("WHERE ( survey.tenantid = ? or survey.tenantid = 'pb.punjab' )"));
        assertEquals(1, preparedStmtList.size());
        assertEquals("test-tenant", preparedStmtList.get(0));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveySearchQuery_WithTitle() {
        criteria.setTitle("test-title");
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("survey.title ILIKE ?"));
        assertEquals(1, preparedStmtList.size());
        assertEquals("%test-title%", preparedStmtList.get(0));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveySearchQuery_WithMultipleCriteria() {
        criteria.setUuid("test-uuid");
        criteria.setTenantId("test-tenant");
        criteria.setTitle("test-title");
        when(config.getMaxSsSearchLimit()).thenReturn(500);

        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("WHERE survey.uuid = ?"));
        assertTrue(query.contains("AND ( survey.tenantid = ? or survey.tenantid = 'pb.punjab' )"));
        assertTrue(query.contains("AND survey.title ILIKE ?"));
        assertEquals(3, preparedStmtList.size());
        assertEquals("test-uuid", preparedStmtList.get(0));
        assertEquals("test-tenant", preparedStmtList.get(1));
        assertEquals("%test-title%", preparedStmtList.get(2));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveyUuidsToCountMapQuery() {
        List<String> surveyIds = Arrays.asList("id1", "id2");
        String query = queryBuilder.getSurveyUuidsToCountMapQuery(surveyIds, preparedStmtList);

        assertTrue(query.contains("WHERE answer.surveyid IN"));
        assertTrue(query.contains("GROUP  BY surveyid"));
        assertEquals(2, preparedStmtList.size());
        assertEquals("id1", preparedStmtList.get(0));
        assertEquals("id2", preparedStmtList.get(1));
    }
    
    @Test
    public void testGetSurveySearchQuery_WithActiveTrue() {
        criteria.setActive(true);
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("survey.active = ?"));
        assertEquals(1, preparedStmtList.size());
        assertEquals(true, preparedStmtList.get(0));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveySearchQuery_WithActiveFalse() {
        criteria.setActive(false);
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("survey.active = ?"));
        assertEquals(1, preparedStmtList.size());
        assertEquals(false, preparedStmtList.get(0));
        assertTrue(query.contains("LIMIT 500"));
    }

    @Test
    public void testGetSurveySearchQuery_WithoutActiveFilter() {
        criteria.setActive(null);  // No active filter applied
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertFalse(query.contains("survey.active = ?")); // Active filter should not be present
        assertEquals(0, preparedStmtList.size()); // No parameters should be added
        assertTrue(query.contains("LIMIT 500"));
    }
    
    @Test
    public void testGetSurveySearchQuery_WithOpenSurveyFlag() {
        criteria.setOpenSurveyFlag(true);
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertTrue(query.contains("? BETWEEN survey.startdate AND survey.enddate"));

        assertEquals(1, preparedStmtList.size()); // Only one value (System.currentTimeMillis()) is added
        assertTrue(query.contains("LIMIT 500"));
    }


    @Test
    public void testGetSurveySearchQuery_WithoutOpenSurveyFlag() {
        criteria.setOpenSurveyFlag(false); // Should not add the open survey filter
        when(config.getMaxSsSearchLimit()).thenReturn(500);
        String query = queryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        assertFalse(query.contains("? BETWEEN survey.startdate AND survey.enddate"));

        // Ensure no extra parameters are added
        assertEquals(0, preparedStmtList.size());
        assertTrue(query.contains("LIMIT 500"));
    }
    
    @Test
    void testGetAnswers_ReturnsCorrectQuery() {
        String expectedQuery = "SELECT " +
                "answer.uuid, " +
                "answer.questionuuid, " +
                "answer.surveyuuid, " +
                "answer.sectionuuid, " +
                "answer.answer, " +
                "answer.citizenid, " +
                "answer.city, " +
                "answer.comments, " +
                "answer.createdby , " +
                "answer.lastmodifiedby, " +
                "answer.createdtime, " +
                "answer.lastmodifiedtime, " +
                "question.questionstatement " +
                "FROM public.eg_ss_answer AS answer " +
                "LEFT JOIN public.eg_ss_question AS question " +
                "ON answer.questionuuid = question.uuid " +
                "WHERE answer.surveyuuid = ? AND answer.citizenid = ?";

        String actualQuery = queryBuilder.getAnswers();

        assertEquals(expectedQuery, actualQuery, "The generated SQL query does not match the expected query.");
    }


}