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

import java.lang.reflect.Method;
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
    private ChallanInboxFilterService challanInboxFilterService;

    @Autowired
    private LayoutInboxFilterService  layoutInboxFilterService;

    @Autowired
    private CluInboxFilterService cluInboxFilterService;
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
        Integer flag = 0;
        if (processCriteria.getModuleName().equalsIgnoreCase(BS_WS)) {
            flag = 1;
            processCriteria.setModuleName(BS_WS_MODULENAME);
        } else if (processCriteria.getModuleName().equalsIgnoreCase(BS_SW)) {
            flag = 2;
            processCriteria.setModuleName(BS_SW_MODULENAME);
        }

        Integer totalCount = 0;

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
        } else
            processCriteria.setStatus(null);

        List<HashMap<String, Object>> bpaCitizenStatusCountMap = new ArrayList<>();
        List<String> roles = requestInfo.getUserInfo().getRoles().stream().map(Role::getCode).collect(Collectors.toList());
        String moduleName = processCriteria.getModuleName();
        List<HashMap<String, Object>> statusCountMap = workflowService.getProcessStatusCount(requestInfo, processCriteria);
        processCriteria.setModuleName(moduleName);
        processCriteria.setStatus(inputStatuses);
        processCriteria.setAssignee(assigneeUuid.toString());
        List<String> businessServiceName = processCriteria.getBusinessService();
        List<Inbox> inboxes = new ArrayList<>();
        InboxResponse response = new InboxResponse();
        JSONArray businessObjects = null;
        Map<String, String> srvMap = fetchAppropriateServiceMap(businessServiceName, moduleName);
        if (CollectionUtils.isEmpty(businessServiceName)) {
            throw new CustomException(ErrorConstants.MODULE_SEARCH_INVLAID, "Bussiness Service is mandatory for module search");
        }

        Map<String, Long> businessServiceSlaMap = new HashMap<>();

        // -------- determine module flags ----------
        boolean isNdcFlag = criteria.getProcessSearchCriteria().getModuleName().equalsIgnoreCase(NDC_MODULE);
        String moduleNm = criteria.getProcessSearchCriteria().getModuleName();
        boolean isPetFlag = "pet-service".equalsIgnoreCase(moduleNm);
        boolean isAdvFlag = "advandhoarding-services".equalsIgnoreCase(moduleNm);
        boolean isNocFlag = "noc-service".equalsIgnoreCase(moduleNm);
        boolean isChbFlag = "CHB".equalsIgnoreCase(moduleNm);
        boolean isChallanFlag = "Challan_Generation".equalsIgnoreCase(moduleNm);
        boolean isLayoutFlag = "layout-service".equalsIgnoreCase(moduleNm);
        boolean isCluFlag = "clu-service".equalsIgnoreCase(moduleNm);

        boolean isDirectStatusModule = isPetFlag || isAdvFlag || isNocFlag || isChbFlag || isChallanFlag || isLayoutFlag || isCluFlag;

        // -------- set common criteria for direct modules / NDC ----------
        if (isNdcFlag || isDirectStatusModule) {
            setCommonModuleCriteria(moduleSearchCriteria, criteria);
        }

        if (!CollectionUtils.isEmpty(moduleSearchCriteria)) {

            // ensure defaults
            setCommonModuleCriteria(moduleSearchCriteria, criteria);

            // fetch business services & sla map
            List<BusinessService> bussinessSrvs = new ArrayList<>();
            for (String businessSrv : businessServiceName) {
                BusinessService businessService = workflowService.getBusinessService(criteria.getTenantId(), requestInfo, businessSrv);
                bussinessSrvs.add(businessService);
                businessServiceSlaMap.put(businessService.getBusinessService(), businessService.getBusinessServiceSla());
            }

            HashMap<String, String> StatusIdNameMap = workflowService.getActionableStatusesForRole(requestInfo, bussinessSrvs, processCriteria);

            // NDC special handling for wfStatus
            if (isNdcFlag) {
                List<String> matchingIds = StatusIdNameMap.entrySet().stream()
                        .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList());
                if (!(moduleSearchCriteria.containsKey("wfStatus") && moduleSearchCriteria.get("wfStatus") != null) && !ObjectUtils.isEmpty(matchingIds))
                    moduleSearchCriteria.put("wfStatus", matchingIds);
            }

            String applicationStatusParam = srvMap.get("applsStatusParam");
            String businessIdParam = srvMap.get("businessIdProperty");
            if (StringUtils.isEmpty(applicationStatusParam)) {
                applicationStatusParam = "applicationStatus";
            }

            // -------- STATUS mapping (grouped logic) ----------
            if (!StatusIdNameMap.isEmpty()) {
                if (!CollectionUtils.isEmpty(processCriteria.getStatus())) {
                    // direct-status modules pass statuses as-is
                    if (isDirectStatusModule || processCriteria.getModuleName().equals(SWACH) || processCriteria.getModuleName().equals(PGR)) {
                        mapAndPutApplicationStatus(processCriteria.getStatus(), applicationStatusParam, moduleSearchCriteria);
                    } else {
                        // map statuses using StatusIdNameMap
                        List<String> mappedStatuses = processCriteria.getStatus().stream()
                                .map(StatusIdNameMap::get)
                                .collect(Collectors.toList());
                        mapAndPutApplicationStatus(mappedStatuses, applicationStatusParam, moduleSearchCriteria);
                    }
                } else {
                    moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(StatusIdNameMap.values().toArray(), ","));
                }
            }

            Map<String, List<String>> tenantAndApplnNumbersMap = new HashMap<>();

            // -------- BPA citizen tenant-wise appln fetch ----------
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA) && roles.contains(BpaConstants.CITIZEN)) {

                List<Map<String, String>> tenantWiseApplns =
                        bpaInboxFilterService.fetchTenantWiseApplicationNumbersForCitizenInboxFromSearcher(criteria, StatusIdNameMap, requestInfo);

                if (moduleSearchCriteria == null || moduleSearchCriteria.isEmpty()) {
                    moduleSearchCriteria = new HashMap<>();
                    moduleSearchCriteria.put(MOBILE_NUMBER_PARAM, requestInfo.getUserInfo().getMobileNumber());
                    criteria.setModuleSearchCriteria(moduleSearchCriteria);
                }

                for (Map<String, String> tenantAppln : tenantWiseApplns) {
                    tenantAndApplnNumbersMap.computeIfAbsent(tenantAppln.get("tenantid"), k -> new ArrayList<>())
                            .add(tenantAppln.get("applicationno"));
                }

                String inputTenantID = processCriteria.getTenantId();
                List<String> inputBusinessIds = processCriteria.getBusinessIds();
                List<String> inputStatus = processCriteria.getStatus();

                if (!StatusIdNameMap.isEmpty())
                    processCriteria.setStatus(StatusIdNameMap.entrySet().stream().map(Map.Entry::getKey).collect(Collectors.toList()));

                for (Map.Entry<String, List<String>> t : tenantAndApplnNumbersMap.entrySet()) {
                    processCriteria.setTenantId(t.getKey());
                    processCriteria.setBusinessIds(t.getValue());
                    List<HashMap<String, Object>> tenantWiseStatusCount = workflowService.getProcessStatusCount(requestInfo, processCriteria);
                    mergeStatusCountMaps(bpaCitizenStatusCountMap, tenantWiseStatusCount);
                }

                statusCountMap = bpaCitizenStatusCountMap;
                processCriteria.setTenantId(inputTenantID);
                processCriteria.setBusinessIds(inputBusinessIds);
                processCriteria.setStatus(inputStatus);
            }

            // -------- BPA locality based status count fix ----------
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA)) {
                if (moduleSearchCriteria.get(LOCALITY_PARAM) != null) {
                    List<String> inputStatusesForLocality = inputStatuses;
                    for (Map<String, Object> statusWiseCount : statusCountMap) {
                        List<String> statusList = new ArrayList<>();
                        statusList.add(String.valueOf(statusWiseCount.get(STATUS_ID)));
                        criteria.getProcessSearchCriteria().setStatus(statusList);
                        Integer count = bpaInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                        if (count == 0) {
                            statusWiseCount.clear();
                        } else {
                            statusWiseCount.put(COUNT, count);
                        }
                    }
                    criteria.getProcessSearchCriteria().setStatus(inputStatusesForLocality);
                }
                if (!statusCountMap.isEmpty()) {
                    List<HashMap<String, Object>> bpaInboxStatusCountMap = new ArrayList<>();
                    for (HashMap<String, Object> bpaLoclalityStatusCount : statusCountMap) {
                        if (!bpaLoclalityStatusCount.isEmpty())
                            bpaInboxStatusCountMap.add(bpaLoclalityStatusCount);
                    }
                    statusCountMap = bpaInboxStatusCountMap;
                }
            }

            // -------- generic module searcher results handling ----------
            boolean isSearchResultEmpty = false;
            List<String> businessKeys = new ArrayList<>();

            // PT
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PT)) {
                totalCount = ptInboxFilterService.fetchAcknowledgementIdsCountFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> acknowledgementNumbers = ptInboxFilterService.fetchAcknowledgementIdsFromSearcher(criteria, StatusIdNameMap, requestInfo);
                applySearchResultsToCriteria(acknowledgementNumbers, moduleSearchCriteria, businessKeys, ACKNOWLEDGEMENT_IDS_PARAM);
                if (CollectionUtils.isEmpty(acknowledgementNumbers)) isSearchResultEmpty = true;
            }

            // TL & BPAREG
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && (processCriteria.getModuleName().equals(TL)
                    || processCriteria.getModuleName().equals(BPAREG))) {
                List<String> applicationNumbers = tlInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, APPLICATION_NUMBER_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // PGR
            List<String> inputLocalities = new ArrayList<>();
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PGR)) {
                List<String> applicationNumbers = pgrInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                if (moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM)) {
                    String pgrLocality = (String) moduleSearchCriteria.get(PGR_LOCALITY_PARAM);
                    if (pgrLocality != null && !pgrLocality.trim().isEmpty()) {
                        inputLocalities = Arrays.stream(pgrLocality.trim().split("\\s*,\\s*"))
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toList());
                    }
                }
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, PGRANDSWACH_APPLICATION_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // SWACH
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(SWACH)) {
                List<String> applicationNumbers = swachInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                if (moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM)) {
                    String swachLocality = (String) moduleSearchCriteria.get(PGR_LOCALITY_PARAM);
                    if (swachLocality != null && !swachLocality.trim().isEmpty()) {
                        inputLocalities = Arrays.stream(swachLocality.trim().split("\\s*,\\s*"))
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toList());
                    }
                }
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, PGRANDSWACH_APPLICATION_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // BPA
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA)) {
                totalCount = bpaInboxFilterService.fetchApplicationCountFromSearcher(criteria, StatusIdNameMap, requestInfo); // kept unchanged
                List<String> applicationNumbers = bpaInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, BPA_APPLICATION_NUMBER_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // NDC
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(NDC_MODULE)) {
                List<String> applicationNumbers = ndcInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, NDC_APPLICATION_NO_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // PET/ADV/NOC/CHB/CHALLAN/LAYOUT/CLU grouped handling
            if (processCriteria != null && !ObjectUtils.isEmpty(processCriteria.getModuleName()) && isDirectStatusModule) {

                // determine service-specific param fallback for NOC
                String defaultApplParam = moduleNm.equals("noc-service") ? "applicationNo" : "applicationNumber";
                List<String> applicationNumbers = fetchApplicationNumbers(moduleNm, criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;

                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    String applNosParam = Optional.ofNullable(srvMap.get("applNosParam")).orElse(defaultApplParam);
                    moduleSearchCriteria.put(applNosParam, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                    // some modules remove applsStatusParam instead of STATUS_PARAM
                    if (isChallanFlag || isLayoutFlag || isCluFlag || isChbFlag) {
                        moduleSearchCriteria.remove(Optional.ofNullable(srvMap.get("applsStatusParam")).orElse(STATUS_PARAM));
                    }
                } else {
                    isSearchResultEmpty = true;
                }
            }

            // Additional specific modules
            // WS/SW ES search
            List<Map<String, Object>> result = new ArrayList<>();
            Map<String, Object> businessMapWS = new LinkedHashMap<>();
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && (processCriteria.getModuleName().equals(WS)
                    || processCriteria.getModuleName().equals(SW))) {

                JsonNode responseNode = null;
                try {
                    responseNode = new ObjectMapper().convertValue(elasticSearchRepository.elasticSearchApplications(criteria, (List<String>) null), JsonNode.class);
                    JsonNode output = responseNode.get(ELASTICSEARCH_HIT_KEY).get(ELASTICSEARCH_HIT_KEY);
                    totalCount = responseNode.get(ELASTICSEARCH_HIT_KEY).get("total").intValue();

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

            // Street vending
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(SV_SERVICES)) {
                List<String> applicationNumbers = StreetVendingInboxFilterService.fetchApplicationIdsFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, SV_APPLICATION_NUMBER_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
                else {
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                    moduleSearchCriteria.remove(STATUS_PARAM);
                    if (moduleSearchCriteria.containsKey(APPLICATION_STATUS))
                        moduleSearchCriteria.put(STATUS_PARAM, moduleSearchCriteria.get(APPLICATION_STATUS));
                }
            }

            // PTR
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PTR)) {
                List<String> applicationNumbers = ptrInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                applySearchResultsToCriteria(applicationNumbers, moduleSearchCriteria, businessKeys, ACKNOWLEDGEMENT_IDS_PARAM);
                if (CollectionUtils.isEmpty(applicationNumbers)) isSearchResultEmpty = true;
            }

            // ASSET
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(ASSET)) {
                List<String> applicationNumbers = assetInboxFilterService.fetchApplicationNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                if (!CollectionUtils.isEmpty(applicationNumbers)) {
                    moduleSearchCriteria.put(ACKNOWLEDGEMENT_IDS_PARAM, applicationNumbers);
                    businessKeys.addAll(applicationNumbers);
                } else isSearchResultEmpty = true;
            }

            // PGRAi
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(PGRAiConstants.PGR_MODULE)) {
                List<String> applicationNumbers = pgrAiInboxFilterService.fetchApplicationIdsFromSearcher(criteria, StatusIdNameMap, requestInfo);
                totalCount = (applicationNumbers != null) ? applicationNumbers.size() : 0;
                if (!CollectionUtils.isEmpty(applicationNumbers)) businessKeys.addAll(applicationNumbers);
            }

            // BS WS / BS SW billing special handling (flag)
            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(BS_WS_MODULENAME) && flag == 1) {
                processCriteria.setModuleName(BS_WS);
                Map<String, List<String>> map = billInboxFilterService.fetchConsumerNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> consumerCodes = map.get("consumerCodes");
                List<String> amendmentIds = map.get("amendmentIds");
                totalCount = (amendmentIds != null) ? amendmentIds.size() : ((consumerCodes != null) ? consumerCodes.size() : 0);
                if (!CollectionUtils.isEmpty(consumerCodes)) {
                    moduleSearchCriteria.put(BS_CONSUMER_NO_PARAM, consumerCodes);
                    businessKeys.addAll(amendmentIds != null ? amendmentIds : new ArrayList<String>());
                    moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, "WS");
                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(ASSIGNEE_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else isSearchResultEmpty = true;
                moduleSearchCriteria.put("isPropertyDetailsRequired", true);
                processCriteria.setModuleName(BS_WS_MODULENAME);
            }

            if (!ObjectUtils.isEmpty(processCriteria.getModuleName()) && processCriteria.getModuleName().equals(BS_SW_MODULENAME) && flag == 2) {
                processCriteria.setModuleName(BS_SW);
                Map<String, List<String>> map = billInboxFilterService.fetchConsumerNumbersFromSearcher(criteria, StatusIdNameMap, requestInfo);
                List<String> consumerCodes = map.get("consumerCodes");
                List<String> amendmentIds = map.get("amendmentIds");
                totalCount = (amendmentIds != null) ? amendmentIds.size() : ((consumerCodes != null) ? consumerCodes.size() : 0);
                if (!CollectionUtils.isEmpty(consumerCodes)) {
                    moduleSearchCriteria.put(BS_CONSUMER_NO_PARAM, consumerCodes);
                    businessKeys.addAll(amendmentIds != null ? amendmentIds : new ArrayList<String>());
                    moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, "SW");
                    moduleSearchCriteria.remove(MOBILE_NUMBER_PARAM);
                    moduleSearchCriteria.remove(ASSIGNEE_PARAM);
                    moduleSearchCriteria.remove(LOCALITY_PARAM);
                    moduleSearchCriteria.remove(OFFSET_PARAM);
                } else isSearchResultEmpty = true;
                moduleSearchCriteria.put("isPropertyDetailsRequired", true);
                processCriteria.setModuleName(BS_SW_MODULENAME);
            }

            businessObjects = new JSONArray();

            // Search module specific data from respective modules (skip ES WS/SW)
            if (!isSearchResultEmpty && !(processCriteria.getModuleName().equals(SW) || processCriteria.getModuleName().equals(WS))) {
                businessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(), requestInfo, srvMap);

                // SWACH / PGR extra filters (mobile/serviceCode/locality)
                if ((processCriteria.getModuleName().equals(SWACH) || processCriteria.getModuleName().equals(PGR))
                        && (moduleSearchCriteria.containsKey(PGR_MOBILE_NUMBER_PARAM) || moduleSearchCriteria.containsKey(PGR_SERVICECODE_PARAM) || moduleSearchCriteria.containsKey(PGR_LOCALITY_PARAM))) {

                    JSONArray filtered = new JSONArray();
                    String inputMobileNumber = moduleSearchCriteria.containsKey(PGR_MOBILE_NUMBER_PARAM)
                            ? (String) moduleSearchCriteria.get(PGR_MOBILE_NUMBER_PARAM)
                            : null;

                    List<String> inputServiceCodes = new ArrayList<>();
                    if (moduleSearchCriteria.containsKey(PGR_SERVICECODE_PARAM)) {
                        String serviceCodesStr = (String) moduleSearchCriteria.get(PGR_SERVICECODE_PARAM);
                        if (serviceCodesStr != null && !serviceCodesStr.trim().isEmpty()) {
                            inputServiceCodes = Arrays.asList(serviceCodesStr.split("\\s*,\\s*"));
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
                            if (!inputMobileNumber.equals(mobile)) matches = false;
                        }

                        if (!inputServiceCodes.isEmpty()) {
                            String serviceCode = serviceObj.optString(PGR_SERVICECODE_PARAM);
                            if (!inputServiceCodes.contains(serviceCode)) matches = false;
                        }

                        if (!inputLocalities.isEmpty()) {
                            JSONObject addressObj = serviceObj.optJSONObject(PGR_ADDRESS_PARAM);
                            JSONObject localityObj = addressObj != null ? addressObj.optJSONObject(PGR_LOCALITY_PARAM) : null;
                            String localityCode = localityObj != null ? localityObj.optString(PGR_ADDRESSCODE_PARAM) : null;
                            if (!inputLocalities.contains(localityCode)) matches = false;
                        }

                        if (matches) filtered.put(json);
                    }
                    businessObjects = filtered;
                }
            }

            // Build businessMap keyed by business id prop (or nested service.serviceRequestId)
            Map<String, Object> businessMap = StreamSupport.stream(businessObjects.spliterator(), false)
                    .collect(Collectors.toMap(
                            s1 -> {
                                JSONObject json = (JSONObject) s1;
                                if ("service".equals(businessIdParam)) {
                                    JSONObject serviceObj = (JSONObject) json.get("service");
                                    return serviceObj.get("serviceRequestId").toString();
                                } else {
                                    return json.get(businessIdParam).toString();
                                }
                            },
                            s1 -> s1,
                            (e1, e2) -> e1,
                            LinkedHashMap::new
                    ));

            ArrayList businessIds = new ArrayList();
            if (processCriteria.getModuleName().equals("pgr-services") || processCriteria.getModuleName().equals("swach-reform")) {
                for (Object obj : businessObjects) {
                    JSONObject jsonObject = (JSONObject) obj;
                    JSONObject serviceObject = jsonObject.optJSONObject("service");
                    if (serviceObject != null && serviceObject.has("serviceRequestId")) {
                        String serviceRequestId = serviceObject.optString("serviceRequestId");
                        if (serviceRequestId != null && !serviceRequestId.isEmpty()) businessIds.add(serviceRequestId);
                    }
                }
            } else {
                businessIds.addAll(businessMap.keySet());
            }

            processCriteria.setBusinessIds(businessIds);
            processCriteria.setIsProcessCountCall(false);

            // Bill amendment WS/SW handling
            String businessServiceForAmendment = businessServiceName.get(0);
            Boolean isBusinessServiceWSOrSW = businessServiceForAmendment.equalsIgnoreCase(BS_WS_SERVICE) || businessServiceForAmendment.equalsIgnoreCase(BS_SW_SERVICE);

            JSONArray serviceSearchObject = new JSONArray();
            Map<String, Object> serviceSearchMap = new HashMap<>();

            if (businessObjects != null && businessObjects.length() > 0 && isBusinessServiceWSOrSW) {
                String businessService = moduleSearchCriteria.get(BS_BUSINESS_SERVICE_PARAM).toString();
                Map<String, String> srvSearchMap = fetchAppropriateServiceSearchMap(businessService, moduleName);
                if (!isSearchResultEmpty && (processCriteria.getModuleName().equalsIgnoreCase(BS_WS_MODULENAME) || processCriteria.getModuleName().equalsIgnoreCase(BS_SW_MODULENAME))) {
                    moduleSearchCriteria.put(srvSearchMap.get("consumerCodeParam"), moduleSearchCriteria.get(BS_CONSUMER_NO_PARAM));
                    moduleSearchCriteria.remove(BS_CONSUMER_NO_PARAM);
                    moduleSearchCriteria.remove(BS_BUSINESS_SERVICE_PARAM);
                    moduleSearchCriteria.remove(BS_APPLICATION_NUMBER_PARAM);
                    moduleSearchCriteria.remove("status");
                    moduleSearchCriteria.put("searchType", "CONNECTION");
                    serviceSearchObject = fetchModuleSearchObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(), requestInfo, srvSearchMap);
                    moduleSearchCriteria.remove("searchType");
                    moduleSearchCriteria.put(BS_BUSINESS_SERVICE_PARAM, businessService);
                }
                serviceSearchMap = StreamSupport.stream(serviceSearchObject.spliterator(), false)
                        .collect(Collectors.toMap(s1 -> ((JSONObject) s1).get("connectionNo").toString(),
                                s1 -> s1, (e1, e2) -> e1, LinkedHashMap::new));
            }

            // processInstance fetch (BPA multi-tenant citizen special handling)
            ProcessInstanceResponse processInstanceResponse;

            if (processCriteria != null 
                    && !ObjectUtils.isEmpty(processCriteria.getModuleName())
                    && processCriteria.getModuleName().equals(BPA) 
                    && roles.contains(BpaConstants.CITIZEN)) {

                Map<String, List<String>> tenantAndApplnNoForProcessInstance = new HashMap<>();

                for (Object businessId : businessIds) {
                    for (Map.Entry<String, List<String>> tenantAppln : tenantAndApplnNumbersMap.entrySet()) {
                        String tenantId = tenantAppln.getKey();
                        if (tenantAppln.getValue().contains(businessId) 
                                && tenantAndApplnNoForProcessInstance.containsKey(tenantId)) {

                            tenantAndApplnNoForProcessInstance.get(tenantId)
                                    .add(String.valueOf(businessId));
                        } else {
                            List<String> businesIds = new ArrayList<>();
                            businesIds.add(String.valueOf(businessId));
                            tenantAndApplnNoForProcessInstance.put(tenantId, businesIds);
                        }
                    }
                }

                ProcessInstanceResponse processInstanceRes = new ProcessInstanceResponse();

                for (Map.Entry<String, List<String>> appln : tenantAndApplnNoForProcessInstance.entrySet()) {
                    processCriteria.setTenantId(appln.getKey());
                    processCriteria.setBusinessIds(appln.getValue());

                    ProcessInstanceResponse processInstance =
                            workflowService.getProcessInstance(processCriteria, requestInfo);

                    processInstanceRes.setResponseInfo(processInstance.getResponseInfo());

                    if (processInstanceRes.getProcessInstances() == null)
                        processInstanceRes.setProcessInstances(processInstance.getProcessInstances());
                    else
                        processInstanceRes.getProcessInstances()
                                .addAll(processInstance.getProcessInstances());
                }

                processInstanceResponse = processInstanceRes;

            } else {

                if (!processCriteria.getModuleName().equals(BPA)) {
                    List<String> desiredStatuses = processCriteria.getStatus();
                    List<String> matchingKeys = StatusIdNameMap.entrySet()
                            .stream()
                            .filter(entry -> desiredStatuses.contains(entry.getValue()))
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());
                    processCriteria.setStatus(matchingKeys);
                }

                // ❗ Only ONE WF CALL (remove duplicate)
                processInstanceResponse = workflowService.getProcessInstance(processCriteria, requestInfo);
            }


            List<ProcessInstance> processInstances = processInstanceResponse.getProcessInstances();

            Map<String, ProcessInstance> processInstanceMap = new HashMap<>();
            if (!CollectionUtils.isEmpty(processInstances)) {
                for (ProcessInstance processInstance : processInstances) {
                    processInstanceMap.put(processInstance.getBusinessId(), processInstance);
                }
            }

            // WS/SW result -> build inboxes from ES result
            if (moduleName.equals(WS) || moduleName.equals(SW)) {
                if (!CollectionUtils.isEmpty(result)) {
                    result.forEach(res -> {
                        Inbox inbox = new Inbox();
                        JsonNode jsonNode = mapper.convertValue(res.get("Data"), JsonNode.class);
                        JSONObject jsonObject = new JSONObject();
                        jsonObject.put("Data", jsonNode);
                        jsonObject.put("serviceSLA", res.get("serviceSLA"));
                        inbox.setBusinessObject(toMap(jsonObject));
                        inboxes.add(inbox);
                    });
                }
            }

            // Build inboxes from businessMap + processInstanceMap
            if (businessObjects.length() > 0 && processInstances.size() > 0) {
                if (CollectionUtils.isEmpty(businessKeys)) {
                    for (Object businessKeyObj : businessMap.keySet()) {
                        String businessKey = String.valueOf(businessKeyObj);
                        if (processInstanceMap.get(businessKey) != null) {
                            if (!isBusinessServiceWSOrSW) {
                                Inbox inbox = new Inbox();
                                inbox.setProcessInstance(processInstanceMap.get(businessKey));
                                inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                                inboxes.add(inbox);
                            } else {
                                Inbox inbox = new Inbox();
                                inbox.setProcessInstance(processInstanceMap.get(businessKey));
                                inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                                inbox.setServiceObject(toMap((JSONObject) serviceSearchMap.get(inbox.getBusinessObject().get("consumerCode"))));
                                inboxes.add(inbox);
                            }
                        }
                    }
                    if (isBusinessServiceWSOrSW) totalCount = processInstanceMap.size();
                } else {
                    if (!isBusinessServiceWSOrSW) {
                        List<String> filteredBusinessKeys = businessKeys.stream()
                                .filter(key -> processInstanceMap.containsKey(key) && businessMap.containsKey(key))
                                .collect(Collectors.toList());
                        businessKeys = filteredBusinessKeys;
                        for (String businessKey : businessKeys) {
                            Inbox inbox = new Inbox();
                            inbox.setProcessInstance(processInstanceMap.get(businessKey));
                            inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                            inboxes.add(inbox);
                        }
                    } else {
                        for (String businessKey : businessKeys) {
                            Inbox inbox = new Inbox();
                            inbox.setProcessInstance(processInstanceMap.get(businessKey));
                            inbox.setBusinessObject(toMap((JSONObject) businessMap.get(businessKey)));
                            inbox.setServiceObject(toMap((JSONObject) serviceSearchMap.get(inbox.getBusinessObject().get("consumerCode"))));
                            inboxes.add(inbox);
                        }
                    }
                }
            }

            // other flows (no moduleSearchCriteria scenario)
        } else {
            // when moduleSearchCriteria is empty -> fetch process instances directly
            processCriteria.setOffset(criteria.getOffset());
            processCriteria.setLimit(criteria.getLimit());

            ProcessInstanceResponse processInstanceResponse = workflowService.getProcessInstance(processCriteria, requestInfo);
            List<ProcessInstance> processInstances = processInstanceResponse.getProcessInstances();
            Map<String, ProcessInstance> processInstanceMap = processInstances.stream().collect(Collectors.toMap(ProcessInstance::getBusinessId, Function.identity()));
            moduleSearchCriteria = new HashMap<>();
            if (CollectionUtils.isEmpty(srvMap)) {
                throw new CustomException(ErrorConstants.INVALID_MODULE, "config not found for the businessService : " + businessServiceName);
            }
            String businessIdParam = srvMap.get("businessIdProperty");
            moduleSearchCriteria.put(srvMap.get("applNosParam"), StringUtils.arrayToDelimitedString(processInstanceMap.keySet().toArray(), ","));
            moduleSearchCriteria.put("tenantId", criteria.getTenantId());
            moduleSearchCriteria.put("limit", -1);
            businessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(), requestInfo, srvMap);
            Map<String, Object> businessMap = StreamSupport.stream(businessObjects.spliterator(), false)
                    .collect(Collectors.toMap(s1 -> ((JSONObject) s1).get(businessIdParam).toString(), s1 -> s1));

            if (businessObjects.length() > 0 && processInstances.size() > 0) {
                for (String pinstance : processInstanceMap.keySet()) {
                    Inbox inbox = new Inbox();
                    inbox.setProcessInstance(processInstanceMap.get(pinstance));
                    inbox.setBusinessObject(toMap((JSONObject) businessMap.get(pinstance)));
                    inboxes.add(inbox);
                }
            }
        }

        // FSM specific vehicle-trips aggregation and final adjustments (preserved same logic)
        if (!ObjectUtils.isEmpty(processCriteria.getModuleName())
                && processCriteria.getModuleName().equalsIgnoreCase(FSMConstants.FSM_MODULE)) {

            List<String> applicationStatus = new ArrayList<>();
            applicationStatus.add(WAITING_FOR_DISPOSAL_STATE);
            applicationStatus.add(DISPOSED_STATE);
            List<Map<String, Object>> vehicleResponse = fetchVehicleTripResponse(criteria, requestInfo, applicationStatus);
            BusinessService businessService = workflowService.getBusinessService(criteria.getTenantId(), requestInfo, FSM_VEHICLE_TRIP_MODULE);
            populateStatusCountMap(statusCountMap, vehicleResponse, businessService);

            for (HashMap<String, Object> vTripMap : statusCountMap) {
                if ((WAITING_FOR_DISPOSAL_STATE.equals(vTripMap.get(APPLICATIONSTATUS)) || DISPOSED_STATE.equals(vTripMap.get(APPLICATIONSTATUS)))
                        && inputStatuses.contains(vTripMap.get(STATUSID))) {
                    totalCount += ((int) vTripMap.get(COUNT));
                }
            }

            List<String> requiredApplications = new ArrayList<>();
            inboxes.forEach(inbox -> {
                ProcessInstance inboxProcessInstance = inbox.getProcessInstance();
                if (null != inboxProcessInstance && null != inboxProcessInstance.getState()) {
                    String appStatus = inboxProcessInstance.getState().getApplicationStatus();
                    if (DSO_INPROGRESS_STATE.equals(appStatus) || CITIZEN_FEEDBACK_PENDING_STATE.equals(appStatus) || COMPLETED_STATE.equals(appStatus)) {
                        requiredApplications.add(inboxProcessInstance.getBusinessId());
                    }
                }
            });

            List<VehicleTripDetail> vehicleTripDetail = fetchVehicleStatusForApplication(requiredApplications, requestInfo, criteria.getTenantId());
            inboxes.forEach(inbox -> {
                if (null != inbox && null != inbox.getProcessInstance() && null != inbox.getProcessInstance().getBusinessId()) {
                    List<VehicleTripDetail> vehicleTripDetails = vehicleTripDetail.stream()
                            .filter(trip -> inbox.getProcessInstance().getBusinessId().equals(trip.getReferenceNo()))
                            .collect(Collectors.toList());
                    Map<String, Object> vehicleBusinessObject = inbox.getBusinessObject();
                    vehicleBusinessObject.put(VEHICLE_LOG, vehicleTripDetails);
                }
            });

            if (CollectionUtils.isEmpty(inboxes) && totalCount > 0 && !moduleSearchCriteria.containsKey("applicationNos")) {
                inputStatuses = inputStatuses.stream().filter(x -> x != null).collect(Collectors.toList());
                List<String> fsmApplicationList = fetchVehicleStateMap(inputStatuses, requestInfo, criteria.getTenantId(), criteria.getLimit(), criteria.getOffset());
                moduleSearchCriteria.put("applicationNos", fsmApplicationList);
                moduleSearchCriteria.put("applicationStatus", requiredApplications);
                processCriteria.setBusinessIds(fsmApplicationList);
                processCriteria.setStatus(null);
                ProcessInstanceResponse processInstanceResponse2 = workflowService.getProcessInstance(processCriteria, requestInfo);
                List<ProcessInstance> vehicleProcessInstances = processInstanceResponse2.getProcessInstances();
                Map<String, ProcessInstance> vehicleProcessInstanceMap = vehicleProcessInstances.stream().collect(Collectors.toMap(ProcessInstance::getBusinessId, Function.identity()));
                JSONArray vehicleBusinessObjects = fetchModuleObjects(moduleSearchCriteria, businessServiceName, criteria.getTenantId(), requestInfo, srvMap);
                String businessIdParam = srvMap.get("businessIdProperty");
                Map<String, Object> vehicleBusinessMap = StreamSupport.stream(vehicleBusinessObjects.spliterator(), false)
                        .collect(Collectors.toMap(s1 -> ((JSONObject) s1).get(businessIdParam).toString(), s1 -> s1, (e1, e2) -> e1, LinkedHashMap::new));
                if (vehicleBusinessObjects.length() > 0 && vehicleProcessInstances.size() > 0) {
                    for (String busiessKey : fsmApplicationList) {
                        Inbox inbox = new Inbox();
                        inbox.setProcessInstance(vehicleProcessInstanceMap.get(busiessKey));
                        inbox.setBusinessObject(toMap((JSONObject) vehicleBusinessMap.get(busiessKey)));
                        inboxes.add(inbox);
                    }
                }
            }

            // aggregate statusCountMap (preserved)
            List<HashMap<String, Object>> aggregateStatusCountMap = new ArrayList<>();
            for (HashMap<String, Object> statusCountEntry : statusCountMap) {
                HashMap<String, Object> tempStatusMap = new HashMap<>();
                boolean matchFound = false;
                for (HashMap<String, Object> aggrMapInstance : aggregateStatusCountMap) {
                    String statusMapAppStatus = (String) statusCountEntry.get("applicationstatus");
                    String aggrMapAppStatus = (String) aggrMapInstance.get("applicationstatus");
                    if (aggrMapAppStatus.equalsIgnoreCase(statusMapAppStatus)) {
                        aggrMapInstance.put(COUNT, ((Integer) statusCountEntry.get(COUNT) + (Integer) aggrMapInstance.get(COUNT)));
                        aggrMapInstance.put(APPLICATIONSTATUS, (String) statusCountEntry.get(APPLICATIONSTATUS));
                        aggrMapInstance.put(BUSINESS_SERVICE_PARAM, (String) statusCountEntry.get(BUSINESS_SERVICE_PARAM) + "," + (String) aggrMapInstance.get(BUSINESS_SERVICE_PARAM));
                        aggrMapInstance.put(STATUSID, (String) statusCountEntry.get(STATUSID) + "," + (String) aggrMapInstance.get(STATUSID));
                        matchFound = true;
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
            statusCountMap = aggregateStatusCountMap;
        }

        log.info("statusCountMap size :::: " + statusCountMap.size());
        // final adjustment for mobile filters for adv/ndc/noc/pet
        if (moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM) && (isAdvFlag || isNdcFlag || isNocFlag || isPetFlag)) {
            totalCount = inboxes.size();
        }

        response.setTotalCount(totalCount);
        response.setStatusMap(statusCountMap);
        response.setItems(inboxes);
        return response;
    }


    /* ------------------ PRIVATE HELPERS (kept inside same class) ------------------ */

    private void setCommonModuleCriteria(HashMap moduleSearchCriteria, InboxSearchCriteria criteria) {
        moduleSearchCriteria.put("tenantId", criteria.getTenantId());
        moduleSearchCriteria.put("offset", criteria.getOffset());
        moduleSearchCriteria.put("limit", criteria.getLimit());
    }

    private void mapAndPutApplicationStatus(List<String> statuses, String applicationStatusParam, HashMap moduleSearchCriteria) {
        if (!CollectionUtils.isEmpty(statuses)) {
            moduleSearchCriteria.put(applicationStatusParam, StringUtils.arrayToDelimitedString(statuses.toArray(), ","));
        }
    }

    private void applySearchResultsToCriteria(List<String> numbers, HashMap moduleSearchCriteria, List<String> businessKeys, String paramName) {
        if (!CollectionUtils.isEmpty(numbers)) {
            moduleSearchCriteria.put(paramName, numbers);
            businessKeys.addAll(numbers);
            moduleSearchCriteria.remove(LOCALITY_PARAM);
            moduleSearchCriteria.remove(OFFSET_PARAM);
        }
    }

    private void mergeStatusCountMaps(List<HashMap<String, Object>> dest, List<HashMap<String, Object>> src) {
        if (dest.isEmpty()) {
            dest.addAll(src);
            return;
        }
        for (HashMap<String, Object> tenantStatusMap : src) {
            for (HashMap<String, Object> bpaStatusMap : dest) {
                if (bpaStatusMap.containsValue(tenantStatusMap.get(STATUS_ID))) {
                    bpaStatusMap.put(COUNT, Integer.parseInt(String.valueOf(bpaStatusMap.get(COUNT))) + Integer.parseInt(String.valueOf(tenantStatusMap.get(COUNT))));
                }
            }
        }
    }

    /**
     * return appropriate inbox filter service which supports fetchApplicationNumbersFromSearcher and fetchApplicationCountFromSearcher
     * This keeps the grouping behaviour in a single place
     */
    private Object inboxFilterServiceFor(String moduleNm) {
        if ("pet-service".equalsIgnoreCase(moduleNm)) return petInboxFilterService;
        if ("advandhoarding-services".equalsIgnoreCase(moduleNm)) return advInboxFilterService;
        if ("noc-service".equalsIgnoreCase(moduleNm)) return nocInboxFilterService;
        if ("CHB".equalsIgnoreCase(moduleNm)) return chbInboxFilterService;
        if ("Challan_Generation".equalsIgnoreCase(moduleNm)) return challanInboxFilterService;
        if ("layout-service".equalsIgnoreCase(moduleNm)) return layoutInboxFilterService;
        if ("clu-service".equalsIgnoreCase(moduleNm)) return cluInboxFilterService;
        return null;
    }


    @SuppressWarnings("unchecked")
    private List<String> fetchApplicationNumbers(String moduleNm,
                                                 InboxSearchCriteria inboxCriteria,
                                                 Map<String, String> statusIdNameMap,
                                                 RequestInfo requestInfo) {

        Object service = inboxFilterServiceFor(moduleNm);
        if (service == null) return Collections.emptyList();

        try {
            Method m = service.getClass().getMethod(
                    "fetchApplicationNumbersFromSearcher",
                    InboxSearchCriteria.class,
                    Map.class,
                    RequestInfo.class
            );
            return (List<String>) m.invoke(service, inboxCriteria, statusIdNameMap, requestInfo);
        } catch (Exception e) {
            log.error("Error in fetchApplicationNumbers for module " + moduleNm, e);
            return Collections.emptyList();
        }
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
