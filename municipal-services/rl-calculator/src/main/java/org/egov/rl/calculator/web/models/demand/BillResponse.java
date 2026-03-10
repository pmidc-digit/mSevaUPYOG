package org.egov.rl.calculator.web.models.demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

/**
 * BillResponse
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {

	@JsonProperty("ResposneInfo")
	private ResponseInfo resposneInfo;

	@JsonProperty("Bill")
	private List<Bill> bill;

}
