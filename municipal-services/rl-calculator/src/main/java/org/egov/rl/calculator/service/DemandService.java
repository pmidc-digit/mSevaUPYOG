package org.egov.rl.calculator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.repository.Repository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.demand.*;

import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
@Slf4j
@Service
public class DemandService {


    @Autowired
    MasterDataService mstrDataService;

    @Autowired
    private Configurations config;

    @Autowired
    private Repository serviceRequestRepository;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private DemandRepository demandRepository;

    @Autowired
    private PropertyUtil utill;

    @Autowired
    private CalculationService calculationService;

    public DemandResponse createDemand(boolean isSecurityDeposite, CalculationReq calculationReq) {


        List<Demand> demands = new ArrayList<>();
        RequestInfo requestInfo = calculationReq.getRequestInfo();
        String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment().getTenantId();

        List<BillingPeriod> billingPeriods = mstrDataService.getBillingPeriod(requestInfo, tenantId);
        BillingPeriod billingPeriod = billingPeriods.get(0); // Assuming that each ulb will follow only one type of billing

        for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

            AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();

//            String tenantId = allotmentRequest.getAllotment().getTenantId();
            String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

            OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
            Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId()).uuid(ownerInfo.getUserUuid())
                    .mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId()).build();
            List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite, allotmentRequest);
            BigDecimal amountPayable = new BigDecimal(0);
            String applicationType = allotmentRequest.getAllotment().getApplicationType();

            amountPayable = demandDetails.stream()
                    .map(DemandDetail::getTaxAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Demand demand = Demand.builder()
                    .consumerCode(consumerCode)
                    .demandDetails(demandDetails)
                    .payer(payerUser)
                    .minimumAmountPayable(amountPayable)
                    .tenantId(tenantId)
                    .taxPeriodFrom(billingPeriod.getTaxPeriodFrom())
                    .taxPeriodTo(billingPeriod.getTaxPeriodTo())
                    .billExpiryTime(billingPeriod.getDemandEndDateMillis())
                    .consumerType(applicationType)
                    .businessService(RLConstants.RL_SERVICE_NAME)
                    .additionalDetails(null)
                    .build();

            demands.add(demand);
        }


        List<Demand> demands1 = demandRepository.saveDemand(calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
        return DemandResponse.builder().demands(demands1).build();

    }


    public DemandResponse updateDemandsbkp(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {

        if (getBillCriteria.getAmountExpected() == null) getBillCriteria.setAmountExpected(BigDecimal.ZERO);
//		RequestInfo requestInfo = requestInfoWrapper.getRequestInfo();
        DemandResponse res = mapper.convertValue(
                serviceRequestRepository.fetchResult(utill.getDemandSearchUrl(getBillCriteria), requestInfoWrapper),
                DemandResponse.class);
        if (CollectionUtils.isEmpty(res.getDemands())) {
            Map<String, String> map = new HashMap<>();
            map.put(RLConstants.EMPTY_DEMAND_ERROR_CODE, RLConstants.EMPTY_DEMAND_ERROR_MESSAGE);
        }

        Map<String,List<Demand>> consumerCodeToDemandMap = new HashMap<>();
        res.getDemands().forEach(demand -> {
            if(consumerCodeToDemandMap.containsKey(demand.getConsumerCode()))
                consumerCodeToDemandMap.get(demand.getConsumerCode()).add(demand);
            else {
                List<Demand> demands = new LinkedList<>();
                demands.add(demand);
                consumerCodeToDemandMap.put(demand.getConsumerCode(),demands);
            }
        });

//		if (!CollectionUtils.isEmpty(consumerCodeToDemandMap)) {
//			List<Demand> demandsToBeUpdated = new LinkedList<>();
//			DemandRequest request = DemandRequest.builder().demands(demandsToBeUpdated).requestInfo(requestInfo).build();
//			StringBuilder updateDemandUrl = petUtil.getUpdateDemandUrl();
//            repository.fetchResult(updateDemandUrl, request);
//		}
        return res;
    }


    public DemandResponse estimate(boolean isSecurityDeposite, CalculationReq calculationReq) {

        List<Demand> demands = new ArrayList<>();
        RequestInfo requestInfo = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo();
        String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment().getTenantId();

        List<BillingPeriod> billingPeriods = mstrDataService.getBillingPeriod(requestInfo, tenantId);
        BillingPeriod billingPeriod = billingPeriods.get(0); // Assuming that each ulb will follow only one type of billing

        for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

            AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();

//            String tenantId = allotmentRequest.getAllotment().getTenantId();
            String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

            OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
            Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId()).uuid(ownerInfo.getUserUuid())
                    .mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId()).build();
            List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite, allotmentRequest);
            BigDecimal amountPayable = new BigDecimal(0);
            String applicationType = allotmentRequest.getAllotment().getApplicationType();

            amountPayable = demandDetails.stream()
                    .map(DemandDetail::getTaxAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Demand demand = Demand.builder()
                    .consumerCode(consumerCode)
                    .demandDetails(demandDetails)
                    .payer(payerUser)
                    .minimumAmountPayable(amountPayable)
                    .tenantId(tenantId)
                    .taxPeriodFrom(billingPeriod.getTaxPeriodFrom())
                    .taxPeriodTo(billingPeriod.getTaxPeriodTo())
                    .billExpiryTime(billingPeriod.getDemandEndDateMillis())
                    .consumerType(applicationType)
                    .businessService(RLConstants.RL_SERVICE_NAME)
                    .additionalDetails(null)
                    .build();

            demands.add(demand);
        }

