package org.egov.proprate.web.models;

import java.util.List;
import org.egov.common.contract.request.RequestInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PropertyRateRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("PropertyRates") 
    private List<AddPropertyRate> propertyRates;
}