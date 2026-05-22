package org.egov.web.contract;

import org.egov.domain.model.OtpRequestType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class OtpRequestTest {

    @Test
    void shouldMapFromContractToDomain() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "register",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertNotNull(domainOtpRequest);

        assertEquals(
                "mobileNumber",
                domainOtpRequest.getMobileNumber()
        );

        assertEquals(
                "tenantId",
                domainOtpRequest.getTenantId()
        );

        assertEquals(
                OtpRequestType.REGISTER,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToRegisterWhenTypeNotExplicitlySpecified() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                null,
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertEquals(
                OtpRequestType.REGISTER,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToNullWhenTypeIsUnknown() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "unknown",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertNull(domainOtpRequest.getType());
    }

    @Test
    void shouldSetRequestTypeToRegisterWhenTypeIsRegister() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "regisTER",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertEquals(
                OtpRequestType.REGISTER,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToPasswordResetWhenTypeIsPasswordReset() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "passwordRESET",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertEquals(
                OtpRequestType.PASSWORD_RESET,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToLoginWhenTypeIsLoginUpperCase() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "LOGIN",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertEquals(
                OtpRequestType.LOGIN,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToLoginWhenTypeIsLoginLowerCase() {

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                "login",
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

        assertEquals(
                OtpRequestType.LOGIN,
                domainOtpRequest.getType()
        );
    }
}