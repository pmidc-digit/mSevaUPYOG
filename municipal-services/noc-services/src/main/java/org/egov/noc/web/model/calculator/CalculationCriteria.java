package org.egov.noc.web.model.calculator;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.noc.web.model.NocRequest;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalculationCriteria {
    @JsonProperty("ndcapplication")
    private NocRequest nocRequest = null;

    @JsonProperty("applicationNumber")
    private String applicationNumber = null;

    @JsonProperty("tenantId")
    private String tenantId = null;


}