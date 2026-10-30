package org.egov.garbagecollection.service;

import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.web.models.*;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.repository.GcDao;
import org.egov.garbagecollection.util.EncryptionDecryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;

import static org.egov.garbagecollection.constants.GCConstants.WNS_ENCRYPTION_MODEL;
import static org.egov.garbagecollection.constants.GCConstants.WNS_PLUMBER_ENCRYPTION_MODEL;

@Slf4j
@Service
public class GcEncryptionService {

    @Autowired
    private GcDao gcDao;

    @Autowired
    GcServiceImpl gcService;

    @Autowired
    EncryptionDecryptionUtil encryptionDecryptionUtil;

    @Value("${encryption.batch.value}")
    private Integer batchSize;

    @Value("${encryption.offset.value}")
    private Integer batchOffset;

    private Integer countPushed = 0;

    @Value("${egov.mdms.host}")
    private String mdmsHost;

    @Value("${egov.mdms.search.endpoint}")
    private String mdmsEndpoint;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private GcServicesUtil waterServicesUtil;

    /**
     * Initiates Water applications/connections data encryption
     *
     * @param criteria    SearchCriteria - takes tenantId
     * @param requestInfo
     * @return all water applications with encrypted data
     */
    public GarbageConnectionResponse updateOldData(SearchCriteria criteria, RequestInfo requestInfo) {
        GarbageConnectionResponse waterConnectionResponse = updateBatchCriteria(requestInfo, criteria);
        return waterConnectionResponse;
    }

    /**
     * Data encryption process takes place in batches.
     * <p>
     * Setting the batch size and initial offset values below
     */
    public GarbageConnectionResponse updateBatchCriteria(RequestInfo requestInfo, SearchCriteria criteria) {
        List<GarbageConnection> waterConnectionList = new ArrayList();
        GarbageConnectionResponse waterConnectionResponse;

        if (CollectionUtils.isEmpty(criteria.getTenantIds())) {
            //mdms call for tenantIds in case tenantIds array is not sent in criteria
            Set<String> tenantIds = getAllTenantsFromMdms(requestInfo);
            criteria.setTenantIds(tenantIds);
        }
        List<GarbageConnection> finalWaterList = new LinkedList<>();
        for (String tenantId : criteria.getTenantIds()) {
            criteria.setTenantId(tenantId);

            EncryptionCount encryptionCount = gcDao.getLastExecutionDetail(criteria);

            if (criteria.getLimit() == null)
                criteria.setLimit(Integer.valueOf(batchSize));

            if (encryptionCount.getRecordCount() != null)
                criteria.setOffset((int) (encryptionCount.getBatchOffset() + encryptionCount.getRecordCount()));
            else if (criteria.getOffset() == null)
                criteria.setOffset(Integer.valueOf(batchOffset));

            waterConnectionList = initiateEncryption(requestInfo, criteria);
            finalWaterList.addAll(waterConnectionList);
        }
        waterConnectionResponse = GarbageConnectionResponse.builder().garbageConnections(finalWaterList)
                .build();
        return waterConnectionResponse;
    }

