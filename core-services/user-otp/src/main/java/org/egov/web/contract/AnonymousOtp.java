package org.egov.web.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousOtp {
    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("emailId")
    private String emailId;
}
