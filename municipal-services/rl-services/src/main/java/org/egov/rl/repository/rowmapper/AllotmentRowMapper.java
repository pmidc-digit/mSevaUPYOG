package org.egov.rl.repository.rowmapper;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.egov.rl.models.*;
import org.egov.rl.models.enums.Relationship;
import org.egov.rl.models.enums.Status;
import org.egov.rl.service.BoundaryService;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class AllotmentRowMapper implements ResultSetExtractor<List<AllotmentDetails>> {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	RestTemplate restTemplate;// = new RestTemplate();

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
			System.out.println("-----aa-----------"+rs.getString("application_number"));
			auditDetails = getAuditDetail(rs, "allotment");
			currentAllotment = AllotmentDetails.builder()
					.id(rs.getString("id"))
					.propertyId(rs.getString("property_id"))
					.tenantId(rs.getString("tenant_id"))
					.applicationNumber(rs.getString("application_number"))
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
					.ownerInfo(userList)
					.auditDetails(auditDetails).build();
			if (rs.getLong("totalAllotments") < 2) {
				currentAllotmentList.add(currentAllotment);
			}
		}

//		currentAllotment.setOwnerInfo(userList);
//		currentAllotment.setAuditDetails(auditDetails);		
		return currentAllotmentList;

	}

	private OwnerInfo getOwnerInfo(ResultSet rs) {
		OwnerInfo owner = null;
		try {
			owner = OwnerInfo.builder().ownerId(rs.getString("id")).allotmentId(rs.getString("allotment_id"))
					.userUuid(rs.getString("user_uuid"))
//					.gender(rs.getString("gender"))
//					.fatherOrHusbandName(rs.getString("father_or_husband_name"))
					.isPrimaryOwner(rs.getBoolean("is_primary_owner"))
//					.ownerShipPercentage(rs.getDouble("owner_ship_percentage"))
					.ownerType(rs.getString("owner_type"))
//					.firstName(rs.getString("first_name"))
//					.middleName(rs.getString("middle_name"))
//					.lastName(rs.getString("last_name"))
//					.emailId(rs.getString("email_id"))
//					.mobileNo(rs.getString("mobile_no"))
//					.permanentAddress(rs.getObject("permanentAddress").)
//					.aadharCardNumber(rs.getString("aadhar_card_number"))
//					.aadharCard(rs.getString("aadhar_card"))
//					.panCardNumber(rs.getString("pan_card_number"))
//					.panCard(rs.getString("pan_card"))
//					.relationship(Relationship.valueOf(rs.getString("relationship")))
//					.active(rs.getBoolean("active"))
//					.dob(rs.getLong("dob"))
//					.bloodGroup(rs.getString("blood_group"))
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
//					 .documentUid(entityId).id(docId).auditDetails(allotmentRequest.getAllotment().getAuditDetails())
				.build();
	}
}

