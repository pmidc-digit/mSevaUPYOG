package org.egov.rl.services.models;

import java.util.Set;

import org.egov.rl.services.models.enums.Status;

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
public class SearchProperty {

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("allotmentId")
	private String allotmentId;
	
	@JsonProperty("searchType")
	private String searchType; //occiped/vacent
//	
//	@JsonProperty("propertyType")
//	private String propertyType; //Residential/comerical
//	
//	@JsonProperty("usageCategory")
//	private String usageCategory;  /// Rent or Rease
//
//	@JsonProperty("locationType")
//	private String locationType; //prime/non-prime
//
//	@JsonProperty("propertyName")
//	private String propertyName;
	
	@JsonProperty("filter")
	private String filter;

	@JsonProperty("fromDate")
	private Long fromDate;

	@JsonProperty("toDate")
	private Long toDate;
	
}
