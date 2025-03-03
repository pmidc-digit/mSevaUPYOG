package org.egov.egovsurveyservices.repository.querybuilder;

import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScorecardSurveyQueryBuilder {

    @Autowired
    private ApplicationProperties config;

    private static final String BASE_QUERY = "SELECT * FROM eg_ss_survey_entity survey";

    /**
     * Generates query to fetch surveys dynamically based on UUID, tenantId, and title.
     */
    public String getSurveySearchQuery(ScorecardSurveySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(BASE_QUERY);
        boolean whereAdded = false;

        if (criteria.getUuid() != null) {
            query.append(" WHERE survey.uuid = ? ");
            preparedStmtList.add(criteria.getUuid());
            whereAdded = true;
        }

        if (criteria.getTenantId() != null) {
            query.append(whereAdded ? " AND " : " WHERE ");
            query.append("survey.tenantid = ? ");
            preparedStmtList.add(criteria.getTenantId());
            whereAdded = true;
        }

        if (criteria.getTitle() != null) {
            query.append(whereAdded ? " AND " : " WHERE ");
            query.append("survey.title ILIKE ? ");
            preparedStmtList.add("%" + criteria.getTitle() + "%");
        }

        return query.toString();
    }

    private String createQuery(List<String> ids) {
        StringBuilder builder = new StringBuilder();
        int length = ids.size();
        for (int i = 0; i < length; i++) {
            builder.append(" ?");
            if (i != length - 1)
                builder.append(",");
        }
        return builder.toString();
    }

    private void addToPreparedStatement(List<Object> preparedStmtList, List<String> ids) {
        ids.forEach(id -> {
            preparedStmtList.add(id);
        });
    }

    public String getSurveyUuidsToCountMapQuery(List<String> listOfSurveyIds, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(" SELECT surveyid, COUNT(DISTINCT citizenid) FROM eg_ss_answer answer ");
        query.append(" WHERE answer.surveyid IN ( ").append(createQuery(listOfSurveyIds)).append(" )");
        addToPreparedStatement(preparedStmtList, listOfSurveyIds);
        query.append(" GROUP  BY surveyid ");
        return query.toString();
    }

    public String fetchSectionListBasedOnSurveyId() {
        return "SELECT uuid, surveyuuid, title, weightage FROM eg_ss_survey_section WHERE surveyuuid = ?";
    }

    public String getCitizenResponseExistsQuery() {
        return " SELECT EXISTS(SELECT uuid FROM eg_ss_answer WHERE surveyuuid = ? AND citizenid = ? ) ";
    }

    public String fetchQuestionsWeightageListBySurveyAndSection() {
        return "SELECT q.uuid as uuid, q.questionstatement as questionstatement, q.options as options, " +
                "q.status as status, q.type as type, q.required as required, " +
                "q.createdby as createdby, q.lastmodifiedby as lastmodifiedby, q.createdtime as createdtime, " +
                "q.lastmodifiedtime as lastmodifiedtime,qw.questionuuid as questionuuid,qw.sectionuuid as sectionuuid ," +
                "qw.weightage as weightage,qw.qorder as qorder " +
                "FROM eg_ss_question q " +
                "JOIN eg_ss_question_weightage qw ON q.uuid = qw.questionuuid " +
                "JOIN eg_ss_survey_section ss ON qw.sectionuuid = ss.uuid " +
                "WHERE ss.surveyuuid = ? AND ss.uuid = ?";
    }

    public String allQuestionExistsQuery(String placeholders) {
        return "SELECT uuid FROM public.eg_ss_question WHERE uuid IN (" + placeholders + ")";
    }

    public String getExistingAnswerUuid() {
        return "SELECT uuid FROM public.eg_ss_answer WHERE uuid = ?";
    }
}
