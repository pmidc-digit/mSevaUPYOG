package org.egov.rl.services.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.*;
import org.egov.rl.services.models.demand.CalculationCriteria;
import org.egov.rl.services.models.demand.CalculationReq;
import org.egov.rl.services.models.demand.DemandResponse;
import org.egov.rl.services.producer.AllotmentProducer;
import org.egov.rl.services.repository.AllotmentRepository;
import org.egov.rl.services.repository.ServiceRequestRepository;
import org.egov.rl.services.util.EncryptionDecryptionUtil;
import org.egov.rl.services.util.RLConstants;
import org.egov.rl.services.validator.AllotmentValidator;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class AllotmentService {

	@Autowired
	ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private AllotmentProducer allotmentProducer;

	@Autowired
	private RentLeaseConfiguration config;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private AllotmentEnrichmentService allotmentEnrichmentService;

	@Autowired
	private AllotmentValidator allotmentValidator;

	@Autowired
	private workflowService wfService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;

	@Autowired
	BoundaryService boundaryService;

	@Autowired
	UserService userService;

	@Autowired
	AllotmentRepository allotmentRepository;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public AllotmentDetails allotmentCreate(AllotmentRequest allotmentRequest) {

		allotmentValidator.validateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichCreateRequest(allotmentRequest);
		userService.createUser(allotmentRequest);

		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().get(0).setStatus("APPROVED");
		}
		String previousApplicationNumber = allotmentRequest.getAllotment().get(0).getPreviousApplicationNumber();
		if (previousApplicationNumber != null && previousApplicationNumber.trim().length() > 0) {
			AllotmentDetails allotment = allotmentRequest.getAllotment().get(0);
			allotment.setApplicationType("RENEWAL");
			allotmentRequest.setAllotment(Arrays.asList(allotment));
		} else {
			AllotmentDetails allotment = allotmentRequest.getAllotment().get(0);
			allotment.setApplicationType("NEW");
			allotmentRequest.setAllotment(Arrays.asList(allotment));
		}
		allotmentProducer.push(config.getSaveRLAllotmentTopic(), allotmentRequest);
	    AllotmentDetails allotment =	allotmentRequest.getAllotment().get(0);
	    allotment.setWorkflow(null);
		allotmentRequest.setAllotment(Arrays.asList(allotment));
		return allotmentRequest.getAllotment().get(0);
	}

	public AllotmentDetails allotmentUpdate(AllotmentRequest allotmentRequest) {
        String action=allotmentRequest.getAllotment().get(0).getWorkflow().getAction();
        String applicationType=allotmentRequest.getAllotment().get(0).getApplicationType();
		allotmentValidator.validateUpdateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichUpdateRequest(allotmentRequest);
		userService.createUser(allotmentRequest);
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		allotmentRequest.setAllotment(Arrays.asList(allotmentDetails));
		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().get(0).setStatus("APPROVED");
		}
		boolean isApprove = action.contains(RLConstants.APPROVED_RL_APPLICATION);
		if (isApprove && applicationType.contains(RLConstants.NEW_RL_APPLICATION)) {
			try {
				callCalculatorService(false,true,allotmentRequest);
			} catch (Exception e) {
				e.printStackTrace();
				throw new CustomException("CREATE_DEMAND_ERROR",
						"Error occured while demand generation.");
			}
		} else if (isApprove) {
			try {
				callCalculatorService(false,false,allotmentRequest);
			} catch (Exception e) {
				e.printStackTrace();
				throw new CustomException("CREATE_DEMAND_ERROR",
						"Error occured while demand generation.");
			}
		}
		
		if(action.equalsIgnoreCase(RLConstants.FORWARD_FOR_SATELMENT_RL_APPLICATION)) {
			satelmentAllotment(allotmentRequest);
		}
		
		allotmentProducer.push(config.getUpdateRLAllotmentTopic(), allotmentRequest);
		allotmentRequest.getAllotment().get(0).setWorkflow(null);
		return allotmentRequest.getAllotment().get(0);
	}
	
	private void satelmentAllotment(AllotmentRequest allotmentRequest) {
		List<RLProperty> calculateAmount = boundaryService.allPropertyList(allotmentRequest);
		
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		
		BigDecimal amountDeducted = allotmentDetails.getAmountToBeDeducted(); // BigDecimal
		
		BigDecimal securityAmount = calculateAmount.stream()
				.filter(d -> d.getPropertyId().equals(allotmentDetails.getPropertyId())).findFirst()
				.map(d -> new BigDecimal(d.getSecurityDeposit())) // BigDecimal
				.orElse(BigDecimal.ZERO);
		BigDecimal amountToBeRefunded = securityAmount.subtract(amountDeducted);
	
		if(amountToBeRefunded.compareTo(BigDecimal.ZERO) > 0) {
		    allotmentRequest.getAllotment().get(0).setAmountToBeRefund(amountToBeRefunded);
		} else {
			callCalculatorService(true,false,allotmentRequest);
		}
	}
	
	private String callCalculatorService(boolean isSatelment,boolean isSecurityDeposite,AllotmentRequest allotmentRequest) {
		CalculationReq calculationReq = getCalculationReq(isSatelment,isSecurityDeposite,allotmentRequest);

		StringBuilder url = new StringBuilder().append(config.getRlCalculatorHost())
				.append(config.getRlCalculatorEndpoint());
		Object response = serviceRequestRepository.fetchResult(url, calculationReq).get();
		DemandResponse demandResponse = mapper.convertValue(response, DemandResponse.class);
		String demandId =demandResponse.getDemands().get(0).getId();
		return demandId;
	}

	private CalculationReq getCalculationReq(boolean isSatelment,boolean isSecurityDeposite,AllotmentRequest allotmentRequest) {
		CalculationReq calculationReq =new CalculationReq();
		calculationReq.setRequestInfo(allotmentRequest.getRequestInfo());
		List<CalculationCriteria> calculationCriteriaList = new ArrayList<>();
		CalculationCriteria calculationCriteria =CalculationCriteria.builder()
				.isSecurityDeposite(isSecurityDeposite)
				.isSatelment(isSatelment?isSatelment:false)
				.allotmentRequest(allotmentRequest)
				.build();
		calculationCriteriaList.add(calculationCriteria);
		calculationReq.setCalculationCriteria(calculationCriteriaList);
		return calculationReq;
	}

	public List<AllotmentDetails> searchAllotedApplications(RequestInfo requestInfo,
			AllotmentCriteria allotmentCriteria) {

// Handle mobile number search by converting to owner UUIDs
		if (!ObjectUtils.isEmpty(allotmentCriteria.getMobileNumber())) {
			log.info("DEBUG: Searching by mobile number: " + allotmentCriteria.getMobileNumber());

			List<String> userUuids1 = userService.getUserUuidsByMobileNumber(allotmentCriteria.getMobileNumber(),
					allotmentCriteria.getTenantId(), requestInfo);
			Set<String> userUuidSet = new HashSet<>(userUuids1);
			log.info("DEBUG: Found user UUIDs: " + userUuidSet);

			if (CollectionUtils.isEmpty(userUuidSet)) {
           // No users found for this mobile number, return empty list
				log.info("DEBUG: No users found for mobile number, returning empty list");
				return new ArrayList<>();
			}

// Set owner UUIDs for search and clear mobile number
			allotmentCriteria.setOwnerIds(userUuidSet);
			allotmentCriteria.setMobileNumber(null);
		}
		
		List<AllotmentDetails> applications = allotmentRepository.getAllotmentSearch(allotmentCriteria);
		if (CollectionUtils.isEmpty(applications))
			return new ArrayList<>();
		allotmentEnrichmentService.enrichOwnerDetailsFromUserService(applications, requestInfo);
		return applications;
	}

}
