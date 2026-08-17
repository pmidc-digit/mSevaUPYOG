package org.egov.tracer.http.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.egov.tracer.config.ObjectMapperFactory;
import org.egov.tracer.config.TracerProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

public class TracerFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(TracerFilter.class);
    private static final List<String> JSON_MEDIA_TYPES = Arrays.asList(
            "application/json;charset=utf-8",
            "application/json;charset=utf-8",
            "application/json"
    );

    private final ObjectMapper objectMapper;
    private final TracerProperties tracerProperties;
    private Pattern skipPattern;

    public TracerFilter(TracerProperties tracerProperties, ObjectMapperFactory objectMapperFactory) {
        this.tracerProperties = tracerProperties;
        this.objectMapper = objectMapperFactory.getObjectMapper();
        if (tracerProperties.getFilterSkipPattern() != null) {
            this.skipPattern = Pattern.compile(tracerProperties.getFilterSkipPattern());
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            if (isTraced(httpRequest)) {
                HttpServletRequest wrappedRequest = httpRequest;
                if (tracerProperties.isRequestLoggingEnabled() && isBodyCompatibleForParsing(httpRequest)) {
                    wrappedRequest = new MultiReadRequestWrapper(httpRequest);
                }
                String correlationId = getCorrelationId(wrappedRequest);
                MDC.put("CORRELATION_ID", correlationId);

                logRequestURI(wrappedRequest);
                if (tracerProperties.isRequestLoggingEnabled()) {
                    logRequestBodyAndParams(wrappedRequest);
                }

                try {
                    chain.doFilter(wrappedRequest, httpResponse);
                } finally {
                    if (tracerProperties.isRequestLoggingEnabled()) {
                        logResponse(httpResponse);
                    }
                    MDC.clear();
                }
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private boolean isTraced(HttpServletRequest request) {
        if (this.skipPattern == null) {
            return true;
        }
        String uri = request.getRequestURI();
        return !this.skipPattern.matcher(uri).matches();
    }

    private void logResponse(ServletResponse response) {
        if (response instanceof HttpServletResponse) {
            log.info("Response code - {}", ((HttpServletResponse) response).getStatus());
        }
    }

    private void logRequestURI(HttpServletRequest request) {
        log.info("Request URI: {}", request.getRequestURI());
    }

    private String getCorrelationId(HttpServletRequest request) {
        String correlationId = getCorrelationIdFromHeader(request);
        if (correlationId == null && request instanceof MultiReadRequestWrapper) {
            correlationId = getCorrelationIdFromBody(request);
        }
        if (correlationId == null) {
            correlationId = getRandomCorrelationId();
        }
        return correlationId;
    }

    private boolean isBodyCompatibleForParsing(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String contentType = request.getContentType();
        if (contentType == null) {
            return false;
        }
        String lowerContentType = contentType.toLowerCase().replaceAll("\\s+", "");
        for (String mediaType : JSON_MEDIA_TYPES) {
            if (lowerContentType.contains(mediaType)) {
                return true;
            }
        }
        return false;
    }

    private void logRequestBodyAndParams(HttpServletRequest request) {
        try {
            String body = org.apache.commons.io.IOUtils.toString(request.getInputStream(), "UTF-8");
            String queryString = request.getQueryString();
            if (queryString != null && !queryString.isEmpty()) {
                log.info("Request Query params: {}", queryString);
            }
            if (body != null && !body.isEmpty()) {
                log.info("Request body - {}", body);
            }
        } catch (IOException e) {
            log.error("Failed to log request body", e);
        }
    }

    private String getCorrelationIdFromHeader(HttpServletRequest request) {
        return request.getHeader("x-correlation-id");
    }

    private String getCorrelationIdFromBody(HttpServletRequest request) {
        try {
            java.util.HashMap<?, ?> body = objectMapper.readValue(request.getInputStream(), java.util.HashMap.class);
            if (body != null) {
                Object requestInfo = body.get("RequestInfo");
                if (requestInfo == null) {
                    requestInfo = body.get("requestInfo");
                }
                if (requestInfo instanceof java.util.Map) {
                    Object correlationId = ((java.util.Map<?, ?>) requestInfo).get("correlationId");
                    if (correlationId instanceof String) {
                        return (String) correlationId;
                    }
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }

    private String getRandomCorrelationId() {
        return UUID.randomUUID().toString();
    }
}
