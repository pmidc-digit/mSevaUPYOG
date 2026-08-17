package org.egov.egf.instrument;

import static org.mockito.Mockito.mock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
public class TestConfiguration {

    @Bean
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return mock(KafkaTemplate.class);
    }

    @Bean
    public org.egov.tracer.kafka.ErrorQueueProducer errorQueueProducer() {
        return mock(org.egov.tracer.kafka.ErrorQueueProducer.class);
    }

    @Bean
    public org.egov.tracer.config.ObjectMapperFactory objectMapperFactory() {
        return mock(org.egov.tracer.config.ObjectMapperFactory.class);
    }

    @Bean
    public org.egov.tracer.config.TracerProperties tracerProperties() {
        return mock(org.egov.tracer.config.TracerProperties.class);
    }
}
