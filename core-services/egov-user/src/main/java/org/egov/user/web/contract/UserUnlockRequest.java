package org.egov.user.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.egov.common.contract.request.RequestInfo;
import org.egov.user.domain.model.enums.UserType;

import javax.validation.Valid;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUnlockRequest {

    @JsonProperty("RequestInfo")
    @Valid
    private RequestInfo requestInfo;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("id")
    private Long id;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("userType")
    private UserType userType;

    @JsonProperty("requestInfo")
    public void setRequestInfoLower(RequestInfo requestInfo) {
        this.requestInfo = requestInfo;
    }
}
