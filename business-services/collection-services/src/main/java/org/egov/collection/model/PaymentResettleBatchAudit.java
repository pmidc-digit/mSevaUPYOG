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
public class PaymentResettleBatchAudit {

	@JsonProperty("id")
	private String id;

	@JsonProperty("batchId")
	private String batchId;

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("businessService")
	private String businessService;

	@JsonProperty("fromTime")
	private Long fromTime;

	@JsonProperty("toTime")
	private Long toTime;

	@JsonProperty("totalFound")
	private Integer totalFound;

	@JsonProperty("totalSettled")
	private Integer totalSettled;

	@JsonProperty("totalSkipped")
	private Integer totalSkipped;

	@JsonProperty("totalFailed")
	private Integer totalFailed;

	@JsonProperty("status")
	private String status;

	@JsonProperty("createdTime")
	private Long createdTime;

	@JsonProperty("createdBy")
	private String createdBy;
}
