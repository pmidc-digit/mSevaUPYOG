package org.egov.rl.calculator.web.models.demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Penalty {

    @JsonProperty("rate")
    private BigDecimal rate;

    @JsonProperty("minAmount")
    private BigDecimal minAmount;

    @JsonProperty("applicableAfterDays")
    private Integer applicableAfterDays;

    @JsonProperty("flatAmount")
    private BigDecimal flatAmount;

    @JsonProperty("maxAmount")
    private BigDecimal maxAmount;

    @JsonProperty("fromFY")
    private String fromFY;

    @JsonProperty("startingDay")
    private String startingDay;
}