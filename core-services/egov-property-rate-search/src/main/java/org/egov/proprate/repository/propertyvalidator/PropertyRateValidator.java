package org.egov.proprate.repository.propertyvalidator;

import org.egov.tracer.model.CustomException;
import org.egov.proprate.web.models.AddPropertyRate;
import org.egov.proprate.web.models.PropertyRateRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PropertyRateValidator {

    public void validateCreateRequest(PropertyRateRequest request) {
        validateCommonFields(request);
    }

    public void validateUpdateRequest(PropertyRateRequest request) {
        Map<String, String> errorMap = new HashMap<>();

        // 1. Basic field checks
        validateCommonFields(request);

        List<AddPropertyRate> rates = request.getPropertyRates();

        for (int i = 0; i < rates.size(); i++) {
            AddPropertyRate rate = rates.get(i);

            // 2. ID is mandatory for Update
            if (rate.getId() == null ) {
                errorMap.put("UPDATE_ERROR_ID_MISSING_" + i, "ID is mandatory for update at record " + (i + 1));
            }
			if (rate.getPropertyId() == null || rate.getPropertyId().trim().isEmpty()) {
				errorMap.put("INVALID_PROPERTY_ID_" + i, "Property ID is mandatory for record " + (i + 1));
			}
        }

        if (!errorMap.isEmpty()) {
            throw new CustomException(errorMap);
        }
        
        // 3. Note: In a production eGov app, you would also call repository.search() 
        // here to verify these IDs actually exist in the DB before proceeding.
    }

    private void validateCommonFields(PropertyRateRequest request) {
        Map<String, String> errorMap = new HashMap<>();

        if (CollectionUtils.isEmpty(request.getPropertyRates())) {
            throw new CustomException("INVALID_REQUEST", "Property Rates list cannot be empty");
        }

        List<AddPropertyRate> rates = request.getPropertyRates();

        for (int i = 0; i < rates.size(); i++) {
            AddPropertyRate rate = rates.get(i);
            
            if (rate.getTenantId() == null || rate.getTenantId().trim().isEmpty()) {
                errorMap.put("INVALID_TENANT_ID_" + i, "Tenant ID is mandatory for record " + (i + 1));
            }

            if (rate.getPropertyId() == null || rate.getPropertyId().trim().isEmpty()) {
                errorMap.put("INVALID_PROPERTY_ID_" + i, "Property ID is mandatory for record " + (i + 1));
            }

        }

        // Check for Duplicates within the request list
        long uniqueCount = rates.stream()
                .map(AddPropertyRate::getPropertyId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        if (uniqueCount != rates.size()) {
            errorMap.put("DUPLICATE_PROPERTIES", "Request contains duplicate Property IDs");
        }

        if (!errorMap.isEmpty()) {
            throw new CustomException(errorMap);
        }
    }
}