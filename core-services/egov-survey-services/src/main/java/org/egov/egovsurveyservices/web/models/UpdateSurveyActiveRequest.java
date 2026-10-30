package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class UpdateSurveyActiveRequest {
	
	@JsonProperty("RequestInfo")
    RequestInfo requestInfo;
    
    @NotNull(message = "UUID is required")
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("startDate")
    private Long startDate;

    @JsonProperty("endDate")
    private Long endDate;
    
    @JsonProperty("lastModifiedTime")
    private Long lastModifiedTime;
    
    @JsonProperty("lastModifiedBy")
    private String lastModifiedBy;
}
