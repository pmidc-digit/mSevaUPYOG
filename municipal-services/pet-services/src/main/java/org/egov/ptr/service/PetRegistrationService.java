package org.egov.ptr.service;

import static org.egov.ptr.util.PTRConstants.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ptr.config.PetConfiguration;
import org.egov.ptr.models.PetApplicationSearchCriteria;
import org.egov.ptr.models.PetRegistrationApplication;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.producer.Producer;
import org.egov.ptr.repository.PetRegistrationRepository;
import org.egov.ptr.validator.PetApplicationValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PetRegistrationService {

	@Autowired
	private Producer producer;

	@Autowired
	private PetConfiguration config;

	@Autowired
	private EnrichmentService enrichmentService;

	@Autowired
	private PetApplicationValidator validator;

	@Autowired
	private UserService userService;

	@Autowired
	private WorkflowService wfService;

	@Autowired
	private DemandService demandService;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PetRegistrationRepository petRegistrationRepository;

	@Autowired
	private PTRBatchService ptrBatchService;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 */
	public List<PetRegistrationApplication> registerPtrRequest(PetRegistrationRequest petRegistrationRequest) {

		validator.validatePetApplication(petRegistrationRequest);
		enrichmentService.enrichPetApplication(petRegistrationRequest);

		wfService.updateWorkflowStatus(petRegistrationRequest);
		petRegistrationRequest.getPetRegistrationApplications().forEach(application -> {
			if (application.getApplicationType().equals(RENEW_PET_APPLICATION)) {
				producer.push(config.getRenewPtrTopic(), petRegistrationRequest);
			} else if (application.getApplicationType().equals(NEW_PET_APPLICATION)) {
				producer.push(config.getCreatePtrTopic(), petRegistrationRequest);
			}
		});

		return petRegistrationRequest.getPetRegistrationApplications();
	}

	public List<PetRegistrationApplication> searchPtrApplications(RequestInfo requestInfo,
			PetApplicationSearchCriteria petApplicationSearchCriteria) {

		List<PetRegistrationApplication> applications = petRegistrationRepository
				.getApplications(petApplicationSearchCriteria);

		if (CollectionUtils.isEmpty(applications))
			return new ArrayList<>();

		return applications;
	}

	public PetRegistrationApplication updatePtrApplication(PetRegistrationRequest petRegistrationRequest) {
		PetRegistrationApplication existingApplication = validator
				.validateApplicationExistence(petRegistrationRequest.getPetRegistrationApplications().get(0));
		existingApplication.setWorkflow(petRegistrationRequest.getPetRegistrationApplications().get(0).getWorkflow());
		petRegistrationRequest.setPetRegistrationApplications(Collections.singletonList(existingApplication));

		enrichmentService.enrichPetApplicationUponUpdate(petRegistrationRequest);

		if (petRegistrationRequest.getPetRegistrationApplications().get(0).getWorkflow().getAction()
				.equals(ACTION_APPROVE)) {
			demandService.createDemand(petRegistrationRequest);
		}
		wfService.updateWorkflowStatus(petRegistrationRequest);

		producer.push(config.getUpdatePtrTopic(), petRegistrationRequest);
		return petRegistrationRequest.getPetRegistrationApplications().get(0);
	}

	public void runJob(String servicename, String jobname, RequestInfo requestInfo) {
		if (servicename == null)
			servicename = PET_BUSINESSSERVICE;

		ptrBatchService.getPetApplicationsAndPerformAction(servicename, jobname, requestInfo);

	}

}
