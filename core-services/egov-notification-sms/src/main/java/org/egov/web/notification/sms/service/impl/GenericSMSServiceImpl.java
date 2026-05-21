package org.egov.web.notification.sms.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.egov.web.notification.sms.models.Sms;
import org.egov.web.notification.sms.service.BaseSMSService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@Slf4j
@ConditionalOnProperty(value = "sms.provider.class", matchIfMissing = true, havingValue = "Generic")
public class GenericSMSServiceImpl extends BaseSMSService {

    @Value("${sms.url.dont_encode_url:true}")
    private boolean dontEncodeURL;

    @Override
    protected void submitToExternalSmsService(Sms sms) {
        final String url = resolveGatewayUrl(sms);

        try {
            if ("POST".equalsIgnoreCase(smsProperties.requestType)) {

                HttpEntity<MultiValueMap<String, String>> request = getRequest(sms);

                executeAPI(URI.create(url), HttpMethod.POST, request, String.class);

            } else {

                MultiValueMap<String, String> requestBody = getSmsRequestBody(sms);

                URI finalUrl = UriComponentsBuilder
                        .fromUriString(url)
                        .queryParams(requestBody)
                        .build()
                        .toUri();

                executeAPI(finalUrl, HttpMethod.GET, null, String.class);
            }

        } catch (RestClientException ex) {
            log.error("Error while sending SMS to mobileNumber={}", sms.getMobileNumber(), ex);
            throw ex;
        }
    }
}