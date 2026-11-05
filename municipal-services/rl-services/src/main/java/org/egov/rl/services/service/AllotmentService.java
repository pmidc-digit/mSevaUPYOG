package org.egov.rl.services.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
import com.fasterxml.jackson.databind.JsonNode;
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
	 * States in which the application already has a demand - the only states in which a draft save may touch it.
	 * Before approval nothing was raised, so a draft must only persist the edits.
	 */
	private static final Set<String> DEMAND_RAISED_STATUSES = new HashSet<>(Arrays.asList(
			RLConstants.PENDING_FOR_PAYMENT_RL_APPLICATION, RLConstants.APPROVED));

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
			allotmentRequest.getAllotment().get(0).setStatus(RLConstants.APPROVED);
		}
		String previousApplicationNumber = allotmentRequest.getAllotment().get(0).getPreviousApplicationNumber();
		AllotmentDetails allotment = allotmentRequest.getAllotment().get(0);
		String resolvedIncomingType = resolveApplicationType(allotment);
		if (RLConstants.APPLICATION_TYPE_LEGACY.equalsIgnoreCase(resolvedIncomingType)) {
			allotment.setApplicationType(RLConstants.APPLICATION_TYPE_LEGACY);
			allotmentRequest.setAllotment(Arrays.asList(allotment));
		} else if (previousApplicationNumber != null && previousApplicationNumber.trim().length() > 0) {
			allotment.setApplicationType(RLConstants.RENEWAL_RL_APPLICATION);
			allotmentRequest.setAllotment(Arrays.asList(allotment));
		} else {
			allotment.setApplicationType(RLConstants.NEW_RL_APPLICATION);
			allotmentRequest.setAllotment(Arrays.asList(allotment));
		}
		allotmentProducer.push(config.getSaveRLAllotmentTopic(), allotmentRequest);
	    AllotmentDetails updatedAllotment = allotmentRequest.getAllotment().get(0);
	    updatedAllotment.setWorkflow(null);
		allotmentRequest.setAllotment(Arrays.asList(updatedAllotment));
		return allotmentRequest.getAllotment().get(0);
	}

	public AllotmentDetails allotmentUpdate(AllotmentRequest allotmentRequest) {
        String action=allotmentRequest.getAllotment().get(0).getWorkflow().getAction();
		allotmentValidator.validateUpdateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichUpdateRequest(allotmentRequest);
		userService.createUser(allotmentRequest);
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		allotmentRequest.setAllotment(Arrays.asList(allotmentDetails));
		boolean isApprove = action.contains(RLConstants.APPROVED_RL_APPLICATION);
		// A draft keeps the application in its current state, so its edits are carried by the enrichment alone
		// (the arrears live in additionalDetails). The demand is only touched when it already exists, i.e. while
		// the application is waiting for payment: before that nothing was raised, so there is nothing to update
		// and a draft must never create a demand.
		boolean isDraft = action != null && RLConstants.DRAFT_RL_APPLICATION.equalsIgnoreCase(action.trim());
		// A dedicated "levy adhoc penalty" action changes nothing but the adhoc charge. Like a draft it may only
		// touch a demand that already exists - before approval nothing was raised and the charge simply waits in
		// additionalDetails until the approval call picks it up.
		boolean isAdhocAction = action != null
				&& RLConstants.ADHOC_PENALTY_RL_APPLICATION.equalsIgnoreCase(action.trim());
		boolean isDemandSync = isApprove || ((isDraft || isAdhocAction) && hasRaisedDemand(allotmentDetails));
		boolean isLegacyApplication = isLegacyApplication(allotmentDetails);
		String applicationType = resolveApplicationType(allotmentDetails);
		if (isLegacyApplication) {
			allotmentDetails.setApplicationType(RLConstants.APPLICATION_TYPE_LEGACY);
		}

		log.info("Processing update for application: {}, action: {}, isApprove: {}, isLegacy: {}, applicationType: {}", 
				allotmentDetails.getApplicationNumber(), action, isApprove, isLegacyApplication, applicationType);

		if (isLegacyApplication && isDemandSync) {
			// Legacy demands are generated once and then reconciled: a demand that already exists is left alone,
			// except an arrear demand whose values changed and the standalone adhoc demand, which are updated in
			// place (same id, same issue instant).
			log.info("Syncing legacy demands for application: {} (approve: {}, draft: {}, adhoc: {})",
					allotmentDetails.getApplicationNumber(), isApprove, isDraft, isAdhocAction);
			try {
				// isSatelment=false, isSecurityDeposite=false (exclude security deposit)
				callCalculatorServiceForLegacy(allotmentRequest);
			} catch (Exception e) {
				log.error("Error syncing demand for legacy application: {}", allotmentDetails.getApplicationNumber(), e);
				throw new CustomException("CREATE_DEMAND_ERROR",
						"Error occurred while generating demand for legacy application.");
			}
		} else if (isApprove && applicationType != null
				&& (applicationType.contains(RLConstants.NEW_RL_APPLICATION)
						|| applicationType.contains(RLConstants.RENEWAL_RL_APPLICATION))) {
			try {
				callCalculatorService(false,true,allotmentRequest);
			} catch (Exception e) {
				e.printStackTrace();
				throw new CustomException("CREATE_DEMAND_ERROR",
						"Error occured while demand generation.");
			}
		}
		
		// The workflow transition is committed only AFTER the demand exists. It used to run first, so a failed
		// demand call left the application APPROVED with no bill - and it could not be replayed, because the
		// transition had already happened. Demand creation is idempotent per (tenant, consumerCode), so if the
		// transition itself fails, re-approving returns the stored demand instead of duplicating it.
		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().get(0).setStatus(RLConstants.APPROVED);
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

    /**
	 * True when the application is in a state that already has a demand, i.e. the only states in which a draft
	 * save may change anything on the demand.
	 */
	private boolean hasRaisedDemand(AllotmentDetails allotmentDetails) {
		if (allotmentDetails == null || allotmentDetails.getStatus() == null) {
			return false;
		}
		String status = allotmentDetails.getStatus().trim();
		return DEMAND_RAISED_STATUSES.stream().anyMatch(state -> state.equalsIgnoreCase(status));
	}

    /**
     * Check if the application is a legacy application based on additionalDetails
     * @param allotmentDetails The allotment details to check
     * @return true if applicationType in additionalDetails is "Legacy"
     */
    private boolean isLegacyApplication(AllotmentDetails allotmentDetails) {
        if (allotmentDetails == null) {
            log.warn("AllotmentDetails is null, cannot determine if legacy application");
            return false;
        }
		String applicationType = resolveApplicationType(allotmentDetails);
		boolean isLegacy = RLConstants.APPLICATION_TYPE_LEGACY.equalsIgnoreCase(applicationType);
		log.info("Resolved applicationType for application {} as {}, isLegacy: {}",
				allotmentDetails.getApplicationNumber(), applicationType, isLegacy);
		return isLegacy;
    }

	private String resolveApplicationType(AllotmentDetails allotmentDetails) {
		if (allotmentDetails == null) {
			return null;
		}
		String rootType = allotmentDetails.getApplicationType();
		if (rootType != null && !rootType.trim().isEmpty()) {
			if (RLConstants.APPLICATION_TYPE_LEGACY.equalsIgnoreCase(rootType)) {
				return RLConstants.APPLICATION_TYPE_LEGACY;
			}
			return rootType;
		}
		return null;
	}

    /**
     * Call calculator service for legacy applications
     * Extracts arrear details from additionalDetails and generates demand
     * @param allotmentRequest The allotment request containing legacy application details
     * @return The demand ID generated
     */
    private String callCalculatorServiceForLegacy(AllotmentRequest allotmentRequest) {
        AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
        JsonNode additionalDetails = allotmentDetails.getAdditionalDetails();

        // Extract arrear details from additionalDetails
        BigDecimal arrearAmount = BigDecimal.ZERO;
        BigDecimal baseArrear = BigDecimal.ZERO;
        BigDecimal arrearGST = BigDecimal.ZERO;
        BigDecimal arrearPenalty = BigDecimal.ZERO;
        BigDecimal futurePenalty = BigDecimal.ZERO;
        Long lastPaidUpto = null;
        Long arrearStartDate = null;
        Long arrearEndDate = null;

        if (additionalDetails != null) {
            // `arrear` wins over `arrearAmount` (kept from the original contract); `baseArrear` overrides both.
            if (additionalDetails.has(RLConstants.LEGACY_ARREAR_KEY)) {
                arrearAmount = readLegacyAmount(additionalDetails, RLConstants.LEGACY_ARREAR_KEY);
                baseArrear = arrearAmount;
            } else if (additionalDetails.has("arrearAmount")) {
                arrearAmount = readLegacyAmount(additionalDetails, "arrearAmount");
                baseArrear = arrearAmount;
            }
            if (additionalDetails.has("baseArrear")) {
                baseArrear = readLegacyAmount(additionalDetails, "baseArrear");
            }
            arrearGST = readLegacyAmount(additionalDetails, "arrearGST");
            arrearPenalty = readLegacyAmount(additionalDetails, "arrearPenalty");
            futurePenalty = readLegacyAmount(additionalDetails, "futurePenalty");

            lastPaidUpto = readLegacyDateMillis(additionalDetails, "lastPaidUpto", "lastPaidOn", "lastPaidDate");
            arrearStartDate = readLegacyDateMillis(additionalDetails, RLConstants.LEGACY_ARREAR_START_DATE_KEY);
            arrearEndDate = readLegacyDateMillis(additionalDetails, RLConstants.LEGACY_LAST_BILLING_PERIOD_KEY);
        }

        log.info("Legacy arrear input for application {}: arrearAmount={}, baseArrear={}, arrearGST={}, "
                        + "arrearPenalty={}, futurePenalty={}, lastPaidUpto={}, arrearStartDate={}, arrearEndDate={}",
                allotmentDetails.getApplicationNumber(), arrearAmount, baseArrear, arrearGST, arrearPenalty,
                futurePenalty, lastPaidUpto, arrearStartDate, arrearEndDate);

        CalculationReq calculationReq = getCalculationReqForLegacy(allotmentRequest, arrearAmount, baseArrear, arrearGST, arrearPenalty, futurePenalty, lastPaidUpto, arrearStartDate, arrearEndDate);

        StringBuilder url = new StringBuilder().append(config.getRlCalculatorHost())
                .append(config.getRlCalculatorEndpoint());
        Object response = serviceRequestRepository.fetchResult(url, calculationReq).get();
        DemandResponse demandResponse = mapper.convertValue(response, DemandResponse.class);
        String demandId = demandResponse.getDemands().get(0).getId();
        return demandId;
    }

    /**
     * Build CalculationReq for legacy applications with arrear details
     */
    private CalculationReq getCalculationReqForLegacy(AllotmentRequest allotmentRequest, BigDecimal arrearAmount,
                                                      BigDecimal baseArrear, BigDecimal arrearGST, BigDecimal arrearPenalty,
                                                      BigDecimal futurePenalty, Long lastPaidUpto,
                                                      Long arrearStartDate, Long arrearEndDate) {
        CalculationReq calculationReq = new CalculationReq();
        calculationReq.setRequestInfo(allotmentRequest.getRequestInfo());
        List<CalculationCriteria> calculationCriteriaList = new ArrayList<>();
        CalculationCriteria calculationCriteria = CalculationCriteria.builder()
                .isSecurityDeposite(false)
                .isSatelment(false)
                .isLegacyArrear(true)
                .arrearAmount(arrearAmount)
                .baseArrear(baseArrear)
                .arrearGST(arrearGST)
                .arrearPenalty(arrearPenalty)
                .futurePenalty(futurePenalty)
                .lastPaidUpto(lastPaidUpto)
                .arrearStartDate(arrearStartDate)
                .lastBillingPeriod(arrearEndDate)
                .allotmentRequest(allotmentRequest)
                .build();
        calculationCriteriaList.add(calculationCriteria);
        calculationReq.setCalculationCriteria(calculationCriteriaList);
        return calculationReq;
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

		if (!ObjectUtils.isEmpty(allotmentCriteria.getMobileNumber())) {
			log.info("DEBUG: Searching by mobile number: " + allotmentCriteria.getMobileNumber());

			List<String> userUuids1 = userService.getUserUuidsByMobileNumber(allotmentCriteria.getMobileNumber(),
					allotmentCriteria.getTenantId(), requestInfo);
			Set<String> userUuidSet = new HashSet<>(userUuids1);
			log.info("DEBUG: Found user UUIDs: " + userUuidSet);

			if (CollectionUtils.isEmpty(userUuidSet)) {
        
				log.info("DEBUG: No users found for mobile number, returning empty list");
				return new ArrayList<>();
			}
			allotmentCriteria.setOwnerIds(userUuidSet);
			allotmentCriteria.setMobileNumber(null);
		}
		
		List<AllotmentDetails> applications = allotmentRepository.getAllotmentSearch(allotmentCriteria);
		if (CollectionUtils.isEmpty(applications))
			return new ArrayList<>();
		allotmentEnrichmentService.enrichOwnerDetailsFromUserService(applications, requestInfo);
		return applications;
	}

	/**
	 * Reads a numeric arrear value from additionalDetails. A present but non numeric value fails fast with a
	 * meaningful error instead of surfacing as a raw NumberFormatException during demand generation.
	 */
	private BigDecimal readLegacyAmount(JsonNode details, String key) {
		if (details == null || key == null || !details.has(key)) {
			return BigDecimal.ZERO;
		}
		JsonNode node = details.get(key);
		if (node == null || node.isNull()) {
			return BigDecimal.ZERO;
		}
		String raw = node.asText();
		if (raw == null || raw.trim().isEmpty() || "null".equalsIgnoreCase(raw.trim())) {
			return BigDecimal.ZERO;
		}
		try {
			return new BigDecimal(raw.trim());
		} catch (NumberFormatException e) {
			throw new CustomException("INVALID_LEGACY_AMOUNT",
					"Unable to parse '" + key + "' value '" + raw + "'. Expected a numeric amount.");
		}
	}

	/**
	 * Reads an epoch-millis date from the first key that is present, or null when none is provided.
	 *
	 * <p>Jackson's {@code asLong()} returns 0 for a non numeric value without throwing, which would turn
	 * 1970-01-01 into the arrear start date (and generate an absurd penalty), so the value is parsed
	 * explicitly and a present but unreadable value fails fast.
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
			String trimmed = raw.trim();
			// The frontend sends 0 for "no value" - typically lastPaidUpto when the arrears come as a breakdown.
			// A non positive plain number is an absent date, never an unparseable one.
			if (isNotProvidedNumber(trimmed)) {
				continue;
			}
			LocalDate date = parseLegacyDate(trimmed);
			if (date == null) {
				throw new CustomException("INVALID_LEGACY_DATE", "Unable to parse '" + key + "' value '" + raw
						+ "'. Expected epoch millis, yyyy-MM-dd, ISO-8601 date-time or dd/MM/yyyy.");
			}
			return date.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant().toEpochMilli();
		}
		return null;
	}

	/** True when the value is a plain number that is zero or negative, i.e. the frontend's "not provided". */
	private static boolean isNotProvidedNumber(String value) {
		if (!value.matches("-?\\d+(\\.\\d+)?")) {
			return false;
		}
		return new BigDecimal(value).compareTo(BigDecimal.ZERO) <= 0;
	}

	/**
	 * Lenient date parser for legacy values. Accepts epoch millis (13+ digits), epoch seconds (10 digits),
	 * yyyy-MM-dd, yyyy/MM/dd, dd/MM/yyyy, dd-MM-yyyy and ISO-8601 date-times. Returns null when the value
	 * cannot be interpreted. Must stay in sync with rl-calculator's CalculationService#parseLegacyDate.
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
				return Instant.ofEpochMilli(epoch).atZone(ZoneId.of("Asia/Kolkata")).toLocalDate();
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
			return OffsetDateTime.parse(raw).atZoneSameInstant(ZoneId.of("Asia/Kolkata")).toLocalDate();
		} catch (Exception ignored) {
			return null;
		}
	}

}
