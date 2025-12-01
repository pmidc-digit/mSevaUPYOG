package org.egov.rl.models;

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
public class ClsureRequest {

    @JsonProperty("requestInfo")
    private RequestInfo requestInfo;
    
    @JsonProperty("AllotmentClsure")
    private AllotmentClsure allotmentClsure;
    
    @Override
    public String toString() {
        return "AllotmentRequest{" +
                "requestInfo=" + requestInfo +
                ", AllotmentClsure=" + allotmentClsure +
                '}';
    }
       
}


