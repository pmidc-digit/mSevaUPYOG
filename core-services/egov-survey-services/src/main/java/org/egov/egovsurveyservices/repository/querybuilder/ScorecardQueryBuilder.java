package org.egov.egovsurveyservices.repository.querybuilder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ScorecardQueryBuilder {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String getCitizenResponseExistsQuery() {
        return " SELECT EXISTS(SELECT uuid FROM eg_ss_answer WHERE surveyuuid = ? AND citizenid = ? ) ";
    }

    public String getQuestionsBasedOnSurveyIdsQuery() {
        return " SELECT uuid, surveyuuid, questionstatement, options, status, type, required, createdby, lastmodifiedby, createdtime, lastmodifiedtime FROM eg_ss_question WHERE surveyuuid = ? ";
    }

    public String fetchSurveyByUuid(String surveyUuid) {
        return "SELECT * FROM eg_ss_survey_entity WHERE uuid = ?";
    }

    public String fetchSectionsBySurveyUuid(String surveyUuid) {
        return "SELECT * FROM eg_ss_section WHERE surveyUuid = ?";
    }

    public String fetchQuestionsBySectionUuid(String sectionUuid) {
        return "SELECT qw.*, q.* FROM eg_ss_question_weightage qw " +
                "JOIN eg_ss_question q ON qw.questionUuid = q.uuid " +
                "WHERE qw.sectionUuid = ?";
    }
}
