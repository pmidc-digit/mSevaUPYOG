package org.springframework.kafka.listener;

import org.apache.kafka.clients.consumer.ConsumerRecord;

public class LoggingErrorHandler implements ErrorHandler {
    @Override
    public void handle(Exception thrownException, ConsumerRecord<?, ?> data) {
        // Fallback logging
    }
}
