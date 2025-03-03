package org.egov.egovsurveyservices.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.egov.egovsurveyservices.web.models.AuditDetails;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.Section;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;


//public class ScorecardSurveyRowMapper implements RowMapper<ScorecardSurveyEntity> {
//
//    @Override
//    public ScorecardSurveyEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
//        return ScorecardSurveyEntity.builder()
//                .uuid(rs.getString("uuid")) // Primary Key
//                .tenantId(rs.getString("tenantid"))
//                .surveyTitle(rs.getString("title"))
//                .surveyCategory(rs.getString("category"))
//                .surveyDescription(rs.getString("description"))
//                .startDate(rs.getLong("startdate"))
//                .endDate(rs.getLong("enddate"))
//                .postedBy(rs.getString("postedby"))
//                .active(rs.getBoolean("active"))
//                .answersCount(rs.getLong("answerscount"))
//                .hasResponded(rs.getBoolean("hasresponded"))
//                .createdTime(rs.getLong("createdtime"))
//                .lastModifiedTime(rs.getLong("lastmodifiedtime"))
//                .build();
//    }
//}

//@Component
//public class ScorecardSurveyRowMapper implements RowMapper<ScorecardSurveyEntity> {
//	
//    @Override
//    public ScorecardSurveyEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
//    	
//    	// Build Question object
//        Question question = Question.builder()
//                .uuid(rs.getString("question_uuid"))
//                .surveyId(rs.getString("question_surveyid"))
//                .questionStatement(rs.getString("question_statement"))
//                .options(Arrays.asList(rs.getString("question_options").split(",")))
//                .type(Type.fromValue(rs.getString("question_type")))
//                .status(Status.fromValue(rs.getString("question_status")))
//                .required(rs.getBoolean("question_required"))
//                .qorder(rs.getLong("question_order"))
//                .categoryId(rs.getString("question_categoryid"))
//                .tenantId(rs.getString("question_tenantid"))
//                .build();
//
//        // Build QuestionWeightage object
//        QuestionWeightage questionWeightage = new QuestionWeightage(
//                rs.getString("question_uuid"),
//                question,
//                rs.getInt("question_weightage")
//        );
//
//        // Build Section object
//        Section section = new Section();
//        section.setUuid(rs.getString("section_uuid"));  
//        section.setTitle(rs.getString("section_title"));
//        section.setWeightage(rs.getInt("section_weightage"));
//        section.setQuestions(Collections.singletonList(questionWeightage));
//
//        // Build ScorecardSurveyEntity object
//        ScorecardSurveyEntity survey = ScorecardSurveyEntity.builder()
//                .uuid(rs.getString("survey_uuid"))
//                .tenantId(rs.getString("survey_tenantid"))
//                .surveyTitle(rs.getString("survey_title"))
//                .surveyCategory(rs.getString("survey_category"))
//                .surveyDescription(rs.getString("survey_description"))
//                .startDate(rs.getLong("survey_startdate"))
//                .endDate(rs.getLong("survey_enddate"))
//                .postedBy(rs.getString("survey_postedby"))
//                .active(rs.getBoolean("survey_active"))
//                .answersCount(rs.getLong("survey_answerscount"))
//                .hasResponded(rs.getBoolean("survey_hasresponded"))
//                .createdTime(rs.getLong("survey_createdtime"))
//                .lastModifiedTime(rs.getLong("survey_lastmodifiedtime"))
//                .sections(Collections.singletonList(section))
//                .build();
//
//        return survey;
//    }
//}

@Component
public class ScorecardSurveyRowMapper implements RowMapper<ScorecardSurveyEntity> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, ScorecardSurveyEntity> surveyMap = new HashMap<>();
    private final Map<String, Section> sectionMap = new HashMap<>();

    @Override
    public ScorecardSurveyEntity mapRow(ResultSet rs, int rowNum) {
        try {
            String surveyUuid = rs.getString("survey_uuid");
            String sectionUuid = rs.getString("section_uuid");
            String questionUuid = rs.getString("question_uuid");

            // Get or create the Survey
            ScorecardSurveyEntity survey = surveyMap.computeIfAbsent(surveyUuid, k -> {
                try {
                    return ScorecardSurveyEntity.builder()
                            .uuid(surveyUuid)
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
                            .createdTime(rs.getLong("survey_createdtime"))
                            .lastModifiedTime(rs.getLong("survey_lastmodifiedtime"))
                            .sections(new ArrayList<>()) // Initialize empty list
                            .build();
                } catch (SQLException e) {
                    throw new RuntimeException("Error mapping survey fields", e);
                }
            });

            // Get or create the Section
            Section section = sectionMap.computeIfAbsent(sectionUuid, k -> {
                try {
                    Section newSection = new Section();
                    newSection.setUuid(sectionUuid);
                    newSection.setTitle(rs.getString("section_title"));
                    newSection.setWeightage(rs.getInt("section_weightage"));
                    newSection.setQuestions(new ArrayList<>());
                    survey.getSections().add(newSection); // Add section to survey
                    return newSection;
                } catch (SQLException e) {
                    throw new RuntimeException("Error mapping section fields", e);
                }
            });

            // Convert options field to List<String>
            List<String> options = new ArrayList<>();
            String optionsStr = rs.getString("question_options");
            if (optionsStr != null && !optionsStr.trim().isEmpty()) {
                try {
                    if (optionsStr.startsWith("[") && optionsStr.endsWith("]")) {
                        options = objectMapper.readValue(optionsStr, new TypeReference<List<String>>() {});
                    } else {
                        options = Arrays.asList(optionsStr.split("\\s*,\\s*"));
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error parsing question options: " + optionsStr, e);
                }
            }

            // Convert ENUM fields safely
            Type questionType = Type.fromValue(rs.getString("question_type"));
            Status questionStatus = Status.fromValue(rs.getString("question_status"));

            // Build Question object
            Question question = Question.builder()
                    .uuid(questionUuid)
                    .surveyId(rs.getString("question_surveyid"))
                    .questionStatement(rs.getString("question_statement"))
                    .options(options)
                    .type(questionType)
                    .status(questionStatus)
                    .required(rs.getBoolean("question_required"))
                    .qorder(rs.getLong("question_order"))
                    .categoryId(rs.getString("question_categoryid"))
                    .tenantId(rs.getString("question_tenantid"))
                    .build();

            // Build QuestionWeightage object
            QuestionWeightage questionWeightage = new QuestionWeightage(
                    questionUuid,
                    question,
                    rs.getInt("question_weightage")
            );

            // Add question to the appropriate section
            section.getQuestions().add(questionWeightage);

            return survey; // Return updated survey with aggregated sections and questions

        } catch (SQLException e) {
            throw new RuntimeException("Error mapping row in ScorecardSurveyRowMapper", e);
        }
    }
}

