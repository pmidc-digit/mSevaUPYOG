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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

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
    void testMapRow() throws SQLException {
        // Mock ResultSet behavior
        when(resultSet.getString("uuid")).thenReturn("12345");
        when(resultSet.getString("tenantid")).thenReturn("pb.testing");
        when(resultSet.getString("title")).thenReturn("Survey on citizen Feedback");
        when(resultSet.getString("category")).thenReturn("survey category1");
        when(resultSet.getString("description")).thenReturn("Survey on service quality");
        when(resultSet.getLong("startdate")).thenReturn(1672531200000L);
        when(resultSet.getLong("enddate")).thenReturn(1675219600000L);
        when(resultSet.getString("postedby")).thenReturn("admin");
        when(resultSet.getBoolean("active")).thenReturn(true);
        when(resultSet.getLong("answerscount")).thenReturn(100L);
        when(resultSet.getBoolean("hasresponded")).thenReturn(false);
        when(resultSet.getLong("createdtime")).thenReturn(1672531200000L);
        when(resultSet.getLong("lastmodifiedtime")).thenReturn(1675219600000L);

        // Call mapRow method
        ScorecardSurveyEntity surveyEntity = rowMapper.mapRow(resultSet, 1);

        // Assertions
        assertEquals("12345", surveyEntity.getUuid());
        assertEquals("pb.testing", surveyEntity.getTenantId());
        assertEquals("Survey on citizen Feedback", surveyEntity.getSurveyTitle());
        assertEquals("survey category1", surveyEntity.getSurveyCategory());
        assertEquals("Survey on service quality", surveyEntity.getSurveyDescription());
        assertEquals(1672531200000L, surveyEntity.getStartDate());
        assertEquals(1675219600000L, surveyEntity.getEndDate());
        assertEquals("admin", surveyEntity.getPostedBy());
        assertEquals(true, surveyEntity.getActive());
        assertEquals(100L, surveyEntity.getAnswersCount());
        assertEquals(false, surveyEntity.getHasResponded());
        assertEquals(1672531200000L, surveyEntity.getCreatedTime());
        assertEquals(1675219600000L, surveyEntity.getLastModifiedTime());

        // Verify ResultSet interactions
        verify(resultSet, times(1)).getString("uuid");
        verify(resultSet, times(1)).getString("tenantid");
        verify(resultSet, times(1)).getString("title");
        verify(resultSet, times(1)).getString("category");
        verify(resultSet, times(1)).getString("description");
        verify(resultSet, times(1)).getLong("startdate");
        verify(resultSet, times(1)).getLong("enddate");
        verify(resultSet, times(1)).getString("postedby");
        verify(resultSet, times(1)).getBoolean("active");
        verify(resultSet, times(1)).getLong("answerscount");
        verify(resultSet, times(1)).getBoolean("hasresponded");
        verify(resultSet, times(1)).getLong("createdtime");
        verify(resultSet, times(1)).getLong("lastmodifiedtime");
    }
}


