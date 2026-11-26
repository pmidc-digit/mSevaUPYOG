package org.egov.investpunjab.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.models.InvestPunjabTokenRequest;
import org.egov.investpunjab.models.InvestPunjabTokenResponse;
import org.egov.investpunjab.repository.TokenCacheRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
public class TokenService {

    private final TokenCacheRepository tokenCacheRepository;
    private final InvestPunjabConfiguration config;
    private final RestTemplate restTemplate;
    private final ReentrantLock tokenLock = new ReentrantLock();

    @Autowired
    public TokenService(TokenCacheRepository tokenCacheRepository,
                        InvestPunjabConfiguration config,
                        RestTemplate restTemplate) {
        this.tokenCacheRepository = tokenCacheRepository;
        this.config = config;
        this.restTemplate = restTemplate;
    }

    /**
     * Retrieves a valid token.
     * Uses cached token from Redis if remaining TTL > 30 seconds.
     * Generates a new token if expired or remaining TTL <= 30 seconds.
     */
    public String getValidToken() {
        String tokenKey = config.getTokenCacheKey();
        long minBuffer = config.getTokenMinBufferSeconds();

        String cachedToken = tokenCacheRepository.getCachedToken(tokenKey);
        Long remainingTtl = tokenCacheRepository.getRemainingTtlSeconds(tokenKey);

        if (isTokenValid(cachedToken, remainingTtl, minBuffer)) {
            log.info("Reusing cached Invest Punjab token from Redis. Remaining TTL: {} seconds", remainingTtl);
            return cachedToken;
        }

        // Lock to ensure only one thread generates a new token
        tokenLock.lock();
        try {
            // Double-check after acquiring lock
            cachedToken = tokenCacheRepository.getCachedToken(tokenKey);
            remainingTtl = tokenCacheRepository.getRemainingTtlSeconds(tokenKey);

            if (isTokenValid(cachedToken, remainingTtl, minBuffer)) {
                log.info("Token was refreshed by another thread. Using cached token. Remaining TTL: {} seconds", remainingTtl);
                return cachedToken;
            }

            log.info("Generating new token from Invest Punjab API. Reason: Token missing or remaining TTL ({}s) <= {}s",
                    remainingTtl, minBuffer);

            return fetchAndCacheNewToken(tokenKey);
        } finally {
            tokenLock.unlock();
        }
    }

    /**
     * Force refresh the token (e.g. when external API returns Token Expired error IPBF101).
     */
    public String forceRefreshToken() {
        String tokenKey = config.getTokenCacheKey();
        tokenLock.lock();
        try {
            log.info("Force refreshing Invest Punjab token in Redis...");
            tokenCacheRepository.evictToken(tokenKey);
            return fetchAndCacheNewToken(tokenKey);
        } finally {
            tokenLock.unlock();
        }
    }

    private boolean isTokenValid(String token, Long remainingTtl, long minBuffer) {
        return StringUtils.isNotBlank(token) && remainingTtl != null && remainingTtl > minBuffer;
    }

    private String fetchAndCacheNewToken(String tokenKey) {
        String tokenUrl = config.getBaseUrl() + config.getTokenPath();
        InvestPunjabTokenRequest tokenRequest = InvestPunjabTokenRequest.builder()
                .integrationKey(config.getIntegrationKey())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<InvestPunjabTokenRequest> requestEntity = new HttpEntity<>(tokenRequest, headers);

        try {
            log.info("Calling Invest Punjab Token API: {}", tokenUrl);
            ResponseEntity<InvestPunjabTokenResponse> responseEntity = restTemplate.postForEntity(
                    tokenUrl,
                    requestEntity,
                    InvestPunjabTokenResponse.class
            );

            InvestPunjabTokenResponse responseBody = responseEntity.getBody();
            if (responseBody == null || StringUtils.isBlank(responseBody.getToken())) {
                throw new IllegalStateException("Invest Punjab Token API returned an empty or invalid response.");
            }

            String newToken = responseBody.getToken();
            long expiresIn = (responseBody.getExpiresIn() != null && responseBody.getExpiresIn() > 0)
                    ? responseBody.getExpiresIn()
                    : config.getTokenDefaultTtl();

            // Cache token in Redis with TTL
            tokenCacheRepository.saveToken(tokenKey, newToken, expiresIn);
            log.info("New Invest Punjab token cached successfully with TTL: {} seconds", expiresIn);

            return newToken;
        } catch (Exception e) {
            log.error("Failed to generate token from Invest Punjab API: {}", tokenUrl, e);
            throw new RuntimeException("Invest Punjab Token Generation Failed: " + e.getMessage(), e);
        }
    }
}
