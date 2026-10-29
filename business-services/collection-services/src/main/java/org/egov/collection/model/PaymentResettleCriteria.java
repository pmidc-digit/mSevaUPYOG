package org.egov.collection.model;

import javax.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResettleCriteria {

	@NotNull
	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("consumerCode")
	private String consumerCode;

	@JsonProperty("businessService")
	private String businessService;

	@JsonProperty("paymentId")
	private String paymentId;

	@JsonProperty("receiptNumber")
	private String receiptNumber;

	@JsonProperty("billId")
	private String billId;
}
