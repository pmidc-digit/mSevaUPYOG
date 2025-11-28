package org.egov.rl.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.AuditDetails;
import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
import org.egov.common.contract.request.Role;
import org.egov.rl.models.enums.ApplicationType;
import org.egov.rl.models.enums.Channel;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.user.User;
import org.egov.rl.util.RLConstants;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.repository.AllotmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.databind.JsonNode;

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

    /**
     * Assigns UUIDs to all id fields and also assigns acknowledgement-number and assessment-number generated from id-gen
     * @param request  PropertyRequest received for property creation
     */
	
	public void enrichCreateRequest(AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();
	
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		allotmentDetails.setAuditDetails(auditDetails);
		allotmentDetails.setAdditionalDetails(boundaryService.loadPropertyData(allotmentRequest));
		enrichUuidsForOwnerCreate(requestInfo, allotmentRequest);
		setIdgenIds(allotmentRequest);
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
     * Assigns UUID for new fields that are added and sets propertyDetail and address id from propertyId
     * 
     * @param request  PropertyRequest received for property update
     * @param propertyFromDb Properties returned from DB
     */
    public void enrichUpdateRequest(AllotmentRequest allotmentRequest) {
    	AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
        RequestInfo requestInfo = allotmentRequest.getRequestInfo();
		
    	AllotmentCriteria allotmentCriteria=new AllotmentCriteria();
		Set<String> id=new HashSet<>();
		id.add(allotmentRequest.getAllotment().getId());
		allotmentCriteria.setAllotmentIds(id);
		allotmentCriteria.setTenantId(allotmentRequest.getAllotment().getTenantId());
		AllotmentDetails allotmentDbDetails= searchAllotment(allotmentRequest.getRequestInfo(), allotmentCriteria);
		
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), false);
		auditDetails.setCreatedBy(allotmentDbDetails.getCreatedBy());
		auditDetails.setCreatedTime(allotmentDbDetails.getCreatedTime());
		
		allotmentDbDetails.setAuditDetails(auditDetails);
		allotmentDbDetails.setAutoRenewal(allotmentDetails.isAutoRenewal());
		allotmentDbDetails.setStartDate(allotmentDetails.getStartDate());
		allotmentDbDetails.setEndDate(allotmentDetails.getEndDate());
		allotmentDbDetails.setAdditionalDetails(allotmentDbDetails.getAdditionalDetails());
		allotmentDbDetails.setWitnessDetails(allotmentDetails.getWitnessDetails());
		allotmentDbDetails.setApplicationStatus(allotmentDetails.getApplicationStatus());
		allotmentDbDetails.setStatus(allotmentDetails.getStatus());
		allotmentDbDetails.setTermAndCondition(allotmentDetails.getTermAndCondition());
		allotmentDbDetails.setPenaltyType(allotmentDetails.getPenaltyType());
		allotmentDbDetails.setOwnerInfo(allotmentDetails.getOwnerInfo());
		allotmentDbDetails.setDocuments(allotmentDetails.getDocuments());
		allotmentDbDetails.setWorkflow(allotmentDetails.getWorkflow());
		allotmentRequest.setAllotment(allotmentDbDetails);
		
		enrichUuidsForOwnerUpdate(requestInfo, allotmentRequest);
		setIdgenIds(allotmentRequest);
		
    }
    public AllotmentDetails searchAllotment(RequestInfo requestInfo,
		    AllotmentCriteria allotmentCriteria) {
    	    
			// Handle mobile number search by converting to owner UUIDs
			if (!ObjectUtils.isEmpty(allotmentCriteria.getMobileNumber())) {
			System.out.println("DEBUG: Searching by mobile number: " + allotmentCriteria.getMobileNumber());
			}
			return allotmentRepository.getAllotmentByIds(allotmentCriteria);
		}


	private void enrichUuidsForOwnerCreate(RequestInfo requestInfo, AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
		String allotmentId=UUID.randomUUID().toString();
		
//		if (!CollectionUtils.isEmpty(allotmentDetails.getDocuments())) {
		System.out.println(allotmentDetails.getDocuments().size()+"document----------------------------------------------------");
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		
		if(allotmentDetails.getDocuments()!=null&&allotmentDetails.getDocuments().size()>0) {
		List<Document> docList =	allotmentDetails.getDocuments().stream().map(doc -> {
			    Document document=doc;
			    document.setDocumentUid(allotmentId);
			    document.setId(UUID.randomUUID().toString());
			    document.setStatus(Status.ACTIVE);
			    document.setAuditDetails(auditDetails);
				return document;
			}).collect(Collectors.toList());
		allotmentDetails.setDocuments(docList);	
		}

		List<OwnerInfo> lst=allotmentDetails.getOwnerInfo().stream().map(m->{
			m.setOwnerId(UUID.randomUUID().toString());
			m.setAllotmentId(allotmentId);
			return m;
		}).collect(Collectors.toList());
		allotmentDetails.setOwnerInfo(lst);
		allotmentDetails.setId(allotmentId);
		List<AllotmentDetails> allotmentDetails2=new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
		
	}
	
	private void enrichUuidsForOwnerUpdate(RequestInfo requestInfo, AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
		String allotmentId=allotmentDetails.getId();
		
//		if (!CollectionUtils.isEmpty(allotmentDetails.getDocuments())) {
		System.out.println(allotmentDetails.getDocuments()+"document------"+allotmentDetails.getOwnerInfo());
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		
		if(allotmentDetails.getDocuments()!=null&&allotmentDetails.getDocuments().size()>0) {
		List<Document> docList =	allotmentDetails.getDocuments().stream().map(doc -> {
			    Document document=doc;
			    document.setDocumentUid(allotmentId);
			    document.setId(UUID.randomUUID().toString());
			    document.setStatus(Status.ACTIVE);
			    document.setAuditDetails(auditDetails);
				return document;
			}).collect(Collectors.toList());
		allotmentDetails.setDocuments(docList);	
		}

		List<OwnerInfo> lst=allotmentDetails.getOwnerInfo().stream().map(m->{
			m.setOwnerId(UUID.randomUUID().toString());
			m.setAllotmentId(allotmentId);
			return m;
		}).collect(Collectors.toList());
		allotmentDetails.setOwnerInfo(lst);
		allotmentDetails.setId(allotmentId);
		List<AllotmentDetails> allotmentDetails2=new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
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
		String applicationNumber = propertyutil.getIdList(requestInfo, tenantId, config.getAllotmentApplicationNummberGenName(), config.getAllotmentApplicationNummberGenNameFormat(), 1).get(0);
		allotmentDetails.setApplicationNumber(applicationNumber);
		List<AllotmentDetails> allotmentDetails2=new ArrayList();
		allotmentDetails2.add(allotmentDetails);
		allotmentRequest.setAllotment(allotmentDetails);
	}

