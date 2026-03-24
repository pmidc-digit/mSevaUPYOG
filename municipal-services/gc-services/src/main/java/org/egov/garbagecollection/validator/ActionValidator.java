package org.egov.garbagecollection.validator;


import java.util.HashMap;
import java.util.Map;

import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.workflow.BusinessService;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.workflow.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
public class ActionValidator {
	
	@Autowired
	private WorkflowService workflowService;

	/**
	 * Validate update request
	 * 
	 * @param request Water Connection Request
	 * @param businessService BusinessService
	 */
	public void validateUpdateRequest(GarbageConnectionRequest request, BusinessService businessService, String applicationStatus) {
		validateDocumentsForUpdate(request);
		validateIds(request, businessService, applicationStatus);
	}

	/**
	 * Validate documents for water connection
	 * 
	 * @param request water connection request
	 */
	private void validateDocumentsForUpdate(GarbageConnectionRequest request) {
		if (request.getGarbageConnection().getProcessInstance().getAction().equalsIgnoreCase(GCConstants.ACTION_INITIATE)
				&& request.getGarbageConnection().getDocuments() != null) {
			throw new CustomException("INVALID_STATUS",
					"Status cannot be INITIATE when application document are provided");
		}
	}
	
	/**
	 * Validate Id's if update is not in update-able state
	 * 
	 * @param request GarbageConnectionRequest
	 * @param businessService BusinessService
	 */
	private void validateIds(GarbageConnectionRequest request, BusinessService businessService, String applicationStatus) {
		GarbageConnection connection = request.getGarbageConnection();
		Map<String, String> errorMap = new HashMap<>();
		if (!workflowService.isStateUpdatable(applicationStatus, businessService)) {
			if (connection.getId() == null)
				errorMap.put("INVALID_UPDATE", "Id of garbageConnection cannot be null");
			if (!CollectionUtils.isEmpty(connection.getDocuments())) {
				connection.getDocuments().forEach(document -> {
					if (document.getId() == null)
						errorMap.put("INVALID_UPDATE", "Id of document cannot be null");
				});
			}
		}
		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);
	}
}
