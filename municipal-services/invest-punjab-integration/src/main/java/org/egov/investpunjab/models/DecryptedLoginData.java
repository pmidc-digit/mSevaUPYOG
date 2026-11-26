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
public class DecryptedLoginData {

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("username")
    private String username;

    @JsonProperty("formIdOrFormName")
    private String formIdOrFormName;

    @JsonProperty("serviceDetail")
    private ServiceDetail serviceDetail;

    @JsonProperty("returnUrl")
    private String returnUrl;

    @JsonProperty("checksum")
    private String checksum;

    @JsonProperty("rawDecryptedText")
    private String rawDecryptedText;
}
