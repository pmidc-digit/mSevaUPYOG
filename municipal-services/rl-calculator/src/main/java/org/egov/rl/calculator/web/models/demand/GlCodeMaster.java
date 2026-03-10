package org.egov.rl.calculator.web.models.demand;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.rl.calculator.web.models.property.AuditDetails;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlCodeMaster {

	private String id;

	@NotNull
	private String tenantId;
	@NotNull
	private String taxHead;
	@NotNull
	private String service;
	@NotNull
	private String glCode;
	@NotNull
	private Long fromDate;
	@NotNull
	private Long toDate;
	
	private AuditDetails auditDetails;
}
