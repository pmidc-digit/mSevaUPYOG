package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

/**
 * RentPeriod specifies a base rent rate applicable for a specific historical or future date period.
 */
@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class RentPeriod {

    @JsonProperty("fromPeriod")
    private String fromPeriod;

    @JsonProperty("toPeriod")
    private String toPeriod;

    @JsonProperty("rent")
    private BigDecimal rent;
}
