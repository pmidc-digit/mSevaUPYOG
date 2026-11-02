package org.egov.user.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.egov.common.contract.request.RequestInfo;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CitizenLoginRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("otp")
    private String otp;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("verificationToken")
    private String verificationToken;

    @JsonProperty("userUuid")
    private String userUuid;
}
