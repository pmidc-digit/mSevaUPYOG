package org.egov.ndc.repository.builder;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.web.model.ndc.NdcApplicationSearchCriteria;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class NdcQueryBuilder {

	private final String paginationWrapper = "SELECT * FROM "
			+ "(SELECT *, DENSE_RANK() OVER (ORDER BY ndc_lastModifiedTime DESC) offset_ FROM " + "({})"
			+ " result) result_offset " + "WHERE offset_ > ? AND offset_ <= ?";

	private static final String NDC_QUERY = "SELECT " +
			"a.uuid AS a_uuid, a.tenantid, a.applicationstatus, a.active,\n" +
            "  a.createdby AS a_createdby, a.lastmodifiedby AS a_lastmodifiedby,\n" +
            "  a.createdtime AS a_createdtime, a.lastmodifiedtime AS a_lastmodifiedtime,\n" +
            "  a.action, a.reason,owner.uuid as owner_uuid,\n" +
			"d.uuid AS d_uuid, d.applicationid AS d_applicationid, d.businessservice, d.consumercode, d.additionaldetails, d.isduepending, d.status, " +
			"doc.uuid AS doc_uuid, doc.applicationid AS doc_applicationid, doc.documenttype, doc.documentattachment, doc.createdby AS doc_createdby, doc.lastmodifiedby AS doc_lastmodifiedby, doc.createdtime AS doc_createdtime, doc.lastmodifiedtime AS doc_lastmodifiedtime " +
			"FROM eg_ndc_application a " +
			"LEFT JOIN eg_ndc_owner owner ON a.uuid = owner.ndcapplicationuuid " +
			"LEFT JOIN eg_ndc_details d ON a.uuid = d.applicationid " +
			"LEFT JOIN eg_ndc_documents doc ON a.uuid = doc.applicationid";


	public String getNdcApplicationSearchQuery(NdcApplicationSearchCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder query = new StringBuilder(NDC_QUERY);
		boolean whereAdded = false;

		if (StringUtils.isNotBlank(criteria.getTenantId())) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append("( a.tenantid = ? or a.tenantid = 'pb.punjab' )");
			preparedStmtList.add(criteria.getTenantId());
		}

		if (criteria.getUuid() != null && !criteria.getUuid().isEmpty()) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" a.uuid in (");
			String placeholders = String.join(",", Collections.nCopies(criteria.getUuid().size(), "?"));
			query.append(placeholders).append(")");
			preparedStmtList.addAll(criteria.getUuid());
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

		if (criteria.getOwnerIds() != null) {
			addClauseIfRequired(query, whereAdded);
			whereAdded = true;
			query.append(" owner.uuid in (");
			String placeholders = String.join(",", Collections.nCopies(criteria.getOwnerIds().size(), "?"));
			query.append(placeholders).append(")");
			preparedStmtList.addAll(criteria.getOwnerIds());
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

	public String checkApplicationExists(String uuid) {
		return "SELECT uuid FROM eg_ndc_application WHERE uuid =?";
	}

	public String checkUniqueUserAndApplicationUUid(List<String> uuid, String ndcApplicationUuid) {
		return ("SELECT 1 FROM eg_ndc_owner WHERE uuid in ("+"?"+") and ndcapplicationuuid = ? ");
	}
}
