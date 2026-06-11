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
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DemandService {

	@Autowired
	MasterDataService masterDataService;

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

	public DemandResponse createDemand(CalculationReq calculationReq) {
		CalculationCriteria firstCriteria = calculationReq.getCalculationCriteria().get(0);
		boolean isLegacyApplication = isLegacyApplication(firstCriteria);

		if (firstCriteria.isSatelment()) {
			return createSatelmentDemand(calculationReq);
	        } else if (firstCriteria.isLegacyArrear() || isLegacyApplication) {
            return createMonthlyLegacyDemands(calculationReq);
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

					long demandCreationEpoch = System.currentTimeMillis();
					long expiryDays = 10;
					List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);
					if (penaltySlabs != null && !penaltySlabs.isEmpty() && penaltySlabs.get(0).getApplicableAfterDays() != null) {
						expiryDays = penaltySlabs.get(0).getApplicableAfterDays().longValue();
					}
					long durationMillis = expiryDays * 24 * 60 * 60 * 1000L;
					long absoluteExpiry = demandCreationEpoch + durationMillis;

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
    public DemandResponse createMonthlyLegacyDemands(CalculationReq calculationReq) {
		log.info("Creating monthly legacy demands - START");
        List<Demand> demands = new ArrayList<>();
        RequestInfo requestInfo = calculationReq.getRequestInfo();
		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {
			List<Demand> generated = calculationService.generateMonthlyLegacyDemands(criteria, requestInfo);
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

			long demandCreationEpoch = System.currentTimeMillis();
			long expiryDays = 10;
			List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);
			if (penaltySlabs != null && !penaltySlabs.isEmpty() && penaltySlabs.get(0).getApplicableAfterDays() != null) {
				expiryDays = penaltySlabs.get(0).getApplicableAfterDays().longValue();
			}
			long durationMillis = expiryDays * 24 * 60 * 60 * 1000L;
			long absoluteExpiry = demandCreationEpoch + durationMillis;

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

			long demandCreationEpoch = System.currentTimeMillis();
			long expiryDays = 10;
			List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);
			if (penaltySlabs != null && !penaltySlabs.isEmpty() && penaltySlabs.get(0).getApplicableAfterDays() != null) {
				expiryDays = penaltySlabs.get(0).getApplicableAfterDays().longValue();
			}
			long durationMillis = expiryDays * 24 * 60 * 60 * 1000L;
			long absoluteExpiry = demandCreationEpoch + durationMillis;

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

		if (CollectionUtils.isEmpty(penaltySlabs)) {
			log.info("No penalty slabs found for tenant: {}", demand.getTenantId());
			return;
		}
		log.info("Found {} penalty slabs.", penaltySlabs.size());

		Long expiryTimeMillis = demand.getTaxPeriodTo();
		
		if (expiryTimeMillis == null) {
			log.error("Cannot apply penalty. Demand taxPeriodTo is null for demand: {}", demand.getId());
			return;
		}

		log.info("Demand ID: {}. TaxPeriodTo (Expiry Time): {}. Current Time: {}", demand.getId(), expiryTimeMillis,
				System.currentTimeMillis());

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

		BigDecimal principalAmount = demand.getDemandDetails().stream().filter(
				detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		log.info("Demand ID: {}. Principal amount for penalty calculation: {}", demand.getId(), principalAmount);

		if (principalAmount.compareTo(BigDecimal.ZERO) <= 0) {
			log.info("Principal amount is zero or less for demand: {}. Skipping penalty.", demand.getId());
			return;
		}

		Penalty penaltySlab = penaltySlabs.get(0);
		log.info("Demand ID: {}. Using Penalty Slab: Applicable After {} days.", demand.getId(),
				penaltySlab.getApplicableAfterDays());

		if (penaltySlab.getApplicableAfterDays() != null && daysPastExpiry > penaltySlab.getApplicableAfterDays()) {
			log.info("Applying penalty for demand: {}", demand.getId());

			BigDecimal penaltyAmount = BigDecimal.ZERO;

			if (penaltySlab.getRate() != null && penaltySlab.getRate().compareTo(BigDecimal.ZERO) > 0) {
				penaltyAmount = principalAmount.multiply(penaltySlab.getRate()).divide(new BigDecimal(100), 2,
						RoundingMode.HALF_UP);
			} else if (penaltySlab.getFlatAmount() != null
					&& penaltySlab.getFlatAmount().compareTo(BigDecimal.ZERO) > 0) {
				penaltyAmount = penaltySlab.getFlatAmount();
			}

			if (penaltySlab.getMinAmount() != null && penaltyAmount.compareTo(penaltySlab.getMinAmount()) < 0) {
				penaltyAmount = penaltySlab.getMinAmount();
			}

			if (penaltySlab.getMaxAmount() != null && penaltyAmount.compareTo(penaltySlab.getMaxAmount()) > 0) {
				penaltyAmount = penaltySlab.getMaxAmount();
			}

			if (penaltyAmount.compareTo(BigDecimal.ZERO) > 0) {
				DemandDetail penaltyDetail = DemandDetail.builder().taxAmount(penaltyAmount)
						.taxHeadMasterCode(RLConstants.PENALTY_TAXHEAD_CODE).tenantId(demand.getTenantId())
						.collectionAmount(BigDecimal.ZERO).demandId(demand.getId()).build();
				demand.getDemandDetails().add(penaltyDetail);
				log.info("Penalty of {} applied for demand: {}", penaltyAmount, demand.getId());
			} else {
				log.warn("Calculated penalty amount is zero or less for demand: {}. No penalty applied.",
						demand.getId());
			}
		} else {
			log.info("Penalty grace period not over for demand: {}", demand.getId());
		}
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
									.collect(Collectors.toList()).get(0); // Assuming
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

			Thread t = new Thread(task);
			t.start();

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

			Thread t = new Thread(task);
			t.start();

		}
		log.info("Finished Notification job.");

	}

	public void sendNotificationUpdateDemand(String tenantId, RequestInfo requestInfo, String consumerCode) {
		long now = System.currentTimeMillis();
		List<Demand> expiredDemands = demandRepository.getExpiredUnpaidDemands(tenantId, now, consumerCode);

		if (CollectionUtils.isEmpty(expiredDemands)) {
			log.info("No expired unpaid demands found for tenant: {}", tenantId);
			return;
		}

		expiredDemands = expiredDemands.stream().map(d -> {
			d.setDemandDetails(demandRepository.getDemandsDetailsByDemandId(Arrays.asList(d.getId())));
			return d;
		}).collect(Collectors.toList());

		List<Demand> demandsToUpdate = new ArrayList<>();
		expiredDemands.forEach(d -> {
			try {
				boolean updated = applyDailyPenaltyAndInterest(d, requestInfo);
				if (updated) {
					demandsToUpdate.add(d);
				}
			} catch (Exception e) {
				log.error("Error applying penalty/interest for demand: " + d.getId(), e);
			}
		});

		if (!demandsToUpdate.isEmpty()) {
			demandRepository.updateDemand(requestInfo, demandsToUpdate);
			log.info("Successfully updated {} demands with penalty/interest.", demandsToUpdate.size());
		}
	}

	private boolean applyDailyPenaltyAndInterest(Demand demand, RequestInfo requestInfo) {
		long now = System.currentTimeMillis();
		DemandDetail baseAmount = demand.getDemandDetails().stream()
				.filter(dt -> dt.getTaxHeadMasterCode().equals(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
				.findFirst().orElse(null);
		if (baseAmount == null) {
			log.warn("No base rent detail found for demand: {}", demand.getId());
			return false;
		}
		BigDecimal baseRent = baseAmount.getTaxAmount();
		if (baseRent == null || baseRent.compareTo(BigDecimal.ZERO) <= 0) {
			return false;
		}

		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, demand.getTenantId());
		if (CollectionUtils.isEmpty(penaltySlabs)) {
			log.warn("No Penalty configuration found for tenant: {}", demand.getTenantId());
			return false;
		}
		BigDecimal flatPenaltyRate = penaltySlabs.get(0).getRate();

		List<Interest> interestSlabs = masterDataService.getInterestSlabs(requestInfo, demand.getTenantId());
		if (CollectionUtils.isEmpty(interestSlabs)) {
			log.warn("No Interest configuration found for tenant: {}", demand.getTenantId());
			return false;
		}
		BigDecimal dailyPenaltyRate = interestSlabs.get(0).getRate();

		long billExpiryTimeEpoch;
		if (demand.getFixedbillexpirydate() != null && demand.getFixedbillexpirydate() > 0) {
			billExpiryTimeEpoch = demand.getFixedbillexpirydate();
		} else {
			long createdTime = (demand.getAuditDetails() != null && demand.getAuditDetails().getCreatedTime() != null)
					? demand.getAuditDetails().getCreatedTime()
					: (demand.getTaxPeriodFrom() != null ? demand.getTaxPeriodFrom() : now);
			long expiryDuration = (demand.getBillExpiryTime() != null) ? demand.getBillExpiryTime() : 0L;
			billExpiryTimeEpoch = createdTime + expiryDuration;
		}
		long diffMillis = now - billExpiryTimeEpoch;
		log.info("DEBUG: Demand ID: {}, fixedbillexpirydate: {}, auditDetails: {}, createdTime: {}, billExpiryTime: {}, billExpiryTimeEpoch: {}, diffMillis: {}, now: {}", 
				demand.getId(), 
				demand.getFixedbillexpirydate(), 
				demand.getAuditDetails(), 
				(demand.getAuditDetails() != null ? demand.getAuditDetails().getCreatedTime() : null), 
				demand.getBillExpiryTime(), 
				billExpiryTimeEpoch, 
				diffMillis, 
				now);
		if (diffMillis < 0) {
			return false;
		}
		long daysOverdue = diffMillis / 86400000L;

		boolean demandModified = false;
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		List<DemandDetail> dataList = demand.getDemandDetails();

		// Flat Penalty: one-time flat % on base rent (RL_PENALTY_FEE)
		boolean hasFlatPenalty = dataList.stream()
				.anyMatch(dd -> dd.getTaxHeadMasterCode().equals(RLConstants.PENALTY_FEE_RL_APPLICATION));
		if (!hasFlatPenalty && daysOverdue >= 0) {
			BigDecimal flatPenaltyAmount = baseRent.multiply(flatPenaltyRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
			if (flatPenaltyAmount.compareTo(BigDecimal.ZERO) > 0) {
				DemandDetail flatPenaltyDetail = DemandDetail.builder()
						.demandId(demand.getId())
						.tenantId(demand.getTenantId())
						.taxHeadMasterCode(RLConstants.PENALTY_FEE_RL_APPLICATION)
						.auditDetails(auditDetails)
						.taxAmount(flatPenaltyAmount)
						.collectionAmount(BigDecimal.ZERO)
						.build();
				dataList.add(flatPenaltyDetail);
				demand.setMinimumAmountPayable(demand.getMinimumAmountPayable().add(flatPenaltyAmount));
				demandModified = true;
				log.info("Appended flat penalty: {} to demand: {}", flatPenaltyAmount, demand.getId());
			}
		}

		// Daily Interest: applied EVERY day including day 0 (RL_DAILYINTEREST)
		long existingDailyCount = dataList.stream()
				.filter(dd -> dd.getTaxHeadMasterCode().equals(RLConstants.RL_DAILYINTEREST))
				.count();
		long expectedDailyCount = daysOverdue + 1;
		if (existingDailyCount < expectedDailyCount) {
			long linesToAppend = expectedDailyCount - existingDailyCount;
			BigDecimal dailyPenaltyAmount = baseRent.multiply(dailyPenaltyRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
			if (dailyPenaltyAmount.compareTo(BigDecimal.ZERO) > 0) {
				for (int i = 0; i < linesToAppend; i++) {
					DemandDetail interestDetail = DemandDetail.builder()
							.demandId(demand.getId())
							.tenantId(demand.getTenantId())
							.taxHeadMasterCode(RLConstants.RL_DAILYINTEREST)
							.auditDetails(auditDetails)
							.taxAmount(dailyPenaltyAmount)
							.collectionAmount(BigDecimal.ZERO)
							.build();
					dataList.add(interestDetail);
					demand.setMinimumAmountPayable(demand.getMinimumAmountPayable().add(dailyPenaltyAmount));
				}
				demandModified = true;
				log.info("Appended {} daily interest lines of amount: {} each to demand: {}", linesToAppend, dailyPenaltyAmount, demand.getId());
			}
		}

		if (demandModified) {
			demand.setDemandDetails(dataList);
		}
		return demandModified;
	}

	@Deprecated
	public void updatePenalty(BigDecimal basicAmount, Demand demand, RequestInfo requestInfo) {
		applyDailyPenaltyAndInterest(demand, requestInfo);
		demandRepository.updateDemand(requestInfo, Arrays.asList(demand));
	}

	/**
	 * Fetches bills from billing service for saved demands.
	 * Called after demand generation to materialize bills.
	 */
	public void fetchBillForDemands(List<Demand> demands, RequestInfo requestInfo) {
		for (Demand demand : demands) {
			try {
				StringBuilder fetchBillURL = utill.getFetchBillURL(demand.getTenantId(), demand.getConsumerCode());
				Object result = serviceRequestRepository.fetchResult(fetchBillURL,
						RequestInfoWrapper.builder().requestInfo(requestInfo).build());
				BillResponse billResponse = mapper.convertValue(result, BillResponse.class);
				if (billResponse.getBill() != null && !billResponse.getBill().isEmpty()) {
					log.info("Bill fetched successfully for consumerCode: {}", demand.getConsumerCode());
				} else {
					log.warn("No bill generated for consumerCode: {}", demand.getConsumerCode());
				}
			} catch (Exception ex) {
				log.error("Error fetching bill for consumerCode: {}", demand.getConsumerCode(), ex);
			}
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

		long demandCreationEpoch = System.currentTimeMillis();
		long expiryDays = 10;
		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, allotmentDetails.getTenantId());
		if (penaltySlabs != null && !penaltySlabs.isEmpty() && penaltySlabs.get(0).getApplicableAfterDays() != null) {
			expiryDays = penaltySlabs.get(0).getApplicableAfterDays().longValue();
		}
		long durationMillis = expiryDays * 24 * 60 * 60 * 1000L;
		long absoluteExpiry = demandCreationEpoch + durationMillis;

		Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
				.minimumAmountPayable(amountPayable).tenantId(allotmentDetails.getTenantId())
				.taxPeriodFrom(allotmentDetails.getStartDate()).taxPeriodTo(allotmentDetails.getEndDate())
				.billExpiryTime(durationMillis).fixedbillexpirydate(absoluteExpiry).consumerType(applicationType)
				.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
		demands.add(demand);
		return demand;
	}
}
