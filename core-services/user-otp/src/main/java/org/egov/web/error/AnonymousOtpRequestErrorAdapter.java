package org.egov.web.error;

import org.egov.domain.exception.InvalidAnonymousOtpRequestException;
import org.egov.web.contract.Error;
import org.egov.web.contract.ErrorField;
import org.egov.web.contract.ErrorResponse;
import org.springframework.http.HttpStatus;

import java.util.List;

public class AnonymousOtpRequestErrorAdapter implements ErrorAdapter<InvalidAnonymousOtpRequestException> {

    private static final String INVALID_OTP_REQUEST = "Invalid Anonymous OTP request";

    @Override
    public ErrorResponse adapt(InvalidAnonymousOtpRequestException ex) {
        List<ErrorField> errorFields = ex != null ? ex.getErrorFields() : null;
        final Error error = Error.builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message(INVALID_OTP_REQUEST)
                .fields(errorFields)
                .build();
        return new ErrorResponse(null, error);
    }
}