    /**
     * Encrypts existing Water applications' data
     *
     * @param criteria    SearchCriteria - has Limit and offset values
     * @param requestInfo
     * @return all water applications with encrypted data
     */
    public List<GarbageConnection> initiateEncryption(RequestInfo requestInfo, SearchCriteria criteria) {
        List<GarbageConnection> finalWaterList = new LinkedList<>();
        Map<String, String> responseMap = new HashMap<>();

        GarbageConnectionResponse garbageConnectionResponse;

        EncryptionCount encryptionCount;

        Integer startBatch = Math.toIntExact(criteria.getOffset());
        Integer batchSizeInput = Math.toIntExact(criteria.getLimit());

        Integer count = gcDao.getTotalApplications(criteria);
        Map<String, String> map = new HashMap<>();

        log.info("Count: " + count);
        log.info("startbatch: " + startBatch);

        while (startBatch < count) {
            long startTime = System.nanoTime();
            List<GarbageConnection> garbageConnectionList = new LinkedList<>();
            try {
                garbageConnectionResponse = gcService.plainSearch(criteria, requestInfo);
                countPushed = 0;

                for (GarbageConnection waterConnection : garbageConnectionResponse.getGarbageConnections()) {
                    /* encrypt here */
                    waterConnection = encryptionDecryptionUtil.encryptObject(waterConnection, WNS_ENCRYPTION_MODEL, GarbageConnection.class);
                    waterConnection = encryptionDecryptionUtil.encryptObject(waterConnection, WNS_PLUMBER_ENCRYPTION_MODEL, GarbageConnection.class);

                    GarbageConnectionRequest waterConnectionRequest = GarbageConnectionRequest.builder()
                            .requestInfo(requestInfo)
                            .garbageConnection(waterConnection)
                            .isOldDataEncryptionRequest(Boolean.TRUE)
                            .build();

                    waterConnectionRequest.getGarbageConnection().setAuditDetails(waterServicesUtil
                            .getAuditDetails(waterConnectionRequest.getRequestInfo().getUserInfo().getUuid(), false));
                    gcDao.updateOldGarbageConnections(waterConnectionRequest);
                    countPushed++;
                    garbageConnectionList.add(waterConnection);
                    map.put("message", "Encryption successfull till batchOffset : " + criteria.getOffset() + ". Records encrypted in current batch : " + countPushed);
                }
            } catch (Exception e) {
                map.put("message", "Encryption failed at batchOffset  :  " + startBatch + "  with message : " + e.getMessage() + ". Records encrypted in current batch : " + countPushed);
                log.error("Encryption failed at batch count of : " + startBatch);
                log.error("Encryption failed at batch count : " + startBatch + "=>" + e.getMessage());

                encryptionCount = EncryptionCount.builder()
                        .tenantid(criteria.getTenantId())
                        .limit(Long.valueOf(criteria.getLimit()))
                        .id(UUID.randomUUID().toString())
                        .batchOffset(Long.valueOf(startBatch))
                        .createdTime(System.currentTimeMillis())
                        .recordCount(Long.valueOf(countPushed))
                        .message(map.get("message"))
                        .encryptiontime(System.currentTimeMillis())
                        .build();

                gcDao.updateEncryptionStatus(encryptionCount);

                finalWaterList.addAll(garbageConnectionList);
                return finalWaterList;
            }

            log.debug(" count completed for batch : " + startBatch);
            long endTime = System.nanoTime();
            long elapseTime = endTime - startTime;
            log.debug("\n\nBatch elapsed time: " + elapseTime + "\n\n");

            encryptionCount = EncryptionCount.builder()
                    .tenantid(criteria.getTenantId())
                    .limit(Long.valueOf(criteria.getLimit()))
                    .id(UUID.randomUUID().toString())
                    .batchOffset(Long.valueOf(startBatch))
                    .createdTime(System.currentTimeMillis())
                    .recordCount(Long.valueOf(countPushed))
                    .message(map.get("message"))
                    .encryptiontime(System.currentTimeMillis())
                    .build();

            gcDao.updateEncryptionStatus(encryptionCount);
            startBatch = startBatch + batchSizeInput;
            criteria.setOffset(Integer.valueOf(startBatch));
            log.info("GarbageConnections Count which pushed into kafka topic:" + countPushed);
            finalWaterList.addAll(garbageConnectionList);
        }
        criteria.setOffset(Integer.valueOf(batchOffset));

        return finalWaterList;
    }

    /**
     *
     * @param requestInfo RequestInfo Object
     *
     * @return MdmsCriteria
     */
    private Set<String> getAllTenantsFromMdms(RequestInfo requestInfo) {

        String tenantId = (requestInfo.getUserInfo().getTenantId());
        String jsonPath = GCConstants.TENANTS_JSONPATH_ROOT;

        MasterDetail mstrDetail = MasterDetail.builder().name(GCConstants.TENANTS_MASTER_ROOT)
                .filter("$.*").build();
        ModuleDetail moduleDetail = ModuleDetail.builder().moduleName(GCConstants.TENANT_MASTER_MODULE)
                .masterDetails(Arrays.asList(mstrDetail)).build();
        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(Arrays.asList(moduleDetail)).tenantId(tenantId)
                .build();
        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();
        StringBuilder uri = new StringBuilder(mdmsHost).append(mdmsEndpoint);
        try {
            Object result = serviceRequestRepository.fetchResult(uri, mdmsCriteriaReq);
            List<Map<String, Object>> jsonOutput = JsonPath.read(result, jsonPath);
            Set<String> state = new HashSet<String>();
            for (Map<String, Object> json : jsonOutput) {
                state.add((String) json.get("code"));
            }
            return state;
        } catch (Exception e) {
            throw new CustomException("INVALID_TENANT_FILE_SEARCH", "Exception in TenantId File search in MDMS: " + e.getMessage());
        }
    }

}
