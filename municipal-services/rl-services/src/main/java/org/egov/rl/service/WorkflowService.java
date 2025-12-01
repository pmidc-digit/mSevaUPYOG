package org.egov.rl.service;

import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.enums.CreationReason;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.workflow.BusinessService;
import org.egov.rl.models.workflow.BusinessServiceResponse;
import org.egov.rl.models.workflow.ProcessInstanceRequest;
import org.egov.rl.models.workflow.ProcessInstanceResponse;
import org.egov.rl.models.workflow.State;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WorkflowService {

	@Autowired
	private RentLeaseConfiguration configs;

	@Autowired
	private ServiceRequestRepository restRepo;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PropertyUtil utils;

	@Autowired
	ServiceRequestRepository serviceRequestRepository;

	/**
	 * Method to integrate with workflow
	 *
	 * takes the trade-license request as parameter constructs the work-flow request
	 *
	 * and sets the resultant status from wf-response back to trade-license object
	 *
	 */
	public State callWorkFlow(ProcessInstanceRequest workflowReq) {

		ProcessInstanceResponse response = null;
		StringBuilder url = new StringBuilder(configs.getWfHost().concat(configs.getWfTransitionPath()));
		Optional<Object> optional = serviceRequestRepository.fetchResult(url, workflowReq);
		response = mapper.convertValue(optional.get(), ProcessInstanceResponse.class);
		return response.getProcessInstances().get(0).getState();
	}

	/**
	 * Get the workflow config for the given tenant
	 * 
	 * @param tenantId    The tenantId for which businessService is requested
	 * @param requestInfo The RequestInfo object of the request
	 * @return BusinessService for the the given tenantId
	 */
	public BusinessService getBusinessService(String tenantId, String businessService, RequestInfo requestInfo) {

		StringBuilder url = getSearchURLWithParams(tenantId, businessService);
		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
		Optional<Object> result = restRepo.fetchResult(url, requestInfoWrapper);
		BusinessServiceResponse response = null;
		try {
			response = mapper.convertValue(result.get(), BusinessServiceResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response of workflow business service search");
		}

		if (CollectionUtils.isEmpty(response.getBusinessServices()))
			throw new CustomException("BUSINESSSERVICE_NOT_FOUND",
					"The businessService " + businessService + " is not found");

		return response.getBusinessServices().get(0);
	}

	/**
	 * Creates url for search based on given tenantId
	 *
	 * @param tenantId The tenantId for which url is generated
	 * @return The search url
	 */
	private StringBuilder getSearchURLWithParams(String tenantId, String businessService) {

		StringBuilder url = new StringBuilder(configs.getWfHost());
		url.append(configs.getWfBusinessServiceSearchPath());
		url.append("?tenantId=");
		url.append(tenantId);
		url.append("&businessServices=");
		url.append(businessService);
		return url;
	}

	/**
	 * method to prepare process instance request and assign status back to property
	 * 
	 * @param request
	 */
//	public State updateWorkflow(AllotmentRequest allotmentRequest, CreationReason creationReasonForWorkflow) {
//
//		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
//		JsonNode jsonNode = allotmentDetails.getAdditionalDetails();
//
//		// Initialize the variable to hold the propertytobestatus value
//		String propertyToBeStatus = null;
//
//		// Check if jsonNode is not null and retrieve the value
//		if (jsonNode != null && jsonNode.has("propertytobestatus")) {
//			JsonNode propertyToBeStatusNode = jsonNode.get("propertytobestatus");
//			if (propertyToBeStatusNode != null && !propertyToBeStatusNode.isNull()) {
//				propertyToBeStatus = propertyToBeStatusNode.asText();
//			}
//		}
//		ProcessInstanceRequest workflowReq = utils.getWfForPropertyRegistry(allotmentRequest, creationReasonForWorkflow);
//		State state = callWorkFlow(workflowReq);
//
//		if (state.getApplicationStatus().equalsIgnoreCase(configs.getWfStatusActive())
//				&& allotmentDetails.getId() == null) {
//
//			String pId = utils.getIdList(allotmentRequest.getRequestInfo(), allotmentDetails.getTenantId(),
//					configs.getPropertyIdGenName(), configs.getPropertyIdGenFormat(), 1).get(0);
//			allotmentDetails.setId(pId);
//		}
//
//		if (allotmentDetails.getCreationReason().equals(CreationReason.STATUS)
//				&& allotmentRequest.getAllotment().getWorkflow().getAction().equalsIgnoreCase("APPROVE")) {
//
//			if (propertyToBeStatus.equalsIgnoreCase("INACTIVE")) {
//				allotmentRequest.getAllotment().setStatus(Status.INACTIVE);
//			} else if (propertyToBeStatus.equalsIgnoreCase("ACTIVE")) {
//				allotmentRequest.getAllotment().setStatus(Status.ACTIVE);
//			}
//			//request.getProperty().setCreationReason(CreationReason.UPDATE);
//			
//		}
//		else
//		  allotmentRequest.getAllotment().setStatus(Status.fromValue(state.getApplicationStatus()));
////		if (allotmentRequest.getAllotment().getCreationReason().equals(CreationReason.CREATE)
////				&&(allotmentRequest.getAllotment().getWorkflow().getAction().equalsIgnoreCase("APPROVE")|| 
////						allotmentRequest.getAllotment().getWorkflow().getAction().equalsIgnoreCase("REJECT"))
////				) {
////			allotmentRequest.getAllotment().setCreationReason(CreationReason.UPDATE);
////		}
//		
//		allotmentRequest.getAllotment().getWorkflow().setState(state);
//		return state;
//	}

	/**
	 * Returns boolean value to specifying if the state is updatable
	 * 
	 * @param stateCode       The stateCode of the license
	 * @param businessService The BusinessService of the application flow
	 * @return State object to be fetched
	 */
	public Boolean isStateUpdatable(String stateCode, BusinessService businessService) {
		for (State state : businessService.getStates()) {
			if (state.getState() != null && state.getState().equalsIgnoreCase(stateCode))
				return state.getIsStateUpdatable();
		}
		return null;
	}

	/**
	 * Creates url for searching processInstance
	 *
	 * @return The search url
	 */
	private StringBuilder getWorkflowSearchURLWithParams(String tenantId, String businessId) {

		StringBuilder url = new StringBuilder(configs.getWfHost());
		url.append(configs.getWfProcessInstanceSearchPath());
		url.append("?tenantId=");
		url.append(tenantId);
		url.append("&businessIds=");
		url.append(businessId);
		return url;
	}

	/**
	 * Fetches the workflow object for the given assessment
	 * 
	 * @return
	 */
	public State getCurrentState(RequestInfo requestInfo, String tenantId, String businessId) {

		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();

		StringBuilder url = getWorkflowSearchURLWithParams(tenantId, businessId);

		Optional<Object> res = restRepo.fetchResult(url, requestInfoWrapper);
		ProcessInstanceResponse response = null;

		try {
			response = mapper.convertValue(res.get(), ProcessInstanceResponse.class);
		} catch (Exception e) {
			throw new CustomException("PARSING_ERROR", "Failed to parse workflow search response");
		}

		if (response != null && !CollectionUtils.isEmpty(response.getProcessInstances())
				&& response.getProcessInstances().get(0) != null)
			return response.getProcessInstances().get(0).getState();

		return null;
	}

}
