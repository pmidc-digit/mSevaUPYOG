package org.egov.rl.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Category of demand like RENEWAL, NEW, rebate, penalty etc.
 */
public enum ApplicationType {

    TAX("RENEWAL"),

    FEE("NEW");

    private String value;

    ApplicationType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static ApplicationType fromValue(String text) {
        for (ApplicationType b : ApplicationType.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}
