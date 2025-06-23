package org.egov.ndc.repository.builder;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.web.model.ndc.NdcApplicationSearchCriteria;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class NdcQueryBuilder {

	private final String paginationWrapper = "SELECT * FROM "
			+ "(SELECT *, DENSE_RANK() OVER (ORDER BY ndc_lastModifiedTime DESC) offset_ FROM " + "({})"
			+ " result) result_offset " + "WHERE offset_ > ? AND offset_ <= ?";

	private static final String NDC_QUERY = "SELECT a.uuid AS a_uuid, a.firstname,a.tenantid, a.lastname, a.mobile, a.email, a.address, a.applicationstatus,a.active, a.createdby AS a_createdby, a.lastmodifiedby AS a_lastmodifiedby, a.createdtime AS a_createdtime, a.lastmodifiedtime AS a_lastmodifiedtime, " +
			"d.uuid AS d_uuid, d.applicantid AS d_applicantid, d.businessservice, d.consumercode, d.additionaldetails, d.dueamount, d.status, " +
			"doc.uuid AS doc_uuid, doc.applicantid AS doc_applicantid, doc.documenttype, doc.documentattachment, doc.createdby AS doc_createdby, doc.lastmodifiedby AS doc_lastmodifiedby, doc.createdtime AS doc_createdtime, doc.lastmodifiedtime AS doc_lastmodifiedtime " +
			"FROM eg_ndc_applicants a " +
			"LEFT JOIN eg_ndc_details d ON a.uuid = d.applicantid " +
			"LEFT JOIN eg_ndc_documents doc ON a.uuid = doc.applicantid";


	public String getNdcApplicationSearchQuery(NdcApplicationSearchCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder query = new StringBuilder(NDC_QUERY);
		boolean whereAdded = false;

		if (StringUtils.isNotBlank(criteria.getTenantId())) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append("( a.tenantid = ? or a.tenantid = 'pb.punjab' )");
			preparedStmtList.add(criteria.getTenantId());
		}

		if (StringUtils.isNotBlank(criteria.getUuid())) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" a.uuid = ?");
			preparedStmtList.add(criteria.getUuid());
		}

		if (criteria.getStatus() != null) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" a.applicationstatus = ?");
			preparedStmtList.add(criteria.getStatus());
		}

		if (criteria.getActive() != null) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" a.active = ?");
			preparedStmtList.add(criteria.getActive());
		}

		if (StringUtils.isNotBlank(criteria.getMobileNumber())) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" a.mobile = ?");
			preparedStmtList.add(criteria.getMobileNumber());
		}

		if (StringUtils.isNotBlank(criteria.getName())) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" CONCAT(a.firstname, ' ', a.lastname) ILIKE ?");
			preparedStmtList.add("%" + criteria.getName() + "%");
		}

		query.append(" ORDER BY a.createdtime DESC ");
		return query.toString();
	}


	private void addClauseIfRequired(StringBuilder query, boolean whereAdded) {
		if (whereAdded) {
			query.append(" AND");
		} else {
			query.append(" WHERE");
		}
	}

	public String getExistingUuids(String tableName, List<String> uuids) {
		return "SELECT uuid FROM " + tableName + " WHERE uuid IN (" + uuids.stream().map(uuid -> "'" + uuid + "'").collect(Collectors.joining(",")) + ")";
	}

	public String checkApplicantExists(String uuid) {
		return "SELECT uuid FROM eg_ndc_applicants WHERE uuid =?";
	}
}
