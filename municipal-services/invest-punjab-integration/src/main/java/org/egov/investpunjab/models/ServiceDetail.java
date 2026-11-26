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
public class ServiceDetail {

    @JsonProperty("iPin")
    private String iPin;

    @JsonProperty("AppId")
    private String appId;

    @JsonProperty("MobileNo")
    private String mobileNo;

    @JsonProperty("ServiceCode")
    private Integer serviceCode;

    @JsonProperty("ServiceName")
    private String serviceName;

    @JsonProperty("CategoryTypeId")
    private Integer categoryTypeId;

    @JsonProperty("CategoryType")
    private String categoryType;
}
