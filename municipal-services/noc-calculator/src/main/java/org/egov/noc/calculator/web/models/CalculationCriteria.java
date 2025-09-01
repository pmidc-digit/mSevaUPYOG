package org.egov.noc.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.noc.calculator.web.models.noc.NocApplicationRequest;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalculationCriteria {
    @JsonProperty("ndcapplication")
    private NocApplicationRequest ndcApplicationRequest = null;

    @JsonProperty("applicationNumber")
    private String applicationNumber = null;

    @JsonProperty("tenantId")
    private String tenantId = null;


}