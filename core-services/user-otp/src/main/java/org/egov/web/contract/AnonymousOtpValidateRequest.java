package org.egov.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousOtpValidateRequest {
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("otp")
    private AnonymousValidateOtp otp;

    public org.egov.domain.model.AnonymousValidateRequest toDomain() {
        return org.egov.domain.model.AnonymousValidateRequest.builder()
                .mobileNumber(otp != null ? otp.getMobileNumber() : null)
                .otp(otp != null ? otp.getOtp() : null)
                .tenantId(otp != null ? otp.getTenantId() : null)
                .build();
    }
}
