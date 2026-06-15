package org.egov.tl.web.models.calculation;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.tl.web.models.TradeLicense;
//import org.hibernate.validator.constraints.SafeHtml;
import org.egov.tl.web.models.SanitizeHtml;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Calculation
 */
@Validated
@jakarta.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-09-27T14:56:03.454+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Calculation {

	@SanitizeHtml
	@JsonProperty("applicationNumber")
	private String applicationNumber = null;

	@JsonProperty("tradeLicense")
	private TradeLicense tradeLicense = null;

	@NotNull
	@SanitizeHtml
	@JsonProperty("tenantId")
	@Size(min = 2, max = 256)
	private String tenantId = null;

	@JsonProperty("taxHeadEstimates")
	List<TaxHeadEstimate> taxHeadEstimates;

	@JsonProperty("tradeTypeBillingIds")
	FeeAndBillingSlabIds tradeTypeBillingIds;

	@JsonProperty("accessoryBillingIds")
	FeeAndBillingSlabIds accessoryBillingIds;

}
