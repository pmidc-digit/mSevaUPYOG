package org.egov.rl.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Category of demand like tax, fee, rebate, penalty etc.
 */
public enum UseCategory {

    TAX("RENT"),

    FEE("LEASE");

    private String value;

    UseCategory(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static UseCategory fromValue(String text) {
        for (UseCategory b : UseCategory.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}
