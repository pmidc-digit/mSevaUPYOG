
package org.egov.hrms.web.contract;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotNull;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class UserEmployeeSearchCriteria {

    @NotNull
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("ids")
    private List<Long> ids;

    @JsonProperty("category")
    private String category;

    @JsonProperty("subcategory")
    private String subcategory;

    @JsonProperty("zone")
    private String zone;

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("sortBy")
    private String sortBy;

    @JsonProperty("sortOrder")
    private String sortOrder; // ASC/DESC
}
