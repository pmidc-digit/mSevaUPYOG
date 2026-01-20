package org.egov.rl.calculator.web.models;

import org.egov.rl.calculator.web.models.demand.Demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Builder
@Setter
public class ApplicantDemansStatusResponse {
	
//	@JsonProperty("ResponseInfo")
//    ResponseInfo responseInfo;

	@JsonProperty("cycle")
    private String cycle;
    
    @JsonProperty("demandStatus")
    private String demandStatus;
    
    @JsonProperty("demand")
    private List<Demand> demand;
    
    @JsonProperty("AllotmentDetails")
    private List<AllotmentDetails> allotment;
    
    @Override
    public String toString() {
        return "ApplicantDemansStatusResponse{" +
                "cycle=" + cycle +
                ",demandStatus=" + demandStatus +
                ",demand=" + demand +
                ",AllotmentDetails=" + allotment +
               '}';
    }
       
}


