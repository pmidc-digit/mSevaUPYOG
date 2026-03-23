package org.egov.garbagecollection.validator;

import java.util.*;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.web.models.Property;
import org.egov.garbagecollection.web.models.Unit;
import org.egov.garbagecollection.web.models.Status;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ValidateProperty {

	@Autowired
	private GcServicesUtil gcServicesUtil;

	@Autowired
	private MDMSValidator mdmsValidator;
	/**
	 * 
	 * @param property Property Objects
	 */
	public void validatePropertyFields(Property property, RequestInfo requestInfo) {
		if (StringUtils.isEmpty(property.getPropertyId())) {
			throw new CustomException("INVALID_PROPERTY", "GarbageConnection cannot be updated without property Id");
		}

		JSONObject mdmsResponse=getWnsPTworkflowConfig(requestInfo,property.getTenantId());
		List<Status> allowedPropertyStatus = new ArrayList<>();
		allowedPropertyStatus.add(Status.ACTIVE);
		allowedPropertyStatus.add(Status.PENDINGWS);  // allow property in PENDINGWS status valid for Water connection creation (these are created during WS migration for not existing properties)
		if (mdmsResponse.getBoolean("inWorkflowStatusAllowed"))
			allowedPropertyStatus.add(Status.INWORKFLOW);

		if (StringUtils.isEmpty(property.getStatus()) || !(allowedPropertyStatus.contains(property.getStatus()))) {
				throw new CustomException("INVALID_PROPERTY_STATUS", " Please enter a valid property ID");
			}
	}

	/**
	 * 
	 * @param garbageConnectionRequest WaterConnectionRequest
	 */
	public Property getOrValidateProperty(GarbageConnectionRequest garbageConnectionRequest) {
		Optional<Property> propertyList = gcServicesUtil.propertySearch(garbageConnectionRequest).stream().findFirst();
		if (!propertyList.isPresent()) {
			throw new CustomException("INVALID_PROPERTY",
					"Garbage connection cannot be enriched without PropertyId");
		}
		Property property = propertyList.get();
		if (StringUtils.isEmpty(property.getUsageCategory()) && !(garbageConnectionRequest.getRequestInfo().getUserInfo().getType().equalsIgnoreCase("SYSTEM"))) {
			throw new CustomException("INVALID_PROPERTY_USAGE_TYPE",
					"Garbage connection cannot be enriched without property usage type");
		}
		return property;
	}

	public JSONObject getWnsPTworkflowConfig(RequestInfo requestInfo,String tenantId){
		tenantId = tenantId.split("\\.")[0];
		List<String> propertyModuleMasters = new ArrayList<>(Arrays.asList("PTWorkflow"));
		Map<String, List<String>> codes = mdmsValidator.getAttributeValues(tenantId, GCConstants.PROPERTY_MASTER_MODULE, propertyModuleMasters, "$.*",
				GCConstants.PROPERTY_JSONPATH_ROOT,requestInfo);
		JSONObject obj = new JSONObject(codes);
		JSONArray configArray = obj.getJSONArray("PTWorkflow");
		JSONObject response = new JSONObject();
		for(int i=0;i<configArray.length();i++){
			if(configArray.getJSONObject(i).getBoolean("enable"))
				response=configArray.getJSONObject(i);
		}
		return response;
	}

	/**
	 * Validate that unitId is provided and exists in property
	 * 
	 * @param garbageConnectionRequest GC connection request
	 * @param property Property object
	 */
	public void validateUnitForConnection(GarbageConnectionRequest garbageConnectionRequest, Property property) {
		String unitId = garbageConnectionRequest.getGarbageConnection().getUnitId();
		
		// Validate unitId is provided
		if (StringUtils.isEmpty(unitId)) {
			throw new CustomException("UNIT_ID_REQUIRED", 
				"Unit ID is mandatory for garbage connection. Please select a unit from the property.");
		}
		
		// Validate property has units
		if (property.getUnits() == null || property.getUnits().isEmpty()) {
			throw new CustomException("NO_UNITS_IN_PROPERTY", 
				"Property " + property.getPropertyId() + " does not have any units defined.");
		}
		
		// Validate unitId exists in property
		boolean unitExists = property.getUnits().stream()
			.anyMatch(unit -> unit.getId().equals(unitId));
			
		if (!unitExists) {
			throw new CustomException("INVALID_UNIT_ID", 
				"Unit ID " + unitId + " does not exist in property " + property.getPropertyId());
		}
		
		// Validate unit has usageCategory
		Unit selectedUnit = property.getUnits().stream()
			.filter(unit -> unit.getId().equals(unitId))
			.findFirst()
			.orElse(null);
			
		if (selectedUnit != null && StringUtils.isEmpty(selectedUnit.getUsageCategory())) {
			throw new CustomException("UNIT_USAGE_CATEGORY_MISSING", 
				"Selected unit does not have a usage category defined. Please update the property.");
		}
	}
	
}
