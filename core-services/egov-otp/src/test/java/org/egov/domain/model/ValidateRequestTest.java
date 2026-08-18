package org.egov.domain.model;

import org.egov.domain.exception.InvalidTokenValidateRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ValidateRequestTest {

    @Test
    void test_should_throw_validation_exception_when_tenant_id_is_not_present() {
        ValidateRequest validateRequest = ValidateRequest.builder()
                .otp("otp")
                .tenantId(null)
                .identity("identity")
                .build();

        assertTrue(validateRequest.isTenantIdAbsent());
        assertThrows(InvalidTokenValidateRequestException.class, validateRequest::validate);
    }

    @Test
    void test_should_throw_validation_exception_when_identity_is_not_present() {
        ValidateRequest validateRequest = ValidateRequest.builder()
                .otp("otp")
                .tenantId("tenant")
                .identity(null)
                .build();

        assertTrue(validateRequest.isIdentityAbsent());
        assertThrows(InvalidTokenValidateRequestException.class, validateRequest::validate);
    }

    @Test
    void test_should_throw_validation_exception_when_otp_is_not_present() {
        ValidateRequest validateRequest = ValidateRequest.builder()
                .otp(null)
                .tenantId("tenant")
                .identity("identity")
                .build();

        assertTrue(validateRequest.isOtpAbsent());
        assertThrows(InvalidTokenValidateRequestException.class, validateRequest::validate);
    }

    @Test
    void test_should_not_throw_validation_exception_when_request_has_mandatory_parameters() {
        ValidateRequest validateRequest = ValidateRequest.builder()
                .otp("otp")
                .tenantId("tenant")
                .identity("identity")
                .build();

        assertDoesNotThrow(validateRequest::validate);
    }
}