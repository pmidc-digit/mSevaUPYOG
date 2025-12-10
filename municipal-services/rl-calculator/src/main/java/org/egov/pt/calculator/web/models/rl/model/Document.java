package org.egov.pt.calculator.web.models.rl.model;

import java.util.List;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import org.hibernate.validator.constraints.SafeHtml;
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

