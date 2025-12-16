package org.egov.rl.calculator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.repository.Repository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.demand.Demand;

import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.demand.DemandResponse;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;

import java.util.*;

@Service
public class DemandService {

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
		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

			AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();

			String tenantId = allotmentRequest.getAllotment().getTenantId();
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
					.taxPeriodFrom(Long.valueOf("1743445800000"))
					.taxPeriodTo(Long.valueOf("1774981799000"))
					.consumerType(applicationType)
					.businessService(RLConstants.RL_SERVICE_NAME)
					.additionalDetails(null)
					.build();

			demands.add(demand);
		}


		List<Demand> demands1 = demandRepository.saveDemand(calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
	return DemandResponse.builder().demands(demands1).build();

	}


	public DemandResponse updateDemands(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {

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
		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

			AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();

			String tenantId = allotmentRequest.getAllotment().getTenantId();
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
					.taxPeriodFrom(Long.valueOf("1743445800000"))
					.taxPeriodTo(Long.valueOf("1774981799000"))
					.consumerType(applicationType)
					.businessService(RLConstants.RL_SERVICE_NAME)
					.additionalDetails(null)
					.build();

			demands.add(demand);
		}


//		List<Demand> demands1 = demandRepository.saveDemand(calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
		return DemandResponse.builder().demands(demands).build();

	}
}