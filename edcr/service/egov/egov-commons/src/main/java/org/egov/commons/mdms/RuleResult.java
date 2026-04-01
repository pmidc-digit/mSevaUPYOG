package org.egov.commons.mdms;


public class RuleResult<T> {
    private final T value;
    private final boolean mandatory;
    private final String unit; // NEW: Added to store "percent" or "m"

    public RuleResult(T value, boolean mandatory) {
        this(value, mandatory, null);
    }

    // NEW: Constructor to include the unit from MDMS
    public RuleResult(T value, boolean mandatory, String unit) {
        this.value = value;
        this.mandatory = mandatory;
        this.unit = unit;
    }

    public T getValue() { return value; }
    public boolean isMandatory() { return mandatory; }
    public String getUnit() { return unit; } // NEW: Getter for the calculation logic

    public T getOrThrow(String ruleName) {
        boolean isMissing = (value == null);
        
        if (!isMissing && value instanceof String) {
            isMissing = ((String) value).isEmpty();
        }
        
        // For JsonNode results, check if it's a "MissingNode"
        if (!isMissing && value instanceof com.fasterxml.jackson.databind.JsonNode) {
            isMissing = ((com.fasterxml.jackson.databind.JsonNode) value).isMissingNode();
        }

        if (mandatory && isMissing) {
            throw new IllegalStateException(ruleName + " is mandatory but missing in MDMS data.");
        }
        return value;
    }
}