//    /**
//     *  Enriches the locality object
//     * @param property The property object received for create or update
//     */
//    public void enrichBoundary(Property property, RequestInfo requestInfo){
//    	
//        boundaryService.getAreaType(property, requestInfo, PTConstants.BOUNDARY_HEIRARCHY_CODE);
//    }
    
//    /**
//     * 
//     * Enrichment method for mutation request
//     * 
//     * @param request
//     */
//	public void enrichMutationRequest(PropertyRequest request, Property propertyFromSearch) {
//
//		RequestInfo requestInfo = request.getRequestInfo();
//		Property property = request.getProperty();
//		Boolean isWfEnabled = config.getIsMutationWorkflowEnabled();
//		Boolean iswfStarting = propertyFromSearch.getStatus().equals(Status.ACTIVE);
//		AuditDetails auditDetailsForUpdate = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
//		propertyFromSearch.setAuditDetails(auditDetailsForUpdate);
//
//		if (!isWfEnabled) {
//
//			property.setStatus(Status.ACTIVE);
//
//		} else if (isWfEnabled && iswfStarting) {
//
//			enrichPropertyForNewWf(requestInfo, property, true);
//		}
//
//		property.getOwners().forEach(owner -> {
//
//			if (owner.getOwnerInfoUuid() == null) {
//				
//				owner.setOwnerInfoUuid(UUID.randomUUID().toString());
//				owner.setStatus(Status.ACTIVE);
//			}
//
//			if (!CollectionUtils.isEmpty(owner.getDocuments()))
//				owner.getDocuments().forEach(doc -> {
//					if (doc.getId() == null) {
//						doc.setId(UUID.randomUUID().toString());
//						doc.setStatus(Status.ACTIVE);
//					}
//				});
//		});
//		 AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
//		 property.setAuditDetails(auditDetails);
//	}

	/**
	 * enrich property as new entry for workflow validation
	 * 
	 * @param requestInfo
	 * @param property
	 */
