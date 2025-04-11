package org.egov.egovsurveyservices.repository.rowmapper;

import lombok.extern.slf4j.Slf4j;
import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Category;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Slf4j
@Component
public class QuestionRowMapper implements ResultSetExtractor<List<Question>>{

    public List<Question> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String,Question> questionMap = new LinkedHashMap<>();

        while (rs.next()){
            String uuid = rs.getString("uuid");
            Question question = questionMap.get(uuid);

            if(question == null) {

                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("createdby"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedBy(rs.getString("lastmodifiedby"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .build();

                question =  Question.builder()
                        .uuid(rs.getString("uuid"))
                        .tenantId(rs.getString("tenantid"))
                        .surveyId(rs.getString("surveyid"))
                        .questionStatement(rs.getString("questionstatement"))
                        .status(Status.fromValue(rs.getString("status")))
                        .required(rs.getBoolean("required"))
                        .options(Arrays.asList(rs.getString("options").split(",")))
                        .type(Type.fromValue(rs.getString("type")))
                        .categoryId(rs.getString("categoryid"))
                        .auditDetails(auditdetails)
                        .build();

                    try {
                        String categoryId = rs.getString("category_id");
                        if (categoryId != null) {
                            Category category = new Category();
                            category.setId(categoryId);
                            category.setLabel(rs.getString("category_label"));
                            question.setCategory(category);
                        }
                    } catch (SQLException e) {
                        log.debug("Category information not found in result set.", e);
                    }

            }
            questionMap.put(uuid, question);
        }
        return new ArrayList<>(questionMap.values());
    }


}
