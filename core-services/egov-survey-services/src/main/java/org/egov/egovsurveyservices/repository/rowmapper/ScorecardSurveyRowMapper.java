package org.egov.egovsurveyservices.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.Section;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ScorecardSurveyRowMapper implements ResultSetExtractor<List<ScorecardSurveyEntity>> {

    @Override
    public List<ScorecardSurveyEntity> extractData(ResultSet rs) {
        Map<String, ScorecardSurveyEntity> surveyMap = new HashMap<>();

        try {
            while (rs.next()) {
                String surveyUuid = rs.getString("survey_uuid");

                surveyMap.computeIfAbsent(surveyUuid, uuid -> {
                    try {
                        return ScorecardSurveyEntity.builder()
                                .uuid(uuid)
                                .tenantId(rs.getString("survey_tenantid"))
                                .surveyTitle(rs.getString("survey_title"))
                                .surveyCategory(rs.getString("survey_category"))
                                .surveyDescription(rs.getString("survey_description"))
                                .startDate(rs.getLong("survey_startdate"))
                                .endDate(rs.getLong("survey_enddate"))
                                .postedBy(rs.getString("survey_postedby"))
                                .active(rs.getBoolean("survey_active"))
                                .answersCount(rs.getLong("survey_answerscount"))
                                .hasResponded(rs.getBoolean("survey_hasresponded"))
                                .auditDetails(AuditDetails.builder()
                                        .createdBy(rs.getString("survey_createdby"))
                                        .lastModifiedBy(rs.getString("survey_lastmodifiedby"))
                                        .createdTime(rs.getLong("survey_createdtime"))
                                        .lastModifiedTime(rs.getLong("survey_lastmodifiedtime"))
                                        .build())
                                .createdTime(rs.getLong("survey_createdtime"))
                                .lastModifiedTime(rs.getLong("survey_lastmodifiedtime"))
                                .sections(new ArrayList<>())
                                .build();
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });

                String sectionUuid = rs.getString("section_uuid");
                if (sectionUuid != null) {
                    Section section = surveyMap.get(surveyUuid).getSections().stream()
                            .filter(s -> s.getUuid().equals(sectionUuid))
                            .findFirst()
                            .orElseGet(() -> {
                                try {
                                    Section newSection = Section.builder()
                                            .uuid(sectionUuid)
                                            .title(rs.getString("section_title"))
                                            .weightage(rs.getInt("section_weightage"))
                                            .questions(new ArrayList<>())
                                            .build();
                                    surveyMap.get(surveyUuid).getSections().add(newSection);
                                    return newSection;
                                } catch (SQLException e) {
                                    throw new RuntimeException(e);
                                }
                            });

                    String questionUuid = rs.getString("question_uuid");
                    if (questionUuid != null) {
                        Question question = Question.builder()
                                .uuid(questionUuid)
                                .surveyId(rs.getString("question_surveyid"))
                                .questionStatement(rs.getString("question_statement"))
                                .options(Arrays.asList(rs.getString("question_options").split(",")))
                                .type(org.egov.egovsurveyservices.web.models.enums.Type.fromValue(rs.getString("question_type")))
                                .status(org.egov.egovsurveyservices.web.models.enums.Status.fromValue(rs.getString("question_status")))
                                .required(rs.getBoolean("question_required"))
                                .auditDetails(AuditDetails.builder()
                                        .createdBy(rs.getString("question_createdby"))
                                        .lastModifiedBy(rs.getString("question_lastmodifiedby"))
                                        .createdTime(rs.getLong("question_createdtime"))
                                        .lastModifiedTime(rs.getLong("question_lastmodifiedtime"))
                                        .build())
                                .qorder(rs.getLong("question_order"))
                                .categoryId(rs.getString("question_categoryid"))
                                .tenantId(rs.getString("question_tenantid"))
                                .build();

                        QuestionWeightage questionWeightage = QuestionWeightage.builder()
                                .questionUuid(questionUuid)
                                .sectionUuid(sectionUuid)
                                .weightage(rs.getInt("question_weightage"))
                                .question(question)
                                .build();

                        section.getQuestions().add(questionWeightage);
                    }
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error while extracting survey data", e);
        }

        return new ArrayList<>(surveyMap.values());
    }
}
