package org.springframework.kafka.listener;

/**
 * Dummy class to satisfy egov-tracer dependency during component scanning.
 * Spring Kafka 3.x removed this class, but tracer-1.1.3-SNAPSHOT expects it to exist.
 */
public class LoggingErrorHandler {
    public LoggingErrorHandler() {
    }
}
