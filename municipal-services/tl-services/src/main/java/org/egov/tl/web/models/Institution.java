package org.egov.tl.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
//import org.hibernate.validator.constraints.SafeHtml;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Institution {

  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("id")
  private String id;

  @Size(max=256)
  @SanitizeHtml
  @JsonProperty("tenantId")
  private String tenantId;

  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("name")
  private String name;

  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("type")
  private String type;

  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("designation")
  private String designation;

  @JsonProperty("active")
  private Boolean active = null;

  @Size(max=256)
  @SanitizeHtml
  @JsonProperty("instituionName")
  private String instituionName;

  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("contactNo")
  private String contactNo;


  @Size(max=64)
  @SanitizeHtml
  @JsonProperty("organisationRegistrationNo")
  private String organisationRegistrationNo;

  @Size(max=512)
  @SanitizeHtml
  @JsonProperty("address")
  private String address;
}
