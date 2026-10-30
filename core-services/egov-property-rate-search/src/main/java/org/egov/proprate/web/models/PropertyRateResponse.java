package org.egov.proprate.web.models; // moved to models package based on convention

import java.util.List;
import org.egov.common.contract.response.ResponseInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // <--- Generates Getters, Setters, toString, etc.
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PropertyRateResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("PropertyRates")
    private List<AddPropertyRate> propertyRates; 
}