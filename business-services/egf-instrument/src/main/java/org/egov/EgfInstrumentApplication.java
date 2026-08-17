package org.egov;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.text.SimpleDateFormat;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"org.egov.egf.instrument", "org.egov.egf.master", "org.egov.common"})
@Import(org.springframework.boot.kafka.autoconfigure.KafkaAutoConfiguration.class)
public class EgfInstrumentApplication {

    public static void main(String[] args) {
        SpringApplication.run(EgfInstrumentApplication.class, args);
    }

    @Value("${app.timezone}")
    private String timeZone;

    // TODO: Migrate Elasticsearch to new Elasticsearch Java Client (co.elastic.clients:elasticsearch-java)
    // The old TransportClient has been removed in Elasticsearch 8.x.
    // Previous ES configuration fields (es.host, es.transport.port, es.cluster.name) and
    // TransportClient bean have been commented out pending migration.

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        // mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
        // false);
        mapper.setDateFormat(new SimpleDateFormat("dd-MM-yyyy"));
        mapper.setTimeZone(TimeZone.getTimeZone(timeZone));
        return mapper;
    }

    @Bean
    public MappingJackson2HttpMessageConverter jacksonConverter(ObjectMapper objectMapper) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        return converter;
    }

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
                configurer.defaultContentType(MediaType.APPLICATION_JSON);
            }

        };
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public FlywayMigrationStrategy cleanMigrateStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }

    @Bean
    public org.egov.tracer.config.TracerProperties tracerProperties() {
        return new org.egov.tracer.config.TracerProperties();
    }

    @Bean
    public org.egov.tracer.config.ObjectMapperFactory objectMapperFactory(
            org.egov.tracer.config.TracerProperties tracerProperties,
            org.springframework.core.env.Environment environment) {
        return new org.egov.tracer.config.ObjectMapperFactory(tracerProperties, environment);
    }

    @Bean
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public org.egov.tracer.kafka.LogAwareKafkaTemplate<String, Object> logAwareKafkaTemplate(
            org.egov.tracer.config.TracerProperties tracerProperties,
            org.springframework.kafka.core.KafkaTemplate kafkaTemplate,
            org.egov.tracer.config.ObjectMapperFactory objectMapperFactory) {
        return new org.egov.tracer.kafka.LogAwareKafkaTemplate(tracerProperties, kafkaTemplate, objectMapperFactory);
    }
}
