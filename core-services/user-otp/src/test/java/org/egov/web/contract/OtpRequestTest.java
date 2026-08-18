package org.egov.web.contract;

import org.egov.domain.model.OtpRequestType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class OtpRequestTest {

    @Test
    @Test
    void shouldMapFromContractToDomain() {
        final Otp otp = new Otp("mobileNumber", "tenantId", null, "register", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals("mobileNumber", domainOtpRequest.getMobileNumber());
        assertEquals("tenantId", domainOtpRequest.getTenantId());
        assertEquals(OtpRequestType.REGISTER, domainOtpRequest.getType());
    }

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
        final Otp otp = new Otp("mobileNumber", "tenantId", null, null, "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals(OtpRequestType.REGISTER, domainOtpRequest.getType());
    }

        Otp otp = new Otp(
                "mobileNumber",
                "tenantId",
                null,
                "CITIZEN",
                false
        );

        OtpRequest request = new OtpRequest(null, otp);

    @Test
    void shouldSetRequestTypeToNullWhenTypeIsUnknown() {
        final Otp otp = new Otp("mobileNumber", "tenantId", null, "unknown", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertNull(domainOtpRequest.getType());
    }

        assertEquals(
                OtpRequestType.REGISTER,
                domainOtpRequest.getType()
        );
    }

    @Test
    void shouldSetRequestTypeToNullWhenTypeIsUnknown() {

    @Test
    void shouldSetRequestTypeToRegisterWhenTypeIsRegister() {
        final Otp otp = new Otp("mobileNumber", "tenantId", "regisTER", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals(OtpRequestType.REGISTER, domainOtpRequest.getType());
    }

        OtpRequest request = new OtpRequest(null, otp);

        org.egov.domain.model.OtpRequest domainOtpRequest =
                request.toDomain();

    @Test
    void shouldSetRequestTypeToPasswordResetWhenTypeIsPasswordReset() {
        final Otp otp = new Otp("mobileNumber", "tenantId", null, "passwordRESET", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals(OtpRequestType.PASSWORD_RESET, domainOtpRequest.getType());
    }

    @Test
    void shouldSetRequestTypeToRegisterWhenTypeIsRegister() {

    @Test
    void shouldSetRequestTypeToLoginWhenTypeIsLogin() {
        final Otp otp = new Otp("mobileNumber", "tenantId", null, "LOGIN", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals(OtpRequestType.LOGIN, domainOtpRequest.getType());
    }

        OtpRequest request = new OtpRequest(null, otp);

    @Test
    void shouldSetRequestTypeToLoginWhenTypeIsLowercaseLogin() {
        final Otp otp = new Otp("mobileNumber", "tenantId", null, "login", "CITIZEN", false);
        final OtpRequest request = new OtpRequest(null, otp);
        org.egov.domain.model.OtpRequest domainOtpRequest = request.toDomain();

        assertEquals(OtpRequestType.LOGIN, domainOtpRequest.getType());
    }

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