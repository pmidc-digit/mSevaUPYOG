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
public class UpdateDemandPayerRequest {
    @JsonProperty("consumer")
    private String consumer;
    @JsonProperty("propertyId")
    private String propertyId;
    @JsonProperty("business")
    private String business;
    @JsonProperty("tenant")
    private String tenant;
}
