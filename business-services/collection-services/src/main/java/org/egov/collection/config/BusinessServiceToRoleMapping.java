package org.egov.collection.config;

import java.util.*;

public class BusinessServiceToRoleMapping {

    private static final Map<String, List<String>> BUSINESS_SERVICE_ROLE_MAP = new HashMap<>();

    static {
    	BUSINESS_SERVICE_ROLE_MAP.put(CollectionServiceConstants.PROPERTY_SERVICE, Arrays.asList(CollectionServiceConstants.PROPERTY_SERVICE_COUNTER_EMPLOYEE));
        BUSINESS_SERVICE_ROLE_MAP.put(CollectionServiceConstants.TL_SERVICE, Arrays.asList(CollectionServiceConstants.TL_SERVICE_SERVICE_COUNTER_EMPLOYEE));
        BUSINESS_SERVICE_ROLE_MAP.put(CollectionServiceConstants.ECHALLAN, Arrays.asList(CollectionServiceConstants.ECHALLAN_ADMIN));
        BUSINESS_SERVICE_ROLE_MAP.put(CollectionServiceConstants.WATER, Arrays.asList(CollectionServiceConstants.WATER_COUNTER_EMPLOYEE));
        BUSINESS_SERVICE_ROLE_MAP.put(CollectionServiceConstants.SEWERAGE, Arrays.asList(CollectionServiceConstants.SEWERAGE_COUNTER_EMPLOYEE));
    }

    public static List<String> getAuthorizedRoles(String businessService) {
        return BUSINESS_SERVICE_ROLE_MAP.getOrDefault(
                businessService, Collections.emptyList());
    }

    public static boolean isAuthorized(String businessService, String role) {
        return getAuthorizedRoles(businessService).contains(role);
    }
}