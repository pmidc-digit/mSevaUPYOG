package org.egov.investpunjab.producer;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.models.InvestPunjabEventResult;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InvestPunjabKafkaProducer {

    private final CustomKafkaTemplate<String, Object> kafkaTemplate;
    private final InvestPunjabConfiguration config;

    @Autowired
    public InvestPunjabKafkaProducer(CustomKafkaTemplate<String, Object> kafkaTemplate,
                                     InvestPunjabConfiguration config) {
        this.kafkaTemplate = kafkaTemplate;
        this.config = config;
    }

    public void push(String topic, Object value) {
        if (StringUtils.isBlank(topic)) {
            log.warn("Kafka push skipped: Topic is null or blank.");
            return;
        }
        log.info("Pushing message to Kafka topic: {}", topic);
        kafkaTemplate.send(topic, value);
    }

    public void push(String topic, String key, Object value) {
        if (StringUtils.isBlank(topic)) {
            log.warn("Kafka push skipped: Topic is null or blank.");
            return;
        }
        log.info("Pushing message to Kafka topic: {} with key: {}", topic, key);
        kafkaTemplate.send(topic, key, value);
    }

    /**
     * Publishes a success event to the configured success topic.
     * Can be consumed by downstream dashboard / persister services.
     */
    public void pushSuccessEvent(InvestPunjabEventResult event) {
        String topic = config.getKafkaTopicsStatusSuccess();
        if (StringUtils.isNotBlank(topic)) {
            String key = (event != null && StringUtils.isNotBlank(event.getIPin())) ? event.getIPin() : null;
            push(topic, key, event);
            log.info("Published SUCCESS event to topic: {} for iPin: {}", topic, event != null ? event.getIPin() : "unknown");
        }
    }

    /**
     * Publishes a failure/error event to the configured error topic.
     * Can be consumed for alerting, retry pipelines, or error dashboard metrics.
     */
    public void pushErrorEvent(InvestPunjabEventResult event) {
        String topic = config.getKafkaTopicsStatusError();
        if (StringUtils.isNotBlank(topic)) {
            String key = (event != null && StringUtils.isNotBlank(event.getIPin())) ? event.getIPin() : null;
            push(topic, key, event);
            log.warn("Published ERROR event to topic: {} for iPin: {}", topic, event != null ? event.getIPin() : "unknown");
        }
    }
}
