package org.egov.rl.repository.builder;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CommonQueryBuilder {
	
	
	@Autowired
	private RentLeaseConfiguration config;

	private static final String SEARCH_BASE_QUERY = "SELECT * FROM eg_rl_allotment ";

	private static final String OWNER_INFO_QUERY = "SELECT * FROM eg_rl_owner_info ";
	
	private static final String DOCUMENT_QUERY = "SELECT * FROM eg_rl_document ";

	private static final String BASE_QUERY = "SELECT\r\n" 
	        + "    al.*,\r\n" 
			+ "    ap.*,\r\n" 
	        + "    doc.*,\r\n"
			+ "    doc_count.documentCount,\r\n" 
			+ "    ap_count.applicantCount,\r\n"
			+ "    total_count.totalAllotments\r\n" 
			+ "    FROM eg_rl_allotment al\r\n"
			+ "    INNER JOIN eg_rl_owner_info ap ON al.id = ap.allotment_id\r\n"
			+ "    LEFT JOIN eg_rl_document doc ON al.id = doc.allotment_id\r\n" 
			+ "    LEFT JOIN (\r\n"
			+ "    SELECT allotment_id, COUNT(DISTINCT id) AS documentCount\r\n" 
			+ "    FROM eg_rl_document\r\n"
			+ "    GROUP BY allotment_id\r\n" 
			+ "    ) doc_count ON doc_count.allotment_id = al.id\r\n" 
			+ "    LEFT JOIN (\r\n"
			+ "    SELECT allotment_id, COUNT(DISTINCT id) AS applicantCount\r\n" 
			+ "    FROM eg_rl_owner_info\r\n"
			+ "    GROUP BY allotment_id\r\n" 
			+ "    ) ap_count ON ap_count.allotment_id = al.id\r\n" 
			+ "    CROSS JOIN (\r\n"
			+ "    SELECT COUNT(*) AS totalAllotments FROM eg_rl_allotment al \r\n";
	String GROUPBY_QUERY = ") total_count\r\n";

	private static final String ALLOT_OWNER_QUERY = "SELECT al.* "
	        + "FROM eg_rl_allotment al\r\n"
			+ "INNER JOIN eg_rl_owner_info ap ON al.id = ap.allotment_id\r\n";
	
	String ALLOT_OWNER_GROUPBY_QUERY = " GROUP BY al.id ORDER BY al.created_time DESC";

	
	public String getAllotmentSearchById(AllotmentCriteria criteria, List<Object> preparedStmtList) {
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
		}
		if (criteria.getIsReportSearch()) {
			if (criteria.getFromDate() != null && criteria.getToDate() != null) {
				addClauseIfRequired(subQuery, subQueryParams);
                if (criteria.getFromDate() != null && criteria.getToDate() != null) {
					subQuery.append(" (al.start_date >= ? AND al.end_date <= ?) OR al.end_date <= ? ");
					subQueryParams.add(criteria.getFromDate()); // long value
					subQueryParams.add(criteria.getToDate()); // long value
					subQueryParams.add(criteria.getToDate()); // long value
				}
			}
		}

		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		mainQuery.append(GROUPBY_QUERY);
		mainQuery.append(subQuery);
		preparedStmtList.addAll(subQueryParams);
		return mainQuery.toString();
	}

	public String getAllotmentSearchForReport(AllotmentCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" (al.status = 'APPROVED' OR al.status = 'PENDING_DISCONNECTION_FIELD_INSPECTION')  AND al.expireflag=false AND al.tenant_id = ? ");
			subQueryParams.add(criteria.getTenantId());
		}
		if (!criteria.getIsReportSearch()) {
			if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.id IN (").append(createQuery(criteria.getAllotmentIds())).append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
			}
		}
		if (criteria.getIsReportSearch()) {
			if (criteria.getFromDate() != null && criteria.getToDate() != null) {
				addClauseIfRequired(subQuery, subQueryParams);
                if (criteria.getFromDate() != null && criteria.getToDate() != null) {
					subQuery.append(" (al.start_date >= ? AND al.end_date <= ?) OR al.end_date <= ? ");
					subQueryParams.add(criteria.getFromDate()); // long value
					subQueryParams.add(criteria.getToDate()); // long value
					subQueryParams.add(criteria.getToDate()); // long value
				}
			}
		}

		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		mainQuery.append(GROUPBY_QUERY);
		mainQuery.append(subQuery);
		preparedStmtList.addAll(subQueryParams);
		System.out.println("mainQuery.toString()----------"+mainQuery.toString());

		return mainQuery.toString();
	}

	public String getAllotmentSearch(AllotmentCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.tenant_id = ? ");
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
				String inSql = String.join(",", Collections.nCopies(criteria.getStatus().size(), "?"));
				subQuery.append(" al.status IN (").append(inSql).append(" ) ");
				addToPreparedStatementStatuses(subQueryParams, criteria.getStatus());
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

	public String createdAllotedQuery(String tenantId) {
		long currentDate = System.currentTimeMillis(); // current timestamp in long

		StringBuilder mainQuery = new StringBuilder(SEARCH_BASE_QUERY);
		mainQuery.append(" WHERE status != 'CLOSED' AND expireflag=false AND tenant_id='").append(tenantId).append("'");
		mainQuery.append(" AND ").append(currentDate).append(" BETWEEN start_date AND end_date");
		return mainQuery.toString();
	}
	
	public String createdOwnerInfoQuery(String allotmentId,List<Object> preparedStmtList) {
	
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();

		if (!ObjectUtils.isEmpty(allotmentId)) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" allotment_id= ? ");
			subQueryParams.add(allotmentId);
		}
		StringBuilder mainQuery = new StringBuilder(OWNER_INFO_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		return mainQuery.toString();
	}
	
	public String createdDocumentsQuery(String allotmentId,List<Object> preparedStmtList) {
		
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();

		if (!ObjectUtils.isEmpty(allotmentId)) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" allotment_id= ? ");
			subQueryParams.add(allotmentId);
		}
		StringBuilder mainQuery = new StringBuilder(DOCUMENT_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		return mainQuery.toString();

	}
	

	public String getAllotmentByApplicationNumber(AllotmentCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();

		if (!CollectionUtils.isEmpty(criteria.getApplicationNumbers())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.application_number IN (").append(createQuery(criteria.getApplicationNumbers()))
					.append(" ) ");
			addToPreparedStatement(subQueryParams, criteria.getApplicationNumbers());
		}
		
		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(BASE_QUERY);
		mainQuery.append(subQuery);

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		mainQuery.append(GROUPBY_QUERY);
		mainQuery.append(subQuery);
		preparedStmtList.addAll(subQueryParams);
		
		// Order the final result
		return mainQuery.toString();
	}


	public String getAllotedByPropertyIdsAndStatusActive(String propertyId, String tenantId) {
		
	    long currentDate=formatDay();
		
	    StringBuilder mainQuery = new StringBuilder(SEARCH_BASE_QUERY);
		mainQuery.append(" WHERE status = 'APPROVED' AND expireflag=false AND tenant_id='").append(tenantId).append("'");
		mainQuery.append(" AND property_id='").append(propertyId).append("'");
		mainQuery.append(" AND ").append(currentDate).append(" BETWEEN start_date AND end_date");
		return mainQuery.toString();
   }
	
	public long formatDay() {
		LocalDate date=LocalDate.now().minusDays(15);
		ZoneId zone = ZoneId.of("Asia/Kolkata");
		ZonedDateTime zdt =  date.atTime(java.time.LocalTime.MAX).atZone(zone);
		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss z");
		ZonedDateTime parsed = ZonedDateTime.parse(zdt.format(fmt), fmt);
		return parsed.toInstant().toEpochMilli();
	}
	
	private void addToPreparedStatementStatuses(List<Object> preparedStmtList, Set<Status> statuses) {
		statuses.forEach(status -> preparedStmtList.add(status.name()));
	}
}
