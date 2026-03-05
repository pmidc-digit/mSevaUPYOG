package org.egov.commons.mdms;

import java.util.Optional;

public class RuleResult<T> {
    private final T value;
    private final boolean mandatory;

    public RuleResult(T value, boolean mandatory) {
        this.value = value;
        this.mandatory = mandatory;
    }

    public T getValue() { return value; }
    public boolean isMandatory() { return mandatory; }

    public T getOrThrow(String ruleName) {
        if (mandatory && (value == null || (value instanceof String && ((String) value).isEmpty()))) {
            throw new IllegalStateException(ruleName + " is mandatory but missing in MDMS data.");
        }
        return value;
    }
}