package org.egov.investpunjab.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.models.InvestPunjabCafRequest;
import org.egov.investpunjab.models.InvestPunjabCafResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class InvestPunjabCafService {

    private final TokenService tokenService;
    private final InvestPunjabConfiguration config;
    private final RestTemplate restTemplate;

    @Autowired
    public InvestPunjabCafService(TokenService tokenService,
                                  InvestPunjabConfiguration config,
                                  RestTemplate restTemplate) {
        this.tokenService = tokenService;
        this.config = config;
        this.restTemplate = restTemplate;
    }

    /**
     * Calls Invest Punjab FastTrack API to fetch applicant / Common Application Form (CAF) details using iPin.
     * Uses cached token from Redis. If token has expired or call gets 401, refreshes token and retries.
     */
    public InvestPunjabCafResponse getCafData(String iPin) {
        if (StringUtils.isBlank(iPin)) {
            throw new IllegalArgumentException("iPin must not be empty or null.");
        }

        String url = config.getBaseUrl() + config.getCafPath();
        String token = tokenService.getValidToken();

        try {
            return executeCafApiCall(url, token, iPin);
        } catch (HttpClientErrorException.Unauthorized ue) {
            log.warn("Invest Punjab CAF API returned 401 Unauthorized. Evicting token and retrying with fresh token...", ue);
            String freshToken = tokenService.forceRefreshToken();
            return executeCafApiCall(url, freshToken, iPin);
        } catch (Exception e) {
            log.error("Failed to fetch CAF data from Invest Punjab for iPin: {}", iPin, e);
            throw new RuntimeException("Invest Punjab CAF Data fetch failed: " + e.getMessage(), e);
        }
    }

    private InvestPunjabCafResponse executeCafApiCall(String url, String token, String iPin) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", token);

        InvestPunjabCafRequest request = InvestPunjabCafRequest.builder()
                .iPin(iPin.trim())
                .build();

        HttpEntity<InvestPunjabCafRequest> entity = new HttpEntity<>(request, headers);

        log.info("Calling Invest Punjab CAF API: {} for iPin: {}", url, iPin);
        ResponseEntity<InvestPunjabCafResponse> responseEntity = restTemplate.postForEntity(
                url,
                entity,
                InvestPunjabCafResponse.class
        );

        return responseEntity.getBody();
    }
}
