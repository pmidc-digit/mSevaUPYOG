package org.egov.proprate.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.request.RequestInfo; // Use your local class if standalone

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RateSearchRequest {
    
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("searchCriteria")
    private SearchCriteria searchCriteria;
}