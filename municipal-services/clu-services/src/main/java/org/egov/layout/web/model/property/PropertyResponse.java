package org.egov.layout.web.model.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

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
