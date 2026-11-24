package org.egov.domain.exception;

public class TokenValidationFailureException extends RuntimeException {
    public TokenValidationFailureException() {
        super("OTP validation unsuccessful");
    }

    public TokenValidationFailureException(String message) {
        super(message);
    }
}
