package org.egov.layout.web.model.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import org.egov.layout.web.model.AuditDetails;
import org.hibernate.validator.constraints.SafeHtml;

import javax.validation.constraints.NotNull;
@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(of= {"fileStoreId","documentUid","id"})
public class Document {

  @SafeHtml
  @JsonProperty("id")
  private String id ;

  @JsonProperty("documentType")
  @SafeHtml
  @NotNull
  private String documentType ;

  @JsonProperty("fileStoreId")
  @SafeHtml
  @NotNull
  private String fileStoreId ;

  @SafeHtml
  @JsonProperty("documentUid")
  private String documentUid ;

  @JsonProperty("auditDetails")
  private AuditDetails auditDetails;

  @JsonProperty("status")
  private Status status;
}

