package org.egov.garbagecollection.web.models;

import jakarta.validation.constraints.NotNull;


import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
//import org.hibernate.validator.constraints.SafeHtml;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of= {"fileStoreId","applicationId","id"})
public class Document {

  @SanitizeHtml
  @JsonProperty("id")
  private String id ;

  @JsonProperty("documentType")
  @NotNull
  @SanitizeHtml
  private String documentType ;

  @JsonProperty("fileStoreId")
  @NotNull
  @SanitizeHtml
  private String fileStoreId ;

  @SanitizeHtml
  @JsonProperty("applicationId")
  private String applicationId;

  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;

  @JsonProperty("status")
  private Status status;
}

