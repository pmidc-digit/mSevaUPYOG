package org.egov.rl.calculator.service;

import java.util.List;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.rl.calculator.producer.Producer;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.repository.ServiceRequestRepository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.AllotmentRequest;
import org.egov.rl.calculator.web.models.RentRevision;
import org.egov.rl.calculator.web.models.UserDetailResponse;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

/**
 * Service to perform the Auto Escalation process
 * 
 *  @author Roshan chaudhary
 */
@Service
@Slf4j
public class RLAutoEscalationService {
	
	private final ObjectMapper mapper;
	private final UserService userService;
	private final Configurations config;
	private final ServiceRequestRepository serviceRequestRepository;
	private final DemandRepository demandRepository;
	private final Producer producer;
	private final PropertyUtil propertyUtil;
		
	@Autowired
	public RLAutoEscalationService(ObjectMapper mapper,
			UserService userService,
			Configurations config,
			ServiceRequestRepository serviceRequestRepository,
			DemandRepository demandRepository,
			Producer producer,
			PropertyUtil propertyUtil) {
		this.mapper = mapper;
		this.userService = userService;
		this.config = config;
		this.serviceRequestRepository = serviceRequestRepository;
		this.demandRepository = demandRepository;
		this.producer = producer;
		this.propertyUtil = propertyUtil;
	}

	/**
	 * Create the RequestInfo object of the System user
	 * 
	 * @return RequestInfo object
	 */
	public RequestInfo getDefaultRequestInfo() {
		RequestInfo requestInfo = new RequestInfo();

		UserDetailResponse ownerInfo = userService.searchSystemUser();
		User user = mapper.convertValue(ownerInfo.getUser().get(0), User.class);

		List<Role> r = user.getRoles().stream().map(d -> {
			d = Role.builder().code(d.getCode()).id(d.getId()).name(d.getName()).tenantId(d.getTenantId()).build();
			return d;
		}).collect(Collectors.toList());
		user.setRoles(r);
		
		requestInfo.setApiId("Rainmaker");
		requestInfo.setAuthToken("128b3831-98ab-4ac3-9424-545aecbe05c3");
		requestInfo.setMsgId("1756728031554|en_IN");
		requestInfo.setPlainAccessRequest(null);
		requestInfo.setUserInfo(user);
		
		return requestInfo;
	}

	public void processAutoEscalation() {
		log.info("Processing Auto Escalation");
		RequestInfo requestInfo = getDefaultRequestInfo();
		List<String> tenantIds = demandRepository.getDistinctTenantIds();
		for (String tenantId : tenantIds) {
			try {
				List<AllotmentDetails> activeAllotments = fetchActiveAllotmentApplications(tenantId, requestInfo);
				if (CollectionUtils.isEmpty(activeAllotments)) {
					continue;
				}
				for (AllotmentDetails allotment : activeAllotments) {
					try {
						processAllotmentEscalation(allotment, requestInfo);
					} catch (Exception e) {
						log.error("Error processing escalation for allotment application " + allotment.getApplicationNumber(), e);
					}
				}
			} catch (Exception e) {
				log.error("Error processing escalation for tenant: " + tenantId, e);
			}
		}
	}

	private List<AllotmentDetails> fetchActiveAllotmentApplications(String tenantId, RequestInfo requestInfo) {
		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();

		String baseHost = config.getRlServiceHost();
		String basePath = config.getRlSearchEndpoint();

		java.util.Set<org.egov.rl.calculator.web.models.demand.Status> statusSet = new java.util.HashSet<>(java.util.Arrays.asList(
				org.egov.rl.calculator.web.models.demand.Status.APPROVED,
				org.egov.rl.calculator.web.models.demand.Status.FORWARD_FOT_SETLEMENT,
				org.egov.rl.calculator.web.models.demand.Status.PENDING_FOR_PAYMENT,
				org.egov.rl.calculator.web.models.demand.Status.REQUEST_FOR_DISCONNECTION
		));
		java.util.StringJoiner joiner = new java.util.StringJoiner(",");
		statusSet.stream().filter(java.util.Objects::nonNull).map(org.egov.rl.calculator.web.models.demand.Status::name).forEach(joiner::add);

		org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(baseHost).path(basePath)
				.queryParam("tenantId", tenantId);
		builder.queryParam("status", joiner.toString());
		builder.queryParam("isExpaireFlag", false);

		String url = builder.build().toUriString();

		log.info("AUTO ESCALATION ALLOTMENT SEARCH URI: " + url);
		try {
			Object result = serviceRequestRepository.fetchResult(new StringBuilder(url), requestInfoWrapper).get();
			org.egov.rl.calculator.web.models.AllotmentSearchResponse response = mapper.convertValue(result, org.egov.rl.calculator.web.models.AllotmentSearchResponse.class);
			return response.getAllotment();
		} catch (Exception e) {
			log.error("Error while fetching active allotment applications for tenant: " + tenantId, e);
			return java.util.Collections.emptyList();
		}
	}

