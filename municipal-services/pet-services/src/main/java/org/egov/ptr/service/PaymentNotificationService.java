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
import org.egov.ptr.util.NotificationUtil;
import org.egov.tracer.model.CustomException;
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
	private NotificationUtil util;

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



	/**
	 * Process the incoming record and topic from the payment notification consumer.
	 * Performs defensive null checks and validates the payment request before proceeding.
	 */
	public void process(PaymentRequest paymentRequest, String topic) throws JsonProcessingException {
		log.info("Receipt consumer class entry {}", paymentRequest);
		try {
//			PaymentRequest paymentRequest = mapper.convertValue(record, PaymentRequest.class);
			log.info("Payment request in pet method: {}", paymentRequest);

			// Defensive checks for null or empty payment data
			if (paymentRequest == null || paymentRequest.getPayment() == null ||
					paymentRequest.getPayment().getPaymentDetails() == null ||
					paymentRequest.getPayment().getPaymentDetails().isEmpty()) {
				log.error("Invalid payment data; missing payment details: {}", paymentRequest);
				return;
			}

			String businessService = paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService();

			if (PET_SERVICES.equals(businessService)) {
				String applicationNumber = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();

				updateWorkflowStatus(paymentRequest);
				updateApplicationStatusWithWorkflow(paymentRequest);
				
			} else {
				log.info("Ignoring payment with business service: {}", businessService);
			}
		} catch (IllegalArgumentException e) {
			log.error("Illegal argument exception occurred in pet process: {}", e.getMessage(), e);
		} catch (Exception e) {
			log.error("An unexpected exception occurred in pet process: {}", e.getMessage(), e);
		}
	}

	
	/**
	 * Updates the workflow status by initiating a workflow request.
	 */
	public void updateWorkflowStatus(PaymentRequest paymentRequest) {
		ProcessInstance processInstance = getProcessInstanceForPTR(paymentRequest);
		if (processInstance == null) {
			log.error("ProcessInstance is null, skipping workflow update");
			return;
		}
		log.info("Process instance of pet application {}", processInstance);
		Role role = Role.builder().code("SYSTEM_PAYMENT").tenantId(paymentRequest.getPayment().getTenantId()).build();
		paymentRequest.getRequestInfo().getUserInfo().getRoles().add(role);
		ProcessInstanceRequest workflowRequest = new ProcessInstanceRequest(paymentRequest.getRequestInfo(),
				Collections.singletonList(processInstance));
		callWorkFlow(workflowRequest);
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
		log.info("Workflow Request for pet service for final step {}", workflowReq);

		State state = null;
		try {
			StringBuilder url = new StringBuilder(configs.getWfHost().concat(configs.getWfTransitionPath()));
			log.info("URL for calling workflow service: {}", url);

			Object object = serviceRequestRepository.fetchResult(url, workflowReq);
			if (object!=null) {
				log.error("No response from workflow service for request: {}", workflowReq);
				return null;
			}

			ProcessInstanceResponse response = mapper.convertValue(object, ProcessInstanceResponse.class);
			if (response == null || response.getProcessInstances() == null || response.getProcessInstances().isEmpty()) {
				log.error("Empty response or process instances from workflow service");
				return null;
			}

			state = response.getProcessInstances().get(0).getState();
		} catch (Exception e) {
			log.error("Exception while calling workflow service: {}", e.getMessage(), e);
		}
		return state;
	}

	/**
	 * Updates application status with workflow
	 */
	public void updateApplicationStatusWithWorkflow(PaymentRequest paymentRequest) {
		try {
			String applicationNumber = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
			
			// Create PetRegistrationApplication object
			PetRegistrationApplication petApplication = PetRegistrationApplication.builder()
					.applicationNumber(applicationNumber)
					.status("APPROVED")
					.build();
			
			// Create PetRegistrationRequest
			PetRegistrationRequest petRequest = PetRegistrationRequest.builder()
					.requestInfo(paymentRequest.getRequestInfo())
					.petRegistrationApplications(Collections.singletonList(petApplication))
					.build();


			// Update application status
			updateApplicationStatus(petRequest);
			
			log.info("Application status updated to APPROVED for: " + applicationNumber);
			
		} catch (Exception e) {
			log.error("Failed to update application status: " + e.getMessage(), e);
		}
	}

	/**
	 * Updates application status in database
	 */
	private void updateApplicationStatus(PetRegistrationRequest petRequest) {
		try {
			String applicationNumber = petRequest.getPetRegistrationApplications().get(0).getApplicationNumber();
			log.info("Updating application synchronously for application no : {}", applicationNumber);

			if (applicationNumber == null) {
				throw new CustomException("INVALID_APPLICATION_CODE",
						"Application number not valid. Failed to update application status for : " + applicationNumber);
			}

			PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
					.applicationNumber(applicationNumber)
					.build();

			List<PetRegistrationApplication> applications = petRegistrationRepository.getApplications(criteria);

			if (applications == null || applications.isEmpty()) {
				throw new CustomException("INVALID_APPLICATION_CODE",
						"No application found for application number : " + applicationNumber);
			}

			PetRegistrationApplication application = applications.get(0);

			petRequest.setPetRegistrationApplications(applications);
			application.setStatus("APPROVED");

			// Update application status directly in database (skip enrichment service)
			updateApplicationInDatabase(application, petRequest.getRequestInfo());

			log.info("Application status updated in database for: {}", applicationNumber);

		} catch (Exception e) {
			log.error("Failed to update application in database: {}", e.getMessage(), e);
		}
	}

	/**
	 * Updates application status directly in database
	 */
	private void updateApplicationInDatabase(PetRegistrationApplication application, RequestInfo requestInfo) {
		try {
			// Update application status in database
			String updateQuery = "UPDATE eg_ptr_registration SET status = ?, lastmodifiedby = ?, lastmodifiedtime = ? WHERE applicationnumber = ?";
			
			// Get current timestamp
			long currentTime = System.currentTimeMillis();
			
			// Execute update query
			int rowsUpdated = petRegistrationRepository.getJdbcTemplate().update(updateQuery, 
				application.getStatus(),
				requestInfo.getUserInfo().getUuid(),
				currentTime,
				application.getApplicationNumber()
			);
			
			if (rowsUpdated > 0) {
				log.info("Application status updated in database for: {}", application.getApplicationNumber());
			} else {
				log.warn("No rows updated for application: {}", application.getApplicationNumber());
			}
			
		} catch (Exception e) {
			log.error("Failed to update application in database for: {}", application.getApplicationNumber(), e);
		}
	}

}
