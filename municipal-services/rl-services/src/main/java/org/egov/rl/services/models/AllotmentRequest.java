package org.egov.rl.services.models;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Builder
@Setter
public class AllotmentRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;
    
    @JsonProperty("AllotmentDetails")
    private List<AllotmentDetails> allotment;
    
    @Override
    public String toString() {
        return "AllotmentRequest{" +
                "requestInfo=" + requestInfo +
                ", allotment=" + allotment +
                '}';
    }
       
}


