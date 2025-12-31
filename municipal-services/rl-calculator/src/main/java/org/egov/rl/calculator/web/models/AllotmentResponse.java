package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Data
public class AllotmentResponse {
   
	@JsonProperty("ResponseInfo")
    ResponseInfo responseInfo;
    
    @JsonProperty("AllotmentDetails")
    private List<AllotmentDetails> allotment;
}
