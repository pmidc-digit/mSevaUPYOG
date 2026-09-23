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
import org.egov.rl.calculator.util.CalculatorConstants;
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

	/** Cutoff sentinel meaning "no penalty applies yet" - used when an arrear demand cannot be dated. */
	private static final long NO_PENALTY_CUTOFF = Long.MAX_VALUE;

	/**
	 * The tax heads that make up an arrear breakdown. These - and only these - may disappear from an arrear demand
	 * when a correction removes them from the request; the penalty head is excluded because the engine accrues on
	 * the same head as the migrated penalty.
	 */
	private static final Set<String> ARREAR_BREAKDOWN_HEADS = new HashSet<>(Arrays.asList(
			RLConstants.RL_ARREAR_FEE.toUpperCase(),
			RLConstants.CGST_FEE_RL_APPLICATION.toUpperCase(),
			RLConstants.SGST_FEE_RL_APPLICATION.toUpperCase(),
			RLConstants.ROUND_OFF_RL_APPLICATION.toUpperCase()));

	/**
	 * The heads of the standalone adhoc demand. They are owned by the employee, not by the engine, so they are set
	 * exactly as the request says (raised, changed or removed) instead of only ever being raised.
	 */
	private static final Set<String> ADHOC_HEADS = new HashSet<>(Arrays.asList(
			CalculatorConstants.RL_ADHOC_PENALTY.toUpperCase(),
			CalculatorConstants.RL_ADHOC_REBATE.toUpperCase()));

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
			Map<String, Demand> adhocUpdates = new LinkedHashMap<>();
			Map<String, Demand> alreadyCreated = new LinkedHashMap<>();
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

				// The adhoc penalty / exemption is attached to the current period's demand, so it can be added,
				// changed or removed at any time - including long after this period's demand exists.
				syncAdhocCharges(allotmentDetails, null, requestInfo, demands, adhocUpdates, alreadyCreated);
			}

			List<Demand> demands1 = demandRepository.saveDemand(
					calculationReq.getCalculationCriteria().get(0).getAllotmentRequest().getRequestInfo(), demands);
			List<Demand> touched = new ArrayList<>();
			if (!CollectionUtils.isEmpty(demands1)) {
				touched.addAll(demands1);
			}
			if (!adhocUpdates.isEmpty()) {
				List<Demand> updated = demandRepository.updateDemand(requestInfo, new ArrayList<>(adhocUpdates.values()));
				if (!CollectionUtils.isEmpty(updated)) {
					touched.addAll(updated);
				}
			}
			if (!touched.isEmpty()) {
				fetchBillForDemands(touched, requestInfo);
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
			// Nothing to raise for this request, but an adhoc charge may still have to be synced onto the current
			// period's demand below - an application that is paid up to date and has no arrears still has one.
			log.warn("No legacy demand could be built for the request");
		}

		// Idempotency guard: a retried _calculate (gateway/UI timeout, ops rerun) must not create a demand for a
		// period that already has one. Rent demands are matched on their exact billing period; an arrear demand is
		// matched as "this consumer already has an arrear demand", because its period end is the instant it was
		// created and can therefore never match on a retry.
		Map<String, List<Demand>> existingByConsumer = new HashMap<>();
		List<Demand> demandsToCreate = new ArrayList<>();
		Map<String, Demand> alreadyCreated = new LinkedHashMap<>();
		Map<String, Demand> demandUpdates = new LinkedHashMap<>();

		for (Demand demand : demands) {
			String consumerKey = demand.getTenantId() + "|" + demand.getConsumerCode();
			List<Demand> existing = existingByConsumer.get(consumerKey);
			if (existing == null) {
				existing = loadExistingDemands(demand.getTenantId(), demand.getConsumerCode());
				existingByConsumer.put(consumerKey, existing);
			}
			Demand duplicate = findDuplicate(existing, demand);
			if (duplicate == null) {
				demandsToCreate.add(demand);
				existing.add(demand); // also guards against two identical periods inside one request
				continue;
			}
			if (isArrearOnly(demand)) {
				// The application can still be edited (draft, or a replayed approval) after its arrear demand was
				// raised, so the migrated arrears may have changed. Reconcile instead of blindly skipping.
				Demand updated = reconcileDemand(duplicate, demand, requestInfo, ARREAR_BREAKDOWN_HEADS, true, "arrear");
				Demand effective = (updated != null) ? updated : duplicate;
				alreadyCreated.put(effective.getId(), effective);
				if (updated != null) {
					demandUpdates.put(updated.getId(), updated);
				}
			} else {
				log.warn("Demand already exists for consumer {} (id {}) covering {} to {} - skipping creation.",
						demand.getConsumerCode(), duplicate.getId(),
						formatCutoff(demand.getTaxPeriodFrom()), formatCutoff(demand.getTaxPeriodTo()));
				alreadyCreated.put(duplicate.getId(), duplicate);
			}
		}

		// The adhoc penalty / exemption is attached to the current period's demand, so adding, editing or removing
		// it never rewrites the demand of another period and never creates a second demand for the same one.
		for (CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {
			AllotmentRequest allotmentRequest = criteria.getAllotmentRequest();
			if (allotmentRequest == null || CollectionUtils.isEmpty(allotmentRequest.getAllotment())) {
				continue;
			}
			AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
			syncAdhocCharges(allotmentDetails,
					existingByConsumer.get(allotmentDetails.getTenantId() + "|" + allotmentDetails.getApplicationNumber()),
					requestInfo, demandsToCreate, demandUpdates, alreadyCreated);
		}

		List<Demand> savedDemands = null;
		if (!demandsToCreate.isEmpty()) {
			log.info("Saving legacy demand(s) to billing service. Count: {} ({} already existed)",
					demandsToCreate.size(), alreadyCreated.size());
			savedDemands = demandRepository.saveDemand(requestInfo, demandsToCreate);
		} else {
			log.info("All {} generated legacy demand(s) already exist - nothing to create.", demands.size());
		}

		// One _update call for every demand whose values changed (arrear and/or adhoc), then a single bill refresh
		// for everything this call touched - creating and updating share the same consumer code.
		List<Demand> updatedDemands = Collections.emptyList();
		if (!demandUpdates.isEmpty()) {
			log.info("{} demand(s) changed - updating them in place.", demandUpdates.size());
			updatedDemands = demandRepository.updateDemand(requestInfo, new ArrayList<>(demandUpdates.values()));
			if (updatedDemands == null) {
				updatedDemands = Collections.emptyList();
			}
		}

		List<Demand> touched = new ArrayList<>();
		if (!CollectionUtils.isEmpty(savedDemands)) {
			touched.addAll(savedDemands);
		}
		touched.addAll(updatedDemands);
		if (!touched.isEmpty()) {
			fetchBillForDemands(touched, requestInfo);
		}

		List<Demand> responseDemands = new ArrayList<>();
		if (!CollectionUtils.isEmpty(savedDemands)) {
			responseDemands.addAll(savedDemands);
		}
		responseDemands.addAll(alreadyCreated.values());
		return DemandResponse.builder().demands(responseDemands).build();
    }

	/**
	 * Existing demands of a consumer code with their tax heads attached, so an already existing arrear demand can
	 * be recognised. Fails closed: {@link DemandRepository#getExistingDemands} refuses to return an empty list when
	 * the duplicate check itself cannot run.
	 */
	private List<Demand> loadExistingDemands(String tenantId, String consumerCode) {
		List<Demand> existing = demandRepository.getExistingDemands(tenantId, consumerCode);
		if (CollectionUtils.isEmpty(existing)) {
			return existing;
		}
		List<String> demandIds = existing.stream().map(Demand::getId).filter(Objects::nonNull).collect(Collectors.toList());
		Map<String, List<DemandDetail>> detailsByDemandId = demandRepository.getDemandDetailsByDemandIds(demandIds);
		for (Demand demand : existing) {
			List<DemandDetail> details = detailsByDemandId.get(demand.getId());
			demand.setDemandDetails((details != null) ? details : new ArrayList<>());
		}
		return existing;
	}

	/** An existing demand covering the same period, or - for an arrear demand - any existing arrear demand. */
	private Demand findDuplicate(List<Demand> existingDemands, Demand candidate) {
		if (CollectionUtils.isEmpty(existingDemands)) {
			return null;
		}
		if (isArrearOnly(candidate)) {
			for (Demand existing : existingDemands) {
				if (isArrearOnly(existing)) {
					return existing;
				}
			}
			return null;
		}
		String candidatePeriod = periodKey(candidate.getTaxPeriodFrom(), candidate.getTaxPeriodTo());
		for (Demand existing : existingDemands) {
			if (candidatePeriod.equals(periodKey(existing.getTaxPeriodFrom(), existing.getTaxPeriodTo()))) {
				return existing;
			}
		}
		return null;
	}

	/** True when a demand carries RL_ARREAR_FEE and no rent head, i.e. it is the migrated arrear demand. */
	private static boolean isArrearOnly(Demand demand) {
		if (demand == null || CollectionUtils.isEmpty(demand.getDemandDetails())) {
			return false;
		}
		boolean hasArrear = false;
		for (DemandDetail detail : demand.getDemandDetails()) {
			String head = (detail != null) ? detail.getTaxHeadMasterCode() : null;
			if (head == null) {
				continue;
			}
			if (head.equalsIgnoreCase(RLConstants.RENT_LEASE_FEE_RL_APPLICATION)) {
				return false;
			}
			if (head.equalsIgnoreCase(RLConstants.RL_ARREAR_FEE)) {
				hasArrear = true;
			}
		}
		return hasArrear;
	}

	/** Exact period key for the duplicate check - the same precision the scheduler dedupe relies on. */
	private static String periodKey(Long from, Long to) {
		return from + ":" + to;
	}

	/**
	 * Brings an existing demand in line with what the request asks for.
	 *
	 * <p>Used by the arrear demand (a legacy application stays editable after its arrear demand was raised) and by
	 * the standalone adhoc demand (an adhoc charge can be added, changed or removed at any time). The demand is
	 * rewritten in place: it keeps its id, its payer and - for the arrear - its issue instant ({@code taxPeriodTo}),
	 * because that instant is what the arrear penalty clock is derived from; moving it would restart the accrual.
	 *
	 * <p>Nothing is sent to billing unless something really changed, so a replayed approval costs one local check
	 * and no round trip.
	 *
	 * @param removableHeads heads the caller owns and which therefore disappear when the request stops declaring
	 *                       them
	 * @param syncPeriod     whether the start of the period belongs to the caller (arrear start) or to the demand
	 *                       itself (the adhoc demand keeps the period it was raised with)
	 * @param label          name of the charge, for the logs
	 * @return the demand to update, or null when the stored demand already matches the request
	 */
	private Demand reconcileDemand(Demand storedDemand, Demand candidate, RequestInfo requestInfo,
			Set<String> removableHeads, boolean syncPeriod, String label) {
		if (!demandChanged(storedDemand, candidate, removableHeads, syncPeriod)) {
			log.info("{} values of consumer {} are unchanged - demand {} left untouched.", label,
					candidate.getConsumerCode(), storedDemand.getId());
			return null;
		}

		// Re-read the demand from billing so the update carries the complete object (full payer, ids of the tax
		// head rows) instead of a partial row.
		Demand stored = fetchDemandsFromBilling(candidate.getTenantId(), candidate.getConsumerCode(), requestInfo).stream()
				.filter(d -> d.getId() != null && d.getId().equalsIgnoreCase(storedDemand.getId()))
				.findFirst().orElse(null);
		if (stored == null) {
			log.warn("{} demand {} of consumer {} could not be re-read from billing - the change was not applied.",
					label, storedDemand.getId(), candidate.getConsumerCode());
			return null;
		}

		List<DemandDetail> merged = mergeDemandDetails(stored, candidate, removableHeads);
		stored.setDemandDetails(merged);
		// The in place edit can change the rupee total, so the round off head (and the payable amount) is
		// recomputed on the merged details.
		calculationService.addRoundOffTaxHead(stored.getTenantId(), merged);
		stored.setMinimumAmountPayable(merged.stream().map(DemandDetail::getTaxAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add));
		if (candidate.getAdditionalDetails() != null) {
			stored.setAdditionalDetails(candidate.getAdditionalDetails());
		}
		if (syncPeriod) {
			// The arrear start is only a label and may be corrected; the issue instant is never moved.
			stored.setTaxPeriodFrom(candidate.getTaxPeriodFrom());
		}
		log.info("{} demand {} of consumer {} reconciled: {} tax head(s) applied.", label, stored.getId(),
				candidate.getConsumerCode(), merged.size());
		return stored;
	}

	/**
	 * True when the stored demand no longer matches what the request asks for. Only the tax heads the request
	 * actually declares are compared - a penalty the engine has accrued on the demand in the meantime must not be
	 * mistaken for a change of the migrated values.
	 */
	private boolean demandChanged(Demand existing, Demand candidate, Set<String> removableHeads, boolean syncPeriod) {
		if (existing == null || candidate == null) {
			return true;
		}
		if (syncPeriod && !Objects.equals(existing.getTaxPeriodFrom(), candidate.getTaxPeriodFrom())) {
			return true;
		}
		if (!sameAmount(extractFuturePenaltyRate(existing), extractFuturePenaltyRate(candidate))) {
			return true;
		}
		Map<String, BigDecimal> storedAmounts = amountsByTaxHead(existing);
		Map<String, BigDecimal> candidateAmounts = amountsByTaxHead(candidate);
		// A component that disappeared from the request is a change as well (stale GST must not survive).
		for (String head : removableHeads) {
			if (!candidateAmounts.containsKey(head) && storedAmounts.containsKey(head)) {
				return true;
			}
		}
		for (Map.Entry<String, BigDecimal> entry : candidateAmounts.entrySet()) {
			BigDecimal oldAmount = storedAmounts.get(entry.getKey());
			BigDecimal newAmount = entry.getValue();
			if (RLConstants.PENALTY_TAXHEAD_CODE.equalsIgnoreCase(entry.getKey()) && oldAmount != null
					&& oldAmount.compareTo(newAmount) > 0) {
				// The migrated penalty shares its tax head with the penalty accrued by the engine - never lower it.
				continue;
			}
			if (oldAmount == null || oldAmount.compareTo(newAmount) != 0) {
				return true;
			}
		}
		return false;
	}

	/** Tax head (upper case) to summed tax amount, for the demand details of a demand read over JDBC. */
	private static Map<String, BigDecimal> amountsByTaxHead(Demand demand) {
		Map<String, BigDecimal> amounts = new LinkedHashMap<>();
		if (demand == null || CollectionUtils.isEmpty(demand.getDemandDetails())) {
			return amounts;
		}
		for (DemandDetail detail : demand.getDemandDetails()) {
			String head = (detail != null) ? detail.getTaxHeadMasterCode() : null;
			if (head == null || head.trim().isEmpty()) {
				continue;
			}
			BigDecimal amount = (detail.getTaxAmount() != null) ? detail.getTaxAmount() : BigDecimal.ZERO;
			amounts.merge(head.trim().toUpperCase(), amount, BigDecimal::add);
		}
		return amounts;
	}

	/** Null safe equality for money, ignoring the scale ({@code 18} equals {@code 18.00}). */
	private static boolean sameAmount(BigDecimal first, BigDecimal second) {
		if (first == null || second == null) {
			return first == second;
		}
		return first.compareTo(second) == 0;
	}

	/**
	 * Merges the amounts of a freshly generated demand into the demand stored in billing, tax head by tax head.
	 * Stored rows keep their id and their collectionAmount, so an amount already collected is never lost, and heads
	 * the request does not mention are left as they are.
	 */
	private List<DemandDetail> mergeDemandDetails(Demand stored, Demand candidate, Set<String> removableHeads) {
		List<DemandDetail> merged = CollectionUtils.isEmpty(stored.getDemandDetails())
				? new ArrayList<>()
				: new ArrayList<>(stored.getDemandDetails());
		Map<String, DemandDetail> byTaxHead = new HashMap<>();
		Set<String> requestedHeads = new HashSet<>();
		for (DemandDetail detail : merged) {
			String head = (detail != null) ? detail.getTaxHeadMasterCode() : null;
			if (head != null && !head.trim().isEmpty()) {
				byTaxHead.put(head.trim().toUpperCase(), detail);
			}
		}

		for (DemandDetail incoming : candidate.getDemandDetails()) {
			String head = (incoming != null) ? incoming.getTaxHeadMasterCode() : null;
			if (head == null || head.trim().isEmpty()) {
				continue;
			}
			head = head.trim().toUpperCase();
			requestedHeads.add(head);
			BigDecimal newAmount = (incoming.getTaxAmount() != null) ? incoming.getTaxAmount() : BigDecimal.ZERO;
			DemandDetail target = byTaxHead.get(head);
			if (target == null) {
				DemandDetail added = DemandDetail.builder().taxAmount(newAmount).taxHeadMasterCode(head)
						.tenantId(stored.getTenantId()).collectionAmount(BigDecimal.ZERO)
						.demandId(stored.getId()).build();
				merged.add(added);
				byTaxHead.put(head, added);
				continue;
			}
			BigDecimal existingAmount = (target.getTaxAmount() != null) ? target.getTaxAmount() : BigDecimal.ZERO;
			if (RLConstants.PENALTY_TAXHEAD_CODE.equalsIgnoreCase(head) && existingAmount.compareTo(newAmount) > 0) {
				log.info("Keeping the higher penalty {} on demand {} instead of the supplied {}.",
						existingAmount, stored.getId(), newAmount);
				continue;
			}
			BigDecimal collected = (target.getCollectionAmount() != null) ? target.getCollectionAmount()
					: BigDecimal.ZERO;
			if (collected.compareTo(newAmount) > 0) {
				// Money is already with the ULB: lowering the head would leave the demand over collected (a credit).
				log.warn("{} was already collected against {} of demand {} - the head is kept at {} instead of being "
						+ "reduced to {}; adjust the collection instead.", collected, head, stored.getId(),
						existingAmount, newAmount);
				continue;
			}
			target.setTaxAmount(newAmount);
		}

		// A component removed from the request disappears from the demand, otherwise a corrected breakdown would
		// keep charging the old one. Only heads the caller owns can go, and never one that already collects money.
		Iterator<DemandDetail> remaining = merged.iterator();
		while (remaining.hasNext()) {
			DemandDetail detail = remaining.next();
			String head = (detail.getTaxHeadMasterCode() != null)
					? detail.getTaxHeadMasterCode().trim().toUpperCase() : "";
			if (!removableHeads.contains(head) || requestedHeads.contains(head)) {
				continue;
			}
			BigDecimal collected = (detail.getCollectionAmount() != null) ? detail.getCollectionAmount()
					: BigDecimal.ZERO;
			if (collected.compareTo(BigDecimal.ZERO) > 0) {
				log.warn("{} was already collected against {} of demand {} - the head is kept; adjust the collection "
						+ "instead.", collected, head, stored.getId());
				continue;
			}
			remaining.remove();
		}
		return merged;
	}

	/**
	 * Applies the adhoc penalty / exemption of an application at any time, without ever creating a second demand.
	 *
	 * <p>Billing allows exactly one demand per (consumer code, period, business service) - enforced by a unique
	 * constraint - so the adhoc charge is attached to the CURRENT period's demand and nowhere else. A charge
	 * recorded on an earlier period is closed history: it is never edited or removed retroactively, and it is never
	 * repeated on a later period. The caller clears the value ({@code adhocPenalty: 0}) when the charge no longer
	 * applies. Removing the adhoc values drops the two heads from the current period's demand; money already
	 * collected against them is never touched.
	 * @param existingDemands the consumer's demands with their details; loaded here when the caller passes null
	 * @param toCreate        demands to post to billing (the current period's candidate may be in here)
	 * @param toUpdate        demands to update in place, keyed by id
	 * @param kept            demands to return to the caller, keyed by id
	 */
	private void syncAdhocCharges(AllotmentDetails allotmentDetails, List<Demand> existingDemands,
			RequestInfo requestInfo, List<Demand> toCreate, Map<String, Demand> toUpdate, Map<String, Demand> kept) {
		if (allotmentDetails == null) {
			return;
		}
		if (existingDemands == null) {
			existingDemands = loadExistingDemands(allotmentDetails.getTenantId(),
					allotmentDetails.getApplicationNumber());
		}
		long entryDate = (allotmentDetails.getCreatedTime() > 0) ? allotmentDetails.getCreatedTime()
				: System.currentTimeMillis();
		List<DemandDetail> desired = calculationService.buildAdhocDetails(allotmentDetails);

		Demand candidate = null;
		for (Demand possible : toCreate) {
			if (isCurrentPeriodDemand(possible, entryDate)) {
				candidate = possible;
				break;
			}
		}
		if (candidate != null) {
			if (desired.isEmpty()) {
				// Nothing to add, and a demand that is not posted yet has nothing to remove either.
				return;
			}
			// About to be posted: fold the heads in so the round off and the payable amount cover them.
			guardAdhocExemption(candidate.getDemandDetails(), desired, allotmentDetails.getApplicationNumber());
			candidate.getDemandDetails().addAll(desired);
			calculationService.addRoundOffTaxHead(candidate.getTenantId(), candidate.getDemandDetails());
			candidate.setMinimumAmountPayable(candidate.getDemandDetails().stream().map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add));
			log.info("Adhoc charge applied to the current period demand of application {}.",
					allotmentDetails.getApplicationNumber());
			return;
		}

		Demand currentPeriod = findCurrentPeriodDemand(existingDemands, entryDate);
		if (currentPeriod == null) {
			if (!desired.isEmpty()) {
				log.warn("No current period demand found to carry the adhoc charge of application {} - it was not "
						+ "applied.", allotmentDetails.getApplicationNumber());
			}
			return;
		}
		guardAdhocExemption(currentPeriod.getDemandDetails(), desired, allotmentDetails.getApplicationNumber());
		Demand updated = reconcileDemand(currentPeriod, asDesiredState(currentPeriod, desired), requestInfo,
				ADHOC_HEADS, false, "adhoc");
		kept.put(currentPeriod.getId(), (updated != null) ? updated : currentPeriod);
		if (updated != null) {
			toUpdate.put(updated.getId(), updated);
		}
	}

	/**
	 * Refuses an adhoc exemption larger than the tax it is deducted from, otherwise the demand would end up negative.
	 * The adhoc heads themselves never count towards that tax - a charge must not finance its own exemption, and an
	 * exemption already applied must not mask a bigger one.
	 */
	private void guardAdhocExemption(List<DemandDetail> existingDetails, List<DemandDetail> desired,
			String consumerCode) {
		BigDecimal exemption = BigDecimal.ZERO;
		for (DemandDetail detail : desired) {
			if (detail.getTaxAmount() != null && detail.getTaxAmount().compareTo(BigDecimal.ZERO) < 0) {
				exemption = exemption.add(detail.getTaxAmount().negate());
			}
		}
		if (exemption.compareTo(BigDecimal.ZERO) <= 0) {
			return;
		}
		BigDecimal taxable = BigDecimal.ZERO;
		for (DemandDetail detail : existingDetails) {
			String head = (detail.getTaxHeadMasterCode() != null)
					? detail.getTaxHeadMasterCode().trim().toUpperCase() : "";
			if (ADHOC_HEADS.contains(head)) {
				continue;
			}
			taxable = taxable.add((detail.getTaxAmount() != null) ? detail.getTaxAmount() : BigDecimal.ZERO);
		}
		if (exemption.compareTo(taxable) > 0) {
			throw new CustomException("RL_ADHOC_REBATE_INVALID_AMOUNT",
					"The adhoc exemption " + exemption + " is greater than the " + taxable
							+ " charged on the demand of application " + consumerCode
							+ ". Enter an amount up to the demand amount.");
		}
	}

	/** The demand of the period the entry instant falls in - the only demand an adhoc charge may land on. */
	private static Demand findCurrentPeriodDemand(List<Demand> demands, long entryDate) {
		if (CollectionUtils.isEmpty(demands)) {
			return null;
		}
		for (Demand demand : demands) {
			if (isCurrentPeriodDemand(demand, entryDate)) {
				return demand;
			}
		}
		return null;
	}

	/**
	 * True for a demand whose period contains the given instant and which is not the arrear demand (whose period end
	 * is the instant the arrear demand was raised, not a billing period). The adhoc charge already carried by that
	 * demand does not disqualify it - it is what makes re-editing the current period idempotent.
	 */
	private static boolean isCurrentPeriodDemand(Demand demand, long entryDate) {
		if (demand == null || CollectionUtils.isEmpty(demand.getDemandDetails()) || isArrearOnly(demand)) {
			return false;
		}
		Long from = demand.getTaxPeriodFrom();
		Long to = demand.getTaxPeriodTo();
		return from != null && to != null && from <= entryDate && entryDate <= to;
	}

	/** Minimal stand-in for "the demand as the request wants it", used to drive the in-place reconcile. */
	private static Demand asDesiredState(Demand stored, List<DemandDetail> desiredDetails) {
		return Demand.builder().id(stored.getId()).tenantId(stored.getTenantId())
				.consumerCode(stored.getConsumerCode()).demandDetails(desiredDetails).build();
	}

	/** Full demands of a consumer code as billing knows them - payer, audit details and the ids of the details. */
	private List<Demand> fetchDemandsFromBilling(String tenantId, String consumerCode, RequestInfo requestInfo) {
		try {
			GetBillCriteria criteria = GetBillCriteria.builder().tenantId(tenantId)
					.consumerCodes(Collections.singletonList(consumerCode)).build();
			Object result = serviceRequestRepository.fetchResult(utill.getDemandSearchUrl(criteria),
					RequestInfoWrapper.builder().requestInfo(requestInfo).build());
			DemandResponse response = mapper.convertValue(result, DemandResponse.class);
			return (response != null && response.getDemands() != null) ? response.getDemands() : Collections.emptyList();
		} catch (Exception e) {
			log.error("Could not read the existing demands of consumer {} from billing: {}",
					consumerCode, e.getMessage(), e);
			return Collections.emptyList();
		}
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
		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);
		// Every demand is judged with the DueDate row of its own billing cycle (due day + rebate percentage)
		DueDateResolver dueDateResolver = buildDueDateResolver(requestInfo, tenantId, demands);

		for (Demand demand : demands) {
			BigDecimal totalTax = demand.getDemandDetails().stream().map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal totalCollection = demand.getDemandDetails().stream().map(DemandDetail::getCollectionAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			if (totalTax.compareTo(totalCollection) > 0) {
				applyTimeBasedApplicables(demand, requestInfoWrapper, dueDateResolver.resolve(demand), penaltySlabs);
			}

			calculationService.addRoundOffTaxHead(demand.getTenantId(), demand.getDemandDetails());
			demandsToBeUpdated.add(demand);
		}

		demandRepository.updateDemand(requestInfo, demandsToBeUpdated);
		return DemandResponse.builder().demands(demandsToBeUpdated).build();
	}

	/**
	 * Applies the early payment rebate or the late payment penalty to a single demand.
	 *
	 * <p>Both the due day and the rebate percentage come from the DueDate row resolved for the demand's billing
	 * cycle (see {@link DueDateResolver}) - they are never taken from an arbitrary row of the master.
	 */
	private void applyTimeBasedApplicables(Demand demand, RequestInfoWrapper requestInfoWrapper,
			DueDate dueDateConfig, List<Penalty> penaltySlabs) {
		int dueDay = dueDayOf(dueDateConfig);
		// Evaluated at the exact current instant: the early payment rebate holds up to the due cutoff
		// (last millisecond of the due day) and penalty starts the day after. Shifting this "now" by a day
		// (as was done before) removed the rebate on the due day itself and charged one extra day of interest.
		long now = System.currentTimeMillis();

		// Rent principal drives the early payment rebate
		BigDecimal rentPrincipalAmount = demand.getDemandDetails().stream().filter(
				detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RENT_LEASE_FEE_RL_APPLICATION))
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		// Legacy arrear demands carry RL_ARREAR_FEE instead of RENT_LEASE_FEE, but are still liable to penalty
		BigDecimal arrearPrincipalAmount = demand.getDemandDetails().stream().filter(
				detail -> detail.getTaxHeadMasterCode().equalsIgnoreCase(RLConstants.RL_ARREAR_FEE))
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal penaltyPrincipalAmount = rentPrincipalAmount.add(arrearPrincipalAmount);

		if (penaltyPrincipalAmount.compareTo(BigDecimal.ZERO) <= 0) {
			log.info("Principal amount is zero or less for demand: {}. Skipping time-based applicables.", demand.getId());
			return;
		}

		long dueCutoffEpoch = penaltyCutoffEpoch(demand, dueDay, rentPrincipalAmount, arrearPrincipalAmount);
		log.info("Applying time based applicables for demand: {} (cycle={}, dueDay={}, penaltyFrom={})",
				demand.getId(), (dueDateConfig != null ? dueDateConfig.getBillingCycle() : null), dueDay,
				formatCutoff(dueCutoffEpoch));

		RequestInfo requestInfo = (requestInfoWrapper != null) ? requestInfoWrapper.getRequestInfo() : new RequestInfo();

		//if today is less than due date apply rebate and else reset rebate 
		if (now <= dueCutoffEpoch) {
			// Early payment rebate applies on rent (on or before 10th of the month). Arrear-only demands are
			// not eligible for a rebate.
			BigDecimal rebateAmount = BigDecimal.ZERO;
			if (rentPrincipalAmount.compareTo(BigDecimal.ZERO) > 0 && dueDateConfig != null
					&& dueDateConfig.getRebatePercentage() != null && dueDateConfig.getRebatePercentage() > 0) {
				rebateAmount = rentPrincipalAmount.multiply(BigDecimal.valueOf(dueDateConfig.getRebatePercentage()))
						.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
			} else if (rentPrincipalAmount.compareTo(BigDecimal.ZERO) > 0 && dueDateConfig != null
					&& dueDateConfig.getRebateFlatAmount() != null
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

			// Penalty clock: calendar days between the due date and today, the same convention the penalty
			// strategies use. The due day itself is not late (rebate), the first penalty day is the day after.
			LocalDate dueDate = Instant.ofEpochMilli(dueCutoffEpoch).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
			LocalDate paymentDate = Instant.ofEpochMilli(now).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate();
			long daysLate = Math.max(0L, ChronoUnit.DAYS.between(dueDate, paymentDate));

			// Apply penalty if penalty slabs are configured
			if (!CollectionUtils.isEmpty(penaltySlabs)) {
				BigDecimal futurePenaltyRate = extractFuturePenaltyRate(demand);
				boolean arrearOnly = arrearPrincipalAmount.compareTo(BigDecimal.ZERO) > 0
						&& rentPrincipalAmount.compareTo(BigDecimal.ZERO) <= 0;
				// Legacy arrears accrue penalty ONLY at the rate the caller supplied (futurePenalty). Without it
				// nothing is charged on the arrears - falling back to the tenant's generic penalty configuration
				// would silently apply a rate that has nothing to do with the migrated arrears.
				boolean arrearRateMissing = arrearOnly
						&& (futurePenaltyRate == null || futurePenaltyRate.compareTo(BigDecimal.ZERO) <= 0);
				PenaltyConfig penaltyConfig = null;
				if (futurePenaltyRate != null && futurePenaltyRate.compareTo(BigDecimal.ZERO) > 0) {
					// The FORMULA is whatever the tenant configured in MDMS for the ARREAR scope (a Penalty row with
					// appliesTo = "ARREAR", else the generic row): SIMPLE_INTEREST, MONTHLY_FIXED, COMPOUNDING or FIXED.
					// Only the RATE is overridden by the demand's futurePenalty - a FIXED row ignores the rate and charges
					// its own flatAmount. min/max caps and the grace period come from the same configured row.
					PenaltyConfig arrearConfig = masterDataService.getPenaltyConfig(requestInfo, demand.getTenantId(), "ARREAR");
					penaltyConfig = PenaltyConfig.builder()
							.penaltyType(arrearConfig != null ? arrearConfig.resolvedPenaltyType() : "SIMPLE_INTEREST")
							.annualRate(futurePenaltyRate)
							.rate(futurePenaltyRate)
							.flatAmount(arrearConfig != null ? arrearConfig.getFlatAmount() : null)
							.applicableAfterDays(arrearConfig != null && arrearConfig.getApplicableAfterDays() != null
									? arrearConfig.getApplicableAfterDays() : 0)
							.minAmount(arrearConfig != null ? arrearConfig.getMinAmount() : null)
							.maxAmount(arrearConfig != null ? arrearConfig.getMaxAmount() : null)
							.build();
					if ("FIXED".equalsIgnoreCase(penaltyConfig.resolvedPenaltyType())
							&& penaltyConfig.getFlatAmount() == null) {
						log.warn("Tenant {} configured the FIXED penalty type for arrears but no flatAmount - no arrear "
								+ "penalty can be charged on demand {}.", demand.getTenantId(), demand.getId());
					}
				} else if (!arrearRateMissing) {
					penaltyConfig = masterDataService.getPenaltyConfig(requestInfo, demand.getTenantId(), "RENT");
				}

				BigDecimal penaltyAmount = BigDecimal.ZERO;
				if (penaltyConfig != null) {
					PenaltyCalculator calculator = penaltyCalculatorFactory.getCalculator(penaltyConfig.resolvedPenaltyType());
					penaltyAmount = calculator.calculatePenalty(penaltyPrincipalAmount, dueDate, paymentDate, penaltyConfig);

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
				} else if (arrearRateMissing) {
					log.info("Arrear demand {} carries no futurePenalty rate - no penalty is applied to the arrears.",
							demand.getId());
				} else {
					// Fallback if penaltyConfig is null but penaltySlab exists
					Penalty penaltySlab = penaltySlabs.get(0);
					if (penaltySlab.getApplicableAfterDays() == null || daysLate >= penaltySlab.getApplicableAfterDays()) {
						if (penaltySlab.getRate() != null && penaltySlab.getRate().compareTo(BigDecimal.ZERO) > 0) {
							penaltyAmount = penaltyPrincipalAmount.multiply(penaltySlab.getRate()).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
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
		long startEpoch = (demand.getTaxPeriodFrom() != null && demand.getTaxPeriodFrom() > 0)
				? demand.getTaxPeriodFrom()
				: ((demand.getAuditDetails() != null && demand.getAuditDetails().getCreatedTime() != null)
						? demand.getAuditDetails().getCreatedTime()
						: System.currentTimeMillis());
		return getDueCutoffEpoch(startEpoch, dueDay);
	}

	/**
	 * Due cutoff (last millisecond of the due day, IST) derived from an explicit period start.
	 */
	private long getDueCutoffEpoch(long startEpoch, Integer dueDay) {
		int targetDueDay = (dueDay != null && dueDay > 0) ? dueDay : 10;

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

	/**
	 * Cutoff that decides whether a demand earns the early payment rebate or starts incurring penalty.
	 *
	 * <p>Rent demands use the due day of their own billing period. A legacy arrear demand is issued for the whole
	 * outstanding amount, which already includes everything (rent, GST and penalty) up to the issue date, so its
	 * clock must never be back-dated to the arrears start: penalty starts after the due day of the period in
	 * which the demand was issued, and never before the issue instant itself.
	 *
	 * <p>Returns {@link #NO_PENALTY_CUTOFF} (i.e. no penalty at all) when an arrear demand cannot be dated, so a
	 * mis-dated arrear can never be penalised retroactively.
	 */
	private long penaltyCutoffEpoch(Demand demand, int dueDay, BigDecimal rentPrincipalAmount, BigDecimal arrearPrincipalAmount) {
		boolean arrearOnly = arrearPrincipalAmount.compareTo(BigDecimal.ZERO) > 0
				&& rentPrincipalAmount.compareTo(BigDecimal.ZERO) <= 0;
		if (!arrearOnly) {
			return getDueCutoffEpoch(demand, dueDay);
		}
		Long issuedAt = arrearIssueInstant(demand);
		if (issuedAt == null) {
			log.warn("Arrear demand {} has no issue date (taxPeriodTo / createdTime) - penalty is held back until it can be dated.",
					demand.getId());
			return NO_PENALTY_CUTOFF;
		}
		long issueMonthDueCutoff = getDueCutoffEpoch(issuedAt, dueDay);
		return Math.max(issueMonthDueCutoff, issuedAt);
	}

	/**
	 * Instant at which a legacy arrear demand was issued. The demand generator sets {@code taxPeriodTo} to the
	 * creation instant (for new and pre-existing arrear demands alike); the audit created time is the fallback.
	 */
	private Long arrearIssueInstant(Demand demand) {
		if (demand.getTaxPeriodTo() != null && demand.getTaxPeriodTo() > 0) {
			return demand.getTaxPeriodTo();
		}
		if (demand.getAuditDetails() != null && demand.getAuditDetails().getCreatedTime() != null
				&& demand.getAuditDetails().getCreatedTime() > 0) {
			return demand.getAuditDetails().getCreatedTime();
		}
		return null;
	}

	/** Human readable form of a cutoff for logging; {@link #NO_PENALTY_CUTOFF} prints as "never". */
	private static String formatCutoff(long cutoffEpoch) {
		if (cutoffEpoch == NO_PENALTY_CUTOFF) {
			return "never";
		}
		return Instant.ofEpochMilli(cutoffEpoch).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate().toString();
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

		// Filter and penalise using the DueDate row of each demand's own billing cycle
		DueDateResolver dueDateResolver = buildDueDateResolver(requestInfo, tenantId, rawUnpaidDemands);

		// Overdue pre-filter. It deliberately uses the period-based cutoff, which for an arrear demand is
		// back-dated to its arrears start: that keeps the filter inclusive for arrears, while the exact
		// "penalty only after the issue period's due day" rule is applied by applyTimeBasedApplicables.
		List<Demand> expiredDemands = rawUnpaidDemands.stream()
				.filter(d -> now > getDueCutoffEpoch(d, dueDayOf(dueDateResolver.resolve(d))))
				.collect(Collectors.toList());

		if (CollectionUtils.isEmpty(expiredDemands)) {
			log.info("No expired unpaid demands found for tenant: {}", tenantId);
			return;
		}

		List<Penalty> penaltySlabs = masterDataService.getPenaltySlabs(requestInfo, tenantId);

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
				applyTimeBasedApplicables(demand, wrapper, dueDateResolver.resolve(demand), penaltySlabs);
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
	 * Billing aggregates every demand of a consumer code into a single bill, so the fetch is done once per
	 * (tenantId, consumerCode) instead of once per demand - a legacy approval can create dozens of demands.
	 * Failures are logged but do not block other bills — a summary is emitted at the end.
	 */
	public void fetchBillForDemands(List<Demand> demands, RequestInfo requestInfo) {
		Set<String> fetchedFor = new HashSet<>();
		int successCount = 0;
		int failCount = 0;
		for (Demand demand : demands) {
			String fetchKey = demand.getTenantId() + ":" + demand.getConsumerCode();
			if (!fetchedFor.add(fetchKey)) {
				continue;
			}
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
			log.warn("fetchBillForDemands completed: {} succeeded, {} failed out of {} consumer codes",
					successCount, failCount, fetchedFor.size());
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

	/** Due day from a resolved DueDate row, defaulting to 10 when the master does not define one. */
	private static int dueDayOf(DueDate dueDateConfig) {
		return (dueDateConfig != null && dueDateConfig.getDueDay() != null) ? dueDateConfig.getDueDay() : 10;
	}

	/**
	 * Builds the DueDate resolver for a batch of demands: the tenant's DueDate rows plus - only when the tenant
	 * configures more than one cycle and some demand cannot identify its cycle from its own period - the
	 * feesPeriodCycle of the affected allotments (a single batched read).
	 */
	private DueDateResolver buildDueDateResolver(RequestInfo requestInfo, String tenantId, List<Demand> demands) {
		List<DueDate> dueDates = masterDataService.getDueDateConfigs(requestInfo, tenantId);

		Map<String, String> cycleFromAllotment = Collections.emptyMap();
		if (dueDates.size() > 1 && !CollectionUtils.isEmpty(demands)) {
			Set<String> unresolved = new HashSet<>();
			for (Demand demand : demands) {
				if (demand.getConsumerCode() != null && inferCycleFromPeriod(demand) == null) {
					unresolved.add(demand.getConsumerCode());
				}
			}
			if (!unresolved.isEmpty()) {
				cycleFromAllotment = demandRepository.getBillingCyclesByApplicationNumbers(new ArrayList<>(unresolved));
			}
		}

		DueDateResolver resolver = new DueDateResolver(dueDates, cycleFromAllotment);
		resolver.primeFrom(demands);
		return resolver;
	}

	/**
	 * Infers the billing cycle from a demand's own billing period: 1 / 3 / 6 / 12 whole months map to
	 * MONTHLY / QUATERLY / BIANNUAL / ANNUAL. Demands generated by the legacy arrear flow always carry clean
	 * periods; an arrear demand (period spans the whole arrears window) matches nothing and returns null.
	 */
	private static String inferCycleFromPeriod(Demand demand) {
		if (demand == null) {
			return null;
		}
		Long from = demand.getTaxPeriodFrom();
		Long to = demand.getTaxPeriodTo();
		if (from == null || to == null || from <= 0 || to <= from) {
			return null;
		}
		LocalDate periodStart = Instant.ofEpochMilli(from).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate().withDayOfMonth(1);
		LocalDate periodEnd = Instant.ofEpochMilli(to).atZone(ZoneId.of(RLConstants.TIME_ZONE)).toLocalDate().withDayOfMonth(1);
		long months = ChronoUnit.MONTHS.between(periodStart, periodEnd) + 1;
		if (months == 1) {
			return RLConstants.RL_MONTHLY_CYCLE;
		}
		if (months == 3) {
			return RLConstants.RL_QUATERLY_CYCLE;
		}
		if (months == 6) {
			return RLConstants.RL_BIAANNUALY_CYCLE;
		}
		if (months == 12) {
			return RLConstants.RL_YEARLY_CYCLE;
		}
		return null;
	}

	/**
	 * Resolves the tenant DueDate row (due day + rebate percentage) that applies to a demand.
	 *
	 * <p>MDMS keeps one DueDate row per billing cycle, but a demand does not store its cycle, so it is inferred:
	 * <ol>
	 *   <li>from the demand's own billing period (1/3/6/12 months),</li>
	 *   <li>from another demand of the same consumer code in the same batch - an arrear demand's period spans
	 *       the whole arrears window and cannot identify a cycle, while its rent siblings can,</li>
	 *   <li>from the allotment's stored feesPeriodCycle (loaded once per batch),</li>
	 *   <li>otherwise the tenant's first row, exactly as before, with a warning.</li>
	 * </ol>
	 * A tenant with a single DueDate row always gets that row - no inference and no extra work.
	 */
	private static final class DueDateResolver {

		private final DueDate singleRow;
		private final Map<String, DueDate> byCycle = new HashMap<>();
		private final DueDate fallback;
		private final Map<String, String> cycleFromAllotment;
		private final Map<String, String> cycleByConsumerCode = new HashMap<>();
		private final Set<String> warnedConsumers = new HashSet<>();

		private DueDateResolver(List<DueDate> dueDates, Map<String, String> cycleFromAllotment) {
			List<DueDate> rows = (dueDates != null) ? dueDates : Collections.<DueDate>emptyList();
			for (DueDate row : rows) {
				if (row != null && row.getBillingCycle() != null && !row.getBillingCycle().trim().isEmpty()) {
					byCycle.put(row.getBillingCycle().trim().toUpperCase(), row);
				}
			}
			this.singleRow = (rows.size() == 1) ? rows.get(0) : null;
			this.fallback = rows.isEmpty() ? null : rows.get(0);
			this.cycleFromAllotment = (cycleFromAllotment != null) ? cycleFromAllotment : Collections.<String, String>emptyMap();
		}

		/**
		 * Pre-resolves the cycle of every consumer code in the batch, so the processing order of its demands
		 * (arrear demand before or after its rent siblings) does not matter.
		 */
		private void primeFrom(List<Demand> demands) {
			if (singleRow != null || CollectionUtils.isEmpty(demands)) {
				return;
			}
			for (Demand demand : demands) {
				String consumerCode = demand.getConsumerCode();
				if (consumerCode == null || cycleByConsumerCode.containsKey(consumerCode)) {
					continue;
				}
				String cycle = inferCycleFromPeriod(demand);
				if (cycle == null) {
					cycle = cycleFromAllotment.get(consumerCode);
				}
				if (cycle != null && byCycle.containsKey(cycle.trim().toUpperCase())) {
					cycleByConsumerCode.put(consumerCode, cycle.trim());
				}
			}
		}

		private DueDate resolve(Demand demand) {
			if (singleRow != null) {
				return singleRow;
			}
			if (demand != null && demand.getConsumerCode() != null) {
				String cycle = cycleByConsumerCode.get(demand.getConsumerCode());
				if (cycle != null) {
					return byCycle.get(cycle.toUpperCase());
				}
				if (warnedConsumers.add(demand.getConsumerCode())) {
					log.warn("Could not determine the billing cycle for {} (no usable billing period and no "
									+ "feesPeriodCycle in the allotment). Using the DueDate row of cycle '{}'.",
							demand.getConsumerCode(), (fallback != null ? fallback.getBillingCycle() : null));
				}
			}
			return fallback;
		}
	}

	/**
	 * Reads {@code futurePenalty} (an <b>annual</b> percentage) from the demand additionalDetails, if present.
	 * Returns null when the demand carries no rate, so the caller falls back to the tenant MDMS penalty config.
	 */
	private BigDecimal extractFuturePenaltyRate(Demand demand) {
		if (demand == null || demand.getAdditionalDetails() == null) return null;
		try {
			JsonNode details = mapper.convertValue(demand.getAdditionalDetails(), JsonNode.class);
			if (details != null && details.hasNonNull("futurePenalty")) {
				String raw = details.path("futurePenalty").asText();
				if (raw != null && !raw.trim().isEmpty()) {
					return new BigDecimal(raw.trim());
				}
			}
		} catch (Exception e) {
			log.warn("Ignoring unreadable futurePenalty on demand {}: {}", demand.getId(), e.getMessage());
		}
		return null;
	}
}
