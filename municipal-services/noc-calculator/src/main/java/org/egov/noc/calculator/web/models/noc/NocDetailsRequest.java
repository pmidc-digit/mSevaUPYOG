package org.egov.noc.calculator.web.models.noc;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class NocDetailsRequest {
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("applicantId")
    private String applicantId;

    @JsonProperty("businessService")
    private String businessService;

    @JsonProperty("consumerCode")
    private String consumerCode;

    @JsonProperty("additionalDetails")
    private JsonNode additionalDetails;

    @JsonProperty("dueAmount")
    private BigDecimal dueAmount;

    @JsonProperty("status")
    private String status;
}