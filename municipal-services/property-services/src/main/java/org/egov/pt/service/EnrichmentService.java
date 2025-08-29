package org.egov.pt.service;

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
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.pt.config.PropertyConfiguration;
import org.egov.pt.models.AuditDetails;
import org.egov.pt.models.Institution;
import org.egov.pt.models.OwnerInfo;
import org.egov.pt.models.Property;
import org.egov.common.contract.request.Role;
import org.egov.pt.models.PropertyCriteria;
import org.egov.pt.models.enums.Channel;
import org.egov.pt.models.enums.Status;
import org.egov.pt.models.user.User;
import org.egov.pt.util.PTConstants;
import org.egov.pt.util.PropertyUtil;
import org.egov.pt.web.contracts.PropertyRequest;
import org.egov.pt.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

@Service
public class EnrichmentService {


    @Autowired
    private PropertyUtil propertyutil;

    @Autowired
    private BoundaryService boundaryService;

    @Autowired
    private PropertyConfiguration config;

	@Autowired
	private UserService userService;
	
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;


    /**
     * Assigns UUIDs to all id fields and also assigns acknowledgement-number and assessment-number generated from id-gen
     * @param request  PropertyRequest received for property creation
     */
	public void enrichCreateRequest(PropertyRequest request) {

		RequestInfo requestInfo = request.getRequestInfo();
		Property property = request.getProperty();
		String roleCodeName=null;

		String userType = requestInfo.getUserInfo().getType().toUpperCase();
		String filter = String.format("[?(@.category=='%s' && @.active==%b)]", userType, true);
		
		Object thirdPartyData = fetchDataFromMdms(requestInfo, config.getStateLevelTenantId(), PTConstants.MDMS_WC_ROLE_MODLENAME , PTConstants.MDMS_WC_ROLE_MASTERNAME, filter);

		 Map<String, String> roleMap = new HashMap<>();
		 
	        if (thirdPartyData instanceof Map) {
	            List<Map<String, Object>> thirdPartyList = (List<Map<String, Object>>) 
	                Optional.ofNullable((Map<String, Object>) thirdPartyData)
	                        .map(data -> (Map<String, Object>) data.get(PTConstants.MDMS_RESPONSE_KEY))
	                        .map(mdmsRes -> (Map<String, Object>) mdmsRes.get(PTConstants.MDMS_WC_ROLE_MODLENAME))
	                        .map(commonMasters -> (List<Map<String, Object>>) commonMasters.get(PTConstants.MDMS_WC_ROLE_MASTERNAME))
	                        .orElse(Collections.emptyList());

	            thirdPartyList.forEach(role -> {
	                String category = (String) role.get(PTConstants.CATEGORY_KEY);
	                String roleCode = (String) role.get(PTConstants.ROLE_CODE_KEY);
	                roleMap.put(category, roleCode);
	            });
	        }
	        
	        List<String> requestRoles =requestInfo
	                .getUserInfo()
	                .getRoles()
	                .stream()
	                .map(Role::getCode) 
	                .collect(Collectors.toList());

	        for (String roleCode : roleMap.values()) {
	            if (requestRoles.contains(roleCode)) {
	            	roleCodeName=roleCode;
	            	
	            }
	        }
	        if (roleCodeName != null) {
	        	Channel channel = Channel.valueOf(roleCodeName); // Example conversion
	        	property.setChannel(channel);
			}

		
		
		property.setAccountId(requestInfo.getUserInfo().getUuid());
		enrichUuidsForPropertyCreate(requestInfo, property);
		setIdgenIds(request);
		enrichBoundary(property, requestInfo);
	}

	
public Object fetchDataFromMdms(RequestInfo requestInfo, String tenantId, String moduleName, String masterName, String filter) {
	    
		
		List<MasterDetail> masterDetails = new ArrayList<>();
		
	    
	    // Add master detail with the dynamic filter
		if(filter!= null) {
			 masterDetails.add(MasterDetail.builder()
			            .name(masterName)
			            .filter(filter)
			            .build());

		}else {
			 masterDetails.add(MasterDetail.builder()
			            .name(masterName)
			            .build());
		}
     
        List<ModuleDetail> wfModuleDtls = Collections.singletonList(ModuleDetail.builder().masterDetails(masterDetails)
                .moduleName(moduleName).build());

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(wfModuleDtls)
                .tenantId(config.getStateLevelTenantId())    
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
                .requestInfo(requestInfo).build();
        String uRi=config.getMdmsHost()+config.getMdmsEndpoint();
        Object result = serviceRequestRepository.fetchmdmsResult(uRi, mdmsCriteriaReq);


	    return result;
	}
	private void enrichUuidsForPropertyCreate(RequestInfo requestInfo, Property property) {
		
		AuditDetails propertyAuditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid(), true);
		
