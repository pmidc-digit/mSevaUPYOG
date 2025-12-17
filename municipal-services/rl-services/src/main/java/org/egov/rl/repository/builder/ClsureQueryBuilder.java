
package org.egov.rl.repository.builder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.egov.rl.models.ClosureCriteria;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ClsureQueryBuilder {
	
	private static final String BASE_QUERY ="SELECT "
			+ "ac.*, ap.* "
			+ "FROM eg_rl_allotment_clsure ac "
			+ "INNER JOIN eg_rl_allotment ap ON ap.id = ac.allotment_id ";
			
	//	private final String GROUPBY_QUERY = " GROUP BY al.id, ap.id , doc.id;";
    
	public String getClsureSearchById(ClosureCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();

//		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
//			addClauseIfRequired(subQuery, subQueryParams);
//			subQuery.append(" ac.tenant_id = ? ");
//			subQueryParams.add(criteria.getTenantId());
//		}
		if (!CollectionUtils.isEmpty(criteria.getIds())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" ac.id IN (").append(createQuery(criteria.getIds())).append(" ) ");
			addToPreparedStatement(subQueryParams, criteria.getIds());
		}

		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);
System.out.println("---------------------"+mainQuery);
		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
//		mainQuery.append(GROUPBY_QUERY);

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
