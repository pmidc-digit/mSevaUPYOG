package org.egov.tracer.kafka;

import org.egov.tracer.model.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

public class CustomKafkaTemplate<K, V> {

    private static final Logger log = LoggerFactory.getLogger(CustomKafkaTemplate.class);

    private KafkaTemplate<K, V> kafkaTemplate;

    private static final String KAFKA_SEND_ERROR_CODE = "EVENT_BUS_FAILURE";
    private static final String KAFKA_SEND_ERROR_MSG = "Failed to push event onto the event bus";
    private static final String KAFKA_ERROR_LOG = "Failed to push data to kafka queue";

    public CustomKafkaTemplate(KafkaTemplate<K, V> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public SendResult<K, V> send(String topic, V data) {
        try {
            CompletableFuture<SendResult<K, V>> future = kafkaTemplate.send(topic, data);
            return future.get();
        } catch (Exception e) {
            log.error(KAFKA_ERROR_LOG, e);
            throw new CustomException(KAFKA_SEND_ERROR_CODE, KAFKA_SEND_ERROR_MSG);
        }
    }

    public SendResult<K, V> send(String topic, K key, V data) {
        try {
            CompletableFuture<SendResult<K, V>> future = kafkaTemplate.send(topic, key, data);
            return future.get();
        } catch (Exception e) {
            log.error(KAFKA_ERROR_LOG, e);
            throw new CustomException(KAFKA_SEND_ERROR_CODE, KAFKA_SEND_ERROR_MSG);
        }
    }

    public SendResult<K, V> send(String topic, K key, int partition, V data) {
        try {
            CompletableFuture<SendResult<K, V>> future = kafkaTemplate.send(topic, partition, key, data);
            return future.get();
        } catch (Exception e) {
            log.error(KAFKA_ERROR_LOG, e);
            throw new CustomException(KAFKA_SEND_ERROR_CODE, KAFKA_SEND_ERROR_MSG);
        }
    }
}
