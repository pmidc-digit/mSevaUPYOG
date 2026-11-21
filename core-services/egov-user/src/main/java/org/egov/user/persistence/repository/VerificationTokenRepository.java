package org.egov.user.persistence.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.user.persistence.dto.CitizenLoginSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
public class VerificationTokenRepository {

    private static final String REDIS_PREFIX = "CITIZEN_LOGIN_VERIFY:";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, CitizenLoginSession> inMemoryFallback = new ConcurrentHashMap<>();

    @Value("${citizen.login.verification.token.ttl.seconds:180}")
    private long ttlSeconds;

    @Autowired
    public VerificationTokenRepository(@Autowired(required = false) StringRedisTemplate stringRedisTemplate,
                                       ObjectMapper objectMapper) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void saveSession(String token, CitizenLoginSession session) {
        if (StringUtils.isBlank(token) || session == null) {
            log.warn("Attempted to save session with null or blank token/session");
            return;
        }

        String trimmedToken = token.trim();
        try {
            if (stringRedisTemplate != null) {
                String json = objectMapper.writeValueAsString(session);
                stringRedisTemplate.opsForValue().set(REDIS_PREFIX + trimmedToken, json, ttlSeconds, TimeUnit.SECONDS);
                return;
            }
        } catch (Exception e) {
            log.warn("Failed to store verification token in Redis, falling back to in-memory store: {}", e.getMessage());
        }
        inMemoryFallback.put(trimmedToken, session);
    }

    public CitizenLoginSession getSession(String token) {
        if (StringUtils.isBlank(token)) {
            return null;
        }

        String trimmedToken = token.trim();
        try {
            if (stringRedisTemplate != null) {
                String json = stringRedisTemplate.opsForValue().get(REDIS_PREFIX + trimmedToken);
                if (StringUtils.isNotBlank(json)) {
                    return objectMapper.readValue(json, CitizenLoginSession.class);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch verification token from Redis, checking in-memory store: {}", e.getMessage());
        }

        CitizenLoginSession session = inMemoryFallback.get(trimmedToken);
        if (session != null) {
            if (System.currentTimeMillis() - session.getCreatedAt() > (ttlSeconds * 1000)) {
                inMemoryFallback.remove(trimmedToken);
                return null;
            }
            return session;
        }
        return null;
    }

    public void deleteSession(String token) {
        if (StringUtils.isBlank(token)) {
            return;
        }

        String trimmedToken = token.trim();
        try {
            if (stringRedisTemplate != null) {
                stringRedisTemplate.delete(REDIS_PREFIX + trimmedToken);
            }
        } catch (Exception e) {
            log.warn("Failed to delete verification token from Redis: {}", e.getMessage());
        }
        inMemoryFallback.remove(trimmedToken);
    }
}
