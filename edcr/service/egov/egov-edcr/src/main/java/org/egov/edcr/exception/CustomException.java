package org.egov.edcr.exception;

import org.egov.commons.exception.EdcrException;
import org.springframework.http.HttpStatus;

public class CustomException extends EdcrException {

    private static final long serialVersionUID = 1L;

    public CustomException(String errorCode, String message) {
        super(HttpStatus.BAD_REQUEST, errorCode, message);
    }

    public CustomException(HttpStatus status, String errorCode, String message) {
        super(status != null ? status : HttpStatus.BAD_REQUEST, errorCode, message);
    }

    public CustomException(String errorCode, String message, Throwable cause) {
        super(HttpStatus.BAD_REQUEST, errorCode, message);
        if (cause != null) {
            initCause(cause);
        }
    }
}