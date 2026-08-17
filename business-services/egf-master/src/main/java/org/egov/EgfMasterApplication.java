package org.egov;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@Import({ TracerConfiguration.class })
@SpringBootApplication
public class EgfMasterApplication {

	public static void main(String[] args) {
		SpringApplication.run(EgfMasterApplication.class, args);
	}

	@Value("${app.timezone}")
	private String timeZone;

	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
	}

	@Bean
	public ObjectMapper objectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
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
	public org.springframework.boot.web.client.RestTemplateBuilder restTemplateBuilder() {
		return new org.springframework.boot.web.client.RestTemplateBuilder();
	}

	@Bean
	public org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate() {
		java.util.Map<String, Object> props = new java.util.HashMap<>();
		props.put(org.apache.kafka.clients.producer.ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
		props.put(org.apache.kafka.clients.producer.ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class);
		props.put(org.apache.kafka.clients.producer.ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, org.springframework.kafka.support.serializer.JsonSerializer.class);
		return new org.springframework.kafka.core.KafkaTemplate<>(new org.springframework.kafka.core.DefaultKafkaProducerFactory<>(props));
	}

	@Bean
	public org.flywaydb.core.Flyway flyway(javax.sql.DataSource dataSource) {
		org.flywaydb.core.Flyway flyway = org.flywaydb.core.Flyway.configure()
				.dataSource(dataSource)
				.baselineOnMigrate(true)
				.outOfOrder(true)
				.ignoreMigrationPatterns("*:missing", "*:ignored", "*:future")
				.table("egf_masters_schema_version")
				.locations("classpath:db/migration/main", "classpath:db/migration/seed", "classpath:db/migration/dev")
				.load();
		flyway.migrate();
		return flyway;
	}
}
