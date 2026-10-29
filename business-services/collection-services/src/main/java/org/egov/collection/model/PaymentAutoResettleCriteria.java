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
public class PaymentAutoResettleCriteria {

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("businessService")
	private String businessService;

	@JsonProperty("fromTime")
	private Long fromTime;

	@JsonProperty("toTime")
	private Long toTime;

	@JsonProperty("bufferMinutes")
	private Long bufferMinutes;

	@JsonProperty("lookbackHours")
	private Long lookbackHours;

	@JsonProperty("limit")
	private Integer limit;
}
