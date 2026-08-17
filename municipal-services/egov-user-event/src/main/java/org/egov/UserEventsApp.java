/*
 * eGov suite of products aim to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) 2016  eGovernments Foundation
 *
 *  The updated version of eGov suite of products as by eGovernments Foundation
 *  is available at http://www.egovernments.org
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see http://www.gnu.org/licenses/ or
 *  http://www.gnu.org/licenses/gpl.html .
 *
 *  In addition to the terms of the GPL license to be adhered to in using this
 *  program, the following additional terms are to be complied with:
 *
 *      1) All versions of this program, verbatim or modified must carry this
 *         Legal Notice.
 *
 *      2) Any misrepresentation of the origin of the material is prohibited. It
 *         is required that all modified versions of this material be marked in
 *         reasonable ways as different from the original version.
 *
 *      3) This license does not grant any rights to any user of the program
 *         with regards to rights under trademark law for use of the trade names
 *         or trademarks of eGovernments Foundation.
 *
 *  In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov;

import java.util.TimeZone;

import jakarta.annotation.PostConstruct;

import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@SpringBootApplication
@Import(TracerConfiguration.class)
public class UserEventsApp {

    @Value("${app.timezone}")
    private String timeZone;

    @PostConstruct
    public void initialize() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }

    @Bean
	public ObjectMapper getObjectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

		return mapper;
	}

    @Bean
    public org.springframework.boot.restclient.RestTemplateBuilder customRestTemplateBuilder() {
        return new org.springframework.boot.restclient.RestTemplateBuilder();
    }

    @Bean
    public org.springframework.boot.web.servlet.FilterRegistrationBean tracerFilter(
            org.egov.tracer.config.ObjectMapperFactory objectMapperFactory,
            org.egov.tracer.config.TracerProperties tracerProperties) {
        org.egov.tracer.http.filters.TracerFilter filter = new org.egov.tracer.http.filters.TracerFilter(tracerProperties, objectMapperFactory);
        org.springframework.boot.web.servlet.FilterRegistrationBean registrationBean = new org.springframework.boot.web.servlet.FilterRegistrationBean(filter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setName("TracerFilter");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    @Bean
    @Primary
    public org.springframework.web.client.RestTemplate logAwareRestTemplate(org.egov.tracer.config.TracerProperties tracerProperties) {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        org.springframework.http.client.BufferingClientHttpRequestFactory bufferingFactory = new org.springframework.http.client.BufferingClientHttpRequestFactory(requestFactory);
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(bufferingFactory);
        restTemplate.setInterceptors(java.util.Collections.singletonList(new org.egov.tracer.http.RestTemplateLoggingInterceptor(tracerProperties)));
        return restTemplate;
    }
    @Bean
    @Primary
    public org.egov.tracer.ExceptionAdvise exceptionAdvise() {
        return new org.egov.tracer.ExceptionAdvise();
    }

    @Bean
    public static org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor removeKafkaConsumerErrorHandler() {
        return new org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor() {
            @Override
            public void postProcessBeanDefinitionRegistry(org.springframework.beans.factory.support.BeanDefinitionRegistry registry) throws org.springframework.beans.BeansException {
                if (registry.containsBeanDefinition("kafkaConsumerErrorHandler")) {
                    registry.removeBeanDefinition("kafkaConsumerErrorHandler");
                }
            }

            @Override
            public void postProcessBeanFactory(org.springframework.beans.factory.config.ConfigurableListableBeanFactory beanFactory) throws org.springframework.beans.BeansException {
            }
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(UserEventsApp.class, args);
    }
}
