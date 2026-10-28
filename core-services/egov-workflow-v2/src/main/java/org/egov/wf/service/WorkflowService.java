package org.egov.wf.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.repository.ServiceRequestRepository;
import org.egov.wf.repository.WorKflowRepository;
import org.egov.wf.util.WorkflowConstants;
import org.egov.wf.util.WorkflowUtil;
import org.egov.wf.validator.WorkflowValidator;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.egov.tracer.model.CustomException;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.isNull;

import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
public class WorkflowService {

    private final WorkflowConstants workflowConstants;

    private WorkflowConfig config;

    private TransitionService transitionService;

    private EnrichmentService enrichmentService;

    private WorkflowValidator workflowValidator;

    private StatusUpdateService statusUpdateService;

    private WorKflowRepository workflowRepository;

    private WorkflowUtil util;

    private BusinessServiceRepository businessServiceRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private MDMSService mdmsService;

    @Autowired
    private BusinessMasterService businessMasterService;
    
    @Autowired
    private ServiceRequestRepository serviceRequestRepository;


    @Autowired
    public WorkflowService(WorkflowConfig config, TransitionService transitionService,
                           EnrichmentService enrichmentService, WorkflowValidator workflowValidator,
                           StatusUpdateService statusUpdateService, WorKflowRepository workflowRepository,
                           WorkflowUtil util,BusinessServiceRepository businessServiceRepository, WorkflowConstants workflowConstants) {
        this.config = config;
        this.transitionService = transitionService;
        this.enrichmentService = enrichmentService;
        this.workflowValidator = workflowValidator;
        this.statusUpdateService = statusUpdateService;
        this.workflowRepository = workflowRepository;
        this.util = util;
        this.businessServiceRepository = businessServiceRepository;
        this.workflowConstants = workflowConstants;
    }


    /**
     * Creates or updates the processInstanceFromRequest
     * @param request The incoming request for workflow transition
     * @return The list of processInstanceFromRequest objects after taking action
     */
    public List<ProcessInstance> transition(ProcessInstanceRequest request){
        RequestInfo requestInfo = request.getRequestInfo();

        List<ProcessStateAndAction> processStateAndActions = transitionService.getProcessStateAndActions(request.getProcessInstances(),true);
        enrichmentService.enrichProcessRequest(requestInfo,processStateAndActions);
        workflowValidator.validateRequest(requestInfo,processStateAndActions);
        statusUpdateService.updateStatus(requestInfo,processStateAndActions);
        
        if(!CollectionUtils.isEmpty(request.getProcessInstances()) ) {
        	String moduleName = request.getProcessInstances().get(0).getModuleName();
        	String businessServiceName = request.getProcessInstances().get(0).getBusinessService();
        	List<Map<String, Object>> autoSkipStepsMdmsDataList = mdmsService.getAutoSkipStatesMDMS(moduleName, businessServiceName);
        	
        	if(!autoSkipStepsMdmsDataList.isEmpty()) {
        		Map<String, Object> autoSkipStepsMdmsData = autoSkipStepsMdmsDataList.get(0);
        		try {
        			autoSkipTransition(request, autoSkipStepsMdmsData);
				} catch (Exception ex) {
					log.error("Enable to Skip State : " + request.getProcessInstances().get(0).getState().getState());
					ex.printStackTrace();
				}
        	}
        	
        }
        
        return request.getProcessInstances();
    }


    /**
     * Fetches ProcessInstances from db based on processSearchCriteria
     * @param requestInfo The RequestInfo of the search request
     * @param criteria The object containing Search params
     * @return List of processInstances based on search criteria
     */
    public List<ProcessInstance> search(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        
    	
    	
    	List<ProcessInstance> processInstances;
        if(criteria.isNull())
            processInstances = getUserBasedProcessInstances(requestInfo, criteria);
        else processInstances = workflowRepository.getProcessInstances(criteria);
        if(CollectionUtils.isEmpty(processInstances))
            return processInstances;

        enrichmentService.enrichUsersFromSearch(requestInfo,processInstances);
        List<ProcessStateAndAction> processStateAndActions = enrichmentService.enrichNextActionForSearch(requestInfo,processInstances);
    //    workflowValidator.validateSearch(requestInfo,processStateAndActions);
        enrichmentService.enrichAndUpdateSlaForSearch(processInstances);
        return processInstances;
    }


