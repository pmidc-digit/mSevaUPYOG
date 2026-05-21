package org.egov.noc.calculator.web.models;

import java.util.List;
import java.util.Objects;

import javax.validation.Valid;

import org.egov.common.contract.response.ResponseInfo;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

/**
 * Contains the ResponseHeader and the created/updated property
 */
@ApiModel(description = "Contains the ResponseHeader and the created/updated property")
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2020-06-23T05:52:32.717Z[GMT]")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LAYOUTResponse {
  @JsonProperty("ResponseInfo")
  private ResponseInfo responseInfo = null;

  @JsonProperty("Layout")
  private List<Layout> LAYOUT = null;

  public LAYOUTResponse responseInfo(ResponseInfo responseInfo) {
    this.responseInfo = responseInfo;
    return this;
  }

  /**
   * Get responseInfo
   * @return responseInfo
  **/
  @ApiModelProperty(value = "")
  
    @Valid
    public ResponseInfo getResponseInfo() {
    return responseInfo;
  }

  public void setResponseInfo(ResponseInfo responseInfo) {
    this.responseInfo = responseInfo;
  }

  public LAYOUTResponse NOC(List<Layout> NOC) {
    this.LAYOUT = NOC;
    return this;
  }

  /**
   * Get NOC
   * @return Layout
  **/
  @ApiModelProperty(value = "")
  
    @Valid
    public List<Layout> getLAYOUT() {
    return LAYOUT;
  }

  public void setLAYOUT(List<Layout> LAYOUT) {
    this.LAYOUT = LAYOUT;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LAYOUTResponse nocResponse = (LAYOUTResponse) o;
    return Objects.equals(this.responseInfo, nocResponse.responseInfo) &&
        Objects.equals(this.LAYOUT, nocResponse.LAYOUT);
  }

  @Override
  public int hashCode() {
    return Objects.hash(responseInfo, LAYOUT);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LAYOUTResponse {\n");
    
    sb.append("    responseInfo: ").append(toIndentedString(responseInfo)).append("\n");
    sb.append("    NOC: ").append(toIndentedString(LAYOUT)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
