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
public class SchedullerRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;
    
    @JsonProperty("Scheduller")
    private List<NotificationSchedule> scheduller;
    
    @Override
    public String toString() {
        return "SchedullerRequest{" +
                "requestInfo=" + requestInfo +
                ", Scheduller=" + scheduller +
                '}';
    }
       
}


