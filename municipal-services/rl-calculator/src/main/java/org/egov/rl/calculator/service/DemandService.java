package org.egov.rl.calculator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.repository.Repository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.demand.*;
import org.egov.rl.calculator.web.models.demand.Status;
import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.egov.rl.calculator.penalty.PenaltyCalculator;
import org.egov.rl.calculator.penalty.PenaltyCalculatorFactory;
import org.egov.rl.calculator.penalty.PenaltyConfig;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Slf4j
@Service
public class DemandService {

	@Autowired
	MasterDataService masterDataService;

	@Autowired
	private PenaltyCalculatorFactory penaltyCalculatorFactory;

	@Autowired
	private Configurations config;

	@Autowired
	private PropertyUtil propertyutil;

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

	@Autowired
	DaysCycleCalculationService daysCycleCalculationService;

	@Autowired
	NotificationUtil notificationUtil;

	@Autowired
	NotificationService notificationService;

	@Autowired
	SchedulerService schedulerService;

	@Autowired
	private BatchDemanService batchDemanService;

	private ExecutorService batchExecutor;

	@PostConstruct
	public void init() {
		// Bounded thread pool to prevent thread exhaustion under load
		this.batchExecutor = Executors.newFixedThreadPool(4);
	}

	@PreDestroy
	public void cleanup() {
		if (batchExecutor != null) {
			batchExecutor.shutdown();
			try {
				if (!batchExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
					batchExecutor.shutdownNow();
				}
			} catch (InterruptedException e) {
				batchExecutor.shutdownNow();
				Thread.currentThread().interrupt();
			}
		}
	}

	public DemandResponse createDemand(CalculationReq calculationReq) {
		CalculationCriteria firstCriteria = calculationReq.getCalculationCriteria().get(0);
		boolean isLegacyApplication = isLegacyApplication(firstCriteria);

		if (firstCriteria.isSatelment()) {
			return createSatelmentDemand(calculationReq);
	        } else if (firstCriteria.isLegacyArrear() || isLegacyApplication) {
            return createLegacyDemands(calculationReq);
		} else {

			boolean isSecurityDeposite = firstCriteria.isSecurityDeposite();
			List<Demand> demands = new ArrayList<>();
			RequestInfo requestInfo = calculationReq.getRequestInfo();
			String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment().get(0)
					.getTenantId();

			for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

				AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
				AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);

//            String tenantId = allotmentRequest.getAllotment().get(0).getTenantId();
				String consumerCode = allotmentRequest.getAllotment().get(0).getApplicationNumber();

				OwnerInfo ownerInfo = allotmentRequest.getAllotment().get(0).getOwnerInfo().get(0);
				Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
						.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo())
						.tenantId(ownerInfo.getTenantId()).build();
				List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite,
						allotmentRequest);
				BigDecimal amountPayable = new BigDecimal(0);
				String applicationType = allotmentRequest.getAllotment().get(0).getApplicationType();

				JsonNode additionalDetails = allotmentDetails.getAdditionalDetails();
				String cycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();

				List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
				BillingPeriod billingPeriod = billingPeriods.stream()
						.filter(b -> b.getBillingCycle().equalsIgnoreCase(cycle)).findFirst().orElse(null); // Assuming
				if (billingPeriod != null) {
					long startDay = billingPeriod.getTaxPeriodFrom() <= allotmentDetails.getStartDate()
							? allotmentDetails.getStartDate()
							: billingPeriod.getTaxPeriodFrom();

					long endDay = billingPeriod.getTaxPeriodTo() <= allotmentDetails.getEndDate()
							? billingPeriod.getTaxPeriodTo()
							: allotmentDetails.getEndDate();

//					long exparyDate = billingPeriod.getDemandExpiryDate();

					amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
							BigDecimal::add);
