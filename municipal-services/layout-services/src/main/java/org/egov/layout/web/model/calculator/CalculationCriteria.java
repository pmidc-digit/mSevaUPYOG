package org.egov.layout.web.model.calculator;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import org.egov.layout.web.model.Layout;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalculationCriteria {
	@JsonProperty("NOC")
	private Layout noc = null;

    @JsonProperty("applicationNumber")
    private String applicationNumber = null;

    @JsonProperty("tenantId")
    private String tenantId = null;


}