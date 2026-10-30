package org.egov.proprate.producer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PropertyRateProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void push(String topic, Object value) {
        log.info("Pushing to topic: {} - Value: {}", topic, value);
        try {
            kafkaTemplate.send(topic, value);
        } catch (Exception e) {
            log.error("Error while pushing to kafka: {}", e.getMessage());
        }
    }
}