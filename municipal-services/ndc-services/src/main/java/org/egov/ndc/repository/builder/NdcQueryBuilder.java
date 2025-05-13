package org.egov.ndc.repository.builder;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.web.model.NdcSearchCriteria;
import org.egov.ndc.web.model.ndc.NdcApplicationSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NdcQueryBuilder {

	@Autowired
	private NDCConfiguration ndcConfig;
	
	@Value("${egov.ndc.fuzzysearch.isFuzzyEnabled}")
	private boolean isFuzzyEnabled;

	private static final String QUERY = "SELECT ndc.*,ndcdoc.*,ndc.id as ndc_id,ndc.tenantid as ndc_tenantId,ndc.lastModifiedTime as "
			+ "ndc_lastModifiedTime,ndc.createdBy as ndc_createdBy,ndc.lastModifiedBy as ndc_lastModifiedBy,ndc.createdTime as "
			+ "ndc_createdTime,ndc.additionalDetails,ndc.landId as ndc_landId, ndcdoc.id as ndc_doc_id, ndcdoc.additionalDetails as doc_details, "
			+ "ndcdoc.documenttype as ndc_doc_documenttype,ndcdoc.filestoreid as ndc_doc_filestore"
			+ " FROM eg_ndc ndc  LEFT OUTER JOIN "
			+ "eg_ndc_document ndcdoc ON ndcdoc.ndcid = ndc.id WHERE 1=1 ";

	private final String paginationWrapper = "SELECT * FROM "
			+ "(SELECT *, DENSE_RANK() OVER (ORDER BY ndc_lastModifiedTime DESC) offset_ FROM " + "({})"
			+ " result) result_offset " + "WHERE offset_ > ? AND offset_ <= ?";
	
	private final String countWrapper = "SELECT COUNT(DISTINCT(ndc_id)) FROM ({INTERNAL_QUERY}) as ndc_count";

	private static final String NDC_QUERY = "SELECT a.uuid AS a_uuid, a.firstname,a.tenantid, a.lastname, a.mobile, a.email, a.address, a.applicationstatus, a.createdby AS a_createdby, a.lastmodifiedby AS a_lastmodifiedby, a.createdtime AS a_createdtime, a.lastmodifiedtime AS a_lastmodifiedtime, " +
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
			query.append(" a.tenantid = ?");
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
			query.append(" a.status = ?");
			preparedStmtList.add(criteria.getStatus());
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

		query.append(" ORDER BY a.createdtime DESC");
		return query.toString();
	}


	private void addClauseIfRequired(StringBuilder query, boolean whereAdded) {
		if (whereAdded) {
			query.append(" AND");
		} else {
			query.append(" WHERE");
		}
	}

	public String getNdcDetailsQuery(String uuid) {
		return NDC_QUERY + " WHERE a.uuid = ?";
	}

	public String getExistingUuids(String tableName, List<String> uuids) {
		return "SELECT uuid FROM " + tableName + " WHERE uuid IN (" + uuids.stream().map(uuid -> "'" + uuid + "'").collect(Collectors.joining(",")) + ")";
	}

	/**
	 * 
	 * @param query
	 *            prepared Query
	 * @param preparedStmtList
	 *            values to be replased on the query
	 * @param criteria
	 *            bpa search criteria
	 * @return the query by replacing the placeholders with preparedStmtList
	 */
	private String addPaginationWrapper(String query, List<Object> preparedStmtList, NdcSearchCriteria criteria) {

		int limit = ndcConfig.getDefaultLimit();
		int offset = ndcConfig.getDefaultOffset();
		String finalQuery = paginationWrapper.replace("{}", query);

		if (criteria.getLimit() != null && criteria.getLimit() <= ndcConfig.getMaxSearchLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > ndcConfig.getMaxSearchLimit()) {
			limit = ndcConfig.getMaxSearchLimit();
		}

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		if (limit == -1) {
			finalQuery = finalQuery.replace("WHERE offset_ > ? AND offset_ <= ?", "");
		} else {
			preparedStmtList.add(offset);
			preparedStmtList.add(limit + offset);
		}

		log.info(finalQuery.toString());
		return finalQuery;

	}

	public String checkApplicantExists(String uuid) {
		return "SELECT uuid FROM eg_ndc_applicants WHERE uuid =?";
	}
}
