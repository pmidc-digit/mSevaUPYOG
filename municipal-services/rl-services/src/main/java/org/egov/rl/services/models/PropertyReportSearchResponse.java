package org.egov.rl.services.models;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Data
@ToString
public class PropertyReportSearchResponse {
   
	@JsonProperty("responseInfo")
    ResponseInfo responseInfo;
    
    @JsonProperty("property")
    private Object property;
}
