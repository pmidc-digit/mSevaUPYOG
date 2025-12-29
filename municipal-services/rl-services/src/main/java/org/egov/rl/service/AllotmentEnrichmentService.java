package org.egov.rl.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.AuditDetails;
import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.repository.AllotmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

@Service
public class AllotmentEnrichmentService {

	@Autowired
	private PropertyUtil propertyutil;

	@Autowired
	private BoundaryService boundaryService;

	@Autowired
	private RentLeaseConfiguration config;

	@Autowired
	private AllotmentRepository allotmentRepository;

	@Autowired
	private UserService userService;

	/**
	 * Assigns UUIDs to all id fields and also assigns acknowledgement-number and
	 * assessment-number generated from id-gen
	 * 
	 * @param request PropertyRequest received for property creation
	 */

	public void enrichCreateRequest(AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();

		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		allotmentDetails.setAuditDetails(auditDetails);
		enrichUuidsForOwnerCreate(requestInfo, allotmentRequest);
		setIdgenIds(allotmentRequest);
		if(allotmentRequest.getAllotment().getPreviousApplicationNumber()==null) {
		 setRegistrationNumber(allotmentRequest);
		}
	}

//	public void enrichUpdateRequest(AllotmentRequest allotmentRequest) {
//		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
//		RequestInfo requestInfo = allotmentRequest.getRequestInfo();
//	
//		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
//		allotmentDetails.setAuditDetails(auditDetails);
//		allotmentDetails.setAdditionalDetails(boundaryService.loadPropertyData(allotmentRequest));
//		enrichUuidsForOwnerCreate(requestInfo, allotmentRequest);
////		setIdgenIds(allotmentRequest);
//	}

//    public Object fetchThirdPartyIntegration(RequestInfo requestInfo, String tenantId, String moduleName, String masterName, String userType, Boolean active) {
//	    
//		
//		List<MasterDetail> masterDetails = new ArrayList<>();
//		String filter = String.format("[?(@.category=='%s' && @.active==%b)]", userType, active);
//	    
//	    // Add master detail with the dynamic filter
//	    masterDetails.add(MasterDetail.builder()
//	            .name(PTConstants.MDMS_WC_ROLE_MASTERNAME)
//	            .filter(filter)
//	            .build());
//
//     
//        List<ModuleDetail> wfModuleDtls = Collections.singletonList(ModuleDetail.builder().masterDetails(masterDetails)
//                .moduleName(PTConstants.MDMS_WC_ROLE_MODLENAME).build());
//
//        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(wfModuleDtls)
//                .tenantId(config.getStateLevelTenantId())
//                .build();
//
//        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
//                .requestInfo(requestInfo).build();
//        String uRi=config.getMdmsHost()+config.getMdmsEndpoint();
//        Object result = serviceRequestRepository.fetchmdmsResult(uRi, mdmsCriteriaReq);
//
//
//	    return result;
//	}

