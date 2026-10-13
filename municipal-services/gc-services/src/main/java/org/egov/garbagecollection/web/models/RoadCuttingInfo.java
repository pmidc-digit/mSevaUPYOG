package org.egov.garbagecollection.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
//import org.hibernate.validator.constraints.SafeHtml;

import jakarta.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoadCuttingInfo {

  @SanitizeHtml
  @JsonProperty("id")
  private String id ;

  @SanitizeHtml
  @JsonProperty("roadType")
  private String roadType = null;

  @JsonProperty("roadCuttingArea")
  private Float roadCuttingArea = null;

  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;

  @JsonProperty("status")
  private Status status;
}

