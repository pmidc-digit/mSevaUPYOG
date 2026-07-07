package org.egov.garbagecollection.web.models;

import org.egov.common.contract.response.ResponseInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response model for connection validation API
 * Used by frontend to check if a unit can have a new GC connection
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConnectionValidationResponse {
	
	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo;
	
	@JsonProperty("canCreateConnection")
	private Boolean canCreateConnection;
	
	@JsonProperty("unitHasActiveConnection")
	private Boolean unitHasActiveConnection;
	
	@JsonProperty("activeConnectionsCount")
	private Integer activeConnectionsCount;
	
	@JsonProperty("maxConnectionsReached")
	private Boolean maxConnectionsReached;
	
	@JsonProperty("propertyId")
	private String propertyId;
	
	@JsonProperty("unitId")
	private String unitId;
	
	@JsonProperty("message")
	private String message;
}
