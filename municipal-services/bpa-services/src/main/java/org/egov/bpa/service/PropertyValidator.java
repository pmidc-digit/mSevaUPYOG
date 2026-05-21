package org.egov.bpa.service;

import java.util.HashMap;
import java.util.Map;

import org.egov.bpa.web.model.BPARequest;
import org.egov.bpa.web.model.ValidatorResult;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PropertyValidator{

	
	public ValidatorResult validate(String propertyId, int reqType) {
		Map<String, String> errorMap = new HashMap<>();
		if(StringUtils.isEmpty(propertyId)) {
			errorMap.put("INVALID_PROPERTY_UNIQUE_ID", "Property Unique Id should not be empty");
		}
		if (!errorMap.isEmpty())
			return new ValidatorResult(false, errorMap);
		return new ValidatorResult(true, errorMap);
	}

}
