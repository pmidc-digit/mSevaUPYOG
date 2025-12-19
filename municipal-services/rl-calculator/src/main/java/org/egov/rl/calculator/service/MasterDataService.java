package org.egov.rl.calculator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.*;
import org.egov.rl.calculator.repository.Repository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.demand.BillingPeriod;
import org.egov.rl.calculator.web.models.demand.Penalty;
import org.egov.rl.calculator.web.models.demand.TaxPeriod;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MasterDataService {

    @Autowired
    private Repository repository;

    @Autowired
    private Configurations configs;
    
    @Autowired
    private ObjectMapper mapper;

    public List<TaxPeriod> getTaxPeriodList(RequestInfo requestInfo, String tenantId, String service) {
        MdmsCriteriaReq mdmsCriteriaReq = getTaxPeriodRequest(requestInfo, tenantId, service);
        try {
            Object result = repository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
            MdmsResponse mdmsResponse = mapper.convertValue(result, MdmsResponse.class);

            List<TaxPeriod> taxPeriods = mapper.convertValue(
                    mdmsResponse.getMdmsRes()
                            .get(RLConstants.BILLING_SERVICE_MASTER)
                            .get(RLConstants.TAX_PERIOD_MASTER),
                    new TypeReference<List<TaxPeriod>>() {});
            return taxPeriods;
        } catch (Exception e) {
            log.error("Failed to get tax periods from MDMS", e);
            throw new CustomException("MDMS_ERROR", "Failed to get tax periods from MDMS");
        }
    }

    private MdmsCriteriaReq getTaxPeriodRequest(RequestInfo requestInfo, String tenantId, String service) {
        MasterDetail masterDetail = new MasterDetail();
        masterDetail.setName(RLConstants.TAX_PERIOD_MASTER);
        masterDetail.setFilter("[?(@.service=='" + service + "')]");
        List<MasterDetail> masterDetails = new ArrayList<>();
        masterDetails.add(masterDetail);

        ModuleDetail moduleDetail = new ModuleDetail();
        moduleDetail.setMasterDetails(masterDetails);
        moduleDetail.setModuleName(RLConstants.BILLING_SERVICE_MASTER);
        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(moduleDetail);

        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setTenantId(tenantId);
        mdmsCriteria.setModuleDetails(moduleDetails);

        return new MdmsCriteriaReq(requestInfo, mdmsCriteria);
    }

    public List<BillingPeriod> getBillingPeriod(RequestInfo requestInfo, String tenantId) {
        MdmsCriteriaReq mdmsCriteriaReq = getBillingPeriodRequest(requestInfo, tenantId);
        try {
            Object result = repository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
            MdmsResponse mdmsResponse = mapper.convertValue(result, MdmsResponse.class);
            List<BillingPeriod> billingPeriods = mapper.convertValue(
                    mdmsResponse.getMdmsRes()
                            .get(RLConstants.RL_SERVICES_MASTER_MODULE)
                            .get(RLConstants.BILLING_PERIOD_MASTER),
                    new TypeReference<List<BillingPeriod>>() {}
            );
            return billingPeriods;
        } catch (Exception e) {
            log.error("Failed to get Billing Period from MDMS for tenant " + tenantId, e);
            throw new CustomException("MDMS_ERROR", "Failed to get Billing Period from MDMS");
        }
    }

    private MdmsCriteriaReq getBillingPeriodRequest(RequestInfo requestInfo, String tenantId) {
        MasterDetail masterDetail = new MasterDetail();
        masterDetail.setName(RLConstants.BILLING_PERIOD_MASTER);
        List<MasterDetail> masterDetails = new ArrayList<>();
        masterDetails.add(masterDetail);

        ModuleDetail moduleDetail = new ModuleDetail();
        moduleDetail.setMasterDetails(masterDetails);
        moduleDetail.setModuleName(RLConstants.RL_SERVICES_MASTER_MODULE);
        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(moduleDetail);

        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setTenantId(tenantId);
        mdmsCriteria.setModuleDetails(moduleDetails);

        return new MdmsCriteriaReq(requestInfo, mdmsCriteria);
    }

    public List<Penalty> getPenaltySlabs(RequestInfo requestInfo, String tenantId) {
        // Using RL_SERVICES_MASTER_MODULE to fetch service-specific penalty
        MdmsCriteriaReq mdmsCriteriaReq = getMasterRequest(requestInfo, tenantId,
                RLConstants.RL_SERVICES_MASTER_MODULE, RLConstants.PENALTY_MASTER, null);
        try {
            Object result = repository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
            MdmsResponse mdmsResponse = mapper.convertValue(result, MdmsResponse.class);
            List<Penalty> penaltySlabs = mapper.convertValue(
                    mdmsResponse.getMdmsRes()
                            .get(RLConstants.RL_SERVICES_MASTER_MODULE)
                            .get(RLConstants.PENALTY_MASTER),
                    new TypeReference<List<Penalty>>() {}
            );
            return penaltySlabs;
        } catch (Exception e) {
            log.error("Failed to get Penalty slabs from MDMS for tenant " + tenantId, e);
            throw new CustomException("MDMS_ERROR", "Failed to get Penalty slabs from MDMS");
        }
    }

    /**
     * Creates a generic MDMS request
     * @param requestInfo The requestInfo of the request
     * @param tenantId The tenantId of the city
     * @param moduleName The name of the module
     * @param masterName The name of the master
     * @param filter The filter to apply
     * @return MdmsCriteriaReq object
     */
    private MdmsCriteriaReq getMasterRequest(RequestInfo requestInfo, String tenantId, String moduleName,
                                             String masterName, String filter) {
        MasterDetail masterDetail = new MasterDetail();
        masterDetail.setName(masterName);
        if (filter != null)
            masterDetail.setFilter(filter);

        List<MasterDetail> masterDetails = new ArrayList<>();
        masterDetails.add(masterDetail);

        ModuleDetail moduleDetail = new ModuleDetail();
        moduleDetail.setMasterDetails(masterDetails);
        moduleDetail.setModuleName(moduleName);

        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(moduleDetail);

        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setTenantId(tenantId);
        mdmsCriteria.setModuleDetails(moduleDetails);

        return new MdmsCriteriaReq(requestInfo, mdmsCriteria);
    }

    public List<String> getTenantIds(RequestInfo requestInfo,String tenantId) {

        MdmsCriteriaReq mdmsCriteriaReq = getMasterRequest(requestInfo, tenantId,
                RLConstants.MDMS_TENANT_MODULE_NAME, RLConstants.MDMS_TENANT_MASTER_NAME, null);

        try {
            Object result = repository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
            return JsonPath.read(result, RLConstants.JSONPATH_TENANT_CODES);
        } catch (Exception e) {
            throw new CustomException("INVALID_TENANT_ID", "Error fetching tenants from MDMS");
        }
    }

    public StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(configs.getMdmsHost()).append(configs.getMdmsEndpoint());
    }

    public MdmsCriteriaReq getMdmsRequestForBillingAndTax(RequestInfo requestInfo, String tenantId) {
        List<MasterDetail> masterDetailsForBillingPeriod = new ArrayList<>();
        List<MasterDetail> masterDetailsForTaxPeriod = new ArrayList<>();
        masterDetailsForBillingPeriod.add(MasterDetail.builder().name(RLConstants.BILLING_PERIOD_MASTER).build());
        masterDetailsForTaxPeriod.add(MasterDetail.builder().name(RLConstants.TAX_PERIOD_MASTER).build());

        ModuleDetail moduleDetailForTaxPeriod = ModuleDetail.builder()
                .moduleName(RLConstants.BILLING_SERVICE_MASTER)
                .masterDetails(masterDetailsForTaxPeriod)
                .build();

        ModuleDetail moduleDetailForBillingPeriod = ModuleDetail.builder()
                .moduleName(RLConstants.RL_SERVICES_MASTER_MODULE)
                .masterDetails(masterDetailsForBillingPeriod)
                .build();

        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(moduleDetailForTaxPeriod);
        moduleDetails.add(moduleDetailForBillingPeriod);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
                .tenantId(tenantId)
                .moduleDetails(moduleDetails)
                .build();

        return MdmsCriteriaReq.builder()
                .requestInfo(requestInfo)
                .mdmsCriteria(mdmsCriteria)
                .build();
    }

    public Map<String, Object> getBillingAndTaxPeriods(String tenantId, RequestInfo requestInfo) {
        MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestForBillingAndTax(requestInfo, tenantId);
        Object result = repository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        Map<String, Object> mdmsData = new HashMap<>();

        try {
            Map<String, Map<String, List<Object>>> mdmsResponse = (Map) result;
            List<Map<String, Object>> billingPeriod =
                    JsonPath.read(mdmsResponse, "$.MdmsRes['rl-services-masters'].billingPeriod");

            List<Map<String, Object>> taxPeriod =
                    JsonPath.read(mdmsResponse, "$.MdmsRes.BillingService.TaxPeriod[?(@.service == 'rl-services')]");

            List<BillingPeriod> billingPeriods = billingPeriod
                    .stream()
                    .map(obj -> mapper.convertValue(obj, BillingPeriod.class))
                    .collect(Collectors.toList());
            if (billingPeriods == null || billingPeriods.isEmpty()) {
                log.error("No billing periods found for tenant: {}", tenantId);
                throw new CustomException("NO_BILLING_PERIODS", "No billing periods found for tenant: " + tenantId);
            }
            List<TaxPeriod> taxPeriods = taxPeriod
                    .stream()
                    .map(obj -> mapper.convertValue(obj, TaxPeriod.class))
                    .collect(Collectors.toList());

            mdmsData.put(RLConstants.BILLING_PERIOD_MASTER, billingPeriods);
            mdmsData.put(RLConstants.TAX_PERIOD_MASTER, taxPeriods);

        } catch (Exception e) {
            log.error("Error parsing MDMS response", e);
            throw new CustomException("MDMS_PARSING_ERROR", "Failed to parse MDMS response");
        }
        return mdmsData;
    }
}
