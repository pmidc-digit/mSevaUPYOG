package org.egov.ndc.web.model.ndc;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NdcDetailsRequest {
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("applicationId")
    private String applicationId;

    @JsonProperty("businessService")
    private String businessService;

    @JsonProperty("consumerCode")
    private String consumerCode;

    @JsonProperty("additionalDetails")
    private JsonNode additionalDetails;

    @JsonProperty("isDuePending")
    private Boolean duePending;

    @JsonProperty("status")
    private String status;
}