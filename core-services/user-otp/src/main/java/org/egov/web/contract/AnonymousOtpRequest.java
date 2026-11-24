package org.egov.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousOtpRequest {
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("otp")
    private AnonymousOtp otp;

    public org.egov.domain.model.AnonymousOtpRequest toDomain() {
        return org.egov.domain.model.AnonymousOtpRequest.builder()
                .mobileNumber(otp != null ? otp.getMobileNumber() : null)
                .tenantId(otp != null ? otp.getTenantId() : null)
                .emailId(otp != null ? otp.getEmailId() : null)
                .build();
    }
}
