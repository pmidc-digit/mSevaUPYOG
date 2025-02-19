package org.egov.egovsurveyservices.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.egovsurveyservices.repository.querybuilder.ScorecardQueryBuilder;
import org.egov.egovsurveyservices.repository.querybuilder.SurveyQueryBuilder;
import org.egov.egovsurveyservices.repository.rowmapper.*;
import org.egov.egovsurveyservices.web.models.Question;
import org.egov.egovsurveyservices.web.models.QuestionWeightage;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
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
    private ScorecardSurveyRowMapper surveyRowMapper;

    @Autowired
    private ScorecardQueryBuilder surveyQueryBuilder;

    @Autowired
    private QuestionRowMapper questionRowMapper;
    @Autowired
    private SectionRowMapper sectionRowMapper;
    @Autowired
    private QuestionWeightageRowMapper questionWeightageRowMapper;

    @Autowired
    private AnswerRowMapper answerRowMapper;
    public boolean fetchWhetherCitizenAlreadyResponded(String surveyId, String citizenId) {
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(surveyId);
        preparedStmtList.add(citizenId);
        String query = surveyQueryBuilder.getCitizenResponseExistsQuery();
        return jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Boolean.class);
    }

    public List<Question> fetchQuestionsList(String surveyId) {
        List<Object> preparedStmtList = new ArrayList<>();
        if(ObjectUtils.isEmpty(surveyId))
            throw new CustomException("EG_SY_SURVEYID_ERR", "Cannot fetch question list without surveyId");
        String query = surveyQueryBuilder.getQuestionsBasedOnSurveyIdsQuery();
        preparedStmtList.add(surveyId);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), questionRowMapper);
    }

    public ScorecardSurveyEntity fetchSurveyByUuid(String surveyUuid) {
        String sql = surveyQueryBuilder.fetchSurveyByUuid(surveyUuid);
        List<Object> preparedStmtList = new ArrayList<>();
        preparedStmtList.add(surveyUuid);
        List<ScorecardSurveyEntity> query = jdbcTemplate.query(sql,preparedStmtList.toArray(), surveyRowMapper);

        ScorecardSurveyEntity scorecardSurveyEntity = query.get(0);
        if (scorecardSurveyEntity != null) {
            List<Section> sections = fetchSectionsBySurveyUuid(surveyUuid);
            scorecardSurveyEntity.setSections(sections);
        }

        return scorecardSurveyEntity;
    }

    private List<Section> fetchSectionsBySurveyUuid(String surveyUuid) {
        String sql = surveyQueryBuilder.fetchSectionsBySurveyUuid(surveyUuid);
        List<Section> sections = jdbcTemplate.query(sql, new Object[]{surveyUuid}, sectionRowMapper);

        for (Section section : sections) {
            List<QuestionWeightage> questions = fetchQuestionsBySectionUuid(section.getUuid());
            section.setQuestions(questions);
        }

        return sections;
    }

    private List<QuestionWeightage> fetchQuestionsBySectionUuid(String sectionUuid) {
        String sql = surveyQueryBuilder.fetchQuestionsBySectionUuid(sectionUuid);
        return jdbcTemplate.query(sql,new Object[]{sectionUuid}, questionWeightageRowMapper);
    }


}
