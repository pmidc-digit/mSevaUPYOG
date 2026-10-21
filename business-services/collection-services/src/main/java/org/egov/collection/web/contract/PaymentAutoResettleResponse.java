package org.egov.collection.web.contract;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAutoResettleResponse {

	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo;

	@JsonProperty("batchId")
	private String batchId;

	@JsonProperty("totalFound")
	private int totalFound;

	@JsonProperty("resettled")
	private int resettled;

	@JsonProperty("skipped")
	private int skipped;

	@JsonProperty("failed")
	private int failed;

	@JsonProperty("resettledPaymentIds")
	private List<String> resettledPaymentIds;

	@JsonProperty("failedPaymentIds")
	private List<String> failedPaymentIds;

	@JsonProperty("messages")
	private List<String> messages;
}
