
package org.egov.hrms.web.contract;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.hrms.model.UserEmployee;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEmployeeResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("UserEmployees")
    private List<UserEmployee> userEmployees;
}