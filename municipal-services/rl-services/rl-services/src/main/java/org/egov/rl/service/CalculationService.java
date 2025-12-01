package org.egov.rl.service;


import org.apache.el.parser.ELParserTreeConstants;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.models.AdditionalFeeRate;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.BreedType;
import org.egov.rl.models.DemandDetail;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.util.CommonUtils;
import org.egov.rl.util.FeeCalculationUtil;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.util.RLConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class CalculationService {

	@Autowired
	private PropertyUtil mdmsUtil;

	@Autowired
	private FeeCalculationUtil feeCalculationUtil;
	
	@Autowired
	private AllotmentRepository allotmentRepository;

	/**
	 * Calculates the demand based on the provided PetRegistrationRequest.
	 *
	 * @param petRegistrationRequest The request containing pet registration
	 *                               applications.
	 * @return A list of DemandDetail objects representing the calculated demand.
	 */
	public List<DemandDetail> calculateDemand(AllotmentRequest allotmentRequest) {
		String tenantId = allotmentRequest.getAllotment().getTenantId();

		List<BreedType> calculationTypes =  mdmsUtil.getcalculationType(allotmentRequest.getRequestInfo(),
				tenantId, RLConstants.RL_MASTER_MODULE_NAME);

		return processCalculationForDemandGeneration(tenantId, calculationTypes, allotmentRequest);
	}

	private List<DemandDetail> processCalculationForDemandGeneration(String tenantId,
																	 List<BreedType> calculationTypes, AllotmentRequest allotmentRequest) {

		String applicationType = allotmentRequest.getAllotment().getApplicationType();
		BigDecimal baseRegistrationFee = BigDecimal.ZERO;
		List<DemandDetail> demandDetails = new ArrayList<>();

		// Step 1: Calculate base registration fee
		for (BreedType type : calculationTypes) {
			if (applicationType.equalsIgnoreCase("NEW")) {
				baseRegistrationFee = type.getNewapplication();
				DemandDetail baseDemandDetail = DemandDetail.builder()
						.taxAmount(baseRegistrationFee)
						.taxHeadMasterCode(type.getFeeType())
						.tenantId(tenantId)
						.build();
				demandDetails.add(baseDemandDetail);
				break;
			}

			if (applicationType.equalsIgnoreCase("RENEWAL")) {
				baseRegistrationFee = type.getRenewapplication();
				DemandDetail baseDemandDetail = DemandDetail.builder()
						.taxAmount(baseRegistrationFee)
						.taxHeadMasterCode(type.getFeeType())
						.tenantId(tenantId)
						.build();
				demandDetails.add(baseDemandDetail);
				break;
			}
		}

		// Step 2: Calculate additional fees (ServiceCharge, PenaltyFee, InterestAmount)
//		calculateAdditionalFees(al, tenantId, baseRegistrationFee, demandDetails);

		return demandDetails;
	}

//	/**
//	 * Calculates additional fees (ServiceCharge, PenaltyFee, InterestAmount) and adds them to demand details
//	 * Flexible method that can handle any number of fee types from MDMS
//	 */
//	private void calculateAdditionalFees(AllotmentRequest allotmentRequest, String tenantId, 
//										BigDecimal baseRegistrationFee, List<DemandDetail> demandDetails) {
//		
//		String currentFY = feeCalculationUtil.getCurrentFinancialYear();
//		AllotmentDetails application = allotmentRequest.getAllotment();
//		String applicationType = application.getApplicationType();
//		long applicationDateMillis = application.getAuditDetails().getCreatedTime();
//		
//		// Define fee types to calculate - this can be easily extended
//		String[] feeTypes = {"ServiceCharge", "PenaltyFee", "InterestAmount"};
//		String[] taxHeadCodes = {"SERVICE_CHARGE", "PENALTY_FEE", "INTEREST_AMOUNT"};
//
//		// Calculate each fee type
//		for (int i = 0; i < feeTypes.length; i++) {
//			String feeType = feeTypes[i];
//			String taxHeadCode = taxHeadCodes[i];
//			
//			// Special handling for PenaltyFee
//			if ("PenaltyFee".equals(feeType)) {
//				calculatePenaltyFee(allotmentRequest, tenantId, baseRegistrationFee, 
//					applicationType, applicationDateMillis, currentFY, taxHeadCode, demandDetails);
//				continue;
//			}
//			
//			// For other fees, use standard calculation
//			int daysElapsed = feeCalculationUtil.calculateDaysElapsed(applicationDateMillis);
//			
//			// Fetch configurations from MDMS
//			List<AdditionalFeeRate> feeConfigs = mdmsUtil.getFeeConfig(
//				allotmentRequest.getRequestInfo(), tenantId, RLConstants.RL_MASTER_MODULE_NAME, feeType);
//			
//			// Calculate and add to demand details
//			calculateAndAddFeeToDemandDetails(feeConfigs, baseRegistrationFee, daysElapsed, 
//				currentFY, tenantId, taxHeadCode, demandDetails);
//		}
//	}
//	
//	/**
//	 * Calculates penalty fee based on application type and validity date
//	 * For NEW applications: PenaltyFee = 0 (but still added to demand)
//	 * For RENEW applications: Calculated based on days from validity date with tiered structure
//	 * Penalty fee is always added to demand details, even if amount is 0
//	 */
//	private void calculatePenaltyFee(AllotmentRequest allotmentRequest, String tenantId,
//			BigDecimal baseRegistrationFee, String applicationType, long applicationDateMillis, 
//			String currentFY, String taxHeadCode, List<DemandDetail> demandDetails) {
//		
//		BigDecimal penaltyAmount = BigDecimal.ZERO;
//		AllotmentDetails application = allotmentRequest.getAllotment();
//		
//		// For NEW applications, penalty fee is always 0
//		if ("NEW".equalsIgnoreCase(applicationType)) {
//			penaltyAmount = BigDecimal.ZERO;
//		}
//		// For RENEW applications, calculate penalty based on validity date
//		else if ("RENEWAL".equalsIgnoreCase(applicationType)) {
//			// Get previous application's validity date
//			Long validityDate = getPreviousApplicationValidityDate(application, allotmentRequest.getRequestInfo());
//			
//			if (validityDate == null) {
//				log.warn("Could not find previous application validity date for renewal application: {}. Setting penalty to 0.", 
//					application.getApplicationNumber());
//				penaltyAmount = BigDecimal.ZERO;
//			} else {
//				// Calculate days from validity date to application creation date
//				int daysFromValidityDate = feeCalculationUtil.calculateDaysFromValidityDate(validityDate, applicationDateMillis);
//				
//				// If renewal happens before validity date expires, no penalty
//				if (daysFromValidityDate <= 0) {
//					log.debug("Renewal application {} is before or on validity date ({} days), penalty = 0", 
//						application.getApplicationNumber(), daysFromValidityDate);
//					penaltyAmount = BigDecimal.ZERO;
//				} else {
//					log.debug("Renewal application {} is {} days after validity date", 
//						application.getApplicationNumber(), daysFromValidityDate);
//					
//					// Fetch penalty configurations from MDMS
//					List<AdditionalFeeRate> penaltyConfigs = mdmsUtil.getPenaltyFeeConfig(
//						allotmentRequest.getRequestInfo(), tenantId, RLConstants.RL_MASTER_MODULE_NAME);
//					
//					// Calculate tiered penalty
//					penaltyAmount = feeCalculationUtil.calculateTieredPenalty(
//						penaltyConfigs, daysFromValidityDate, currentFY);
//				}
//			}
//		}
//		
//		// Always add penalty fee to demand details, even if amount is 0
//		DemandDetail penaltyDemandDetail = DemandDetail.builder()
//			.taxAmount(penaltyAmount)
//			.taxHeadMasterCode(taxHeadCode)
//			.tenantId(tenantId)
//			.build();
//		demandDetails.add(penaltyDemandDetail);
//	}
//	
//	/**
//	 * Gets the validity date from the previous application for renewal applications
//	 */
//	private Long getPreviousApplicationValidityDate(AllotmentDetails application,RequestInfo requestInfo) {
//		
//		if (application.getPreviousApplicationNumber() == null || 
//			application.getPreviousApplicationNumber().isEmpty()) {
//			log.warn("Previous application number is not provided for renewal: {}", 
//				application.getApplicationNumber());
//			return null;
//		}
//		
//		try {
//			// Search for previous application
//			AllotmentCriteria criteria = AllotmentCriteria.builder()
//				.applicationNumbers(Collections.singleton(application.getPreviousApplicationNumber()))
//				.tenantId(application.getTenantId())
//				.build();
//			
//			AllotmentDetails previousApps = allotmentRepository.getAllotmentByApplicationNumber(criteria);
//			
//			if (previousApps == null) {
//				log.warn("Previous application not found: {} for renewal: {}", 
//					application.getPreviousApplicationNumber(), application.getApplicationNumber());
//				return null;
//			}
//			
////			AllotmentCriteria previousApp = previousApps.get(0);
//			Long endDate = previousApps.getEndDate();
//			if (endDate == null) {
//				log.warn("Previous application {} does not have End date", 
//					previousApps.getApplicationNumber());
//				return null;
//			}
//			
//			// Convert validity date from seconds to milliseconds if needed
//			// Timestamps less than year 2001 in milliseconds are likely in seconds
//			if (endDate < 1000000000000L) {
//				endDate = endDate * 1000;
//				log.debug("Converted validity date from seconds to milliseconds: {}", endDate);
//			}
//			
//			return endDate;
//		} catch (Exception e) {
//			log.error("Error fetching previous application validity date: {}", e.getMessage(), e);
//			return null;
//		}
//	}
//
//	/**
//	 * Calculates fee amount for given configurations and adds to demand details
//	 */
//	private void calculateAndAddFeeToDemandDetails(List<AdditionalFeeRate> feeConfigs, BigDecimal baseAmount, 
//		int daysElapsed, String currentFY, String tenantId, String taxHeadCode, List<DemandDetail> demandDetails) {
//		
//		for (AdditionalFeeRate feeConfig : feeConfigs) {
//			BigDecimal feeAmount = feeCalculationUtil.calculateFeeAmount(feeConfig, baseAmount, daysElapsed, currentFY);
//			
//			if (feeAmount.compareTo(BigDecimal.ZERO) > 0) {
//				DemandDetail demandDetail = DemandDetail.builder()
//						.taxAmount(feeAmount)
//						.taxHeadMasterCode(taxHeadCode)
//						.tenantId(tenantId)
//						.build();
//				demandDetails.add(demandDetail);
//			}
//		}
//	}
}
