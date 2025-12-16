
package org.egov.rl.repository.builder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.StringJoiner;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.ClosureCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ClosureApplicationSearchQueryBuilder {
	
	@Autowired
	private RentLeaseConfiguration config;


	private static final String BASE_QUERY = "SELECT cl.* "
	        + "FROM eg_rl_allotment_clsure cl\r\n"
			+ "INNER JOIN eg_rl_allotment al ON al.id = cl.allotment_id\r\n";
	
	String GROUPBY_QUERY = " GROUP BY cl.id ORDER BY cl.created_time DESC";

	public String getClosureSearch(ClosureCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" cl.tenant_id = ? ");
			subQueryParams.add(criteria.getTenantId());
		}
		if (!criteria.getIsReportSearch()) {
			if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" cl.id IN (").append(createQuery(criteria.getAllotmentIds())).append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
			}
			
			if (!ObjectUtils.isEmpty(criteria.getStatus())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" cl.status = ? ");
				subQueryParams.add(criteria.getStatus());
			}

			if (!CollectionUtils.isEmpty(criteria.getApplicationNumbers())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" cl.application_number IN ( ").append(createQuery(criteria.getApplicationNumbers()))
						.append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getApplicationNumbers());
			}
			
			if (!ObjectUtils.isEmpty(criteria.getFromDate())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" cl.created_time >= CAST(? AS bigint) ");
				subQueryParams.add(criteria.getFromDate());
			}
			if (!ObjectUtils.isEmpty(criteria.getToDate())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" cl.created_time <= CAST(? AS bigint) ");
				subQueryParams.add(criteria.getToDate());
			}
//			 GROUP BY al.id ORDER BY al.created_time DESC
			long limit = criteria.getLimit() != null ? Math.min(criteria.getLimit(), config.getMaxSearchLimit()) : config.getDefaultLimit();
			long offset = criteria.getOffset() != null ? criteria.getOffset() : config.getDefaultOffset();
            subQuery.append(GROUPBY_QUERY);
			subQuery.append(" LIMIT ? OFFSET ? ");
			subQueryParams.add(limit);
			subQueryParams.add(offset);


		}

		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		return mainQuery.toString();
	}

	private void addClauseIfRequired(StringBuilder query, List<Object> preparedStmtList) {
		if (preparedStmtList.isEmpty()) {
			query.append("WHERE");
		} else {
			query.append("AND");
		}
	}

	private String createQuery(Set<String> ids) {
		StringBuilder builder = new StringBuilder();
		int length = ids.size();
		for (int i = 0; i < length; i++) {
			builder.append(" ?");
			if (i != length - 1)
				builder.append(",");
		}
		return builder.toString();
	}

	private void addToPreparedStatement(List<Object> preparedStmtList, Set<String> ids) {
		ids.forEach(id -> {
			preparedStmtList.add(id);
		});
	}

}
