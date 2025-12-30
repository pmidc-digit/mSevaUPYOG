package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.rl.calculator.web.models.property.AuditDetails;

import javax.validation.constraints.NotNull;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandPerioud {

  @JsonProperty("consumerType")
  private String consumerType ;

  @JsonProperty("startDate")
  private long startDate;

  @JsonProperty("endDate")
  private long endDate;
  
  @JsonProperty("expireDate")
  private long expireDate;
  
  @JsonProperty("cycle")
  private String cycle;
  
}

