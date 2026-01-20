package org.egov.tl.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.tl.config.TLConfiguration;
import org.egov.tl.repository.IdGenRepository;
import org.egov.tl.util.TLConstants;
import org.egov.tl.util.TradeUtil;
import org.egov.tl.web.models.*;
import org.egov.tl.web.models.TradeLicenseDetail.ChannelEnum;
import org.egov.tl.web.models.Idgen.IdResponse;
import org.egov.tl.web.models.user.UserDetailResponse;
import org.egov.tl.web.models.workflow.BusinessService;
import org.egov.tl.workflow.WorkflowService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
//import org.springframework.util.StringUtils;
import org.egov.tl.repository.ServiceRequestRepository;

import com.jayway.jsonpath.JsonPath;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.egov.tl.util.TLConstants.*;



@Service
@Slf4j
public class EnrichmentService {

    private IdGenRepository idGenRepository;
    private TLConfiguration config;
    private TradeUtil tradeUtil;
    private BoundaryService boundaryService;
    private UserService userService;
    private WorkflowService workflowService;
    
    @Autowired
    @Lazy
    private TradeLicenseService licenseService;

    @Autowired
    public EnrichmentService(IdGenRepository idGenRepository, TLConfiguration config, TradeUtil tradeUtil,
                             BoundaryService boundaryService,UserService userService,WorkflowService workflowService) {
        this.idGenRepository = idGenRepository;
        this.config = config;
        this.tradeUtil = tradeUtil;
        this.boundaryService = boundaryService;
        this.userService = userService;
        this.workflowService = workflowService;
    }

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
    /**
     * Enriches the incoming createRequest
     * @param tradeLicenseRequest The create request for the tradeLicense
     */
    public void enrichTLCreateRequest(TradeLicenseRequest tradeLicenseRequest,Map<String, Object> mdmsDataMap) {
    	
    	RequestInfo requestInfo = tradeLicenseRequest.getRequestInfo();
        String uuid = requestInfo.getUserInfo().getUuid();
        AuditDetails auditDetails = tradeUtil.getAuditDetails(uuid, true);
        tradeLicenseRequest.getLicenses().forEach(tradeLicense -> {
            tradeLicense.setAuditDetails(auditDetails);
            tradeLicense.setId(UUID.randomUUID().toString());
            tradeLicense.setApplicationDate(auditDetails.getCreatedTime());
            tradeLicense.getTradeLicenseDetail().setId(UUID.randomUUID().toString());
            tradeLicense.getTradeLicenseDetail().setAuditDetails(auditDetails);
            String businessService = tradeLicense.getBusinessService();
            if (businessService == null)
            {
                businessService = businessService_TL;
                tradeLicense.setBusinessService(businessService);
            }
            switch (businessService) {
                case businessService_TL:
                    //TLR Changes
                    if(tradeLicense.getApplicationType() != null && tradeLicense.getApplicationType().toString().equals(TLConstants.APPLICATION_TYPE_RENEWAL)){
                        tradeLicense.setLicenseNumber(tradeLicense.getLicenseNumber());
                        Map<String, Long> taxPeriods = tradeUtil.getTaxPeriods(tradeLicense, mdmsDataMap.get(tradeLicense.getTenantId()));
                        tradeLicense.setValidTo(taxPeriods.get(TLConstants.MDMS_ENDDATE));
                        tradeLicense.setValidFrom(taxPeriods.get(TLConstants.MDMS_STARTDATE));
                    }else{
                        Map<String, Long> taxPeriods = tradeUtil.getTaxPeriods(tradeLicense, mdmsDataMap.get(tradeLicense.getTenantId()));
                        if (tradeLicense.getLicenseType().equals(TradeLicense.LicenseTypeEnum.PERMANENT) || tradeLicense.getValidTo() == null)
                            tradeLicense.setValidTo(taxPeriods.get(TLConstants.MDMS_ENDDATE));
                            tradeLicense.setValidFrom(taxPeriods.get(TLConstants.MDMS_STARTDATE));
                    }
                    if (!CollectionUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getAccessories()))
                        tradeLicense.getTradeLicenseDetail().getAccessories().forEach(accessory -> {
                            accessory.setTenantId(tradeLicense.getTenantId());
                            accessory.setId(UUID.randomUUID().toString());
                            accessory.setActive(true);
                        });
                    break;
            }
            
            
            
            
            
            String roleCodeName=null;

    		String userType = requestInfo.getUserInfo().getType().toUpperCase();

    		
    		Object thirdPartyData = fetchThirdPartyIntegration(requestInfo, config.getStateLevelTenantId(), TLConstants.MDMS_WC_ROLE_MODLENAME , TLConstants.MDMS_WC_ROLE_MASTERNAME, userType,true);

    		 Map<String, String> roleMap = new HashMap<>();
    		 
    	        if (thirdPartyData instanceof Map) {
    	            List<Map<String, Object>> thirdPartyList = (List<Map<String, Object>>) 
    	                Optional.ofNullable((Map<String, Object>) thirdPartyData)
    	                        .map(data -> (Map<String, Object>) data.get(TLConstants.MDMS_RESPONSE_KEY))
    	                        .map(mdmsRes -> (Map<String, Object>) mdmsRes.get(TLConstants.MDMS_WC_ROLE_MODLENAME))
    	                        .map(commonMasters -> (List<Map<String, Object>>) commonMasters.get(TLConstants.MDMS_WC_ROLE_MASTERNAME))
    	                        .orElse(Collections.emptyList());

    	            thirdPartyList.forEach(role -> {
    	                String category = (String) role.get(TLConstants.CATEGORY_KEY);
    	                String roleCode = (String) role.get(TLConstants.ROLE_CODE_KEY);
    	                roleMap.put(category, roleCode);
    	            });
    	        }
    	        
    	        List<String> requestRoles = requestInfo
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
    			ChannelEnum channel = ChannelEnum.valueOf(roleCodeName);
    	        tradeLicense.getTradeLicenseDetail().setChannel(channel);
    		} else {
    		    if (TLConstants.USER_TYPE_TO_CHANNEL.containsKey(userType)) {
    		    	String channelName = TLConstants.USER_TYPE_TO_CHANNEL.get(userType);
    		        ChannelEnum channel = ChannelEnum.valueOf(channelName);
    		        tradeLicense.getTradeLicenseDetail().setChannel(channel);
        	        } else {
    		        throw new IllegalStateException(
    		            String.format("Unable to determine channel for userType: %s and roles: %s", 
    		                          userType, 
    		                          requestInfo
    		                              .getUserInfo()
    		                              .getRoles()
    		                              .stream()
    		                              .map(role -> role != null ? role.getCode() : "null")
    		                              .collect(Collectors.toList()))); 
    		    }
    		}
            tradeLicense.getTradeLicenseDetail().getAddress().setTenantId(tradeLicense.getTenantId());
            tradeLicense.getTradeLicenseDetail().getAddress().setId(UUID.randomUUID().toString());
            tradeLicense.getTradeLicenseDetail().getTradeUnits().forEach(tradeUnit -> {
                tradeUnit.setTenantId(tradeLicense.getTenantId());
                tradeUnit.setId(UUID.randomUUID().toString());
                tradeUnit.setActive(true);
            });

            if (tradeLicense.getAction().equalsIgnoreCase(ACTION_APPLY) && !CollectionUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getApplicationDocuments())) {
                tradeLicense.getTradeLicenseDetail().getApplicationDocuments().forEach(document -> {
                    document.setId(UUID.randomUUID().toString());
                    document.setActive(true);
                });
            }
            
