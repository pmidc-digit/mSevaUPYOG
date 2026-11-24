package org.egov.persistence.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.domain.exception.OtpNumberNotPresentException;
import org.egov.domain.model.AnonymousOtpRequest;
import org.egov.domain.model.AnonymousValidateRequest;
import org.egov.domain.model.OtpRequest;
import org.egov.persistence.contract.OtpResponse;
import org.egov.persistence.contract.OtpValidateRequest;
import org.egov.web.contract.AnonymousOtpValidationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class OtpRepository {

    private final String otpCreateUrl;
    private final String otpValidateUrl;
    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    public OtpRepository(RestTemplate restTemplate,
                         String otpHost,
                         String otpCreateUrl) {
        this(restTemplate, otpHost, otpCreateUrl, "/v1/_validate", new ObjectMapper());
    }

    @Autowired
    public OtpRepository(RestTemplate restTemplate,
                         @Value("${otp.host}") String otpHost,
                         @Value("${otp.create.url}") String otpCreateUrl,
                         @Value("${otp.validate.url:/v1/_validate}") String otpValidateUrl,
                         ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.otpCreateUrl = otpHost + otpCreateUrl;
        this.otpValidateUrl = otpHost + otpValidateUrl;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public String fetchOtp(OtpRequest otpRequest) {
        final org.egov.persistence.contract.OtpRequest request =
                new org.egov.persistence.contract.OtpRequest(otpRequest);
        return callOtpCreate(request);
    }

    public String fetchOtp(AnonymousOtpRequest anonymousOtpRequest) {
        final org.egov.persistence.contract.OtpRequest request =
                new org.egov.persistence.contract.OtpRequest(anonymousOtpRequest);
        return callOtpCreate(request);
    }

    private String callOtpCreate(org.egov.persistence.contract.OtpRequest request) {
        try {
            final OtpResponse otpResponse =
                    restTemplate.postForObject(otpCreateUrl, request, OtpResponse.class);
            if (isOtpNumberAbsent(otpResponse)) {
                throw new OtpNumberNotPresentException();
            }
            return otpResponse.getOtpNumber();
        } catch (Exception e) {
            log.error("Exception while fetching OTP: ", e);
            throw new OtpNumberNotPresentException();
        }
    }

    public ResponseEntity<?> validateOtp(AnonymousValidateRequest validateRequest) {
        final OtpValidateRequest request = new OtpValidateRequest(validateRequest);
        try {
            final ResponseEntity<Object> response =
                    restTemplate.postForEntity(otpValidateUrl, request, Object.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                AnonymousOtpValidationResponse successResponse = AnonymousOtpValidationResponse.builder()
                        .responseInfo(null)
                        .successful(true)
                        .isOtpValid(true)
                        .message("OTP has been validated successfully")
                        .build();
                return ResponseEntity.ok(successResponse);
            }
            return response;
        } catch (HttpStatusCodeException e) {
            log.info("OTP validation returned status {} from egov-otp: {}", e.getStatusCode(), e.getResponseBodyAsString());
            try {
                Object errorBody = objectMapper.readValue(e.getResponseBodyAsString(), Object.class);
                return ResponseEntity.status(e.getStatusCode()).body(errorBody);
            } catch (Exception parseEx) {
                return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
            }
        } catch (Exception e) {
            log.error("Exception while validating OTP: ", e);
            throw e;
        }
    }

    private boolean isOtpNumberAbsent(OtpResponse otpResponse) {
        return otpResponse == null || otpResponse.isOtpNumberAbsent();
    }
}
