package org.egov.investpunjab.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.constants.InvestPunjabConstants;
import org.egov.investpunjab.models.InvestPunjabEventResult;
import org.egov.investpunjab.models.InvestPunjabStatusUpdatePayload;
import org.egov.investpunjab.models.InvestPunjabStatusUpdateRequest;
import org.egov.investpunjab.models.InvestPunjabStatusUpdateResponse;
import org.egov.investpunjab.producer.InvestPunjabKafkaProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
public class InvestPunjabStatusService {

    private final TokenService tokenService;
    private final InvestPunjabConfiguration config;
    private final InvestPunjabKafkaProducer kafkaProducer;
    private final RestTemplate restTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private static final DateTimeFormatter REQUIRED_DATE_FORMAT =
            DateTimeFormatter.ofPattern(InvestPunjabConstants.DATE_TIME_FORMAT);

    @Autowired
    public InvestPunjabStatusService(TokenService tokenService,
                                     InvestPunjabConfiguration config,
                                     InvestPunjabKafkaProducer kafkaProducer,
                                     RestTemplate restTemplate,
                                     com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.tokenService = tokenService;
        this.config = config;
        this.kafkaProducer = kafkaProducer;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Core method to process and push status updates to Invest Punjab FastTrack portal.
     * Handles payload normalization, token fetch from Redis, API call, token expiry retry,
     * and Kafka event broadcasting (Success & Error topics).
     */
    public InvestPunjabStatusUpdateResponse updateStatus(InvestPunjabStatusUpdateRequest request) {
        long startTime = System.currentTimeMillis();
        String eventId = UUID.randomUUID().toString();

        if (request == null || request.getPayload() == null) {
            String errorMsg = "InvestPunjabStatusUpdateRequest or payload is null.";
            log.error(errorMsg);
            publishFailureEvent(eventId, request, null, errorMsg, InvestPunjabConstants.IPBF104, 0L);
            return InvestPunjabStatusUpdateResponse.builder()
                    .status(false)
                    .msg(errorMsg)
                    .errorCode(InvestPunjabConstants.IPBF104)
                    .build();
        }

        InvestPunjabStatusUpdatePayload payload = request.getPayload();
        normalizePayload(payload);

        String url = config.getBaseUrl() + config.getStatusPath();
        String token = tokenService.getValidToken();

        try {
            String prettyPayload = "{}";
            try {
                prettyPayload = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload);
            } catch (Exception e) {
                prettyPayload = objectMapper.writeValueAsString(payload);
            }

            log.info("\n==================== [INVEST PUNJAB STATUS UPDATE - REQUEST] ====================\n" +
                    "URL      : {}\n" +
                    "Method   : POST\n" +
                    "iPin     : {} | AppId: {} | StatusId: {} ({})\n" +
                    "Token    : {}\n" +
                    "Payload  :\n{}\n" +
                    "=================================================================================",
                    url,
                    payload.getIPin(), payload.getAppId(), payload.getStatusId(), payload.getStatusDesc(),
                    (token != null && token.length() > 30) ? token.substring(0, 30) + "...[PROTECTED]" : token,
                    prettyPayload);

            log.debug("DEBUG Outgoing Status Payload (compact JSON): {}", objectMapper.writeValueAsString(payload));

            InvestPunjabStatusUpdateResponse response = executeStatusUpdateApi(url, token, payload);

            // Handle potential token expiry returned in response body
            if (response != null && InvestPunjabConstants.IPBF101.equalsIgnoreCase(response.getErrorCode())) {
                log.warn("Invest Punjab API reported Token Expired (IPBF101). Evicting Redis cache and retrying with fresh token...");
                token = tokenService.forceRefreshToken();
                response = executeStatusUpdateApi(url, token, payload);
            }

            long durationMs = System.currentTimeMillis() - startTime;

            if (response != null && Boolean.TRUE.equals(response.getStatus())) {
                log.info("Successfully updated status on Invest Punjab for iPin: {}. Time: {}ms",
                        payload.getIPin(), durationMs);
                publishSuccessEvent(eventId, request, response, durationMs);
                return response;
            } else {
                String errorMsg = response != null ? response.getMsg() : "Unknown response from Invest Punjab API";
                String errCode = response != null ? response.getErrorCode() : InvestPunjabConstants.IPBF110;
                log.error("Invest Punjab status update rejected: {} (ErrorCode: {})", errorMsg, errCode);
                publishFailureEvent(eventId, request, response, errorMsg, errCode, durationMs);
                return response;
            }

        } catch (HttpClientErrorException.Unauthorized ue) {
            log.warn("Invest Punjab status API returned 401 Unauthorized. Retrying once with fresh token...", ue);
            try {
                String freshToken = tokenService.forceRefreshToken();
                InvestPunjabStatusUpdateResponse retryResponse = executeStatusUpdateApi(url, freshToken, payload);
                long durationMs = System.currentTimeMillis() - startTime;
                if (retryResponse != null && Boolean.TRUE.equals(retryResponse.getStatus())) {
                    publishSuccessEvent(eventId, request, retryResponse, durationMs);
                    return retryResponse;
                } else {
                    String msg = retryResponse != null ? retryResponse.getMsg() : "Failed after retry";
                    publishFailureEvent(eventId, request, retryResponse, msg, InvestPunjabConstants.IPBF101, durationMs);
                    return retryResponse;
                }
            } catch (Exception retryEx) {
                long durationMs = System.currentTimeMillis() - startTime;
                log.error("Retry failed for status update", retryEx);
                publishFailureEvent(eventId, request, null, retryEx.getMessage(), InvestPunjabConstants.IPBF101, durationMs);
                return InvestPunjabStatusUpdateResponse.builder()
                        .status(false)
                        .msg("Status update failed after token refresh retry: " + retryEx.getMessage())
                        .errorCode(InvestPunjabConstants.IPBF101)
                        .build();
            }
        } catch (Exception ex) {
            long durationMs = System.currentTimeMillis() - startTime;
            log.error("Exception calling Invest Punjab status update API", ex);
            publishFailureEvent(eventId, request, null, ex.getMessage(), InvestPunjabConstants.IPBF110, durationMs);
            return InvestPunjabStatusUpdateResponse.builder()
                    .status(false)
                    .msg("Exception calling Invest Punjab API: " + ex.getMessage())
                    .errorCode(InvestPunjabConstants.IPBF110)
                    .build();
        }
    }

