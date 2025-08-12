package org.egov.ndc.web.model.ndc;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;
import org.egov.ndc.web.model.OwnerInfo;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
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

    @JsonProperty("dueAmount")
    private BigDecimal dueAmount;

    @JsonProperty("status")
    private String status;

//    @JsonProperty("owners")
//    private List<OwnerInfo> ownerInfo;
}