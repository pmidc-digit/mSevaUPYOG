package org.egov.layout.workflow;

import org.egov.common.contract.request.RequestInfo;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;
import org.egov.layout.web.model.Layout;
import org.egov.layout.web.model.RequestInfoWrapper;
import org.egov.layout.web.model.workflow.BusinessService;
import org.egov.layout.web.model.workflow.BusinessServiceResponse;
import org.egov.layout.web.model.workflow.State;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WorkflowService {
	
	@Autowired
	private LAYOUTConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
	
	@Autowired
	private ObjectMapper mapper;
	
	public BusinessService getBusinessService(Layout noc, RequestInfo requestInfo, String bussinessServiceValue) {
		StringBuilder url = getSearchURLWithParams(bussinessServiceValue, noc.getTenantId());
		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
		Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);
		BusinessServiceResponse response = null;
		try {
			response = mapper.convertValue(result, BusinessServiceResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response");
		}
		return response.getBusinessServices().isEmpty() ? null : response.getBusinessServices().get(0);
	}
	
	private StringBuilder getSearchURLWithParams(String bussinessServiceValue, String tenantId) {
        StringBuilder url = new StringBuilder(config.getWfHost());
        url.append(config.getWfBusinessServiceSearchPath());
        url.append("?tenantId=");
        url.append(tenantId);
        url.append("&businessServices=");
        url.append(bussinessServiceValue);
        return url;
    }
	
	public State getCurrentState(String status, BusinessService businessService) {
		for (State state : businessService.getStates()) {
			if (state.getApplicationStatus() != null
					&& state.getApplicationStatus().equalsIgnoreCase(status.toString()))
				return state;
		}
		return null;
	}
	
	public Boolean isStateUpdatable(String status, BusinessService businessService) {
		for (State state : businessService.getStates()) {
			if (state.getApplicationStatus() != null
					&& state.getApplicationStatus().equalsIgnoreCase(status.toString()))
				return Boolean.TRUE;
		}
		return Boolean.FALSE;
	}
	
}
