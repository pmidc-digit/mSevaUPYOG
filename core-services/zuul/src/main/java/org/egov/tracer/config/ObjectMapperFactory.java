package org.egov.tracer.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;

public class ObjectMapperFactory {
    public ObjectMapperFactory() {}
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
    
    public ObjectMapper getObjectMapper() {
        return new ObjectMapper();
    }
}
