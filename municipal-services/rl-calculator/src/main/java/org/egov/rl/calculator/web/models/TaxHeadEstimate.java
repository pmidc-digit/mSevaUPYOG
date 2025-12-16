package org.egov.rl.calculator.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.rl.calculator.web.models.demand.Category;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxHeadEstimate {

	private String taxHeadCode;
	
	private BigDecimal estimateAmount;
	
	private Category category;
}
