package org.springframework.boot.web.client;

/**
 * Dummy class to satisfy Spring's ASM class scanner during tests.
 * The egov tracer library references this class, which was removed/moved in Spring Boot 4.0.2.
 */
public class RestTemplateBuilder {
    public RestTemplateBuilder additionalInterceptors(Object... interceptors) { return this; }
    public RestTemplateBuilder interceptors(org.springframework.http.client.ClientHttpRequestInterceptor... interceptors) { return this; }
    public RestTemplateBuilder requestFactory(java.util.function.Supplier<?> requestFactory) { return this; }
    public org.springframework.web.client.RestTemplate build() { return new org.springframework.web.client.RestTemplate(); }
}
