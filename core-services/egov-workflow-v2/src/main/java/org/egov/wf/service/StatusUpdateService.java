package org.egov.wf.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;
import org.egov.wf.repository.ServiceRequestRepository;
import org.egov.wf.web.models.EmployeesResponse;
import org.egov.wf.web.models.EmployeesResponseTenant;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.egov.wf.web.models.ProcessStateAndAction;

import org.egov.wf.web.models.RequestInfoWrapperV2;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

@Service
@Slf4j
public class StatusUpdateService {

	private Producer producer;

	private WorkflowConfig config;
	@Autowired
	ServiceRequestRepository serviceRequestRepository;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	public StatusUpdateService(Producer producer, WorkflowConfig config) {
		this.producer = producer;
		this.config = config;
	}

	/**
	 * Updates the status and pushes the request on kafka to persist
	 * 
	 * @param requestInfo
	 * @param processStateAndActions
	 */
	public void updateStatus(RequestInfo requestInfo, List<ProcessStateAndAction> processStateAndActions) {

		for (ProcessStateAndAction processStateAndAction : processStateAndActions) {
			if (processStateAndAction.getProcessInstanceFromRequest().getState() != null) {
				String prevStatus = processStateAndAction.getProcessInstanceFromRequest().getState().getUuid();
				processStateAndAction.getProcessInstanceFromRequest().setPreviousStatus(prevStatus);
			}
			processStateAndAction.getProcessInstanceFromRequest().setState(processStateAndAction.getResultantState());
		}
		List<ProcessInstance> processInstances = new LinkedList<>();
		processStateAndActions.forEach(processStateAndAction -> {
			processInstances.add(processStateAndAction.getProcessInstanceFromRequest());
		});
		ProcessInstanceRequest processInstanceRequest = new ProcessInstanceRequest(requestInfo, processInstances);
		producer.push(config.getSaveTransitionTopic(), processInstanceRequest);
	}

	public void updateStatusV2(RequestInfo requestInfo, List<ProcessStateAndAction> processStateAndActions) {

		// String employeeTenant = "";
		List<ProcessInstance> processInstances = new LinkedList<>();
		processStateAndActions.forEach(processStateAndAction -> {

			if (processStateAndAction.getProcessInstanceFromRequest().getState() != null) {
				String prevStatus = processStateAndAction.getProcessInstanceFromRequest().getState().getUuid();
				processStateAndAction.getProcessInstanceFromRequest().setPreviousStatus(prevStatus);
			}
			processStateAndAction.getProcessInstanceFromRequest().setState(processStateAndAction.getResultantState());

			if (processStateAndAction.getProcessInstanceFromRequest().getAssignes() != null
					&& processStateAndAction.getProcessInstanceFromRequest().getAssignes().size() > 0)
				for (User user : processStateAndAction.getProcessInstanceFromRequest().getAssignes()) {

					String employeeTenant = getFirstAssigneeByRole(user.getUuid(), requestInfo);

					user.setTenantId(employeeTenant);
				}

			if (processStateAndAction.getProcessInstanceFromRequest().getAssignes() != null
					&& processStateAndAction.getProcessInstanceFromRequest().getAssignes().size() > 0) {
				processStateAndAction.getProcessInstanceFromRequest().setTenantId(
						processStateAndAction.getProcessInstanceFromRequest().getAssignes().get(0).getTenantId());
			}
			processInstances.add(processStateAndAction.getProcessInstanceFromRequest());

		});

		if (processStateAndActions.get(0).getProcessInstanceFromRequest().getAssignes() != null
				&& processStateAndActions.get(0).getProcessInstanceFromRequest().getAssignes().size() > 0) {
			
			String tempAction = processInstances.get(0).getPossibleActions();

			processInstances.get(0).setPossibleActions("MOALL");
			ProcessInstanceRequest processInstanceRequest = new ProcessInstanceRequest(requestInfo, processInstances);
			producer.push(config.getMoveAllTopic(), processInstanceRequest);
			processInstances.get(0).setPossibleActions(tempAction);

		}

		if (processInstances.get(0).getPossibleActions().equals(org.egov.wf.util.WorkflowConstants.ASSIGN_AND_MOVE_ALL)) {
			ProcessInstanceRequest processInstanceRequest = new ProcessInstanceRequest(requestInfo, processInstances);
			producer.push(config.getAssigneMoveOnlyTopic(), processInstanceRequest);
		} else if (processInstances.get(0).getPossibleActions().equals(org.egov.wf.util.WorkflowConstants.MOVE_ONLY)) {
			ProcessInstanceRequest processInstanceRequest = new ProcessInstanceRequest(requestInfo, processInstances);
			producer.push(config.getMoveOnlyTopic(), processInstanceRequest);
		} else if (processInstances.get(0).getPossibleActions().equals(org.egov.wf.util.WorkflowConstants.ASSIGN_ONLY)) {
			ProcessInstanceRequest processInstanceRequest = new ProcessInstanceRequest(requestInfo, processInstances);
			producer.push(config.getSaveTransitionTopic(), processInstanceRequest);
		}
	}

	public String getFirstAssigneeByRole(String uuid, RequestInfo requestInfo) {

		StringBuilder uri = new StringBuilder();
		uri.append(config.getHrmsHost());
		uri.append(config.getHrmsPath());
		uri.append("?uuids=" + uuid);

		RequestInfoWrapperV2 requestInfoWrapper = new RequestInfoWrapperV2();
		requestInfoWrapper.setRequestInfo(requestInfo);
		Object fetchResult = serviceRequestRepository.fetchResult(uri, requestInfoWrapper);
		log.info("fecth result" + fetchResult);
		EmployeesResponseTenant employeeResponse = null;
		employeeResponse = mapper.convertValue(fetchResult, EmployeesResponseTenant.class);

		String tenant = employeeResponse.getEmployee().get(0).getTenantId();

		return tenant;
	}
}
