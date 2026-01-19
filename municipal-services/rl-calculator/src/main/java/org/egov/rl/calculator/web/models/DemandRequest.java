package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.web.models.demand.DemandCriteria;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Builder
@Setter
public class DemandRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;
    
    @JsonProperty("demandCriteria")
    private DemandCriteria demandCriteria;
    
    @Override
    public String toString() {
        return "DemandRequest{" +
                "requestInfo=" + requestInfo +
                ", demandCriteria=" + demandCriteria +
                '}';
    }
       
}


