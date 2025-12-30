package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Data
public class AllotmentSearchResponse {
   
	@JsonProperty("responseInfo")
    ResponseInfo responseInfo;
    
    @JsonProperty("AllotmentDetails")
    private List<AllotmentDetails> allotment;
}