	/**
	 * Assigns UUID for new fields that are added and sets propertyDetail and
	 * address id from propertyId
	 * 
	 * @param request        PropertyRequest received for property update
	 * @param propertyFromDb Properties returned from DB
	 */
	public void enrichUpdateRequest(AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();

		AllotmentCriteria allotmentCriteria = new AllotmentCriteria();
		Set<String> id = new HashSet<>();
		id.add(allotmentRequest.getAllotment().getId());
		allotmentCriteria.setAllotmentIds(id);
		allotmentCriteria.setTenantId(allotmentRequest.getAllotment().getTenantId());
		AllotmentDetails allotmentDbDetails = searchAllotment(allotmentRequest.getRequestInfo(), allotmentCriteria)
				.stream().findFirst().orElse(null);

		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), false);
		auditDetails.setCreatedBy(allotmentDbDetails.getCreatedBy());
		auditDetails.setCreatedTime(allotmentDbDetails.getCreatedTime());

		allotmentDbDetails.setAuditDetails(auditDetails);
		allotmentDbDetails.setStartDate(allotmentDetails.getStartDate());
		allotmentDbDetails.setEndDate(allotmentDetails.getEndDate());
		allotmentDbDetails.setGSTApplicable(allotmentDetails.isGSTApplicable());
		allotmentDbDetails.setCowCessApplicable(allotmentDetails.isCowCessApplicable());
		allotmentDbDetails.setRefundApplicableOnDiscontinuation(allotmentDetails.isRefundApplicableOnDiscontinuation());
		allotmentDbDetails.setWitnessDetails(allotmentDetails.getWitnessDetails());
		allotmentDbDetails.setStatus(allotmentDetails.getStatus());
		allotmentDbDetails.setTermAndCondition(allotmentDetails.getTermAndCondition());
		allotmentDbDetails.setPenaltyType(allotmentDetails.getPenaltyType());
		allotmentDbDetails.setOwnerInfo(allotmentDetails.getOwnerInfo());
		allotmentDbDetails.setDocuments(allotmentDetails.getDocuments());
		allotmentDbDetails.setWorkflow(allotmentDetails.getWorkflow());
		allotmentDbDetails.setAdditionalDetails(allotmentDetails.getAdditionalDetails());
		allotmentDbDetails.setApplicationNumber(allotmentDetails.getApplicationNumber());
		allotmentDbDetails.setPropertyId(allotmentDetails.getPropertyId());
		allotmentDbDetails.setTenantId(allotmentDetails.getTenantId());
		allotmentDbDetails.setAmountToBeDeducted(allotmentDetails.getAmountToBeDeducted());
		allotmentRequest.setAllotment(allotmentDbDetails);

		enrichUuidsForOwnerUpdate(requestInfo, allotmentRequest, allotmentDbDetails);
		updateIdgenIds(allotmentRequest);

	}

	public List<AllotmentDetails> searchAllotment(RequestInfo requestInfo, AllotmentCriteria allotmentCriteria) {
		try {
			// Handle mobile number search by converting to owner UUIDs
			if (!ObjectUtils.isEmpty(allotmentCriteria.getMobileNumber())) {
				System.out.println("DEBUG: Searching by mobile number: " + allotmentCriteria.getMobileNumber());
			}
			return allotmentRepository.getAllotmentByIds(allotmentCriteria);
		} catch (Exception e) {
			e.printStackTrace();
			// TODO: handle exception
		}
		return null;
	}

	private void enrichUuidsForOwnerCreate(RequestInfo requestInfo, AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		String allotmentId = UUID.randomUUID().toString();

//		if (!CollectionUtils.isEmpty(allotmentDetails.getDocuments())) {
//		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
//		if (allotmentDetails.getDocuments() != null && allotmentDetails.getDocuments().size() > 0) {
//			List<Document> docList = allotmentDetails.getDocuments().stream().map(doc -> {
//				Document document = doc;
//				document.setDocumentUid(allotmentId);
//				document.setId(UUID.randomUUID().toString());
//				document.setStatus(Status.ACTIVE);
//				document.setAuditDetails(auditDetails);
//				return document;
//			}).collect(Collectors.toList());
//			allotmentDetails.setDocuments(docList);
//		}

		List<OwnerInfo> lst = allotmentDetails.getOwnerInfo().stream().map(m -> {
			m.setOwnerId(UUID.randomUUID().toString());
			m.setAllotmentId(allotmentId);
			m.setStatus(Status.ACTIVE);
			return m;
		}).collect(Collectors.toList());
		allotmentDetails.setOwnerInfo(lst);
		allotmentDetails.setId(allotmentId);
		List<AllotmentDetails> allotmentDetails2 = new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);

	}

	private void enrichUuidsForOwnerUpdate(RequestInfo requestInfo, AllotmentRequest allotmentRequest,
			AllotmentDetails allotmentDbDetails) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		AuditDetails auditDbDetails = allotmentDbDetails.getAuditDetails();
		String allotmentId = allotmentDetails.getId();
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), false);
		auditDetails.setCreatedBy(auditDbDetails.getCreatedBy());
		auditDetails.setCreatedTime(auditDbDetails.getCreatedTime());

//		if (allotmentDetails.getWorkflow().getStatus().equals("INITIATED")) {
		List<OwnerInfo> lst = allotmentDetails.getOwnerInfo().stream().map(m -> {
			m.setOwnerId(m.getOwnerId() == null ? UUID.randomUUID().toString() : m.getOwnerId());
			m.setAllotmentId(allotmentId);
			m.setStatus(Status.ACTIVE);
			return m;
		}).collect(Collectors.toList());
		allotmentDetails.setOwnerInfo(lst);
		allotmentDetails.setId(allotmentId);
		List<AllotmentDetails> allotmentDetails2 = new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		updateDocument(allotmentDetails, allotmentId, auditDetails);
