package org.egov.rl.services.models;

import java.util.Set;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.services.models.enums.Status;
import org.hibernate.validator.constraints.SafeHtml;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyReportSearchRequest {
	
	@JsonProperty("requestInfo")
	private RequestInfo requestInfo;
	
	@JsonProperty("filterData")
	private SearchProperty searchProperty;
}
