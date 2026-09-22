package org.egov.edcr.web.controller.rest;

import java.io.FileNotFoundException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.nio.file.NoSuchFileException;
import java.util.List;
import java.util.stream.Collectors;

import org.egov.commons.exception.EdcrException;
import org.egov.infra.exception.ApplicationRuntimeException;
import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.rest.error.ErrorResponse;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.jsonpath.PathNotFoundException;

/**
 * Global REST Exception Handler for all EDCR REST controllers.
 * Catches domain exceptions, validation errors, communication failures,
 * and database errors, mapping them to meaningful HTTP status codes and ErrorResponse.
 * Internal Server Error (500) is the absolute last-resort fallback.
 */
@RestControllerAdvice(basePackages = "org.egov.edcr.web.controller.rest")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalRestExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalRestExceptionHandler.class);

    // ── 1. EDCR DOMAIN & CUSTOM EXCEPTIONS ────────────────────────────────────

    @ExceptionHandler(EdcrException.class)
    public ResponseEntity<ErrorResponse> handleEdcrException(EdcrException ex) {
        LOGGER.error("EdcrException caught: [code: {}, status: {}] - {}", ex.getErrorCode(), ex.getStatus(), ex.getMessage(), ex);
        HttpStatus status = (ex.getStatus() != null && ex.getStatus() != HttpStatus.INTERNAL_SERVER_ERROR)
                ? ex.getStatus() : HttpStatus.BAD_REQUEST;
        String errorCode = ex.getErrorCode() != null && !ex.getErrorCode().trim().isEmpty() ? ex.getErrorCode() : "EDCR_ERROR";
        if ("INTERNAL_SERVER_ERROR".equalsIgnoreCase(errorCode)) {
            errorCode = "BAD_REQUEST";
        }
        String message = ex.getMessage() != null && !ex.getMessage().trim().isEmpty() ? ex.getMessage() : "EDCR processing error occurred.";
        return new ResponseEntity<>(new ErrorResponse(errorCode, message, status), status);
    }

    @ExceptionHandler(ApplicationRestException.class)
    public ResponseEntity<ErrorResponse> handleApplicationRestException(ApplicationRestException ex) {
        LOGGER.error("ApplicationRestException caught: [code: {}] - {}", ex.getErrorCode(), ex.getMessage(), ex);
        String errorCode = ex.getErrorCode() != null && !ex.getErrorCode().trim().isEmpty() ? ex.getErrorCode() : "INVALID_REQUEST";
        String message = ex.getMessage() != null && !ex.getMessage().trim().isEmpty() ? ex.getMessage() : "Invalid REST request.";
        return new ResponseEntity<>(new ErrorResponse(errorCode, message, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ApplicationRuntimeException.class)
    public ResponseEntity<ErrorResponse> handleApplicationRuntimeException(ApplicationRuntimeException ex) {
        LOGGER.error("ApplicationRuntimeException caught: {}", ex.getMessage(), ex);
        String rootMsg = getRootCauseMessage(ex);
        return new ResponseEntity<>(new ErrorResponse("BAD_REQUEST", rootMsg, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    // ── 2. DATABASE & CONSTRAINT VIOLATIONS ────────────────────────────────────

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        LOGGER.error("DataIntegrityViolationException caught: {}", ex.getMessage(), ex);
        String constraintName = getConstraintName(ex);

        if ("uk_filestoremap_filestoreid".equalsIgnoreCase(constraintName)) {
            ErrorResponse error = new ErrorResponse(
                    "BPA-409",
                    "The provided DXF FileStore ID already exists. Please provide a valid FileStore ID.",
                    HttpStatus.CONFLICT);
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }

        String details = constraintName != null
                ? "Database constraint violation occurred: " + constraintName
                : "Database constraint violation: " + getRootCauseMessage(ex);
        ErrorResponse error = new ErrorResponse("DATABASE_CONSTRAINT_VIOLATION", details, HttpStatus.CONFLICT);
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleHibernateConstraintViolationException(ConstraintViolationException ex) {
        LOGGER.error("Hibernate ConstraintViolationException caught: {}", ex.getMessage(), ex);
        String constraintName = ex.getConstraintName();
        if ("uk_filestoremap_filestoreid".equalsIgnoreCase(constraintName)) {
            ErrorResponse error = new ErrorResponse(
                    "BPA-409",
                    "The provided DXF FileStore ID already exists. Please provide a valid FileStore ID.",
                    HttpStatus.CONFLICT);
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }
        String details = constraintName != null ? "Database constraint violation: " + constraintName : getRootCauseMessage(ex);
        ErrorResponse error = new ErrorResponse("DATABASE_CONSTRAINT_VIOLATION", details, HttpStatus.CONFLICT);
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(javax.validation.ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleJsr303ConstraintViolation(javax.validation.ConstraintViolationException ex) {
        LOGGER.error("JSR-303 ConstraintViolationException caught: {}", ex.getMessage(), ex);
        String violations = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining("; "));
        String message = violations.isEmpty() ? "Validation constraint failed." : violations;
        return new ResponseEntity<>(new ErrorResponse("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    // ── 3. SPRING VALIDATION & BINDING ERRORS ─────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        LOGGER.error("MethodArgumentNotValidException caught: {}", ex.getMessage(), ex);
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        String errorMsg = fieldErrors.stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        if (errorMsg.isEmpty()) {
            errorMsg = "Invalid request payload attributes.";
        }
        return new ResponseEntity<>(new ErrorResponse("VALIDATION_ERROR", errorMsg, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException ex) {
        LOGGER.error("BindException caught: {}", ex.getMessage(), ex);
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        if (errorMsg.isEmpty()) {
            errorMsg = "Request parameter binding failed.";
        }
        return new ResponseEntity<>(new ErrorResponse("BINDING_ERROR", errorMsg, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    // ── 4. REQUEST PAYLOAD & PARAMETER ERRORS ─────────────────────────────────

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException ex) {
        LOGGER.error("MissingServletRequestParameterException caught: {}", ex.getMessage(), ex);
        String details = String.format("Required request parameter '%s' of type %s is missing.", ex.getParameterName(), ex.getParameterType());
        return new ResponseEntity<>(new ErrorResponse("MISSING_PARAMETER", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestPartException(MissingServletRequestPartException ex) {
        LOGGER.error("MissingServletRequestPartException caught: {}", ex.getMessage(), ex);
        String details = String.format("Required request part '%s' (e.g. planFile) is missing.", ex.getRequestPartName());
        return new ResponseEntity<>(new ErrorResponse("MISSING_REQUEST_PART", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ServletRequestBindingException.class)
    public ResponseEntity<ErrorResponse> handleServletRequestBindingException(ServletRequestBindingException ex) {
        LOGGER.error("ServletRequestBindingException caught: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(new ErrorResponse("REQUEST_BINDING_ERROR", ex.getMessage(), HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, JsonProcessingException.class })
    public ResponseEntity<ErrorResponse> handleJsonException(Exception ex) {
        LOGGER.error("JSON parsing exception caught: {}", ex.getMessage(), ex);
        String details = "Malformed JSON request payload: " + getRootCauseMessage(ex);
        return new ResponseEntity<>(new ErrorResponse("INVALID_JSON_DATA", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PathNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePathNotFoundException(PathNotFoundException ex) {
        LOGGER.error("PathNotFoundException caught: {}", ex.getMessage(), ex);
        String details = "Required JSON attribute or path not found: " + ex.getMessage();
        return new ResponseEntity<>(new ErrorResponse("JSON_PATH_NOT_FOUND", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    // ── 5. FILE & MULTIPART ERRORS ─────────────────────────────────────────────

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        LOGGER.error("MaxUploadSizeExceededException caught: {}", ex.getMessage(), ex);
        String details = "Uploaded file exceeds the maximum allowed file size limit. Please upload a smaller DXF file.";
        return new ResponseEntity<>(new ErrorResponse("MAX_UPLOAD_SIZE_EXCEEDED", details, HttpStatus.PAYLOAD_TOO_LARGE), HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(MultipartException ex) {
        LOGGER.error("MultipartException caught: {}", ex.getMessage(), ex);
        String details = "Multipart upload failed: " + getRootCauseMessage(ex);
        return new ResponseEntity<>(new ErrorResponse("MULTIPART_ERROR", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ FileNotFoundException.class, NoSuchFileException.class })
    public ResponseEntity<ErrorResponse> handleFileNotFoundException(Exception ex) {
        LOGGER.error("FileNotFoundException caught: {}", ex.getMessage(), ex);
        String details = "Requested file could not be found: " + ex.getMessage();
        return new ResponseEntity<>(new ErrorResponse("FILE_NOT_FOUND", details, HttpStatus.NOT_FOUND), HttpStatus.NOT_FOUND);
    }

    // ── 6. HTTP MEDIA TYPE & METHOD ERRORS ─────────────────────────────────────

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex) {
        LOGGER.error("HttpMediaTypeNotSupportedException caught: {}", ex.getMessage(), ex);
        String details = String.format("Content type '%s' is not supported. Supported content types: %s",
                ex.getContentType(), ex.getSupportedMediaTypes());
        return new ResponseEntity<>(new ErrorResponse("UNSUPPORTED_MEDIA_TYPE", details, HttpStatus.UNSUPPORTED_MEDIA_TYPE), HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
        LOGGER.error("HttpRequestMethodNotSupportedException caught: {}", ex.getMessage(), ex);
        String details = String.format("HTTP method '%s' is not supported for this endpoint.", ex.getMethod());
        return new ResponseEntity<>(new ErrorResponse("METHOD_NOT_ALLOWED", details, HttpStatus.METHOD_NOT_ALLOWED), HttpStatus.METHOD_NOT_ALLOWED);
    }

    // ── 7. DOWNSTREAM COMMUNICATION (MDMS, FILESTORE, ETC.) ───────────────────

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponse> handleResourceAccessException(ResourceAccessException ex) {
        LOGGER.error("ResourceAccessException (downstream service unreachable): {}", ex.getMessage(), ex);
        String rootMsg = getRootCauseMessage(ex);
        String details = "Downstream service communication failure. Please verify external service (e.g. MDMS at port 8094 or FileStore) is running: " + rootMsg;
        return new ResponseEntity<>(new ErrorResponse("DOWNSTREAM_SERVICE_UNAVAILABLE", details, HttpStatus.SERVICE_UNAVAILABLE), HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(HttpStatusCodeException.class)
    public ResponseEntity<ErrorResponse> handleHttpStatusCodeException(HttpStatusCodeException ex) {
        LOGGER.error("HttpStatusCodeException from downstream service: status={}, body={}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
        HttpStatus status = ex.getStatusCode();
        String details = String.format("Downstream service returned error (%s): %s", status, ex.getResponseBodyAsString());
        return new ResponseEntity<>(new ErrorResponse("DOWNSTREAM_SERVICE_ERROR", details, status), status);
    }

    // ── 8. CLIENT & ARGUMENT ERRORS ───────────────────────────────────────────

    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(RuntimeException ex) {
        LOGGER.error("IllegalArgumentException/IllegalStateException caught: {}", ex.getMessage(), ex);
        String details = ex.getMessage() != null && !ex.getMessage().trim().isEmpty() ? ex.getMessage() : "Invalid request argument.";
        return new ResponseEntity<>(new ErrorResponse("INVALID_INPUT", details, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }

    // ── 9. SECURITY & AUTHENTICATION ERRORS ───────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        LOGGER.error("AccessDeniedException caught: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(new ErrorResponse("ACCESS_DENIED", "Access denied: You do not have permission to access this resource.", HttpStatus.FORBIDDEN), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        LOGGER.error("AuthenticationException caught: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(new ErrorResponse("UNAUTHORIZED", "Authentication failed: " + ex.getMessage(), HttpStatus.UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
    }

    // ── 10. LAST PRIORITY FALLBACK: BAD REQUEST (NEVER 500) ───────────────────

    @ExceptionHandler({ RuntimeException.class, Exception.class, Throwable.class })
    public ResponseEntity<ErrorResponse> handleGenericException(Throwable ex) {
        LOGGER.error("Unhandled exception caught in GlobalRestExceptionHandler: {}", ex.getMessage(), ex);

        // Check if root cause is a database constraint
        String constraintName = getConstraintName(ex);
        if ("uk_filestoremap_filestoreid".equalsIgnoreCase(constraintName)) {
            ErrorResponse error = new ErrorResponse(
                    "BPA-409",
                    "The provided DXF FileStore ID already exists. Please provide a valid FileStore ID.",
                    HttpStatus.CONFLICT);
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        } else if (constraintName != null) {
            ErrorResponse error = new ErrorResponse(
                    "DATABASE_CONSTRAINT_VIOLATION",
                    "Database constraint violation: " + constraintName,
                    HttpStatus.CONFLICT);
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }

        // Check if root cause is a downstream connection failure
        if (isConnectionFailure(ex)) {
            String details = "Downstream service is currently unreachable (Connection refused/timed out). Please verify MDMS or FileStore service.";
            return new ResponseEntity<>(new ErrorResponse("DOWNSTREAM_SERVICE_UNAVAILABLE", details, HttpStatus.SERVICE_UNAVAILABLE), HttpStatus.SERVICE_UNAVAILABLE);
        }

        // Never return 500 Internal Server Error; always return 400 Bad Request
        String errorDesc = getRootCauseMessage(ex);
        if (errorDesc == null || errorDesc.trim().isEmpty() || "Internal Server Error".equalsIgnoreCase(errorDesc.trim())) {
            errorDesc = "Bad Request: Failed to process request due to " + ex.getClass().getSimpleName();
        }

        ErrorResponse error = new ErrorResponse(
                "BAD_REQUEST",
                errorDesc,
                HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ── HELPER METHODS ─────────────────────────────────────────────────────────

    private boolean isConnectionFailure(Throwable ex) {
        Throwable cur = ex;
        while (cur != null) {
            if (cur instanceof ConnectException || cur instanceof SocketTimeoutException) {
                return true;
            }
            String msg = cur.getMessage();
            if (msg != null && (msg.contains("Connection refused") || msg.contains("connect timed out")
                    || msg.contains("SocketTimeoutException") || msg.contains("ConnectException"))) {
                return true;
            }
            cur = cur.getCause();
        }
        return false;
    }

    private String getConstraintName(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof ConstraintViolationException) {
                return ((ConstraintViolationException) cause).getConstraintName();
            }
            cause = cause.getCause();
        }
        return null;
    }

    private String getRootCauseMessage(Throwable ex) {
        if (ex == null) {
            return "Unknown error occurred";
        }

        Throwable current = ex;
        Throwable deepest = ex;
        String lastValidMessage = null;
        String wrapperContext = null;

        while (current != null) {
            deepest = current;
            String message = current.getMessage();
            if (message != null && !message.trim().isEmpty()) {
                message = message.trim();
                if (message.endsWith(": null") || message.equalsIgnoreCase("null") || message.endsWith("Exception: null")) {
                    if (message.contains(":")) {
                        wrapperContext = message.substring(0, message.lastIndexOf(":")).trim();
                    }
                } else if (isMeaningfulExceptionMessage(message)) {
                    lastValidMessage = message;
                }
            }
            current = current.getCause();
        }

        // If root cause has null message, extract class & line location
        if (lastValidMessage == null) {
            String location = getExceptionLocation(deepest);
            String exName = deepest != null ? deepest.getClass().getSimpleName() : ex.getClass().getSimpleName();
            String detailed = location != null ? exName + " at " + location : exName;

            if (wrapperContext != null && !wrapperContext.isEmpty()) {
                lastValidMessage = wrapperContext + ": " + detailed;
            } else {
                lastValidMessage = detailed;
            }
        }

        if (lastValidMessage == null) {
            lastValidMessage = deepest != null ? deepest.getClass().getSimpleName() : ex.getClass().getSimpleName();
        }

        String cleaned = lastValidMessage.replace("\"", "'").replace("\r", " ").replace("\n", " ").trim();
        return cleaned.length() <= 300 ? cleaned : cleaned.substring(0, 300);
    }

    private String getExceptionLocation(Throwable t) {
        if (t == null || t.getStackTrace() == null || t.getStackTrace().length == 0) {
            return null;
        }
        for (StackTraceElement elem : t.getStackTrace()) {
            String className = elem.getClassName();
            if (className.startsWith("org.egov.")) {
                String simpleName = className.substring(className.lastIndexOf('.') + 1);
                return simpleName + "." + elem.getMethodName() + "(line " + elem.getLineNumber() + ")";
            }
        }
        StackTraceElement first = t.getStackTrace()[0];
        String simpleName = first.getClassName().substring(first.getClassName().lastIndexOf('.') + 1);
        return simpleName + "." + first.getMethodName() + "(line " + first.getLineNumber() + ")";
    }

    private boolean isMeaningfulExceptionMessage(String message) {
        return !"could not execute statement".equalsIgnoreCase(message)
                && !"null".equalsIgnoreCase(message)
                && !message.endsWith(": null")
                && !"Internal Server Error".equalsIgnoreCase(message)
                && !message.trim().isEmpty();
    }
}