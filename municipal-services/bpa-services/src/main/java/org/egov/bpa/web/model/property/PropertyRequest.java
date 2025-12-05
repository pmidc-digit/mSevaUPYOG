package org.egov.bpa.web.model.property;

import javax.validation.Valid;

import org.egov.common.contract.request.RequestInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

/**
 * Contract class to receive request. Array of Property items  are used in case of create . Where as single Property item is used for update
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRequest   {
	
  @JsonProperty("RequestInfo")
  private RequestInfo requestInfo;

  @JsonProperty("Property")
  @Valid
  private Property property;
}