		property.setId(UUID.randomUUID().toString());
		
		if (!CollectionUtils.isEmpty(property.getDocuments()))
			property.getDocuments().forEach(doc -> {
				doc.setId(UUID.randomUUID().toString());
				doc.setStatus(Status.ACTIVE);
			});

		property.getAddress().setTenantId(property.getTenantId());
		property.getAddress().setId(UUID.randomUUID().toString());

		if (!ObjectUtils.isEmpty(property.getInstitution()))
			property.getInstitution().setId(UUID.randomUUID().toString());

		property.setAuditDetails(propertyAuditDetails);
		
		if (!CollectionUtils.isEmpty(property.getUnits()))
			property.getUnits().forEach(unit -> {

				unit.setId(UUID.randomUUID().toString());
			
				if (unit.getActive() == null)
				unit.setActive(true);
			});
		
		property.getOwners().forEach(owner -> {
			
			owner.setOwnerInfoUuid(UUID.randomUUID().toString());
			if (!CollectionUtils.isEmpty(owner.getDocuments()))
				owner.getDocuments().forEach(doc -> {
					doc.setId(UUID.randomUUID().toString());
					doc.setStatus(Status.ACTIVE);
				});
			
			owner.setStatus(Status.ACTIVE);
		});
	}

    /**
     * Assigns UUID for new fields that are added and sets propertyDetail and address id from propertyId
     * 
     * @param request  PropertyRequest received for property update
     * @param propertyFromDb Properties returned from DB
     */
    public void enrichUpdateRequest(PropertyRequest request,Property propertyFromDb, Boolean isnumberchange) {
    	
    	Property property = request.getProperty();
        RequestInfo requestInfo = request.getRequestInfo();
        AuditDetails auditDetailsForUpdate = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
        propertyFromDb.setAuditDetails(auditDetailsForUpdate);
        
        
		Boolean isWfEnabled = config.getIsWorkflowEnabled();
		/**
		 *  commenting given boolean value AS added in else if
		 */
	//	Boolean iswfStarting = propertyFromDb.getStatus().equals(Status.ACTIVE);
	//	Boolean isactiveexist = propertyFromDb.getStatus().equals(Status.INACTIVE);

		if (!isWfEnabled)
		{

			property.setStatus(Status.ACTIVE);
			property.getAddress().setId(propertyFromDb.getAddress().getId());

		} 
		
		else if ((propertyFromDb.getStatus().equals(Status.ACTIVE)|| propertyFromDb.getStatus().equals(Status.INACTIVE)) && isWfEnabled && !isnumberchange)
		{
				enrichPropertyForNewWf(requestInfo, property, false);	
		}
		
		
		if (!CollectionUtils.isEmpty(property.getDocuments()))
			property.getDocuments().forEach(doc -> {

				if (doc.getId() == null) {
					doc.setId(UUID.randomUUID().toString());
					doc.setStatus(Status.ACTIVE);
				}
			});
				
	    	if (!CollectionUtils.isEmpty(property.getUnits()))
			property.getUnits().forEach(unit -> {

				if (unit.getId() == null) {
					unit.setId(UUID.randomUUID().toString());
					unit.setActive(true);
				}
			});
				
		Institution institute = property.getInstitution();
		if (!ObjectUtils.isEmpty(institute) && null == institute.getId())
			property.getInstitution().setId(UUID.randomUUID().toString());

		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		property.setAuditDetails(auditDetails);
		property.setAccountId(propertyFromDb.getAccountId());
       
		property.setAdditionalDetails(
				propertyutil.jsonMerge(propertyFromDb.getAdditionalDetails(), property.getAdditionalDetails()));
    }
    
    
    
    
    /* This change for surveyId edit PI-PI-18601 */
    
 public void enrichUpdateRequests(PropertyRequest request,Property propertyFromDb, Boolean issurveyChange) {
    	
    	Property property = request.getProperty();
        RequestInfo requestInfo = request.getRequestInfo();
        AuditDetails auditDetailsForUpdate = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
        propertyFromDb.setAuditDetails(auditDetailsForUpdate);
        
        
		Boolean isWfEnabled = config.getIsWorkflowEnabled();
		/**
		 *  commenting given boolean value AS added in else if
		 */
	//	Boolean iswfStarting = propertyFromDb.getStatus().equals(Status.ACTIVE);
	//	Boolean isactiveexist = propertyFromDb.getStatus().equals(Status.INACTIVE);

		if (!isWfEnabled)
		{

			property.setStatus(Status.ACTIVE);
			property.getAddress().setId(propertyFromDb.getAddress().getId());

		} 
		
		else if ((propertyFromDb.getStatus().equals(Status.ACTIVE)|| propertyFromDb.getStatus().equals(Status.INACTIVE)) && isWfEnabled && !issurveyChange)
		{
				enrichPropertyForNewWf(requestInfo, property, false);	
		}
		
		
		if (!CollectionUtils.isEmpty(property.getDocuments()))
			property.getDocuments().forEach(doc -> {

				if (doc.getId() == null) {
					doc.setId(UUID.randomUUID().toString());
					doc.setStatus(Status.ACTIVE);
				}
			});
				
	    	if (!CollectionUtils.isEmpty(property.getUnits()))
			property.getUnits().forEach(unit -> {

				if (unit.getId() == null) {
					unit.setId(UUID.randomUUID().toString());
					unit.setActive(true);
				}
			});
				
		Institution institute = property.getInstitution();
		if (!ObjectUtils.isEmpty(institute) && null == institute.getId())
			property.getInstitution().setId(UUID.randomUUID().toString());

		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		property.setAuditDetails(auditDetails);
		property.setAccountId(propertyFromDb.getAccountId());
       
		property.setAdditionalDetails(
				propertyutil.jsonMerge(propertyFromDb.getAdditionalDetails(), property.getAdditionalDetails()));
    }



    /**
	 * Sets the acknowledgement and assessment Numbers for given PropertyRequest
	 * 
	 * @param request PropertyRequest which is to be created
	 */
	private void setIdgenIds(PropertyRequest request) {

		Property property = request.getProperty();
		String tenantId = property.getTenantId();
		RequestInfo requestInfo = request.getRequestInfo();

		if (!config.getIsWorkflowEnabled()) {

			property.setStatus(Status.ACTIVE);
		}
		
		String pId = propertyutil.getIdList(requestInfo, tenantId, config.getPropertyIdGenName(), config.getPropertyIdGenFormat(), 1).get(0);
		String ackNo = propertyutil.getIdList(requestInfo, tenantId, config.getAckIdGenName(), config.getAckIdGenFormat(), 1).get(0);
		property.setPropertyId(pId);
		property.setAcknowldgementNumber(ackNo);
	}


    /**
     * Returns PropertyCriteria with ids populated using propertyids from properties
     * @param properties properties whose propertyids are to added to propertyCriteria for search
     * @return propertyCriteria to search on basis of propertyids
     */
	public PropertyCriteria getPropertyCriteriaFromPropertyIds(List<Property> properties) {

		PropertyCriteria criteria = new PropertyCriteria();
		Set<String> propertyids = new HashSet<>();
		properties.forEach(property -> propertyids.add(property.getPropertyId()));
		criteria.setPropertyIds(propertyids);
		criteria.setTenantId(properties.get(0).getTenantId());
		return criteria;
	}

    /**
     *  Enriches the locality object
     * @param property The property object received for create or update
     */
    public void enrichBoundary(Property property, RequestInfo requestInfo){
    	
        boundaryService.getAreaType(property, requestInfo, PTConstants.BOUNDARY_HEIRARCHY_CODE);
    }
    
    /**
     * 
     * Enrichment method for mutation request
     * 
     * @param request
     */
	public void enrichMutationRequest(PropertyRequest request, Property propertyFromSearch) {

		RequestInfo requestInfo = request.getRequestInfo();
		Property property = request.getProperty();
		Boolean isWfEnabled = config.getIsMutationWorkflowEnabled();
		Boolean iswfStarting = propertyFromSearch.getStatus().equals(Status.ACTIVE);
		AuditDetails auditDetailsForUpdate = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		propertyFromSearch.setAuditDetails(auditDetailsForUpdate);

		if (!isWfEnabled) {

			property.setStatus(Status.ACTIVE);

		} else if (isWfEnabled && iswfStarting) {

			enrichPropertyForNewWf(requestInfo, property, true);
		}

		property.getOwners().forEach(owner -> {

			if (owner.getOwnerInfoUuid() == null) {
				
				owner.setOwnerInfoUuid(UUID.randomUUID().toString());
				owner.setStatus(Status.ACTIVE);
			}

			if (!CollectionUtils.isEmpty(owner.getDocuments()))
				owner.getDocuments().forEach(doc -> {
					if (doc.getId() == null) {
						doc.setId(UUID.randomUUID().toString());
						doc.setStatus(Status.ACTIVE);
					}
				});
		});
		 AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		 property.setAuditDetails(auditDetails);
	}

	/**
	 * enrich property as new entry for workflow validation
	 * 
	 * @param requestInfo
	 * @param property
	 */
	private void enrichPropertyForNewWf(RequestInfo requestInfo, Property property, Boolean isMutation) {
		
		String ackNo;

		if (isMutation) {
			ackNo = propertyutil.getIdList(requestInfo, property.getTenantId(), config.getMutationIdGenName(), config.getMutationIdGenFormat(), 1).get(0);
		} else
			ackNo = propertyutil.getIdList(requestInfo, property.getTenantId(), config.getAckIdGenName(), config.getAckIdGenFormat(), 1).get(0);
		property.setId(UUID.randomUUID().toString());
		property.setAcknowldgementNumber(ackNo);
		
		enrichUuidsForNewUpdate(requestInfo, property);
	}
	
	private void enrichUuidsForNewUpdate(RequestInfo requestInfo, Property property) {
		
		AuditDetails propertyAuditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid(), true);
		
		property.setId(UUID.randomUUID().toString());
		
		if (!CollectionUtils.isEmpty(property.getDocuments()))
			property.getDocuments().forEach(doc -> {
				doc.setId(UUID.randomUUID().toString());
				if (null == doc.getStatus())
					doc.setStatus(Status.ACTIVE);
			});

		property.getAddress().setTenantId(property.getTenantId());
		property.getAddress().setId(UUID.randomUUID().toString());

		if (!ObjectUtils.isEmpty(property.getInstitution()))
			property.getInstitution().setId(UUID.randomUUID().toString());

		property.setAuditDetails(propertyAuditDetails);
		
		if (!CollectionUtils.isEmpty(property.getUnits()))
			property.getUnits().forEach(unit -> {

				unit.setId(UUID.randomUUID().toString());
				if (unit.getActive() == null)
				unit.setActive(true);
			});
		
		property.getOwners().forEach(owner -> {
			
			owner.setOwnerInfoUuid(UUID.randomUUID().toString());
			if (!CollectionUtils.isEmpty(owner.getDocuments()))
				owner.getDocuments().forEach(doc -> {
					doc.setId(UUID.randomUUID().toString());
					if (null == doc.getStatus())
						doc.setStatus(Status.ACTIVE);
				});
			if (null == owner.getStatus())
				owner.setStatus(Status.ACTIVE);
		});
	}
	
    /**
     * In case of SENDBACKTOCITIZEN enrich the assignee with the owners and creator of property
     * @param property to be enriched
     */
    public void enrichAssignes(Property property){

            if(config.getIsWorkflowEnabled() && property.getWorkflow().getAction().equalsIgnoreCase(PTConstants.CITIZEN_SENDBACK_ACTION)){

                    List<OwnerInfo> assignes = new LinkedList<>();

                    // Adding owners to assignes list
                    property.getOwners().forEach(ownerInfo -> {
                       assignes.add(ownerInfo);
                    });

                    // Adding creator of application
                    if(property.getAccountId()!=null)
                        assignes.add(OwnerInfo.builder().uuid(property.getAccountId()).build());

					Set<OwnerInfo> registeredUsers = userService.getUUidFromUserName(property);

					if(!CollectionUtils.isEmpty(registeredUsers))
						assignes.addAll(registeredUsers);

                    property.getWorkflow().setAssignes(assignes);
            }
    }


}
