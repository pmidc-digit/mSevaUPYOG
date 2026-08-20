package org.egov.web.error;

import org.egov.web.contract.Error;
import org.egov.web.contract.ErrorField;
import org.egov.web.contract.ErrorResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserNotFoundErrorAdapterTest {

    @Test
    void shouldReturnErrorResponse() {

        UserNotFoundErrorAdapter adapter = new UserNotFoundErrorAdapter();

        ErrorResponse errorResponse = adapter.adapt(null);

        assertNotNull(errorResponse);

        Error error = errorResponse.getError();
        assertEquals("OTP request for password reset failed", error.getMessage());
        assertEquals(400, error.getCode());

        List<ErrorField> fields = error.getFields();
        assertEquals(1, fields.size());

        assertEquals("OTP.UNKNOWN_MOBILE_NUMBER", fields.get(0).getCode());
        assertEquals("otp.mobileNumber", fields.get(0).getField());
        assertEquals("Mobile number is unknown.", fields.get(0).getMessage());
    }
}