package org.egov.collection.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResettleDetailAudit {

	@JsonProperty("id")
	private String id;

	@JsonProperty("batchId")
	private String batchId;

	@JsonProperty("paymentId")
	private String paymentId;

	@JsonProperty("consumerCode")
	private String consumerCode;

	@JsonProperty("businessService")
	private String businessService;

	@JsonProperty("billId")
	private String billId;

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("resettleStatus")
	private String resettleStatus;

	@JsonProperty("failureReason")
	private String failureReason;

	@JsonProperty("createdTime")
	private Long createdTime;

	@JsonProperty("createdBy")
	private String createdBy;
}
