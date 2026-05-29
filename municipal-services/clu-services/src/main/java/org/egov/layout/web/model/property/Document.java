package org.egov.layout.web.model.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import org.egov.layout.web.model.AuditDetails;
import org.egov.layout.web.model.SanitizeHtml;

import jakarta.validation.constraints.NotNull;
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

