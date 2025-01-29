package org.egov.egovsurveyservices.repository.querybuilder;

import org.apache.commons.lang3.StringUtils;
import org.egov.egovsurveyservices.web.models.CategorySearchCriteria;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryQueryBuilder {

    public String getCategorySearchQuery(CategorySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT category.id, category.label, category.isactive, category.tenantid, category.createdby, category.lastmodifiedby, category.createdtime, category.lastmodifiedtime ");
        query.append(" FROM eg_ss_category category");

        if (!StringUtils.isBlank(criteria.getTenantId())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.tenantid = ? ");
            preparedStmtList.add(criteria.getTenantId());
        }

        if (!StringUtils.isBlank(criteria.getId())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.id = ? ");
            preparedStmtList.add(criteria.getId());
        }

        if (!StringUtils.isBlank(criteria.getLabel())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.label ilike " + "'%").append(criteria.getLabel().trim()).append("%'");
        }

        if (!StringUtils.isBlank(criteria.getCreatedBy())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.createdby = ? ");
            preparedStmtList.add(criteria.getCreatedBy());
        }

        if (null!=(criteria.getIsActive())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.isactive = ? ");
            preparedStmtList.add(criteria.getIsActive());
        }else {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" category.isactive = ? ");
            preparedStmtList.add(true);
        }
        query.append(" ORDER BY category.createdtime DESC ");
        int offset = (criteria.getPageNumber() - 1) * criteria.getSize();
        query.append(" LIMIT ").append(criteria.getSize()).append(" OFFSET ").append(offset);
        return query.toString();
    }

    public String getCheckDuplicateCategory() {
        return "SELECT COUNT(*) FROM eg_ss_category WHERE label = ? AND tenantId = ? AND id != ?";
    }

    private void addClauseIfRequired(StringBuilder query, List<Object> preparedStmtList) {
        if (preparedStmtList.isEmpty()) {
            query.append(" WHERE ");
        } else {
            query.append(" AND ");
        }
    }
}
