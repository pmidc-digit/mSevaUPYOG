package org.egov.collection.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.collection.model.Payment;
import org.egov.common.contract.response.ResponseInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResettleResponse {

	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo;

	@JsonProperty("payment")
	private Payment payment;

	@JsonProperty("originalBillId")
	private String originalBillId;

	@JsonProperty("cancelledActiveBillId")
	private String cancelledActiveBillId;

	@JsonProperty("resettleStatus")
	private String resettleStatus;

	@JsonProperty("message")
	private String message;
}
