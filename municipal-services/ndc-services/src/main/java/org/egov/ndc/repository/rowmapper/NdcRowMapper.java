package org.egov.ndc.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.web.model.AuditDetails;
import org.egov.ndc.web.model.Document;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.enums.ApplicationType;
import org.egov.ndc.web.model.enums.Status;
import org.egov.ndc.web.model.ndc.ApplicantRequest;
import org.egov.ndc.web.model.ndc.DocumentRequest;
import org.egov.ndc.web.model.ndc.NdcApplicationRequest;
import org.egov.ndc.web.model.ndc.NdcDetailsRequest;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;

@Component
public class NdcRowMapper implements ResultSetExtractor<List<NdcApplicationRequest>> {

	private ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public List<NdcApplicationRequest> extractData(ResultSet rs) throws SQLException, DataAccessException {
		Map<String, NdcApplicationRequest> ndcApplicationRequestMap = new HashMap<>();
		while (rs.next()) {
			String applicantId = rs.getString("a_uuid");
			NdcApplicationRequest ndcApplicationRequest = ndcApplicationRequestMap.get(applicantId);
			if (ndcApplicationRequest == null) {
				ndcApplicationRequest = new NdcApplicationRequest();
				ApplicantRequest applicant = ApplicantRequest.builder()
						.uuid(applicantId)
						.tenantId(rs.getString("tenantid"))
						.firstname(rs.getString("firstname"))
						.lastname(rs.getString("lastname"))
						.mobile(rs.getString("mobile"))
						.email(rs.getString("email"))
						.address(rs.getString("address"))
						.applicationStatus(rs.getString("applicationstatus"))
						.createdby(rs.getString("a_createdby"))
						.lastmodifiedby(rs.getString("a_lastmodifiedby"))
						.createdtime(rs.getLong("a_createdtime"))
						.lastmodifiedtime(rs.getLong("a_lastmodifiedtime"))
						.build();
				ndcApplicationRequest.setApplicant(applicant);
				ndcApplicationRequestMap.put(applicantId, ndcApplicationRequest);
			}
            try {
                addNdcDetails(rs, ndcApplicationRequest);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            addDocuments(rs, ndcApplicationRequest);
		}
		return new ArrayList<>(ndcApplicationRequestMap.values());
	}

	/**
	 * Adds NdcDetails to the NdcApplicationRequest object from the result set.
	 * @param rs
	 * @param ndcApplicationRequest
	 * @throws SQLException
	 */
	private void addNdcDetails(ResultSet rs, NdcApplicationRequest ndcApplicationRequest) throws SQLException, JsonProcessingException {
		String ndcDetailsId = rs.getString("d_uuid");
		if (!StringUtils.isEmpty(ndcDetailsId)) {
			NdcDetailsRequest ndcDetails = NdcDetailsRequest.builder()
					.uuid(ndcDetailsId)
					.applicantId(rs.getString("d_applicantid"))
					.businessService(rs.getString("businessservice"))
					.consumerCode(rs.getString("consumercode"))
					.dueAmount(rs.getBigDecimal("dueamount"))
					.status(rs.getString("status"))
					.additionalDetails(getJsonValue((PGobject) rs.getObject("additionaldetails")))
					.build();

			ndcApplicationRequest.addNdcDetailsItem(ndcDetails);
		}
	}

	/**
	 * Adds Documents to the NdcApplicationRequest object from the result set.
	 * @param rs
	 * @param ndcApplicationRequest
	 * @throws SQLException
	 */
	private void addDocuments(ResultSet rs, NdcApplicationRequest ndcApplicationRequest) throws SQLException {
		String documentId = rs.getString("doc_uuid");
		if (!StringUtils.isEmpty(documentId)) {
			DocumentRequest document = DocumentRequest.builder()
					.uuid(documentId)
					.applicantId(rs.getString("doc_applicantid"))
					.documentType(rs.getString("documenttype"))
					.documentAttachment(rs.getString("documentattachment"))
					.build();
			ndcApplicationRequest.addDocumentsItem(document);
		}
	}

	public JsonNode getJsonValue(PGobject pGobject){
		try {
			if(Objects.isNull(pGobject) || Objects.isNull(pGobject.getValue()))
				return null;
			else
				return objectMapper.readTree( pGobject.getValue());
		} catch (Exception e) {
			throw new CustomException("JSON_EXCEPTION","json exception");
		}
	}

}
