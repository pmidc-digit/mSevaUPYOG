package org.egov.infra.indexer.consumer.config;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.Consumer;
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
  public void handleRemaining(Exception thrownException, java.util.List<ConsumerRecord<?, ?>> records, 
          Consumer<?, ?> consumer, MessageListenerContainer container) {
	// This is the modern equivalent of the handle method
	kafkaListenerEndpointRegistry.stop();
	}

}
