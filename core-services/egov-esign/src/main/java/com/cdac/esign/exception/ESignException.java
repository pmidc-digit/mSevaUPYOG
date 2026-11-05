package com.cdac.esign.exception;

import org.springframework.http.HttpStatus;

/**
 * Application exception carrying the HTTP status that should be returned to the caller.
 * Rendered by GlobalExceptionHandler as {"status":"FAILED","error":"<message>"}.
 */
public class ESignException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public ESignException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public ESignException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}