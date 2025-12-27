package org.egov.rl.repository.builder;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
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
	
	private static final String BASE_QUERY = "SELECT"
			+ " al.*, ap.*, doc.*,doc_count.documentCount,ap_count.applicantCount,total_count.totalAllotments "
			+ " FROM filtered_page AS al INNER JOIN eg_rl_owner_info AS ap ON al.id = ap.allotment_id "
			+ " LEFT JOIN eg_rl_document AS doc ON al.id = doc.allotment_id "
			+ " LEFT JOIN ( SELECT allotment_id, COUNT(DISTINCT id) AS documentCount FROM eg_rl_document GROUP BY allotment_id) AS doc_count ON doc_count.allotment_id = al.id "
			+ " LEFT JOIN ( SELECT allotment_id, COUNT(DISTINCT id) AS applicantCount FROM eg_rl_owner_info GROUP BY allotment_id ) AS ap_count ON ap_count.allotment_id = al.id "
			+ " CROSS JOIN ( SELECT COUNT(*) AS totalAllotments FROM filtered_page) AS total_count "
			+ " ORDER BY al.created_time DESC NULLS LAST, al.id ";

	String FILTER_BASE_QUERY = "WITH filtered_page AS (SELECT * FROM eg_rl_allotment AS al ";

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
		StringBuilder mainQuery = new StringBuilder(FILTER_BASE_QUERY);
		mainQuery.append(subQuery + ")");

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		mainQuery.append(BASE_QUERY);
		return mainQuery.toString();
	}

	public String getAllotmentSearchForReport(AllotmentCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.expireflag=false AND al.tenant_id = ? ");
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
		StringBuilder mainQuery = new StringBuilder(FILTER_BASE_QUERY);
		mainQuery.append(subQuery + ")");

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);

		// Order the final result
		mainQuery.append(BASE_QUERY);
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
			
			if (!criteria.getIsExpaireFlag()) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.expireflag = ? ");
				subQueryParams.add(criteria.getIsExpaireFlag());
			}
			
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

			if (!CollectionUtils.isEmpty(criteria.getPropertyId())) {
				addClauseIfRequired(subQuery, subQueryParams);
				subQuery.append(" al.property_id IN (").append(createQuery(criteria.getPropertyId())).append(" ) ");
				addToPreparedStatement(subQueryParams, criteria.getPropertyId());
			}
			
			if (!CollectionUtils.isEmpty(Collections.singleton(criteria.getCurrentDate()))) {
				addClauseIfRequired(subQuery, subQueryParams); // ensures WHERE/AND
				subQuery.append(" ? BETWEEN al.start_date AND al.end_date ");
				Set<String> currentdate=new HashSet<>();
				currentdate.add(String.valueOf(formatDay()));
				addToPreparedStatement(subQueryParams, currentdate);
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

			long limit = criteria.getLimit() != null ? Math.min(criteria.getLimit(), config.getMaxSearchLimit())
					: config.getDefaultLimit();
			long offset = criteria.getOffset() != null ? criteria.getOffset() : config.getDefaultOffset();
			subQuery.append(" LIMIT ? OFFSET ? ");
			subQueryParams.add(limit);
			subQueryParams.add(offset);
		}
		
		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(FILTER_BASE_QUERY);
		mainQuery.append(subQuery + ")");

		// Add all subquery parameters to the main prepared statement list
		preparedStmtList.addAll(subQueryParams);
		mainQuery.append(BASE_QUERY);

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

	
	public long formatDay() {
		LocalDate date = LocalDate.now().minusDays(15);
		ZoneId zone = ZoneId.of("Asia/Kolkata");
		ZonedDateTime zdt = date.atTime(java.time.LocalTime.MAX).atZone(zone);
		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss z");
		ZonedDateTime parsed = ZonedDateTime.parse(zdt.format(fmt), fmt);
		return parsed.toInstant().toEpochMilli();
	}

	private void addToPreparedStatementStatuses(List<Object> preparedStmtList, Set<Status> statuses) {
		statuses.forEach(status -> preparedStmtList.add(status.name()));
	}
}
