package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabEventResult {

    @JsonProperty("eventId")
    private String eventId;

    @JsonProperty("timestamp")
    private Long timestamp;

    @JsonProperty("eventType")
    private String eventType; // SUCCESS or FAILED

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("serviceType")
    private String serviceType;

    @JsonProperty("serviceCode")
    private Integer serviceCode;

    @JsonProperty("iPin")
    private String iPin;

    @JsonProperty("appId")
    private String appId;

    @JsonProperty("statusId")
    private Integer statusId;

    @JsonProperty("statusDesc")
    private String statusDesc;

    @JsonProperty("payload")
    private InvestPunjabStatusUpdatePayload payload;

    @JsonProperty("response")
    private InvestPunjabStatusUpdateResponse response;

    @JsonProperty("errorMessage")
    private String errorMessage;

    @JsonProperty("errorCode")
    private String errorCode;

    @JsonProperty("executionTimeMs")
    private Long executionTimeMs;
}
