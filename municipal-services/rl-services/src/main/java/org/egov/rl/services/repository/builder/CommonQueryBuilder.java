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
        
	private static final String BASE_QUERY = ""
			+ " SELECT"
			+ " al.id, al.property_id, al.tenant_id, al.status, al.application_type, al.application_number, al.previous_application_number, al.start_date, al.end_date, al.expireflag, al.is_gst_applicable, al.is_cow_cess_applicable, al.is_refund_applicable_on_discontinuation, al.penalty_type, al.created_time, al.created_by, al.lastmodified_time, al.lastmodified_by, al.additional_details, al.term_and_condition, al.reason_for_closure, al.notes_comments, al.trade_license_number, al.registration_number, al.amount_tobe_deducted, al.amount_to_be_refund, "
            + " onr.id as owner_id, onr.allotment_id as onr_allotmentId, onr.user_uuid, onr.is_primary_owner, onr.owner_type, onr.ownership_percentage, onr.relationship, onr.status as onr_status, "
	        + " doc.id as doc_id, doc.allotment_id as doc_allotmentId, doc.documenttype, doc.filestoreid, doc.status as doc_status, doc.createdby, doc.lastmodifiedby, doc.createdtime, doc.lastmodifiedtime"
	        + " FROM latest_allotment AS la"
			+ " INNER JOIN eg_rl_allotment al  ON al.id = la.id "
			+ " INNER JOIN eg_rl_owner_info AS onr ON al.id = onr.allotment_id"
			+ " LEFT JOIN eg_rl_document AS doc ON al.id = doc.allotment_id "
			+ " ORDER BY al.created_time DESC NULLS LAST, al.id DESC ";
	private static final String FILTER_BASE_QUERY = "WITH latest_allotment AS ("
			+ "  SELECT al.id "
			+ "  FROM eg_rl_allotment al ";
		
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

//		if (!CollectionUtils.isEmpty(criteria.getAllotmentIds())) {
//			addClauseIfRequired(subQuery, subQueryParams);
//			subQuery.append(" al.id IN (").append(createQuery(criteria.getAllotmentIds())).append(" ) ");
//			addToPreparedStatement(subQueryParams, criteria.getAllotmentIds());
//		}

		if (!ObjectUtils.isEmpty(criteria.getStatus())) {
			System.out.println("criteria.getStatus()---"+criteria.getStatus());
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
			subQuery.append(" EXISTS (SELECT 1 FROM eg_rl_owner_info AS oi  WHERE oi.allotment_id = al.id AND"
					+ " oi.user_uuid IN ( ").append(createQuery(criteria.getOwnerIds())).append(" ))");
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
		subQuery.append(" ORDER BY al.created_time DESC NULLS LAST, al.id DESC LIMIT ? OFFSET ? )");
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
