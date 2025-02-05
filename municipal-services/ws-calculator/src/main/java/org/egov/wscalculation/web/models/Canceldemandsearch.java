package org.egov.wscalculation.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class Canceldemandsearch {

	@JsonProperty("demandid")
	private String demandid = null;
	

	@JsonProperty("consumercode")
	private String consumercode = null;
	
	@JsonProperty("businessservice")
	private String businessservice = null;
	
	@JsonProperty("tenantId")
	private String tenantId = null;
	
	@JsonProperty("taxPeriodFrom")
	private String taxPeriodFrom = null;
	
	@JsonProperty("taxPeriodTo")
	private String taxPeriodTo = null;
	
}
