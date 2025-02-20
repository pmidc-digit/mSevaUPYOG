package org.egov.egovsurveyservices.repository;

import org.egov.egovsurveyservices.web.models.Answer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AnswerRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveAnswer(Answer answer) {
        String sql = "INSERT INTO eg_ss_answer (uuid, surveyUuid, sectionUuid, questionUuid, answer, comments, auditDetails, citizenId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
                            answer.getUuid(),
                            answer.getSurveyUuid(),
                            answer.getSectionUuid(),
                            answer.getQuestionUuid(),
                            answer.getAnswer().toString(),
                            answer.getComments(),
                            answer.getAuditDetails().toString(),
                            answer.getCitizenId());
    }
}