package org.springframework.boot.web.client;

import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;
import java.util.function.Supplier;

/**
 * Dummy class to satisfy Spring's ASM class scanner during runtime.
 * The egov tracer library references this class, which was removed/moved in Spring Boot 4.0.2.
 */
public class RestTemplateBuilder {
    public RestTemplateBuilder additionalInterceptors(Object... interceptors) { return this; }
    public RestTemplateBuilder interceptors(ClientHttpRequestInterceptor... interceptors) { return this; }
    public RestTemplateBuilder requestFactory(Supplier<?> requestFactory) { return this; }
    public RestTemplate build() { return new RestTemplate(); }
}
