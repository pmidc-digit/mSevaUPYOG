package org.egov.proprate.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import org.egov.common.contract.response.ResponseInfo;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RateResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("rates")
    private List<PropertyRate> rates;

    @JsonProperty("districts")
    private List<Boundary> districts;

    @JsonProperty("tehsils")
    private List<Boundary> tehsils;

    @JsonProperty("villages")
    private List<Boundary> villages;

    @JsonProperty("segments")
    private List<Boundary> segments;
    
    @JsonProperty("SubSegments")
    private List<Boundary> subSegments;

    @JsonProperty("usageCategories")
    private List<Boundary> usageCategories;
    
    @JsonProperty("subCategories")
    private List<Boundary> subCategories;
}