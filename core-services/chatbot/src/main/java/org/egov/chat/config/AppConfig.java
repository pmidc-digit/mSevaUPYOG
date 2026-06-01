package org.egov.chat.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@ComponentScan("org.egov.chat")
@PropertySource("classpath:application.properties")
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        org.springframework.http.converter.json.MappingJackson2HttpMessageConverter jackson2Converter = 
            new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(objectMapper());
        
        java.util.List<org.springframework.http.converter.HttpMessageConverter<?>> converters = new java.util.ArrayList<>();
        for (org.springframework.http.converter.HttpMessageConverter<?> converter : restTemplate.getMessageConverters()) {
            String className = converter.getClass().getName();
            if (converter instanceof org.springframework.http.converter.json.MappingJackson2HttpMessageConverter 
                || className.contains("tools.jackson") 
                || className.contains("json") 
                || className.contains("Jackson")) {
                continue;
            }
            converters.add(converter);
        }
        converters.add(0, jackson2Converter);
        restTemplate.setMessageConverters(converters);
        return restTemplate;
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper(new JsonFactory());
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        return objectMapper;
    }
}
