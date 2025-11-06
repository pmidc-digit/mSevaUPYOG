package org.egov.garbagecollection.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.ValidatorResult;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class MeterInfoValidator implements GcActionValidator {

	@Autowired
	private ObjectMapper mapper;

	@Override
	@SuppressWarnings("unchecked")
	public ValidatorResult validate(GarbageConnectionRequest garbageConnectionRequest, int reqType) {
		Map<String, String> errorMap = new HashMap<>();
		switch (reqType) {
		case GCConstants.MODIFY_CONNECTION:
			handleModifyConnectionRequest(garbageConnectionRequest, errorMap);
			break;
		case GCConstants.UPDATE_APPLICATION:
			handleUpdateApplicationRequest(garbageConnectionRequest, errorMap);
			break;
		case GCConstants.DISCONNECT_CONNECTION:
			handleDisconnectionApplicationRequest(garbageConnectionRequest, errorMap);
			break;
		default:
			break;
		}
		if (!errorMap.isEmpty())
			return new ValidatorResult(false, errorMap);
		return new ValidatorResult(true, errorMap);
	}

	private void handleDisconnectionApplicationRequest(GarbageConnectionRequest garbageConnectionRequest, Map<String, String> errorMap) {
		if (GCConstants.EXECUTE_DISCONNECTION
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (GCConstants.METERED_CONNECTION
					.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				validateMeteredConnectionRequst(garbageConnectionRequest, errorMap);
			}
		}
	}

	private void handleUpdateApplicationRequest(GarbageConnectionRequest garbageConnectionRequest,
			Map<String, String> errorMap) {
		if (GCConstants.ACTIVATE_CONNECTION_CONST
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (GCConstants.METERED_CONNECTION
					.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				validateMeteredConnectionRequst(garbageConnectionRequest, errorMap);
			}
		}
	}
	
	private void handleModifyConnectionRequest(GarbageConnectionRequest garbageConnectionRequest,
			Map<String, String> errorMap) {
		if (GCConstants.APPROVE_CONNECTION
				.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
			if (GCConstants.METERED_CONNECTION
					.equalsIgnoreCase(garbageConnectionRequest.getGarbageConnection().getConnectionType())) {
				validateMeteredConnectionRequst(garbageConnectionRequest, errorMap);
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	private void validateMeteredConnectionRequst(GarbageConnectionRequest garbageConnectionRequest,
			Map<String, String> errorMap) {

//		if (garbageConnectionRequest.getGarbageConnection().getMeterId() == null) {
//			errorMap.put("INVALID_METER_ID", "Meter Id cannot be empty");
//		}
//		if (garbageConnectionRequest.getGarbageConnection().getMeterInstallationDate() == null
//				|| garbageConnectionRequest.getGarbageConnection().getMeterInstallationDate() < 0
//				|| garbageConnectionRequest.getGarbageConnection().getMeterInstallationDate() == 0) {
//			errorMap.put("INVALID_METER_INSTALLATION_DATE",
//					"Meter Installation date cannot be null or negative");
//		}
		HashMap<String, Object> addDetail = mapper.convertValue(
				garbageConnectionRequest.getGarbageConnection().getAdditionalDetails(), HashMap.class);
		if (StringUtils.isEmpty(addDetail)
				|| addDetail.getOrDefault(GCConstants.INITIAL_METER_READING_CONST, null) == null) {
			errorMap.put("INVALID_INITIAL_METER_READING", "Initial meter reading can not be null");
		} else {
			BigDecimal initialMeterReading = BigDecimal.ZERO;
			initialMeterReading = new BigDecimal(
					String.valueOf(addDetail.get(GCConstants.INITIAL_METER_READING_CONST)));
			if (initialMeterReading.compareTo(BigDecimal.ZERO) == 0 || initialMeterReading.compareTo(BigDecimal.ZERO) == -1 ) {
				errorMap.put("INVALID_INITIAL_METER_READING", "Initial meter reading can not be zero or negative");
			}
		}
	}

}
