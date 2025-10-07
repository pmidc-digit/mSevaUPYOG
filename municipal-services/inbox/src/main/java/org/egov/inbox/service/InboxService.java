package org.egov.inbox.service;

import static org.egov.inbox.util.BSConstants.ASSIGNEE_PARAM;
import static org.egov.inbox.util.BpaConstants.BPA;
import static org.egov.inbox.util.BpaConstants.BPAREG;
import static org.egov.inbox.util.BpaConstants.BPA_APPLICATION_NUMBER_PARAM;
import static org.egov.inbox.util.BpaConstants.LOCALITY_PARAM;
import static org.egov.inbox.util.BpaConstants.MOBILE_NUMBER_PARAM;
import static org.egov.inbox.util.BpaConstants.OFFSET_PARAM;
import static org.egov.inbox.util.BpaConstants.STATUS_ID;
import static org.egov.inbox.util.BpaConstants.STATUS_PARAM;
import static org.egov.inbox.util.DSSConstants.*;
import static org.egov.inbox.util.FSMConstants.APPLICATIONSTATUS;
import static org.egov.inbox.util.FSMConstants.CITIZEN_FEEDBACK_PENDING_STATE;
import static org.egov.inbox.util.FSMConstants.COMPLETED_STATE;
import static org.egov.inbox.util.FSMConstants.COUNT;
import static org.egov.inbox.util.FSMConstants.DISPOSED_STATE;
import static org.egov.inbox.util.FSMConstants.DSO_INPROGRESS_STATE;
import static org.egov.inbox.util.FSMConstants.FSM_VEHICLE_TRIP_MODULE;
import static org.egov.inbox.util.FSMConstants.STATUSID;
import static org.egov.inbox.util.FSMConstants.VEHICLE_LOG;
import static org.egov.inbox.util.FSMConstants.WAITING_FOR_DISPOSAL_STATE;
import static org.egov.inbox.util.NdcConstants.*;
import static org.egov.inbox.util.PTConstants.ACKNOWLEDGEMENT_IDS_PARAM;
import static org.egov.inbox.util.PTConstants.PT;
import static org.egov.inbox.util.PTRConstants.PTR;
import static org.egov.inbox.util.TLConstants.APPLICATION_NUMBER_PARAM;
import static org.egov.inbox.util.TLConstants.BUSINESS_SERVICE_PARAM;
import static org.egov.inbox.util.TLConstants.REQUESTINFO_PARAM;
import static org.egov.inbox.util.TLConstants.SEARCH_CRITERIA_PARAM;
import static org.egov.inbox.util.TLConstants.TENANT_ID_PARAM;
import static org.egov.inbox.util.TLConstants.TL;
import static org.egov.inbox.util.SWConstants.SW;
import static org.egov.inbox.util.BSConstants.*;
import static org.egov.inbox.util.WSConstants.WS;
import static org.egov.inbox.util.AssetConstants.ASSET;
import static org.egov.inbox.util.StreetVendingConstants.*;
import static org.egov.inbox.util.PGRConstants.PGR;
import static org.egov.inbox.util.PGRConstants.SWACH;
import static org.egov.inbox.util.PGRConstants.PGRANDSWACH_APPLICATION_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_MOBILE_NUMBER_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_LOCALITY_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_SERVICECODE_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_APPLICATION_NUMBER_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_CITIZEN_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_ADDRESS_PARAM;
import static org.egov.inbox.util.PGRConstants.PGR_ADDRESSCODE_PARAM;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static java.util.Objects.isNull;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.collections4.MapUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.inbox.config.InboxConfiguration;
import org.egov.inbox.model.vehicle.VehicleSearchCriteria;
import org.egov.inbox.model.vehicle.VehicleTripDetail;
import org.egov.inbox.model.vehicle.VehicleTripDetailResponse;
import org.egov.inbox.model.vehicle.VehicleTripSearchCriteria;
import org.egov.inbox.repository.ElasticSearchRepository;
import org.egov.inbox.repository.ServiceRequestRepository;
import org.egov.inbox.util.*;
import org.egov.inbox.web.model.Inbox;
import org.egov.inbox.web.model.InboxResponse;
import org.egov.inbox.web.model.InboxSearchCriteria;
import org.egov.inbox.web.model.RequestInfoWrapper;
import org.egov.inbox.web.model.VehicleCustomResponse;
import org.egov.inbox.web.model.workflow.BusinessService;
import org.egov.inbox.web.model.workflow.ProcessInstance;
import org.egov.inbox.web.model.workflow.ProcessInstanceResponse;
import org.egov.inbox.web.model.workflow.ProcessInstanceSearchCriteria;
import org.egov.inbox.web.model.workflow.State;
import org.egov.tracer.model.CustomException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class InboxService {

    private InboxConfiguration config;

    private ServiceRequestRepository serviceRequestRepository;

    private ObjectMapper mapper;

    private WorkflowService workflowService;

    @Autowired
    private PtInboxFilterService ptInboxFilterService;

    @Autowired
    private PGRInboxFilterService pgrInboxFilterService;

    @Autowired
    private SWACHInboxFilterService swachInboxFilterService;

    @Autowired
    private TLInboxFilterService tlInboxFilterService;

    @Autowired
    private BPAInboxFilterService bpaInboxFilterService;

    @Autowired
    private FSMInboxFilterService fsmInboxFilter;
    
    @Autowired
    private NDCInboxFilterService ndcInboxFilterService;

    @Autowired
    private PETInboxFilterService petInboxFilterService;

    @Autowired
    private ADVInboxFilterService advInboxFilterService;

    @Autowired
    private NOCInboxFilterService nocInboxFilterService;

    @Autowired
    private WSInboxFilterService wsInboxFilterService;
    
    @Autowired
    private SWInboxFilterService swInboxFilterService;
    
    @Autowired
    private BillingAmendmentInboxFilterService billInboxFilterService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    ElasticSearchRepository elasticSearchRepository;

    @Autowired
    private AssetInboxFilterService assetInboxFilterService;

    @Autowired
    private StreetVendingInboxFilterService StreetVendingInboxFilterService;

    @Autowired
    private PtrInboxFilterService ptrInboxFilterService;

    @Autowired
    private PGRAiInboxFilterService pgrAiInboxFilterService;

    @Autowired
    private CHBInboxFilterService chbInboxFilterService;


    @Autowired
    public InboxService(InboxConfiguration config, ServiceRequestRepository serviceRequestRepository,
                        ObjectMapper mapper, WorkflowService workflowService, CHBInboxFilterService chbInboxFilterService) {
        this.config = config;
        this.serviceRequestRepository = serviceRequestRepository;
        this.mapper = mapper;

        this.mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        this.workflowService = workflowService;
    }

    public InboxResponse fetchInboxData(InboxSearchCriteria criteria, RequestInfo requestInfo) {
    	
        ProcessInstanceSearchCriteria processCriteria = criteria.getProcessSearchCriteria();
        HashMap moduleSearchCriteria = criteria.getModuleSearchCriteria();
        processCriteria.setTenantId(criteria.getTenantId());
        Integer flag=0;
        if (processCriteria.getModuleName().equalsIgnoreCase(BS_WS)) {
        	flag=1;
        	processCriteria.setModuleName(BS_WS_MODULENAME);
        } else if(processCriteria.getModuleName().equalsIgnoreCase(BS_SW)) {
        	flag=2;
        	processCriteria.setModuleName(BS_SW_MODULENAME);
        }

        Integer totalCount = 0;

        if(!(processCriteria.getModuleName().equals(SW) || processCriteria.getModuleName().equals(WS)))
            totalCount = workflowService.getProcessCount(criteria.getTenantId(), requestInfo, processCriteria);
        Integer nearingSlaProcessCount = workflowService.getNearingSlaProcessCount(criteria.getTenantId(), requestInfo, processCriteria);
        List<String> inputStatuses = new ArrayList<>();
        if (!CollectionUtils.isEmpty(processCriteria.getStatus()))
            inputStatuses = new ArrayList<>(processCriteria.getStatus());
        StringBuilder assigneeUuid = new StringBuilder();
        String dsoId = null;
        if (requestInfo.getUserInfo().getRoles().get(0).getCode().equals(FSMConstants.FSM_DSO)) {
            Map<String, Object> searcherRequestForDSO = new HashMap<>();
            Map<String, Object> searchCriteriaForDSO = new HashMap<>();
            searchCriteriaForDSO.put(TENANT_ID_PARAM, criteria.getTenantId());
            searchCriteriaForDSO.put(FSMConstants.OWNER_ID, requestInfo.getUserInfo().getUuid());
            searcherRequestForDSO.put(REQUESTINFO_PARAM, requestInfo);
            searcherRequestForDSO.put(SEARCH_CRITERIA_PARAM, searchCriteriaForDSO);
            StringBuilder uri = new StringBuilder();
            uri.append(config.getSearcherHost()).append(config.getFsmInboxDSoIDEndpoint());

            Object resultForDsoId = restTemplate.postForObject(uri.toString(), searcherRequestForDSO, Map.class);

            dsoId = JsonPath.read(resultForDsoId, "$.vendor[0].id");

        }
        if (!ObjectUtils.isEmpty(processCriteria.getAssignee())) {
            assigneeUuid = assigneeUuid.append(processCriteria.getAssignee());
            processCriteria.setStatus(null);
        }
        // Since we want the whole status count map regardless of the status filter and assignee filter being passed
        processCriteria.setAssignee(null);
        processCriteria.setStatus(null);
        
        List<HashMap<String, Object>> bpaCitizenStatusCountMap = new ArrayList<HashMap<String,Object>>();
        List<String> roles = requestInfo.getUserInfo().getRoles().stream().map(Role::getCode).collect(Collectors.toList());
        
         String moduleName = processCriteria.getModuleName();
			/*
			 * SAN-920: Commenting out this code as Module name will now be passed for FSM
			 * if(ObjectUtils.isEmpty(processCriteria.getModuleName()) &&
			 * !ObjectUtils.isEmpty(processCriteria.getBusinessService()) &&
			 * (processCriteria.getBusinessService().contains("FSM") ||
			 * processCriteria.getBusinessService().contains("FSM_VEHICLE_TRIP"))){
			 * processCriteria.setModuleName(processCriteria.getBusinessService().get(0)); }
			 */
        List<HashMap<String, Object>> statusCountMap = workflowService.getProcessStatusCount(requestInfo, processCriteria);
        processCriteria.setModuleName(moduleName);
        processCriteria.setStatus(inputStatuses);
        processCriteria.setAssignee(assigneeUuid.toString());
        List<String> businessServiceName = processCriteria.getBusinessService();
        List<Inbox> inboxes = new ArrayList<Inbox>();
        InboxResponse response = new InboxResponse();
        JSONArray businessObjects = null;
        // Map<String,String> srvMap = (Map<String, String>) config.getServiceSearchMapping().get(businessServiceName.get(0));
        Map<String, String> srvMap = fetchAppropriateServiceMap(businessServiceName,moduleName);
        if (CollectionUtils.isEmpty(businessServiceName)) {
            throw new CustomException(ErrorConstants.MODULE_SEARCH_INVLAID, "Bussiness Service is mandatory for module search");
        }

        Map<String, Long> businessServiceSlaMap = new HashMap<>();

    boolean isNdcFlag = criteria.getProcessSearchCriteria().getModuleName().equalsIgnoreCase(NDC_MODULE);
    String moduleNm = criteria.getProcessSearchCriteria().getModuleName();
    boolean isPetFlag = "pet-service".equalsIgnoreCase(moduleNm);
    boolean isAdvFlag = "advandhoarding-services".equalsIgnoreCase(moduleNm);
    boolean isNocFlag = "noc-service".equalsIgnoreCase(moduleNm);
    boolean isChbFlag = "CHB".equalsIgnoreCase(moduleNm);

    if(isNdcFlag || isPetFlag || isAdvFlag || isNocFlag || isChbFlag){
            moduleSearchCriteria.put("tenantId", criteria.getTenantId());
            moduleSearchCriteria.put("offset", criteria.getOffset());
            moduleSearchCriteria.put("limit", criteria.getLimit());
        }

        if (!CollectionUtils.isEmpty(moduleSearchCriteria)) {
            moduleSearchCriteria.put("tenantId", criteria.getTenantId());
            moduleSearchCriteria.put("offset", criteria.getOffset());
            moduleSearchCriteria.put("limit", criteria.getLimit());
            List<BusinessService> bussinessSrvs = new ArrayList<BusinessService>();
            for (String businessSrv : businessServiceName) {
                BusinessService businessService = workflowService.getBusinessService(criteria.getTenantId(), requestInfo,
                        businessSrv);
                bussinessSrvs.add(businessService);
                businessServiceSlaMap.put(businessService.getBusinessService(),businessService.getBusinessServiceSla());
            }
            HashMap<String, String> StatusIdNameMap = workflowService.getActionableStatusesForRole(requestInfo, bussinessSrvs,
                    processCriteria);

        if(isNdcFlag) {
                List<String> matchingIds = StatusIdNameMap.entrySet().stream()
                        .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList());
                if(!(moduleSearchCriteria.containsKey("wfStatus") && moduleSearchCriteria.get("wfStatus") != null) && !ObjectUtils.isEmpty(matchingIds))
                moduleSearchCriteria.put("wfStatus", matchingIds);
            }
//            if (isNocFlag {
//                List<String> matchingIdsNoc = StatusIdNameMap.entrySet().stream()
//                        .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
//                        .map(Map.Entry::getKey)
//                        .collect(Collectors.toList());
//                if (!ObjectUtils.isEmpty(matchingIdsNoc)) moduleSearchCriteria.put("status", matchingIdsNoc);
//            }
//            if (isAdvFlag) {
//                List<String> matchingIdsAdv = StatusIdNameMap.entrySet().stream()
//                        .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
//                        .map(Map.Entry::getKey)
//                        .collect(Collectors.toList());
//                if (!ObjectUtils.isEmpty(matchingIdsAdv)) moduleSearchCriteria.put("status", matchingIdsAdv);
//            }
//            if (isPetFlag) {
//                List<String> matchingIdsPet = StatusIdNameMap.entrySet().stream()
//                        .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
//                        .map(Map.Entry::getKey) // ✅ this gives UUIDs
//                        .collect(Collectors.toList());
//
//                // Always use `status` with UUIDs
//                if (!ObjectUtils.isEmpty(matchingIdsPet)) {
//                    moduleSearchCriteria.put("status", matchingIdsPet);
//                } else {
//                    // If no status provided, put all UUIDs
//                    moduleSearchCriteria.put("status", new ArrayList<>(StatusIdNameMap.keySet()));
//                }
//
//            }

            String applicationStatusParam = srvMap.get("applsStatusParam");
            String businessIdParam = srvMap.get("businessIdProperty");
            if (StringUtils.isEmpty(applicationStatusParam)) {
                applicationStatusParam = "applicationStatus";
            }
            List<String> crtieriaStatuses = new ArrayList<String>();
            // if(!CollectionUtils.isEmpty((Collection<String>) moduleSearchCriteria.get(applicationStatusParam))) {
            // //crtieriaStatuses = (List<String>) moduleSearchCriteria.get(applicationStatusParam);
            // }else {
            if (StatusIdNameMap.values().size() > 0) {
                if(processCriteria.getModuleName().equals(SWACH) && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                	List<String> statuses = new ArrayList<String>();
                	processCriteria.getStatus().forEach(status -> {
                        statuses.add(status);
                    });
                	moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if(processCriteria.getModuleName().equals(PGR) && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                	List<String> statuses = new ArrayList<String>();
                	processCriteria.getStatus().forEach(status -> {
                        statuses.add(status);
                    });
                	moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if (processCriteria.getModuleName().equals("pet-service") && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    List<String> statuses = new ArrayList<>();
                    processCriteria.getStatus().forEach(status -> {
                        // For PET, we directly use the status values as-is (instead of looking them up in StatusIdNameMap)
                        statuses.add(status);
                    });
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if (processCriteria.getModuleName().equals("advandhoarding-services") && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    List<String> statuses = new ArrayList<>();
                    processCriteria.getStatus().forEach(status -> {
                        // For PET, we directly use the status values as-is (instead of looking them up in StatusIdNameMap)
                        statuses.add(status);
                    });
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if (processCriteria.getModuleName().equals("noc-service") && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    List<String> statuses = new ArrayList<>();
                    processCriteria.getStatus().forEach(status -> {
                        // For PET, we directly use the status values as-is (instead of looking them up in StatusIdNameMap)
                        statuses.add(status);
                    });
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if (processCriteria.getModuleName().equals("CHB") && !CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    List<String> statuses = new ArrayList<>();
                    processCriteria.getStatus().forEach(status -> {
                        // For CHB, we directly use the status values as-is (instead of looking them up in StatusIdNameMap)
                        statuses.add(status);
                    });
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }
                else if (!CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    List<String> statuses = new ArrayList<String>();
                    processCriteria.getStatus().forEach(status -> {
                        statuses.add(StatusIdNameMap.get(status));
                    });
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
                }

                else {
                    moduleSearchCriteria.put(applicationStatusParam,
                            StringUtils.arrayToDelimitedString(StatusIdNameMap.values().toArray(), ","));
                }
            }
            
            Map<String, List<String>> tenantAndApplnNumbersMap = new HashMap<>();
            if(processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA) && roles.contains(BpaConstants.CITIZEN)) {
                List<Map<String, String>> tenantWiseApplns = bpaInboxFilterService.fetchTenantWiseApplicationNumbersForCitizenInboxFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (moduleSearchCriteria == null || moduleSearchCriteria.isEmpty()) {
                    moduleSearchCriteria = new HashMap<>();
                    moduleSearchCriteria.put(MOBILE_NUMBER_PARAM, requestInfo.getUserInfo().getMobileNumber());
                    criteria.setModuleSearchCriteria(moduleSearchCriteria);
                } 
                for(Map<String, String> tenantAppln : tenantWiseApplns) {
                    String tenant = tenantAppln.get("tenantid");
                    String applnNo = tenantAppln.get("applicationno");
                    if(tenantAndApplnNumbersMap.containsKey(tenant)) {
                        List<String> applnNos = tenantAndApplnNumbersMap.get(tenant);
                        applnNos.add(applnNo);
                        tenantAndApplnNumbersMap.put(tenant, applnNos);
                    } else {
                        List<String> l = new ArrayList<>();
                        l.add(applnNo);
                        tenantAndApplnNumbersMap.put(tenant, l);
                    }
                }
                String inputTenantID = processCriteria.getTenantId();
                List<String> inputBusinessIds = processCriteria.getBusinessIds();
                List<String> inputStatus = processCriteria.getStatus();
                if(!StatusIdNameMap.isEmpty())
                    processCriteria
                            .setStatus(StatusIdNameMap.entrySet().stream().map(Map.Entry::getKey).collect(Collectors.toList()));
                for(Map.Entry<String, List<String>> t : tenantAndApplnNumbersMap.entrySet()) {
                    processCriteria.setTenantId(t.getKey());
                    processCriteria.setBusinessIds(t.getValue());
                    List<HashMap<String, Object>> tenantWiseStatusCount = workflowService.getProcessStatusCount(requestInfo, processCriteria);
                    if(bpaCitizenStatusCountMap.isEmpty()) {
                        bpaCitizenStatusCountMap.addAll(tenantWiseStatusCount);
                    } else {
                        for (HashMap<String, Object> tenantStatusMap : tenantWiseStatusCount) {
                            for (HashMap<String, Object> bpaStatusMap : bpaCitizenStatusCountMap) {
                                if (bpaStatusMap.containsValue(tenantStatusMap.get(STATUS_ID))) {
                                    bpaStatusMap.put(COUNT, Integer.parseInt(String.valueOf(bpaStatusMap.get(COUNT)))
                                            + Integer.parseInt(String.valueOf(tenantStatusMap.get(COUNT))));
                                }
                            }
                        }
                    }
                }
                statusCountMap = bpaCitizenStatusCountMap;
                processCriteria.setTenantId(inputTenantID);
                processCriteria.setBusinessIds(inputBusinessIds);
                processCriteria.setStatus(inputStatus);
            }
            
            /*
             * In the WF statuscount API, locality based fileter is not supported.
             * To support status wise count based on locality, with status and locality API
             * is called and those count will be set in statuscount response.
             */
            if(processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA)) {
                if(moduleSearchCriteria.get(LOCALITY_PARAM) != null) {
                    for(Map<String, Object> statusWiseCount : statusCountMap) {
                        List<String> statusList = new ArrayList<>();
                        statusList.add(String.valueOf(statusWiseCount.get(STATUS_ID)));
                        criteria.getProcessSearchCriteria().setStatus(statusList);
                        Integer count = bpaInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                        if(count == 0) {
                            statusWiseCount.clear();
                        } else {
                            statusWiseCount.put(COUNT, count); 
                        }
                    }
                    criteria.getProcessSearchCriteria().setStatus(inputStatuses);
                }
                if(!statusCountMap.isEmpty()) {
                    List<HashMap<String, Object>> bpaInboxStatusCountMap = new ArrayList<>();
                    for (HashMap<String, Object> bpaLoclalityStatusCount : statusCountMap) {
                        if (!bpaLoclalityStatusCount.isEmpty())
                            bpaInboxStatusCountMap.add(bpaLoclalityStatusCount);
                    }
                    statusCountMap = bpaInboxStatusCountMap;
                }
            }

            // }
            // Redirect request to searcher in case of PT to fetch acknowledgement IDS
            Boolean isSearchResultEmpty = false;
            List<String> businessKeys = new ArrayList<>();
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PT)) {
                totalCount = ptInboxFilterService.fetchAcknowledgementIdsCountFromSearcher(criteria, StatusIdNameMap,
                        requestInfo);
                List<String> acknowledgementNumbers = ptInboxFilterService.fetchAcknowledgementIdsFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(acknowledgementNumbers)) {
                    moduleSearchCriteria.put(ACKNOWLEDGEMENT_IDS_PARAM, acknowledgementNumbers);
                    businessKeys.addAll(acknowledgementNumbers);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && ( processCriteria.getModuleName().equals(TL)
                    || processCriteria.getModuleName().equals(BPAREG))) {
                totalCount = tlInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = tlInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(APPLICATION_NUMBER_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(TLConstants.STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            List<String> inputLocalities = new ArrayList<>();
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && (processCriteria.getModuleName().equals(PGR))) {
                totalCount = pgrInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = pgrInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if(moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM)) {
                	String pgrLocality = (String) moduleSearchCriteria.get(PGR_LOCALITY_PARAM);

                    if (pgrLocality != null && !pgrLocality.trim().isEmpty()) {
                        inputLocalities = Arrays.stream(pgrLocality.trim().split("\\s*,\\s*"))
                                                .filter(s -> !s.isEmpty()) // filter out empty strings
                                                .collect(Collectors.toList());
                    }
                }
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(PGRANDSWACH_APPLICATION_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(TLConstants.STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && (processCriteria.getModuleName().equals(SWACH))) {
                totalCount = swachInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = swachInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if(moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM)) {
                	String swachLocality = (String) moduleSearchCriteria.get(PGR_LOCALITY_PARAM);

                    if (swachLocality != null && !swachLocality.trim().isEmpty()) {
                        inputLocalities = Arrays.stream(swachLocality.trim().split("\\s*,\\s*"))
                                                .filter(s -> !s.isEmpty()) // filter out empty strings
                                                .collect(Collectors.toList());
                    }
                }
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(PGRANDSWACH_APPLICATION_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(TLConstants.STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

           //TODO as on now this does not seem to be required, hence commenting the code
           /* if (!ObjectUtils.isEmpty(processCriteria.getModuleName())
					&& processCriteria.getModuleName().equalsIgnoreCase(FSMConstants.FSM_MODULE)) {

                totalCount = fsmInboxFilter.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo, dsoId);
            }*/
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA)) {
                totalCount = bpaInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = bpaInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(BPA_APPLICATION_NUMBER_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }
            
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(NDC_MODULE)) {
                totalCount = ndcInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = ndcInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(NDC_APPLICATION_NO_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
//                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && isPetFlag) {
                // If neither id nor applicationNumber provided to searcher, derive applicationNumbers from WF first
                totalCount = petInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = petInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    String applNosParam = srvMap.get("applNosParam");
                    if (StringUtils.isEmpty(applNosParam)) applNosParam = "applicationNumber";
                    moduleSearchCriteria.put(applNosParam, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && isAdvFlag) {
                totalCount = advInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = advInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    String applNosParam = srvMap.get("applNosParam");
                    if (StringUtils.isEmpty(applNosParam)) applNosParam = "applicationNumber"; // fallback
                    moduleSearchCriteria.put(applNosParam, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

        if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
            && (isNocFlag)) {
                totalCount = nocInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = nocInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    String applNosParam = srvMap.get("applNosParam");
                    if (StringUtils.isEmpty(applNosParam)) applNosParam = "applicationNo"; // fallback for NOC
                    moduleSearchCriteria.put(applNosParam, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && isChbFlag) {
                totalCount = chbInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> applicationNumbers = chbInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    String applNosParam = srvMap.get("applNosParam");
                    moduleSearchCriteria.put(applNosParam, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            List<Map<String,Object>> result = new ArrayList<>();
            Map<String, Object> businessMapWS = new LinkedHashMap<>();
            // Redirect request to ElasticSearch in case of WS and SW to fetch data
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && (processCriteria.getModuleName().equals(WS)
                    || processCriteria.getModuleName().equals(SW))){
                JsonNode responseNode = null;
                Map<String, Object> finalResult = new HashMap<>();

                try {
                    responseNode = new ObjectMapper().convertValue(elasticSearchRepository.elasticSearchApplications(criteria, (List<String>) null), JsonNode.class);
                    JsonNode output = responseNode.get(ELASTICSEARCH_HIT_KEY).get(ELASTICSEARCH_HIT_KEY);
                    //Throw exception for no returned result
//                    if(output.size()==0){
//                        throw new CustomException("NO_DATA", "No logs data for the given user with the provided search criteria");
//                    }
                    totalCount = responseNode.get(ELASTICSEARCH_HIT_KEY).get("total").intValue();

                    List<String> userIds = new ArrayList<>();
                    if (!isNull(output) && output.isArray()) {
                        for (JsonNode objectnode : output) {
                            Map<String, Object> data = new HashMap<>();
                            data.put("Data", objectnode.get("_source").get("Data"));

                            Long applicationServiceSla = getApplicationServiceSla(businessServiceSlaMap, data.get("Data"));
                            data.put("serviceSLA", applicationServiceSla);
                            result.add(data);
                        }
                    }
                } catch (HttpClientErrorException e) {
                    log.error("client error while searching ES : " + e.getMessage());
                    throw new CustomException("ELASTICSEARCH_ERROR", "client error while searching ES : \" + e.getMessage()");
                }
            }

            //for street vending
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(SV_SERVICES)) {

                List<String> applicationNumbers = StreetVendingInboxFilterService.fetchApplicationIdsFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(SV_APPLICATION_NUMBER_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    if(moduleSearchCriteria.containsKey(APPLICATION_STATUS)) {
                        moduleSearchCriteria.put(STATUS_PARAM, moduleSearchCriteria.get(APPLICATION_STATUS));
                    }
                } else {
                    isSearchResultEmpty = true;
                }
            }

            // for pet service
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PTR)) {

                List<String> applicationNumbers = ptrInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(ACKNOWLEDGEMENT_IDS_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }

            // for asset service
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(ASSET)) {

                List<String> applicationNumbers = assetInboxFilterService.fetchApplicationNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(ACKNOWLEDGEMENT_IDS_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    // moduleSearchCriteria.remove(LOCALITY_PARAM);
                    // moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
            }
            // fetching total count and application numbers from searcher for pgr ai service
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PGRAiConstants.PGR_MODULE)) {

                totalCount = pgrAiInboxFilterService.fetchApplicationIdsCountFromSearcher(criteria, StatusIdNameMap,
                        requestInfo);
                List<String> applicationNumbers = pgrAiInboxFilterService.fetchApplicationIdsFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    businessKeys.addAll(applicationNumbers);
                }
            }

            // Redirect request to searcher in case of WS to fetch acknowledgement IDS
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(BS_WS_MODULENAME)
            		&& flag==1) {
            	processCriteria.setModuleName(BS_WS);
                totalCount = billInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap,
                        requestInfo);
                Map<String, List<String>> map = billInboxFilterService.fetchConsumerNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                List<String> consumerCodes = map.get("consumerCodes");
                List<String> amendmentIds = map.get("amendmentIds");
                if (!CollectionUtils.isEmpty(consumerCodes)) {
                    moduleSearchCriteria.put(BS_CONSUMER_NO_PARAM, consumerCodes);
                    businessKeys.addAll(amendmentIds);
                    moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, "WS");
                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(ASSIGNEE_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
                moduleSearchCriteria.put("isPropertyDetailsRequired", true);
                processCriteria.setModuleName(BS_WS_MODULENAME);
            }

            // Redirect request to searcher in case of SW to fetch acknowledgement IDS
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(BS_SW_MODULENAME)
            		&& flag==2) {
            	processCriteria.setModuleName(BS_SW);
                totalCount = billInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap,
                        requestInfo);
                Map<String, List<String>> map = billInboxFilterService.fetchConsumerNumbersFromSearcher(criteria,
                        StatusIdNameMap, requestInfo);
                List<String> consumerCodes = map.get("consumerCodes");
                List<String> amendmentIds = map.get("amendmentIds");
                if (!CollectionUtils.isEmpty(consumerCodes)) {
                    moduleSearchCriteria.put(BS_CONSUMER_NO_PARAM, consumerCodes);
                    businessKeys.addAll(amendmentIds);
                    moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, "SW");
                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(ASSIGNEE_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else {
                    isSearchResultEmpty = true;
                }
                moduleSearchCriteria.put("isPropertyDetailsRequired", true);
                processCriteria.setModuleName(BS_SW_MODULENAME);
            }
            /*
             * if(!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PT)){ Boolean
             * isMobileNumberPresent = false; if(moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM)){ isMobileNumberPresent =
             * true; } Boolean isUserPresentForGivenMobileNumber = false; if(isMobileNumberPresent) { String tenantId =
             * criteria.getTenantId(); String mobileNumber = (String) moduleSearchCriteria.get(MOBILE_NUMBER_PARAM); String
             * userUUID = fetchUserUUID(mobileNumber, requestInfo, tenantId); isUserPresentForGivenMobileNumber =
             * ObjectUtils.isEmpty(userUUID) ? true : false; } if(isMobileNumberPresent && isUserPresentForGivenMobileNumber){
             * isSearchResultEmpty = true; } if(!isSearchResultEmpty){ Object result = null; Map<String, Object> searcherRequest =
             * new HashMap<>(); Map<String, Object> searchCriteria = new HashMap<>();
             * searchCriteria.put(TENANT_ID_PARAM,criteria.getTenantId()); // Accomodating module search criteria in searcher
             * request if(moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM)){ searchCriteria.put(MOBILE_NUMBER_PARAM,
             * moduleSearchCriteria.get(MOBILE_NUMBER_PARAM)); } if(moduleSearchCriteria.containsKey(LOCALITY_PARAM)){
             * searchCriteria.put(LOCALITY_PARAM, moduleSearchCriteria.get(LOCALITY_PARAM)); }
             * if(moduleSearchCriteria.containsKey(PROPERTY_ID_PARAM)){ searchCriteria.put(PROPERTY_ID_PARAM,
             * moduleSearchCriteria.get(PROPERTY_ID_PARAM)); } if(moduleSearchCriteria.containsKey(APPLICATION_NUMBER_PARAM)) {
             * searchCriteria.put(APPLICATION_NUMBER_PARAM, moduleSearchCriteria.get(APPLICATION_NUMBER_PARAM)); } // Accomodating
             * process search criteria in searcher request if(!ObjectUtils.isEmpty(processCriteria.getAssignee())){
             * searchCriteria.put(ASSIGNEE_PARAM, processCriteria.getAssignee()); }
             * if(!ObjectUtils.isEmpty(processCriteria.getStatus())){ searchCriteria.put(STATUS_PARAM,
             * processCriteria.getStatus()); }else{ if(StatusIdNameMap.values().size() > 0) {
             * if(CollectionUtils.isEmpty(processCriteria.getStatus())) { searchCriteria.put(STATUS_PARAM,
             * StatusIdNameMap.keySet()); } } } // Paginating searcher results searchCriteria.put(OFFSET_PARAM,
             * criteria.getOffset()); searchCriteria.put(NO_OF_RECORDS_PARAM, criteria.getLimit());
             * searcherRequest.put(REQUESTINFO_PARAM, requestInfo); searcherRequest.put(SEARCH_CRITERIA_PARAM, searchCriteria);
             * result = restTemplate.postForObject(PT_INBOX_SEARCHER_URL, searcherRequest, Map.class); List<String>
             * acknowledgementNumbers = JsonPath.read(result, "$.Properties.*.acknowldgementnumber");
             * if(!CollectionUtils.isEmpty(acknowledgementNumbers)) { moduleSearchCriteria.put(ACKNOWLEDGEMENT_IDS_PARAM,
             * acknowledgementNumbers); moduleSearchCriteria.remove(OFFSET_PARAM); moduleSearchCriteria.remove(LIMIT_PARAM);
             * }else{ isSearchResultEmpty = true; } } }
             */
            businessObjects = new JSONArray();
            //Search module specific data from respective modules. Works for all modules except WS and SW
            if (!isSearchResultEmpty && !(processCriteria.getModuleName().equals(SW) || processCriteria.getModuleName().equals(WS))) {
                businessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(),
                        requestInfo, srvMap);
                //Specifically handle for swach/pgr mobileNumber,locality,servCode filters if given
//                if(processCriteria.getModuleName().equalsIgnoreCase(NDC_MODULE)){
//                    businessObjects = filterObjectsBasedOnMobileNumber(moduleSearchCriteria, businessObjects);
//                }
                if (processCriteria.getModuleName().equals(SWACH) || processCriteria.getModuleName().equals(PGR)) {
                	if(moduleSearchCriteria.containsKey(PGR_MOBILE_NUMBER_PARAM) || moduleSearchCriteria.containsKey(PGR_SERVICECODE_PARAM) || moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM)) {
                		JSONArray filtered = new JSONArray();

                        String inputMobileNumber = moduleSearchCriteria.containsKey(PGR_MOBILE_NUMBER_PARAM)
                                ? (String) moduleSearchCriteria.get(PGR_MOBILE_NUMBER_PARAM)
                                : null;

                        List<String> inputServiceCodes = new ArrayList<>();
                        if (moduleSearchCriteria.containsKey(PGR_SERVICECODE_PARAM)) {
                            String serviceCodesStr = (String) moduleSearchCriteria.get(PGR_SERVICECODE_PARAM);
                            if (serviceCodesStr != null && !serviceCodesStr.trim().isEmpty()) {
                                inputServiceCodes = Arrays.asList(serviceCodesStr.split("\\s*,\\s*")); // Trim each
                            }
                        }

                        for (Object obj : businessObjects) {
                            JSONObject json = (JSONObject) obj;
                            JSONObject serviceObj = json.optJSONObject(PGR_APPLICATION_NUMBER_PARAM);
                            if (serviceObj == null) continue;

                            boolean matches = true;
                            if (inputMobileNumber != null && !inputMobileNumber.isEmpty()) {
                                JSONObject citizenObj = serviceObj.optJSONObject(PGR_CITIZEN_PARAM);
                                String mobile = citizenObj != null ? citizenObj.optString(PGR_MOBILE_NUMBER_PARAM) : null;
                                if (!inputMobileNumber.equals(mobile)) {
                                    matches = false;
                                }
                            }

                            if (!inputServiceCodes.isEmpty()) {
                                String serviceCode = serviceObj.optString(PGR_SERVICECODE_PARAM);
                                if (!inputServiceCodes.contains(serviceCode)) {
                                    matches = false;
                                }
                            }

                            if (!inputLocalities.isEmpty()) {
                                JSONObject addressObj = serviceObj.optJSONObject(PGR_ADDRESS_PARAM);
                                JSONObject localityObj = addressObj != null ? addressObj.optJSONObject(PGR_LOCALITY_PARAM) : null;
                                String localityCode = localityObj != null ? localityObj.optString(PGR_ADDRESSCODE_PARAM) : null;
                                if (!inputLocalities.contains(localityCode)) {
                                    matches = false;
                                }
                            }

                            if (matches) {
                                filtered.put(json);
                            }
                        }
                        businessObjects = filtered; //add all filtered finally
                	}
                }
            }
            Map<String, Object> businessMap = StreamSupport.stream(businessObjects.spliterator(), false)
            	    .collect(Collectors.toMap(
            	        s1 -> {
            	            JSONObject json = (JSONObject) s1;
            	            if ("service".equals(businessIdParam)) {
            	                // Only dig inside the nested service object if businessIdParam is 'service'
            	                JSONObject serviceObj = (JSONObject) json.get("service");
            	                return serviceObj.get("serviceRequestId").toString();
            	            } else {
            	                return json.get(businessIdParam).toString();
            	            }
            	        },
            	        s1 -> s1,
            	        (e1, e2) -> e1, // In case of duplicate keys, keep the first
            	        LinkedHashMap::new // Maintain insertion order
            	    ));
            	ArrayList businessIds = new ArrayList();
            if(processCriteria.getModuleName().equals("pgr-services") || processCriteria.getModuleName().equals("swach-reform")) {
            	for (Object obj : businessObjects) {
            	    JSONObject jsonObject = (JSONObject) obj;
            	    JSONObject serviceObject = jsonObject.optJSONObject("service");

            	    if (serviceObject != null && serviceObject.has("serviceRequestId")) {
            	        String serviceRequestId = serviceObject.optString("serviceRequestId");
            	        if (serviceRequestId != null && !serviceRequestId.isEmpty()) {
            	            businessIds.add(serviceRequestId);
            	        }
            	    }
            	}
            }
            else {
            	businessIds.addAll(businessMap.keySet());
            }
            processCriteria.setBusinessIds(businessIds);
            // processCriteria.setOffset(criteria.getOffset());
            // processCriteria.setLimit(criteria.getLimit());
            processCriteria.setIsProcessCountCall(false);

	    String businessService;
	    Map<String, String> srvSearchMap;
	    JSONArray serviceSearchObject = new JSONArray();
	    Map<String, Object> serviceSearchMap ;
        String businessServiceForAmendment = businessServiceName.get(0);
        Boolean isBusinessServiceWSOrSW = businessServiceForAmendment.equalsIgnoreCase(BS_WS_SERVICE) || businessServiceForAmendment.equalsIgnoreCase(BS_SW_SERVICE);
	    if (businessObjects != null && businessObjects.length() > 0
                && isBusinessServiceWSOrSW) {
		businessService = moduleSearchCriteria.get(BS_BUSINESS_SERVICE_PARAM).toString();
		// businessObjects.getJSONObject(0).getString("businessService");
		srvSearchMap = fetchAppropriateServiceSearchMap(businessService, moduleName);
		if (!isSearchResultEmpty && (processCriteria.getModuleName().equalsIgnoreCase(BS_WS_MODULENAME) || processCriteria.getModuleName().equalsIgnoreCase(BS_SW_MODULENAME))) {
			moduleSearchCriteria.put(srvSearchMap.get("consumerCodeParam"), moduleSearchCriteria.get(BS_CONSUMER_NO_PARAM));
			moduleSearchCriteria.remove(BS_CONSUMER_NO_PARAM);
			moduleSearchCriteria.remove(BS_BUSINESS_SERVICE_PARAM);
			moduleSearchCriteria.remove(BS_APPLICATION_NUMBER_PARAM);
			moduleSearchCriteria.remove("status");
			moduleSearchCriteria.put("searchType", "CONNECTION");
			serviceSearchObject = fetchModuleSearchObjects(moduleSearchCriteria, businessServiceName,
					criteria.getTenantId(), requestInfo, srvSearchMap);
			moduleSearchCriteria.remove("searchType");
			moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, businessService);
		}
				
	    }
	    serviceSearchMap = StreamSupport.stream(serviceSearchObject.spliterator(), false)
	         .collect(Collectors.toMap(s1 -> ((JSONObject) s1).get("connectionNo").toString(),
	                s1 -> s1, (e1, e2) -> e1, LinkedHashMap::new));
			 
	    ProcessInstanceResponse processInstanceResponse;
            /*
             * In BPA, the stakeholder can able to submit applications for multiple cities
             * and in the single inbox all cities submitted applications need to show
             */
            if(processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA) && roles.contains(BpaConstants.CITIZEN)) {
                Map<String, List<String>> tenantAndApplnNoForProcessInstance = new HashMap<>();
                for(Object businessId : businessIds) {
                    for (Map.Entry<String, List<String>> tenantAppln : tenantAndApplnNumbersMap.entrySet()) {
                        String tenantId = tenantAppln.getKey();
                        if (tenantAppln.getValue().contains(businessId)
                                && tenantAndApplnNoForProcessInstance.containsKey(tenantId)) {
                              List<String> applnNos = tenantAndApplnNoForProcessInstance.get(tenantId);
                              applnNos.add(String.valueOf(businessId));
                              tenantAndApplnNoForProcessInstance.put(tenantId, applnNos);
                          } else {
                              List<String> businesIds = new ArrayList<>();
                              businesIds.add(String.valueOf(businessId));
                              tenantAndApplnNoForProcessInstance.put(tenantId, businesIds);
                          }
                      }
                }
                ProcessInstanceResponse processInstanceRes = new ProcessInstanceResponse();
                for(Map.Entry<String, List<String>> appln : tenantAndApplnNoForProcessInstance.entrySet()) {
                    processCriteria.setTenantId(appln.getKey());
                    processCriteria.setBusinessIds(appln.getValue());
                    ProcessInstanceResponse processInstance = workflowService.getProcessInstance(processCriteria, requestInfo);
                    processInstanceRes.setResponseInfo(processInstance.getResponseInfo());
                    if(processInstanceRes.getProcessInstances() == null)
                        processInstanceRes.setProcessInstances(processInstance.getProcessInstances());
                    else
                        processInstanceRes.getProcessInstances().addAll(processInstance.getProcessInstances());
                }
                processInstanceResponse = processInstanceRes;
            } else {
            	if(processCriteria.getModuleName().equals(SWACH)) { //if needed for all modules, remove comment
            		List<String> desiredStatuses = processCriteria.getStatus();
            		List<String> matchingKeys = StatusIdNameMap.entrySet()
            		    .stream()
            		    .filter(entry -> desiredStatuses.contains(entry.getValue()))
            		    .map(Map.Entry::getKey)
            		    .collect(Collectors.toList());

            		processCriteria.setStatus(matchingKeys);
            		processInstanceResponse = workflowService.getProcessInstance(processCriteria, requestInfo);
            	}
                else {
                    if(isNdcFlag) {
                        List<String> matchingIdsNdc = StatusIdNameMap.entrySet().stream()
                                    .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                                    .map(Map.Entry::getKey)
                                    .collect(Collectors.toList());

                        processCriteria.setStatus(matchingIdsNdc);

                    }
                    if(isPetFlag) {
                        List<String> matchingIdsPet = StatusIdNameMap.entrySet().stream()
                                .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                                .map(Map.Entry::getKey)
                                .collect(Collectors.toList());
                      processCriteria.setStatus(matchingIdsPet);
                    }
                    if(isAdvFlag) {
                        List<String> matchingIdsAdv = StatusIdNameMap.entrySet().stream()
                                .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                                .map(Map.Entry::getKey)
                                .collect(Collectors.toList());
                        processCriteria.setStatus(matchingIdsAdv);
                    }
                    if(isNocFlag) {
                        List<String> matchingIdsNoc = StatusIdNameMap.entrySet().stream()
                                .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                                .map(Map.Entry::getKey)
                                .collect(Collectors.toList());
                        processCriteria.setStatus(matchingIdsNoc);
                    }
                    if(isChbFlag) {
                        List<String> matchingIdsChb = StatusIdNameMap.entrySet().stream()
                                .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                                .map(Map.Entry::getKey)
                                .collect(Collectors.toList());
                        processCriteria.setStatus(matchingIdsChb);
                    }
                    processInstanceResponse = workflowService.getProcessInstance(processCriteria, requestInfo);
            	}
            }
            
            List<ProcessInstance> processInstances = processInstanceResponse.getProcessInstances();

            Map<String, ProcessInstance> processInstanceMap = new HashMap<>();
            if(!CollectionUtils.isEmpty(processInstances)) {
                for (ProcessInstance processInstance : processInstances) {
                    processInstanceMap.put(processInstance.getBusinessId(), processInstance);
                }
            }

            //Adding searched Items in Inbox result object for WS and SW
            if (moduleName.equals(WS) || moduleName.equals(SW)) {
                if (!CollectionUtils.isEmpty(result)) {
                    //Add items in Inbox response in Inbox object
                    result.forEach(res -> {
                        Inbox inbox = new Inbox();
                        JsonNode jsonNode = mapper.convertValue(res.get("Data"), JsonNode.class);
                        JSONObject jsonObject=new JSONObject();
                        jsonObject.put("Data",jsonNode);
                        jsonObject.put("serviceSLA",res.get("serviceSLA"));
                        inbox.setBusinessObject(toMap(jsonObject));
                        inboxes.add(inbox);
                    });
                }
            }
            if (businessObjects.length() > 0 && processInstances.size() > 0) {
                if (CollectionUtils.isEmpty(businessKeys)) {
                    businessMap.keySet().forEach(businessKey -> {
                        if(null != processInstanceMap.get(businessKey)) {
                            if (!isBusinessServiceWSOrSW) {
                            	//For non- Bill Amendment Inbox search
                                Inbox inbox = new Inbox();
                                inbox.setProcessInstance(processInstanceMap.get(businessKey));
                                inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                                inboxes.add(inbox);
                            } else {
                                //When Bill Amendment objects are searched
                                Inbox inbox = new Inbox();
                                inbox.setProcessInstance(processInstanceMap.get(businessKey));
                                inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                                inbox.setServiceObject(toMap(
                                        (JSONObject) serviceSearchMap.get(inbox.getBusinessObject().get("consumerCode"))));
                                inboxes.add(inbox);
                            }
                        }
                    });
                    if (isBusinessServiceWSOrSW)
                  	    totalCount = processInstanceMap.size();
                } else {
                	//For non- Bill Amendment Inbox search
			if (!isBusinessServiceWSOrSW) {
				List<String> filteredBusinessKeys = businessKeys.stream()
					    .filter(key -> processInstanceMap.containsKey(key) && businessMap.containsKey(key))
					    .collect(Collectors.toList()); //returns only non-null objects
				businessKeys = filteredBusinessKeys;
				businessKeys.forEach(businessKey -> {
					Inbox inbox = new Inbox();
					inbox.setProcessInstance(processInstanceMap.get(businessKey));
					inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
					inboxes.add(inbox);
				});
			} else {
			//When Bill Amendment objects are searched
				for (String businessKey : businessKeys) {
					Inbox inbox = new Inbox();

					inbox.setProcessInstance(processInstanceMap.get(businessKey));
					inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
					inbox.setServiceObject(toMap(
							(JSONObject) serviceSearchMap.get(inbox.getBusinessObject().get("consumerCode"))));
					inboxes.add(inbox);
				}
			}
                }
            }
        } else {
            processCriteria.setOffset(criteria.getOffset());
            processCriteria.setLimit(criteria.getLimit());

            ProcessInstanceResponse processInstanceResponse = workflowService.getProcessInstance(processCriteria, requestInfo);
            List<ProcessInstance> processInstances = processInstanceResponse.getProcessInstances();
            HashMap<String, List<String>> businessSrvIdsMap = new HashMap<String, List<String>>();
            Map<String, ProcessInstance> processInstanceMap = processInstances.stream()
                    .collect(Collectors.toMap(ProcessInstance::getBusinessId, Function.identity()));
            moduleSearchCriteria = new HashMap<String, String>();
            if (CollectionUtils.isEmpty(srvMap)) {
                throw new CustomException(ErrorConstants.INVALID_MODULE,
                        "config not found for the businessService : " + businessServiceName);
            }
            String businessIdParam = srvMap.get("businessIdProperty");
            moduleSearchCriteria.put(srvMap.get("applNosParam"),
                    StringUtils.arrayToDelimitedString(processInstanceMap.keySet().toArray(), ","));
            moduleSearchCriteria.put("tenantId", criteria.getTenantId());
            // moduleSearchCriteria.put("offset", criteria.getOffset());
            moduleSearchCriteria.put("limit", -1);
            businessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(), requestInfo,
                    srvMap);
            Map<String, Object> businessMap = StreamSupport.stream(businessObjects.spliterator(), false)
                    .collect(Collectors.toMap(s1 -> ((JSONObject) s1).get(businessIdParam).toString(),
                            s1 -> s1));

            if (businessObjects.length() > 0 && processInstances.size() > 0) {
                processInstanceMap.keySet().forEach(pinstance -> {
                    Inbox inbox = new Inbox();
                    inbox.setProcessInstance(processInstanceMap.get(pinstance));
                    inbox.setBusinessObject(toMap((JSONObject) businessMap.get(pinstance)));
                    inboxes.add(inbox);
                });
            }

        }
        
       // log.info("businessServiceName.contains(FSM_MODULE) ::: " + businessServiceName.contains(FSM_MODULE));
        
		if (!ObjectUtils.isEmpty(processCriteria.getModuleName())
				&& processCriteria.getModuleName().equalsIgnoreCase(FSMConstants.FSM_MODULE)) {

			List<String> applicationStatus = new ArrayList<>();
			applicationStatus.add(WAITING_FOR_DISPOSAL_STATE);
			applicationStatus.add(DISPOSED_STATE);
			List<Map<String, Object>> vehicleResponse = fetchVehicleTripResponse(criteria, requestInfo,applicationStatus);
			BusinessService businessService = workflowService.getBusinessService(criteria.getTenantId(), requestInfo,
					FSM_VEHICLE_TRIP_MODULE);
			//log.info("businessService :::: " + businessService);
			populateStatusCountMap(statusCountMap, vehicleResponse, businessService);

			for (HashMap<String, Object> vTripMap : statusCountMap) {
				if ((WAITING_FOR_DISPOSAL_STATE.equals(vTripMap.get(APPLICATIONSTATUS))
						|| DISPOSED_STATE.equals(vTripMap.get(APPLICATIONSTATUS)))
						&& inputStatuses.contains(vTripMap.get(STATUSID))) {
					totalCount += ((int) vTripMap.get(COUNT));
				}
			}
			List<String> requiredApplications = new ArrayList<>();
			inboxes.forEach(inbox -> {
				ProcessInstance inboxProcessInstance = inbox.getProcessInstance();
				if (null != inboxProcessInstance && null!= inboxProcessInstance.getState()) {
					String appStatus = inboxProcessInstance.getState().getApplicationStatus();
					if (DSO_INPROGRESS_STATE.equals(appStatus) || CITIZEN_FEEDBACK_PENDING_STATE.equals(appStatus)
							|| COMPLETED_STATE.equals(appStatus)) {
						requiredApplications.add(inboxProcessInstance.getBusinessId());
					}
				}
			});
			//log.info("requiredApplications :::: " + requiredApplications);
			
			List<VehicleTripDetail> vehicleTripDetail = fetchVehicleStatusForApplication(requiredApplications,requestInfo,criteria.getTenantId());
			//log.info("vehicleTripDetail :::: " + vehicleTripDetail);			
			inboxes.forEach(inbox -> {
				if (null != inbox && null != inbox.getProcessInstance()
						&& null != inbox.getProcessInstance().getBusinessId()) {
					List<VehicleTripDetail> vehicleTripDetails = vehicleTripDetail.stream()
							.filter(trip -> inbox.getProcessInstance().getBusinessId().equals(trip.getReferenceNo()))
							.collect(Collectors.toList());
					Map<String, Object> vehicleBusinessObject = inbox.getBusinessObject();
					vehicleBusinessObject.put(VEHICLE_LOG, vehicleTripDetails);
				}
			});
			//log.info("CollectionUtils.isEmpty(inboxes) :::: " + CollectionUtils.isEmpty(inboxes));
			if (CollectionUtils.isEmpty(inboxes) && totalCount>0 && !moduleSearchCriteria.containsKey("applicationNos")) {
				inputStatuses = inputStatuses.stream().filter(x -> x != null).collect(Collectors.toList());
				List<String> fsmApplicationList = fetchVehicleStateMap(inputStatuses, requestInfo, criteria.getTenantId(),criteria.getLimit(),criteria.getOffset());
				moduleSearchCriteria.put("applicationNos", fsmApplicationList);
				moduleSearchCriteria.put("applicationStatus", requiredApplications);
//				moduleSearchCriteria.put("offset", criteria.getOffset());
//	            moduleSearchCriteria.put("limit", criteria.getLimit());
				processCriteria.setBusinessIds(fsmApplicationList);
				processCriteria.setStatus(null);
				ProcessInstanceResponse processInstanceResponse = workflowService.getProcessInstance(processCriteria,
						requestInfo);
				//log.info("processInstanceResponse :::: " + processInstanceResponse);
				List<ProcessInstance> vehicleProcessInstances = processInstanceResponse.getProcessInstances();
				Map<String, ProcessInstance> vehicleProcessInstanceMap = vehicleProcessInstances.stream()
						.collect(Collectors.toMap(ProcessInstance::getBusinessId, Function.identity()));
				JSONArray vehicleBusinessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName,
						criteria.getTenantId(), requestInfo, srvMap);
				String businessIdParam = srvMap.get("businessIdProperty");
				//log.info("businessIdParam :::: " + businessIdParam);
				Map<String, Object> vehicleBusinessMap = StreamSupport
						.stream(vehicleBusinessObjects.spliterator(), false)
						.collect(Collectors.toMap(s1 -> ((JSONObject) s1).get(businessIdParam).toString(), s1 -> s1,
								(e1, e2) -> e1, LinkedHashMap::new));
				//log.info("businessIdParam :::: " + businessIdParam);
				//log.info("vehicleBusinessObjects.length() :::: " + vehicleBusinessObjects.length());
				//log.info("vehicleProcessInstances.size() :::: " + vehicleProcessInstances.size());
				
				if (vehicleBusinessObjects.length() > 0 && vehicleProcessInstances.size() > 0) {
					//log.info("vehicleBusinessObjects.length() :::: " + vehicleBusinessObjects.length());
					//log.info("vehicleProcessInstances.size() :::: " + vehicleProcessInstances.size());
					fsmApplicationList.forEach(busiessKey -> {
//						if(null != vehicleProcessInstanceMap.get(busiessKey)) {
							Inbox inbox = new Inbox();
							inbox.setProcessInstance(vehicleProcessInstanceMap.get(busiessKey));
							inbox.setBusinessObject(toMap((JSONObject) vehicleBusinessMap.get(busiessKey)));
							inboxes.add(inbox);	
//						}
					});
				}
			}
			
			//SAN-920: Logic for aggregating the statuses of Pay now and post pay application
			List<HashMap<String, Object>> aggregateStatusCountMap = new ArrayList<>();
			for (HashMap<String, Object> statusCountEntry : statusCountMap) {
				 HashMap<String, Object> tempStatusMap = new HashMap<>();
				 boolean matchFound=false;
					for (HashMap<String, Object> aggrMapInstance : aggregateStatusCountMap) {
	
						String statusMapAppStatus = (String) statusCountEntry.get("applicationstatus");
						String aggrMapAppStatus = (String) aggrMapInstance.get("applicationstatus");
	
	 					if (aggrMapAppStatus.equalsIgnoreCase(statusMapAppStatus)) {
							aggrMapInstance.put(COUNT,
									((Integer) statusCountEntry.get(COUNT) + (Integer) aggrMapInstance.get(COUNT)));
							aggrMapInstance.put(APPLICATIONSTATUS, (String) statusCountEntry.get(APPLICATIONSTATUS));
							aggrMapInstance.put(BUSINESS_SERVICE_PARAM, (String) statusCountEntry.get(BUSINESS_SERVICE_PARAM) + ","
									+ (String) aggrMapInstance.get(BUSINESS_SERVICE_PARAM));
							aggrMapInstance.put(STATUSID, (String) statusCountEntry.get(STATUSID) + ","
									+ (String) aggrMapInstance.get(STATUSID));
							matchFound=true;
							break;
						} else {
							tempStatusMap.put(COUNT, (Integer) statusCountEntry.get(COUNT));
							tempStatusMap.put(APPLICATIONSTATUS, (String) statusCountEntry.get(APPLICATIONSTATUS));
							tempStatusMap.put(BUSINESS_SERVICE_PARAM, (String) statusCountEntry.get(BUSINESS_SERVICE_PARAM));
							tempStatusMap.put(STATUSID, (String) statusCountEntry.get(STATUSID));
							
						}
				 }
					if (ObjectUtils.isEmpty(aggregateStatusCountMap)) {
						aggregateStatusCountMap.add(statusCountEntry);
					} else {
						if (!matchFound) {
							aggregateStatusCountMap.add(tempStatusMap);
						}
					}
			}
			
			statusCountMap=	aggregateStatusCountMap;
			//log.info("removeStatusCountMap:: "+ new Gson().toJson(statusCountMap));

		}
		log.info("statusCountMap size :::: " + statusCountMap.size());
        //This is to get consistent count after filteration of the objects according to the business keys
        if(moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM) && (isAdvFlag || isNdcFlag || isNocFlag || isPetFlag))
        {
            totalCount = inboxes.size();
        }
        response.setTotalCount(totalCount);
        response.setNearingSlaCount(nearingSlaProcessCount);
        response.setStatusMap(statusCountMap);
        response.setItems(inboxes);
        return response;
    }

    private JSONArray filterObjectsBasedOnMobileNumber(HashMap moduleSearchCriteria, JSONArray businessObjects) {
        String inputMobileNumber = moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM)
                ? (String) moduleSearchCriteria.get(MOBILE_NUMBER_PARAM)
                : null;

        JSONArray filtered = new JSONArray();
        if (inputMobileNumber != null && !inputMobileNumber.isEmpty()) {
            for (Object obj : businessObjects) {
                JSONObject json = (JSONObject) obj;
                JSONArray owners = json.getJSONArray(OWNERS);
                if (owners == null) continue;

                boolean matchFound = false;
                for (int i = 0; i < owners.length(); i++) {
                    JSONObject owner = owners.getJSONObject(i);
                    String mobile = owner.optString(MOBILE_NUMBER_PARAM);
                    if (inputMobileNumber.equals(mobile)) {
                        matchFound = true;
                        break;
                    }
                }

                if (matchFound) {
                    filtered.put(json);
                }
            }
            businessObjects = filtered;
        }
        return businessObjects;
    }

    /**
     * @param businessServiceSlaMap
     * @param data -- application object
     * @return
     * Description : Calculate ServiceSLA for each application for WS and SW
     */
    private Long getApplicationServiceSla(Map<String, Long> businessServiceSlaMap, Object data) {

        Long currentDate = System.currentTimeMillis(); //current time
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> properties = mapper.convertValue(data, Map.class);
        Map<String, Object> additionalDetails = (Map<String, Object>) properties.get("additionalDetails");
        if (!ObjectUtils.isEmpty(additionalDetails.get("appCreatedDate")) || !Objects.isNull(additionalDetails.get("appCreatedDate"))) {
            Long createdTime = ((Number) additionalDetails.get("appCreatedDate")).longValue();
            Map<String, Object> history = (LinkedHashMap<String, Object>) ((ArrayList) properties.get("history")).get(0);
            String businessService = (String) history.get("businessService");
            Long businessServiceSLA = businessServiceSlaMap.get(businessService);

            return Long.valueOf(Math.round((businessServiceSLA - (currentDate - createdTime)) / ((double) (24 * 60 * 60 * 1000))));
        }
        return null;
    }

    public List<String> fetchVehicleStateMap(List<String> inputStatuses, RequestInfo requestInfo, String tenantId,Integer limit,Integer offSet) {
		VehicleTripSearchCriteria vehicleTripSearchCriteria = new VehicleTripSearchCriteria();
		vehicleTripSearchCriteria.setApplicationStatus(inputStatuses);
		vehicleTripSearchCriteria.setTenantId(tenantId);
		vehicleTripSearchCriteria.setLimit(limit);
		vehicleTripSearchCriteria.setOffset(offSet);
		StringBuilder url = new StringBuilder(config.getFsmHost());
		url.append( config.getFetchApplicationIds());
		
		Object result = serviceRequestRepository.fetchResult(url, vehicleTripSearchCriteria);
		VehicleCustomResponse response =null;
		try {
			response = mapper.convertValue(result, VehicleCustomResponse.class);
			if(null != response && null != response.getApplicationIdList()) {
				System.out.println("size ::::  "+response.getApplicationIdList().size());;
				return response.getApplicationIdList();
			}
		} catch (IllegalArgumentException e) {
			throw new CustomException(ErrorConstants.PARSING_ERROR, "Failed to parse response of ProcessInstance");
		}
		return new ArrayList<>();
	}
    
    /**
	 * @param requiredApplications
	 * @return
	 * Description : Fetch the vehicle_trip_detail by list of reference no.
	 */
	private List<VehicleTripDetail> fetchVehicleStatusForApplication(List<String> requiredApplications,RequestInfo requestInfo, String tenantId) {
		VehicleTripSearchCriteria vehicleTripSearchCriteria = new VehicleTripSearchCriteria();
		vehicleTripSearchCriteria.setApplicationNos(requiredApplications);
		vehicleTripSearchCriteria.setTenantId(tenantId);
		return fetchVehicleTripDetailsByReferenceNo(vehicleTripSearchCriteria,requestInfo);
	}
	
	public List<VehicleTripDetail> fetchVehicleTripDetailsByReferenceNo(VehicleTripSearchCriteria vehicleTripSearchCriteria, RequestInfo requestInfo) {
		StringBuilder url = new StringBuilder(config.getVehicleHost());
		url.append( config.getVehicleSearchTripPath());
		Object result = serviceRequestRepository.fetchResult(url, vehicleTripSearchCriteria);
		VehicleTripDetailResponse response =null;
		try {
			response = mapper.convertValue(result, VehicleTripDetailResponse.class);
			if(null != response && null != response.getVehicleTripDetail()) {
				System.out.println("size ::::  "+response.getVehicleTripDetail().size());;
				return response.getVehicleTripDetail();
			}
		} catch (IllegalArgumentException e) {
			throw new CustomException(ErrorConstants.PARSING_ERROR, "Failed to parse response of ProcessInstance");
		}
		return new ArrayList<>();
	}


	private void populateStatusCountMap(List<HashMap<String, Object>> statusCountMap,
			List<Map<String, Object>> vehicleResponse, BusinessService businessService) {
		
		if (!CollectionUtils.isEmpty(vehicleResponse) && businessService != null) {
			List<State> appStates = businessService.getStates();

			for (State appState : appStates) {
				
				vehicleResponse.forEach(trip -> {
					
					HashMap<String, Object> vehicleTripStatusMp = new HashMap<>();
					if(trip.get(APPLICATIONSTATUS).equals(appState.getApplicationStatus())) {
						
						vehicleTripStatusMp.put(COUNT, trip.get(COUNT));
						vehicleTripStatusMp.put(APPLICATIONSTATUS, appState.getApplicationStatus());
						vehicleTripStatusMp.put(STATUSID, appState.getUuid());
						vehicleTripStatusMp.put(BUSINESS_SERVICE_PARAM, FSM_VEHICLE_TRIP_MODULE);
					}
					
					if (MapUtils.isNotEmpty(vehicleTripStatusMp))
						statusCountMap.add(vehicleTripStatusMp);
				});
			}
		}
	}
    
    private List<Map<String, Object>> fetchVehicleTripResponse(InboxSearchCriteria criteria, RequestInfo requestInfo,List<String> applicationStatus) {

		VehicleSearchCriteria vehicleTripSearchCriteria = new VehicleSearchCriteria();
		
		vehicleTripSearchCriteria.setApplicationStatus(applicationStatus);

		vehicleTripSearchCriteria.setTenantId(criteria.getTenantId());
		
		List<Map<String, Object>> vehicleResponse = null ;
		VehicleCustomResponse vehicleCustomResponse =  fetchApplicationCount(vehicleTripSearchCriteria, requestInfo);
		if(null != vehicleCustomResponse && null != vehicleCustomResponse.getApplicationStatusCount() ) {
			vehicleResponse =vehicleCustomResponse.getApplicationStatusCount();
		}else {
			vehicleResponse = new ArrayList<Map<String,Object>>();
		}
    	
    	
    	return vehicleResponse;
    }
    
    public VehicleCustomResponse fetchApplicationCount(VehicleSearchCriteria criteria, RequestInfo requestInfo) {
		StringBuilder url = new StringBuilder(config.getVehicleHost());
		url.append( config.getVehicleApplicationStatusCountPath());
		Object result = serviceRequestRepository.fetchResult(url, criteria);
		VehicleCustomResponse resposne =null;
		try {
			resposne = mapper.convertValue(result, VehicleCustomResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException(ErrorConstants.PARSING_ERROR, "Failed to parse response of ProcessInstance");
		}
		return resposne;
	}
    
    /*
     * private String fetchUserUUID(String mobileNumber, RequestInfo requestInfo, String tenantId) { StringBuilder uri = new
     * StringBuilder(); uri.append(userHost).append(userSearchEndpoint); Map<String, Object> userSearchRequest = new HashMap<>();
     * userSearchRequest.put("RequestInfo", requestInfo); userSearchRequest.put("tenantId", tenantId);
     * userSearchRequest.put("userType", "CITIZEN"); userSearchRequest.put("userName", mobileNumber); String uuid = ""; try {
     * Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest); if(null != user) { uuid = JsonPath.read(user,
     * "$.user[0].uuid"); }else { log.error("Service returned null while fetching user for username - " + mobileNumber); }
     * }catch(Exception e) { log.error("Exception while fetching user for username - " + mobileNumber);
     * log.error("Exception trace: ", e); } return uuid; }
     */

    private Map<String, String> fetchAppropriateServiceMap(List<String> businessServiceName,String  moduleName) {
        StringBuilder appropriateKey = new StringBuilder();
        for (String businessServiceKeys : config.getServiceSearchMapping().keySet()) {
            if (businessServiceKeys.contains(businessServiceName.get(0))) {
                appropriateKey.append(businessServiceKeys);
                break;
            }
        }
        if (ObjectUtils.isEmpty(appropriateKey)) {
            throw new CustomException("EG_INBOX_SEARCH_ERROR",
                    "Inbox service is not configured for the provided business services");
        }
        //SAN-920: Added check for enabling multiple business services only for FSM module
      		for (String inputBusinessService : businessServiceName) {
      			if (!FSMConstants.FSM_MODULE.equalsIgnoreCase(moduleName)) {
      				if (!appropriateKey.toString().contains(inputBusinessService)) {
      					throw new CustomException("EG_INBOX_SEARCH_ERROR", "Cross module search is NOT allowed.");
      				}
      			}

      		}
        return config.getServiceSearchMapping().get(appropriateKey.toString());
    }

    private JSONArray fetchModuleObjects(HashMap moduleSearchCriteria, List<String> businessServiceName, String tenantId,
            RequestInfo requestInfo, Map<String, String> srvMap) {
        JSONArray resutls = null;
        
        if (CollectionUtils.isEmpty(srvMap) || StringUtils.isEmpty(srvMap.get("searchPath"))) {
            throw new CustomException(ErrorConstants.INVALID_MODULE_SEARCH_PATH,
                    "search path not configured for the businessService : " + businessServiceName);
        }
        StringBuilder url = new StringBuilder(srvMap.get("searchPath"));
        url.append("?tenantId=").append(tenantId);
       
        Set<String> searchParams = moduleSearchCriteria.keySet();

		searchParams.forEach((param) -> {

			if (!param.equalsIgnoreCase("tenantId")) {

				if (moduleSearchCriteria.get(param) instanceof Collection) {
					url.append("&").append(param).append("=");
					url.append(StringUtils
							.arrayToDelimitedString(((Collection<?>) moduleSearchCriteria.get(param)).toArray(), ","));
				} else if(param.equalsIgnoreCase("appStatus")){
					url.append("&").append("applicationStatus").append("=")
					.append(moduleSearchCriteria.get(param).toString());
				} else if(param.equalsIgnoreCase("consumerNo")){
					url.append("&").append("connectionNumber").append("=")
					.append(moduleSearchCriteria.get(param).toString());
				} else if(null != moduleSearchCriteria.get(param)) {
					url.append("&").append(param).append("=").append(moduleSearchCriteria.get(param).toString());
				}
			}
		});

		log.info("\nfetchModuleObjects URL :::: " + url.toString());
		
        RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
        Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);

        LinkedHashMap responseMap;
        try {
            responseMap = mapper.convertValue(result, LinkedHashMap.class);
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorConstants.PARSING_ERROR, "Failed to parse response of ProcessInstance Count");
        }
        
        
        JSONObject jsonObject = new JSONObject(responseMap);
        
        try {
            resutls = (JSONArray) jsonObject.getJSONArray(srvMap.get("dataRoot"));
        } catch (Exception e) {
            throw new CustomException(ErrorConstants.INVALID_MODULE_DATA,
                    " search api could not find data in dataroot " + srvMap.get("dataRoot"));
        }
        
        
        return resutls;
    }

    public static Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        if (object == null) {
            return map;
        }
        Iterator<String> keysItr = object.keys();
        while (keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if (value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if (value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    public static List<Object> toList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<Object>();
        for (int i = 0; i < array.length(); i++) {
            Object value = array.get(i);
            if (value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if (value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            list.add(value);
        }
        return list;
    }

	
	private Map<String, String> fetchAppropriateServiceSearchMap(String businessServiceName, String moduleName) {
		StringBuilder appropriateKey = new StringBuilder();
		for (String businessServiceKeys : config.getBsServiceSearchMapping().keySet()) {
			if (businessServiceKeys.contains(businessServiceName)) {
				appropriateKey.append(businessServiceKeys);
				break;
			}
		}
		if (ObjectUtils.isEmpty(appropriateKey)) {
			throw new CustomException("EG_INBOX_SEARCH_ERROR",
					"Inbox service is not configured for the provided business services");
		}
		return config.getBsServiceSearchMapping().get(appropriateKey.toString());
	}

	private JSONArray fetchModuleSearchObjects(HashMap moduleSearchCriteria, List<String> businessServiceName,
			String tenantId, RequestInfo requestInfo, Map<String, String> srvMap) {
		JSONArray results = null;

		if (CollectionUtils.isEmpty(srvMap) || StringUtils.isEmpty(srvMap.get("searchPath"))) {
			throw new CustomException(ErrorConstants.INVALID_MODULE_SEARCH_PATH,
					"search path not configured for the businessService : " + businessServiceName);
		}
		StringBuilder url = new StringBuilder(srvMap.get("searchPath"));
		url.append("?tenantId=").append(tenantId);

		Set<String> searchParams = moduleSearchCriteria.keySet();

		searchParams.forEach((param) -> {

			if (!param.equalsIgnoreCase("tenantId")) {
				if (param.equalsIgnoreCase("limit"))
				    return;

				if (moduleSearchCriteria.get(param) instanceof Collection) {
					url.append("&").append(param).append("=");
					url.append(StringUtils
							.arrayToDelimitedString(((Collection<?>) moduleSearchCriteria.get(param)).toArray(), ","));
				} else if (null != moduleSearchCriteria.get(param)) {
					url.append("&").append(param).append("=").append(moduleSearchCriteria.get(param).toString());
				}
			}
		});

		log.info("\nfetchModulSearcheObjects URL :::: " + url.toString());

		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
		Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);

		LinkedHashMap responseMap;
		try {
			responseMap = mapper.convertValue(result, LinkedHashMap.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException(ErrorConstants.PARSING_ERROR, "Failed to parse response of ProcessInstance Count");
		}

		JSONObject jsonObject = new JSONObject(responseMap);

		try {
			results = (JSONArray) jsonObject.getJSONArray(srvMap.get("dataRoot"));
		} catch (Exception e) {
			throw new CustomException(ErrorConstants.INVALID_MODULE_DATA, " search api could not find data in serviceMap " + srvMap.get("dataRoot"));
		}

		return results;
	}
}