	private void processAllotmentEscalation(AllotmentDetails allotment, RequestInfo requestInfo) {
		String tenantId = allotment.getTenantId();
		List<org.egov.rl.calculator.web.models.RLProperty> properties = propertyUtil.getCalculateAmount(allotment.getPropertyId(),
				requestInfo, tenantId, org.egov.rl.calculator.util.RLConstants.RL_MASTER_MODULE_NAME);
		if (CollectionUtils.isEmpty(properties)) {
			log.warn("Property " + allotment.getPropertyId() + " not found in MDMS, skipping escalation.");
			return;
		}
		org.egov.rl.calculator.web.models.RLProperty property = properties.get(0);
		java.math.BigDecimal baseRent = new java.math.BigDecimal(property.getBaseRent());

		java.math.BigDecimal incrementPercentage = null;
		Long nextRevisionDate = null;

		List<RentRevision> revisions = allotment.getRentRevisions();
		RentRevision latestRevision = null;
		if (!CollectionUtils.isEmpty(revisions)) {
			latestRevision = revisions.stream()
					.filter(r -> r.getRevisionDate() != null)
					.max(java.util.Comparator.comparing(RentRevision::getRevisionDate))
					.orElse(null);
		}

		if (latestRevision != null) {
			incrementPercentage = latestRevision.getIncrementPercentage();
			nextRevisionDate = latestRevision.getNextRevisionDate();
		} else {
			JsonNode additionalDetails = allotment.getAdditionalDetails();
			if (additionalDetails != null) {
				JsonNode propDetails = additionalDetails.path("propertyDetails");
				JsonNode targetNode = propDetails.isArray() && propDetails.size() > 0 ? propDetails.get(0) : additionalDetails;
				
				if (targetNode.has("incrementPercentage")) {
					incrementPercentage = new java.math.BigDecimal(targetNode.path("incrementPercentage").asText());
				}
				if (targetNode.has("nextRevisionDate")) {
					nextRevisionDate = targetNode.path("nextRevisionDate").asLong();
				}
			}
		}

		if (incrementPercentage == null || incrementPercentage.compareTo(java.math.BigDecimal.ZERO) <= 0 || nextRevisionDate == null) {
			return;
		}

		long currentTime = System.currentTimeMillis();
		if (currentTime < nextRevisionDate) {
			return;
		}

		java.math.BigDecimal currentRent = latestRevision != null ? latestRevision.getRevisedRent() : baseRent;
		java.math.BigDecimal escalationAmount = currentRent.multiply(incrementPercentage).divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
		java.math.BigDecimal revisedRent = currentRent.add(escalationAmount);

		int incrementPeriodMonths = 12;
		JsonNode additionalDetails = allotment.getAdditionalDetails();
		if (additionalDetails != null) {
			JsonNode propDetails = additionalDetails.path("propertyDetails");
			JsonNode targetNode = propDetails.isArray() && propDetails.size() > 0 ? propDetails.get(0) : additionalDetails;
			if (targetNode.has("incrementPeriodMonths")) {
				incrementPeriodMonths = targetNode.path("incrementPeriodMonths").asInt();
			}
		}
		if (incrementPeriodMonths <= 0) {
			incrementPeriodMonths = 12;
		}

		long nextNextRevisionDate = java.time.Instant.ofEpochMilli(nextRevisionDate)
				.atZone(java.time.ZoneId.of(org.egov.rl.calculator.util.RLConstants.TIME_ZONE))
				.toLocalDate()
				.plusMonths(incrementPeriodMonths)
				.atStartOfDay(java.time.ZoneId.of(org.egov.rl.calculator.util.RLConstants.TIME_ZONE))
				.toInstant()
				.toEpochMilli();

		if (!CollectionUtils.isEmpty(revisions)) {
			for (RentRevision rev : revisions) {
				rev.setActive(false);
			}
		}

		RentRevision newRevision = RentRevision.builder()
				.id(java.util.UUID.randomUUID().toString())
				.allotmentId(allotment.getId())
				.revisedRent(revisedRent)
				.revisionDate(nextRevisionDate)
				.nextRevisionDate(nextNextRevisionDate)
				.incrementPercentage(incrementPercentage)
				.tenantId(tenantId)
				.active(true)
				.auditDetails(org.egov.rl.calculator.web.models.property.AuditDetails.builder()
						.createdBy("SYSTEM")
						.createdTime(currentTime)
						.lastModifiedBy("SYSTEM")
						.lastModifiedTime(currentTime)
						.build())
				.build();

		allotment.addRentRevisionsItem(newRevision);

		AllotmentRequest updateRequest = AllotmentRequest.builder()
				.requestInfo(requestInfo)
				.allotment(java.util.Arrays.asList(allotment))
				.build();

		log.info("Applying auto escalation for allotment " + allotment.getApplicationNumber() + ": " + currentRent + " -> " + revisedRent);
		producer.push(config.getUpdateAllotmentTopic(), updateRequest);
	}
}
