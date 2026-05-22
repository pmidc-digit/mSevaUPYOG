package org.egov.domain.model;

import org.egov.domain.exception.InvalidOtpRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpRequestTest {

    @Test
    void shouldThrowValidationExceptionWhenTenantIdIsNotPresent() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId(null)
                .mobileNumber("mobile number")
                .build();

        assertTrue(otpRequest.isTenantIdAbsent());

        assertThrows(
                InvalidOtpRequestException.class,
                otpRequest::validate
        );
    }

    @Test
    void shouldThrowValidationExceptionWhenMobileNumberIsNotPresent() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber(null)
                .build();

        assertTrue(otpRequest.isMobileNumberAbsent());

        assertThrows(
                InvalidOtpRequestException.class,
                otpRequest::validate
        );
    }

    @Test
    void shouldThrowValidationExceptionWhenTypeIsNotPresent() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .type(null)
                .build();

        assertTrue(otpRequest.isInvalidType());

        assertThrows(
                InvalidOtpRequestException.class,
                otpRequest::validate
        );
    }

    @Test
    void validateShouldNotThrowExceptionForValidRegisterRequest() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("1234567890")
                .type(OtpRequestType.REGISTER)
                .build();

        assertDoesNotThrow(otpRequest::validate);
    }

    @Test
    void validateShouldNotThrowExceptionForValidLoginRequest() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("1234567890")
                .type(OtpRequestType.LOGIN)
                .build();

        assertDoesNotThrow(otpRequest::validate);
    }

    @Test
    void shouldReturnTrueWhenRequestTypeLogin() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .type(OtpRequestType.LOGIN)
                .build();

        assertTrue(otpRequest.isLoginRequestType());
        assertFalse(otpRequest.isRegistrationRequestType());
    }

    @Test
    void shouldThrowValidationExceptionWhenMobileNumberIsInvalid() {

        OtpRequest otpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .type(OtpRequestType.LOGIN)
                .build();

        assertThrows(
                InvalidOtpRequestException.class,
                otpRequest::validate
        );
    }
}