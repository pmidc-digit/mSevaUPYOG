package org.egov.collection.config;

import java.util.*;

public class BusinessServiceToRoleMapping {

    private static final Map<String, List<String>> BUSINESS_SERVICE_ROLE_MAP = new HashMap<>();

    static {
    	BUSINESS_SERVICE_ROLE_MAP.put("PT", Arrays.asList("PT_APPROVER", "PTCEMP"));
        BUSINESS_SERVICE_ROLE_MAP.put("TL", Arrays.asList("TL_APPROVER", "TL_CEMP"));
        //BUSINESS_SERVICE_ROLE_MAP.put("echallan", Arrays.asList("CHALLAN_ADMIN"));
        BUSINESS_SERVICE_ROLE_MAP.put("BPA", Arrays.asList("BPA_APPROVER", "BPA_VERIFIER"));
    }

    public static List<String> getAuthorizedRoles(String businessService) {
        return BUSINESS_SERVICE_ROLE_MAP.getOrDefault(
                businessService, Collections.emptyList());
    }

    public static boolean isAuthorized(String businessService, String role) {
        return getAuthorizedRoles(businessService).contains(role);
    }
}