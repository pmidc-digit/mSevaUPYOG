package org.egov.web.controller;

import org.egov.domain.exception.*;
import org.egov.web.contract.Error;
import org.egov.web.contract.ErrorField;
import org.egov.web.contract.ErrorResponse;
import org.egov.web.error.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@ControllerAdvice
@RestController
public class CustomControllerAdvice {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(InvalidOtpRequestException.class)
    public ErrorResponse handleInvalidOtpRequestException(InvalidOtpRequestException ex) {
        return new OtpRequestErrorAdapter().adapt(ex.getOtpRequest());
    }

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(UserNotFoundException.class)
	public ErrorResponse handleUserNotFoundException() {
		return new UserNotFoundErrorAdapter().adapt(null);
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(UserMobileNumberNotFoundException.class)
	public ErrorResponse handleUserMobileNumberNotFoundException() {
		return new UserMobileNumberNotFoundErrorAdapter().adapt(null);
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(UserAlreadyExistInSystemException.class)
	public ErrorResponse handleUserAlreadyExistException() {
		return new UserAlreadyExistErrorAdapter().adapt(null);
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(UserNotExistingInSystemException.class)
	public ErrorResponse handleUserNotExistException() {
		return new UserNotExistErrorAdapter().adapt(null);
	}

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(InvalidAnonymousOtpRequestException.class)
    public ErrorResponse handleInvalidAnonymousOtpRequestException(InvalidAnonymousOtpRequestException ex) {
        return new AnonymousOtpRequestErrorAdapter().adapt(ex);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(TokenValidationFailureException.class)
    public ErrorResponse handleTokenValidationFailureException(TokenValidationFailureException ex) {
        List<ErrorField> fields = Collections.singletonList(
                ErrorField.builder()
                        .code("OTP.VALIDATION_UNSUCCESSFUL")
                        .message(ex.getMessage() != null ? ex.getMessage() : "OTP validation unsuccessful")
                        .field("otp.otp")
                        .build()
        );
        Error error = Error.builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message("OTP validation unsuccessful")
                .fields(fields)
                .build();
        return new ErrorResponse(null, error);
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public String handleServerError(Exception ex) {
        logger.error(ex.getMessage(), ex);
        return ex.getMessage();
    }

}
