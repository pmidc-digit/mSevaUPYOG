package com.ingestpipeline.consumer;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

/**
 * The configurations for the Kafka Consumers are fed from this Config Class
 * @author Darshan Nagesh
 *
 */
@PropertySource(value= {"classpath:application.properties"})
@Configuration
@EnableKafka
public class ConsumerConfigurations {
	
	@Autowired
	org.springframework.core.env.Environment env;

    @Value("${spring.kafka.bootstrap.servers}")
    private String serverConfig;

    @Value("${kafka.consumer.config.auto_commit:true}")
    private Boolean enableAutoCommit;

    @Value("${kafka.consumer.config.auto_commit_interval:100}")
    private String autoCommitInterval;

    @Value("${kafka.consumer.config.session_timeout:15000}")
    private String sessionTimeout;

    @Value("${kafka.consumer.config.group_id:pipeline-group}")
    private String groupId;

    @Value("${kafka.consumer.config.auto_offset_reset:earliest}")
    private String autoOffsetReset;

    @Value("${spring.kafka.consumer.value-deserializer:#{null}}")
    private String valueDeserializer; 
    
    @Value("${spring.kafka.consumer.key-deserializer:#{null}}")
    private String keyDeserializer;

    @Value("${spring.kafka.listener.concurrency:3}")
    private Integer concurrency;

    public ConsumerFactory<String, Map> kafkaConsumerFactory() {
        JsonDeserializer<Map> deserializer = new JsonDeserializer<>(Map.class);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeMapperForKey(true);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, serverConfig);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        if (enableAutoCommit != null) {
            props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, enableAutoCommit);
        }
        if (autoCommitInterval != null) {
            props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, autoCommitInterval);
        }
        if (sessionTimeout != null) {
            props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, sessionTimeout);
        }
        if (autoOffsetReset != null) {
            props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, autoOffsetReset);
        }
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Map> incomingKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Map> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(kafkaConsumerFactory());
        factory.setConcurrency(concurrency != null ? concurrency : 3);
        return factory;
    }
}