package org.egov.ptr.service;

import org.egov.ptr.models.AdditionalFeeRate;
import org.egov.ptr.models.BreedType;
import org.egov.ptr.models.DemandDetail;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.util.FeeCalculationUtil;
import org.egov.ptr.util.PTRConstants;
import org.egov.ptr.util.PetUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CalculationService {

	@Autowired
	private PetUtil mdmsUtil;

	@Autowired
	private FeeCalculationUtil feeCalculationUtil;

	/**
	 * Calculates the demand based on the provided PetRegistrationRequest.
	 *
	 * @param petRegistrationRequest The request containing pet registration
	 *                               applications.
	 * @return A list of DemandDetail objects representing the calculated demand.
	 */
	public List<DemandDetail> calculateDemand(PetRegistrationRequest petRegistrationRequest) {
		String tenantId = petRegistrationRequest.getPetRegistrationApplications().get(0).getTenantId();

		List<BreedType> calculationTypes = mdmsUtil.getcalculationType(petRegistrationRequest.getRequestInfo(),
				tenantId, PTRConstants.PET_MASTER_MODULE_NAME);


		return processCalculationForDemandGeneration(tenantId, calculationTypes, petRegistrationRequest);
	}

	private List<DemandDetail> processCalculationForDemandGeneration(String tenantId,
																	 List<BreedType> calculationTypes, PetRegistrationRequest petRegistrationRequest) {

		String applicationType = petRegistrationRequest.getPetRegistrationApplications().get(0).getApplicationType();
		BigDecimal baseRegistrationFee = BigDecimal.ZERO;
		List<DemandDetail> demandDetails = new ArrayList<>();

		// Step 1: Calculate base registration fee
		for (BreedType type : calculationTypes) {
			if (applicationType.equalsIgnoreCase("NEWAPPLICATION") &&
					petRegistrationRequest.getPetRegistrationApplications().get(0).getPetDetails().getBreedType().equals(type.getName())) {
				baseRegistrationFee = type.getNewapplication();
				DemandDetail baseDemandDetail = DemandDetail.builder()
						.taxAmount(baseRegistrationFee)
						.taxHeadMasterCode(type.getFeeType())
						.tenantId(tenantId)
						.build();
				demandDetails.add(baseDemandDetail);
				break;
			}

			if (applicationType.equalsIgnoreCase("RENEWAPPLICATION") &&
					petRegistrationRequest.getPetRegistrationApplications().get(0).getPetDetails().getBreedType().equals(type.getName())) {
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
		calculateAdditionalFees(petRegistrationRequest, tenantId, baseRegistrationFee, demandDetails);

		return demandDetails;
	}

	/**
	 * Calculates additional fees (ServiceCharge, PenaltyFee, InterestAmount) and adds them to demand details
	 * Flexible method that can handle any number of fee types from MDMS
	 */
	private void calculateAdditionalFees(PetRegistrationRequest petRegistrationRequest, String tenantId, 
										BigDecimal baseRegistrationFee, List<DemandDetail> demandDetails) {
		
		String currentFY = feeCalculationUtil.getCurrentFinancialYear();
		long applicationDateMillis = petRegistrationRequest.getPetRegistrationApplications().get(0).getAuditDetails().getCreatedTime();
		int daysElapsed = feeCalculationUtil.calculateDaysElapsed(applicationDateMillis);

		// Define fee types to calculate - this can be easily extended
		String[] feeTypes = {"ServiceCharge", "PenaltyFee", "InterestAmount"};
		String[] taxHeadCodes = {"SERVICE_CHARGE", "PENALTY_FEE", "INTEREST_AMOUNT"};

		// Calculate each fee type
		for (int i = 0; i < feeTypes.length; i++) {
			String feeType = feeTypes[i];
			String taxHeadCode = taxHeadCodes[i];
			
			// Fetch configurations from MDMS
			List<AdditionalFeeRate> feeConfigs = mdmsUtil.getFeeConfig(
				petRegistrationRequest.getRequestInfo(), tenantId, PTRConstants.PET_MASTER_MODULE_NAME, feeType);
			
			// Calculate and add to demand details
			calculateAndAddFeeToDemandDetails(feeConfigs, baseRegistrationFee, daysElapsed, 
				currentFY, tenantId, taxHeadCode, demandDetails);
		}
	}

	/**
	 * Calculates fee amount for given configurations and adds to demand details
	 */
	private void calculateAndAddFeeToDemandDetails(List<AdditionalFeeRate> feeConfigs, BigDecimal baseAmount, 
		int daysElapsed, String currentFY, String tenantId, String taxHeadCode, List<DemandDetail> demandDetails) {
		
		for (AdditionalFeeRate feeConfig : feeConfigs) {
			BigDecimal feeAmount = feeCalculationUtil.calculateFeeAmount(feeConfig, baseAmount, daysElapsed, currentFY);
			
			if (feeAmount.compareTo(BigDecimal.ZERO) > 0) {
				DemandDetail demandDetail = DemandDetail.builder()
						.taxAmount(feeAmount)
						.taxHeadMasterCode(taxHeadCode)
						.tenantId(tenantId)
						.build();
				demandDetails.add(demandDetail);
			}
		}
	}
}

