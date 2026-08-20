package org.egov.commons.mdms;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class RuleContext {
    private final BigDecimal numericInput;
    private final Boolean withStilt;
    private final Map<String, Object> formulaVariables;

    private RuleContext(Builder builder) {
        this.numericInput = builder.numericInput;
        this.withStilt = builder.withStilt;
        this.formulaVariables = builder.formulaVariables != null 
            ? Collections.unmodifiableMap(new HashMap<>(builder.formulaVariables)) 
            : Collections.emptyMap();
    }

    public BigDecimal getNumericInput() { return numericInput; }
    public Boolean getWithStilt() { return withStilt; }
    public Map<String, Object> getFormulaVariables() { return formulaVariables; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private BigDecimal numericInput;
        private Boolean withStilt;
        private Map<String, Object> formulaVariables;

        public Builder numericInput(BigDecimal val) { this.numericInput = val; return this; }
        public Builder withStilt(Boolean val) { this.withStilt = val; return this; }
        public Builder formulaVariables(Map<String, Object> vars) { this.formulaVariables = vars; return this; }
        public RuleContext build() { return new RuleContext(this); }
    }
}