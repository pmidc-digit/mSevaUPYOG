package org.egov.rl.models;

import java.util.List;

import org.egov.rl.models.enums.Relationship;
import org.egov.rl.models.oldProperty.Address;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

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
