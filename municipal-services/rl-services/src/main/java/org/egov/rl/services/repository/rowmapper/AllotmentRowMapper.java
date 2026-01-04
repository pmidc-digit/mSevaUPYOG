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
			
		Map<String, AllotmentDetails> allotmentDetailsMap = new LinkedHashMap<>();
		
		while (rs.next()) {
			String uuid = rs.getString("id");
			AllotmentDetails allotmentDetails = allotmentDetailsMap.get(uuid);
			if (allotmentDetails == null) {
				auditDetails = getAuditDetail(rs, "allotment");
				allotmentDetails = AllotmentDetails.builder()
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
					.reasonForClosure(rs.getString("reason_for_closure"))
					.notesComments(rs.getString("notes_comments"))
					.amountToBeDeducted(rs.getBigDecimal("amount_tobe_deducted"))
					.amountToBeRefund(rs.getBigDecimal("amount_to_be_refund"))
					.expireFlag(rs.getBoolean("expireflag"))
					.status(rs.getString("status"))
					.auditDetails(auditDetails)
					.additionalDetails(getAdditionalDetails(rs.getObject("additional_details")))
					.build();
					 getOwnerInfo(rs,allotmentDetails);
					 getDocuments(rs,allotmentDetails);
			}else {
				String allUuid=rs.getString("id");
			    List<AllotmentDetails>	allotmentDetail=new ArrayList<>();
			    allotmentDetail.add(allotmentDetails);
			    AllotmentDetails allotment=allotmentDetail.stream().filter(al->al.getId().equals(allUuid)).findFirst().orElse(null);
				
			    if(allotment!=null) {
				     
			    	 String ownerId=rs.getString("owner_id");
					 if(allotment.getOwnerInfo().stream().noneMatch(onr->onr.getOwnerId().equalsIgnoreCase(ownerId))) {
						 getOwnerInfo(rs,allotmentDetails);			
					 }
					 
					 String docId=rs.getString("doc_id");
					 if(allotmentDetails.getDocuments()!=null&&!allotmentDetails.getDocuments().isEmpty()&&allotment.getDocuments().stream().noneMatch(onr->onr.getId().equalsIgnoreCase(docId))) {
					 	 getDocuments(rs, allotmentDetails);			
					 }
				}	 			   		
			}
			allotmentDetailsMap.put(uuid, allotmentDetails);
		}
		return new ArrayList<>(allotmentDetailsMap.values());
	}

	private void getOwnerInfo(ResultSet rs,AllotmentDetails allotmentDetails) {
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
			allotmentDetails.addOwnersItem(owner);
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("PARSING_ERROR", "Error parsing OwnerInfo from JSON");
		}
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

	private void getDocuments(ResultSet rs,AllotmentDetails allotmentDetails) throws SQLException {
      try {
			Document doc= Document.builder()
					.id(rs.getString("doc_id"))
					.documentUid(rs.getString("doc_allotmentId"))
					.documentType(rs.getString("documenttype"))
					.fileStoreId(rs.getString("fileStoreId"))
					.status(Status.valueOf(rs.getString("doc_status").toUpperCase()))
					.build();
			allotmentDetails.addDocumentsItem(doc);
		}catch(Exception e) {
			allotmentDetails.setDemandId(null);
		}
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