
package org.egov.hrms.web.contract;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import org.springframework.validation.annotation.Validated;

@Validated
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEmployeeSearchRequest {

    @NotNull
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    /**
     * Wrap all search parameters inside criteria.
     * This avoids duplication and keeps controller/service signatures stable.
     */
    @Valid
    @NotNull
    @JsonProperty("criteria")
    private UserEmployeeSearchCriteria criteria;
}
