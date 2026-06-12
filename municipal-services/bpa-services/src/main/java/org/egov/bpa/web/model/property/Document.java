package org.egov.bpa.web.model.property;

import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.egov.bpa.web.model.SanitizeHtml;

import org.egov.bpa.web.model.AuditDetails;
//import org.hibernate.validator.constraints.SafeHtml;
@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(of= {"fileStoreId","documentUid","id"})
public class Document {

  @SanitizeHtml
  @JsonProperty("id")
  private String id ;

  @JsonProperty("documentType")
  @SanitizeHtml
  @NotNull
  private String documentType ;

  @JsonProperty("fileStoreId")
  @SanitizeHtml
  @NotNull
  private String fileStoreId ;

  @SanitizeHtml
  @JsonProperty("documentUid")
  private String documentUid ;

  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;

  @JsonProperty("status")
  private Status status;
}

