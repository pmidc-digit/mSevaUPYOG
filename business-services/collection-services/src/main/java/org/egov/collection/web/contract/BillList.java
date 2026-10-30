package org.egov.collection.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.request.RequestInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillList {

	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;

	@JsonProperty("consumerCode")
	private String consumerCode;

	@JsonProperty("businessService")
	private String businessService;
}
