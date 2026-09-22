package org.egov.edcr.exception;

import org.springframework.http.HttpStatus;

public class PlanScrutinyException extends CustomException {

    private static final long serialVersionUID = 1L;

    public PlanScrutinyException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, "PLAN_SCRUTINY_ERROR", message);
    }

    public PlanScrutinyException(String errorCode, String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, errorCode, message);
    }

    public PlanScrutinyException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}