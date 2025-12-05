package org.egov.hrms.web.contract;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObpasEmployeeSearchCriteria {

	@JsonProperty("uuid")
    private String uuid;
	
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("userUUID")
    private String userUUID;

    @JsonProperty("category")
    private String category;

    @JsonProperty("subcategory")
    private String subcategory;

    @JsonProperty("zone")
    private String zone;

    @JsonProperty("assignedTenantId")
    private String assignedTenantId;

    @JsonProperty("uuids")
    private List<String> uuids;   // optional filter

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("offset")
    private Integer offset;
}
