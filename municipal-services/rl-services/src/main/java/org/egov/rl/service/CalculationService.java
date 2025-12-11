package org.egov.rl.service;

import org.apache.el.parser.ELParserTreeConstants;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.models.AdditionalFeeRate;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.BreedType;
import org.egov.rl.models.DemandDetail;
import org.egov.rl.models.RLProperty;
import org.egov.rl.models.TaxRate;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.util.CommonUtils;
import org.egov.rl.util.FeeCalculationUtil;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.util.RLConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
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
	public List<DemandDetail> calculateDemand(boolean isSecurityDeposite, AllotmentRequest allotmentRequest) {
		String tenantId = allotmentRequest.getAllotment().getTenantId();

		List<RLProperty> calculationTypes = mdmsUtil.getCalculateAmount(allotmentRequest.getAllotment().getPropertyId(),
				allotmentRequest.getRequestInfo(), tenantId, RLConstants.RL_MASTER_MODULE_NAME);

		return processCalculationForDemandGeneration(true, tenantId, calculationTypes, allotmentRequest);
	}

	private List<DemandDetail> processCalculationForDemandGeneration(boolean isSecurityDeposite, String tenantId,
			List<RLProperty> calculateAmount, AllotmentRequest allotmentRequest) {

		String applicationType = allotmentRequest.getAllotment().getApplicationType();
		BigDecimal fee = BigDecimal.ZERO;
		List<DemandDetail> demandDetails = new ArrayList<>();
		// Step 1: Calculate base fee
		for (RLProperty amount : calculateAmount) {
			if (applicationType.equalsIgnoreCase("NEW")) {
				if (isSecurityDeposite) {
					DemandDetail securityDemandDetail = DemandDetail.builder()
							.taxAmount(new BigDecimal(amount.getSecurityDeposit()))
							.taxHeadMasterCode(RLConstants.SECURITY_DOPOSITE_FEE_RL_APPLICATION).tenantId(tenantId)
							.build();
					demandDetails.add(securityDemandDetail);
				}
				DemandDetail baseDemandDetail = DemandDetail.builder().taxAmount(new BigDecimal(amount.getBaseRent()))
						.taxHeadMasterCode(RLConstants.RENT_LEASE_FEE_RL_APPLICATION).tenantId(tenantId).build();
				demandDetails.add(baseDemandDetail);
				break;
			}

			if (applicationType.equalsIgnoreCase("RENEWAL")) {
				fee = new BigDecimal(isSecurityDeposite ? amount.getSecurityDeposit() : amount.getBaseRent());
				DemandDetail baseDemandDetail = DemandDetail.builder().taxAmount(fee)
						.taxHeadMasterCode(RLConstants.SECURITY_DOPOSITE_FEE_RL_APPLICATION).tenantId(tenantId).build();
				demandDetails.add(baseDemandDetail);
				break;
			}
		}

		// Step 2: Calculate additional fees (Penality, cowcass, cgst,sgst)
		calculateAdditionalFees(calculateAmount.get(0),allotmentRequest, tenantId, demandDetails);
		return demandDetails;
	}

	private void calculateAdditionalFees(RLProperty calculateAmount, AllotmentRequest allotmentRequest, String tenantId,
			List<DemandDetail> demandDetails) {

		BigDecimal baseAmount = new BigDecimal(calculateAmount.getBaseRent());
		Long lastModifiedDate = allotmentRequest.getAllotment().getAuditDetails().getLastModifiedTime();
		Long rentLeasePayDate = Instant.ofEpochMilli(lastModifiedDate).plus(Duration.ofDays(30)).toEpochMilli();
		Long rentLeasePayWithPenaltyDate = Instant.ofEpochMilli(rentLeasePayDate).plus(Duration.ofDays(30)).toEpochMilli();

		List<TaxRate> taxRate = mdmsUtil.getHeadTaxAmount(allotmentRequest.getRequestInfo(), tenantId,
				RLConstants.RL_MASTER_MODULE_NAME);
		List<String> taxList = Arrays.asList(RLConstants.SGST_FEE_RL_APPLICATION, RLConstants.CGST_FEE_RL_APPLICATION,
				RLConstants.PENALTY_FEE_RL_APPLICATION, RLConstants.COWCASS_FEE_RL_APPLICATION);

		taxRate.stream().forEach(t -> {
			String penaltyType = allotmentRequest.getAllotment().getPenaltyType();
			BigDecimal amount = BigDecimal.ZERO;
			if (taxList.contains(t.getTaxType()) && t.isActive()) {
				System.out.println("t.getType().contains(\"%\")"+t.getType());
				if (t.getType().contains("%")&&!(t.getTaxType().contains(RLConstants.PENALTY_FEE_RL_APPLICATION))) {
					amount = baseAmount.multiply(new BigDecimal(t.getAmount())).divide(new BigDecimal(100));
					System.out.println("-%-amout:--"+amount);
				} else if(!t.getTaxType().contains(RLConstants.PENALTY_FEE_RL_APPLICATION)) {
					amount = new BigDecimal(t.getAmount());
					System.out.println("-v-amout:--"+amount);
				}
				System.out.println("--amout:--"+amount);
				if (!amount.equals(BigDecimal.ZERO)) {
					demandDetails.add(DemandDetail.builder().taxAmount(amount)
							.taxHeadMasterCode(t.getTaxType()).tenantId(tenantId)
							.build());
				}
			}
		});
		System.out.println("--d-----------------------"+demandDetails.size());
	}
}
