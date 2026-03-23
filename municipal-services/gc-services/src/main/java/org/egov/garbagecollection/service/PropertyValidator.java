package org.egov.garbagecollection.service;

import java.util.HashMap;
import java.util.Map;

import org.egov.garbagecollection.web.models.ValidatorResult;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class PropertyValidator implements GcActionValidator {

	@Override
	public ValidatorResult validate(GarbageConnectionRequest garbageConnectionRequest, int reqType) {
		Map<String, String> errorMap = new HashMap<>();
		if(StringUtils.isEmpty(garbageConnectionRequest.getGarbageConnection().getPropertyId())) {
			errorMap.put("INVALID_PROPERTY_UNIQUE_ID", "Property Unique Id should not be empty");
		}
		if (!errorMap.isEmpty())
			return new ValidatorResult(false, errorMap);
		return new ValidatorResult(true, errorMap);
	}

}