    public Integer count(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        Integer count;
        
     // Enrich slot sla limit in case of nearingSla count
        if(criteria.getIsNearingSlaCount()){

            if(ObjectUtils.isEmpty(criteria.getBusinessService()))
                throw new CustomException("EG_WF_BUSINESSSRV_ERR", "Providing business service is mandatory for nearing escalation count");

            Integer slotPercentage = mdmsService.fetchSlotPercentageForNearingSla(requestInfo);
            Long maxBusinessServiceSla = businessMasterService.getMaxBusinessServiceSla(criteria);
            criteria.setSlotPercentageSlaLimit(maxBusinessServiceSla - slotPercentage * (maxBusinessServiceSla/100));
        }
        
        if(criteria.isNull()){
            enrichSearchCriteriaFromUser(requestInfo, criteria);
            count = workflowRepository.getInboxCount(criteria);
        }
        else count = workflowRepository.getProcessInstancesCount(criteria);

        return count;
    }





    /**
     * Searches the processInstances based on user and its roles
     * @param requestInfo The RequestInfo of the search request
     * @param criteria The object containing Search params
     * @return List of processInstances based on search criteria
     */
    private List<ProcessInstance> getUserBasedProcessInstances(RequestInfo requestInfo,
                                       ProcessInstanceSearchCriteria criteria){

        enrichSearchCriteriaFromUser(requestInfo, criteria);
        List<ProcessInstance> processInstances = workflowRepository.getProcessInstancesForUserInbox(criteria);

        processInstances = filterDuplicates(processInstances);

        return processInstances;

    }
    public Integer getUserBasedProcessInstancesCount(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        Integer count;
        count = workflowRepository.getProcessInstancesForUserInboxCount(criteria);
        return count;
    }

    /**
     * Removes duplicate businessId which got created due to simultaneous request
     * @param processInstances
     * @return
     */
    private List<ProcessInstance> filterDuplicates(List<ProcessInstance> processInstances){

        if(CollectionUtils.isEmpty(processInstances))
            return processInstances;

        Map<String,ProcessInstance> businessIdToProcessInstanceMap = new LinkedHashMap<>();

        for(ProcessInstance processInstance : processInstances){
            businessIdToProcessInstanceMap.put(processInstance.getBusinessId(), processInstance);
        }

        return new LinkedList<>(businessIdToProcessInstanceMap.values());
    }
    
    public List statusCount(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        List result;
        if(criteria.isNull() && !isNull(criteria.getBusinessService()) && !criteria.getBusinessService().equalsIgnoreCase(WorkflowConstants.FSM_MODULE)){
        	enrichSearchCriteriaFromUser(requestInfo, criteria);
            result = workflowRepository.getInboxStatusCount(criteria);
        }
        else {
//        	List<String> origCriteriaStatuses = criteria.getStatus();
        	// enrichSearchCriteriaFromUser(requestInfo, criteria);
//        	String tenantId = (criteria.getTenantId() == null ? (requestInfo.getUserInfo().getTenantId()) :(criteria.getTenantId()));
//        	List<String> finalCriteriaStatuses = new ArrayList<String>();
//        	if(origCriteriaStatuses != null && !origCriteriaStatuses.isEmpty()) {
//        		origCriteriaStatuses.forEach((status) ->{
//        			finalCriteriaStatuses.add(tenantId+":"+status);
//        		});
//        		criteria.setStatus(finalCriteriaStatuses);
//        	}
        	result = workflowRepository.getProcessInstancesStatusCount(criteria);
        }

        return result;
    }

    /**
     * Enriches processInstance search criteria based on requestInfo
     * @param requestInfo
     * @param criteria
     */
    private void enrichSearchCriteriaFromUser(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){

        /*BusinessServiceSearchCriteria businessServiceSearchCriteria = new BusinessServiceSearchCriteria();

        *//*
         * If tenantId is sent in query param processInstances only for that tenantId is returned
         * else all tenantIds for which the user has roles are returned
         * *//*
        if(criteria.getTenantId()!=null)
            businessServiceSearchCriteria.setTenantIds(Collections.singletonList(criteria.getTenantId()));
        else
            businessServiceSearchCriteria.setTenantIds(util.getTenantIds(requestInfo.getUserInfo()));

        Map<String, Boolean> stateLevelMapping = stat

        List<BusinessService> businessServices = businessServiceRepository.getAllBusinessService();
        List<String> actionableStatuses = util.getActionableStatusesForRole(requestInfo,businessServices,criteria);
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());
        criteria.setStatus(actionableStatuses);*/

        util.enrichStatusesInSearchCriteria(requestInfo, criteria);
        criteria.setAssignee(requestInfo.getUserInfo().getUuid());


    }