            if(tradeLicense.getApplicationType() !=null && tradeLicense.getApplicationType().toString().equals(TLConstants.APPLICATION_TYPE_RENEWAL)){
                if(tradeLicense.getAction().equalsIgnoreCase(ACTION_APPLY) || tradeLicense.getAction().equalsIgnoreCase(TLConstants.TL_ACTION_INITIATE)){
                //	if(tradeLicense.getTradeLicenseDetail().getApplicationDocuments()!=null){
                    tradeLicense.getTradeLicenseDetail().getApplicationDocuments().forEach(document -> {
                        document.setId(UUID.randomUUID().toString());
                        document.setActive(true);
                    });
              //  	}
                }
                               
            }

      //     if(tradeLicense.getApplicationType().toString().equalsIgnoreCase("RENEWAL") && tradeLicense.getWorkflowCode().toString().equalsIgnoreCase("EDITRENEWAL")) {
            tradeLicense.getTradeLicenseDetail().getOwners().forEach(owner -> {
                //owner.setUserActive(true);
      //          if (!CollectionUtils.isEmpty(owner.getDocuments()))
      //              owner.getDocuments().forEach(document -> {
     //                   document.setId(UUID.randomUUID().toString());
     //                   document.setActive(true);
     //               });
     //       });}

     //       else 
    //        { 
   //             tradeLicense.getTradeLicenseDetail().getOwners().forEach(owner -> {
                owner.setUserActive(true);
                if (!CollectionUtils.isEmpty(owner.getDocuments()))
                    owner.getDocuments().forEach(document -> {
                        document.setId(UUID.randomUUID().toString());
                        document.setActive(true);
                    });
            });
		

