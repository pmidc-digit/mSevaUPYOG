package org.egov.egovsurveyservices.repository;

import lombok.extern.slf4j.Slf4j;

import org.egov.egovsurveyservices.repository.querybuilder.ScorecardSurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.rowmapper.AnswerRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.ScorecardSurveyRowMapper;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.repository.rowmapper.QuestionWeightageWithQuestionRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.SectionRowMapper;
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

    public boolean fetchWhetherCitizenAlreadyResponded(String surveyId, String citizenId) {
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(surveyId);
        preparedStmtList.add(citizenId);
        String query = surveyQueryBuilder.getCitizenResponseExistsQuery();
        return jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Boolean.class);
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

    public List<Answer> getAnswers(String surveyUuid, String citizenId) {
        String query=surveyQueryBuilder.getAnswers();
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(surveyUuid);
        preparedStmtList.add(citizenId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), new AnswerRowMapper());
    }
}
