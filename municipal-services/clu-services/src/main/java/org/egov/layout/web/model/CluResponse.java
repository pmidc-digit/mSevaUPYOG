package org.egov.layout.web.model;

import java.util.ArrayList;
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
 * Contains the ResponseMetadate and the main application contract
 */
@ApiModel(description = "Contains the ResponseMetadate and the main application contract")
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2020-07-30T05:43:01.798Z[GMT]")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CluResponse {
  @JsonProperty("ResponseInfo")
  private ResponseInfo responseInfo = null;

  @JsonProperty("Clu")
  @Valid
  private List<Clu> noc = null;
  
  @JsonProperty("count")
  private Integer count;

  public CluResponse responseInfo(ResponseInfo responseInfo) {
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

  public CluResponse noc(List<Clu> noc) {
    this.noc = noc;
    return this;
  }

  public CluResponse addNocItem(Clu nocItem) {
    if (this.noc == null) {
      this.noc = new ArrayList<Clu>();
    }
    this.noc.add(nocItem);
    return this;
  }

  /**
   * Get layout
   * @return layout
  **/
  @ApiModelProperty(value = "")
      @Valid
    public List<Clu> getNoc() {
    return noc;
  }

  public void setNoc(List<Clu> noc) {
    this.noc = noc;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CluResponse nocResponse = (CluResponse) o;
    return Objects.equals(this.responseInfo, nocResponse.responseInfo) &&
        Objects.equals(this.noc, nocResponse.noc);
  }

  @Override
  public int hashCode() {
    return Objects.hash(responseInfo, noc);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CluResponse {\n");
    
    sb.append("    responseInfo: ").append(toIndentedString(responseInfo)).append("\n");
    sb.append("    layout: ").append(toIndentedString(noc)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
