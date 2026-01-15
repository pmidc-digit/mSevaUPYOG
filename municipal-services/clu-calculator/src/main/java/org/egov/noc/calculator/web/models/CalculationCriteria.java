package org.egov.noc.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalculationCriteria {
	@JsonProperty("CLU")
	private Clu layout = null;

    @JsonProperty("applicationNumber")
    private String applicationNumber = null;

    @JsonProperty("tenantId")
    private String tenantId = null;

    @JsonProperty("feeType")
    private String feeType = null;

}