package org.egov.rl.calculator.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.AllotmentRequest;

import org.egov.rl.calculator.web.models.RLProperty;
import org.egov.rl.calculator.web.models.TaxRate;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class CalculationService {

	@Autowired
	private PropertyUtil mdmsUtil;

	/**
	 * @return A list of DemandDetail objects representing the calculated demand.
	 */
	public List<DemandDetail> calculateDemand(boolean isSecurityDeposite, AllotmentRequest allotmentRequest) {
		String tenantId = allotmentRequest.getAllotment().get(0).getTenantId();

		List<RLProperty> calculationTypes = mdmsUtil.getCalculateAmount(allotmentRequest.getAllotment().get(0).getPropertyId(),
				allotmentRequest.getRequestInfo(), tenantId, RLConstants.RL_MASTER_MODULE_NAME);

		return processCalculationForDemandGeneration(isSecurityDeposite, tenantId, calculationTypes, allotmentRequest);
	}

	private List<DemandDetail> processCalculationForDemandGeneration(boolean isSecurityDeposite, String tenantId,
			List<RLProperty> calculateAmount, AllotmentRequest allotmentRequest) {

		String applicationType = allotmentRequest.getAllotment().get(0).getApplicationType();
		BigDecimal fee = BigDecimal.ZERO;
		List<DemandDetail> demandDetails = new ArrayList<>();
		// Step 1: Calculate base fee
		for (RLProperty amount : calculateAmount) {
			if (isSecurityDeposite) {
				fee = new BigDecimal(amount.getSecurityDeposit());
				demandDetails.add(DemandDetail.builder().taxAmount(fee)
//						.collectionAmount(fee)
						.taxHeadMasterCode(RLConstants.SECURITY_DEPOSIT_FEE_RL_APPLICATION).tenantId(tenantId).build());
			}
			if ((applicationType.equalsIgnoreCase(RLConstants.NEW_RL_APPLICATION))
					|| (applicationType.equalsIgnoreCase(RLConstants.RENEWAL_RL_APPLICATION))) {
				
				fee = new BigDecimal(amount.getBaseRent());
				
				demandDetails.add(DemandDetail.builder().taxAmount(fee)
//						.collectionAmount(fee)
						.taxHeadMasterCode(RLConstants.RENT_LEASE_FEE_RL_APPLICATION).tenantId(tenantId).build());
			}
		}

		// Step 2: Calculate additional fees (Penality, cowcass, cgst,sgst)
		calculateAdditionalFees(calculateAmount.get(0), allotmentRequest, tenantId, demandDetails);
		return demandDetails;
	}

	private void calculateAdditionalFees(RLProperty calculateAmount, AllotmentRequest allotmentRequest, String tenantId,
			List<DemandDetail> demandDetails) {

		BigDecimal baseAmount = new BigDecimal(calculateAmount.getBaseRent());
//		Long lastModifiedDate = allotmentRequest.getAllotment().get(0).getAuditDetails().getLastModifiedTime();
//		Long rentLeasePayDate = Instant.ofEpochMilli(lastModifiedDate).plus(Duration.ofDays(30)).toEpochMilli();
//		Long rentLeasePayWithPenaltyDate = Instant.ofEpochMilli(rentLeasePayDate).plus(Duration.ofDays(30)).toEpochMilli();

		List<TaxRate> taxRate = mdmsUtil.getHeadTaxAmount(allotmentRequest.getRequestInfo(), tenantId,
				RLConstants.RL_MASTER_MODULE_NAME);
		List<String> taxList = Arrays.asList(RLConstants.SGST_FEE_RL_APPLICATION, RLConstants.CGST_FEE_RL_APPLICATION,
				RLConstants.COWCESS_FEE_RL_APPLICATION);
			taxRate.stream().forEach(t -> {
//			String penaltyType = allotmentRequest.getAllotment().get(0).getPenaltyType();
			BigDecimal amount = BigDecimal.ZERO;
			if (taxList.contains(t.getTaxType()) && t.isActive()) {
				if (t.getType().contains("%")) {
					amount = baseAmount.multiply(new BigDecimal(t.getAmount())).divide(new BigDecimal(100));
				} else {
					amount = new BigDecimal(t.getAmount());
				}
				if (!amount.equals(BigDecimal.ZERO)) {
					demandDetails.add(DemandDetail.builder().taxAmount(amount)
//							.collectionAmount(amount)
							.taxHeadMasterCode(t.getTaxType())
							.tenantId(tenantId).build());
				}
			}
		});
	}

	public List<DemandDetail> calculateSatelmentDemand(AllotmentRequest allotmentRequest) {
		String tenantId = allotmentRequest.getAllotment().get(0).getTenantId();

		List<RLProperty> calculationTypes = mdmsUtil.getCalculateAmount(allotmentRequest.getAllotment().get(0).getPropertyId(),
				allotmentRequest.getRequestInfo(), tenantId, RLConstants.RL_MASTER_MODULE_NAME);

		return satelmentCalculationForDemandGeneration(tenantId, calculationTypes, allotmentRequest);
	}

	private List<DemandDetail> satelmentCalculationForDemandGeneration(String tenantId,
			List<RLProperty> calculateAmount, AllotmentRequest allotmentRequest) {
		List<DemandDetail> demandDetails = new ArrayList<>();
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		BigDecimal amountDeducted = allotmentDetails.getAmountToBeDeducted(); // BigDecimal
		BigDecimal securityAmount = calculateAmount.stream()
				.filter(d -> d.getPropertyId().equals(allotmentDetails.getPropertyId())).findFirst()
				.map(d -> new BigDecimal(d.getSecurityDeposit())) // BigDecimal
				.orElse(BigDecimal.ZERO);

		BigDecimal amountToBeRefunded = securityAmount.subtract(amountDeducted).negate();

		demandDetails.add(DemandDetail.builder()
				.taxAmount(amountToBeRefunded)
				.taxHeadMasterCode(RLConstants.PENALTY_FEE_RL_APPLICATION)
				.tenantId(tenantId)
				.build());
		return demandDetails;
	}
	
	public BigDecimal calculatePaybleAmount(long startDay,long endDay,BigDecimal amount,String cycle) {
		long durationInDays = TimeUnit.MILLISECONDS.toDays(endDay - startDay);
		BigDecimal duration = BigDecimal.valueOf(durationInDays);
		
		System.out.println("Days = " + durationInDays);
        BigDecimal payAmount=BigDecimal.ZERO;
		switch (cycle) {
		case RLConstants.RL_MONTHLY_CYCLE:
			if(durationInDays>21) {
				payAmount=amount;
			}else {
			    payAmount = amount.divide(new BigDecimal(30), 8, RoundingMode.HALF_UP).multiply(duration); // high precision for intermediate
			}			
		break;
		case RLConstants.RL_QUATERLY_CYCLE:
			if(durationInDays>81) {
				payAmount=amount;
			}else {
			    payAmount = amount.divide(new BigDecimal(90), 8, RoundingMode.HALF_UP).multiply(duration); // high precision for intermediate
				}
		break;
		case RLConstants.RL_BIAANNUALY_CYCLE:
			if(durationInDays>171) {
				payAmount=amount;
			}else {
			    payAmount = amount.divide(new BigDecimal(180), 8, RoundingMode.HALF_UP).multiply(duration); // high precision for intermediate
				
			}
		break;
		default:
			if(durationInDays>356) {
				payAmount=amount;
			}else {
			    payAmount = amount.divide(new BigDecimal(365), 8, RoundingMode.HALF_UP).multiply(duration); // high precision for intermediate		
			}
		
		break;
		}
		return payAmount;
	}
}
