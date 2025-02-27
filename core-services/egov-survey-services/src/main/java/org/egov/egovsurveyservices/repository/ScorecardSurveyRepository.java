package org.egov.egovsurveyservices.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.egovsurveyservices.repository.querybuilder.ScorecardQueryBuilder;

import org.egov.egovsurveyservices.repository.rowmapper.QuestionWeightageWithQuestionRowMapper;
import org.egov.egovsurveyservices.repository.rowmapper.SectionRowMapper;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.Section;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class ScorecardSurveyRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ScorecardQueryBuilder surveyQueryBuilder;

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
}
