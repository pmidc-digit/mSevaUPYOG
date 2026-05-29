package org.egov.wscalculation.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ContainerProperties.AckMode;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.egov.tracer.kafka.deserializer.HashMapDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
public class KafkaConfigBatch {

    @Value("${kafka.config.bootstrap_server_config}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    @Autowired
    private WSCalculationConfiguration wSCalculationConfiguration;

    /**
     * Kafka Configuration method.
     * WS-Calculator service has two type of consumers. With Batch processing and without.
     * This method will provide configuration details for the BatchProcessing Topic Consumers.
     * @return Returns the list of properties.
     */
    @Bean("consumerConfigsBatch")
    public Map<String, Object> consumerConfigs() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, HashMapDeserializer.class);
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, wSCalculationConfiguration.getBatchSize());
        props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 900000);
        props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 10000);

        return props;
    }

    /**
     * Kafka Configuration method.
     * WS-Calculator service has two type of consumers. With Batch processing and without.
     * This method will provide configuration details for the BatchProcessing Topic Consumers.
     * @return Returns the Kafka ConsumerFactory object.
     */
    @Bean("consumerFactoryBatch")
    public ConsumerFactory<String, Object> consumerFactory() {
        return new DefaultKafkaConsumerFactory<>(consumerConfigs());
    }

    /**
     * Kafka Configuration method.
     * WS-Calculator service has two type of consumers. With Batch processing and without.
     * This method will provide configuration details for the BatchProcessing Topic Consumers.
     * @return Returns the Kafka ListenerContainerFactory object
     */
    @Bean("kafkaListenerContainerFactoryBatch")
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setBatchListener(true);
        factory.getContainerProperties().setAckMode(AckMode.BATCH);

        return factory;
    }

    @Bean
    public Map<String, Object> producerConfigs() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, 2080075);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 500);
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 1000);
        return props;
    }

    @Bean
    public ProducerFactory<String, Object> kafkaProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(kafkaProducerFactory());
    }

}