//        List<Demand> demands1 = demandRepository.saveDemand(calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
        return DemandResponse.builder().demands(demands).build();

    }


    public DemandResponse updateDemands(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {

        if (getBillCriteria.getAmountExpected() == null)
            getBillCriteria.setAmountExpected(BigDecimal.ZERO);
        RequestInfo requestInfo = requestInfoWrapper.getRequestInfo();

        if (CollectionUtils.isEmpty(getBillCriteria.getConsumerCodes())) {
            getBillCriteria.setConsumerCodes(Collections.singletonList(getBillCriteria.getApplicationNumber()));
        }

        DemandResponse res = mapper.convertValue(
                serviceRequestRepository.fetchResult(utill.getDemandSearchUrl(getBillCriteria), requestInfoWrapper),
                DemandResponse.class);

        if (CollectionUtils.isEmpty(res.getDemands())) {
            Map<String, String> map = new HashMap<>();
            map.put(RLConstants.EMPTY_DEMAND_ERROR_CODE, RLConstants.EMPTY_DEMAND_ERROR_MESSAGE);
            throw new CustomException(map);
        }

        List<Demand> demands = res.getDemands().stream()
                .filter(d -> d.getStatus() == null || !d.getStatus().toString().equalsIgnoreCase(RLConstants.DEMAND_CANCELLED_STATUS))
                .collect(Collectors.toList());

        if (CollectionUtils.isEmpty(demands)) {
            return DemandResponse.builder().demands(Collections.emptyList()).build();
        }

        List<Demand> demandsToBeUpdated = new LinkedList<>();
        String tenantId = getBillCriteria.getTenantId();
        List<TaxPeriod> taxPeriods = mstrDataService.getTaxPeriodList(requestInfo, tenantId, RLConstants.RL_SERVICE_NAME);
        List<BillingPeriod> billingPeriods = mstrDataService.getBillingPeriod(requestInfo, tenantId);
        List<Penalty> penaltySlabs = mstrDataService.getPenaltySlabs(requestInfo, tenantId);

        for (Demand demand : demands) {
            BigDecimal totalTax = demand.getDemandDetails().stream().map(DemandDetail::getTaxAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalCollection = demand.getDemandDetails().stream().map(DemandDetail::getCollectionAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalTax.compareTo(totalCollection) > 0) {
                applyTimeBasedApplicables(demand, requestInfoWrapper, taxPeriods,billingPeriods,penaltySlabs);
            }

            addRoundOffTaxHead(demand.getTenantId(), demand.getDemandDetails());
            demandsToBeUpdated.add(demand);
        }

        demandRepository.updateDemand(requestInfo, demandsToBeUpdated);
        return DemandResponse.builder().demands(demandsToBeUpdated).build();
    }

    private void applyTimeBasedApplicables(Demand demand, RequestInfoWrapper requestInfoWrapper, List<TaxPeriod> taxPeriods, List<BillingPeriod> billingPeriods, List<Penalty> penaltySlabs) {
        log.info("Applying time based applicables for demand: {}", demand.getId());

        if (CollectionUtils.isEmpty(penaltySlabs)) {
            log.info("No penalty slabs found for tenant: {}", demand.getTenantId());
            return;
        }
        log.info("Found {} penalty slabs.", penaltySlabs.size());

        Long demandCreationTime = demand.getAuditDetails() != null ? demand.getAuditDetails().getCreatedTime() : null;
        Long expiryDurationMillis = demand.getBillExpiryTime();
        log.info("Demand ID: {}. Creation Time: {}. Expiry Days: {}", demand.getId(), demandCreationTime, expiryDurationMillis);

        if (expiryDurationMillis == null || demandCreationTime == null) {
            log.error("Cannot apply penalty. Demand creation time or expiry days is null for demand: {}", demand.getId());
            return;
        }

        long expiryTimeMillis = demandCreationTime + expiryDurationMillis;
        log.info("Demand ID: {}. Calculated Expiry Timestamp: {}. Current Time: {}", demand.getId(), expiryTimeMillis, System.currentTimeMillis());

        if (System.currentTimeMillis() < expiryTimeMillis) {
            log.info("Demand is not yet overdue. Skipping penalty calculation for demand: {}", demand.getId());
            return;
        }

        boolean penaltyAlreadyApplied = demand.getDemandDetails().stream()
                .anyMatch(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.PENALTY_TAXHEAD_CODE));

        if (penaltyAlreadyApplied) {
            log.info("Penalty already applied for demand: {}", demand.getId());
            return;
        }

        long daysPastExpiry = TimeUnit.MILLISECONDS.toDays(System.currentTimeMillis() - expiryTimeMillis);
        log.info("Demand ID: {}. Days Past Expiry: {}", demand.getId(), daysPastExpiry);

        BigDecimal principalAmount = demand.getDemandDetails().stream()
                .filter(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
                .map(DemandDetail::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Demand ID: {}. Principal amount for penalty calculation: {}", demand.getId(), principalAmount);

        if (principalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Principal amount is zero or less for demand: {}. Skipping penalty.", demand.getId());
            return;
        }

        Penalty penaltySlab = penaltySlabs.get(0);
        log.info("Demand ID: {}. Using Penalty Slab: Applicable After {} days.", demand.getId(), penaltySlab.getApplicableAfterDays());

        if (penaltySlab.getApplicableAfterDays() != null && daysPastExpiry > penaltySlab.getApplicableAfterDays()) {
            log.info("Applying penalty for demand: {}", demand.getId());

            BigDecimal penaltyAmount = BigDecimal.ZERO;

            if (penaltySlab.getRate() != null && penaltySlab.getRate().compareTo(BigDecimal.ZERO) > 0) {
                penaltyAmount = principalAmount.multiply(penaltySlab.getRate()).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            } else if (penaltySlab.getFlatAmount() != null && penaltySlab.getFlatAmount().compareTo(BigDecimal.ZERO) > 0) {
                penaltyAmount = penaltySlab.getFlatAmount();
            }

            if (penaltySlab.getMinAmount() != null && penaltyAmount.compareTo(penaltySlab.getMinAmount()) < 0) {
                penaltyAmount = penaltySlab.getMinAmount();
            }

            if (penaltySlab.getMaxAmount() != null && penaltyAmount.compareTo(penaltySlab.getMaxAmount()) > 0) {
                penaltyAmount = penaltySlab.getMaxAmount();
            }

            if (penaltyAmount.compareTo(BigDecimal.ZERO) > 0) {
                DemandDetail penaltyDetail = DemandDetail.builder()
                        .taxAmount(penaltyAmount)
                        .taxHeadMasterCode(RLConstants.PENALTY_TAXHEAD_CODE)
                        .tenantId(demand.getTenantId())
                        .collectionAmount(BigDecimal.ZERO)
                        .demandId(demand.getId())
                        .build();
                demand.getDemandDetails().add(penaltyDetail);
                log.info("Penalty of {} applied for demand: {}", penaltyAmount, demand.getId());
            }else {
                log.warn("Calculated penalty amount is zero or less for demand: {}. No penalty applied.", demand.getId());
            }
        } else {
            log.info("Penalty grace period not over for demand: {}", demand.getId());
        }
    }


    private void addRoundOffTaxHead(String tenantId, List<DemandDetail> demandDetails) {
        BigDecimal totalTax = demandDetails.stream().map(DemandDetail::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal roundedTotal = totalTax.setScale(0, BigDecimal.ROUND_HALF_UP);
        BigDecimal roundOffAmount = roundedTotal.subtract(totalTax);

        if (roundOffAmount.compareTo(BigDecimal.ZERO) != 0) {
            DemandDetail roundOffDetail = DemandDetail.builder()
                    .taxAmount(roundOffAmount)
                    .taxHeadMasterCode(RLConstants.ROUND_OFF_TAX_HEAD_CODE)
                    .tenantId(tenantId)
                    .collectionAmount(BigDecimal.ZERO)
                    .build();
            demandDetails.add(roundOffDetail);
        }
    }

//    public void generateDemands(RequestInfo requestInfo) {
//        List<String> tenantIds = mstrDataService.getTenantIds(requestInfo,requestInfo.getUserInfo().getTenantId());
//        log.info("Starting demand generation job for tenants: {}", tenantIds);
//
//        for (String tenantId : tenantIds) {
//            log.info("Generating demands for tenant: {}", tenantId);
//            try {
//                generateDemandForTenant(tenantId, requestInfo);
//            } catch (Exception e) {
//                log.error("Error while generating demands for tenant: " + tenantId, e);
//            }
//        }
//        log.info("Finished demand generation job.");
//    }
//
//    private void generateDemandForTenant(String tenantId, RequestInfo requestInfo) {
//        // 1. Get the current billing period from MDMS
//        List<BillingPeriod> billingPeriods = mstrDataService.getBillingPeriod(requestInfo, tenantId);
//        if (billingPeriods.isEmpty()) {
//            log.error("No billing period found for tenant: {}", tenantId);
//            return;
//        }
//        BillingPeriod currentBillingPeriod = billingPeriods.get(0);
//        long fromDate = currentBillingPeriod.get;
//        long toDate = currentBillingPeriod.getToDate();
//        log.info("Current Billing Period for tenant {}: {} to {}", tenantId, fromDate, toDate);
//
//        // 2. Fetch all active properties for the tenant
//        List<Property> properties = fetchAllPropertiesForTenant(requestInfo, tenantId);
//        if (properties.isEmpty()) {
//            log.info("No properties found for tenant: {}", tenantId);
//            return;
//        }
//
//        // 3. Filter out properties that already have a demand for the current billing period
//        List<Property> propertiesToGenerateDemand = filterPropertiesWithoutDemand(properties, requestInfo, fromDate, toDate);
//        log.info("Found {} properties requiring demand generation for tenant {}", propertiesToGenerateDemand.size(), tenantId);
//
//        // 4. Generate demands in batches
//        int batchSize = config.getDemandGenerationBatchSize();
//        List<List<Property>> batches = new ArrayList<>();
//        for (int i = 0; i < propertiesToGenerateDemand.size(); i += batchSize) {
//            batches.add(propertiesToGenerateDemand.subList(i, Math.min(i + batchSize, propertiesToGenerateDemand.size())));
//        }
//
//        for (List<Property> batch : batches) {
//            List<CalculationCriteria> criteriaList = batch.stream()
//                    .map(property -> CalculationCriteria.builder()
//                            .tenantId(property.getTenantId())
//                            .rentableId(property.getRentableId())
//                            .build())
//                    .collect(Collectors.toList());
//
//            CalculationReq req = CalculationReq.builder()
//                    .requestInfo(requestInfo)
//                    .calculationCriteria(criteriaList)
//                    .build();
//            try {
//                createDemand(req);
//            } catch (Exception e) {
//                log.error("Error creating demands for batch in tenant {}: {}", tenantId, e.getMessage());
//            }
//        }
//    }
//
////    private List<String> getTenantIds(RequestInfo requestInfo) {
////        StringBuilder url = new StringBuilder(config.getMdmsHost())
////                .append(config.getMdmsEndpoint());
////
////        MdmsCriteriaReq mdmsCriteriaReq = calculatorUtil.getMdmsRequest(requestInfo, config.getStateLevelTenantId(),
////                RLConstants.MDMS_TENANT_MODULE_NAME, RLCalculatorConstants.MDMS_TENANT_MASTER_NAME, null);
////
////        try {
////            Object result = repository.fetchResult(url, mdmsCriteriaReq);
////            return JsonPath.read(result, RLCalculatorConstants.JSONPATH_TENANT_CODES);
////        } catch (Exception e) {
////            throw new CustomException("INVALID_TENANT_ID", "Error fetching tenants from MDMS");
////        }
////    }

}