//		} else {
//			updateDocument(allotmentDetails, allotmentId, auditDetails);
//		}

		allotmentRequest.setAllotment(allotmentDetails);
	}

	private void updateDocument(AllotmentDetails allotmentDetails, String allotmentId, AuditDetails auditDetails) {
		if (allotmentDetails.getDocuments() != null && allotmentDetails.getDocuments().size() > 0) {
			List<Document> docList = allotmentDetails.getDocuments().stream().map(doc -> {
				Document document = doc;
				document.setDocumentUid(allotmentId);
				document.setId(doc.getId() == null ? UUID.randomUUID().toString() : doc.getId());
				document.setStatus(Status.ACTIVE);
				document.setAuditDetails(auditDetails);
				return document;
			}).collect(Collectors.toList());
			allotmentDetails.setDocuments(docList);
		}
	}

	/**
	 * Sets the acknowledgement and assessment Numbers for given PropertyRequest
	 * 
	 * @param request PropertyRequest which is to be created
	 */
	private void setIdgenIds(AllotmentRequest allotmentRequest) {

		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		String tenantId = allotmentDetails.getTenantId();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();

		if (config.getIsWorkflowEnabled()) {
			allotmentDetails.setStatus(allotmentRequest.getAllotment().getWorkflow().getStatus());
		}
		String applicationNumber = propertyutil.getIdList(requestInfo, tenantId,
				config.getAllotmentApplicationNummberGenName(), config.getAllotmentApplicationNummberGenNameFormat(), 1)
				.get(0);
		allotmentDetails.setApplicationNumber(applicationNumber);
		List<AllotmentDetails> allotmentDetails2 = new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
	}

	private void setRegistrationNumber(AllotmentRequest allotmentRequest) {

		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		String tenantId = allotmentDetails.getTenantId();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();
		String registrationNumber = propertyutil.getIdList(requestInfo, tenantId,
				config.getRlRegistrationNumber(), config.getRlRegistrationNumberFormat(), 1)
				.get(0);
		allotmentDetails.setRegistrationNumber(registrationNumber);
		List<AllotmentDetails> allotmentDetails2 = new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
	}

	private void updateIdgenIds(AllotmentRequest allotmentRequest) {

		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		String tenantId = allotmentDetails.getTenantId();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();

		if (config.getIsWorkflowEnabled()) {
			allotmentDetails.setStatus(allotmentRequest.getAllotment().getWorkflow().getStatus());
		}
//		String applicationNumber = propertyutil.getIdList(requestInfo, tenantId,
//				config.getAllotmentApplicationNummberGenName(), config.getAllotmentApplicationNummberGenNameFormat(), 1)
//				.get(0);
//		allotmentDetails.setApplicationNumber(applicationNumber);
		List<AllotmentDetails> allotmentDetails2 = new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
	}

	public void enrichOwnerDetailsFromUserService(List<AllotmentDetails> allotmentDetails, RequestInfo requestInfo) {
		allotmentDetails.stream().map(d -> {
			return d.getOwnerInfo().stream().map(ownerInfo -> {
				try {
					// Fetch user details from user service using the stored UUID
					org.egov.rl.models.user.UserSearchRequest userSearchRequest = userService
							.getBaseUserSearchRequest(d.getTenantId(), requestInfo);
					userSearchRequest.setUuid(java.util.Collections.singleton(ownerInfo.getUserUuid()));

					org.egov.rl.models.user.UserDetailResponse userDetailResponse = userService
							.getUser(userSearchRequest);

					if (userDetailResponse != null && !CollectionUtils.isEmpty(userDetailResponse.getUser())) {
						org.egov.rl.models.user.User user = userDetailResponse.getUser().get(0);
//System.out.println("============="+user.getName());
						// Populate owner with complete user details
//						owner.setId(user.getId());
						ownerInfo.setUserUuid(user.getUuid());
//						ownerInfo.setUserName(user.getUserName());
//						owner.setPassword(user.getPassword());
//						owner.setSalutation(user.getSalutation());
						ownerInfo.setName(user.getName());
//						ownerInfo.setGender(user.getGender());
						ownerInfo.setMobileNo(user.getMobileNumber());
						ownerInfo.setEmailId(user.getEmailId());
//						owner.setAltContactNumber(user.getAltContactNumber());
//						ownerInfo.setPanCard(user.getPan());
//						ownerInfo.setAadharCard(user.getAadhaarNumber());

						ownerInfo.setPermanentAddress(Address.builder().addressId(user.getPermanentAddress())
								.pincode(user.getPermanentPincode()).addressLine1(null).city(user.getPermanentCity())
								.build());
//						owner.setPermanentCity(user.getPermanentCity());
//						owner.setPermanentPincode(user.getPermanentPincode());
						ownerInfo.setCorrespondenceAddress(Address.builder().addressId(user.getCorrespondenceAddress())
								.pincode(user.getCorrespondencePincode()).addressLine1(null)
								.city(user.getCorrespondenceCity()).build());
//						owner.setCorrespondencePincode(user.getCorrespondencePincode());
//						owner.setCorrespondenceAddress(user.getCorrespondenceAddress());
						ownerInfo.setActive(user.getActive());
						ownerInfo.setDob(user.getDob());
//						ownerInfo.setPwdExpiryDate(user.getPwdExpiryDate());
//						owner.setLocale(user.getLocale());
//						ownerInfo.setType(user.getType());
//						owner.setSignature(user.getSignature());
//						owner.setAccountLocked(user.getAccountLocked());
//						ownerInfo.setRoles(user.getRoles());
//						ownerInfo.setFatherOrHusbandName(user.getFatherOrHusbandName());
//						owner.setBloodGroup(user.getBloodGroup());
//						owner.setIdentificationMark(user.getIdentificationMark());
//						owner.setPhoto(user.getPhoto());
//						owner.setCreatedBy(user.getCreatedBy());
//						owner.setCreatedDate(user.getCreatedDate());
//						owner.setLastModifiedBy(user.getLastModifiedBy());
//						owner.setLastModifiedDate(user.getLastModifiedDate());
						ownerInfo.setTenantId(user.getTenantId());

						// Populate father name in the application from user service
//						application.setFatherName(user.getFatherOrHusbandName());
					}
				} catch (Exception e) {
					// Log error but don't fail the search
					System.err.println("Error fetching user details for owner: " + ownerInfo.getUserUuid() + ", Error: "
							+ e.getMessage());
				}
				return ownerInfo;
			}).collect(Collectors.toList());
		}).collect(Collectors.toList());
	}
}
