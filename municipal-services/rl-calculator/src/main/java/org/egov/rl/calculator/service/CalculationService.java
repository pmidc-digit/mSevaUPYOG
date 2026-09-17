package org.egov.rl.calculator.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.AllotmentRequest;
import org.egov.rl.calculator.web.models.RentRevision;
import org.egov.rl.calculator.web.models.RLProperty;
import org.egov.rl.calculator.web.models.RentPeriod;
import org.egov.rl.calculator.web.models.TaxRate;
import org.egov.rl.calculator.web.models.demand.BillingPeriod;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.Owner;
import org.egov.rl.calculator.web.models.OwnerInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.egov.rl.calculator.web.models.CalculationCriteria;
import org.egov.rl.calculator.web.models.demand.Penalty;
import org.egov.common.contract.request.RequestInfo;
import org.springframework.util.CollectionUtils;
import org.egov.tracer.model.CustomException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import org.egov.rl.calculator.web.models.demand.DueDate;
import java.util.Collections;
import java.util.Comparator;

@Slf4j
@Service
public class CalculationService {

	@Autowired
	private Configurations config;

	@Autowired
	private PropertyUtil mdmsUtil;
	
	@Autowired
	private MasterDataService masterDataService;
	

	@Autowired
	private DemandService demandService;

	@Autowired
	private ObjectMapper mapper;


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