            if (tradeLicense.getTradeLicenseDetail().getSubOwnerShipCategory().contains(config.getInstitutional())) {
                tradeLicense.getTradeLicenseDetail().getInstitution().setId(UUID.randomUUID().toString());
                tradeLicense.getTradeLicenseDetail().getInstitution().setActive(true);
                tradeLicense.getTradeLicenseDetail().getInstitution().setTenantId(tradeLicense.getTenantId());
                tradeLicense.getTradeLicenseDetail().getOwners().forEach(owner -> {
                    owner.setInstitutionId(tradeLicense.getTradeLicenseDetail().getInstitution().getId());
                });
            }

            if (requestInfo.getUserInfo().getType().equalsIgnoreCase("CITIZEN"))
                tradeLicense.setAccountId(requestInfo.getUserInfo().getUuid());

        });
        setIdgenIds(tradeLicenseRequest);
        setStatusForCreate(tradeLicenseRequest);
        String businessService = tradeLicenseRequest.getLicenses().isEmpty()?null:tradeLicenseRequest.getLicenses().get(0).getBusinessService();
        if (businessService == null)
            businessService = businessService_TL;
        switch (businessService) {
            case businessService_TL:
                boundaryService.getAreaType(tradeLicenseRequest, config.getHierarchyTypeCode());
                break;
        }
    }


    /**
     * Returns a list of numbers generated from idgen
     *
     * @param requestInfo RequestInfo from the request
     * @param tenantId    tenantId of the city
     * @param idKey       code of the field defined in application properties for which ids are generated for
     * @param idformat    format in which ids are to be generated
     * @param count       Number of ids to be generated
     * @return List of ids generated using idGen service
     */
    private List<String> getIdList(RequestInfo requestInfo, String tenantId, String idKey,
                                   String idformat, int count) {
        List<IdResponse> idResponses = idGenRepository.getId(requestInfo, tenantId, idKey, idformat, count).getIdResponses();

        if (CollectionUtils.isEmpty(idResponses))
            throw new CustomException("IDGEN ERROR", "No ids returned from idgen Service");

        return idResponses.stream()
                .map(IdResponse::getId).collect(Collectors.toList());
    }

    
    
