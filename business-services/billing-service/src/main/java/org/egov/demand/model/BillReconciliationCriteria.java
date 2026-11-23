package org.egov.demand.model;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillReconciliationCriteria {

	@NotNull
	private String tenantId;

	@NotNull
	private String consumerCode;

	private String businessService;

	@NotNull
	private String billId;

}
