package org.egov.proprate.repository.propertyvalidator;

import org.egov.tracer.model.CustomException;
import org.egov.proprate.web.models.AddPropertyRate;
import org.egov.proprate.web.models.PropertyRateRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils; // Spring's utility for Lists

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PropertyRateValidator {

    public void validateCreateRequest(PropertyRateRequest request) {
        
        Map<String, String> errorMap = new HashMap<>();

        // 1. Check if list is empty (Using Spring's CollectionUtils)
        if (CollectionUtils.isEmpty(request.getPropertyRates())) {
            throw new CustomException("INVALID_REQUEST", "Property Rates list cannot be empty");
        }

        List<AddPropertyRate> rates = request.getPropertyRates();

        for (int i = 0; i < rates.size(); i++) {
            AddPropertyRate rate = rates.get(i);
            
            // FIX: Using standard Java instead of StringUtils
            // Validate Tenant ID
            if (rate.getTenantId() == null || rate.getTenantId().trim().isEmpty()) {
                errorMap.put("INVALID_TENANT_ID_" + i, "Tenant ID is mandatory for record " + (i + 1));
            }

            // FIX: Using standard Java instead of StringUtils
            // Validate Property ID
            if (rate.getPropertyId() == null || rate.getPropertyId().trim().isEmpty()) {
                errorMap.put("INVALID_PROPERTY_ID_" + i, "Property ID is mandatory for record " + (i + 1));
            }

            // Validate Rate
            if (rate.getRate() == null || rate.getRate().compareTo(BigDecimal.ZERO) <= 0) {
                errorMap.put("INVALID_RATE_" + i, "Rate must be greater than 0 for record " + (i + 1));
            }
        }

        // Check for Duplicates
        long uniqueCount = rates.stream()
                .map(AddPropertyRate::getPropertyId)
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