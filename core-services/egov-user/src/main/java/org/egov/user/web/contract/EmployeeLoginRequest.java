package org.egov.user.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.egov.common.contract.request.RequestInfo;

import javax.validation.constraints.NotNull;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeLoginRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @NotNull
    private String userName;

    @NotNull
    private String password;

    @NotNull
    private String tenantId;
}
