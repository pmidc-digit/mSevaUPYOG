package org.egov.ptr.service;

import java.util.Collections;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.ptr.config.PetConfiguration;
import org.egov.ptr.models.*;
import org.egov.ptr.models.collection.PaymentRequest;
import org.egov.ptr.models.workflow.ProcessInstanceResponse;
import org.egov.ptr.models.workflow.State;
import org.egov.ptr.repository.PetRegistrationRepository;
import org.egov.ptr.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PaymentNotificationService {

	private static final String PET_SERVICES = "pet-services";

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PetConfiguration configs;

	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsUrl;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private PetRegistrationRepository petRegistrationRepository;

	@Autowired
	private org.egov.ptr.util.PetUtil petUtil;



	/**
	 * Process the incoming record and topic from the payment notification consumer.
	 * Performs defensive null checks and validates the payment request before proceeding.
	 */
	public void process(PaymentRequest paymentRequest, String topic) throws JsonProcessingException {
		try {
			if (paymentRequest == null || paymentRequest.getPayment() == null || 
					paymentRequest.getPayment().getPaymentDetails() == null || 
					paymentRequest.getPayment().getPaymentDetails().isEmpty()) {
				log.error("Invalid payment request structure");
				return;
			}

			String businessService = paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService();

			if (PET_SERVICES.equals(businessService)) {
				processPaymentAndUpdateApplication(paymentRequest);
			} else {
				log.debug("Ignoring payment with business service: {} (expected: {})", businessService, PET_SERVICES);
			}
		} catch (Exception e) {
			log.error("Error processing payment notification: {}", e.getMessage(), e);
		}
	}

	/**
	 * Main method to process payment and update application status
	 * 1. Calls workflow with PAY action to transition to APPROVED
	 * 2. Fetches updated process instance to verify APPROVED status
	 * 3. Generates petRegistrationNumber if needed
	 * 4. Updates database with APPROVED status and petRegistrationNumber
	 */
	private void processPaymentAndUpdateApplication(PaymentRequest paymentRequest) {
		String applicationNumber = null;
		String tenantId = null;
		
		try {
			applicationNumber = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
			tenantId = paymentRequest.getPayment().getTenantId();
			
			log.info("Processing payment for application: {}", applicationNumber);
			
			State workflowState = transitionWorkflowToApproved(paymentRequest);
			if (workflowState == null) {
				log.error("Workflow transition failed for application: {}", applicationNumber);
				return;
			}
			
			ProcessInstance updatedProcessInstance = fetchProcessInstanceFromWorkflow(applicationNumber, tenantId, paymentRequest.getRequestInfo());
			if (updatedProcessInstance == null || updatedProcessInstance.getState() == null) {
				log.error("Could not fetch process instance for application: {}", applicationNumber);
				return;
			}
			
			State state = updatedProcessInstance.getState();
			String applicationStatus = state.getApplicationStatus() != null ? state.getApplicationStatus() : state.getState();
			
			if (!"APPROVED".equals(applicationStatus)) {
				log.warn("Application status is not APPROVED after payment: {} for application: {}", applicationStatus, applicationNumber);
				return;
			}
			
			PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
					.applicationNumber(Collections.singletonList(applicationNumber))
					.tenantId(tenantId)
					.build();

			List<PetRegistrationApplication> applications = petRegistrationRepository.getApplications(criteria);
			if (applications == null || applications.isEmpty()) {
				log.error("No application found for application number: {}", applicationNumber);
				return;
			}

			PetRegistrationApplication application = applications.get(0);
			generatePetRegistrationNumberAndUpdateDatabase(application, applicationStatus, paymentRequest.getRequestInfo());
			
		} catch (Exception e) {
			log.error("Error processing payment for application: {}, Error: {}", applicationNumber, e.getMessage(), e);
		}
	}
	
	/**
	 * Transitions workflow to APPROVED state by calling workflow service with PAY action
	 * Returns the state from workflow response
	 */
	private State transitionWorkflowToApproved(PaymentRequest paymentRequest) {
		try {
			ProcessInstance processInstance = getProcessInstanceForPTR(paymentRequest);
			if (processInstance == null) {
				log.error("ProcessInstance is null, cannot transition workflow");
				return null;
			}
			
			Role role = Role.builder().code("SYSTEM_PAYMENT").tenantId(paymentRequest.getPayment().getTenantId()).build();
			paymentRequest.getRequestInfo().getUserInfo().getRoles().add(role);
			
			ProcessInstanceRequest workflowRequest = new ProcessInstanceRequest(
					paymentRequest.getRequestInfo(),
					Collections.singletonList(processInstance));
			
			State state = callWorkFlow(workflowRequest);
			if (state == null) {
				log.error("Workflow transition returned null state");
			}
			
			return state;
			
		} catch (Exception e) {
			log.error("Error transitioning workflow to APPROVED: {}", e.getMessage(), e);
			return null;
		}
	}

	/**
	 * Constructs a ProcessInstance object from the payment request.
	 * Performs null checks to prevent NullPointerExceptions.
	 */
	private ProcessInstance getProcessInstanceForPTR(PaymentRequest paymentRequest) {
		if (paymentRequest == null || paymentRequest.getPayment() == null ||
				paymentRequest.getPayment().getPaymentDetails() == null ||
				paymentRequest.getPayment().getPaymentDetails().isEmpty() ||
				paymentRequest.getPayment().getPaymentDetails().get(0).getBill() == null) {
			log.error("Missing required data to build ProcessInstance from paymentRequest: {}", paymentRequest);
			return null;
		}

		String consumerCode = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
		String tenantId = paymentRequest.getPayment().getTenantId();

		if (consumerCode == null || consumerCode.isEmpty() || tenantId == null || tenantId.isEmpty()) {
			log.error("Consumer code or tenant id is missing or empty");
			return null;
		}

		ProcessInstance processInstance = new ProcessInstance();
		processInstance.setBusinessId(consumerCode);
		processInstance.setAction("PAY");
		processInstance.setModuleName("pet-service");
		processInstance.setTenantId(tenantId);
		processInstance.setBusinessService("ptr");
		processInstance.setDocuments(null);
		processInstance.setComment(null);
		processInstance.setAssignes(null);

		return processInstance;
	}

	/**
	 * Calls the workflow service with the given request and returns the state.
	 * Handles null/empty responses safely.
	 */
	public State callWorkFlow(ProcessInstanceRequest workflowReq) {
		State state = null;
		try {
			StringBuilder url = new StringBuilder(configs.getWfHost().concat(configs.getWfTransitionPath()));
			Object object = serviceRequestRepository.fetchResult(url, workflowReq);
			if (object == null) {
				log.error("No response from workflow service");
				return null;
			}

			ProcessInstanceResponse response = mapper.convertValue(object, ProcessInstanceResponse.class);
			if (response == null || response.getProcessInstances() == null || response.getProcessInstances().isEmpty()) {
				log.error("Empty response from workflow service");
				return null;
			}

			state = response.getProcessInstances().get(0).getState();
		} catch (Exception e) {
			log.error("Exception while calling workflow service: {}", e.getMessage(), e);
		}
		return state;
	}

	/**
	 * Generates petRegistrationNumber if needed and updates database with APPROVED status
	 */
	private void generatePetRegistrationNumberAndUpdateDatabase(PetRegistrationApplication application, String status, RequestInfo requestInfo) {
		try {
			String applicationNumber = application.getApplicationNumber();
			String petRegistrationNumber = application.getPetRegistrationNumber();
			
			if (petRegistrationNumber == null || petRegistrationNumber.isEmpty()) {
				if (application.getApplicationType() != null && "RENEWAPPLICATION".equals(application.getApplicationType())) {
					petRegistrationNumber = getPetRegistrationNumberFromPreviousApplication(application, requestInfo);
					if (petRegistrationNumber != null && !petRegistrationNumber.isEmpty()) {
						log.info("Reused petRegistrationNumber: {} from previous application for renewal: {}", 
								petRegistrationNumber, applicationNumber);
					}
				}
				
				if (petRegistrationNumber == null || petRegistrationNumber.isEmpty()) {
					List<String> regNumList = petUtil.getIdList(requestInfo, application.getTenantId(), 
							configs.getPetRegNumName(), configs.getPetRegNumFormat(), 1);
					
					if (regNumList != null && !regNumList.isEmpty()) {
						petRegistrationNumber = regNumList.get(0);
						log.info("Generated petRegistrationNumber: {} for application: {}", petRegistrationNumber, applicationNumber);
					} else {
						log.error("Failed to generate petRegistrationNumber for application: {}", applicationNumber);
					}
				}
			}
			
			updateDatabaseWithStatusAndPetRegNumber(application, status, petRegistrationNumber, requestInfo);
			
		} catch (Exception e) {
			log.error("Error generating petRegistrationNumber and updating database for application: {}, Error: {}", 
					application.getApplicationNumber(), e.getMessage(), e);
		}
	}
	
	/**
	 * Fetches the current process instance from workflow service
	 */
	private ProcessInstance fetchProcessInstanceFromWorkflow(String businessId, String tenantId, RequestInfo requestInfo) {
		try {
			StringBuilder url = new StringBuilder(configs.getWfHost());
			url.append(configs.getWfProcessInstanceSearchPath());
			url.append("?tenantId=").append(tenantId);
			url.append("&businessIds=").append(businessId);
			
			org.egov.ptr.web.contracts.RequestInfoWrapper requestInfoWrapper = 
					org.egov.ptr.web.contracts.RequestInfoWrapper.builder()
					.requestInfo(requestInfo)
					.build();
			
			Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);
			if (result == null) {
				log.error("No response from workflow service when fetching process instance");
				return null;
			}
			
			ProcessInstanceResponse response = mapper.convertValue(result, ProcessInstanceResponse.class);
			if (response == null || response.getProcessInstances() == null || response.getProcessInstances().isEmpty()) {
				log.error("Empty response from workflow service");
				return null;
			}
			
			org.egov.ptr.models.workflow.ProcessInstance wfProcessInstance = response.getProcessInstances().get(0);
			
			ProcessInstance processInstance = new ProcessInstance();
			processInstance.setBusinessId(wfProcessInstance.getBusinessId());
			processInstance.setTenantId(wfProcessInstance.getTenantId());
			processInstance.setBusinessService(wfProcessInstance.getBusinessService());
			processInstance.setState(wfProcessInstance.getState());
			
			return processInstance;
			
		} catch (Exception e) {
			log.error("Error fetching process instance from workflow service: {}", e.getMessage(), e);
			return null;
		}
	}


	/**
	 * Updates database with status and petRegistrationNumber
	 */
	private void updateDatabaseWithStatusAndPetRegNumber(PetRegistrationApplication application, String status, 
			String petRegistrationNumber, RequestInfo requestInfo) {
		try {
			String applicationNumber = application.getApplicationNumber();
			String updateQuery;
			Object[] params;
			long currentTime = System.currentTimeMillis();
			
			if (petRegistrationNumber != null && !petRegistrationNumber.isEmpty()) {
				updateQuery = "UPDATE eg_ptr_registration SET status = ?, petregistrationnumber = ?, lastmodifiedby = ?, lastmodifiedtime = ? WHERE applicationnumber = ?";
				params = new Object[]{
					status,
					petRegistrationNumber,
					requestInfo.getUserInfo().getUuid(),
					currentTime,
					applicationNumber
				};
			} else {
				updateQuery = "UPDATE eg_ptr_registration SET status = ?, lastmodifiedby = ?, lastmodifiedtime = ? WHERE applicationnumber = ?";
				params = new Object[]{
					status,
					requestInfo.getUserInfo().getUuid(),
					currentTime,
					applicationNumber
				};
			}
			
			int rowsUpdated = petRegistrationRepository.getJdbcTemplate().update(updateQuery, params);
			
			if (rowsUpdated > 0) {
				log.info("Updated application status to APPROVED - ApplicationNumber: {}, petRegistrationNumber: {}", 
						applicationNumber, petRegistrationNumber != null ? petRegistrationNumber : "null");
				application.setStatus(status);
				if (petRegistrationNumber != null && !petRegistrationNumber.isEmpty()) {
					application.setPetRegistrationNumber(petRegistrationNumber);
				}
			} else {
				log.warn("No rows updated for application: {}", applicationNumber);
			}
			
		} catch (Exception e) {
			log.error("Failed to update database for application: {}, Error: {}", 
					application.getApplicationNumber(), e.getMessage(), e);
		}
	}

	/**
	 * Gets petRegistrationNumber from previous application for renewal
	 */
	private String getPetRegistrationNumberFromPreviousApplication(PetRegistrationApplication application, RequestInfo requestInfo) {
		try {
			if (application.getPreviousApplicationNumber() != null && !application.getPreviousApplicationNumber().isEmpty()) {
				PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
						.applicationNumber(Collections.singletonList(application.getPreviousApplicationNumber()))
						.tenantId(application.getTenantId())
						.build();
				List<PetRegistrationApplication> previousApps = petRegistrationRepository.getApplications(criteria);
				if (previousApps != null && !previousApps.isEmpty()) {
					PetRegistrationApplication previousApp = previousApps.get(0);
					if (previousApp.getPetRegistrationNumber() != null && !previousApp.getPetRegistrationNumber().isEmpty()) {
						return previousApp.getPetRegistrationNumber();
					}
				}
			}
		} catch (Exception e) {
			log.error("Error fetching petRegistrationNumber from previous application: {}", e.getMessage(), e);
		}
		return null;
	}

}
