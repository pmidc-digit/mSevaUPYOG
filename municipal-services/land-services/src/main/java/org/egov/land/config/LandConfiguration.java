package org.egov.land.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Configuration
public class LandConfiguration {

	@Value("${kafka.config.bootstrap_server_config}")
	private String bootstrapServers;

	// User Config
	@Value("${egov.user.host}")
	private String userHost;

	@Value("${egov.user.context.path}")
	private String userContextPath;

	@Value("${egov.user.create.path}")
	private String userCreateEndpoint;

	@Value("${egov.user.search.path}")
	private String userSearchEndpoint;

	@Value("${egov.user.update.path}")
	private String userUpdateEndpoint;

	// Location Config
	@Value("${egov.location.host}")
	private String locationHost;

	@Value("${egov.location.context.path}")
	private String locationContextPath;

	@Value("${egov.location.endpoint}")
	private String locationEndpoint;

	@Value("${egov.location.hierarchyTypeCode}")
	private String hierarchyTypeCode;

	@Value("${egov.bpa.default.limit}")
	private Integer defaultLimit;

	@Value("${egov.bpa.default.offset}")
	private Integer defaultOffset;

	@Value("${egov.bpa.max.limit}")
	private Integer maxSearchLimit;

	// MDMS
	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsEndPoint;

	//landInfo
//	
//	@Value("${egov.landinfo.host}")
//	private String landInfoHost;
//	
//	@Value("${egov.landinfo.create.endpoint}")
//	private String landInfoCreate;
//	
//	@Value("${egov.landinfo.update.endpoint}")
//	private String landInfoUpdate;
//	
//	@Value("${egov.landinfo.search.endpoint}")
//	private String landInfoSearch;
	
	@Value("${persister.save.landinfo.topic}")
	private String saveLandInfoTopic;
	
	@Value("${persister.update.landinfo.topic}")
	private String updateLandInfoTopic;
	
//	@Value("#{${appSrvTypeBussSrvCode}}")
//	private Map<String,Map<String,String>> appSrvTypeBussSrvCode;

	@Bean
	public Map<String, Object> producerConfigs() {
		Map<String, Object> props = new HashMap<>();
		props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
		props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
		props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, ObjectToBytesSerializer.class);
		return props;
	}

	@Bean
	public ProducerFactory<String, Object> producerFactory() {
		return new DefaultKafkaProducerFactory<>(producerConfigs());
	}

	@Bean
	public KafkaTemplate<String, Object> kafkaTemplate() {
		return new KafkaTemplate<>(producerFactory());
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	}

	public static class ObjectToBytesSerializer implements org.apache.kafka.common.serialization.Serializer<Object> {

		private final ObjectMapper objectMapper = new ObjectMapper();

		@Override
		public byte[] serialize(String topic, Object data) {
			if (data == null) {
				return null;
			}
			try {
				return objectMapper.writeValueAsBytes(data);
			} catch (Exception ex) {
				throw new IllegalArgumentException("Unable to serialize Kafka message payload", ex);
			}
		}
	}

}
