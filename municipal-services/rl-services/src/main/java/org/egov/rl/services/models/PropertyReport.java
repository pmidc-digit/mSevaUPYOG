package org.egov.rl.services.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PropertyReport {
	
	@JsonProperty("exapire")
	private String exapire;
	
	@JsonProperty("allocatedTo")
	private List<OwnerInfo> allocatedTo;

	@JsonProperty("property")
	private RLProperty property; 

}
