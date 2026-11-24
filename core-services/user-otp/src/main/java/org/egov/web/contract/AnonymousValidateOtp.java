package org.egov.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousValidateOtp {
    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("otp")
    private String otp;

    @JsonProperty("tenantId")
    private String tenantId;
}
