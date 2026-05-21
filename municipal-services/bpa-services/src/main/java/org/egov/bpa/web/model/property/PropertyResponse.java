package org.egov.bpa.web.model.property;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Contains the ResponseHeader and the created/updated property
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse   {

	@JsonProperty("ResponseInfo")
  private ResponseInfo responseInfo;

  @JsonProperty("Properties")
  private List<Property> properties;
  
  @JsonProperty("count")
  private Integer count;
}