    private InvestPunjabStatusUpdateResponse executeStatusUpdateApi(String url, String token, InvestPunjabStatusUpdatePayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", token);

        HttpEntity<InvestPunjabStatusUpdatePayload> entity = new HttpEntity<>(payload, headers);
        long callStart = System.currentTimeMillis();

        try {
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, entity, String.class);
            long callDuration = System.currentTimeMillis() - callStart;
            String rawBody = responseEntity.getBody();

            log.info("\n==================== [INVEST PUNJAB STATUS UPDATE - RESPONSE] ====================\n" +
                    "URL         : {}\n" +
                    "HTTP Status : {}\n" +
                    "Duration    : {} ms\n" +
                    "Raw Body    : {}\n" +
                    "==================================================================================",
                    url,
                    responseEntity.getStatusCodeValue(),
                    callDuration,
                    rawBody);

            log.debug("DEBUG Invest Punjab Raw Response: {}", rawBody);

            if (StringUtils.isNotBlank(rawBody)) {
                InvestPunjabStatusUpdateResponse parsed = objectMapper.readValue(rawBody, InvestPunjabStatusUpdateResponse.class);
                log.debug("DEBUG Parsed Status Response: status={}, msg={}, code={}",
                        parsed.getStatus(), parsed.getMsg(), parsed.getErrorCode());
                return parsed;
            }
        } catch (HttpClientErrorException ce) {
            long callDuration = System.currentTimeMillis() - callStart;
            log.error("\n==================== [INVEST PUNJAB STATUS UPDATE - HTTP ERROR] ====================\n" +
                    "URL         : {}\n" +
                    "HTTP Status : {}\n" +
                    "Duration    : {} ms\n" +
                    "Error Body  : {}\n" +
                    "====================================================================================",
                    url,
                    ce.getRawStatusCode(),
                    callDuration,
                    ce.getResponseBodyAsString());
            log.debug("DEBUG Invest Punjab HTTP Error Body: {}", ce.getResponseBodyAsString());
            try {
                return objectMapper.readValue(ce.getResponseBodyAsString(), InvestPunjabStatusUpdateResponse.class);
            } catch (Exception ignored) {}
            throw ce;
        } catch (Exception ex) {
            log.error("Exception in executeStatusUpdateApi calling {}: {}", url, ex.getMessage(), ex);
            throw new RuntimeException(ex);
        }

