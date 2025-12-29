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

		if (calculationReq.getCalculationCriteria().get(0).isSatelment()) {
			return createSatelmentDemand(calculationReq);
		} else {

			boolean isSecurityDeposite = calculationReq.getCalculationCriteria().get(0).isSecurityDeposite();
			List<Demand> demands = new ArrayList<>();
			RequestInfo requestInfo = calculationReq.getRequestInfo();
			String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment()
					.getTenantId();

			for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

				AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
				AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();

//            String tenantId = allotmentRequest.getAllotment().getTenantId();
				String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

				OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
				Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
						.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo())
						.tenantId(ownerInfo.getTenantId()).build();
				List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite,
						allotmentRequest);
				BigDecimal amountPayable = new BigDecimal(0);
				String applicationType = allotmentRequest.getAllotment().getApplicationType();

				JsonNode property = allotmentDetails.getAdditionalDetails();
				String status = property.path("feesPeriodCycle").asText();
				long startDay = 0;
				long endDay = 0;
				long exparyDate = 0;
				switch (status) {
				case RLConstants.RL_MONTHLY_CYCLE: {
					startDay = allotmentDetails.getStartDate();
					endDay = daysCycleCalculationService.lastDayTimeOfCycle(startDay, 1);
					exparyDate = daysCycleCalculationService.addAfterPenaltyDays(endDay, requestInfo,
							allotmentDetails.getTenantId());
					break;
				}
				case RLConstants.RL_QUATERLY_CYCLE: {
					startDay = allotmentDetails.getStartDate();
					endDay = daysCycleCalculationService.lastDayTimeOfCycle(startDay, 3);
					exparyDate = daysCycleCalculationService.addAfterPenaltyDays(endDay, requestInfo,
							allotmentDetails.getTenantId());
					break;
				}
				case RLConstants.RL_BIAANNUALY_CYCLE: {
					startDay = allotmentDetails.getStartDate();
					endDay = daysCycleCalculationService.lastDayTimeOfCycle(startDay, 6);
					exparyDate = daysCycleCalculationService.addAfterPenaltyDays(endDay, requestInfo,
							allotmentDetails.getTenantId());
					break;
				}
				default: {
					startDay = allotmentDetails.getStartDate();
					endDay = daysCycleCalculationService.lastDayTimeOfCycle(startDay, 12);
					exparyDate = daysCycleCalculationService.addAfterPenaltyDays(endDay, requestInfo,
							allotmentDetails.getTenantId());
					break;
				}
				}

				amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
						BigDecimal::add);

				Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails)
						.payer(payerUser).minimumAmountPayable(amountPayable).tenantId(tenantId).taxPeriodFrom(startDay)
						.taxPeriodTo(endDay).fixedbillexpirydate(exparyDate).billExpiryTime(exparyDate)
						.consumerType(applicationType).businessService(RLConstants.RL_SERVICE_NAME)
						.additionalDetails(null).build();
				demands.add(demand);
			}

			List<Demand> demands1 = demandRepository.saveDemand(
					calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
			return DemandResponse.builder().demands(demands1).build();
		}
	}

	public DemandResponse createSatelmentDemand(CalculationReq calculationReq) {

		AllotmentRequest allotmentRequest = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest();
		List<Demand> demands = new ArrayList<>();
		RequestInfo requestInfo = calculationReq.getRequestInfo();
		String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment()
				.getTenantId();

		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
		BillingPeriod billingPeriod = billingPeriods.get(0); // Assuming that each ulb will follow only one type of
																// billing
		String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

		OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
				.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId())
				.build();

		List<DemandDetail> demandDetails = calculationService.calculateSatelmentDemand(allotmentRequest);
		BigDecimal amountPayable = new BigDecimal(0);
		String applicationType = allotmentRequest.getAllotment().getApplicationType();
		amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
		Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
				.minimumAmountPayable(amountPayable).tenantId(tenantId).taxPeriodFrom(billingPeriod.getTaxPeriodFrom())
				.taxPeriodTo(daysCycleCalculationService.minus5Days(billingPeriod.getTaxPeriodTo()))
				.billExpiryTime(billingPeriod.getDemandExpiryDate())

				.consumerType(applicationType).businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null)
				.build();

		demands.add(demand);
		List<Demand> demands1 = demandRepository.saveDemand(
				calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
		return DemandResponse.builder().demands(demands1).build();
	}

	public void createBulkDemand() {

	}

	public DemandResponse estimate(boolean isSecurityDeposite, CalculationReq calculationReq) {

		List<Demand> demands = new ArrayList<>();
		RequestInfo requestInfo = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo();
		String tenantId = calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getAllotment()
				.getTenantId();

		List<BillingPeriod> billingPeriods = masterDataService.getBillingPeriod(requestInfo, tenantId);
		BillingPeriod billingPeriod = billingPeriods.get(0); // Assuming that each ulb will follow only one type of
																// billing

		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {

			AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
			String consumerCode = allotmentRequest.getAllotment().getApplicationNumber();

			OwnerInfo ownerInfo = allotmentRequest.getAllotment().getOwnerInfo().get(0);
			Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
					.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo())
					.tenantId(ownerInfo.getTenantId()).build();
			List<DemandDetail> demandDetails = calculationService.calculateDemand(isSecurityDeposite, allotmentRequest);
			BigDecimal amountPayable = new BigDecimal(0);
			String applicationType = allotmentRequest.getAllotment().getApplicationType();

			amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
					BigDecimal::add);
			Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
					.minimumAmountPayable(amountPayable).tenantId(tenantId)
					.taxPeriodFrom(billingPeriod.getTaxPeriodFrom()).taxPeriodTo(billingPeriod.getTaxPeriodTo())
					.billExpiryTime(billingPeriod.getDemandEndDateMillis()).consumerType(applicationType)
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

			addRoundOffTaxHead(demand.getTenantId(), demand.getDemandDetails());
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

		Long demandCreationTime = demand.getAuditDetails() != null ? demand.getAuditDetails().getCreatedTime() : null;
		Long expiryDurationMillis = demand.getBillExpiryTime();
		log.info("Demand ID: {}. Creation Time: {}. Expiry Days: {}", demand.getId(), demandCreationTime,
				expiryDurationMillis);

		if (expiryDurationMillis == null || demandCreationTime == null) {
			log.error("Cannot apply penalty. Demand creation time or expiry days is null for demand: {}",
					demand.getId());
			return;
		}

		long expiryTimeMillis = demandCreationTime + expiryDurationMillis;
		log.info("Demand ID: {}. Calculated Expiry Timestamp: {}. Current Time: {}", demand.getId(), expiryTimeMillis,
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

		Set<Status> statusSet = new HashSet<>(Arrays.asList(Status.APPROVED,
				Status.FORWARD_FOR_DISCONNECTION_FIELD_INSPECTION, Status.FORWARD_FOT_SETLEMENT, // verify spelling
				Status.CLOSE, Status.REQUEST_FOR_DISCONNECTION));

		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseHost).path(basePath).queryParam("tenantId",
				tenantId);

		statusSet.forEach(s -> builder.queryParam("status", s.toString()));

		if (consumerCode != null) {
			builder.queryParam("applicationNumber", consumerCode);
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
							JsonNode property = d.getAdditionalDetails();
							String status = property.path("feesPeriodCycle").asText();

							switch (status) {

							case RLConstants.RL_MONTHLY_CYCLE:
								Demand demandM=schedulerService.monthlyBillGenerate(currentDate, d, requestInfo);
								if(demandM!=null) 
									demandList.add(demandM);
								break;

							case RLConstants.RL_QUATERLY_CYCLE:
								Demand demandQ=schedulerService.quterlyBillGenerate(currentDate, d, requestInfo);
								if(demandQ!=null) {
									demandList.add(demandQ);
								}
								break;

							case RLConstants.RL_BIAANNUALY_CYCLE:
								Demand demandB=schedulerService.biannualBillGenerate(currentDate, d, requestInfo);
								if(demandB!=null) {
								    demandList.add(demandB);
								}
								break;
							default:
								Demand demandY=schedulerService.yearlyBillGenerate(currentDate, d, requestInfo);
								if(demandY!=null)
								demandList.add(demandY);
							}
						});
