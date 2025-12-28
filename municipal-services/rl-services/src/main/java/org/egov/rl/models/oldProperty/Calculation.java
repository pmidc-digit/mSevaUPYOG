
package org.egov.rl.models.oldProperty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Calculation
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Calculation {

    @JsonProperty("serviceNumber")
    private String serviceNumber;

    @JsonProperty("totalAmount")
    private BigDecimal totalAmount;

    private BigDecimal taxAmount;

    @JsonProperty("penalty")
    private BigDecimal penalty;

    @JsonProperty("fromDate")
    private Long fromDate;

    @JsonProperty("toDate")
    private Long toDate;

    @JsonProperty("tenantId")
    private String tenantId;
}
