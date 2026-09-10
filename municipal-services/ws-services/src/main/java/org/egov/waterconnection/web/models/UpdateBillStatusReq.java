package org.egov.waterconnection.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateBillStatusReq {
    @JsonProperty("consumer")
    private String consumer;
    @JsonProperty("business")
    private String business;
    @JsonProperty("status")
    private String status;
    @JsonProperty("tenant")
    private String tenant;
}
