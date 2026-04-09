package org.egov.rl.calculator.web.models.demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingPeriod {

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("billingCycle")
    private String billingCycle;

    @JsonProperty("taxPeriodFrom")
    private Long taxPeriodFrom;

    @JsonProperty("taxPeriodTo")
    private Long taxPeriodTo;

    @JsonProperty("demandGenerationDateMillis")
    private Long demandGenerationDateMillis;

    @JsonProperty("demandEndDateMillis")
    private Long demandEndDateMillis;

    @JsonProperty("demandExpiryDate")
    private Long demandExpiryDate;
}