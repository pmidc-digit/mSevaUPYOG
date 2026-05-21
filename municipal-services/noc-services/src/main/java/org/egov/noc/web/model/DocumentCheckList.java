package org.egov.noc.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.SafeHtml;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Validated
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class DocumentCheckList {

	@SafeHtml
	@JsonProperty("id")
	private String id = null;
	
	@SafeHtml
	@NotNull
	@Size(min=1, max=64)
	@JsonProperty("documentuid")
	private String documentuid = null;
	
	@SafeHtml
	@JsonProperty("applicationNo")
	@NotNull
	private String applicationNo = null;
	
	@SafeHtml
	@JsonProperty("tenantId")
	@NotNull
	private String tenantId = null;
	
	@SafeHtml
	@JsonProperty("action")
	@NotNull
	private String action = null;
	
	@SafeHtml
	@JsonProperty("remarks")
	@NotNull
	private String remarks = null;
	
	@SafeHtml
	@JsonProperty("createdby")
	@Size(max=64)
	private String createdby = null;
	
	@SafeHtml
	@JsonProperty("lastmodifiedby")
	@Size(max=64)
	private String lastmodifiedby = null;
	
	@JsonProperty("createdtime")
	private Long createdtime = null;
	
	@JsonProperty("lastmodifiedtime")
	private Long lastmodifiedtime = null;
	
}
