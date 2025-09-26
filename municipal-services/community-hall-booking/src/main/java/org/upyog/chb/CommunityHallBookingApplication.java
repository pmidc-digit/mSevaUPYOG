package org.upyog.chb;


import java.util.TimeZone;

import org.egov.encryption.config.EncryptionConfiguration;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;


@Import({
		TracerConfiguration.class , EncryptionConfiguration.class })
@SpringBootApplication
@ComponentScan(basePackages = { "org.upyog.chb"})
//@EnableFeignClients
@EnableTransactionManagement
@EnableScheduling
public class CommunityHallBookingApplication {
	
	@Value("${app.timezone}")
	private String timeZone;

	//TODO: is devtools disable required on prod
    public static void main(String[] args) throws Exception {
    	System.setProperty("spring.devtools.restart.enabled", "false");
        SpringApplication.run(CommunityHallBookingApplication.class, args);
    }
    
	/*
	 * @Bean public RedisTemplate<String, CommunityHallSlotAvailabilityDetail>
	 * redisTemplate(RedisConnectionFactory connectionFactory) {
	 * RedisTemplate<String, CommunityHallSlotAvailabilityDetail> template = new
	 * RedisTemplate<>(); template.setConnectionFactory(connectionFactory);
	 * template.setKeySerializer(new StringRedisSerializer());
	 * template.setDefaultSerializer(new GenericJackson2JsonRedisSerializer()); //
	 * Add some specific configuration here. Key serializers, etc. return template;
	 * }
	 */
    
	
	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
				.setTimeZone(TimeZone.getTimeZone(timeZone))//.registerModule(new JavaTimeModule())
				//Added to resolve parsing issue of String to Local date in NotificationConsumer
				.findAndRegisterModules();
	}

	@Autowired
	public MappingJackson2HttpMessageConverter jacksonConverter(ObjectMapper objectMapper) {
		MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
		converter.setObjectMapper(objectMapper);
		return converter;
	}
	 
    
  

}
