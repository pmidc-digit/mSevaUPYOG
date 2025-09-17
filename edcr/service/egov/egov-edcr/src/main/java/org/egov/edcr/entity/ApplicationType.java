package org.egov.edcr.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ApplicationType {

    PERMIT("Permit"), OCCUPANCY_CERTIFICATE("Occupancy certificate") , BUILDING_PLAN_SCRUTINY("Building Plan Scrutiny");

    @JsonValue
    private final String applicationTypeVal;

    ApplicationType(String aTypeVal) {
        this.applicationTypeVal = aTypeVal;
    }

    public String getApplicationType() {
        return applicationTypeVal;
    }

    public String getApplicationTypeVal() {
        return applicationTypeVal;
    }

}
