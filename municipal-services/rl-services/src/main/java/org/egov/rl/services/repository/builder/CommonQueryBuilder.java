	package org.egov.rl.services.repository.builder;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentCriteria;
import org.egov.rl.services.models.enums.Status;
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

	private static final String BASE_QUERY = "),"
			+ " doc_count AS (SELECT allotment_id,COUNT(DISTINCT id) AS documentCount FROM eg_rl_document GROUP BY allotment_id),"
			+ " ap_count AS (SELECT allotment_id, COUNT(DISTINCT id) AS applicantCount FROM eg_rl_owner_info GROUP BY allotment_id),"
			+ " total_count AS (SELECT COUNT(DISTINCT allotment_id) AS totalAllotments FROM filtered_page)"
			+ " SELECT"
			+ " fp.id, fp.property_id, fp.tenant_id, fp.status, fp.application_type, fp.application_number, fp.previous_application_number, fp.start_date, fp.end_date, fp.expireflag, fp.is_gst_applicable, fp.is_cow_cess_applicable, fp.is_refund_applicable_on_discontinuation, fp.penalty_type, fp.created_time, fp.created_by, fp.lastmodified_time, fp.lastmodified_by, fp.additional_details, fp.term_and_condition, fp.reason_for_closure, fp.notes_comments, fp.trade_license_number, fp.registration_number, fp.amount_tobe_deducted, fp.amount_to_be_refund, "
			+ " onr.id as owner_id, onr.allotment_id, onr.user_uuid, onr.is_primary_owner, onr.owner_type, onr.ownership_percentage, onr.relationship, onr.status as onr_status, "
			+ " doc.id as doc_id, doc.allotment_id, doc.documenttype, doc.filestoreid, doc.status as doc_status, doc.createdby, doc.lastmodifiedby, doc.createdtime, doc.lastmodifiedtime,"
			+ " doc_count.documentCount,"
			+ " ap_count.applicantCount,"
			+ " total_count.totalAllotments"
			+ " FROM filtered_page AS fp"
			+ " LEFT JOIN eg_rl_document AS doc ON fp.allotment_id = doc.allotment_id"
			+ " LEFT JOIN doc_count ON doc_count.allotment_id = fp.allotment_id"
			+ " LEFT JOIN eg_rl_owner_info AS onr ON fp.allotment_id = onr.allotment_id"
			+ " LEFT JOIN ap_count ON ap_count.allotment_id = fp.allotment_id"
			+ " CROSS JOIN total_count"
			+ " ORDER BY fp.created_time DESC NULLS LAST, fp.allotment_id;";

	String FILTER_BASE_QUERY = "WITH filtered_page AS (SELECT al.id AS allotment_id,al.*,ap.user_uuid"
			+ " FROM eg_rl_allotment AS al"
			+ " INNER JOIN eg_rl_owner_info AS ap ON al.id = ap.allotment_id ";
			
	public String getAllotmentSearch(AllotmentCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder subQuery = new StringBuilder("");
		List<Object> subQueryParams = new ArrayList<>();
		if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.tenant_id = ? ");
			subQueryParams.add(criteria.getTenantId());
		}

		if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
			addClauseIfRequired(subQuery, subQueryParams);
			subQuery.append(" al.id IN (").append(createQuery(criteria.getAllotmentIds())).append(" ) ");
			addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
		}

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

		if (criteria.getCurrentDate()!=null) {
			addClauseIfRequired(subQuery, subQueryParams); // ensures WHERE/AND
			subQuery.append(" CAST(? AS bigint) BETWEEN al.start_date AND al.end_date ");
			Set<String> currentdate = new HashSet<>();
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
		subQuery.append(" ORDER BY al.created_time DESC LIMIT ? OFFSET ? ");
		subQueryParams.add(limit);
		subQueryParams.add(offset);

		// Now build the main query
		StringBuilder mainQuery = new StringBuilder(FILTER_BASE_QUERY);
		mainQuery.append(subQuery);

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
