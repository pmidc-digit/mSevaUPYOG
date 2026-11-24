package org.egov.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousOtpValidationResponse {
    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("isSuccessful")
    private boolean successful;

    @JsonProperty("isOtpValid")
    private boolean isOtpValid;

    @JsonProperty("message")
    private String message;
}