//					amountPayable = calculationService.calculatePaybleAmount(startDay, endDay, amountPayable, cycle);

					DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, tenantId, cycle);
					Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;
					Demand tempDemand = Demand.builder().taxPeriodFrom(startDay).build();
					long absoluteExpiry = getDueCutoffEpoch(tempDemand, dueDay);
					long durationMillis = Math.max(0L, absoluteExpiry - System.currentTimeMillis());

					Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails)
							.payer(payerUser).minimumAmountPayable(amountPayable).tenantId(tenantId)
							.taxPeriodFrom(startDay).taxPeriodTo(endDay)
							.billExpiryTime(durationMillis).fixedbillexpirydate(absoluteExpiry)
							.consumerType(applicationType)
							.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
					demands.add(demand);
				}
			}

			List<Demand> demands1 = demandRepository.saveDemand(
					calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
			if (!CollectionUtils.isEmpty(demands1)) {
				fetchBillForDemands(demands1, requestInfo);
			}
			return DemandResponse.builder().demands(demands1).build();
		}
	}

	private boolean isLegacyApplication(CalculationCriteria criteria) {
		if (criteria == null || criteria.getAllotmentRequest() == null
				|| CollectionUtils.isEmpty(criteria.getAllotmentRequest().getAllotment())) {
			return false;
		}

		String applicationType = criteria.getAllotmentRequest().getAllotment().get(0).getApplicationType();
		return RLConstants.APPLICATION_TYPE_LEGACY.equalsIgnoreCase(applicationType);
	}
    /**
	 * Creates a single combined demand for legacy applications.
	 * Legacy workflow should persist one demand containing RL fee, arrear and no security deposit.
     */
    public DemandResponse createLegacyDemands(CalculationReq calculationReq) {
		log.info("Creating legacy demands - START");
        List<Demand> demands = new ArrayList<>();
        RequestInfo requestInfo = calculationReq.getRequestInfo();
		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {
			List<Demand> generated = calculationService.generateLegacyDemands(criteria, requestInfo);
			if (generated != null && !generated.isEmpty()) {
				demands.addAll(generated);
			}
		}

		if (CollectionUtils.isEmpty(demands)) {
			log.warn("No legacy demand could be built for the request");
			return DemandResponse.builder().demands(Collections.<Demand>emptyList()).build();
		}

		log.info("Saving legacy demand(s) to billing service. Count: {}", demands.size());
		List<Demand> savedDemands = demandRepository.saveDemand(requestInfo, demands);
		if (!CollectionUtils.isEmpty(savedDemands)) {
			fetchBillForDemands(savedDemands, requestInfo);
		}
		log.info("Legacy demand created successfully. Count: {}", savedDemands.size());
		return DemandResponse.builder().demands(savedDemands).build();
    }

	public DemandResponse createSatelmentDemand(CalculationReq calculationReq) {

		AllotmentRequest allotmentRequest = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest();
		List<Demand> demands = new ArrayList<>();
		RequestInfo requestInfo = calculationReq.getRequestInfo();
		String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment().get(0)
				.getTenantId();

		JsonNode additionalDetails = allotmentRequest.getAllotment().get(0).getAdditionalDetails();
		String cycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();

		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
		BillingPeriod billingPeriod = billingPeriods.stream().filter(b -> b.getBillingCycle().equalsIgnoreCase(cycle))
				.findFirst().orElse(null); // Assuming
		if (billingPeriod != null) {
			String consumerCode = allotmentRequest.getAllotment().get(0).getApplicationNumber();

			OwnerInfo ownerInfo = allotmentRequest.getAllotment().get(0).getOwnerInfo().get(0);
			Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
					.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo())
					.tenantId(ownerInfo.getTenantId()).build();

			List<DemandDetail> demandDetails = calculationService.calculateSatelmentDemand(allotmentRequest);
			BigDecimal amountPayable = new BigDecimal(0);
			String applicationType = allotmentRequest.getAllotment().get(0).getApplicationType();
			amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
					BigDecimal::add);

			DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, tenantId, cycle);
			Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;
			Demand tempDemand = Demand.builder().taxPeriodFrom(billingPeriod.getTaxPeriodFrom()).build();
			long absoluteExpiry = getDueCutoffEpoch(tempDemand, dueDay);
			long durationMillis = Math.max(0L, absoluteExpiry - System.currentTimeMillis());

			Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
					.minimumAmountPayable(amountPayable).tenantId(tenantId)
					.taxPeriodFrom(billingPeriod.getTaxPeriodFrom())
					.taxPeriodTo(daysCycleCalculationService.minus5Days(billingPeriod.getTaxPeriodTo()))
					.billExpiryTime(durationMillis).fixedbillexpirydate(absoluteExpiry).consumerType(applicationType)
					.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
			demands.add(demand);
		}
		List<Demand> demands1 = demandRepository.saveDemand(
				calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
		if (!CollectionUtils.isEmpty(demands1)) {
			fetchBillForDemands(demands1, requestInfo);
		}
		return DemandResponse.builder().demands(demands1).build();
	}

	public DemandResponse estimate(boolean isSecurityDeposite, CalculationReq calculationReq) {

		List<Demand> demands = new ArrayList<>();
		RequestInfo requestInfo = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo();
		String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment().get(0)
				.getTenantId();

		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
		BillingPeriod billingPeriod = billingPeriods.get(0); // Assuming that each ulb will follow only one type of
																// billing

		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

			AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
			String consumerCode = allotmentRequest.getAllotment().get(0).getApplicationNumber();

			OwnerInfo ownerInfo = allotmentRequest.getAllotment().get(0).getOwnerInfo().get(0);
			Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
					.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo())
					.tenantId(ownerInfo.getTenantId()).build();
			List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite, allotmentRequest);
			BigDecimal amountPayable = new BigDecimal(0);
			String applicationType = allotmentRequest.getAllotment().get(0).getApplicationType();

			amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
					BigDecimal::add);

			DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, tenantId, null);
			Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;
			Demand tempDemand = Demand.builder().taxPeriodFrom(billingPeriod.getTaxPeriodFrom()).build();
			long absoluteExpiry = getDueCutoffEpoch(tempDemand, dueDay);
			long durationMillis = Math.max(0L, absoluteExpiry - System.currentTimeMillis());

			Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
					.minimumAmountPayable(amountPayable).tenantId(tenantId)
					.taxPeriodFrom(billingPeriod.getTaxPeriodFrom()).taxPeriodTo(billingPeriod.getTaxPeriodTo())
					.billExpiryTime(durationMillis).fixedbillexpirydate(absoluteExpiry).consumerType(applicationType)
					.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();

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
				.filter(d -> d.getStatus() == null
						|| !d.getStatus().toString().equalsIgnoreCase(RLConstants.DEMAND_CANCELLED_STATUS))
				.collect(Collectors.toList());

		if (CollectionUtils.isEmpty(demands)) {
			return DemandResponse.builder().demands(Collections.emptyList()).build();
		}

		List<Demand> demandsToBeUpdated = new LinkedList<>();
		String tenantId = getBillCriteria.getTenantId();
		List<TaxPeriod> taxPeriods = masterDataService.getTaxPeriodList(requestInfo, tenantId,
				RLConstants.RL_SERVICE_NAME);
		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);

		for (Demand demand : demands) {
			BigDecimal totalTax = demand.getDemandDetails().stream().map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal totalCollection = demand.getDemandDetails().stream().map(DemandDetail::getCollectionAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			if (totalTax.compareTo(totalCollection) > 0) {
				applyTimeBasedApplicables(demand, requestInfoWrapper, taxPeriods, billingPeriods, penaltySlabs);
			}

//			calculationService.addRoundOffTaxHead(demand.getTenantId(), demand.getDemandDetails());
			demandsToBeUpdated.add(demand);
		}

		demandRepository.updateDemand(requestInfo, demandsToBeUpdated);
		return DemandResponse.builder().demands(demandsToBeUpdated).build();
	}

	private void applyTimeBasedApplicables(Demand demand, RequestInfoWrapper requestInfoWrapper,
			List<TaxPeriod> taxPeriods, List<BillingPeriod> billingPeriods, List<Penalty> penaltySlabs) {
		log.info("Applying time based applicables for demand: {}", demand.getId());

		RequestInfo requestInfo = (requestInfoWrapper != null) ? requestInfoWrapper.getRequestInfo() : new RequestInfo();
		DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, demand.getTenantId(), null);
		Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;

		long dueCutoffEpoch = getDueCutoffEpoch(demand, dueDay);
		long now = System.currentTimeMillis();

		now += TimeUnit.DAYS.toMillis(1);

		BigDecimal principalAmount = demand.getDemandDetails().stream().filter(
				detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		if (principalAmount.compareTo(BigDecimal.ZERO) <= 0) {
			log.info("Principal amount is zero or less for demand: {}. Skipping time-based applicables.", demand.getId());
			return;
		}
		//if today is less than due date apply rebate and else reset rebate 
		if (now <= dueCutoffEpoch) {
			// Early payment rebate applies (on or before 10th of the month)
			BigDecimal rebateAmount = BigDecimal.ZERO;
			if (dueDateConfig != null && dueDateConfig.getRebatePercentage() != null && dueDateConfig.getRebatePercentage() > 0) {
				rebateAmount = principalAmount.multiply(BigDecimal.valueOf(dueDateConfig.getRebatePercentage()))
						.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
			} else if (dueDateConfig != null && dueDateConfig.getRebateFlatAmount() != null
					&& dueDateConfig.getRebateFlatAmount().compareTo(BigDecimal.ZERO) > 0) {
				rebateAmount = dueDateConfig.getRebateFlatAmount();
			}

			if (rebateAmount.compareTo(BigDecimal.ZERO) > 0) {
				BigDecimal negativeRebate = rebateAmount.negate();
				DemandDetail rebateDetail = demand.getDemandDetails().stream()
						.filter(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RL_TIME_REBATE))
						.findFirst().orElse(null);

				if (rebateDetail != null) {
					rebateDetail.setTaxAmount(negativeRebate);
				} else {
					DemandDetail newRebateDetail = DemandDetail.builder()
							.taxAmount(negativeRebate)
							.taxHeadMasterCode(RLConstants.RL_TIME_REBATE)
							.tenantId(demand.getTenantId())
							.collectionAmount(BigDecimal.ZERO)
							.demandId(demand.getId())
							.build();
					demand.getDemandDetails().add(newRebateDetail);
				}
				log.info("Early payment rebate of {} applied for demand: {}", rebateAmount, demand.getId());
			}
		} else {
			// Past due date cutoff: reset early payment rebate to 0
			demand.getDemandDetails().stream()
					.filter(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RL_TIME_REBATE))
					.forEach(detail -> detail.setTaxAmount(BigDecimal.ZERO));

			// Apply penalty if penalty slabs are configured
			if (!CollectionUtils.isEmpty(penaltySlabs)) {
				List<PenaltyConfig> penaltyConfigs = masterDataService.getPenaltyConfigs(requestInfo, demand.getTenantId());
				PenaltyConfig penaltyConfig = (!CollectionUtils.isEmpty(penaltyConfigs)) ? penaltyConfigs.get(0) : null;

				BigDecimal penaltyAmount = BigDecimal.ZERO;
				if (penaltyConfig != null) {
					LocalDate dueDate = Instant.ofEpochMilli(dueCutoffEpoch).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
					LocalDate paymentDate = Instant.ofEpochMilli(now).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();

					PenaltyCalculator calculator = penaltyCalculatorFactory.getCalculator(penaltyConfig.resolvedPenaltyType());
					penaltyAmount = calculator.calculatePenalty(principalAmount, dueDate, paymentDate, penaltyConfig);

					if (penaltyAmount != null && penaltyAmount.compareTo(BigDecimal.ZERO) > 0) {
						DemandDetail existingPenaltyDetail = demand.getDemandDetails().stream()
								.filter(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.PENALTY_TAXHEAD_CODE))
								.findFirst().orElse(null);

						if (existingPenaltyDetail != null) {
							if (penaltyAmount.compareTo(existingPenaltyDetail.getTaxAmount()) > 0) {
								existingPenaltyDetail.setTaxAmount(penaltyAmount);
								log.info("Updated penalty to {} using strategy {} for demand: {}", penaltyAmount, calculator.getPenaltyType(), demand.getId());
							}
						} else {
							DemandDetail penaltyDetail = DemandDetail.builder().taxAmount(penaltyAmount)
									.taxHeadMasterCode(RLConstants.PENALTY_TAXHEAD_CODE).tenantId(demand.getTenantId())
									.collectionAmount(BigDecimal.ZERO).demandId(demand.getId()).build();
							demand.getDemandDetails().add(penaltyDetail);
							log.info("Applied initial penalty of {} using strategy {} for demand: {}", penaltyAmount, calculator.getPenaltyType(), demand.getId());
						}
					}
				} else {
					// Fallback if penaltyConfig is null but penaltySlab exists
					Penalty penaltySlab = penaltySlabs.get(0);
					long daysPastExpiry = TimeUnit.MILLISECONDS.toDays(now - dueCutoffEpoch);
					if (penaltySlab.getApplicableAfterDays() == null || daysPastExpiry >= penaltySlab.getApplicableAfterDays()) {
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
							DemandDetail existingPenaltyDetail = demand.getDemandDetails().stream()
									.filter(detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.PENALTY_TAXHEAD_CODE))
									.findFirst().orElse(null);

							if (existingPenaltyDetail != null) {
								if (penaltyAmount.compareTo(existingPenaltyDetail.getTaxAmount()) > 0) {
									existingPenaltyDetail.setTaxAmount(penaltyAmount);
								}
							} else {
								DemandDetail penaltyDetail = DemandDetail.builder().taxAmount(penaltyAmount)
										.taxHeadMasterCode(RLConstants.PENALTY_TAXHEAD_CODE).tenantId(demand.getTenantId())
										.collectionAmount(BigDecimal.ZERO).demandId(demand.getId()).build();
								demand.getDemandDetails().add(penaltyDetail);
								log.info("Penalty of {} applied for demand: {}", penaltyAmount, demand.getId());
							}
						}
					}
				}
			}
		}
	}

	private long getDueCutoffEpoch(Demand demand, Integer dueDay) {
		int targetDueDay = (dueDay != null && dueDay > 0) ? dueDay : 10;
		long startEpoch = (demand.getTaxPeriodFrom() != null && demand.getTaxPeriodFrom() > 0)
				? demand.getTaxPeriodFrom()
				: ((demand.getAuditDetails() != null && demand.getAuditDetails().getCreatedTime() != null)
						? demand.getAuditDetails().getCreatedTime()
						: System.currentTimeMillis());

		LocalDate startDate = Instant.ofEpochMilli(startEpoch)
				.atZone(ZoneId.of(RLConstants.TIME_ZONE))
				.toLocalDate();

		java.time.LocalDateTime dueCutoff;
		if (targetDueDay <= 31) {
			// Monthly cycle rule: N-th day of the billing start month
			int day = Math.min(targetDueDay, startDate.lengthOfMonth());
			dueCutoff = java.time.LocalDateTime.of(startDate.getYear(), startDate.getMonthValue(), day, 23, 59, 59, 999000000);
		} else {
			// Multi-month cycle rule (QUATERLY / BIANNUAL / ANNUAL): N days from taxPeriodFrom
			LocalDate cutoffDate = startDate.plusDays(targetDueDay);
			dueCutoff = java.time.LocalDateTime.of(cutoffDate.getYear(), cutoffDate.getMonthValue(), cutoffDate.getDayOfMonth(), 23, 59, 59, 999000000);
		}

		return dueCutoff.atZone(ZoneId.of(RLConstants.TIME_ZONE)).toInstant().toEpochMilli();
	}

	private List<AllotmentDetails> fetchApprovedAllotmentApplications(String tenantId, RequestInfo requestInfo,
			String consumerCode) {
		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();

		String baseHost = config.getRlServiceHost();
		String basePath = config.getRlSearchEndpoint();

		Set<Status> statusSet = new HashSet<>(Arrays.asList(Status.APPROVED, Status.FORWARD_FOT_SETLEMENT, // verify
																											// spelling
				Status.PENDING_FOR_PAYMENT, Status.REQUEST_FOR_DISCONNECTION));
		StringJoiner joiner = new StringJoiner(",");
		statusSet.stream().filter(Objects::nonNull).map(Status::name).forEach(joiner::add);

		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseHost).path(basePath).queryParam("tenantId",
				tenantId);
		builder.queryParam("status", joiner.toString());
		builder.queryParam("isExpaireFlag", false);
		if (consumerCode != null) {
			builder.queryParam("applicationNumbers", consumerCode);
		}

		String url = builder.build().toUriString();

		log.info("ALLOTMENT SEARCH URI :" + url);
		try {
			Object result = serviceRequestRepository.fetchResult(new StringBuilder(url), requestInfoWrapper);
			AllotmentSearchResponse response = mapper.convertValue(result, AllotmentSearchResponse.class);
			return response.getAllotment();
		} catch (Exception e) {
			log.error("Error while fetching approved allotment applications for tenant: {}", tenantId, e);
			throw new CustomException("RL_APP_SEARCH_ERROR", "Failed to fetch approved allotment applications");
		}
	}

	public void generateBatchDemand(RequestInfo requestInfo, String tenantCode, String consumerCode) {
		LocalDate currentDate = LocalDate.now(); // today

		List<String> tenantIds = (tenantCode == null) ? demandRepository.getDistinctTenantIds()
				: Arrays.asList(tenantCode);
		log.info("Starting demand generation job for tenants: {}", tenantIds);

		for (String tenantId : tenantIds) {
			log.info("Generating demands for tenant: {}", tenantId);
			Runnable task = new Runnable() {

				@Override
				public void run() {
					try {

						List<AllotmentDetails> list = fetchApprovedAllotmentApplications(tenantId, requestInfo,
								consumerCode);
						List<Demand> demandList = new ArrayList<>();
						int batchSize = 10;
						list.forEach(d -> {
							JsonNode additionalDetails = d.getAdditionalDetails();
							String cycle = additionalDetails.path("propertyDetails").get(0).path("feesPeriodCycle").asText();

							List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo,
									tenantId);
							BillingPeriod billingPeriod = billingPeriods.stream()
									.filter(b -> b.getBillingCycle().equalsIgnoreCase(cycle))
									.findFirst().orElse(null);
							if (billingPeriod != null) {
								long startDay = billingPeriod.getTaxPeriodFrom() <= d.getStartDate() ? d.getStartDate()
										: billingPeriod.getTaxPeriodFrom();

								long endDay = billingPeriod.getTaxPeriodTo() <= d.getEndDate()
										? billingPeriod.getTaxPeriodTo()
										: d.getEndDate();

								long exparyDate = billingPeriod.getTaxPeriodTo();

								Demand demand = schedulerService.billGenerateByCycle(startDay, endDay, exparyDate, d,
										requestInfo, cycle);
								if (demand != null)
									demandList.add(demand);
							}
						});
//						log.info
						System.out.println("------::List of consummercode which have to generate bulk demand::-----");
						if (demandList.isEmpty()) {
							System.out.println("------::All demand alreday has been generated::-----");
						}
						demandList.stream().forEach(d -> {
//							log.info("{} Demand consummerCode :{} ",currentDate,d.getConsumerCode());
							System.out.println(currentDate + " Demand consummerCode : " + d.getConsumerCode());

						});

						batchDemanService.batchRun(demandList, batchSize, requestInfo);

					} catch (Exception e) {
						log.error("Error while generating demands for tenant: " + tenantId, e);
					}
				}
			};

		batchExecutor.submit(task);

		}
		log.info("Finished demand generation job.");

	}

	public void sendNotificationAndUpdateDemand(RequestInfo requestInfo, String tenantCode, String consumerCode) {

		List<String> tenantIds = (tenantCode == null) ? demandRepository.getDistinctTenantIds()
				: Arrays.asList(tenantCode);
		log.info("Starting Notification job for tenants: {}", tenantIds);
		// requestInfo.getUserInfo().getTenantId());
		log.info("Starting Notification job for tenants: {}", tenantIds);

		for (String tenantId : tenantIds) {
			log.info("Notification for tenant: {}", tenantId);
			Runnable task = new Runnable() {

				@Override
				public void run() {
					try {
						sendNotificationUpdateDemand(tenantId, requestInfo, consumerCode);
					} catch (Exception e) {
						log.error("Error while Notification for tenant: " + tenantId, e);
					}
				}
			};

		batchExecutor.submit(task);

		}
		log.info("Finished Notification job.");

	}

	public void sendNotificationUpdateDemand(String tenantId, RequestInfo requestInfo, String consumerCode) {
		long now = System.currentTimeMillis();
		List<Demand> rawUnpaidDemands = demandRepository.getExpiredUnpaidDemands(tenantId, now, consumerCode);

		if (CollectionUtils.isEmpty(rawUnpaidDemands)) {
			log.info("No unpaid demands found for tenant: {}", tenantId);
			return;
		}

		DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, tenantId, null);
		Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;

		// Dynamically filter demands that are past their due date cutoff (e.g. 10th of billing month 23:59:59 IST)
		List<Demand> expiredDemands = rawUnpaidDemands.stream()
				.filter(d -> now > getDueCutoffEpoch(d, dueDay))
				.collect(Collectors.toList());

		if (CollectionUtils.isEmpty(expiredDemands)) {
			log.info("No expired unpaid demands found for tenant: {}", tenantId);
			return;
		}

		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);
		List<TaxPeriod> taxPeriods = masterDataService.getTaxPeriodList(requestInfo, tenantId, RLConstants.RL_SERVICE_NAME);
		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);

		// Populate demand details for expired demands
		expiredDemands.forEach(d -> {
			if (CollectionUtils.isEmpty(d.getDemandDetails())) {
				d.setDemandDetails(demandRepository.getDemandsDetailsByDemandId(Arrays.asList(d.getId())));
			}
		});

		RequestInfoWrapper wrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
		List<Demand> demandsToUpdate = new ArrayList<>();

		for (Demand demand : expiredDemands) {
			BigDecimal totalTax = demand.getDemandDetails().stream().map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal totalCollection = demand.getDemandDetails().stream().map(DemandDetail::getCollectionAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			if (totalTax.compareTo(totalCollection) > 0) {
				applyTimeBasedApplicables(demand, wrapper, taxPeriods, billingPeriods, penaltySlabs);
				demandsToUpdate.add(demand);
			}
		}

		if (!demandsToUpdate.isEmpty()) {
			demandRepository.updateDemand(requestInfo, demandsToUpdate);
			log.info("Successfully updated {} demands with penalty engine in scheduler for tenant: {}", demandsToUpdate.size(), tenantId);
		}
	}

	private long getDaysOverdue(Demand demand, long now, Integer dueDay) {
		long dueCutoffEpoch = getDueCutoffEpoch(demand, dueDay);
		long diffMillis = now - dueCutoffEpoch;
		if (diffMillis < 0) {
			return -1;
		}
		return diffMillis / 86400000L;
	}



	/**
	 * Fetches bills from billing service for saved demands.
	 * Called after demand generation to materialize bills.
	 * Failures are logged but do not block other bills — a summary is emitted at the end.
	 */
	public void fetchBillForDemands(List<Demand> demands, RequestInfo requestInfo) {
		int successCount = 0;
		int failCount = 0;
		for (Demand demand : demands) {
			try {
				StringBuilder fetchBillURL = utill.getFetchBillURL(demand.getTenantId(), demand.getConsumerCode());
				Object result = serviceRequestRepository.fetchResult(fetchBillURL,
						RequestInfoWrapper.builder().requestInfo(requestInfo).build());
				BillResponse billResponse = mapper.convertValue(result, BillResponse.class);
				if (billResponse.getBill() != null && !billResponse.getBill().isEmpty()) {
					log.info("Bill fetched successfully for consumerCode: {}", demand.getConsumerCode());
					successCount++;
				} else {
					log.warn("No bill generated for consumerCode: {}", demand.getConsumerCode());
					failCount++;
				}
			} catch (Exception ex) {
				log.error("Error fetching bill for consumerCode: {} — demand may lack a materialized bill", demand.getConsumerCode(), ex);
				failCount++;
			}
		}
		if (failCount > 0) {
			log.warn("fetchBillForDemands completed: {} succeeded, {} failed out of {} total demands", successCount, failCount, demands.size());
		}
	}

	public Demand createSingleDemand(long expireDate, AllotmentDetails allotmentDetails, RequestInfo requestInfo,
			String cycle) {
		List<Demand> demands = new ArrayList<>();

		String consumerCode = allotmentDetails.getApplicationNumber();

		OwnerInfo ownerInfo = allotmentDetails.getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
				.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId())
				.build();
		List<DemandDetail> demandDetails = calculationService.calculateDemand(false,
				AllotmentRequest.builder().allotment(Arrays.asList(allotmentDetails)).requestInfo(requestInfo).build());
		BigDecimal amountPayable = new BigDecimal(0);
		String applicationType = allotmentDetails.getApplicationType();

		amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
		amountPayable = calculationService.calculatePaybleAmount(allotmentDetails.getStartDate(),
				allotmentDetails.getEndDate(), amountPayable, cycle);

		DueDate dueDateConfig = masterDataService.getDueDateConfig(requestInfo, allotmentDetails.getTenantId(), cycle);
		Integer dueDay = (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;
		Demand tempDemand = Demand.builder().taxPeriodFrom(allotmentDetails.getStartDate()).build();
		long absoluteExpiry = getDueCutoffEpoch(tempDemand, dueDay);
		long durationMillis = Math.max(0L, absoluteExpiry - System.currentTimeMillis());

		Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
				.minimumAmountPayable(amountPayable).tenantId(allotmentDetails.getTenantId())
				.taxPeriodFrom(allotmentDetails.getStartDate()).taxPeriodTo(allotmentDetails.getEndDate())
				.billExpiryTime(durationMillis).fixedbillexpirydate(absoluteExpiry).consumerType(applicationType)
				.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
		demands.add(demand);
		return demand;
	}
}
