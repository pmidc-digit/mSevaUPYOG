package org.egov.garbagecollection.service;


import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.RoadCuttingInfo;
import org.egov.garbagecollection.web.models.ValidatorResult;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

@Component
public class GcFieldValidator implements GcActionValidator {

	@Override
	public ValidatorResult validate(GarbageConnectionRequest garbageConnectionRequest, int reqType) {
		Map<String, String> errorMap = new HashMap<>();
		if (reqType == GCConstants.UPDATE_APPLICATION) {
			handleUpdateApplicationRequest(garbageConnectionRequest, errorMap);
		}
		if(reqType == GCConstants.MODIFY_CONNECTION){
			handleModifyConnectionRequest(garbageConnectionRequest, errorMap);
		}
		if(reqType == GCConstants.DISCONNECT_CONNECTION){
			handleDisconnectionRequest(garbageConnectionRequest, errorMap);
		}
		if (!errorMap.isEmpty())
			return new ValidatorResult(false, errorMap);
		return new ValidatorResult(true, errorMap);
	}

	private void handleDisconnectionRequest(GarbageConnectionRequest garbageConnectionRequest, Map<String, String> errorMap) {
		if (GCConstants.EXECUTE_DISCONNECTION
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				errorMap.put("INVALID_GARBAGE_CONNECTION_TYPE", "Connection type should not be empty");
			}
//			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection())) {
//				errorMap.put("INVALID_WATER_SOURCE", "WaterConnection cannot be created  without water source");
//			}
			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate()) ||
					garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate().equals(GCConstants.INVALID_CONEECTION_EXECUTION_DATE)) {
				errorMap.put("INVALID_CONNECTION_EXECUTION_DATE", "Connection execution date should not be empty");
			}
		}
	}

	private void handleUpdateApplicationRequest(GarbageConnectionRequest garbageConnectionRequest,
			Map<String, String> errorMap) {
		String valueOfConnectionCategory = null;

		Object additionalDetails = garbageConnectionRequest.getGarbageConnection().getAdditionalDetails();
		if (additionalDetails != null) {
			String jsonString = additionalDetails.toString().replaceAll("[{}]", "");
			String[] keyValuePairs = jsonString.split(", ");

			for (String pair : keyValuePairs) {
				String[] keyValue = pair.split("=");
				if (keyValue.length == 2 && "connectionCategory".equals(keyValue[0])) {
					valueOfConnectionCategory = keyValue[1].replaceAll("\\s", "");
					break;
				}
			}
		}

		boolean isRegularizedOrLegacy = valueOfConnectionCategory != null
				&& (valueOfConnectionCategory.equalsIgnoreCase("REGULARIZED")
						|| valueOfConnectionCategory.equalsIgnoreCase("LEGACY"));

		if (GCConstants.ACTIVATE_CONNECTION_CONST
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {

			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				errorMap.put("INVALID_WATER_CONNECTION_TYPE", "Connection type should not be empty");
			}

			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getWaterSource())) {
				errorMap.put("INVALID_WATER_SOURCE", "WaterConnection cannot be created  without water source");
			}

			if (garbageConnectionRequest.getGarbageConnection().getRoadCuttingInfo() == null && !isRegularizedOrLegacy) {
				errorMap.put("INVALID_ROAD_INFO", "Road Cutting Information should not be empty");
			}

			if (garbageConnectionRequest.getGarbageConnection().getRoadCuttingInfo() != null && !isRegularizedOrLegacy) {
				for (RoadCuttingInfo roadCuttingInfo : garbageConnectionRequest.getGarbageConnection()
						.getRoadCuttingInfo()) {
					if (StringUtils.isEmpty(roadCuttingInfo.getRoadType())) {
						errorMap.put("INVALID_ROAD_TYPE", "Road type should not be empty");
					}
				}
			}

			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate())
					|| garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate()
							.equals(GCConstants.INVALID_CONEECTION_EXECUTION_DATE)) {
				errorMap.put("INVALID_CONNECTION_EXECUTION_DATE", "Connection execution date should not be empty");
			}
		}

		if (GCConstants.APPROVE_CONNECTION_CONST
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {

			if (garbageConnectionRequest.getGarbageConnection().getRoadCuttingInfo() == null && !isRegularizedOrLegacy) {
				errorMap.put("INVALID_ROAD_INFO", "Road Cutting Information should not be empty");
			}

			if (garbageConnectionRequest.getGarbageConnection().getRoadCuttingInfo() != null && !isRegularizedOrLegacy) {
				for (RoadCuttingInfo roadCuttingInfo : garbageConnectionRequest.getGarbageConnection()
						.getRoadCuttingInfo()) {
					if (StringUtils.isEmpty(roadCuttingInfo.getRoadType())) {
						errorMap.put("INVALID_ROAD_TYPE", "Road type should not be empty");
					}
					if (roadCuttingInfo.getRoadCuttingArea() == null) {
						errorMap.put("INVALID_ROAD_CUTTING_AREA", "Road cutting area should not be empty");
					}
				}
			}
		}
	}

	private void handleModifyConnectionRequest(GarbageConnectionRequest garbageConnectionRequest, Map<String, String> errorMap){
		if (GCConstants.APPROVE_CONNECTION
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())
				|| GCConstants.ACTION_INITIATE
				.equals(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				errorMap.put("INVALID_WATER_CONNECTION_TYPE", "Connection type should not be empty");
			}
//			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getWaterSource())) {
//				errorMap.put("INVALID_WATER_SOURCE", "WaterConnection cannot be created  without water source");
//			}
			if (StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate()) ||
					garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate().equals(GCConstants.INVALID_CONEECTION_EXECUTION_DATE)) {
				errorMap.put("INVALID_CONNECTION_EXECUTION_DATE", "Connection execution date should not be empty");
			}
		}
		if (GCConstants.SUBMIT_APPLICATION_CONST
				.equals(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())
				|| GCConstants.APPROVE_CONNECTION.equalsIgnoreCase(
				garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())
				|| GCConstants.ACTION_INITIATE
				.equals(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (garbageConnectionRequest.getGarbageConnection().getDateEffectiveFrom() == null
					|| garbageConnectionRequest.getGarbageConnection().getDateEffectiveFrom() < 0
					|| garbageConnectionRequest.getGarbageConnection().getDateEffectiveFrom() == 0) {
				errorMap.put("INVALID_DATE_EFFECTIVE_FROM", "Date effective from cannot be null or negative");
			}
			if (garbageConnectionRequest.getGarbageConnection().getDateEffectiveFrom() != null) {
				//if (System.currentTimeMillis() > garbageConnectionRequest.getGarbageConnection().getDateEffectiveFrom()) {
				//	errorMap.put("DATE_EFFECTIVE_FROM_IN_PAST", "Date effective from cannot be past");
				//}
				if ((garbageConnectionRequest.getGarbageConnection().getConnectionExecutionDate() != null)
						&& (garbageConnectionRequest.getGarbageConnection()
						.getConnectionExecutionDate() > garbageConnectionRequest.getGarbageConnection()
						.getDateEffectiveFrom())) {

					errorMap.put("DATE_EFFECTIVE_FROM_LESS_THAN_EXCECUTION_DATE",
							"Date effective from cannot be before connection execution date");
				}
				if ((garbageConnectionRequest.getGarbageConnection().getMeterInstallationDate() != null)
						&& (garbageConnectionRequest.getGarbageConnection()
						.getMeterInstallationDate() > garbageConnectionRequest.getGarbageConnection()
						.getDateEffectiveFrom())) {
					errorMap.put("DATE_EFFECTIVE_FROM_LESS_THAN_METER_INSTALLATION_DATE",
							"Date effective from cannot be before meter installation date");
				}

			}
		}
	}
}
