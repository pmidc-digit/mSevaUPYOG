package org.springframework.kafka.listener;

import org.apache.kafka.clients.consumer.ConsumerRecord;

public class LoggingErrorHandler {
    public LoggingErrorHandler() {}
    
    public void handle(Exception thrownException, ConsumerRecord<?, ?> record) {}
    
    public void handle(Exception thrownException, Object data) {}
}
