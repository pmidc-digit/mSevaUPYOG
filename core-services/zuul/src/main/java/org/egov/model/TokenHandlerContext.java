package org.egov.model;

import lombok.*;

/**
 * Context object to pass token handler information between filters
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenHandlerContext {

    private String sessionId;
    private String authToken;
    private SessionData sessionData;
    private boolean isLoginRequest;
    private boolean isLogoutRequest;
    private boolean sessionCreated;
    private String originalAuthToken;
}
