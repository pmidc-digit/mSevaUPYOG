package org.egov.edcr.web.filter;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.egov.commons.exception.EdcrException;
import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.rest.error.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Filter that wraps the entire filter chain to intercept pre-controller exceptions
 * (e.g. tenant resolution, database preference lookup, security, etc.)
 * and return structured JSON ErrorResponse instead of generic container 500 HTML.
 */
public class RestExceptionHandlingFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RestExceptionHandlingFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (Throwable ex) {
            if (isRestRequest(request)) {
                handleRestFilterException(request, response, ex);
            } else {
                if (ex instanceof ServletException) {
                    throw (ServletException) ex;
                } else if (ex instanceof IOException) {
                    throw (IOException) ex;
                } else {
                    throw new ServletException(ex);
                }
            }
        }
    }

    private boolean isRestRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }
        String accept = request.getHeader("Accept");
        String contentType = request.getContentType();

        return uri.contains("/rest/") || uri.contains("/oauth/")
                || (accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE))
                || (contentType != null && (contentType.contains(MediaType.APPLICATION_JSON_VALUE)
                        || contentType.contains(MediaType.MULTIPART_FORM_DATA_VALUE)));
    }

    private void handleRestFilterException(HttpServletRequest request, HttpServletResponse response, Throwable ex)
            throws IOException {
        LOGGER.error("Pre-controller filter exception intercepted on [{} {}]: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);

        if (response.isCommitted()) {
            LOGGER.warn("Response already committed; cannot write JSON error response.");
            return;
        }

        HttpStatus status;
        String errorCode;
        String errorMessage = getRootCauseMessage(ex);

        if (ex instanceof ApplicationRestException) {
            ApplicationRestException are = (ApplicationRestException) ex;
            errorCode = are.getErrorCode() != null ? are.getErrorCode() : "INVALID_REQUEST";
            status = HttpStatus.BAD_REQUEST;
            if (are.getMessage() != null && !are.getMessage().trim().isEmpty()) {
                errorMessage = are.getMessage();
            }
        } else if (ex instanceof EdcrException) {
            EdcrException ee = (EdcrException) ex;
            status = (ee.getStatus() != null && ee.getStatus() != HttpStatus.INTERNAL_SERVER_ERROR)
                    ? ee.getStatus() : HttpStatus.BAD_REQUEST;
            errorCode = ee.getErrorCode() != null ? ee.getErrorCode() : "EDCR_ERROR";
            if ("INTERNAL_SERVER_ERROR".equalsIgnoreCase(errorCode)) {
                errorCode = "BAD_REQUEST";
            }
            if (ee.getMessage() != null && !ee.getMessage().trim().isEmpty()) {
                errorMessage = ee.getMessage();
            }
        } else if (ex instanceof AccessDeniedException) {
            status = HttpStatus.FORBIDDEN;
            errorCode = "ACCESS_DENIED";
            errorMessage = "Access denied: You do not have permission to access this resource.";
        } else if (ex instanceof AuthenticationException) {
            status = HttpStatus.UNAUTHORIZED;
            errorCode = "UNAUTHORIZED";
            errorMessage = "Authentication failed: " + ex.getMessage();
        } else if (ex instanceof IllegalArgumentException || ex instanceof IllegalStateException) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_INPUT";
        } else if (isConnectionOrDownstreamFailure(ex)) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            errorCode = "DOWNSTREAM_SERVICE_UNAVAILABLE";
            errorMessage = "Service unavailable: Failed to connect to downstream service. " + errorMessage;
        } else {
            // Last priority fallback: Return 400 BAD_REQUEST instead of 500
            status = HttpStatus.BAD_REQUEST;
            errorCode = "BAD_REQUEST";
            if (errorMessage == null || errorMessage.trim().isEmpty() || "Internal Server Error".equalsIgnoreCase(errorMessage.trim())) {
                errorMessage = "Bad Request: Failed to process request due to " + ex.getClass().getSimpleName();
            }
        }

        ErrorResponse errorResponse = new ErrorResponse(errorCode, errorMessage, status);

        response.resetBuffer();
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
        response.setCharacterEncoding("UTF-8");

        byte[] json = objectMapper.writeValueAsBytes(errorResponse);
        response.setContentLength(json.length);
        response.getOutputStream().write(json);
        response.getOutputStream().flush();
    }

    private boolean isConnectionOrDownstreamFailure(Throwable ex) {
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
                } else if (isMeaningful(message)) {
                    lastValidMessage = message;
                }
            }
            current = current.getCause();
        }

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

    private boolean isMeaningful(String msg) {
        return !"could not execute statement".equalsIgnoreCase(msg)
                && !"null".equalsIgnoreCase(msg)
                && !msg.endsWith(": null")
                && !"Internal Server Error".equalsIgnoreCase(msg)
                && !msg.trim().isEmpty();
    }
}