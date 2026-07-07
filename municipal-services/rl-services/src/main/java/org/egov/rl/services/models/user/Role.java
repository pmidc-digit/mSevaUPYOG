package org.egov.rl.services.models.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

/**
 * Role
 */

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Role {
	@JsonProperty("id")
	private Long id = null;

	@JsonProperty("name")
	private String name = null;

	@JsonProperty("code")
	private String code = null;

	@JsonProperty("description")
	private String description = null;

	@JsonProperty("createdBy")
	private Long createdBy = null;

	@JsonProperty("createdDate")
	private LocalDate createdDate = null;

	@JsonProperty("lastModifiedBy")
	private Long lastModifiedBy = null;

	@JsonProperty("lastModifiedDate")
	private LocalDate lastModifiedDate = null;

	@JsonProperty("tenantId")
	private String tenantId = null;

}
