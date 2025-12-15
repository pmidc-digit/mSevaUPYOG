package org.egov.rl.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Category of demand like tax, fee, rebate, penalty etc.
 */
public enum SchedullerType {

	ANNUAL("ANNUAL"),

	BIANNUAL("BIANNUAL"),

	QUATERLY("QUATERLY"),

	MONTHLY("MONTHLY");

    private String value;

    SchedullerType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static SchedullerType fromValue(String text) {
        for (SchedullerType b : SchedullerType.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}
