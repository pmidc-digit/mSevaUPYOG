package org.egov.tracer.config;

import brave.Tracing;
import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.brave.bridge.BraveTracer;
import io.micrometer.tracing.brave.bridge.BraveCurrentTraceContext;
import io.micrometer.tracing.brave.bridge.BraveBaggageManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class MicrometerTracerConfig {

    @Bean
    public Tracer tracer(Environment environment) {

    	String serviceName = environment.getProperty(
                "spring.application.name", 
                "unknown-service"
        );
    	Tracing tracing = Tracing.newBuilder()
                .localServiceName(serviceName)
                .build();

        return new BraveTracer(
                tracing.tracer(),
                new BraveCurrentTraceContext(tracing.currentTraceContext()),
                new BraveBaggageManager()
        );
    }
}