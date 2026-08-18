package org.egov.web.notification.sms.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.TrustAllStrategy;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.egov.web.notification.sms.config.SMSProperties;
import org.egov.web.notification.sms.models.Category;
import org.egov.web.notification.sms.models.Sms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

import javax.net.ssl.SSLContext;
import java.net.URI;
import java.util.*;

@Slf4j
public abstract class BaseSMSService implements SMSService, SMSBodyBuilder {

    @Autowired
    protected RestTemplate restTemplate;

    @Autowired
    protected SMSProperties smsProperties;

    @Autowired
    protected Environment env;

    private static final String SMS_RESPONSE_NOT_SUCCESSFUL = "Sms response not successful";

    // =========================
    // SAFE INIT (Spring Boot 4 / Spring 7 FIX)
    // =========================
    @PostConstruct
    public void init() {

        List<HttpMessageConverter<?>> converters = restTemplate.getMessageConverters();

        // SAFE remove (NO stream().findFirst().get())
        converters.removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);

        // add safe converter
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();

        converters.add(converter);
    }

    @Override
    public void sendSMS(Sms sms) {

        log.info("sendSMS: {}", sms);

        if (!sms.isValid()) return;

        if (smsProperties.isNumberBlacklisted(sms.getMobileNumber())) return;

        if (!smsProperties.isNumberWhitelisted(sms.getMobileNumber())) return;

        submitToExternalSmsService(sms);
    }

    protected abstract void submitToExternalSmsService(Sms sms);

    // =========================
    // API CALL
    // =========================
    protected <T> ResponseEntity<T> executeAPI(
            URI uri,
            HttpMethod method,
            HttpEntity<?> requestEntity,
            Class<T> type) {

        log.info("Calling SMS API: {}", uri);

        ResponseEntity<String> res =
                restTemplate.exchange(uri, method, requestEntity, String.class);

        String response = Objects.toString(res.getBody(), "");

        if (!response.contains("API000")) {
            throw new RuntimeException(SMS_RESPONSE_NOT_SUCCESSFUL);
        }

        return (ResponseEntity<T>) res;
    }

    // =========================
    // REQUEST BUILDER
    // =========================
    public MultiValueMap<String, String> getSmsRequestBody(Sms sms) {

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();

        boolean isOtp = isOtpMessage(sms);

        String username = isOtp ? smsProperties.getUsername() : smsProperties.getSmsUsername();
        String password = isOtp ? smsProperties.getPassword() : smsProperties.getSmsPassword();

        for (String key : smsProperties.getConfigMap().keySet()) {

            String value = smsProperties.getConfigMap().get(key);

            if (value.startsWith("$")) {

                switch (value) {

                    case "$username":
                        map.add(key, username);
                        break;

                    case "$password":
                        map.add(key, password);
                        break;

                    case "$senderid":
                        map.add(key, smsProperties.getSenderid());
                        break;

                    case "$mobileno":
                        map.add(key, smsProperties.getMobileNumberPrefix() + sms.getMobileNumber());
                        break;

                    case "$message":
                        map.add(key, sms.getMessage());
                        break;

                    default:
                        map.add(key, value);
                }

            } else {
                map.add(key, value);
            }
        }

        return map;
    }

    protected HttpEntity<MultiValueMap<String, String>> getRequest(Sms sms) {
        return new HttpEntity<>(getSmsRequestBody(sms), getHttpHeaders());
    }

    protected HttpHeaders getHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf(smsProperties.getContentType()));
        return headers;
    }

    // =========================
    // SSL SAFE SETUP
    // =========================
    @PostConstruct
    protected void setupSSL() {

        if (smsProperties.isVerifySSL()) return;

        try {
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(TrustAllStrategy.INSTANCE)
                    .build();

            var connectionManager =
                    PoolingHttpClientConnectionManagerBuilder.create()
                            .setSSLSocketFactory(
                                    new org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory(
                                            sslContext,
                                            NoopHostnameVerifier.INSTANCE
                                    )
                            )
                            .build();

            HttpClient httpClient = HttpClients.custom()
                    .setConnectionManager(connectionManager)
                    .build();

            restTemplate.setRequestFactory(
                    new HttpComponentsClientHttpRequestFactory(httpClient)
            );

            log.warn("SSL verification disabled");

        } catch (Exception e) {
            log.error("SSL setup failed", e);
        }
    }

    // =========================
    // HELPERS
    // =========================
    protected String resolveGatewayUrl(Sms sms) {
        return isOtpMessage(sms) ? smsProperties.getUrl() : smsProperties.getSmsUrl();
    }

    protected boolean isOtpMessage(Sms sms) {
        return sms.getCategory() != null && sms.getCategory() == Category.OTP;
    }
}