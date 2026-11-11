package org.egov.collection.web.contract;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.collection.model.PaymentResettleCriteria;
import org.egov.common.contract.request.RequestInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResettleRequest {

	@NotNull
	@Valid
	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;

	@NotNull
	@Valid
	@JsonProperty("resettleCriteria")
	private PaymentResettleCriteria resettleCriteria;
}
