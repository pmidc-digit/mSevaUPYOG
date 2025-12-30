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
public class Document {

  @JsonProperty("docId")
  private String id ;

  @JsonProperty("allotmentId")
  private String documentUid ;

  @JsonProperty("documentType")
  @NotNull
  private String documentType ;

  @JsonProperty("fileStoreId")
  @NotNull
  private String fileStoreId ;
  
  @JsonProperty("status")
  private Status status;

//  @SafeHtml
  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;
}

