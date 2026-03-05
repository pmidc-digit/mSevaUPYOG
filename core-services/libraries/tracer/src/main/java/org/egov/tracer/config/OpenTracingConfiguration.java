package org.egov.tracer.config;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.UUID;

@Configuration
public class OpenTracingConfiguration {

    private static final String CORRELATION_HEADER = "X-Correlation-Id";

    @Bean
    public Filter correlationIdTracingFilter(Tracer tracer) {

        return new Filter() {

            @Override
            public void doFilter(
                    ServletRequest request,
                    ServletResponse response,
                    FilterChain chain)
                    throws IOException, ServletException {

                HttpServletRequest httpRequest = (HttpServletRequest) request;

                // 1. Extract or generate correlation ID
                String correlationId = httpRequest.getHeader(CORRELATION_HEADER);

                if (correlationId == null || correlationId.isBlank()) {
                    correlationId = UUID.randomUUID().toString();
                }

                // 2. Add to MDC (for logs)
                MDC.put(CORRELATION_HEADER, correlationId);

                // 3. Add as span tag
                Span currentSpan = tracer.currentSpan();
                if (currentSpan != null) {
                    currentSpan.tag(CORRELATION_HEADER, correlationId);
                }

                try {
                    chain.doFilter(request, response);
                } finally {
                    MDC.remove(CORRELATION_HEADER);
                }
            }
        };
    }
}