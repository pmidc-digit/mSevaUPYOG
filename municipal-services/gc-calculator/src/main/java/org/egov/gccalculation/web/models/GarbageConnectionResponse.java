package org.egov.gccalculation.web.models;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import org.egov.common.contract.response.ResponseInfo;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;

/**
 * Contains the ResponseHeader and the created/updated property
 */
@ApiModel(description = "Contains the ResponseHeader and the created/updated property")
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2019-10-24T10:29:25.253+05:30[Asia/Kolkata]")

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Builder
public class GarbageConnectionResponse {
	@JsonProperty("ResponseInfo")
	private ResponseInfo responseInfo = null;

	@JsonProperty("GarbageConnection")
	@Valid
	private List<GarbageConnection> waterConnection = null;

	public GarbageConnectionResponse responseInfo(ResponseInfo responseInfo) {
		this.responseInfo = responseInfo;
		return this;
	}

	/**
	 * Get responseInfo
	 * 
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

	public GarbageConnectionResponse waterConnection(List<GarbageConnection> waterConnection) {
		this.waterConnection = waterConnection;
		return this;
	}

	public GarbageConnectionResponse addWaterConnectionItem(GarbageConnection waterConnectionItem) {
		if (this.waterConnection == null) {
			this.waterConnection = new ArrayList<GarbageConnection>();
		}
		this.waterConnection.add(waterConnectionItem);
		return this;
	}

	/**
	 * Get waterConnection
	 * 
	 * @return waterConnection
	 **/
	@ApiModelProperty(value = "")
	@Valid
	public List<GarbageConnection> getWaterConnection() {
		return waterConnection;
	}

	public void setWaterConnection(List<GarbageConnection> waterConnection) {
		this.waterConnection = waterConnection;
	}

	@Override
	public boolean equals(java.lang.Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		GarbageConnectionResponse waterConnectionResponse = (GarbageConnectionResponse) o;
		return Objects.equals(this.responseInfo, waterConnectionResponse.responseInfo)
				&& Objects.equals(this.waterConnection, waterConnectionResponse.waterConnection);
	}

	@Override
	public int hashCode() {
		return Objects.hash(responseInfo, waterConnection);
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("class GarbageConnectionResponse {\n");

		sb.append("    responseInfo: ").append(toIndentedString(responseInfo)).append("\n");
		sb.append("    waterConnection: ").append(toIndentedString(waterConnection)).append("\n");
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
