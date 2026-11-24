package org.egov.persistence.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;
import org.egov.domain.model.AnonymousValidateRequest;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpValidateRequest {
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("otp")
    private Otp otp;

    public OtpValidateRequest(AnonymousValidateRequest validateRequest) {
        this.requestInfo = new RequestInfo();
        this.otp = Otp.builder()
                .identity(validateRequest.getMobileNumber())
                .otp(validateRequest.getOtp())
                .tenantId(validateRequest.getTenantId())
                .build();
    }
}
