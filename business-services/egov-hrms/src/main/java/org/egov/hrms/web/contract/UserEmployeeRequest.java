
package org.egov.hrms.web.contract;

import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.model.UserEmployee;
import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Validated
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEmployeeRequest {

    @NotNull
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @Valid
    @NotEmpty
    @JsonProperty("UserEmployees")
    private List<UserEmployee> userEmployees;
}
