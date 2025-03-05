package org.egov.egovsurveyservices.repository;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.egov.egovsurveyservices.repository.querybuilder.ScorecardSurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.querybuilder.SurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.rowmapper.AnswerRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.QuestionRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.ScorecardSurveyRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.SurveyRowMapper;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SingleColumnRowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private QuestionRowMapper questionRowMapper;

    @Autowired
    private AnswerRowMapper answerRowMapper;

    
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

}
