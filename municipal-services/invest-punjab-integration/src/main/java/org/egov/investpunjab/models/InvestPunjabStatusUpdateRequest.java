package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabStatusUpdateRequest {

    @JsonProperty("RequestInfo")
    private Object requestInfo;

    @NotNull
    @Valid
    @JsonProperty("payload")
    private InvestPunjabStatusUpdatePayload payload;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("serviceType")
    private String serviceType; // e.g. BF_TL, BF_LG_WC, BF_LG_SC

    @JsonProperty("serviceCode")
    private Integer serviceCode; // e.g. 6, 7, 8
}
