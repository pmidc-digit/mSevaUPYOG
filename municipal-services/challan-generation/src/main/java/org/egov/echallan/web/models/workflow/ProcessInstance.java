package org.egov.echallan.web.models.workflow;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProcessInstance {

  @JsonProperty("id")
  private String id;

  @JsonProperty("businessService")
  private String businessService;

  @JsonProperty("businessId")
  private String businessId;

  @JsonProperty("tenantId")
  private String tenantId;

  @JsonProperty("action")
  private String action;

  @JsonProperty("moduleN ame")
  @JsonProperty("moduleName")
  private String moduleName;

  @JsonProperty("comment")
  private String comment;

  @JsonProperty("assignes")
  private java.util.List<String> assignes;

  @JsonProperty("documents")
  private java.util.List<org.egov.echallan.model.DocumentDetail> documents;

  @JsonProperty("state")
  private State state; // populated by workflow response
}
