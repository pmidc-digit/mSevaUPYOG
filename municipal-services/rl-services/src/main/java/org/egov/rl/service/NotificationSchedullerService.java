package org.egov.rl.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.catalina.mapper.Mapper;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.Demand;
import org.egov.rl.models.NotificationSchedule;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.PropertyReportSearchRequest;
import org.egov.rl.models.RLProperty;
import org.egov.rl.models.SchedullerRequest;
import org.egov.rl.models.SearchProperty;
import org.egov.rl.models.enums.SchedullerType;
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.models.user.User;
import org.egov.rl.models.user.UserDetailResponse;
import org.egov.rl.models.workflow.Workflow;
import org.egov.rl.producer.PropertyProducer;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.util.RLConstants;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.validator.SchedullerValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NotificationSchedullerService {

	@Autowired
	private PropertyProducer producer;

	@Autowired
	private RentLeaseConfiguration config;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private DemandService demandService;

	@Autowired
	BoundaryService boundaryService;

	@Autowired
	SchedullerValidator schedullerValidator;

	@Autowired
	SchedullerEnrichmentService senrichmentService;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private AllotmentRepository allotmentRepository;

	@Autowired
	private AllotmentWorkflowService allotmentWorkflowService;

	@Autowired
	org.egov.rl.repository.SchedulerRepository schedulerRepository;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public void sendNotificationRequest(AllotmentRequest allotmentRequest, boolean isInsalizationApplication) {
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		JsonNode additionalDetails = allotmentDetails.getAdditionalDetails().get(0);
		createScheduller(
				SchedullerRequest.builder().requestInfo(allotmentRequest.getRequestInfo())
						.scheduller(Arrays.asList(NotificationSchedule.builder().allotmentId(allotmentDetails.getId())
								.status(1).businessServices(RLConstants.RL_SERVICE_NAME).lastNotificationStatus("sent")
								.applicationNumber(allotmentDetails.getApplicationNumber())
								.tenantId(allotmentDetails.getTenantId())
								.schedullerType(additionalDetails.path("feesPeriodCycle").asText()).build()))
						.build(),
				isInsalizationApplication);

		notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(allotmentDetails.getId()));
	}

	public List<NotificationSchedule> createScheduller(SchedullerRequest schedullerRequest,
			boolean isInsalizationApplication) {
		schedullerValidator.validateCreateSchedullerRequest(schedullerRequest);
		senrichmentService.enrichCreateSchedullerRequest(schedullerRequest, isInsalizationApplication);
		producer.push(config.getSaveSchedullerTopic(), schedullerRequest);
		return schedullerRequest.getScheduller();
	}

	public List<NotificationSchedule> updateScheduller(SchedullerRequest schedullerRequest) {
		schedullerValidator.validateCreateSchedullerRequest(schedullerRequest);
		senrichmentService.enrichCreateSchedullerRequest(schedullerRequest, false);
		producer.push(config.getUpdateSchedullerTopic(), schedullerRequest);
		return schedullerRequest.getScheduller();
	}

	public void scheduller() {
		LocalDateTime currentDate = LocalDateTime.now();

		schedulerRepository.getNotifications().stream().forEach(nt -> {

			LocalDateTime nextCycleDate = nt.getNextCycleDate();
			Duration duration = Duration.between(currentDate, nextCycleDate);
			long days = duration.toDays();

			if (Optional.of(nt.getDemandId()).isPresent() && nt.isPayementReminder()
					&& nt.getNotificationCountForCurrentCycle() <= nt.getNoOfNotificationHavetoSend()) {
				notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(nt.getAllotmentId()));
				nt.setLastNotificationDate(currentDate);
				nt.setLastNotificationStatus("Noitification has been sent sucessfully");
				nt.setNotificationCountForCurrentCycle(nt.getNotificationCountForCurrentCycle() + 1);
				producer.push(config.getUpdateSchedullerTopic(),
						SchedullerRequest.builder().scheduller(Arrays.asList(nt)).build());
			} else if (0 <= days && days <= 7) {
				Set<String> allomentId = new HashSet<>();
				allomentId.add(nt.getAllotmentId());
				AllotmentCriteria allotmentCriteria = AllotmentCriteria.builder().isReportSearch(false)
						.tenantId(nt.getTenantId()).allotmentIds(allomentId).build();
				RequestInfo requestInfo = getOAuthToken();
				AllotmentDetails allotmentDetails = allotmentRepository.getAllotmentByIds(allotmentCriteria).get(0);
				allotmentDetails.setWorkflow(
						Workflow.builder().action(RLConstants.APPROVED_RL_APPLICATION).comments("Payment pending")
								.documents(null).status(RLConstants.APPROVED_RL_APPLICATION).build());
				AllotmentRequest allotmentRequest = AllotmentRequest.builder().requestInfo(requestInfo)
						.allotment(allotmentDetails).build();
				String demandId = demandService.createDemand(false, allotmentRequest).get(0).getId();

				LocalDateTime lastNotificationDate = LocalDateTime.now();
				notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(nt.getAllotmentId()));
				int month=Integer.valueOf(SchedullerType.fromValue(nt.getSchedullerType()));
			    LocalDateTime nexCycleDate=nt.getNextCycleDate().plusMonths(month);
			    LocalDateTime lastPaymentDate = nexCycleDate.plusWeeks(1);

				nt.setLastNotificationDate(lastNotificationDate);
				nt.setNotificationCountForCurrentCycle(nt.getNotificationCountForCurrentCycle() + 1);
				nt.setDemandId(demandId);
				nt.setPayementReminder(true);
				nt.setNextCycleDate(nexCycleDate);
				nt.setLastPaymentDate(lastPaymentDate);
				producer.push(config.getUpdateSchedullerTopic(),
						SchedullerRequest.builder().scheduller(Arrays.asList(nt)).build());
			}
		});
	}

	public RequestInfo getOAuthToken() {

		String url = "https://mseva-dev.lgpunjab.gov.in/user/oauth/token";

		// -------- BASIC AUTH (from Postman Authorization tab) --------
//    String clientId = "egov-user";       // ✅ replace if different
//    String clientSecret = "egov-secret";
//
//    String auth = clientId + ":" + clientSecret;
//    String base64Auth = Base64.getEncoder()
//            .encodeToString(auth.getBytes(StandardCharsets.UTF_8));

		// -------- Headers --------
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		headers.add("Accept", "application/json, text/plain, */*");
		headers.add("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8");
		headers.add("Authorization", "Basic " + "ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0");
		headers.add("Origin", "https://sdc-uat.lgpunjab.gov.in");
		headers.add("Referer", "https://sdc-uat.lgpunjab.gov.in/digit-ui/");
		headers.add("Priority", "u=1, i");

		// -------- BODY (x-www-form-urlencoded) --------
		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("username", "ramesh123");
		body.add("password", "eGov@123");
		body.add("tenantId", "pb.testing");
		body.add("userType", "employee");
		body.add("grant_type", "password");

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		RestTemplate restTemplate = new RestTemplate();

		return restTemplate.postForEntity(url, request, RequestInfo.class).getBody();
	}

}
