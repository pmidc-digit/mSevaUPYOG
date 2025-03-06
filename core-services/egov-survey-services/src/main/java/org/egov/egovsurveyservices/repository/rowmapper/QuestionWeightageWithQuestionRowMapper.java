package org.egov.egovsurveyservices.repository.rowmapper;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class QuestionWeightageWithQuestionRowMapper implements ResultSetExtractor<List<QuestionWeightage>> {

    public List<QuestionWeightage> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String, QuestionWeightage> questionWeightageMap = new LinkedHashMap<>();

        while (rs.next()) {
            String uuid = rs.getString("uuid");
            QuestionWeightage questionWeightage = questionWeightageMap.get(uuid);

            if (questionWeightage == null) {
                AuditDetails auditDetails = AuditDetails.builder()
                        .createdBy(rs.getString("createdby"))
                        .lastModifiedBy(rs.getString("lastmodifiedby"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .build();

                Question question = Question.builder()
                        .uuid(rs.getString("uuid"))
                        .questionStatement(rs.getString("questionstatement"))
                        .options(Arrays.asList(rs.getString("options").split(",")))
                        .status(Status.valueOf(rs.getString("status")))
                        .type(Type.valueOf(rs.getString("type")))
                        .required(rs.getBoolean("required"))
                        .auditDetails(auditDetails)
                        .build();


                questionWeightage = QuestionWeightage.builder()
                        .questionUuid(rs.getString("questionuuid"))
                        .sectionUuid(rs.getString("sectionuuid"))
                        .weightage(rs.getInt("weightage"))
                        .qorder(rs.getLong("qorder"))
                        .question(question)
                        .build();
            }
            questionWeightageMap.put(uuid, questionWeightage);
        }
        return new ArrayList<>(questionWeightageMap.values());
    }
}
