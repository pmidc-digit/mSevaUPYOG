package org.egov.rl.models.user;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.models.AllotmentDetails;

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
   
	@JsonProperty("responseInfo")
    ResponseInfo responseInfo;
    
    @JsonProperty("AllotmentDetails")
    private List<AllotmentDetails> allotment;
}
