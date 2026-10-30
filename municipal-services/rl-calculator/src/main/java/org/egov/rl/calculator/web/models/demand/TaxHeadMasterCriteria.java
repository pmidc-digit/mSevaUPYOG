package org.egov.rl.calculator.web.models.demand;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class TaxHeadMasterCriteria {

	@NotNull
	private String tenantId;
	@NotNull
	private String service;
	private String category;
	private String name;
	private Set<String> code=new HashSet<>();
	private Boolean isDebit;
	private Boolean isActualDemand;
	
	private Set<String> id=new HashSet<>();
	private Long validFrom;
	private Long validTill;
	private Long size;
	private Long offset;
}
