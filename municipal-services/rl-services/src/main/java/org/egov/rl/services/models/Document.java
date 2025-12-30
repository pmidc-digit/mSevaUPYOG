package org.egov.rl.services.models;

import javax.validation.constraints.NotNull;

import org.egov.rl.services.models.enums.Status;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
//@Getter
//@Setter
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//@Builder
////(toBuilder = true)
////@EqualsAndHashCode(of= {"fileStoreId","documentUid","id"})
@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

  @JsonProperty("docId")
  private String id ;

  @JsonAlias({"allotmentId", "documentUid"})
  @JsonProperty("documentUid")
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

  @JsonProperty("additionalDetails")
  private Object additionalDetails = null;
}

