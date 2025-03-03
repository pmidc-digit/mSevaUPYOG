package org.egov.egovsurveyservices.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ScorecardSurveyRowMapper implements ResultSetExtractor<List<ScorecardSurveyEntity>>{
    public List<ScorecardSurveyEntity> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String,ScorecardSurveyEntity> surveyEntityMap = new LinkedHashMap<>();

        while (rs.next()){
            String uuid = rs.getString("uuid");
            ScorecardSurveyEntity surveyEntity = surveyEntityMap.get(uuid);

            if(surveyEntity == null) {

                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("createdby"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedBy(rs.getString("lastmodifiedby"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .build();

                surveyEntity = ScorecardSurveyEntity.builder()
                        .uuid(rs.getString("uuid")) // Primary Key
                        .tenantId(rs.getString("tenantid"))
                        .surveyTitle(rs.getString("title"))
                        .surveyCategory(rs.getString("category"))
                        .surveyDescription(rs.getString("description"))
                        .startDate(rs.getLong("startdate"))
                        .endDate(rs.getLong("enddate"))
                        .postedBy(rs.getString("postedby"))
                        .active(rs.getBoolean("active"))
                        .answersCount(rs.getLong("answerscount"))
                        .hasResponded(rs.getBoolean("hasresponded"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .auditDetails(auditdetails)
                        .build();
            }
            surveyEntityMap.put(uuid, surveyEntity);
        }
        return new ArrayList<>(surveyEntityMap.values());
    }

}
