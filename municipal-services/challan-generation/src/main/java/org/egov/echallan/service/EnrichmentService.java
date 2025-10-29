package org.egov.echallan.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.echallan.config.ChallanConfiguration;
import org.egov.echallan.model.AuditDetails;
import org.egov.echallan.model.Challan;
import org.egov.echallan.model.Challan.StatusEnum;
import org.egov.echallan.model.ChallanRequest;
import org.egov.echallan.model.SearchCriteria;
import org.egov.echallan.model.UserInfo;
import org.egov.echallan.repository.ChallanRepository;
import org.egov.echallan.repository.IdGenRepository;
import org.egov.echallan.repository.ServiceRequestRepository;
import org.egov.echallan.util.CommonUtils;
import org.egov.echallan.web.models.Idgen.IdResponse;
import org.egov.echallan.web.models.user.User;
import org.egov.echallan.web.models.user.UserDetailResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EnrichmentService {

    private IdGenRepository idGenRepository;
    private ChallanConfiguration config;
    private CommonUtils commUtils;
    private UserService userService;
    private ChallanRepository challanRepository;
    private ServiceRequestRepository serviceRequestRepository;
    
    @Autowired
    public EnrichmentService(IdGenRepository idGenRepository, ChallanConfiguration config, CommonUtils commonUtils, UserService userService, 
    		ChallanRepository challanRepository,ServiceRequestRepository serviceRequestRepository) {
        this.idGenRepository = idGenRepository;
        this.config = config;
        this.commUtils = commonUtils;
        this.userService = userService;
        this.challanRepository = challanRepository;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    public void enrichCreateRequest(ChallanRequest challanRequest) {
        RequestInfo requestInfo = challanRequest.getRequestInfo();
        String uuid = requestInfo.getUserInfo().getUuid();
        AuditDetails auditDetails = commUtils.getAuditDetails(uuid, true);
        Challan challan = challanRequest.getChallan();
        challan.setAuditDetails(auditDetails);
        challan.setId(UUID.randomUUID().toString());
        challan.setApplicationStatus(StatusEnum.ACTIVE);
        
        // Set default business service if not provided
        if (challan.getBusinessService() == null || challan.getBusinessService().isEmpty()) {
            challan.setBusinessService("Challan_Generation");
        }
        
        // Handle address - only enrich if not null
        if(challan.getAddress()!=null) {
        	challan.getAddress().setId(UUID.randomUUID().toString());
        	challan.getAddress().setTenantId(challan.getTenantId());
        	// Ensure locality is not null - if null, the persister will fail when trying to access locality.code
        	// We'll handle this by ensuring locality stays as null object (persister will use null for DB)
        }
        
        // Handle documents - enrich with IDs and auditDetails
        if(challan.getUploadedDocumentDetails() != null && !challan.getUploadedDocumentDetails().isEmpty()) {
            challan.getUploadedDocumentDetails().forEach(document -> {
                // Generate ID for new documents
                if (document.getDocumentDetailId() == null) {
                    document.setDocumentDetailId(UUID.randomUUID().toString());
                }
                // Set challanId for all documents
                document.setChallanId(challan.getId());
                // Set auditDetails for each document (required for persister)
                document.setAuditDetails(auditDetails);
            });
        }
        
        challan.setFilestoreid(null);
        setIdgenIds(challanRequest);
    }

    private List<String> getIdList(RequestInfo requestInfo, String tenantId, String idKey,
                                   String idformat, int count) {
        List<IdResponse> idResponses = idGenRepository.getId(requestInfo, tenantId, idKey, idformat, count).getIdResponses();

        if (CollectionUtils.isEmpty(idResponses))
            throw new CustomException("IDGEN ERROR", "No ids returned from idgen Service");

        return idResponses.stream()
                .map(IdResponse::getId).collect(Collectors.toList());
    }

    private void setIdgenIds(ChallanRequest request) {
        RequestInfo requestInfo = request.getRequestInfo();
        String tenantId = request.getChallan().getTenantId();
        Challan challan = request.getChallan();
        String challanNo = getIdList(requestInfo, tenantId, config.getChallannNumberIdgenName(), config.getChallanNumberIdgenFormat(), 1).get(0);
        challan.setChallanNo(challanNo);
    }

    public void enrichSearchCriteriaWithAccountId(RequestInfo requestInfo,SearchCriteria criteria){
        if(criteria.isEmpty() && requestInfo.getUserInfo().getType().equalsIgnoreCase("CITIZEN")){
            criteria.setAccountId(requestInfo.getUserInfo().getUuid());
            criteria.setMobileNumber(requestInfo.getUserInfo().getUserName());
            criteria.setTenantId(requestInfo.getUserInfo().getTenantId());
        }

    }
    
    public SearchCriteria getChallanCriteriaFromIds(List<Challan> challans){
        SearchCriteria criteria = new SearchCriteria();
        Set<String> ids = new HashSet<>();
        Set<String> businessids = new HashSet<>();
        Set<String> tenantIds = new HashSet<>();
        challans.forEach(challan -> ids.add(challan.getId()));
        challans.forEach(challan -> businessids.add(challan.getBusinessService()));
        challans.forEach(challan -> tenantIds.add(challan.getTenantId()));

        String businessService = String.join(",", businessids);
        criteria.setIds(new LinkedList<>(ids));
        criteria.setBusinessService(businessService);
        String tenantId = String.join(",", tenantIds);
        criteria.setTenantId(tenantId);
        return criteria;
    }
    
    public void enrichSearchCriteriaWithOwnerids(SearchCriteria criteria, UserDetailResponse userDetailResponse){
        if(CollectionUtils.isEmpty(criteria.getUserIds())){
            Set<String> userIds = new HashSet<>();
            userDetailResponse.getUser().forEach(owner -> userIds.add(owner.getUuid()));
            criteria.setUserIds(new ArrayList<>(userIds));
        }
    }

    public void enrichOwner(UserDetailResponse userDetailResponse, List<Challan> challans){
        List<UserInfo> users = userDetailResponse.getUser();
        Map<String,User> userIdToOwnerMap = new HashMap<>();
        users.forEach(user -> userIdToOwnerMap.put(user.getUuid(),user));
        challans.forEach(challan -> {
        	if(challan.getAccountId()==null)
                        throw new CustomException("OWNER SEARCH ERROR","The owner of the echallan "+challan.getId()+" is not coming in user search");
            else {
                   User user = userIdToOwnerMap.get(challan.getAccountId());
                   UserInfo userinfo = getUserInfo(user);
                    	
                   challan.setCitizen(userinfo);
                 }
       });

    }

    private UserInfo getUserInfo(User user) {
    	UserInfo userinfo = new UserInfo();
    	userinfo.setUuid(user.getUuid());
    	userinfo.setId(user.getId());
    	userinfo.setUserName(user.getUserName());
    	userinfo.setCreatedBy(user.getUuid());
    	userinfo.setCreatedDate(System.currentTimeMillis());
    	userinfo.setLastModifiedDate(System.currentTimeMillis());
    	userinfo.setActive(user.getActive());
    	userinfo.setTenantId(user.getTenantId());
    	userinfo.setMobileNumber(user.getMobileNumber());
    	userinfo.setName(user.getName());
    	return userinfo;
    }
    public List<Challan> enrichChallanSearch(List<Challan> challans, SearchCriteria criteria, RequestInfo requestInfo){
        try {
            SearchCriteria searchCriteria = enrichChallanSearchCriteriaWithOwnerids(criteria,challans);
            UserDetailResponse userDetailResponse = userService.getUser(searchCriteria,requestInfo);
            enrichOwner(userDetailResponse,challans);
        } catch (Exception ex) {
            log.warn("User enrichment failed for challan search, continuing without user details: {}", ex.getMessage());
            // Continue without user enrichment
        }
        return challans;
    }
    
    
    public SearchCriteria enrichChallanSearchCriteriaWithOwnerids(SearchCriteria criteria, List<Challan> challans) {
        SearchCriteria searchCriteria = new SearchCriteria();
        searchCriteria.setTenantId(criteria.getTenantId());
        Set<String> ownerids = new HashSet<>();
        challans.forEach(challan -> {
        	ownerids.add(challan.getAccountId());
        });
        searchCriteria.setUserIds(new ArrayList<>(ownerids));
        return searchCriteria;
    }

	public void enrichUpdateRequest(ChallanRequest request) {
		 RequestInfo requestInfo = request.getRequestInfo();
	     String uuid = requestInfo.getUserInfo().getUuid();
	     AuditDetails auditDetails = commUtils.getAuditDetails(uuid, false);
	     Challan challan = request.getChallan();
	     challan.setAuditDetails(auditDetails);
	     String fileStoreId = challan.getFilestoreid();
	     if(fileStoreId!=null) {
	    	 challanRepository.setInactiveFileStoreId(challan.getTenantId().split("\\.")[0], Collections.singletonList(fileStoreId));
	     }

        // Handle documents - enrich with IDs and auditDetails for update
        if(challan.getUploadedDocumentDetails() != null && !challan.getUploadedDocumentDetails().isEmpty()) {
            challan.getUploadedDocumentDetails().forEach(document -> {
                // Generate ID for new documents
                if (document.getDocumentDetailId() == null) {
                    document.setDocumentDetailId(UUID.randomUUID().toString());
                }
                // Set challanId for all documents
                document.setChallanId(challan.getId());
                // Set auditDetails for each document (required for persister)
                document.setAuditDetails(auditDetails);
            });
        }
	     challan.setFilestoreid(null);
	}

}
