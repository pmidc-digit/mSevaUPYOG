package org.egov.rl.repository.rowmapper;

import org.egov.rl.models.*;
import org.egov.tracer.model.CustomException;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class AllotmentRowMapper implements ResultSetExtractor<List<AllotmentDetails>> {

	
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
					}
				}
			}
			if (userList.size() < rs.getLong("applicantCount")) {
				userList.add(getOwnerInfo(rs));
			}
			if (docList.size() < rs.getLong("documentCount")) {
				docList.add(getDocuments(rs));
			}
			auditDetails = getAuditDetail(rs, "allotment");
			currentAllotment = AllotmentDetails.builder().id(rs.getString("id")).propertyId(rs.getString("property_id"))
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
					.build();
			if (rs.getLong("totalAllotments") < 2) {
				currentAllotmentList.add(currentAllotment);
			}
		}
		return currentAllotmentList;

	}

	private OwnerInfo getOwnerInfo(ResultSet rs) {
		OwnerInfo owner = null;
		try {
			owner = OwnerInfo.builder().ownerId(rs.getString("id")).allotmentId(rs.getString("allotment_id"))
					.userUuid(rs.getString("user_uuid"))
					.isPrimaryOwner(rs.getBoolean("is_primary_owner"))
					.ownerType(rs.getString("owner_type"))
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

			return AuditDetails.builder().createdBy(rs.getString("created_by")).createdTime(rs.getLong("created_time"))
					.lastModifiedBy(rs.getString("lastmodified_time")).lastModifiedTime(lastModifiedTime).build();
		}
		return null;
	}

	private Document getDocuments(ResultSet rs) throws SQLException {

		return Document.builder().id(rs.getString("id")).documentUid(rs.getString("allotment_id"))
				.documentType(rs.getString("documenttype")).fileStoreId(rs.getString("fileStoreId"))
				.build();
	}
}