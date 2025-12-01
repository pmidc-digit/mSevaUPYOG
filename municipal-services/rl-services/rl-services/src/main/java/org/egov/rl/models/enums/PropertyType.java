package org.egov.rl.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Category of demand like tax, fee, rebate, penalty etc.
 */
public enum PropertyType {

    TAX("Prime"),

    FEE("Non-Prime");

    private String value;

    PropertyType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static PropertyType fromValue(String text) {
        for (PropertyType b : PropertyType.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}
