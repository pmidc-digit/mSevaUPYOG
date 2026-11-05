package org.egov.user.persistence.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CitizenLoginSession {

    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("allowedUuids")
    private List<String> allowedUuids;

    @JsonProperty("createdAt")
    private long createdAt;
}
