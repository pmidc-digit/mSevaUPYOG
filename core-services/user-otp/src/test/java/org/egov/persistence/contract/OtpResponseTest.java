package org.egov.persistence.contract;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpResponseTest {

    @Test
    void shouldReturnFalseWhenOtpNumberIsPresent() {

        Otp otp = Otp.builder()
                .otp("otpNumber")
                .build();

        OtpResponse otpResponse = new OtpResponse(null, otp);

        assertFalse(otpResponse.isOtpNumberAbsent());
    }

    @Test
    void shouldReturnTrueWhenOtpNumberIsNotPresent() {

        Otp otp = Otp.builder()
                .otp(null)
                .build();

        OtpResponse otpResponse = new OtpResponse(null, otp);

        assertTrue(otpResponse.isOtpNumberAbsent());
    }

    @Test
    void shouldReturnTrueWhenOtpObjectIsNotPresent() {

        OtpResponse otpResponse = new OtpResponse(null, null);

        assertTrue(otpResponse.isOtpNumberAbsent());
    }
}