package org.springframework.kafka.listener;

// Dummy class to satisfy the Spring ASM metadata reader when loading
// the legacy egov-tracer library in Spring Boot 4.x environment
// where LoggingErrorHandler has been removed from spring-kafka.
public class LoggingErrorHandler {
}
