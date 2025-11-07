package org.egov.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.model.SessionData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Service to manage session data in Redis
 */
@Service
@Slf4j
public class SessionStoreService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${zuul.token.handler.session.timeout:3600}")
    private Long sessionTimeout;

    @Value("${zuul.token.handler.enabled:true}")
    private Boolean tokenHandlerEnabled;

    private static final String SESSION_PREFIX = "session:";
    private static final String AUTH_TOKEN_PREFIX = "authtoken:";

    /**
     * Create a new session with auth token
     */
    public SessionData createSession(String authToken, String userId, String tenantId,
                                     String userType, String ipAddress, String userAgent) {
        String sessionId = generateSessionId();

        SessionData sessionData = SessionData.builder()
                .sessionId(sessionId)
                .authToken(authToken)
                .userId(userId)
                .tenantId(tenantId)
                .userType(userType)
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(sessionTimeout))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        // Store session data
        String sessionKey = SESSION_PREFIX + sessionId;
        redisTemplate.opsForValue().set(sessionKey, sessionData, sessionTimeout, TimeUnit.SECONDS);

        // Store reverse mapping: authToken -> sessionId for quick lookup
        String authTokenKey = AUTH_TOKEN_PREFIX + authToken;
        redisTemplate.opsForValue().set(authTokenKey, sessionId, sessionTimeout, TimeUnit.SECONDS);

        log.info("Created session: {} for user: {}", sessionId, userId);
        return sessionData;
    }

    /**
     * Get session data by session ID
     */
    public SessionData getSession(String sessionId) {
        if (sessionId == null) {
            return null;
        }

        String sessionKey = SESSION_PREFIX + sessionId;
        Object sessionObj = redisTemplate.opsForValue().get(sessionKey);

        if (sessionObj == null) {
            log.debug("Session not found: {}", sessionId);
            return null;
        }

        SessionData sessionData = objectMapper.convertValue(sessionObj, SessionData.class);

        // Update last accessed time
        sessionData.setLastAccessedAt(Instant.now());
        refreshSession(sessionId, sessionData);

        return sessionData;
    }

    /**
     * Get session data by auth token
     */
    public SessionData getSessionByAuthToken(String authToken) {
        if (authToken == null) {
            return null;
        }

        String authTokenKey = AUTH_TOKEN_PREFIX + authToken;
        String sessionId = (String) redisTemplate.opsForValue().get(authTokenKey);

        if (sessionId == null) {
            log.debug("No session found for auth token");
            return null;
        }

        return getSession(sessionId);
    }

    /**
     * Update session with new auth token (for token refresh scenarios)
     */
    public void updateSessionAuthToken(String sessionId, String newAuthToken) {
        SessionData sessionData = getSession(sessionId);
        if (sessionData != null) {
            String oldAuthToken = sessionData.getAuthToken();

            // Remove old auth token mapping
            if (oldAuthToken != null) {
                redisTemplate.delete(AUTH_TOKEN_PREFIX + oldAuthToken);
            }

            // Update session with new auth token
            sessionData.setAuthToken(newAuthToken);
            sessionData.setLastAccessedAt(Instant.now());

            String sessionKey = SESSION_PREFIX + sessionId;
            redisTemplate.opsForValue().set(sessionKey, sessionData, sessionTimeout, TimeUnit.SECONDS);

            // Create new auth token mapping
            String authTokenKey = AUTH_TOKEN_PREFIX + newAuthToken;
            redisTemplate.opsForValue().set(authTokenKey, sessionId, sessionTimeout, TimeUnit.SECONDS);

            log.info("Updated session: {} with new auth token", sessionId);
        }
    }

    /**
     * Refresh session timeout
     */
    public void refreshSession(String sessionId, SessionData sessionData) {
        if (sessionId == null || sessionData == null) {
            return;
        }

        String sessionKey = SESSION_PREFIX + sessionId;
        sessionData.setExpiresAt(Instant.now().plusSeconds(sessionTimeout));
        redisTemplate.opsForValue().set(sessionKey, sessionData, sessionTimeout, TimeUnit.SECONDS);

        // Also refresh auth token mapping
        if (sessionData.getAuthToken() != null) {
            String authTokenKey = AUTH_TOKEN_PREFIX + sessionData.getAuthToken();
            redisTemplate.expire(authTokenKey, sessionTimeout, TimeUnit.SECONDS);
        }
    }

    /**
     * Delete session and cleanup
     */
    public void deleteSession(String sessionId) {
        if (sessionId == null) {
            return;
        }

        SessionData sessionData = getSession(sessionId);
        if (sessionData != null) {
            // Remove auth token mapping
            if (sessionData.getAuthToken() != null) {
                redisTemplate.delete(AUTH_TOKEN_PREFIX + sessionData.getAuthToken());
            }
        }

        // Remove session
        redisTemplate.delete(SESSION_PREFIX + sessionId);

        log.info("Deleted session: {}", sessionId);
    }

    /**
     * Delete session by auth token
     */
    public void deleteSessionByAuthToken(String authToken) {
        if (authToken == null) {
            return;
        }

        String authTokenKey = AUTH_TOKEN_PREFIX + authToken;
        String sessionId = (String) redisTemplate.opsForValue().get(authTokenKey);

        if (sessionId != null) {
            deleteSession(sessionId);
        }
    }

    /**
     * Validate if session is active and not expired
     */
    public boolean isSessionValid(String sessionId) {
        SessionData sessionData = getSession(sessionId);
        if (sessionData == null) {
            return false;
        }

        return sessionData.getExpiresAt().isAfter(Instant.now());
    }

    /**
     * Generate a unique session ID
     */
    private String generateSessionId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Check if token handler is enabled
     */
    public boolean isTokenHandlerEnabled() {
        return tokenHandlerEnabled;
    }

    /**
     * Get session timeout in seconds
     */
    public Long getSessionTimeout() {
        return sessionTimeout;
    }
}
