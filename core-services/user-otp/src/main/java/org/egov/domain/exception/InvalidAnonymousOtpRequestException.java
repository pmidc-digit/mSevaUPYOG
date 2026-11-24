package org.egov.domain.exception;

import lombok.Getter;
import org.egov.web.contract.ErrorField;

import java.util.List;

@Getter
public class InvalidAnonymousOtpRequestException extends RuntimeException {
    private final List<ErrorField> errorFields;

    public InvalidAnonymousOtpRequestException(List<ErrorField> errorFields) {
        super("Invalid Anonymous OTP request");
        this.errorFields = errorFields;
    }
}
