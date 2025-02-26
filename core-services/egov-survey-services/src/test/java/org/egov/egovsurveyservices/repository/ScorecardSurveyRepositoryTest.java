package org.egov.egovsurveyservices.repository;

import org.egov.egovsurveyservices.repository.querybuilder.CategoryQueryBuilder;
import org.egov.egovsurveyservices.repository.querybuilder.ScorecardSurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.rowmapper.CategoryRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.ScorecardSurveyRowMapper;
import org.egov.egovsurveyservices.web.models.Category;
import org.egov.egovsurveyservices.web.models.CategorySearchCriteria;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class ScorecardSurveyRepositoryTest {

    @InjectMocks
    private ScorecardSurveyRepository scorecardSurveyRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private ScorecardSurveyRowMapper rowMapper;

    @Mock
    private ScorecardSurveyQueryBuilder surveyQueryBuilder;

    private ScorecardSurveyEntity surveyEntity;
    private ScorecardSurveySearchCriteria searchCriteria;

    @BeforeEach
    void setUp() {
        surveyEntity = ScorecardSurveyEntity.builder()
                .uuid("survey-uuid")
                .surveyTitle("Test Survey")
                .tenantId("default")
                .build();

        searchCriteria = ScorecardSurveySearchCriteria.builder().build();
    }

    @Test
    public void testFetchSurveys_Found() {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = "SELECT * FROM survey WHERE condition";
        when(surveyQueryBuilder.getSurveySearchQuery(searchCriteria, preparedStmtList)).thenReturn(query);

        List<ScorecardSurveyEntity> expectedSurveys = Collections.singletonList(surveyEntity);
        when(jdbcTemplate.query(eq(query), any(Object[].class), eq(rowMapper)))
                .thenReturn(expectedSurveys);

        List<ScorecardSurveyEntity> actualSurveys = scorecardSurveyRepository.fetchSurveys(searchCriteria);

        assertEquals(expectedSurveys, actualSurveys);
        verify(surveyQueryBuilder).getSurveySearchQuery(searchCriteria, preparedStmtList);
        verify(jdbcTemplate).query(query, preparedStmtList.toArray(), rowMapper);
    }

    @Test
    public void testFetchSurveys_NotFound() {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = "SELECT * FROM survey WHERE condition";
        when(surveyQueryBuilder.getSurveySearchQuery(searchCriteria, preparedStmtList)).thenReturn(query);

        when(jdbcTemplate.query(eq(query), any(Object[].class), eq(rowMapper)))
                .thenReturn(Collections.emptyList());

        List<ScorecardSurveyEntity> actualSurveys = scorecardSurveyRepository.fetchSurveys(searchCriteria);

        assertEquals(Collections.emptyList(), actualSurveys);
        verify(surveyQueryBuilder).getSurveySearchQuery(searchCriteria, preparedStmtList);
        verify(jdbcTemplate).query(query, preparedStmtList.toArray(), rowMapper);
    }
}
