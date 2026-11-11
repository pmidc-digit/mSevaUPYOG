package org.egov.collection.web.contract;

import java.util.ArrayList;
import java.util.List;

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
public class CancelBillCriteria {

	@JsonProperty("requestInfo")
	private RequestInfo requestInfo;

	@JsonProperty("BillList")
	@Builder.Default
	private List<BillList> billList = new ArrayList<>();

	@JsonProperty("tenantId")
	private String tenantId;
}
