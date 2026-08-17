package org.egov.egf.master;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;

import static org.mockito.Mockito.mock;

@Configuration
public class TestConfiguration {

    @Bean
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return mock(KafkaTemplate.class);
    }

    @Bean
    public org.springframework.boot.web.client.RestTemplateBuilder restTemplateBuilder() {
        return new org.springframework.boot.web.client.RestTemplateBuilder();
    }
}
