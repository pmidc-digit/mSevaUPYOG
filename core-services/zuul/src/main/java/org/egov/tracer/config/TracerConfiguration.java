package org.egov.tracer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class TracerConfiguration {

    @Bean
    public ObjectMapperFactory objectMapperFactory() {
        return new ObjectMapperFactory();
    }

    @Bean
    public RestTemplate logAwareRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        return new RestTemplate(requestFactory);
    }
}
