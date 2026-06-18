package org.egov.garbagecollection.workflow;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.web.models.Property;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.workflow.ProcessInstance;
import org.egov.garbagecollection.web.models.workflow.ProcessInstanceRequest;
import org.egov.garbagecollection.web.models.workflow.ProcessInstanceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.PathNotFoundException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WorkflowIntegrator {

	private static final String MODULENAMEVALUE = "GC";

	@Autowired
	private GCConfiguration config;

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private RestTemplate rest;
	
	@Autowired
	private GcServicesUtil wsUtil;

	/**
	 * Method to integrate with workflow
	 *
	 * takes the water connection request as parameter constructs the work-flow
	 * request
	 *
	 * and sets the resultant status from wf-response back to water-connection
	 * request object
	 *
	 * @param garbageConnectionRequest
	 */
	public void callWorkFlow(GarbageConnectionRequest garbageConnectionRequest, Property property) {
		String wfBusinessServiceName = config.getBusinessServiceValue();

		if((garbageConnectionRequest.isDisconnectRequest() || garbageConnectionRequest.getGarbageConnection().getApplicationType().equalsIgnoreCase(GCConstants.DISCONNECT_GARBAGE_CONNECTION)) &&
				!(garbageConnectionRequest.isReconnectRequest() || garbageConnectionRequest.getGarbageConnection().getApplicationType().equalsIgnoreCase(GCConstants.GARBAGE_RECONNECTION))
				|| (garbageConnectionRequest.getGarbageConnection().getApplicationStatus().equalsIgnoreCase(GCConstants.PENDING_FOR_PAYMENT_STATUS_CODE)
				&& garbageConnectionRequest.getGarbageConnection().getApplicationNo().contains(GCConstants.APPLICATION_DISCONNECTION_CODE))) {
			wfBusinessServiceName = config.getDisconnectBusinessServiceName();
		} 
		else if((garbageConnectionRequest.isReconnectRequest() || garbageConnectionRequest.getGarbageConnection().getApplicationType().equalsIgnoreCase(GCConstants.GARBAGE_RECONNECTION))
				|| (garbageConnectionRequest.getGarbageConnection().getApplicationStatus().equalsIgnoreCase(GCConstants.DISCONNECTION_FINAL_STATE))) {
			wfBusinessServiceName = config.getWsWorkflowReconnectionName();
		}
		else if(wsUtil.isModifyConnectionRequest(garbageConnectionRequest)) {
			wfBusinessServiceName = config.getModifyGCBusinessServiceName();
		}
		
		ProcessInstance processInstance = ProcessInstance.builder()
				.businessId(garbageConnectionRequest.getGarbageConnection().getApplicationNo())
				.tenantId(garbageConnectionRequest.getGarbageConnection().getTenantId())
				.businessService(wfBusinessServiceName).moduleName(MODULENAMEVALUE)
				.action(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction()).build();
		if (!StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getProcessInstance())) {
			if (!CollectionUtils
					.isEmpty(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAssignes())) {
				processInstance
						.setAssignes(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAssignes());
			}
			if (!CollectionUtils
					.isEmpty(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getDocuments())) {
				processInstance
						.setDocuments(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getDocuments());
			}
			if (!StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getComment())) {
				processInstance
						.setComment(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getComment());
			}

		}
		List<ProcessInstance> processInstances = new ArrayList<>();
		processInstances.add(processInstance);
		ProcessInstanceResponse processInstanceResponse = null;
		log.info("PI :"+processInstances);
		try {
			processInstanceResponse = mapper.convertValue(
					rest.postForObject(config.getWfHost().concat(config.getWfTransitionPath()),
							ProcessInstanceRequest.builder().requestInfo(garbageConnectionRequest.getRequestInfo())
									.processInstances(processInstances).build(),
							Map.class),
					ProcessInstanceResponse.class);
			
		} catch (HttpClientErrorException e) {
			/*
			 * extracting message from client error exception
			 */
			DocumentContext responseContext = JsonPath.parse(e.getResponseBodyAsString());
			List<Object> errros = null;
			try {
				errros = responseContext.read("$.Errors");
			} catch (PathNotFoundException pnfe) {
				StringBuilder builder = new StringBuilder();
				builder.append(" Unable to read the json path in error object : ").append(pnfe.getMessage());
				log.error("EG_WS_WF_ERROR_KEY_NOT_FOUND", builder.toString());
				throw new CustomException("EG_WS_WF_ERROR_KEY_NOT_FOUND", builder.toString());
			}
			throw new CustomException("EG_WF_ERROR", errros.toString());
		} catch (Exception e) {
			throw new CustomException("EG_WF_ERROR",
					" Exception occured while integrating with workflow : " + e.getMessage());
		}

		/*
		 * on success result from work-flow read the data and set the status back to WS
		 * object
		 */
		processInstanceResponse.getProcessInstances().forEach(pInstance -> {
			if (garbageConnectionRequest.getGarbageConnection().getApplicationNo().equals(pInstance.getBusinessId())) {
				garbageConnectionRequest.getGarbageConnection()
						.setApplicationStatus(pInstance.getState().getApplicationStatus());
			}
		});
	}
}