public Object fetchThirdPartyIntegration(RequestInfo requestInfo, String tenantId, String moduleName, String masterName, String userType, Boolean active) {
	    
		
		List<MasterDetail> masterDetails = new ArrayList<>();
		String filter = String.format("[?(@.category=='%s' && @.active==%b)]", userType, active);
	    
	    // Add master detail with the dynamic filter
	    masterDetails.add(MasterDetail.builder()
	            .name(TLConstants.MDMS_WC_ROLE_MASTERNAME)
	            .filter(filter)
	            .build());

     
        List<ModuleDetail> wfModuleDtls = Collections.singletonList(ModuleDetail.builder().masterDetails(masterDetails)
                .moduleName(TLConstants.MDMS_WC_ROLE_MODLENAME).build());

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(wfModuleDtls)
                .tenantId(config.getStateLevelTenantId())
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
                .requestInfo(requestInfo).build();
        String uRi=config.getMdmsHost()+config.getMdmsEndPoint();
        Object result = serviceRequestRepository.fetchmdmsResult(uRi, mdmsCriteriaReq);


	    return result;
	}

    /**
     * Sets the ApplicationNumber for given TradeLicenseRequest
     *
     * @param request TradeLicenseRequest which is to be created
     */
    private void setIdgenIds(TradeLicenseRequest request) {
        RequestInfo requestInfo = request.getRequestInfo();
        String tenantId = request.getLicenses().get(0).getTenantId();
        List<TradeLicense> licenses = request.getLicenses();
        String businessService = licenses.isEmpty() ? null : licenses.get(0).getBusinessService();
        if (businessService == null)
            businessService = businessService_TL;
        List<String> applicationNumbers = null;
        switch (businessService) {
            case businessService_TL:
                applicationNumbers = getIdList(requestInfo, tenantId, config.getApplicationNumberIdgenNameTL(), config.getApplicationNumberIdgenFormatTL(), request.getLicenses().size());
                break;

            case businessService_BPA:
            	String idFormateBPAREG = config.getApplicationNumberIdgenFormatBPA();
            	String tradeType = request.getLicenses().get(0).getTradeLicenseDetail().getTradeUnits().get(0).getTradeType().split("\\.")[0];
            	idFormateBPAREG = idFormateBPAREG.replace("SK", TRADETYPE_TO_IDGEN_SHORTNAME.get(tradeType));
                applicationNumbers = getIdList(requestInfo, tenantId, config.getApplicationNumberIdgenNameBPA(), idFormateBPAREG, request.getLicenses().size());
                break;
        }
        ListIterator<String> itr = applicationNumbers.listIterator();

        Map<String, String> errorMap = new HashMap<>();
        if (applicationNumbers.size() != request.getLicenses().size()) {
            errorMap.put("IDGEN ERROR ", "The number of LicenseNumber returned by idgen is not equal to number of TradeLicenses");
        }

        if (!errorMap.isEmpty())
            throw new CustomException(errorMap);

        licenses.forEach(tradeLicense -> {
            tradeLicense.setApplicationNumber(itr.next());
        });
    }


    /**
     * Adds the ownerIds from userSearchReponse to search criteria
     * @param criteria The TradeLicense search Criteria
     * @param userDetailResponse The response of user search
     */
    public void enrichTLCriteriaWithOwnerids(TradeLicenseSearchCriteria criteria, UserDetailResponse userDetailResponse){
        if(CollectionUtils.isEmpty(criteria.getOwnerIds())){
            Set<String> ownerids = new HashSet<>();
            userDetailResponse.getUser().forEach(owner -> ownerids.add(owner.getUuid()));
            criteria.setOwnerIds(new ArrayList<>(ownerids));
        }
    }


    /**
     * Creates search criteria of only the tradeLicense ids
     * @param licenses The licenses whose ids are to extracted
     * @return The search criteria
     */
    public TradeLicenseSearchCriteria getTLSearchCriteriaFromTLIds(List<TradeLicense> licenses){
        TradeLicenseSearchCriteria criteria = new TradeLicenseSearchCriteria();
        List<String> ids = new ArrayList<>();
        licenses.forEach(license -> ids.add(license.getId()));
        criteria.setIds(ids);
        criteria.setTenantId(licenses.get(0).getTenantId());
        criteria.setBusinessService(licenses.get(0).getBusinessService());
        return criteria;
    }


    /**
     * Enriches search criteria with ownerIds from license
     * @param criteria TradeLicense search criteria
     * @param licenses The tradeLicense whose owners are to be enriched
     */
    public TradeLicenseSearchCriteria enrichTLSearchCriteriaWithOwnerids(TradeLicenseSearchCriteria criteria, List<TradeLicense> licenses) {
        TradeLicenseSearchCriteria searchCriteria = new TradeLicenseSearchCriteria();
        searchCriteria.setTenantId(criteria.getTenantId());
        Set<String> ownerids = new HashSet<>();
        licenses.forEach(license -> {
        	if(!CollectionUtils.isEmpty(license.getTradeLicenseDetail().getOwners()))
        		license.getTradeLicenseDetail().getOwners().forEach(owner -> ownerids.add(owner.getUuid()));
        });

      /*  licenses.forEach(tradeLicense -> {
            ownerids.add(tradeLicense.getCitizenInfo().getUuid());
            });*/
        searchCriteria.setBusinessService(licenses.get(0).getBusinessService());
        searchCriteria.setOwnerIds(new ArrayList<>(ownerids));
        return searchCriteria;
    }



    /**
     * Enriches the boundary object in address
     * @param tradeLicenseRequest The create request
     */
    public void enrichBoundary(TradeLicenseRequest tradeLicenseRequest){
        List<TradeLicenseRequest> requests = getRequestByTenantId(tradeLicenseRequest);
        requests.forEach(tenantWiseRequest -> {
           boundaryService.getAreaType(tenantWiseRequest,config.getHierarchyTypeCode());
        });
    }


    /**
     *
     * @param request
     * @return
     */
    private List<TradeLicenseRequest> getRequestByTenantId(TradeLicenseRequest request){
        List<TradeLicense> licenses = request.getLicenses();
        RequestInfo requestInfo = request.getRequestInfo();

        Map<String,List<TradeLicense>> tenantIdToProperties = new HashMap<>();
        if(!CollectionUtils.isEmpty(licenses)){
            licenses.forEach(license -> {
                if(tenantIdToProperties.containsKey(license.getTenantId()))
                    tenantIdToProperties.get(license.getTenantId()).add(license);
                else{
                    List<TradeLicense> list = new ArrayList<>();
                    list.add(license);
                    tenantIdToProperties.put(license.getTenantId(),list);
                }
            });
        }
        List<TradeLicenseRequest> requests = new LinkedList<>();

        tenantIdToProperties.forEach((key,value)-> {
            requests.add(new TradeLicenseRequest(requestInfo,value));
        });
        return requests;
    }



    /**
     * Enriches the owner fields from user search response
     * @param userDetailResponse user search response
     * @param licenses licenses whose owners are to be enriches
     */
    public void enrichOwner(UserDetailResponse userDetailResponse, List<TradeLicense> licenses){
        List<OwnerInfo> users = userDetailResponse.getUser();
        Map<String,OwnerInfo> userIdToOwnerMap = new HashMap<>();
        users.forEach(user -> userIdToOwnerMap.put(user.getUuid(),user));
        licenses.forEach(license -> {
        	if(!CollectionUtils.isEmpty(license.getTradeLicenseDetail().getOwners()))
	            license.getTradeLicenseDetail().getOwners().forEach(owner -> {
	                    if(userIdToOwnerMap.get(owner.getUuid())==null) {
	                        // Log warning but don't fail the entire request for missing user data
	                        log.warn("Owner with UUID {} for tradeLicenseDetail {} not found in user search",
	                                owner.getUuid(), license.getTradeLicenseDetail().getId());
	                    }
	                    else {
	                        owner.addUserDetail(userIdToOwnerMap.get(owner.getUuid()));
	                    }
	                 });

           /* if(userIdToOwnerMap.get(license.getCitizenInfo().getUuid())!=null)
                license.getCitizenInfo().addCitizenDetail(userIdToOwnerMap.get(license.getCitizenInfo().getUuid()));
            else
                throw new CustomException("CITIZENINFO ERROR","The citizenInfo of trade License with ApplicationNumber: "+license.getApplicationNumber()+" cannot be found");
*/
        });
    }


    /**
     * Sets status for create request
     * @param tradeLicenseRequest The create request
     */
    private void setStatusForCreate(TradeLicenseRequest tradeLicenseRequest) {
        tradeLicenseRequest.getLicenses().forEach(license -> {
            String businessService = tradeLicenseRequest.getLicenses().isEmpty()?null:license.getBusinessService();
            if (businessService == null)
                businessService = businessService_TL;
            switch (businessService) {
                case businessService_TL:
                    if (license.getAction().equalsIgnoreCase(ACTION_INITIATE))
                        license.setStatus(STATUS_INITIATED);
                    if (license.getAction().equalsIgnoreCase(ACTION_APPLY))
                        license.setStatus(STATUS_APPLIED);
                    break;

                case businessService_BPA:
                    license.setStatus(STATUS_INITIATED);
                    break;
            }
        });
    }


    /**
     * Enriches the update request
     * @param tradeLicenseRequest The input update request
     */
    public void enrichTLUpdateRequest(TradeLicenseRequest tradeLicenseRequest, Map<String, BusinessService> businessServiceMap){
        RequestInfo requestInfo = tradeLicenseRequest.getRequestInfo();
        AuditDetails auditDetails = tradeUtil.getAuditDetails(requestInfo.getUserInfo().getUuid(), false);
        tradeLicenseRequest.getLicenses().forEach(tradeLicense -> {
            tradeLicense.setAuditDetails(auditDetails);
            enrichAssignes(tradeLicense);
            String nameOfBusinessService = tradeLicense.getBusinessService();
            if(nameOfBusinessService==null)
            {
                nameOfBusinessService=businessService_TL;
                tradeLicense.setBusinessService(nameOfBusinessService);
            }
            if ((nameOfBusinessService.equals(businessService_BPA) && (tradeLicense.getStatus().equalsIgnoreCase(STATUS_INITIATED))) || workflowService.isStateUpdatable(tradeLicense.getStatus(), businessServiceMap.get(tradeLicense.getTenantId()))) {
                tradeLicense.getTradeLicenseDetail().setAuditDetails(auditDetails);
                if (!CollectionUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getAccessories())) {
                    tradeLicense.getTradeLicenseDetail().getAccessories().forEach(accessory -> {
                        if (accessory.getId() == null) {
                            accessory.setTenantId(tradeLicense.getTenantId());
                            accessory.setId(UUID.randomUUID().toString());
                            accessory.setActive(true);
                        }
                    });
                }

                tradeLicense.getTradeLicenseDetail().getTradeUnits().forEach(tradeUnit -> {
                    if (tradeUnit.getId() == null) {
                        tradeUnit.setTenantId(tradeLicense.getTenantId());
                        tradeUnit.setId(UUID.randomUUID().toString());
                        tradeUnit.setActive(true);
                    }
                });

                tradeLicense.getTradeLicenseDetail().getOwners().forEach(owner -> {
                    if(owner.getUuid()==null || owner.getUserActive()==null)
                        owner.setUserActive(true);
                    if (!CollectionUtils.isEmpty(owner.getDocuments()))
                        owner.getDocuments().forEach(document -> {
                            if (document.getId() == null) {
                                document.setId(UUID.randomUUID().toString());
                                document.setActive(true);
                            }
                        });
                });

                if(tradeLicense.getTradeLicenseDetail().getSubOwnerShipCategory().contains(config.getInstitutional())
                        && tradeLicense.getTradeLicenseDetail().getInstitution().getId()==null){
                    tradeLicense.getTradeLicenseDetail().getInstitution().setId(UUID.randomUUID().toString());
                    tradeLicense.getTradeLicenseDetail().getInstitution().setActive(true);
                    tradeLicense.getTradeLicenseDetail().getInstitution().setTenantId(tradeLicense.getTenantId());
                    tradeLicense.getTradeLicenseDetail().getOwners().forEach(owner -> {
                        owner.setInstitutionId(tradeLicense.getTradeLicenseDetail().getInstitution().getId());
                    });
                }

                if(!CollectionUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getApplicationDocuments())){
                    tradeLicense.getTradeLicenseDetail().getApplicationDocuments().forEach(document -> {
                        if(document.getId()==null){
                            document.setId(UUID.randomUUID().toString());
                            document.setActive(true);
                        }
                    });
                }
            }
            else {
                if(!CollectionUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getVerificationDocuments())){
                    tradeLicense.getTradeLicenseDetail().getVerificationDocuments().forEach(document -> {
                        if(document.getId()==null){
                            document.setId(UUID.randomUUID().toString());
                            document.setActive(true);
                        }
                    });
                }
            }
            
            //Add Signature in 
            if(StringUtils.isEmpty(tradeLicense.getTradeLicenseDetail().getOwners().get(0).getSignature())) {
            	String signatureId = tradeLicense.getTradeLicenseDetail().getApplicationDocuments().stream()
            	.filter(documnet -> documnet.getDocumentType().equalsIgnoreCase(SIGNATURE_DOC_TYPE))
            	.map(Document::getFileStoreId).findAny().orElse(null);
            	tradeLicense.getTradeLicenseDetail().getOwners().get(0).setSignature(signatureId);
            }
            
        });
    }

    /**
     * Sets the licenseNumber generated by idgen
     * @param request The update request
     */
    private void setLicenseNumberAndIssueDate(TradeLicenseRequest request,List<String>endstates , Map<String, Object> mdmsDataMap) {
        RequestInfo requestInfo = request.getRequestInfo();
        List<TradeLicense> licenses = request.getLicenses();
        int count=0;
        
        
        if (licenses.get(0).getApplicationType() != null && licenses.get(0).getApplicationType().toString().equals(TLConstants.APPLICATION_TYPE_RENEWAL) &&
        		!businessService_BPA.equalsIgnoreCase(licenses.get(0).getBusinessService())) {
            for(int i=0;i<licenses.size();i++){
                TradeLicense license = licenses.get(i);
                Long time = System.currentTimeMillis();
                license.setIssuedDate(time);
            }
        }else {
            for (int i = 0; i < licenses.size(); i++) {
                TradeLicense license = licenses.get(i);
                if ((license.getStatus() != null) && license.getStatus().equalsIgnoreCase(endstates.get(i)))
                    count++;
            }
            if (count != 0) {
                List<String> licenseNumbers = new ArrayList<>();
                for(TradeLicense license : licenses) {
                	String applicationType = license.getApplicationType() != null
            				? license.getApplicationType().toString()
            				: "";
                	 String businessService = licenses.isEmpty() ? null : license.getBusinessService();
                     if (businessService == null)
                         businessService = businessService_TL;
                     switch (businessService) {
                         case businessService_TL:
                             licenseNumbers = getIdList(requestInfo, license.getTenantId(), config.getLicenseNumberIdgenNameTL(), config.getLicenseNumberIdgenFormatTL(), count);
                             break;

                         case businessService_BPA:
                        	 if(ACTION_REAPPROVE.equalsIgnoreCase(license.getAction()) ||
                        			 APPLICATION_TYPE_RENEWAL.equalsIgnoreCase(applicationType)) {
                        		 licenseNumbers.add(license.getLicenseNumber());
                        	 }else {
                        		 String licenseFormateBPAREG = config.getLicenseNumberIdgenFormatBPA();
                             	 String tradeType = license.getTradeLicenseDetail().getTradeUnits().get(0).getTradeType().split("\\.")[0];
                             	 licenseFormateBPAREG = licenseFormateBPAREG.replace("SK", TRADETYPE_TO_IDGEN_SHORTNAME.get(tradeType));
                                 licenseNumbers = getIdList(requestInfo, license.getTenantId(), config.getLicenseNumberIdgenNameBPA(), licenseFormateBPAREG, count);
                        	 }
                             break;
                     }
				};
               
                ListIterator<String> itr = licenseNumbers.listIterator();

                Map<String, String> errorMap = new HashMap<>();
                if (licenseNumbers.size() != count) {
                    errorMap.put("IDGEN ERROR ", "The number of LicenseNumber returned by idgen is not equal to number of TradeLicenses");
                }

                if (!errorMap.isEmpty())
                    throw new CustomException(errorMap);

                for (int i = 0; i < licenses.size(); i++) {
                    TradeLicense license = licenses.get(i);
                    if ((license.getStatus() != null) && license.getStatus().equalsIgnoreCase(endstates.get(i))) {
                    	String businessService = licenses.isEmpty() ? null : license.getBusinessService();
                        if (businessService == null)
                            businessService = businessService_TL;
                        license.setLicenseNumber(itr.next());
                        Long time = System.currentTimeMillis();
                        license.setIssuedDate(time);
                        //license.setValidFrom(time);
                        if (mdmsDataMap.get(license.getTenantId()) != null && businessService.equalsIgnoreCase(businessService_BPA)) {
                            String jsonPath = TLConstants.validityPeriodMap.replace("{}",
                                    license.getTradeLicenseDetail().getTradeUnits().get(0).getTradeType());
                            List<Integer> res = JsonPath.read(mdmsDataMap.get(license.getTenantId()), jsonPath);
                            Calendar calendar = Calendar.getInstance();
                            calendar.add(Calendar.YEAR, res.get(0));
                            String tradeType = license.getTradeLicenseDetail().getTradeUnits().get(0).getTradeType().split("\\.")[0];
                            String applicationType = license.getApplicationType() != null
                    				? license.getApplicationType().toString()
                    				: "";
                            if(!(tradeType.equalsIgnoreCase("ARCHITECT") || ACTION_REAPPROVE.equalsIgnoreCase(license.getAction()))) {
                            	TradeLicense existingLicense = getExistingApplication(requestInfo, license.getTenantId(), 
                        				license.getTradeLicenseDetail().getOwners().get(0).getMobileNumber(), license.getApplicationNumber());
                            	switch (applicationType) {
								case APPLICATION_TYPE_UPGRADE:
									if(existingLicense != null && existingLicense.getValidTo() != null)
										license.setValidTo(existingLicense.getValidTo());
									else
										license.setValidTo(calendar.getTimeInMillis());
									break;
								case APPLICATION_TYPE_RENEWAL:
									if(existingLicense != null && existingLicense.getValidTo() != null && !STATUS_EXPIRED.equalsIgnoreCase(existingLicense.getStatus()))
										license.setValidTo((existingLicense.getValidTo() - time) + calendar.getTimeInMillis());
									else
										license.setValidTo(calendar.getTimeInMillis());
									
									license.setLicenseNumber(existingLicense.getLicenseNumber());
									break;
								default:
									license.setValidTo(calendar.getTimeInMillis());
									break;
								}
                            }
                            license.setValidFrom(time);
                        }

                    }
                }
            }

        }
    }


    /**
     * Adds accountId of the logged in user to search criteria
     * @param requestInfo The requestInfo of searhc request
     * @param criteria The tradeLicenseSearch criteria
     */
    public void enrichSearchCriteriaWithAccountId(RequestInfo requestInfo,TradeLicenseSearchCriteria criteria){
        if(criteria.isEmpty() && requestInfo.getUserInfo().getType().equalsIgnoreCase("CITIZEN")){
            criteria.setAccountId(requestInfo.getUserInfo().getUuid());
            criteria.setMobileNumber(requestInfo.getUserInfo().getUserName());
            criteria.setTenantId(requestInfo.getUserInfo().getTenantId());
        }
        
        if(requestInfo.getUserInfo().getType().equalsIgnoreCase("CITIZEN") && criteria.mobileNumberOnly()) {
        	criteria.setTenantId(requestInfo.getUserInfo().getTenantId());
        	criteria.setOnlyMobileNumber(true);
        	
        }

    }

    /**
     * Enriches the tradeLicenses with ownerInfo and Boundary data
     * @param licenses The licenses to be enriched
     * @param criteria The search criteria of licenses containing the ownerIds
     * @param requestInfo The requestInfo of search
     * @return enriched tradeLicenses
     */
    public List<TradeLicense> enrichTradeLicenseSearch(List<TradeLicense> licenses, TradeLicenseSearchCriteria criteria, RequestInfo requestInfo){

        String businessService = licenses.isEmpty()?null:licenses.get(0).getBusinessService();
        if (businessService == null)
            businessService = businessService_TL;
        TradeLicenseSearchCriteria searchCriteria = enrichTLSearchCriteriaWithOwnerids(criteria,licenses);
        switch (businessService) {
            case businessService_TL:
                enrichBoundary(new TradeLicenseRequest(requestInfo, licenses));
                break;
        }
        UserDetailResponse userDetailResponse = userService.getUser(searchCriteria,requestInfo);
        enrichOwner(userDetailResponse,licenses);
        return licenses;
    }


    /**
     * Enriches the object after status is assigned
     * @param tradeLicenseRequest The update request
     */
    public void postStatusEnrichment(TradeLicenseRequest tradeLicenseRequest,List<String>endstates, Map<String, Object> mdmsDataMap){
        setLicenseNumberAndIssueDate(tradeLicenseRequest,endstates,mdmsDataMap);
    }


    /**
     * Creates search criteria from list of trade license
     * @param licenses The licenses whose ids are to be added to search
     * @return tradeLicenseSearch criteria on basis of tradelicense id
     */
    public TradeLicenseSearchCriteria getTradeLicenseCriteriaFromIds(List<TradeLicense> licenses){
        TradeLicenseSearchCriteria criteria = new TradeLicenseSearchCriteria();
        Set<String> licenseIds = new HashSet<>();
        licenses.forEach(license -> licenseIds.add(license.getId()));
        criteria.setIds(new LinkedList<>(licenseIds));
        criteria.setBusinessService(licenses.get(0).getBusinessService());
        return criteria;
    }

    /**
     * In case of SENDBACKTOCITIZEN enrich the assignee with the owners and creator of license
     * @param license License to be enriched
     */
    public void enrichAssignes(TradeLicense license){

            if(license.getAction().equalsIgnoreCase(CITIZEN_SENDBACK_ACTION)){

                    Set<String> assignes = new HashSet<>();

                    // Adding owners to assignes list
                    license.getTradeLicenseDetail().getOwners().forEach(ownerInfo -> {
                       assignes.add(ownerInfo.getUuid());
                    });

                    // Adding creator of license
                    if(license.getAccountId()!=null)
                        assignes.add(license.getAccountId());

                    Set<String> registeredUUIDS = userService.getUUidFromUserName(license);

                    if(!CollectionUtils.isEmpty(registeredUUIDS))
                        assignes.addAll(registeredUUIDS);


                    license.setAssignee(new LinkedList<>(assignes));
            }
    }
    
    private List<String> getIdListFromExistingApplication(RequestInfo requestInfo, String tenantId, String mobileNumber, String tradeType, int count){
    	List<String> licenseNumbers = new ArrayList<String>();
    	TradeLicenseSearchCriteria criteria = TradeLicenseSearchCriteria.builder().tenantId(tenantId)
    			.status(Arrays.asList(TLConstants.STATUS_APPROVED)).onlyLatestApplication(true)
    			.mobileNumber(mobileNumber).tradeType(tradeType).businessService(businessService_BPA).build();
    	
    	List<TradeLicense> licenses = licenseService.getLicensesFromMobileNumber(criteria, requestInfo);
    	
    	if(!CollectionUtils.isEmpty(licenses)) {
    		IntStream.range(0, count).forEach(i -> licenseNumbers.add(licenses.get(0).getLicenseNumber()));
    	}
    	
    	return licenseNumbers;
    }
    
	/**
	 * Get the Existing approved Application
	 * 
	 * @param requestInfo
	 * @param tenantId
	 * @param mobileNumber
	 * @param tradeType
	 * @return Existing Professional Application
	 */
	private TradeLicense getExistingApplication(RequestInfo requestInfo, String tenantId, String mobileNumber, String newApplicationNo) {
		TradeLicenseSearchCriteria criteria = TradeLicenseSearchCriteria.builder().tenantId(tenantId)
				.status(Arrays.asList(STATUS_APPROVED,STATUS_EXPIRED)).mobileNumber(mobileNumber)
				.businessService(businessService_BPA).build();

		List<TradeLicense> licenses = licenseService.getLicensesFromMobileNumber(criteria, requestInfo);

		// Remove latest Approved application
		licenses = licenses.stream().filter(
				license -> !(license.getApplicationNumber().equalsIgnoreCase(newApplicationNo)))
				.collect(Collectors.toList());

		return CollectionUtils.isEmpty(licenses) ? null : licenses.get(0);
	}
    
}
