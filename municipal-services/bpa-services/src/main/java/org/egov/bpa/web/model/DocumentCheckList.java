package org.egov.bpa.web.model;

import java.util.Objects;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

////import org.hibernate.validator.constraints.SafeHtml;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Validated
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class DocumentCheckList {

	@SanitizeHtml
	@JsonProperty("id")
	private String id = null;
	
	@SanitizeHtml
	@NotNull
	@Size(min=1, max=64)
	@JsonProperty("documentuid")
	private String documentuid = null;
	
	@SanitizeHtml
	@JsonProperty("applicationNo")
	@NotNull
	private String applicationNo = null;
	
	@SanitizeHtml
	@JsonProperty("tenantId")
	@NotNull
	private String tenantId = null;
	
	@SanitizeHtml
	@JsonProperty("action")
	@NotNull
	private String action = null;
	
	@SanitizeHtml
	@JsonProperty("remarks")
	@NotNull
	private String remarks = null;
	
	@SanitizeHtml
	@JsonProperty("createdby")
	@Size(max=64)
	private String createdby = null;
	
	@SanitizeHtml
	@JsonProperty("lastmodifiedby")
	@Size(max=64)
	private String lastmodifiedby = null;
	
	@JsonProperty("createdtime")
	private Long createdtime = null;
	
	@JsonProperty("lastmodifiedtime")
	private Long lastmodifiedtime = null;
	
}
