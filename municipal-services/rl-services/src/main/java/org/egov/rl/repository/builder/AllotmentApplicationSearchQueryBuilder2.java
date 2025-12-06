
package org.egov.rl.repository.builder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.StringJoiner;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AllotmentApplicationSearchQueryBuilder2 {
	
	@Autowired
	private RentLeaseConfiguration config;


	private static final String SEARCH_BASE_QUERY = "SELECT * FROM eg_rl_allotment ";

	private static final String BASE_QUERY = "SELECT * "
	        + "FROM eg_rl_allotment al\r\n"
			+ "INNER JOIN eg_rl_owner_info ap ON al.id = ap.allotment_id\r\n";
	
	String GROUPBY_QUERY = " GROUP BY al.id ORDER BY al.created_time DESC";

	public String getAllotmentSearch(AllotmentCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.status != 'CLOSED' AND al.expireflag=false AND al.tenant_id = ? ");
			subQueryParams.add(criteria.getTenantId());
		}
		if (!criteria.getIsReportSearch()) {
			if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.id IN (").append(createQuery(criteria.getAllotmentIds())).append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
			}
			
			if (!ObjectUtils.isEmpty(criteria.getStatus())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.status = ? ");
				subQueryParams.add(criteria.getStatus());
			}

			if (!CollectionUtils.isEmpty(criteria.getApplicationNumbers())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.application_number IN ( ").append(createQuery(criteria.getApplicationNumbers()))
						.append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getApplicationNumbers());
			}

			if (!CollectionUtils.isEmpty(criteria.getOwnerIds())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" ap.user_uuid IN ( ").append(createQuery(criteria.getOwnerIds())).append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getOwnerIds());
			}
			
			if (!ObjectUtils.isEmpty(criteria.getFromDate())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.created_time >= CAST(? AS bigint) ");
				subQueryParams.add(criteria.getFromDate());
			}
			if (!ObjectUtils.isEmpty(criteria.getToDate())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.created_time <= CAST(? AS bigint) ");
				subQueryParams.add(criteria.getToDate());
			}
//			 GROUP BY al.id ORDER BY al.created_time DESC
			long limit = criteria.getLimit() != null ? Math.min(criteria.getLimit(), config.getMaxSearchLimit()) : config.getDefaultLimit();
			long offset = criteria.getOffset() != null ? criteria.getOffset() : config.getDefaultOffset();

			subQuery.append(" LIMIT ? OFFSET ? ");
			subQueryParams.add(limit);
			subQueryParams.add(offset);


		}
//		if (criteria.getIsReportSearch()) {
//			if (criteria.getFromDate() != null && criteria.getToDate() != null) {
//				addClauseIfRequired(subQuery, subQueryParams);
//                if (criteria.getFromDate() != null && criteria.getToDate() != null) {
//					subQuery.append(" (al.start_date >= ? AND al.end_date <= ?) OR al.end_date <= ? ");
//					subQueryParams.add(criteria.getFromDate()); // long value
//					subQueryParams.add(criteria.getToDate()); // long value
//					subQueryParams.add(criteria.getToDate()); // long value
//				}
//			}
//		}
//		
		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
//		mainQuery.append(GROUPBY_QUERY);
//		mainQuery.append(subQuery);
//		preparedStmtList.addAll(subQueryParams);

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

	public String createdAllotedQuery(String tenantId) {
		long currentDate = System.currentTimeMillis(); // current timestamp in long

		StringBuilder mainQuery = new StringBuilder(SEARCH_BASE_QUERY);
		mainQuery.append(" WHERE status != 'CLOSED' AND expireflag=false AND tenant_id='").append(tenantId).append("'");
		mainQuery.append(" AND ").append(currentDate).append(" BETWEEN start_date AND end_date");
		return mainQuery.toString();
	}

	public String getAllotmentByApplicationNumber(AllotmentCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();

		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.status != 'CLOSED' AND al.expireflag=false AND al.tenant_id = ? ");
			subQueryParams.add(criteria.getTenantId());
		}
		if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.application_number IN (").append(createQuery(criteria.getApplicationNumbers()))
					.append(" ) ");
			addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
		}
		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		return mainQuery.toString();
	}

	public String getAllotmentByPropertyId(String propertyId, String tenantId) {
		long currentDate = System.currentTimeMillis(); // current timestamp in long

		StringBuilder mainQuery = new StringBuilder(SEARCH_BASE_QUERY);
		mainQuery.append(" WHERE status != 'CLOSED' AND expireflag=false AND tenant_id='").append(tenantId).append("'");
		mainQuery.append(" AND property_id='").append(propertyId).append("'");
		mainQuery.append(" AND ").append(currentDate).append(" BETWEEN start_date AND end_date");
		return mainQuery.toString();
	}
	
	public String getAllotedByPropertyIdsAndPreviousApplicationNumber(String propertyId, String tenantId, String previousApplicationNumber) {
		long currentDate = System.currentTimeMillis(); // current timestamp in long

		StringBuilder mainQuery = new StringBuilder(SEARCH_BASE_QUERY);
		mainQuery.append(" WHERE status != 'CLOSED' AND expireflag=false AND tenant_id='").append(tenantId).append("'");
		if(previousApplicationNumber==null){
			mainQuery.append(" AND previous_application_number is null");	
		}else {
		    mainQuery.append(" AND previous_application_number='").append(previousApplicationNumber).append("'");
		}
//		mainQuery.append(" OR previous_application_number is null)");
		mainQuery.append(" AND property_id='").append(propertyId).append("'");
//		mainQuery.append(" AND ").append(currentDate).append(" BETWEEN start_date AND end_date");
		System.out.println("mainQuery--------"+mainQuery);
		return mainQuery.toString();
	}

}
