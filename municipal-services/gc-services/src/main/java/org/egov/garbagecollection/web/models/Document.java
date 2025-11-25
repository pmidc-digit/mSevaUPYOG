package org.egov.garbagecollection.web.models;

import javax.validation.constraints.NotNull;


import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.SafeHtml;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of= {"fileStoreId","applicationId","id"})
public class Document {

  @SafeHtml
  @JsonProperty("id")
  private String id ;

  @JsonProperty("documentType")
  @NotNull
  @SafeHtml
  private String documentType ;

  @JsonProperty("fileStoreId")
  @NotNull
  @SafeHtml
  private String fileStoreId ;

  @SafeHtml
  @JsonProperty("applicationId")
  private String applicationId;

  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;

  @JsonProperty("status")
  private Status status;
}