//	private void enrichPropertyForNewWf(RequestInfo requestInfo, Property property, Boolean isMutation) {
//		
//		String ackNo;
//
//		if (isMutation) {
//			ackNo = propertyutil.getIdList(requestInfo, property.getTenantId(), config.getMutationIdGenName(), config.getMutationIdGenFormat(), 1).get(0);
//		} else
//			ackNo = propertyutil.getIdList(requestInfo, property.getTenantId(), config.getAckIdGenName(), config.getAckIdGenFormat(), 1).get(0);
//		property.setId(UUID.randomUUID().toString());
//		property.setAcknowldgementNumber(ackNo);
//		
////		enrichUuidsForNewUpdate(requestInfo, property);
//	}
	
//	private void enrichUuidsForNewUpdate(RequestInfo requestInfo, Property property) {
//		
//		AuditDetails propertyAuditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid(), true);
//		property.setId(UUID.randomUUID().toString());
//		if (!CollectionUtils.isEmpty(property.getDocuments()))
//			property.getDocuments().forEach(doc -> {
//				doc.setId(UUID.randomUUID().toString());
//				if (null == doc.getStatus())
//					doc.setStatus(Status.ACTIVE);
//			});
//		property.getAddress().setTenantId(property.getTenantId());
//		property.getAddress().setId(UUID.randomUUID().toString());
//
//		if (!ObjectUtils.isEmpty(property.getInstitution()))
//			property.getInstitution().setId(UUID.randomUUID().toString());
//
//		property.setAuditDetails(propertyAuditDetails);
//		
//		if (!CollectionUtils.isEmpty(property.getUnits()))
//			property.getUnits().forEach(unit -> {
//
//				unit.setId(UUID.randomUUID().toString());
//				if (unit.getActive() == null)
//				unit.setActive(true);
//			});
//		
//		property.getOwners().forEach(owner -> {
//			
//			owner.setOwnerInfoUuid(UUID.randomUUID().toString());
//			if (!CollectionUtils.isEmpty(owner.getDocuments()))
//				owner.getDocuments().forEach(doc -> {
//					doc.setId(UUID.randomUUID().toString());
//					if (null == doc.getStatus())
//						doc.setStatus(Status.ACTIVE);
//				});
//			if (null == owner.getStatus())
//				owner.setStatus(Status.ACTIVE);
//		});
//	}
	
    /**
     * In case of SENDBACKTOCITIZEN enrich the assignee with the owners and creator of property
     * @param property to be enriched
     */
//    public void enrichAssignes(Property property){
//
//            if(config.getIsWorkflowEnabled() && property.getWorkflow().getAction().equalsIgnoreCase(PTConstants.CITIZEN_SENDBACK_ACTION)){
//
//                    List<OwnerInfo> assignes = new LinkedList<>();
//
//                    // Adding owners to assignes list
//                    property.getOwners().forEach(ownerInfo -> {
//                       assignes.add(ownerInfo);
//                    });
//
//                    // Adding creator of application
//                    if(property.getAccountId()!=null)
//                        assignes.add(OwnerInfo.builder().uuid(property.getAccountId()).build());
//
//					Set<OwnerInfo> registeredUsers = userService.getUUidFromUserName(property);
//
//					if(!CollectionUtils.isEmpty(registeredUsers))
//						assignes.addAll(registeredUsers);
//
//                    property.getWorkflow().setAssignes(assignes);
//            }
//    }


}
