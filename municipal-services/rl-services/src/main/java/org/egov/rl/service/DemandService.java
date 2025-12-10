package org.egov.rl.service;

//import static org.egov.ptr.util.PTRConstants.EMPTY_DEMAND_ERROR_CODE;
//import static org.egov.ptr.util.PTRConstants.EMPTY_DEMAND_ERROR_MESSAGE;
//import static org.egov.ptr.util.PTRConstants.PET_BUSINESSSERVICE;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.Demand;
import org.egov.rl.models.DemandDetail;
import org.egov.rl.models.DemandResponse;
import org.egov.rl.models.Owner;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.collection.GetBillCriteria;
import org.egov.rl.models.user.User;
import org.egov.rl.repository.DemandRepository;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.util.CommonUtils;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.util.RLConstants;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DemandService {

	@Autowired
	private RentLeaseConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private DemandRepository demandRepository;

	@Autowired
	private PropertyUtil utill;

	@Autowired
	private CalculationService calculationService;

	public List<Demand> createDemand(boolean isSecurityDeposite,AllotmentRequest allotmentRequest) {
		String tenantId = allotmentRequest.getAllotment().getTenantId();
		String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

		OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId()).uuid(ownerInfo.getUserUuid())
				.mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId()).build();
		List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite,allotmentRequest);
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

		List<Demand> demands = new ArrayList<>();
		demands.add(demand);
		return demandRepository.saveDemand(allotmentRequest.getRequestInfo(), demands);
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

}