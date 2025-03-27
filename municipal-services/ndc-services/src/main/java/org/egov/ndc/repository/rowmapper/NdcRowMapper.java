package org.egov.ndc.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.web.model.AuditDetails;
import org.egov.ndc.web.model.Document;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.enums.ApplicationType;
import org.egov.ndc.web.model.enums.Status;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;

@Component
public class NdcRowMapper implements ResultSetExtractor<List<Ndc>> {
	/**
	 * extracts the data from the resultSet and populate the NDC Objects
	 * @see org.springframework.jdbc.core.ResultSetExtractor#extractData(java.sql.ResultSet)
	 */
	@Override
	public List<Ndc> extractData(ResultSet rs) throws SQLException, DataAccessException {
		Map<String, Ndc> ndcListMap = new HashMap<>();
		Ndc ndc = new Ndc();
		while (rs.next()) {
			String Id = rs.getString("ndc_Id");
			if (ndcListMap.getOrDefault(Id, null) == null) {
				ndc = new Ndc();
				ndc.setTenantId(rs.getString("tenantid"));
				ndc.setId(rs.getString("ndc_Id"));
				ndc.setApplicationNo(rs.getString("applicationNo"));
                ndc.setNdcNo(rs.getString("ndcNo"));
                ndc.setNdcType(rs.getString("ndcType"));
                ndc.setApplicationStatus(rs.getString("applicationStatus"));
                ndc.setApplicationType(ApplicationType.fromValue(rs.getString("applicationType")));
                ndc.setStatus(Status.fromValue(rs.getString("status")));
                ndc.setLandId(rs.getString("landId"));
                ndc.setSource(rs.getString("source"));
                ndc.setSourceRefId(rs.getString("sourceRefId"));
                ndc.setAccountId(rs.getString("AccountId"));

                Object additionalDetails = new Gson().fromJson(rs.getString("additionalDetails").equals("{}")
						|| rs.getString("additionalDetails").equals("null") ? null : rs.getString("additionalDetails"),
						Object.class);
                ndc.setAdditionalDetails(additionalDetails);
                
                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("ndc_createdBy"))
                        .createdTime(rs.getLong("ndc_createdTime"))
                        .lastModifiedBy(rs.getString("ndc_lastModifiedBy"))
                        .lastModifiedTime(rs.getLong("ndc_lastModifiedTime"))
                        .build();
			    ndc.setAuditDetails(auditdetails);
				 
			    ndcListMap.put(Id, ndc);
			}
			addChildrenToProperty(rs, ndc);
		}
		return new ArrayList<>(ndcListMap.values());
	}
	/**
	 * add the child objects like document to the NDC object from the result set.
	 * @param rs
	 * @param ndc
	 * @throws SQLException
	 */
	@SuppressWarnings("unused")
	private void addChildrenToProperty(ResultSet rs, Ndc ndc) throws SQLException {
		String documentId = rs.getString("ndc_doc_id");
		String tenantId = ndc.getTenantId();
		if (!StringUtils.isEmpty(documentId)) {
			Document applicationDocument = new Document();
		     Object additionalDetails = new Gson().fromJson(rs.getString("doc_details").equals("{}")
						|| rs.getString("doc_details").equals("null") ? null : rs.getString("doc_details"),
						Object.class);
			applicationDocument.setId(documentId);
			applicationDocument.setDocumentType(rs.getString("documenttype"));
			applicationDocument.setFileStoreId(rs.getString("ndc_doc_filestore"));
			applicationDocument.setDocumentUid(rs.getString("documentUid"));
			applicationDocument.setAdditionalDetails(additionalDetails);
			ndc.addDocumentsItem(applicationDocument);
		}
	}

}
