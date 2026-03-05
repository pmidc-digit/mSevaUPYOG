package org.egov.tracer.config;

import org.egov.tracer.http.RestTemplateLoggingInterceptor;
import org.egov.tracer.http.filters.TracerFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Configuration
@EnableAspectJAutoProxy
@ComponentScan(basePackages = {"org.egov.tracer"})
@PropertySource("classpath:tracer.properties")
@EnableConfigurationProperties({TracerProperties.class})
public class TracerConfiguration {

    @Bean
    public ObjectMapperFactory objectMapperFactory(
            TracerProperties tracerProperties,
            Environment environment) {

        return new ObjectMapperFactory(tracerProperties, environment);
    }

    @Bean(name = "logAwareRestTemplate")
    public RestTemplate logAwareRestTemplate(
            TracerProperties tracerProperties) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        RestTemplate restTemplate =
                new RestTemplate(
                        new BufferingClientHttpRequestFactory(requestFactory)
                );

        restTemplate.setInterceptors(
                Collections.singletonList(
                        new RestTemplateLoggingInterceptor(tracerProperties)
                )
        );

        return restTemplate;
    }

    @Bean
    @ConditionalOnProperty(
            name = "tracer.filter.enabled",
            havingValue = "true",
            matchIfMissing = true
    )
    public FilterRegistrationBean<TracerFilter> tracerFilter(
            ObjectMapperFactory objectMapperFactory,
            TracerProperties tracerProperties) {

        final TracerFilter tracerFilter =
                new TracerFilter(tracerProperties, objectMapperFactory);

        FilterRegistrationBean<TracerFilter> registration =
                new FilterRegistrationBean<>();

        registration.setFilter(tracerFilter);
        registration.addUrlPatterns("/*");
        registration.setName("TracerFilter");
        registration.setOrder(1);

        return registration;
    }
}