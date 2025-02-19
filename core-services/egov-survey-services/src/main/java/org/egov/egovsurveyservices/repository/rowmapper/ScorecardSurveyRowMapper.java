package org.egov.egovsurveyservices.repository.rowmapper;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

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

                Long lastModifiedTime = rs.getLong("lastmodifiedtime");
                if (rs.wasNull()) {
                    lastModifiedTime = null;
                }

                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("screatedby"))
                        .createdTime(rs.getLong("screatedtime"))
                        .lastModifiedBy(rs.getString("slastmodifiedby"))
                        .lastModifiedTime(lastModifiedTime)
                        .build();

                surveyEntity = ScorecardSurveyEntity.builder()
                        .uuid(rs.getString("uuid"))
                        .tenantId(rs.getString("tenantid"))
                        .surveyCategory(rs.getString("category"))
                        .surveyTitle(rs.getString("title"))
                        .surveyDescription(rs.getString("description"))
                        .startDate(rs.getLong("startdate"))
                        .endDate(rs.getLong("enddate"))
                        .postedBy(rs.getString("postedby"))
                        .active(rs.getBoolean("active"))
                        .answersCount(rs.getLong("answercount"))
                        .hasResponded(rs.getBoolean("hasresponded"))
                        .auditDetails(auditdetails)
                        .build();
            }
            surveyEntityMap.put(uuid, surveyEntity);
        }
        return new ArrayList<>(surveyEntityMap.values());
    }

}
