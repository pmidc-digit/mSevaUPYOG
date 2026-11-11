package org.egov.collection.web.contract;

import java.util.List;
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
public class PaymentReplayResponse {

	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo;

	@JsonProperty("status")
	private String status;

	@JsonProperty("message")
	private String message;

	@JsonProperty("totalReplayed")
	private Integer totalReplayed;

	@JsonProperty("payments")
	private List<Payment> payments;

	@JsonProperty("topic")
	private String topic;

	@JsonProperty("consumerCode")
	private String consumerCode;

	@JsonProperty("tenantId")
	private String tenantId;
}
