package org.egov.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;

/**
 * Model class to store session data in Redis
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "authToken")
public class SessionData implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("sessionId")
    private String sessionId;

    @JsonProperty("authToken")
    private String authToken;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("userType")
    private String userType;

    @JsonProperty("createdAt")
    private Instant createdAt;

    @JsonProperty("lastAccessedAt")
    private Instant lastAccessedAt;

    @JsonProperty("expiresAt")
    private Instant expiresAt;

    @JsonProperty("ipAddress")
    private String ipAddress;

    @JsonProperty("userAgent")
    private String userAgent;
}
