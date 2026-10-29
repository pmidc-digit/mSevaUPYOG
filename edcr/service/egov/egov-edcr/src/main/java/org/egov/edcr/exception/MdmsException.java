package org.egov.edcr.exception;

import org.springframework.http.HttpStatus;

public class MdmsException extends CustomException {

    private static final long serialVersionUID = 1L;

    public MdmsException(String message) {
        super(HttpStatus.BAD_GATEWAY, "MDMS_SERVICE_ERROR", message);
    }

    public MdmsException(String errorCode, String message) {
        super(HttpStatus.BAD_GATEWAY, errorCode, message);
    }

    public MdmsException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}