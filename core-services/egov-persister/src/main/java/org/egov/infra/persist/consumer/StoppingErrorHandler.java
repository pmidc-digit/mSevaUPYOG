package org.egov.infra.persist.consumer;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
public class StoppingErrorHandler implements CommonErrorHandler {

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @Override
    public boolean handleOne(Exception thrownException, ConsumerRecord<?, ?> record, 
                          Consumer<?, ?> consumer, MessageListenerContainer container) {
        // This stops all listeners managed by the registry
        kafkaListenerEndpointRegistry.stop();
        
        return true; // Indicate that the exception has been handled
    }
}