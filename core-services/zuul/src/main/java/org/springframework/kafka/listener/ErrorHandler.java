package org.springframework.kafka.listener;

import org.apache.kafka.clients.consumer.ConsumerRecord;

public interface ErrorHandler {
    void handle(Exception thrownException, ConsumerRecord<?, ?> data);
}
