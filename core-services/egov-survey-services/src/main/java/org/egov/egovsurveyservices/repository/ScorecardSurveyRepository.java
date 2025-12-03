package org.egov.egovsurveyservices.repository;

import lombok.extern.slf4j.Slf4j;

import org.egov.egovsurveyservices.repository.querybuilder.ScorecardSurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.rowmapper.*;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.Section;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class ScorecardSurveyRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ScorecardSurveyRowMapper rowMapper;

    @Autowired
    private ScorecardSurveyQueryBuilder surveyQueryBuilder;

    public List<ScorecardSurveyEntity> fetchSurveys(ScorecardSurveySearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = surveyQueryBuilder.getSurveySearchQuery(criteria, preparedStmtList);

        log.info("Generated Query: " + query + " | Params: " + preparedStmtList);

        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }

    public boolean allQuestionsExist(List<String> questionUuids) {
        String placeholders = questionUuids.stream().map(uuid -> "?").collect(Collectors.joining(","));
        String query = surveyQueryBuilder.allQuestionExistsQuery(placeholders);
        List<String> foundUuids = jdbcTemplate.query(query, questionUuids.toArray(), (rs, rowNum) -> rs.getString("uuid"));
        return foundUuids.containsAll(questionUuids);
    }

    public List<Section> fetchSectionListBasedOnSurveyId(String surveyId) {
        List<Object> preparedStmtList = new ArrayList<>();
        if (ObjectUtils.isEmpty(surveyId))
            throw new CustomException("EG_SY_SURVEYID_ERR", "Cannot fetch section list without surveyId");
        String query = surveyQueryBuilder.fetchSectionListBasedOnSurveyId();
        preparedStmtList.add(surveyId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), new SectionRowMapper());
    }

    public List<QuestionWeightage> fetchQuestionsWeightageListBySurveyAndSection(String surveyId, String sectionId) {
        List<Object> preparedStmtList = new ArrayList<>();
        if (ObjectUtils.isEmpty(surveyId) || ObjectUtils.isEmpty(sectionId))
            throw new CustomException("EG_SY_SURVEYID_SECTIONID_ERR", "Cannot fetch question list without surveyId and sectionId");
        String query = surveyQueryBuilder.fetchQuestionsWeightageListBySurveyAndSection();
        preparedStmtList.add(surveyId);
        preparedStmtList.add(sectionId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), new QuestionWeightageWithQuestionRowMapper());
    }

    public String getExistingAnswerUuid(String answerUuid) {
        String query = surveyQueryBuilder.getExistingAnswerUuid();
        try {
            return jdbcTemplate.queryForObject(query, new Object[]{answerUuid}, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public String getExistingAnswerUuid(String surveyResponseUuid, String questionUuid) {
        String query = "SELECT uuid FROM eg_ss_answer WHERE surveyresponseuuid = ? AND questionuuid = ? LIMIT 1";
        try {
            return jdbcTemplate.queryForObject(query, new Object[]{surveyResponseUuid, questionUuid}, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public String getSurveyResponseUuidForAnswers(List<String> answerUuids) {
        String query = "SELECT surveyresponseuuid FROM eg_ss_answer WHERE uuid::uuid = ANY(?::uuid[]) LIMIT 1";
        try {
            return jdbcTemplate.queryForObject(query, new Object[]{answerUuids.toArray(new String[0])}, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public String getExistingSurveyResponseUuid(String surveyUuid, String citizenId, String tenantId) {
        String query = "SELECT uuid FROM eg_ss_survey_response WHERE surveyuuid = ? AND citizenid = ? AND tenantid = ? LIMIT 1";
        try {
            return jdbcTemplate.queryForObject(query, new Object[]{surveyUuid, citizenId, tenantId}, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public List<AnswerNew> getAnswers(String surveyUuid, String citizenId, String tenantId) {
        String query=surveyQueryBuilder.getAnswers();
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(surveyUuid);
        preparedStmtList.add(citizenId);
        preparedStmtList.add(tenantId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), new AnswerRowMapper());
    }

    public List<AnswerNew> getAnswersForPlainSearch(String surveyUuid, String citizenId, String tenantId) {
        String query=surveyQueryBuilder.getAnswersForPlainSearch();
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(tenantId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), new AnswerRowMapper());
    }

    public List<SurveyResponseNew> getSurveyResponseDetails(String surveyUuid, String citizenId, String tenantId) {
        String query = surveyQueryBuilder.getSurveyResponseDetails();
        try {
            return jdbcTemplate.query(query, new Object[]{surveyUuid, citizenId, tenantId}, new SurveyResponseRowMapper());
        } catch (EmptyResultDataAccessException e) {
            return null; // No existing response found
        }
    }



    public String fetchTenantIdBasedOnSurveyId(String surveyId) {
        if (ObjectUtils.isEmpty(surveyId))
            throw new CustomException("EG_SS_SURVEYID_ERR", "please provide a valid surveyId");
        String query = surveyQueryBuilder.fetchTenantIdBasedOnSurveyId();
        try {
            return jdbcTemplate.queryForObject(query, new Object[]{surveyId}, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public List<AnswerDetail> getAnswerDetailsByAnswerUuid(String answerUuid) {
        String query = surveyQueryBuilder.getAnswerDetailsByAnswerUuid();
        return jdbcTemplate.query(query, new Object[]{answerUuid}, (rs, rowNum) ->
                AnswerDetail.builder().uuid(rs.getString("uuid")).build());
    }

    // Fetch all survey UUIDs for a tenant
    public List<String> getSurveyUuidsByTenant(String tenantId) {
        String query = "SELECT uuid FROM eg_ss_survey_entity WHERE tenantid = ?";
        return jdbcTemplate.query(query, new Object[]{tenantId}, (rs, rowNum) -> rs.getString("uuid"));
    }

    // Fetch answers for a given survey + tenant
    public List<AnswerNew> getAnswersForSurvey(String surveyUuid, String tenantId) {
        String query =
                "SELECT ans.uuid, ans.sectionuuid, ans.questionuuid, ans.comments, " +
                        "q.questionstatement, " +
                        "qw.weightage AS question_weightage, " +
                        "sec.weightage AS section_weightage, " +
                        "ad.uuid AS answer_detail_uuid, ad.answertype AS answer_detail_type, " +
                        "ad.answercontent AS answer_detail_content, ad.weightage AS answer_detail_weightage, " +
                        "ans.createdby, ans.lastmodifiedby, ans.createdtime, ans.lastmodifiedtime " +
                        "FROM eg_ss_answer ans " +
                        "JOIN eg_ss_answer_detail ad ON ans.uuid = ad.answeruuid " +
                        "JOIN eg_ss_question q ON ans.questionuuid = q.uuid " +
                        "LEFT JOIN eg_ss_question_weightage qw ON ans.questionuuid = qw.questionuuid AND ans.sectionuuid = qw.sectionuuid " +
                        "LEFT JOIN eg_ss_survey_section sec ON ans.sectionuuid = sec.uuid " +
                        "JOIN eg_ss_survey_response sr ON ans.surveyresponseuuid = sr.uuid " +
                        "WHERE sr.surveyuuid = ? AND sr.tenantid = ?";

        return jdbcTemplate.query(query, new Object[]{surveyUuid, tenantId}, new AnswerRowMapper());
    }

    // Fetch survey responses (metadata) for a survey + tenant
    public List<SurveyResponseNew> getSurveyResponsesBySurveyAndTenant(String surveyUuid, String tenantId) {
        String query = "SELECT * FROM eg_ss_survey_response WHERE surveyuuid = ? AND tenantid = ?";
        return jdbcTemplate.query(query, new Object[]{surveyUuid, tenantId}, new SurveyResponseRowMapper());
    }

    // Fetch question weightage for a given question + section
    public Integer getQuestionWeightage(String questionUuid, String sectionUuid) {
        String sql = "SELECT weightage " +
                "FROM eg_ss_question_weightage " +
                "WHERE questionuuid = ? AND sectionuuid = ?";
        return jdbcTemplate.query(sql, new Object[]{questionUuid, sectionUuid}, rs -> {
            if (rs.next()) {
                return rs.getInt("weightage");
            }
            return null;
        });
    }

    // Fetch section weightage for a given section
    public Integer getSectionWeightage(String sectionUuid) {
        String sql = "SELECT weightage " +
                "FROM eg_ss_survey_section " +
                "WHERE uuid = ?";
        return jdbcTemplate.query(sql, new Object[]{sectionUuid}, rs -> {
            if (rs.next()) {
                return rs.getInt("weightage");
            }
            return null;
        });
    }

//    public List<AnswerNew> getAnswersForSurvey(String surveyUuid, String tenantId) {
//        String query =
//                "SELECT " +
//                        "ans.uuid, ans.sectionuuid, ans.questionuuid, ans.comments, " +
//                        "q.questionstatement, " +
//                        "ad.uuid AS answer_detail_uuid, ad.answertype AS answer_detail_type, " +
//                        "ad.answercontent AS answer_detail_content, ad.weightage AS answer_detail_weightage, " +
//                        "ans.createdby, ans.lastmodifiedby, ans.createdtime, ans.lastmodifiedtime " +
//                        "FROM eg_ss_answer ans " +
//                        "JOIN eg_ss_answer_detail ad ON ans.uuid = ad.answeruuid " +
//                        "JOIN eg_ss_question q ON ans.questionuuid = q.uuid " +
//                        "JOIN eg_ss_survey_response sr ON ans.surveyresponseuuid = sr.uuid " +
//                        "WHERE sr.surveyuuid = ? AND sr.tenantid = ?";
//
//        return jdbcTemplate.query(query, new Object[]{surveyUuid, tenantId}, new AnswerRowMapper());
//    }
}
