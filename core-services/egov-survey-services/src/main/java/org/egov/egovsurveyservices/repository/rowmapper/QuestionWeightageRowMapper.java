package org.egov.egovsurveyservices.repository.rowmapper;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class QuestionWeightageRowMapper implements ResultSetExtractor<List<QuestionWeightage>> {

    public List<QuestionWeightage> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String, QuestionWeightage> weightageMap = new LinkedHashMap<>();

        while (rs.next()) {
            String uuid = rs.getString("uuid");
            QuestionWeightage section = weightageMap.get(uuid);

            if (section == null) {
                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("createdby"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedBy(rs.getString("lastmodifiedby"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .build();

                section = QuestionWeightage.builder()
                        .questionUuid(rs.getString("questionuuid"))
                        .weightage(rs.getInt("weightage"))
                        .qorder(rs.getLong("qorder"))
                        .build();
            }
            weightageMap.put(uuid, section);
        }
        return new ArrayList<>(weightageMap.values());
    }
}