        return null;
    }

    private void normalizePayload(InvestPunjabStatusUpdatePayload payload) {
        // Enforce Date format: YYYY-MM-DD HH:MM:SS
        if (StringUtils.isBlank(payload.getStatusDate())) {
            payload.setStatusDate(LocalDateTime.now().format(REQUIRED_DATE_FORMAT));
        } else {
            String dateStr = payload.getStatusDate().trim();
            // If only date is provided (YYYY-MM-DD), append 00:00:00
            if (dateStr.length() == 10 && dateStr.contains("-")) {
                payload.setStatusDate(dateStr + " 00:00:00");
            }
        }

        // Fill statusDesc if missing
        if (StringUtils.isBlank(payload.getStatusDesc()) && payload.getStatusId() != null) {
            String defaultDesc = InvestPunjabConstants.STATUS_NAME_MAP.get(payload.getStatusId());
            if (StringUtils.isNotBlank(defaultDesc)) {
                payload.setStatusDesc(defaultDesc);
            }
        }

        // Default mandatory fields per spec
        if (StringUtils.isBlank(payload.getIntegrationSource())) {
            payload.setIntegrationSource(config.getDefaultSource());
        }
        if (StringUtils.isBlank(payload.getComments())) {
            payload.setComments("NA");
        }
        if (StringUtils.isBlank(payload.getSenderDesignation())) {
            payload.setSenderDesignation("NA");
        }
        if (StringUtils.isBlank(payload.getReceiverName())) {
            payload.setReceiverName("NA");
        }
        if (StringUtils.isBlank(payload.getReceiverDesignation())) {
            payload.setReceiverDesignation("NA");
        }
        if (StringUtils.isBlank(payload.getClearanceIssuedOn())) {
            payload.setClearanceIssuedOn("NA");
        }
        if (StringUtils.isBlank(payload.getClearanceExpiredOn())) {
            payload.setClearanceExpiredOn("NA");
        }
        if (StringUtils.isBlank(payload.getLicenseNo())) {
            payload.setLicenseNo("NA");
        }
        if (StringUtils.isBlank(payload.getClearanceFile())) {
            payload.setClearanceFile("NA");
        }
        if (StringUtils.isBlank(payload.getDeemedApproval())) {
            payload.setDeemedApproval("false");
        }
        if (payload.getIntAppId() == null) {
            payload.setIntAppId(1);
        }
        if (payload.getAppActionLogId() == null) {
            payload.setAppActionLogId(1);
        }
        if (payload.getProcessDays() == null) {
            payload.setProcessDays(0);
        }
        if (payload.getActionSlno() == null) {
            payload.setActionSlno(1);
        }
        if (payload.getTotalActionsOnApplication() == null) {
            payload.setTotalActionsOnApplication(1);
        }
    }

    private void publishSuccessEvent(String eventId,
                                     InvestPunjabStatusUpdateRequest request,
                                     InvestPunjabStatusUpdateResponse response,
                                     long durationMs) {
        InvestPunjabStatusUpdatePayload p = request.getPayload();
        InvestPunjabEventResult event = InvestPunjabEventResult.builder()
                .eventId(eventId)
                .timestamp(System.currentTimeMillis())
                .eventType("SUCCESS")
                .tenantId(request.getTenantId())
                .serviceType(request.getServiceType())
                .serviceCode(request.getServiceCode())
                .iPin(p != null ? p.getIPin() : null)
                .appId(p != null ? p.getAppId() : null)
                .statusId(p != null ? p.getStatusId() : null)
                .statusDesc(p != null ? p.getStatusDesc() : null)
                .payload(p)
                .response(response)
                .executionTimeMs(durationMs)
                .build();

        kafkaProducer.pushSuccessEvent(event);
    }

    private void publishFailureEvent(String eventId,
                                     InvestPunjabStatusUpdateRequest request,
                                     InvestPunjabStatusUpdateResponse response,
                                     String errorMessage,
                                     String errorCode,
                                     long durationMs) {
        InvestPunjabStatusUpdatePayload p = (request != null) ? request.getPayload() : null;
        InvestPunjabEventResult event = InvestPunjabEventResult.builder()
                .eventId(eventId)
                .timestamp(System.currentTimeMillis())
                .eventType("FAILED")
                .tenantId(request != null ? request.getTenantId() : null)
                .serviceType(request != null ? request.getServiceType() : null)
                .serviceCode(request != null ? request.getServiceCode() : null)
                .iPin(p != null ? p.getIPin() : null)
                .appId(p != null ? p.getAppId() : null)
                .statusId(p != null ? p.getStatusId() : null)
                .statusDesc(p != null ? p.getStatusDesc() : null)
                .payload(p)
                .response(response)
                .errorMessage(errorMessage)
                .errorCode(errorCode)
                .executionTimeMs(durationMs)
                .build();

        kafkaProducer.pushErrorEvent(event);
    }
}