		String applicationType = resolveApplicationType(allotmentRequest.getAllotment().get(0));
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
			if (RLConstants.NEW_RL_APPLICATION.equalsIgnoreCase(applicationType)
					|| RLConstants.RENEWAL_RL_APPLICATION.equalsIgnoreCase(applicationType)
					|| RLConstants.APPLICATION_TYPE_LEGACY.equalsIgnoreCase(applicationType)) {
				
				fee = new BigDecimal(amount.getBaseRent());
				AllotmentDetails allotmentDetails=allotmentRequest.getAllotment().get(0);
				JsonNode additionalDetails = allotmentDetails.getAdditionalDetails();
				String cycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();

				List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(allotmentRequest.getRequestInfo(), tenantId);
				BillingPeriod billingPeriod = billingPeriods != null ? billingPeriods.stream()
						.filter(b -> b.getBillingCycle().equalsIgnoreCase(cycle)).findFirst().orElse(null) : null;
				//Basically getting the rent fromt the table otherwise we fallback to the original additional details
				BigDecimal activeRent = getActiveRent(allotmentDetails, billingPeriod != null ? billingPeriod.getTaxPeriodFrom() : System.currentTimeMillis(), fee);

				if (billingPeriod != null) {
					long startDay = billingPeriod.getTaxPeriodFrom() <= allotmentDetails.getStartDate()
							? allotmentDetails.getStartDate()
							: billingPeriod.getTaxPeriodFrom();

					long endDay = billingPeriod.getTaxPeriodTo() <= allotmentDetails.getEndDate()
							? billingPeriod.getTaxPeriodTo()
							: allotmentDetails.getEndDate();
					fee = calculatePaybleAmount(startDay, endDay, activeRent, cycle);
				} else {
					fee = activeRent;
				}
				
				
				
				demandDetails.add(DemandDetail.builder().taxAmount(fee)
//						.collectionAmount(fee)
						.taxHeadMasterCode(RLConstants.RENT_LEASE_FEE_RL_APPLICATION).tenantId(tenantId).build());
			}
		}

		// Step 2: Calculate additional fees (Penality, cowcass, cgst,sgst)
		calculateAdditionalFees(fee,calculateAmount.get(0), allotmentRequest, tenantId, demandDetails);
		return demandDetails;
	}

	private String resolveApplicationType(AllotmentDetails allotmentDetails) {
		if (allotmentDetails == null) {
			return null;
		}

		// Only consider the root-level applicationType field. Do not read additionalDetails.
		String rootType = allotmentDetails.getApplicationType();
		if (rootType != null && !rootType.trim().isEmpty()) {
			return rootType;
		}
		return null;
	}

	private void calculateAdditionalFees(BigDecimal baseAmount,RLProperty calculateAmount, AllotmentRequest allotmentRequest, String tenantId,
			List<DemandDetail> demandDetails) {

//		BigDecimal baseAmount = new BigDecimal(calculateAmount.getBaseRent());
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
					amount = baseAmount.multiply(new BigDecimal(t.getAmount())).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
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
		addRoundOffTaxHead(tenantId,demandDetails);
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
		/*
		// Prorated billing logic commented out
		int durationInDays=0;
		long durationInDays1 = TimeUnit.MILLISECONDS.toDays(endDay - startDay);
		try {
		  durationInDays = Math.toIntExact(durationInDays1); // throws exception if overflow
		}catch (Exception e) {
		}
		
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
		System.out.println("payAmount = " + payAmount);
        return payAmount;
		*/
		
		return amount;
	}

	/**
	 * Builds a Demand object for a given allotment request without persisting it.
	 * Reuses existing calculation logic to create demand details and fills tax period and expiry
	 * using billing period information.
	 *
	 * @param allotmentRequest The allotment request containing application and requestInfo
	 * @param isSecurityDeposite Whether to include security deposit in calculation
	 * @return A constructed Demand or null if billing period couldn't be determined
	 */
	public Demand buildDemand(AllotmentRequest allotmentRequest, boolean isSecurityDeposite) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		String tenantId = allotmentDetails.getTenantId();
		String consumerCode = allotmentDetails.getApplicationNumber();

		OwnerInfo ownerInfo = allotmentDetails.getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
				.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId())
				.build();

		List<DemandDetail> demandDetails = calculateDemand(isSecurityDeposite, allotmentRequest);
		BigDecimal amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		JsonNode additionalDetails = allotmentDetails.getAdditionalDetails();
		String cycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();

		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(allotmentRequest.getRequestInfo(), tenantId);
		BillingPeriod billingPeriod = billingPeriods.stream()
				.filter(b -> b.getBillingCycle().equalsIgnoreCase(cycle)).findFirst().orElse(null);

		if (billingPeriod != null) {
			long startDay = billingPeriod.getTaxPeriodFrom() <= allotmentDetails.getStartDate()
					? allotmentDetails.getStartDate()
					: billingPeriod.getTaxPeriodFrom();

			long endDay = billingPeriod.getTaxPeriodTo() <= allotmentDetails.getEndDate()
					? billingPeriod.getTaxPeriodTo()
					: allotmentDetails.getEndDate();
			long expiryDate = billingPeriod.getTaxPeriodTo();

			Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
					.minimumAmountPayable(amountPayable).tenantId(tenantId).taxPeriodFrom(startDay).taxPeriodTo(endDay)
					.fixedbillexpirydate(expiryDate).billExpiryTime(expiryDate)
					.consumerType(allotmentDetails.getApplicationType())
					.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
			return demand;
		}
		return null;
	}
	
	/**
	 * Adds roundOff taxHead if decimal values exists
	 * 
	 * @param tenantId      The tenantId of the demand
	 * @param demandDetails The list of demandDetail
	 */

	public void addRoundOffTaxHead(String tenantId, List<DemandDetail> demandDetails) {
		if (demandDetails == null || demandDetails.isEmpty())
			return;

		BigDecimal totalTax = BigDecimal.ZERO;

		// Sum all taxHeads except RoundOff
		for (DemandDetail dd : demandDetails) {
			String code = dd.getTaxHeadMasterCode();
			if (code != null && !RLConstants.ROUND_OFF_RL_APPLICATION.equalsIgnoreCase(code)) {
				totalTax = totalTax.add(safe(dd.getTaxAmount()));
			}
		}

		// Nearest rupee target via HALF_UP
		BigDecimal rounded = totalTax.setScale(0, RoundingMode.HALF_UP);
		BigDecimal roundOff = rounded.subtract(totalTax); // +ve to go up, -ve to go down

		// Find existing round-off details
		List<DemandDetail> existingRoundOffs = new ArrayList<>();
		for (DemandDetail dd : demandDetails) {
			if (RLConstants.ROUND_OFF_RL_APPLICATION.equalsIgnoreCase(dd.getTaxHeadMasterCode())) {
				existingRoundOffs.add(dd);
			}
		}

		if (roundOff.compareTo(BigDecimal.ZERO) != 0) {
			if (existingRoundOffs.isEmpty()) {
				// Add new round-off if none exists
				DemandDetail roundOffDemandDetail = DemandDetail.builder()
						.taxHeadMasterCode(RLConstants.ROUND_OFF_RL_APPLICATION).taxAmount(roundOff)
						.collectionAmount(BigDecimal.ZERO).tenantId(tenantId).build();
				demandDetails.add(roundOffDemandDetail);
			} else {
				// Overwrite the first existing one, nullify duplicates
				existingRoundOffs.get(0).setTaxAmount(roundOff);
				for (int i = 1; i < existingRoundOffs.size(); i++) {
					existingRoundOffs.get(i).setTaxAmount(BigDecimal.ZERO);
				}
			}
		} else {
			// If roundOff is exactly zero, nullify all existing round-offs
			for (DemandDetail dd : existingRoundOffs) {
				dd.setTaxAmount(BigDecimal.ZERO);
			}
		}
	}
	
	public List<Demand> generateLegacyDemands(CalculationCriteria criteria, RequestInfo requestInfo) {
		if (criteria == null || criteria.getAllotmentRequest() == null || CollectionUtils.isEmpty(criteria.getAllotmentRequest().getAllotment())) {
			return Collections.emptyList();
		}

		AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		String tenantId = allotmentDetails.getTenantId();
		String consumerCode = allotmentDetails.getApplicationNumber();
		BigDecimal arrearAmount = criteria.getArrearAmount() == null ? BigDecimal.ZERO : criteria.getArrearAmount();

		long entryDateEpoch = allotmentDetails.getCreatedTime() > 0 ? allotmentDetails.getCreatedTime() : System.currentTimeMillis();
		LocalDate entryDate = Instant.ofEpochMilli(entryDateEpoch).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();

		OwnerInfo ownerInfo = allotmentDetails.getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
				.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId())
				.build();

		List<Demand> generatedDemands = new ArrayList<>();

        // Read actual billing cycle from property (fallback to MONTHLY for old data)
        JsonNode additionalDetails = allotmentDetails.getAdditionalDetails();
        String cycle = RLConstants.RL_MONTHLY_CYCLE;
        if (additionalDetails != null && additionalDetails.path("propertyDetails").get(0) != null) {
            String rawCycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();
            if (rawCycle != null && !rawCycle.isEmpty() && !rawCycle.equals("null")) {
                cycle = rawCycle;
            }
        }

        // lastPaidUpto marks the last period the tenant has already paid for; everything after it is
        // generated as a per-cycle demand. Resolved before the current-period demand so the MDMS lookups
        // below (due date, property, tax heads) can be shared between the current period and the loop.
        Long lastPaidUpto = criteria.getLastPaidUpto();
        if ((lastPaidUpto == null || lastPaidUpto <= 0) && additionalDetails != null) {
            lastPaidUpto = readLegacyDateMillis(additionalDetails, "lastPaidUpto");
        }
        if (lastPaidUpto != null && lastPaidUpto <= 0) {
            lastPaidUpto = null;
        }
        boolean hasUnpaidCycles = lastPaidUpto != null;
        if (hasUnpaidCycles) {
            log.info("Legacy arrear generation for application {}: lastPaidUpto={}, cycle={}",
                    consumerCode, lastPaidUpto, cycle);
        }

        // Due date threshold from MDMS DueDate.json (fallback 10) - fetched once, used by the current
        // period demand as well as every per-cycle demand.
        DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, tenantId, cycle);
        Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;

        // Property master (rentAndLease.RLProperty) - fetched once and reused for every period.
        List<RLProperty> calculateAmount = mdmsUtil.getCalculateAmount(allotmentDetails.getPropertyId(),
                requestInfo, tenantId, RLConstants.RL_MASTER_MODULE_NAME);
        RLProperty targetProperty = CollectionUtils.isEmpty(calculateAmount) ? null : calculateAmount.get(0);
        BigDecimal propertyBaseRent = (targetProperty != null) ? parseRentAmount(targetProperty.getBaseRent()) : null;
        BigDecimal defaultBaseRent = (propertyBaseRent != null) ? propertyBaseRent : BigDecimal.ZERO;
        if (propertyBaseRent == null) {
            log.warn("No usable baseRent found in MDMS for property {} (tenant {}). Period rents will fall back to zero.",
                    allotmentDetails.getPropertyId(), tenantId);
        }

        // Tax heads (SGST/CGST/Cowcess) - loaded lazily once and reused by every generated period.
        List<TaxRate> taxRates = null;

        // Generate Current Period Demand
        long taxPeriodFrom;
        long taxPeriodTo;
        
        List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
        BillingPeriod billingPeriod = null;
        if (!CollectionUtils.isEmpty(billingPeriods)) {
            String matchCycle = cycle;
            billingPeriod = billingPeriods.stream()
                    .filter(b -> b.getBillingCycle().equalsIgnoreCase(matchCycle))
                    .findFirst().orElse(null);
        }

        if (billingPeriod != null) {
            taxPeriodFrom = billingPeriod.getTaxPeriodFrom();
            taxPeriodTo = billingPeriod.getTaxPeriodTo();
        } else {
            YearMonth currentMonth = YearMonth.from(entryDate);
            taxPeriodFrom = currentMonth.atDay(1).atStartOfDay(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
            taxPeriodTo = currentMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
        }

        BigDecimal currentPeriodRent = BigDecimal.ZERO;

        // Due date rule: monthly uses dayOfMonth, longer cycles use days since period start
        boolean withinDuePeriod;
        if (RLConstants.RL_MONTHLY_CYCLE.equalsIgnoreCase(cycle)) {
            withinDuePeriod = entryDate.getDayOfMonth() <= dueDay;
        } else {
            LocalDate periodStart = Instant.ofEpochMilli(taxPeriodFrom)
                    .atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
            long daysSinceStart = ChronoUnit.DAYS.between(periodStart, entryDate);
            withinDuePeriod = daysSinceStart <= dueDay;
        }

        if (withinDuePeriod && targetProperty != null) {
            BigDecimal periodBaseRent = resolveBaseRentForPeriod(targetProperty, taxPeriodFrom, taxPeriodTo, defaultBaseRent);
            currentPeriodRent = getActiveRent(allotmentDetails, taxPeriodFrom, periodBaseRent);
        } else {
            // Created after due date — current period demand = ₹0
            currentPeriodRent = BigDecimal.ZERO;
        }

        List<DemandDetail> details = new ArrayList<>();
        details.add(DemandDetail.builder().taxAmount(currentPeriodRent).taxHeadMasterCode(RLConstants.RENT_LEASE_FEE_RL_APPLICATION).tenantId(tenantId).build());

        // Add Taxes for the period (only if rent is > 0, or per-cycle demands need the same tax heads)
        if (currentPeriodRent.compareTo(BigDecimal.ZERO) > 0 || hasUnpaidCycles) {
            if (taxRates == null) {
                taxRates = mdmsUtil.getHeadTaxAmount(requestInfo, tenantId, RLConstants.RL_MASTER_MODULE_NAME);
            }
            List<String> taxList = Arrays.asList(RLConstants.SGST_FEE_RL_APPLICATION, RLConstants.CGST_FEE_RL_APPLICATION, RLConstants.COWCESS_FEE_RL_APPLICATION);
            for (TaxRate t : taxRates) {
                if (taxList.contains(t.getTaxType()) && t.isActive()) {
                    BigDecimal taxAmt = resolveTaxRateAmount(t, currentPeriodRent);
                    if (taxAmt != null && taxAmt.compareTo(BigDecimal.ZERO) > 0) {
                        details.add(DemandDetail.builder().taxAmount(taxAmt).taxHeadMasterCode(t.getTaxType()).tenantId(tenantId).build());
                    }
                }
            }
        }

        addRoundOffTaxHead(tenantId, details);
        BigDecimal amountPayable = details.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        long now = System.currentTimeMillis();
        LocalDate billingMonth = Instant.ofEpochMilli(taxPeriodFrom).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
        int day = Math.min(dueDay, billingMonth.lengthOfMonth());
        LocalDateTime dueCutoff = LocalDateTime.of(billingMonth.getYear(), billingMonth.getMonthValue(), day, 23, 59, 59, 999000000);
        long calculatedExpiry = dueCutoff.atZone(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
        // Legacy approvals are often processed after the current period due date. Such a demand must not be
        // created already expired, otherwise the bill cannot be paid.
        if (calculatedExpiry <= now) {
            calculatedExpiry = now + arrearPayableWindowMillis();
        }
        long durationMillis = Math.max(0L, calculatedExpiry - now);

        Demand monthlyDemand = Demand.builder().consumerCode(consumerCode).demandDetails(details).payer(payerUser)
                .minimumAmountPayable(amountPayable).tenantId(tenantId).taxPeriodFrom(taxPeriodFrom).taxPeriodTo(taxPeriodTo)
                .fixedbillexpirydate(calculatedExpiry).billExpiryTime(durationMillis)
                .consumerType(RLConstants.APPLICATION_TYPE_LEGACY)
                .businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();

        // If lastPaidUpto is provided, generate per-period demands for unpaid cycles (MONTHLY, QUATERLY, BIANNUAL, ANNUAL)
        if (hasUnpaidCycles) {
            log.info("Generating per-period legacy demands starting after lastPaidUpto: {} for cycle: {}", lastPaidUpto, cycle);
            YearMonth lastPaidMonth = YearMonth.from(Instant.ofEpochMilli(lastPaidUpto).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate());
            YearMonth entryMonth = YearMonth.from(entryDate);

            int stepMonths = 1;
            if (RLConstants.RL_QUATERLY_CYCLE.equalsIgnoreCase(cycle)) {
                stepMonths = 3;
            } else if (RLConstants.RL_BIAANNUALY_CYCLE.equalsIgnoreCase(cycle) || "BIANNUAL".equalsIgnoreCase(cycle)) {
                stepMonths = 6;
            } else if (RLConstants.RL_YEARLY_CYCLE.equalsIgnoreCase(cycle) || "ANNUAL".equalsIgnoreCase(cycle)) {
                stepMonths = 12;
            }

            // Generate demands stepping by cycle duration (1, 3, 6, or 12 months)
            YearMonth currentIterMonth = lastPaidMonth.plusMonths(stepMonths);
            while (!currentIterMonth.isAfter(entryMonth)) {
                YearMonth endIterMonth = currentIterMonth.plusMonths(stepMonths - 1);
                long periodFrom = currentIterMonth.atDay(1).atStartOfDay(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
                long periodTo = endIterMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();

                BigDecimal monthlyBaseRent = (targetProperty != null)
                        ? getActiveRent(allotmentDetails, periodFrom,
                                resolveBaseRentForPeriod(targetProperty, periodFrom, periodTo, defaultBaseRent))
                        : BigDecimal.ZERO;
                if (monthlyBaseRent.compareTo(BigDecimal.ZERO) <= 0) {
                    log.warn("Resolved zero rent for application {} period {} - {} (property {}). A zero-value demand will be created - "
                            + "verify the MDMS rents[]/baseRent configuration.", consumerCode, periodFrom, periodTo, allotmentDetails.getPropertyId());
                }

                // Scale rent amount for multi-month billing cycles
                BigDecimal cycleRent = monthlyBaseRent.multiply(BigDecimal.valueOf(stepMonths));

                List<DemandDetail> periodDetails = new ArrayList<>();
                periodDetails.add(DemandDetail.builder().taxAmount(cycleRent).taxHeadMasterCode(RLConstants.RENT_LEASE_FEE_RL_APPLICATION).tenantId(tenantId).build());

                if (cycleRent.compareTo(BigDecimal.ZERO) > 0) {
                    if (taxRates == null) {
                        taxRates = mdmsUtil.getHeadTaxAmount(requestInfo, tenantId, RLConstants.RL_MASTER_MODULE_NAME);
                    }
                    List<String> taxList = Arrays.asList(RLConstants.SGST_FEE_RL_APPLICATION, RLConstants.CGST_FEE_RL_APPLICATION, RLConstants.COWCESS_FEE_RL_APPLICATION);
                    for (TaxRate t : taxRates) {
                        if (taxList.contains(t.getTaxType()) && t.isActive()) {
                            BigDecimal taxAmt = resolveTaxRateAmount(t, cycleRent);
                            if (taxAmt != null && taxAmt.compareTo(BigDecimal.ZERO) > 0) {
                                periodDetails.add(DemandDetail.builder().taxAmount(taxAmt).taxHeadMasterCode(t.getTaxType()).tenantId(tenantId).build());
                            }
                        }
                    }
                }

                addRoundOffTaxHead(tenantId, periodDetails);
                BigDecimal periodAmountPayable = periodDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

                LocalDateTime iterDueCutoff;
                if (dueDay <= 31) {
                    int iterDay = Math.min(dueDay, currentIterMonth.lengthOfMonth());
                    iterDueCutoff = LocalDateTime.of(currentIterMonth.getYear(), currentIterMonth.getMonthValue(), iterDay, 23, 59, 59, 999000000);
                } else {
                    LocalDate cutoffDate = currentIterMonth.atDay(1).plusDays(dueDay);
                    iterDueCutoff = LocalDateTime.of(cutoffDate.getYear(), cutoffDate.getMonthValue(), cutoffDate.getDayOfMonth(), 23, 59, 59, 999000000);
                }

                long periodExpiry = iterDueCutoff.atZone(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
                // Back-dated periods are long past their due date - keep them payable from today instead of
                // creating a demand that is already expired.
                if (periodExpiry <= now) {
                    periodExpiry = now + arrearPayableWindowMillis();
                }
                long periodDuration = Math.max(0L, periodExpiry - now);

                Demand periodDemand = Demand.builder().consumerCode(consumerCode).demandDetails(periodDetails).payer(payerUser)
                        .minimumAmountPayable(periodAmountPayable).tenantId(tenantId).taxPeriodFrom(periodFrom).taxPeriodTo(periodTo)
                        .fixedbillexpirydate(periodExpiry).billExpiryTime(periodDuration)
                        .consumerType(RLConstants.APPLICATION_TYPE_LEGACY)
                        .businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();

                generatedDemands.add(periodDemand);
                currentIterMonth = currentIterMonth.plusMonths(stepMonths);
            }
        } else {
            // Default legacy demand generation: current period demand
            generatedDemands.add(monthlyDemand);
        }

        // ---- Arrear demand: breakdown (baseArrear / arrearGST / arrearPenalty) or lump sum ----
        BigDecimal baseArrear = resolveLegacyAmount(criteria.getBaseArrear(), additionalDetails, "baseArrear", "arrear", "arrearAmount");
        BigDecimal arrearGST = resolveLegacyAmount(criteria.getArrearGST(), additionalDetails, "arrearGST");
        BigDecimal arrearPenaltyAmount = resolveLegacyAmount(criteria.getArrearPenalty(), additionalDetails, "arrearPenalty");
        BigDecimal futurePenalty = resolveLegacyAmount(criteria.getFuturePenalty(), additionalDetails, "futurePenalty");
        Long arrearStartDate = resolveLegacyDate(criteria.getArrearStartDate(), additionalDetails, RLConstants.LEGACY_ARREAR_START_DATE_KEY);

        // Nothing is accrued here: the amounts supplied by the caller already cover everything (rent, GST and
        // penalty) up to the issue date. Penalty on the arrear starts only after the due day of the period in
        // which this demand is issued - see DemandService.penaltyCutoffEpoch. futurePenalty is still stored in
        // additionalDetails so the billing engine knows the rate to use from that date on.
        boolean hasBreakdown = (baseArrear != null) || (arrearGST != null) || (arrearPenaltyAmount != null);

        if ((hasBreakdown || arrearAmount.compareTo(BigDecimal.ZERO) > 0) && futurePenalty == null) {
            log.warn("Arrear demand for application {} has no futurePenalty rate - the arrears will not accrue any "
                    + "penalty after their due day.", consumerCode);
        }

        if (hasBreakdown || arrearAmount.compareTo(BigDecimal.ZERO) > 0) {
            List<DemandDetail> arrearDetails = new ArrayList<>();

            if (hasBreakdown) {
                if (baseArrear != null) {
                    arrearDetails.add(DemandDetail.builder().taxAmount(baseArrear).taxHeadMasterCode(RLConstants.RL_ARREAR_FEE).tenantId(tenantId).build());
                }
                if (arrearGST != null) {
                    BigDecimal cgst = arrearGST.divide(new BigDecimal(2), 2, RoundingMode.HALF_UP);
                    BigDecimal sgst = arrearGST.subtract(cgst);
                    if (cgst.compareTo(BigDecimal.ZERO) > 0) {
                        arrearDetails.add(DemandDetail.builder().taxAmount(cgst).taxHeadMasterCode(RLConstants.CGST_FEE_RL_APPLICATION).tenantId(tenantId).build());
                    }
                    if (sgst.compareTo(BigDecimal.ZERO) > 0) {
                        arrearDetails.add(DemandDetail.builder().taxAmount(sgst).taxHeadMasterCode(RLConstants.SGST_FEE_RL_APPLICATION).tenantId(tenantId).build());
                    }
                }
                if (arrearPenaltyAmount != null) {
                    // Penalty supplied by the caller as part of the arrears (it already covers everything up to
                    // the issue date) - taken as is, never accrued again here.
                    arrearDetails.add(DemandDetail.builder().taxAmount(arrearPenaltyAmount).taxHeadMasterCode(RLConstants.PENALTY_TAXHEAD_CODE).tenantId(tenantId).build());
                }
            } else {
                arrearDetails.add(DemandDetail.builder().taxAmount(arrearAmount).taxHeadMasterCode(RLConstants.RL_ARREAR_FEE).tenantId(tenantId).build());
            }

            addRoundOffTaxHead(tenantId, arrearDetails);
            BigDecimal arrearAmountPayable = arrearDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            long arrearDemandTime = entryDateEpoch;

            // additionalDetails carries the annual penalty rate to the billing engine so that penalty keeps
            // accruing on later bill fetches (DemandService.applyTimeBasedApplicables).
            ObjectNode arrearAdditionalDetails = null;
            if (futurePenalty != null) {
                arrearAdditionalDetails = mapper.createObjectNode();
                arrearAdditionalDetails.put("futurePenalty", futurePenalty);
                arrearAdditionalDetails.put("futurePenaltyUnit", "ANNUAL_PERCENT");
            }

            Demand arrearDemand = Demand.builder().consumerCode(consumerCode).demandDetails(arrearDetails).payer(payerUser)
                    .minimumAmountPayable(arrearAmountPayable).tenantId(tenantId).taxPeriodFrom(arrearStartDate != null ? arrearStartDate : arrearDemandTime).taxPeriodTo(arrearDemandTime)
                    .fixedbillexpirydate(calculatedExpiry).billExpiryTime(durationMillis)
                    .consumerType(RLConstants.APPLICATION_TYPE_LEGACY)
                    .businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(arrearAdditionalDetails).build();

            generatedDemands.add(arrearDemand);
        }

        return generatedDemands;
	}

	/**
	 * Resolves the base rent applicable for a billing period from the MDMS {@code RLProperty.rents[]} slabs.
	 *
	 * <p>Rule: a slab applies when the billing period start falls inside [fromPeriod, toPeriod]. A slab with a
	 * missing/blank {@code toPeriod} is treated as open ended, and when several slabs overlap the one with the
	 * latest {@code fromPeriod} wins.
	 *
	 * <p>The period is never prorated: if the period spans a rent change, the slab applicable at the period
	 * start is used and a warning is logged. When no slab matches, {@code fallbackRent} (property
	 * {@code baseRent}) is used and a warning is logged, so a mis-configured slab table is visible in
	 * production instead of silently changing the billed amount.
	 */
	private BigDecimal resolveBaseRentForPeriod(RLProperty property, long taxPeriodFrom, long taxPeriodTo, BigDecimal fallbackRent) {
		LocalDate periodFrom = Instant.ofEpochMilli(taxPeriodFrom).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
		LocalDate periodTo = Instant.ofEpochMilli(taxPeriodTo).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();

		if (property == null || CollectionUtils.isEmpty(property.getRents())) {
			return fallbackToBaseRent(property, periodFrom, periodTo, fallbackRent, "no rents[] configured in MDMS");
		}

		List<RentPeriod> applicableSlabs = new ArrayList<>();
		int unusableSlabs = 0;
		for (RentPeriod rentPeriod : property.getRents()) {
			if (rentPeriod == null || rentPeriod.getRent() == null) {
				continue;
			}
			LocalDate fromDate = parseRentPeriodDate(rentPeriod.getFromPeriod(), property);
			LocalDate toDate = parseRentPeriodDate(rentPeriod.getToPeriod(), property);
			if (fromDate == null) {
				// Without a usable start date the slab cannot be placed on the timeline.
				unusableSlabs++;
				continue;
			}
			if (!periodFrom.isBefore(fromDate) && (toDate == null || !periodFrom.isAfter(toDate))) {
				applicableSlabs.add(rentPeriod);
			}
		}

		if (applicableSlabs.isEmpty()) {
			return fallbackToBaseRent(property, periodFrom, periodTo, fallbackRent,
					"no slab covers the period start" + (unusableSlabs > 0 ? " (" + unusableSlabs + " slab(s) ignored)" : ""));
		}

		// Newest slab first, so a later slab always wins over an older overlapping one.
		RentPeriod selected = applicableSlabs.stream()
				.sorted((a, b) -> parseRentPeriodDate(b.getFromPeriod(), property)
						.compareTo(parseRentPeriodDate(a.getFromPeriod(), property)))
				.findFirst()
				.orElse(applicableSlabs.get(0));

		LocalDate selectedFrom = parseRentPeriodDate(selected.getFromPeriod(), property);
		LocalDate selectedTo = parseRentPeriodDate(selected.getToPeriod(), property);
		if (selectedTo != null && periodTo.isAfter(selectedTo)) {
			log.warn("Rent slab {}-{} of property {} does not cover the whole period {}-{} (rent changed mid-period). "
							+ "Using the slab applicable at the period start ({}). Rent is not prorated.",
					selectedFrom, selectedTo, property.getPropertyId(), periodFrom, periodTo, selected.getRent());
		}
		return selected.getRent();
	}

	private BigDecimal fallbackToBaseRent(RLProperty property, LocalDate periodFrom, LocalDate periodTo,
			BigDecimal fallbackRent, String reason) {
		log.warn("Using property baseRent {} for property {} period {}-{}: {}",
				fallbackRent, (property != null ? property.getPropertyId() : null), periodFrom, periodTo, reason);
		return fallbackRent != null ? fallbackRent : BigDecimal.ZERO;
	}

	/**
	 * Parses a rent slab boundary. Accepts epoch millis, {@code yyyy-MM-dd}, ISO-8601 date-time and
	 * {@code dd/MM/yyyy}. Returns null (with a warning) when the value is unusable so that a single bad MDMS
	 * entry cannot block demand generation.
	 */
	private LocalDate parseRentPeriodDate(String dateStr, RLProperty property) {
		if (dateStr == null || dateStr.trim().isEmpty()) {
			return null;
		}
		LocalDate date = parseLegacyDate(dateStr.trim());
		if (date == null) {
			log.warn("Unusable rent period date '{}' on property {} - the slab is ignored.",
					dateStr, (property != null ? property.getPropertyId() : null));
		}
		return date;
	}

	/**
	 * Lenient date parser for legacy / MDMS values. Accepts epoch millis (13+ digits), epoch seconds
	 * (10 digits), {@code yyyy-MM-dd}, {@code yyyy/MM/dd}, {@code dd/MM/yyyy}, {@code dd-MM-yyyy} and
	 * ISO-8601 date-times with an offset. Returns null when the value cannot be interpreted.
	 */
	private LocalDate parseLegacyDate(String raw) {
		if (raw == null || raw.isEmpty()) {
			return null;
		}
		if (raw.matches("\\d{9,}")) {
			try {
				long epoch = Long.parseLong(raw);
				if (raw.length() <= 10) {
					epoch = epoch * 1000L; // epoch seconds
				}
				return Instant.ofEpochMilli(epoch).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
			} catch (NumberFormatException e) {
				return null;
			}
		}
		String[] supportedPatterns = { "yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy", "dd-MM-yyyy" };
		for (String pattern : supportedPatterns) {
			try {
				return LocalDate.parse(raw, DateTimeFormatter.ofPattern(pattern));
			} catch (Exception ignored) {
				// try the next supported pattern
			}
		}
		try {
			return OffsetDateTime.parse(raw).atZoneSameInstant(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
		} catch (Exception ignored) {
			return null;
		}
	}

	/**
	 * Reads an epoch-millis date from the first key that is present. Returns null when the value is absent or
	 * blank, and throws for a present but unusable value: Jackson's {@code asLong()} silently returns 0 and
	 * would turn 1970-01-01 into the arrear start date, producing an absurd penalty.
	 */
	private Long readLegacyDateMillis(JsonNode details, String... keys) {
		if (details == null || keys == null) {
			return null;
		}
		for (String key : keys) {
			if (key == null || !details.has(key)) {
				continue;
			}
			JsonNode node = details.get(key);
			if (node == null || node.isNull()) {
				continue;
			}
			String raw = node.asText();
			if (raw == null || raw.trim().isEmpty() || "null".equalsIgnoreCase(raw.trim())) {
				continue;
			}
			LocalDate date = parseLegacyDate(raw.trim());
			if (date == null) {
				throw new CustomException("INVALID_LEGACY_DATE", "Unable to parse '" + key + "' value '" + raw
						+ "'. Expected epoch millis, yyyy-MM-dd, ISO-8601 date-time or dd/MM/yyyy.");
			}
			return date.atStartOfDay(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
		}
		return null;
	}

	/**
	 * Amount taken from the request, falling back to additionalDetails, normalised to "positive or null" so
	 * that a caller sending 0 does not shadow a configured value.
	 */
	private BigDecimal resolveLegacyAmount(BigDecimal fromRequest, JsonNode details, String... keys) {
		if (fromRequest != null && fromRequest.compareTo(BigDecimal.ZERO) > 0) {
			return fromRequest;
		}
		if (details == null || keys == null) {
			return null;
		}
		for (String key : keys) {
			if (key == null || !details.has(key)) {
				continue;
			}
			JsonNode node = details.get(key);
			if (node == null || node.isNull()) {
				continue;
			}
			String raw = node.asText();
			if (raw == null || raw.trim().isEmpty() || "null".equalsIgnoreCase(raw.trim())) {
				continue;
			}
			try {
				BigDecimal amount = new BigDecimal(raw.trim());
				if (amount.compareTo(BigDecimal.ZERO) > 0) {
					return amount;
				}
			} catch (NumberFormatException e) {
				throw new CustomException("INVALID_LEGACY_AMOUNT",
						"Unable to parse '" + key + "' value '" + raw + "'. Expected a numeric amount.");
			}
		}
		return null;
	}

	/** Date taken from the request, falling back to additionalDetails. Values &lt;= 0 count as "not provided". */
	private Long resolveLegacyDate(Long fromRequest, JsonNode details, String... keys) {
		if (fromRequest != null && fromRequest > 0) {
			return fromRequest;
		}
		return readLegacyDateMillis(details, keys);
	}

	/**
	 * Window (in millis) for which a back-dated legacy demand stays payable from the moment it is created.
	 * Without it, demands for past periods would be created already expired and could not be paid.
	 */
	private long arrearPayableWindowMillis() {
		Integer days = config.getArrearPayableWindowDays();
		return TimeUnit.DAYS.toMillis((days != null && days > 0) ? days : 30);
	}

	/** Lenient decimal parsing for MDMS master values - returns null (with a warning) instead of throwing. */
	private BigDecimal parseRentAmount(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		try {
			return new BigDecimal(value.trim());
		} catch (NumberFormatException e) {
			log.warn("Unusable numeric master value '{}' - ignoring it.", value);
			return null;
		}
	}

	/** Tax amount for a configured tax head: a percentage of the base amount, or a flat amount. */
	private BigDecimal resolveTaxRateAmount(TaxRate taxRate, BigDecimal baseAmount) {
		if (taxRate == null || !Double.isFinite(taxRate.getAmount())) {
			log.warn("Ignoring tax head {} with an unusable amount '{}'.", (taxRate != null ? taxRate.getTaxType() : null),
					(taxRate != null ? taxRate.getAmount() : null));
			return null;
		}
		BigDecimal configured = BigDecimal.valueOf(taxRate.getAmount());
		if (taxRate.getType() != null && taxRate.getType().contains("%")) {
			return baseAmount.multiply(configured).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
		}
		return configured;
	}
	
	private BigDecimal getActiveRent(AllotmentDetails allotmentDetails, long taxPeriodFrom, BigDecimal fallbackRent) {
		if (allotmentDetails != null && !CollectionUtils.isEmpty(allotmentDetails.getRentRevisions())) {
			return allotmentDetails.getRentRevisions().stream()
					.filter(r -> r.getRevisionDate() != null && r.getRevisionDate() <= taxPeriodFrom)
					.max(Comparator.comparing(RentRevision::getRevisionDate))
					.map(RentRevision::getRevisedRent)
					.orElse(fallbackRent);
		}
		return fallbackRent;
	}

	private static BigDecimal safe(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

}
