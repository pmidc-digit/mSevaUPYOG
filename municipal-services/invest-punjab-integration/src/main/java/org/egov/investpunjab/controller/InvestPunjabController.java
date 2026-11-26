package org.egov.investpunjab.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.models.DecryptedLoginData;
import org.egov.investpunjab.models.InvestPunjabCafRequest;
import org.egov.investpunjab.models.InvestPunjabCafResponse;
import org.egov.investpunjab.models.InvestPunjabStatusUpdateRequest;
import org.egov.investpunjab.models.InvestPunjabStatusUpdateResponse;
import org.egov.investpunjab.models.InvestPunjabTokenResponse;
import org.egov.investpunjab.repository.TokenCacheRepository;
import org.egov.investpunjab.service.EncryptionService;
import org.egov.investpunjab.service.InvestPunjabCafService;
import org.egov.investpunjab.service.InvestPunjabStatusService;
import org.egov.investpunjab.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1")
public class InvestPunjabController {

    private final InvestPunjabStatusService statusService;
    private final TokenService tokenService;
    private final InvestPunjabCafService cafService;
    private final EncryptionService encryptionService;
    private final TokenCacheRepository tokenCacheRepository;
    private final InvestPunjabConfiguration config;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    public InvestPunjabController(InvestPunjabStatusService statusService,
                                  TokenService tokenService,
                                  InvestPunjabCafService cafService,
                                  EncryptionService encryptionService,
                                  TokenCacheRepository tokenCacheRepository,
                                  InvestPunjabConfiguration config,
                                  com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.statusService = statusService;
        this.tokenService = tokenService;
        this.cafService = cafService;
        this.encryptionService = encryptionService;
        this.tokenCacheRepository = tokenCacheRepository;
        this.config = config;
        this.objectMapper = objectMapper;
    }

    /**
     * Update application status on Invest Punjab FastTrack portal.
     */
    @PostMapping("/status/_update")
    public ResponseEntity<InvestPunjabStatusUpdateResponse> updateStatus(
            @Valid @RequestBody InvestPunjabStatusUpdateRequest request) {
        log.info("Received REST status update request: serviceType={}, iPin={}, appId={}",
                request.getServiceType(),
                (request.getPayload() != null) ? request.getPayload().getIPin() : "null",
                (request.getPayload() != null) ? request.getPayload().getAppId() : "null");
        try {
            log.debug("DEBUG REST Incoming Status Update Request:\n{}",
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(request));
        } catch (Exception ignored) {}

        InvestPunjabStatusUpdateResponse response = statusService.updateStatus(request);

        try {
            log.debug("DEBUG REST Outgoing Status Update Response:\n{}",
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(response));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(response);
    }

    /**
     * Get the current valid Invest Punjab token (from Redis cache or fresh generation if remaining TTL <= 30s).
     */
    @PostMapping("/token/_get")
    public ResponseEntity<InvestPunjabTokenResponse> getToken() {
        String token = tokenService.getValidToken();
        Long remainingTtl = tokenCacheRepository.getRemainingTtlSeconds(config.getTokenCacheKey());
        String expiresAt = (remainingTtl != null)
                ? java.time.LocalDateTime.now().plusSeconds(remainingTtl)
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                : null;

        InvestPunjabTokenResponse response = InvestPunjabTokenResponse.builder()
                .token(token)
                .expiresIn(remainingTtl)
                .expiresAt(expiresAt)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Force refresh the Invest Punjab token in Redis.
     */
    @PostMapping("/token/_refresh")
    public ResponseEntity<InvestPunjabTokenResponse> refreshToken() {
        String token = tokenService.forceRefreshToken();
        Long remainingTtl = tokenCacheRepository.getRemainingTtlSeconds(config.getTokenCacheKey());
        String expiresAt = (remainingTtl != null)
                ? java.time.LocalDateTime.now().plusSeconds(remainingTtl)
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                : null;

        InvestPunjabTokenResponse response = InvestPunjabTokenResponse.builder()
                .token(token)
                .expiresIn(remainingTtl)
                .expiresAt(expiresAt)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Fetch Common Application Form (CAF) applicant details using iPin (Step 5 of PDF).
     */
    @PostMapping("/applicant/_get")
    public ResponseEntity<InvestPunjabCafResponse> getApplicantDetails(
            @Valid @RequestBody InvestPunjabCafRequest request) {
        log.info("Fetching applicant CAF details for iPin: {}", request.getIPin());
        InvestPunjabCafResponse response = cafService.getCafData(request.getIPin());
        return ResponseEntity.ok(response);
    }

    /**
     * Decrypts AES-128-ECB encrypted login payload from Invest Punjab portal (Step 1 & 2 of PDF).
     */
    @PostMapping("/auth/_decrypt")
    public ResponseEntity<DecryptedLoginData> decryptLoginPayload(
            @RequestBody Map<String, String> request) {
        String encryptedMessage = request.get("encryptedMessage");
        if (encryptedMessage == null) {
            encryptedMessage = request.get("msg");
        }
        String decrypted = encryptionService.decryptAesEcb(encryptedMessage);
        DecryptedLoginData parsed = encryptionService.parseLoginMessage(decrypted);
        return ResponseEntity.ok(parsed);
    }

    /**
     * Generates or validates HMAC checksum using configured secret key (Step 3 of PDF).
     */
    @PostMapping("/checksum/_calculate")
    public ResponseEntity<Map<String, String>> calculateChecksum(
            @RequestBody Map<String, String> request) {
        String data = request.get("data");
        String checksum = encryptionService.calculateHmac(data);
        Map<String, String> response = new HashMap<>();
        response.put("data", data);
        response.put("checksum", checksum);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "invest-punjab-integration");
        health.put("redisCachedTokenRemainingTtl",
                tokenCacheRepository.getRemainingTtlSeconds(config.getTokenCacheKey()));
        return ResponseEntity.ok(health);
    }
}
