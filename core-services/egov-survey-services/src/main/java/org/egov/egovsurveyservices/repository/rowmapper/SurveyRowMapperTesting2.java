package org.egov.egovsurveyservices.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.Section;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;

//@Component
//public class SurveyRowMapperTesting2 implements RowMapper<ScorecardSurveyEntity> {
//	@Override
//	public ScorecardSurveyEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
//	    Map<String, ScorecardSurveyEntity> surveyMap = new HashMap<>();
//
//	    do {
//	        String surveyUuid = rs.getString("survey_uuid");
//
//	        // Extract values before calling computeIfAbsent
//	        String tenantId = rs.getString("survey_tenantid");
//	        String surveyTitle = rs.getString("survey_title");
//	        String surveyCategory = rs.getString("survey_category");
//	        String surveyDescription = rs.getString("survey_description");
//	        long startDate = rs.getLong("survey_startdate");
//	        long endDate = rs.getLong("survey_enddate");
//	        String postedBy = rs.getString("survey_postedby");
//	        boolean active = rs.getBoolean("survey_active");
//	        long answersCount = rs.getLong("survey_answerscount");
//	        boolean hasResponded = rs.getBoolean("survey_hasresponded");
//	        long createdTime = rs.getLong("survey_createdtime");
//	        long lastModifiedTime = rs.getLong("survey_lastmodifiedtime");
//
//	        ScorecardSurveyEntity survey = surveyMap.computeIfAbsent(surveyUuid, k -> {
//	            ScorecardSurveyEntity newSurvey = new ScorecardSurveyEntity();
//	            newSurvey.setUuid(surveyUuid);
//	            newSurvey.setTenantId(tenantId);
//	            newSurvey.setSurveyTitle(surveyTitle);
//	            newSurvey.setSurveyCategory(surveyCategory);
//	            newSurvey.setSurveyDescription(surveyDescription);
//	            newSurvey.setStartDate(startDate);
//	            newSurvey.setEndDate(endDate);
//	            newSurvey.setPostedBy(postedBy);
//	            newSurvey.setActive(active);
//	            newSurvey.setAnswersCount(answersCount);
//	            newSurvey.setHasResponded(hasResponded);
//	            newSurvey.setCreatedTime(createdTime);
//	            newSurvey.setLastModifiedTime(lastModifiedTime);
//	            newSurvey.setSections(new ArrayList<>()); // Initialize sections list
//	            return newSurvey;
//	        });
//
//	        // Get or create Section
//	        String sectionUuid = rs.getString("section_uuid");
//	        Section section = survey.getSections().stream()
//	            .filter(sec -> sec.getUuid().equals(sectionUuid))
//	            .findFirst()
//	            .orElseGet(() -> {
//	                Section newSection = new Section();
//	                newSection.setUuid(sectionUuid);
//	                try {
//	                    newSection.setTitle(rs.getString("section_title"));
//	                    newSection.setWeightage(rs.getInt("section_weightage"));
//	                } catch (SQLException e) {
//	                    throw new RuntimeException("Error mapping section fields", e);
//	                }
//	                newSection.setQuestions(new ArrayList<>());
//	                survey.getSections().add(newSection);
//	                return newSection;
//	            });
//
//	        // Create and add QuestionWeightage
//	        String questionUuid = rs.getString("question_uuid");
//	        Question question = new Question();
//	        question.setUuid(questionUuid);
//	        question.setSurveyId(rs.getString("question_surveyid"));
//	        question.setQuestionStatement(rs.getString("question_statement"));
//	        question.setOptions(Arrays.asList((String[]) rs.getArray("question_options").getArray()));//console showing error here
//	        question.setType(Type.valueOf(rs.getString("question_type")));
//	        question.setStatus(Status.valueOf(rs.getString("question_status")));
//	        question.setRequired(rs.getBoolean("question_required"));
//	        question.setQorder(rs.getLong("question_order"));
//	        question.setCategoryId(rs.getString("question_categoryid"));
//	        question.setTenantId(rs.getString("question_tenantid"));
//
//	        QuestionWeightage questionWeightage = new QuestionWeightage();
//	        questionWeightage.setQuestionUuid(questionUuid);
//	        questionWeightage.setSectionUuid(sectionUuid);
//	        questionWeightage.setQorder(rs.getLong("question_order"));
//	        questionWeightage.setQuestion(question);
//	        questionWeightage.setWeightage(rs.getInt("question_weightage"));
//
//	        section.getQuestions().add(questionWeightage);
//
//	    } while (rs.next());
//
//	    return surveyMap.values().iterator().next();
//	}
//}


