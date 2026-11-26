package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabTokenResponse {

    @JsonProperty("token")
    private String token;

    @JsonProperty("expiresIn")
    private Long expiresIn;

    @JsonProperty("expiresAt")
    private String expiresAt;
}
