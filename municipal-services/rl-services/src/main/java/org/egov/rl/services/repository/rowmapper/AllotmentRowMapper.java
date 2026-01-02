package org.egov.rl.services.repository.rowmapper;

import org.egov.rl.services.models.*;
import org.egov.rl.services.models.enums.Status;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class AllotmentRowMapper implements ResultSetExtractor<List<AllotmentDetails>> {

	@Autowired
	private ObjectMapper mapper;

	@Override
	public List<AllotmentDetails> extractData(ResultSet rs) throws SQLException, DataAccessException {
		AuditDetails auditDetails = null;
		List<AllotmentDetails> currentAllotmentList = new ArrayList<>();

		List<OwnerInfo> userList = new ArrayList<>();
		List<Document> docList = new ArrayList<>();
		AllotmentDetails currentAllotment = null;
		while (rs.next()) {
			if (currentAllotmentList.size() <= rs.getLong("totalAllotments") && rs.getLong("totalAllotments") > 1) {
				if (currentAllotment != null) {
					String allotmentId = currentAllotment.getId();
					if (currentAllotmentList.stream().noneMatch(d -> d.getId().equals(allotmentId))) {
						currentAllotmentList.add(currentAllotment);
						if (rs.getLong("applicantCount") == userList.size()) {
							userList = new ArrayList<>();
						}
						if (rs.getLong("documentCount") == docList.size()) {
							docList = new ArrayList<>();
						}
					}
				}
			}
			// if (userList.size() < rs.getLong("applicantCount")) {
			// 	userList.add(getOwnerInfo(rs));
			// }
			// if (docList.size() < rs.getLong("documentCount")) {
			// 	docList.add(getDocuments(rs));
			// }
			if (userList.size()==0l||(userList.size() < rs.getLong("applicantCount")&&(userList.get(0).getAllotmentId().equals(rs.getString("onr_allotmentId"))))) {
				userList.add(getOwnerInfo(rs));
			}
			if (rs.getLong("documentCount")!=0l(docList.size()==0l||(docList.size() < rs.getLong("documentCount")&&(docList.get(0).getDocumentUid().equals(rs.getString("onr_allotmentId")))))) {
				docList.add(getDocuments(rs));
			}
			auditDetails = getAuditDetail(rs, "allotment");
			currentAllotment = AllotmentDetails.builder()
					.id(rs.getString("id"))
					.propertyId(rs.getString("property_id"))
					.tenantId(rs.getString("tenant_id"))
					.applicationNumber(rs.getString("application_number"))
					.registrationNumber(rs.getString("registration_number"))
					.tradeLicenseNumber(rs.getString("trade_license_number"))
					.previousApplicationNumber(rs.getString("previous_application_number"))
					.applicationType(rs.getString("application_type"))
					.startDate(rs.getLong("start_date"))
					.endDate(rs.getLong("end_date"))
					.isGSTApplicable(rs.getBoolean("is_gst_applicable"))
					.isCowCessApplicable(rs.getBoolean("is_cow_cess_applicable"))
					.isRefundApplicableOnDiscontinuation(rs.getBoolean("is_refund_applicable_on_discontinuation"))
					.termAndCondition(rs.getString("term_and_condition"))
					.penaltyType(rs.getString("penalty_type"))
					.createdTime(rs.getLong("created_time"))
					.createdBy(rs.getString("created_by"))
					.documents(docList)
					.reasonForClosure(rs.getString("reason_for_closure"))
					.notesComments(rs.getString("notes_comments"))
					.amountToBeDeducted(rs.getBigDecimal("amount_tobe_deducted"))
					.amountToBeRefund(rs.getBigDecimal("amount_to_be_refund"))
					.expireFlag(rs.getBoolean("expireflag"))
					.status(rs.getString("status"))
					.ownerInfo(userList)
					.auditDetails(auditDetails)
					.additionalDetails(getAdditionalDetails(rs.getObject("additional_details")))
					.build();
			if (currentAllotmentList.isEmpty()) {
				currentAllotmentList.add(currentAllotment);
			}
		}
		return currentAllotmentList;

	}

	private OwnerInfo getOwnerInfo(ResultSet rs) {
		OwnerInfo owner = null;
		try {
			owner = OwnerInfo.builder()
					.ownerId(rs.getString("owner_id"))
					.allotmentId(rs.getString("onr_allotmentId"))
					.userUuid(rs.getString("user_uuid"))
					.isPrimaryOwner(rs.getBoolean("is_primary_owner"))
					.ownerShipPercentage(rs.getDouble("ownership_percentage"))
					.ownerType(rs.getString("owner_type"))
					.status(Status.valueOf(rs.getString("onr_status").toUpperCase()))
					.build();
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("PARSING_ERROR", "Error parsing OwnerInfo from JSON");
		}
		return owner;
	}

	private AuditDetails getAuditDetail(ResultSet rs, String source) throws SQLException {
		if ("allotment".equals(source)) {
			Long lastModifiedTime = rs.getLong("lastmodified_time");
			if (rs.wasNull())
				lastModifiedTime = null;

			return AuditDetails.builder()
					.createdBy(rs.getString("created_by"))
					.createdTime(rs.getLong("created_time"))
					.lastModifiedBy(rs.getString("lastmodified_time"))
					.lastModifiedTime(lastModifiedTime)
					.build();
		}
		return null;
	}

	private Document getDocuments(ResultSet rs) throws SQLException {

		return Document.builder()
				.id(rs.getString("doc_id"))
				.documentUid(rs.getString("doc_allotmentId"))
				.documentType(rs.getString("documenttype"))
				.fileStoreId(rs.getString("fileStoreId"))
				.status(Status.valueOf(rs.getString("doc_status").toUpperCase()))
				.build();
	}

	private JsonNode getAdditionalDetails(Object additionalDetails) {
		try {
			ObjectNode root = (ObjectNode) mapper.valueToTree(additionalDetails);
			JsonNode valueNode = root.get("value");
			if (valueNode == null || valueNode.isNull()) {
				return mapper.createArrayNode();
			}
			ArrayNode arrayNode;
			if (valueNode.isTextual()) {
				String jsonArrayText = valueNode.asText();
				JsonNode parsed = mapper.readTree(jsonArrayText);
				if (!parsed.isArray()) {
					throw new IllegalArgumentException(
							"Expected JSON array in 'value' string, but found: " + parsed.getNodeType());
				}
				arrayNode = (ArrayNode) parsed;
			} else if (valueNode.isArray()) {
				arrayNode = (ArrayNode) valueNode;
			} else {
				throw new IllegalArgumentException(
						"The 'value' field must be a JSON array or JSON array string. Found: "
								+ valueNode.getNodeType());
			}
			List<RLProperty> rlList = mapper.convertValue(arrayNode,
					mapper.getTypeFactory().constructCollectionType(List.class, RLProperty.class));
			return mapper.valueToTree(rlList);

		} catch (IOException e) {
			throw new RuntimeException("Failed to parse 'additionalDetails.value' as JSON array", e);
		}
	}

}