    public List<ProcessInstance> escalatedApplicationsSearch(RequestInfo requestInfo, ProcessInstanceSearchCriteria criteria) {
        List<String> escalatedApplicationsBusinessIds;
        List<ProcessInstance> escalatedApplications = new ArrayList<>();
        criteria.setIsEscalatedCount(false);
//        Set<String> autoEscalationEmployeesUuids = enrichmentService.enrichUuidsOfAutoEscalationEmployees(requestInfo, criteria);
        //Set<String> statesToIgnore = enrichmentService.fetchStatesToIgnoreFromMdms(requestInfo, criteria.getTenantId());
        escalatedApplicationsBusinessIds = workflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb(requestInfo,criteria);
        if(CollectionUtils.isEmpty(escalatedApplicationsBusinessIds)){
            return escalatedApplications;
        }
        // SEARCH BASED ON FILTERED BUSINESS IDs DONE HERE
        ProcessInstanceSearchCriteria searchCriteria =  new ProcessInstanceSearchCriteria();
        searchCriteria.setBusinessIds(escalatedApplicationsBusinessIds);
        searchCriteria.setTenantId(criteria.getTenantId());
        searchCriteria.setBusinessService(criteria.getBusinessService());
//        searchCriteria.setHistory(true);
        escalatedApplications = search(requestInfo, searchCriteria);

        // Only last but one applications in history needs to show up where the employee failed to take action

//        HashMap<String, List<ProcessInstance>> businessIdsVsProcessInstancesMap = new HashMap<>();
//        HashMap<String, Integer> occurenceMap = new HashMap<>();
//        for(ProcessInstance processInstance : escalatedApplicationsWithHistory){
//            if(businessIdsVsProcessInstancesMap.containsKey(processInstance.getBusinessId())){
//                occurenceMap.put(processInstance.getBusinessId(), occurenceMap.get(processInstance.getBusinessId()) + 1);
//                businessIdsVsProcessInstancesMap.get(processInstance.getBusinessId()).add(processInstance);
//            }else{
//                occurenceMap.put(processInstance.getBusinessId(), 1);
//                List<ProcessInstance> processInstanceList = new ArrayList<>();
//                processInstanceList.add(processInstance);
//                businessIdsVsProcessInstancesMap.put(processInstance.getBusinessId(), processInstanceList);
//            }
//        }
//        criteria.setAssignee(requestInfo.getUserInfo().getUuid());
//        for(String businessId : occurenceMap.keySet()){
//            if(occurenceMap.get(businessId) >= 2){
//                Set<String> uuidsOfAssignees = new HashSet<>();
//                if(!CollectionUtils.isEmpty(businessIdsVsProcessInstancesMap.get(businessId).get(1).getAssignes())) {
//                    businessIdsVsProcessInstancesMap.get(businessId).get(1).getAssignes().forEach(user -> {
//                        uuidsOfAssignees.add(user.getUuid());
//                    });
//                }
//                if(autoEscalationEmployeesUuids.contains(businessIdsVsProcessInstancesMap.get(businessId).get(0).getAuditDetails().getCreatedBy()) && uuidsOfAssignees.contains(criteria.getAssignee())){
                   //if(!statesToIgnore.contains(businessIdsVsProcessInstancesMap.get(businessId).get(1).getState().getState()))
//                        escalatedApplications.add(businessIdsVsProcessInstancesMap.get(businessId).get(0));
//                }
//            }
//        }
        return escalatedApplications;
    }

    public Integer countEscalatedApplications(RequestInfo requestInfo,ProcessInstanceSearchCriteria criteria){
        Integer count;
        criteria.setIsEscalatedCount(true);
        count = workflowRepository.getEscalatedApplicationsCount(requestInfo,criteria);
        return count;
    }
    
