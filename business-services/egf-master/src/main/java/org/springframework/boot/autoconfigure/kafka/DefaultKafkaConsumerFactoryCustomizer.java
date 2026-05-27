package org.springframework.boot.autoconfigure.kafka;

import org.springframework.kafka.core.DefaultKafkaConsumerFactory;

/**
 * Dummy interface to satisfy Spring's ASM class scanner during runtime.
 * The opentelemetry library references this interface, which was removed in Spring Boot 4.0.2.
 */
@FunctionalInterface
public interface DefaultKafkaConsumerFactoryCustomizer {
    void customize(DefaultKafkaConsumerFactory<?, ?> consumerFactory);
}