@Component
public class SurveyRowMapperTesting2 implements ResultSetExtractor<List<ScorecardSurveyEntity>> {

    @Override
    public List<ScorecardSurveyEntity> extractData(ResultSet rs) throws SQLException {
        Map<String, ScorecardSurveyEntity> surveyMap = new HashMap<>();

        while (rs.next()) {
            String surveyUuid = rs.getString("survey_uuid");

            ScorecardSurveyEntity survey = surveyMap.computeIfAbsent(surveyUuid, k -> {
                try {
                    ScorecardSurveyEntity newSurvey = new ScorecardSurveyEntity();
                    newSurvey.setUuid(surveyUuid);
                    newSurvey.setTenantId(rs.getString("survey_tenantid"));
                    newSurvey.setSurveyTitle(rs.getString("survey_title"));
                    newSurvey.setSurveyCategory(rs.getString("survey_category"));
                    newSurvey.setSurveyDescription(rs.getString("survey_description"));
                    newSurvey.setStartDate(rs.getLong("survey_startdate"));
                    newSurvey.setEndDate(rs.getLong("survey_enddate"));
                    newSurvey.setPostedBy(rs.getString("survey_postedby"));
                    newSurvey.setActive(rs.getBoolean("survey_active"));
                    newSurvey.setAnswersCount(rs.getLong("survey_answerscount"));
                    newSurvey.setHasResponded(rs.getBoolean("survey_hasresponded"));
                    newSurvey.setCreatedTime(rs.getLong("survey_createdtime"));
                    newSurvey.setLastModifiedTime(rs.getLong("survey_lastmodifiedtime"));
                    newSurvey.setSections(new ArrayList<>());
                    return newSurvey;
                } catch (SQLException e) {
                    throw new RuntimeException("Error mapping survey fields", e);
                }
            });

            // Process Sections
            String sectionUuid = rs.getString("section_uuid");
            if (sectionUuid != null) {
                Section section = survey.getSections().stream()
                    .filter(sec -> sec.getUuid().equals(sectionUuid))
                    .findFirst()
                    .orElseGet(() -> {
                        try {
                            Section newSection = new Section();
                            newSection.setUuid(sectionUuid);
                            newSection.setTitle(rs.getString("section_title"));
                            newSection.setWeightage(rs.getInt("section_weightage"));
                            newSection.setQuestions(new ArrayList<>());
                            survey.getSections().add(newSection);
                            return newSection;
                        } catch (SQLException e) {
                            throw new RuntimeException("Error mapping section fields", e);
                        }
                    });

                // Process Questions
                String questionUuid = rs.getString("question_uuid");
                if (questionUuid != null) {
                    try {
                        Question question = new Question();
                        question.setUuid(questionUuid);
                        question.setSurveyId(rs.getString("question_surveyid"));
                        question.setQuestionStatement(rs.getString("question_statement"));
                        question.setOptions(Arrays.asList((String[]) rs.getArray("question_options").getArray()));
                        question.setType(Type.valueOf(rs.getString("question_type")));
                        question.setStatus(Status.valueOf(rs.getString("question_status")));
                        question.setRequired(rs.getBoolean("question_required"));
                        question.setQorder(rs.getLong("question_order"));
                        question.setCategoryId(rs.getString("question_categoryid"));
                        question.setTenantId(rs.getString("question_tenantid"));

                        QuestionWeightage questionWeightage = new QuestionWeightage();
                        questionWeightage.setQuestionUuid(questionUuid);
                        questionWeightage.setSectionUuid(sectionUuid);
                        questionWeightage.setQorder(rs.getLong("question_order"));
                        questionWeightage.setQuestion(question);
                        questionWeightage.setWeightage(rs.getInt("question_weightage"));

                        section.getQuestions().add(questionWeightage);
                    } catch (SQLException e) {
                    	e.printStackTrace();
                        throw new RuntimeException("Error mapping question fields", e);
                    }
                }
            }
        }

        return new ArrayList<>(surveyMap.values());
    }
}