package org.egov.rl.services.models;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
