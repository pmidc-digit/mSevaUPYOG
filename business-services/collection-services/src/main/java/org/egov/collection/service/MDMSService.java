package org.egov.collection.service;

import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.collection.config.ApplicationProperties;
import org.egov.collection.repository.ServiceRequestRepository;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.egov.collection.config.CollectionServiceConstants.*;

@Service
@Slf4j
public class MDMSService {


    private ApplicationProperties applicationProperties;

    private ServiceRequestRepository serviceRequestRepository;


    @Autowired
    public MDMSService(ApplicationProperties applicationProperties, ServiceRequestRepository serviceRequestRepository) {
        this.applicationProperties = applicationProperties;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    public Object mDMSCall(RequestInfo requestInfo, String tenantId){
        MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo,tenantId);
        StringBuilder url = getMdmsSearchUrl();
        Object result = serviceRequestRepository.fetchResult(url,mdmsCriteriaReq);
        return result;
    }

    /**
     * Fetches receiptKey corresponding to the businessService from MDMS (common-masters.uiCommonPay)
     * @param requestInfo RequestInfo of the request
     * @param tenantId State tenantId (e.g. "pb")
     * @param businessService Business service code (e.g. "PT", "TL")
     * @return PDF receipt key string
     */
    public String getReceiptKey(RequestInfo requestInfo, String tenantId, String businessService) {
        try {
            List<MasterDetail> masterDetails = new ArrayList<>();
            masterDetails.add(MasterDetail.builder().name(UI_COMMON_PAY_MASTER).build());

            ModuleDetail moduleDetail = ModuleDetail.builder()
                    .masterDetails(masterDetails)
                    .moduleName(COMMON_MASTERS_MODULE)
                    .build();

            List<ModuleDetail> moduleDetails = Collections.singletonList(moduleDetail);

            MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
                    .moduleDetails(moduleDetails)
                    .tenantId(tenantId)
                    .build();

            MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder()
                    .requestInfo(requestInfo)
                    .mdmsCriteria(mdmsCriteria)
                    .build();

            StringBuilder url = getMdmsSearchUrl();
            Object result = serviceRequestRepository.fetchResult(url, mdmsCriteriaReq);

            if (result != null) {
                List<Map<String, Object>> uiCommonPayList = JsonPath.read(result, UI_COMMON_PAY_PATH);
                if (!CollectionUtils.isEmpty(uiCommonPayList)) {
                    String defaultKey = null;
                    for (Map<String, Object> item : uiCommonPayList) {
                        String code = (String) item.get("code");
                        if (businessService != null && businessService.equalsIgnoreCase(code)) {
                            String receiptKey = (String) item.get("receiptKey");
                            if (StringUtils.hasText(receiptKey)) {
                                log.info("Found matching receiptKey '{}' in MDMS for businessService '{}'", receiptKey, businessService);
                                return receiptKey;
                            }
                        }
                        if ("DEFAULT".equalsIgnoreCase(code)) {
                            defaultKey = (String) item.get("receiptKey");
                        }
                    }
                    if (StringUtils.hasText(defaultKey)) {
                        log.info("Using DEFAULT receiptKey '{}' from MDMS for businessService '{}'", defaultKey, businessService);
                        return defaultKey;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error while fetching receiptKey from MDMS for businessService: {}", businessService, e);
        }
        log.info("Fallback to default receiptKey '{}' for businessService '{}'", DEFAULT_RECEIPT_KEY, businessService);
        return DEFAULT_RECEIPT_KEY;
    }


    /**
     * Creates MDMS request
     * @param requestInfo The RequestInfo of the Payment
     * @param tenantId The tenantId of the Payment
     * @return MDMSCriteria Request
     */
    private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId) {

        // master details for Collection module
        List<MasterDetail> billingMasterDetails = new ArrayList<>();

        billingMasterDetails.add(MasterDetail.builder().name(BILLING_MASTER_CODE).build());

        ModuleDetail billingModuleDtls = ModuleDetail.builder().masterDetails(billingMasterDetails)
                .moduleName(BILLING_MODULE_NAME).build();

        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(billingModuleDtls);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId)
                .build();

        return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();
    }


    /**
     * Creates and returns the url for mdms search endpoint
     *
     * @return MDMS Search URL
     */
    private StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(applicationProperties.getMdmsHost()).append(applicationProperties.getMdmsSearchEndpoint());
    }


}
