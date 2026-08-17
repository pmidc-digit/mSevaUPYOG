package org.egov.rl.calculator.penalty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Configuration for a penalty rule, sourced from MDMS.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PenaltyConfig {

    @JsonProperty("billingCycle")
    private String billingCycle;

    @JsonProperty("penaltyType")
    private String penaltyType;

    @JsonProperty("annualRate")
    private BigDecimal annualRate;

    @JsonProperty("monthlyRate")
    private BigDecimal monthlyRate;

    @JsonProperty("rate")
    private BigDecimal rate;

    @JsonProperty("graceDays")
    private Integer graceDays;

    @JsonProperty("applicableAfterDays")
    private Integer applicableAfterDays;

    @JsonProperty("flatAmount")
    private BigDecimal flatAmount;

    @JsonProperty("minAmount")
    private BigDecimal minAmount;

    @JsonProperty("maxAmount")
    private BigDecimal maxAmount;

    @JsonProperty("compound")
    private Boolean compound;

    @JsonProperty("fromFY")
    private String fromFY;

    @JsonProperty("startingDay")
    private String startingDay;

    public BigDecimal effectiveAnnualRate() {
        if (annualRate != null && annualRate.compareTo(BigDecimal.ZERO) > 0) {
            return annualRate;
        }
        return (rate != null) ? rate : BigDecimal.ZERO;
    }

    public int effectiveGraceDays() {
        if (applicableAfterDays != null) return applicableAfterDays;
        if (graceDays != null) return graceDays;
        return 0;
    }

    public String resolvedPenaltyType() {
        return (penaltyType != null && !penaltyType.trim().isEmpty()) ? penaltyType.trim().toUpperCase() : "SIMPLE_INTEREST";
    }
}
