package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Builder
@Setter
public class AllotmentRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;
    
    @JsonProperty("AllotmentDetails")
    private AllotmentDetails allotment;
    
    @Override
    public String toString() {
        return "AllotmentRequest{" +
                "requestInfo=" + requestInfo +
                ", allotment=" + allotment +
                '}';
    }
       
}