//						log.info
						System.out.println("------::List of consummercode which have to generate demand::-----");
						demandList.stream().forEach(d->{
//							log.info("{} Demand consummerCode :{} ",currentDate,d.getConsumerCode());
							System.out.println(currentDate+" Demand consummerCode : "+d.getConsumerCode());
								
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

	public void sendNotificationAndUpdateDemand(RequestInfo requestInfo,String tenantCode,String consumerCode) {

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
						sendNotificationUpdateDemand(tenantId, requestInfo,consumerCode);
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

	public void sendNotificationUpdateDemand(String tenantId, RequestInfo requestInfo,String consumerCode) {
		
		List<AllotmentDetails> allotmentDetails = fetchApprovedAllotmentApplications(tenantId, requestInfo, consumerCode);
		
		allotmentDetails.stream().forEach(alt -> {
			List<Demand> dmdlist = demandRepository.getDemandsNotiByConsumerCode(Arrays.asList(alt.getApplicationNumber()));
			dmdlist = dmdlist.stream().map(d -> {
				d.setDemandDetails(demandRepository.getDemandsDetailsByDemandId(Arrays.asList(d.getId())));
				return d;
			}).collect(Collectors.toList());
			
			dmdlist.stream().forEach(d -> {
				
				ZoneId zone = ZoneId.of("Asia/Kolkata");
				LocalDate expireDate = Instant.ofEpochMilli(d.getBillExpiryTime()).atZone(zone).toLocalDate();
				LocalDate today = LocalDate.now(zone);
				if (ChronoUnit.DAYS.between(expireDate,today)==1) {
					System.out.println("dmdlist:--------"+d);
					DemandDetail baseAmount = d.getDemandDetails().stream()
							.filter(dt -> dt.getTaxHeadMasterCode().equals(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
							.findFirst().get();
					updatePenalty(baseAmount.getTaxAmount(), d, requestInfo);
				} else {
					notificationService.sendNotificationSMS(
							AllotmentRequest.builder().allotment(alt).requestInfo(requestInfo).build());
				}
			});
		});

	}

	public void updatePenalty(BigDecimal basicAmount, Demand demand, RequestInfo requestInfo) {
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		List<Penalty> panelty = masterDataService.getPenaltySlabs(requestInfo, demand.getTenantId());
		BigDecimal paneltyAmount = basicAmount.multiply(panelty.get(0).getRate()).divide(new BigDecimal(100));
		long now = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
		long exparyDate = daysCycleCalculationService.addAfterPenaltyDays(now, requestInfo, demand.getTenantId());
		List<DemandDetail> dataList = demand.getDemandDetails();
		DemandDetail demandDetail = DemandDetail.builder().demandId(demand.getId()).tenantId(demand.getTenantId())
				.taxHeadMasterCode(RLConstants.PENALTY_FEE_RL_APPLICATION).auditDetails(auditDetails)
				.taxAmount(paneltyAmount).collectionAmount(paneltyAmount).build();
		dataList.add(demandDetail);
		demand.setPayer(demand.getPayer());
		demand.setMinimumAmountPayable(demand.getMinimumAmountPayable().add(demandDetail.getTaxAmount()));
		demand.setDemandDetails(dataList);
		demand.setBillExpiryTime(exparyDate);
		demand.setFixedbillexpirydate(exparyDate);
		addRoundOffTaxHead(demand.getTenantId(), dataList);
		demandRepository.updateDemand(requestInfo, Arrays.asList(demand));
	}

	public Demand createSingleDemand(long expireDate, AllotmentDetails allotmentDetails, RequestInfo requestInfo) {
		List<Demand> demands = new ArrayList<>();

		String consumerCode = allotmentDetails.getApplicationNumber();

		OwnerInfo ownerInfo = allotmentDetails.getOwnerInfo().get(0);
		Owner payerUser = Owner.builder().name(ownerInfo.getName()).emailId(ownerInfo.getEmailId())
				.uuid(ownerInfo.getUserUuid()).mobileNumber(ownerInfo.getMobileNo()).tenantId(ownerInfo.getTenantId())
				.build();
		List<DemandDetail> demandDetails = calculationService.calculateDemand(false,
				AllotmentRequest.builder().allotment(allotmentDetails).requestInfo(requestInfo).build());
		BigDecimal amountPayable = new BigDecimal(0);
		String applicationType = allotmentDetails.getApplicationType();

		amountPayable = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		Demand demand = Demand.builder().consumerCode(consumerCode).demandDetails(demandDetails).payer(payerUser)
				.minimumAmountPayable(amountPayable).tenantId(allotmentDetails.getTenantId())
				.taxPeriodFrom(allotmentDetails.getStartDate()).taxPeriodTo(allotmentDetails.getEndDate())
				.billExpiryTime(expireDate).fixedbillexpirydate(expireDate).consumerType(applicationType)
				.businessService(RLConstants.RL_SERVICE_NAME).additionalDetails(null).build();
		demands.add(demand);
		return demand;
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
		BigDecimal previousRoundOff = BigDecimal.ZERO;

		// Sum all taxHeads except RoundOff
		for (DemandDetail dd : demandDetails) {
			String code = dd.getTaxHeadMasterCode();
			if (code != null && RLConstants.ROUND_OFF_RL_APPLICATION.equalsIgnoreCase(code)) {
				previousRoundOff = previousRoundOff.add(safe(dd.getTaxAmount()));
			} else {
				totalTax = totalTax.add(safe(dd.getTaxAmount()));
			}
		}

		// Nearest rupee target via HALF_UP
		BigDecimal rounded = totalTax.setScale(0, RoundingMode.HALF_UP);
		BigDecimal roundOff = rounded.subtract(totalTax); // +ve to go up, -ve to go down

		// Adjust with any previous round-off already present
		if (previousRoundOff.compareTo(BigDecimal.ZERO) != 0) {
			roundOff = roundOff.subtract(previousRoundOff);
		}

		// Add only if non-zero
		if (roundOff.compareTo(BigDecimal.ZERO) != 0) {
			DemandDetail roundOffDemandDetail = DemandDetail.builder()
					.taxHeadMasterCode(RLConstants.ROUND_OFF_RL_APPLICATION).taxAmount(roundOff)
					.collectionAmount(BigDecimal.ZERO).tenantId(tenantId).build();
			demandDetails.add(roundOffDemandDetail);
		}
	}

	private static BigDecimal safe(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

}