//package org.egov.pt.repository.rowmapper;
//
//import java.io.IOException;
//
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//
//import org.egov.mdms.model.MasterDetail;
//import org.egov.mdms.model.MdmsCriteria;
//import org.egov.mdms.model.MdmsCriteriaReq;
//import org.egov.mdms.model.ModuleDetail;
//import org.egov.pt.config.PropertyConfiguration;
//import org.egov.pt.models.AllotmentDetails;
//import org.egov.pt.models.AllotmentRequest;
//import org.egov.pt.models.AuditDetails;
//import org.egov.pt.models.Document;
//import org.egov.pt.models.OwnerInfo;
//import org.egov.pt.models.Property;
//import org.egov.pt.models.enums.Relationship;
//import org.egov.pt.models.enums.Status;
//import org.egov.pt.service.BoundaryService;
//import org.egov.pt.service.PropertyService;
//import org.egov.tracer.model.CustomException;
//import org.postgresql.util.PGobject;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.dao.DataAccessException;
//import org.springframework.http.ResponseEntity;
//import org.springframework.jdbc.core.ResultSetExtractor;
//import org.springframework.stereotype.Component;
//import org.springframework.util.CollectionUtils;
//import org.springframework.web.client.RestTemplate;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//@Component
//public class AllotmentRowMapper implements ResultSetExtractor<AllotmentRequest> {
//
//
//	@Autowired
//	private ObjectMapper mapper;
//
//	@Autowired
//	RestTemplate restTemplate;// = new RestTemplate();
//	
//	@Autowired
//	BoundaryService boundaryService;
//
//	@Override
//	public AllotmentRequest extractData(ResultSet rs) throws SQLException, DataAccessException {
//
//		Map<String, AllotmentRequest> propertyMap = new LinkedHashMap<>();
//
//		String propertyUuId = rs.getString("id");
//		AllotmentDetails currentAllotment = null;// propertyMap.get(propertyUuId).getAllotment();
//		String tenantId = rs.getString("tenant_id");
//			List<Map<String, Object>> user = getUserFromResultSet(rs);
//			List<OwnerInfo> users = getOwnerInfo(user);
//			AllotmentRequest allotmentRequest=new AllotmentRequest();// need to pass value
//			AuditDetails auditDetails = getAuditDetail(rs, "allotment");
//			currentAllotment = AllotmentDetails.builder().id(propertyUuId)
//					.propertyId(rs.getString("propertyid"))
//					.tenantId(tenantId).isAutoRenewal(rs.getBoolean("is_auto_renewal"))
//					.previousApplicationNumber(rs.getString("previous_application_number"))
//					.applicationStatus(rs.getInt("application_status"))
//					.applicationType(rs.getString("application_type"))
//					.startDate(rs.getLong("start_date"))
//					.endDate(rs.getLong("end_date"))
//					.termAndCondition(rs.getString("term_and_condition"))
//					.penaltyType(rs.getString("penalty_type"))
//					.createdTime(rs.getTimestamp("created_time"))
//					.createdBy(rs.getString("created_by"))
//					.auditDetails(auditDetails)
//					.user(users) // ✅ Set user list here
//					.additionalDetails(boundaryService.loadPropertyData(allotmentRequest))
//					.build();
//		allotmentRequest=AllotmentRequest.builder().allotment(currentAllotment).build();
//		return allotmentRequest;
//	}
//
//	/**
//	 * creates and adds the address object to property
//	 * 
//	 * @param rs
//	 * @param tenanId
//	 * @return
//	 * @throws SQLException
//	 */
//	private List<OwnerInfo> getOwnerInfo(List<Map<String, Object>> rsList) throws SQLException {
//
//		List<OwnerInfo> userList = new ArrayList<>();
//		rsList.forEach(rs -> {
//			OwnerInfo owner = null;
//			try {
//				owner = OwnerInfo.builder()
//						.ownerId(((ResultSet) rs).getString("owner_id"))
//						.gender(((ResultSet) rs).getString("gender"))
//						.fatherOrHusbandName(((ResultSet) rs).getString("father_or_husband_name"))
//						.isPrimaryOwner(((ResultSet) rs).getBoolean("is_primary_owner"))
//						.ownerShipPercentage(((ResultSet) rs).getDouble("owner_ship_percentage"))
//						.ownerType(((ResultSet) rs).getString("owner_type"))
//						.firstName(((ResultSet) rs).getString("first_name"))
//						.middleName(((ResultSet) rs).getString("middle_name"))
//						.lastName(((ResultSet) rs).getString("last_name"))
//						.emailId(((ResultSet) rs).getString("email_id"))
//						.mobileNo(((ResultSet) rs).getString("mobile_no"))
//						.address(((ResultSet) rs).getString("address"))
//						.aadharCardNumber(((ResultSet) rs).getString("aadhar_card_number"))
//						.aadharCard(((ResultSet) rs).getString("aadhar_card"))
//						.panCardNumber(((ResultSet) rs).getString("pan_card_number"))
//						.panCard(((ResultSet) rs).getString("pan_card"))
//						.relationship(Relationship.valueOf(((ResultSet) rs).getString("relationship")))
//						.active(((ResultSet) rs).getBoolean("active")).dob(((ResultSet) rs).getLong("dob"))
//						.bloodGroup(((ResultSet) rs).getString("blood_group")).build();
//			} catch (SQLException e) {
//				e.printStackTrace();
//				throw new CustomException("PARSING ERROR", "The user additionalDetail json cannot be parsed");
//			}
//
//			userList.add(owner);
//		});
//		return userList;
//	}
//
//	private List<Map<String, Object>> getUserFromResultSet(ResultSet rs) throws SQLException {
//		PGobject pgObj = (PGobject) rs.getObject("user"); // 'user' column contains JSON array
//
//		if (pgObj != null && pgObj.getValue() != null) {
//			try {
//				return mapper.readValue(pgObj.getValue(),
//						mapper.getTypeFactory().constructCollectionType(List.class, Map.class));
//			} catch (IOException e) {
//				throw new SQLException("Failed to parse user JSON", e);
//			}
//		}
//
//		return new ArrayList<>();
//	}
//
//	/**
//	 * prepares and returns an audit detail object
//	 * 
//	 * depending on the source the column names of result set will vary
//	 * 
//	 * @param rs
//	 * @return
//	 * @throws SQLException
//	 */
//	private AuditDetails getAuditDetail(ResultSet rs, String source) throws SQLException {
//		switch (source) {
//		case "allotment":
//			Long lastModifiedTime = rs.getLong("plastModifiedTime");
//			if (rs.wasNull()) {
//				lastModifiedTime = null;
//			}
//
//			return AuditDetails.builder().createdBy(rs.getString("createdBy")).createdTime(rs.getLong("createdTime"))
//					.lastModifiedBy(rs.getString("lastModifiedBy")).lastModifiedTime(lastModifiedTime).build();
//		default:
//			return null;
//		}
//	}
//
//	
//	/**
//	 * Adds document to Property
//	 * 
//	 * Same document table is being used by both property and owner table, so id check is mandatory
//	 * 
//	 * @param rs
//	 * @param property
//	 * @throws SQLException
//	 */
//	@SuppressWarnings("null")
//	private void addDocToProperty(ResultSet rs, AllotmentRequest allotmentRequest) throws SQLException {
//
//		String docId = ((ResultSet) rs).getString("id");
//		String entityId = ((ResultSet) rs).getString("allotment_id");
//		List<Document> docs = allotmentRequest.getAllotment().getDocuments();
//		
//		if (!(docId != null && entityId.equals(allotmentRequest.getAllotment().getId())))
//			return;
//		List<Document> docList=null;
//		if (!CollectionUtils.isEmpty(docs))
//			for (Document doc : docs) {
//				if (doc.getId().equals(docId)) {
//					return;
//				} else {
//				docList.add(Document.builder()
//						.status(Status.fromValue(((ResultSet) rs).getString("status")))
//						.documentType(((ResultSet) rs).getString("documentType"))
//						.fileStoreId(((ResultSet) rs).getString("fileStoreId"))
//						.documentUid(entityId)
//						.id(docId)
//						.auditDetails(allotmentRequest.getAllotment().getAuditDetails())
//						.build());
//				}
//			}
//		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
//		allotmentDetails.setDocuments(docList);
////		List<AllotmentDetails> allotmentDetails2=new ArrayList();
////		allotmentDetails2.add(allotmentDetails);
//		allotmentRequest.setAllotment(allotmentDetails);
//	}
//
//}
