package org.egov.rl.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
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
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.models.user.User;
import org.egov.rl.models.user.UserDetailResponse;
import org.egov.rl.producer.PropertyProducer;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.util.RLConstants;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.validator.SchedullerValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

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
	org.egov.rl.repository.SchedulerRepository schedulerRepository;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public void sendNotificationRequest(AllotmentRequest allotmentRequest,boolean isInsalizationApplication) {
		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
		JsonNode additionalDetails = allotmentDetails.getAdditionalDetails().get(0);
		createScheduller(SchedullerRequest.builder()
				.requestInfo(allotmentRequest.getRequestInfo())
				.scheduller(Arrays.asList(NotificationSchedule.builder()
						.allotmentId(allotmentDetails.getId())
						.status(1)
						.businessServices(RLConstants.RL_SERVICE_NAME)
						.lastNotificationStatus("sent")
						.applicationNumber(allotmentDetails.getApplicationNumber())
						.tenantId(allotmentDetails.getTenantId())
						.schedullerType(additionalDetails.path("feesPeriodCycle").asText())
						.build())).build(),isInsalizationApplication);
		
		notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(allotmentDetails.getId()));		
	}
	
	public List<NotificationSchedule> createScheduller(SchedullerRequest schedullerRequest,boolean isInsalizationApplication) {
		schedullerValidator.validateCreateSchedullerRequest(schedullerRequest);
		senrichmentService.enrichCreateSchedullerRequest(schedullerRequest,isInsalizationApplication);
		producer.push(config.getSaveSchedullerTopic(), schedullerRequest);
		return schedullerRequest.getScheduller();	
	}
	
	public List<NotificationSchedule> updateScheduller(SchedullerRequest schedullerRequest) {
		schedullerValidator.validateCreateSchedullerRequest(schedullerRequest);
		senrichmentService.enrichCreateSchedullerRequest(schedullerRequest,false);
		producer.push(config.getUpdateSchedullerTopic(), schedullerRequest);
		return schedullerRequest.getScheduller();	
	}
	
	public void scheduller() {
		schedulerRepository.getNotifications().stream().forEach(nt->{
			if(Optional.of(nt.getDemandId()).isPresent()&&nt.isIspayement_reminder()){
			    LocalDateTime lastNotificationDate=LocalDateTime.now();
				notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(nt.getAllotmentId()));
				nt.setLastNotificationDate(lastNotificationDate);
				nt.setLastNotificationStatus("Noitification has been sent sucessfully");
				nt.setNotificationCountForCurrentCycle(nt.getNotificationCountForCurrentCycle()+1);
				producer.push(config.getUpdateSchedullerTopic(), SchedullerRequest.builder().scheduller(Arrays.asList(nt)).build());
			}else {
				Set<String> allomentId=new HashSet<>();
				allomentId.add(nt.getAllotmentId());
				AllotmentCriteria allotmentCriteria=AllotmentCriteria
						.builder()
						.isReportSearch(false)
						.tenantId(nt.getTenantId())
						.allotmentIds(allomentId)
						.build();
				
			AllotmentDetails allotmentDetails =	allotmentRepository.getAllotmentByIds(allotmentCriteria).get(0);
			
			LocalDateTime lastNotificationDate=LocalDateTime.now();
			notificationService.sendMessage(allotmentRepository.getOwnerInfoListByAllotmentId(nt.getAllotmentId()));
			nt.setLastNotificationDate(lastNotificationDate);
			nt.setNotificationCountForCurrentCycle(nt.getNotificationCountForCurrentCycle()+1);
			producer.push(config.getUpdateSchedullerTopic(), SchedullerRequest.builder().scheduller(Arrays.asList(nt)).build());			
			}
		});
	}

}
