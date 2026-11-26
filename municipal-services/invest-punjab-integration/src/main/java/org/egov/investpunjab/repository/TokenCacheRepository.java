package org.egov.investpunjab.repository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Repository
public class TokenCacheRepository {

    private final StringRedisTemplate stringRedisTemplate;
    
    // In-memory fallback cache if Redis server is down or unreachable locally
    private final Map<String, InMemoryTokenEntry> inMemoryFallback = new ConcurrentHashMap<>();

    @Data
    @AllArgsConstructor
    private static class InMemoryTokenEntry {
        private String token;
        private long expiryEpochMillis;
    }

    @Autowired
    public TokenCacheRepository(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    /**
     * Get cached token from Redis, with transparent fallback to in-memory cache if Redis is down.
     */
    public String getCachedToken(String key) {
        try {
            return stringRedisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("Redis is unavailable (localhost:6379). Using in-memory fallback cache for key '{}'. Reason: {}",
                    key, e.getMessage());
            InMemoryTokenEntry entry = inMemoryFallback.get(key);
            if (entry != null && System.currentTimeMillis() < entry.getExpiryEpochMillis()) {
                return entry.getToken();
            }
            return null;
        }
    }

    /**
     * Get remaining TTL of token in seconds from Redis or in-memory fallback.
     */
    public Long getRemainingTtlSeconds(String key) {
        try {
            return stringRedisTemplate.getExpire(key, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Redis is unavailable. Fetching TTL from in-memory fallback for key '{}'.", key);
            InMemoryTokenEntry entry = inMemoryFallback.get(key);
            if (entry != null) {
                long remainingMillis = entry.getExpiryEpochMillis() - System.currentTimeMillis();
                if (remainingMillis > 0) {
                    return remainingMillis / 1000;
                }
            }
            return null;
        }
    }

    /**
     * Store token with TTL in seconds. Saves to Redis, and mirrors in-memory for resilience.
     */
    public void saveToken(String key, String token, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            ttlSeconds = 3600; // fallback to 1 hour default
        }

        // Always save in local fallback
        long expiryEpochMillis = System.currentTimeMillis() + (ttlSeconds * 1000);
        inMemoryFallback.put(key, new InMemoryTokenEntry(token, expiryEpochMillis));

        // Attempt Redis save
        try {
            stringRedisTemplate.opsForValue().set(key, token, ttlSeconds, TimeUnit.SECONDS);
            log.info("Token successfully saved to Redis under key '{}' with TTL {} seconds", key, ttlSeconds);
        } catch (Exception e) {
            log.warn("Redis is unavailable. Saved token to in-memory fallback cache with TTL {} seconds.", ttlSeconds);
        }
    }

    /**
     * Invalidate/remove token from Redis and in-memory cache.
     */
    public void evictToken(String key) {
        inMemoryFallback.remove(key);
        try {
            stringRedisTemplate.delete(key);
            log.info("Evicted token from Redis for key '{}'", key);
        } catch (Exception e) {
            log.warn("Redis is unavailable. Evicted token from in-memory fallback for key '{}'.", key);
        }
    }
}