    public List<ProcessInstance> getAutoEscalationEligibleApplications(ProcessInstanceSearchCriteria criteria) {
    	workflowValidator.validateAutoEscalationEligibleRequest(criteria);
    	
        return workflowRepository.getAutoEscalationEligibleApplications(criteria);
    }
    
    /**
     * Skip the processInstanceFromRequest
     * @param request The incoming request for workflow transition
     * @return The list of processInstanceFromRequest objects after taking action
     */
    public List<ProcessInstance> autoSkipTransition(ProcessInstanceRequest request, Map<String, Object> autoSkipStepsMdmsData){
        RequestInfo requestInfo = request.getRequestInfo();
        RequestInfo systemRequestInfo = RequestInfo.builder().userInfo(userService.searchSystemUser()).build();
        
        Map<String, Object> hrmsSearchPathConfig = (Map<String, Object>) autoSkipStepsMdmsData.get("hrmsSearchPath");
        String hrmsSearchPath = getHrmsSearchPath(hrmsSearchPathConfig, requestInfo, request.getProcessInstances().get(0).getTenantId()
        		, request.getProcessInstances().get(0).getBusinessId());
        request.getProcessInstances().get(0).setHrmsSearchPath(hrmsSearchPath);
        
    	//Uncomment below line if you are working on local
    	systemRequestInfo.setAuthToken(requestInfo.getAuthToken());
        
    	request.setRequestInfo(systemRequestInfo);
    	
        String comment = autoSkipStepsMdmsData.get("comment").toString();
        List<String> terminateActionRoles = (List<String>)autoSkipStepsMdmsData.get("terminateActionRoles");
        
        List<BusinessService> businessServiceList = businessServiceRepository
        		.getBusinessServices(new BusinessServiceSearchCriteria(request.getProcessInstances().get(0).getTenantId(), 
        				Collections.singletonList(request.getProcessInstances().get(0).getBusinessService()) , null, null));
        
        List<User> nextActionUsers = getNextActionUsers(request);
        boolean isterminateActionRolesContains = checkNextActonRoles(request, terminateActionRoles);
        while(nextActionUsers.isEmpty() && !isterminateActionRolesContains) {
        	Role systemRole = util.getSystemRole();
        	String nextAction = request.getProcessInstances().get(0).getState()
        			.getActions()
            		.stream().filter(action -> action.getRoles().contains(systemRole.getCode()) && !action.getCurrentState().equalsIgnoreCase(action.getNextState()))
            		.map(Action::getAction).findFirst().orElse("");
        	
        	if(StringUtils.isEmpty(nextAction))
        		break;
        	
        	requestInfo.getUserInfo().getRoles().add(systemRole);
        	request.getProcessInstances().get(0).setAction(nextAction);
        	request.getProcessInstances().get(0).setComment(comment);
        	
        	String nextStateId = request.getProcessInstances().get(0).getState()
        			.getActions().stream().filter(action -> action.getAction().equals(nextAction))
        			.map(Action::getNextState).findFirst().orElse("");
        	List<User> nextToNextActionUsers = getNextToNextActionUsers(requestInfo, nextStateId, request.getProcessInstances().get(0).getTenantId(),
        			hrmsSearchPath, businessServiceList.get(0));
        	
        	if(!CollectionUtils.isEmpty(nextToNextActionUsers)) {
        		request.getProcessInstances().get(0).setAssignes(nextToNextActionUsers);
        	}
        	
        	List<ProcessStateAndAction> processStateAndActions = transitionService.getProcessStateAndActions(request.getProcessInstances(),true);
            enrichmentService.enrichProcessRequest(systemRequestInfo,processStateAndActions);
            workflowValidator.validateRequest(systemRequestInfo,processStateAndActions);
            statusUpdateService.updateStatus(systemRequestInfo,processStateAndActions);
            
            nextActionUsers = getNextActionUsers(request);
            isterminateActionRolesContains = checkNextActonRoles(request, terminateActionRoles);
        }
        
        return request.getProcessInstances();
    }
    
    private List<User> getNextActionUsers(ProcessInstanceRequest request){
    	RequestInfo requestInfo = request.getRequestInfo();
        String tenantId = request.getProcessInstances().get(0).getTenantId();
        Role systemRole = util.getSystemRole();
        
        List<String> nextActionRoles = request.getProcessInstances().get(0).getState()
        		.getActions()
        		.stream()
        		.map(action -> action.getRoles()).flatMap(List::stream).distinct()
        		.filter(role -> !systemRole.getCode().equalsIgnoreCase(role))
        		.collect(Collectors.toList());
        
        if(CollectionUtils.isEmpty(nextActionRoles))
        	return Collections.EMPTY_LIST;
        
        return userService.getNextActionUsers(requestInfo, nextActionRoles, tenantId,request.getProcessInstances().get(0).getHrmsSearchPath());
    }
    
    private List<User> getNextToNextActionUsers(RequestInfo requestInfo,String nextStateId, String tenantId, String hrmsSearchPath, BusinessService businessService){
        Role systemRole = util.getSystemRole();
        
        List<String> nextActionRoles = businessService.getStates().stream()
        		.filter(state -> state.getUuid().equals(nextStateId))
        		.map(state -> state.getActions())
        		.flatMap(List::stream).map(action -> action.getRoles())
        		.flatMap(List::stream)
        		.collect(Collectors.toList());
        
        if(CollectionUtils.isEmpty(nextActionRoles))
        	return Collections.EMPTY_LIST;
        
        return userService.getNextActionUsers(requestInfo, nextActionRoles, tenantId,hrmsSearchPath);
    }
    
    private boolean checkNextActonRoles(ProcessInstanceRequest request, List<String> terminateActionRoles) {
    	boolean isterminateActionRolesContains = false;
    	List<String> nextActionRoles = request.getProcessInstances().get(0).getState()
    			.getActions()
        		.stream()
        		.map(action -> action.getRoles()).flatMap(List::stream).distinct()
        		.collect(Collectors.toList());
    	for(String terminateActionRole : terminateActionRoles) {
    		if(nextActionRoles.contains(terminateActionRole)) {
    			isterminateActionRolesContains = true;
    			break;
    		}
    	}
    	
    	return isterminateActionRolesContains;
    }
    
    private String getHrmsSearchPath(Map<String, Object> hrmsSearchPathConfig, RequestInfo requestInfo, String tenantId, String applicationNo) {
    	if(hrmsSearchPathConfig == null)
    		return null;
    	
    	StringBuilder hrmsSearchPath = new StringBuilder();
    	Object mdmsData = null;
    	StringBuilder applicationSearchUrl = new StringBuilder(hrmsSearchPathConfig.get("searchUrl").toString().replace("{0}", tenantId).replace("{1}", applicationNo));
    	Object applicationObj = serviceRequestRepository.fetchResult(applicationSearchUrl, new HashMap<String, Object>(){{
    		put("RequestInfo", requestInfo);
    	}});
    	
    	if(hrmsSearchPathConfig.get("mdmsPath") != null) {
    		String mdmsPath[] = hrmsSearchPathConfig.get("mdmsPath").toString().split("\\.");
    		mdmsData = mdmsService.getMdmsData(requestInfo, tenantId, mdmsPath[0], mdmsPath[1]);
    	}
    	
    	List<Map<String, String>> paramsMaps = (List<Map<String, String>>) hrmsSearchPathConfig.get("params");
    	
    	for(Map<String, String> map : paramsMaps) {

    		String value = map.get("value");
    		hrmsSearchPath.append(map.get("key")).append("=");
    		if(value.startsWith("$")) {
    			List<String> values = JsonPath.read(applicationObj, value);
    			if(map.get("mdmsMapping") == null) {
    				String finalValues = values.stream().map(val -> val.toString()).collect(Collectors.joining(","));
    				hrmsSearchPath.append(finalValues);
    			}else {
    				String mdmsMapping = map.get("mdmsMapping").toString();
    				String finalValues = values.stream().map(val -> val.toString()).collect(Collectors.joining(","));
    				values = JsonPath.read(mdmsData, mdmsMapping.replace("{0}", finalValues));
    				hrmsSearchPath.append(String.join(",", values));
    			}
    		}else
    			hrmsSearchPath.append(value);
    		
    		hrmsSearchPath.append("&");
    	
    	}
    	
    	
    	return hrmsSearchPath.toString();
    }
    
}
