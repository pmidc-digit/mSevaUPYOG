package org.egov.pgr.util;

import org.egov.pgr.models.ApiRequestBody;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class ApiClientUtils {

    public void sendPostRequest(StringBuilder builderUri, String ApiKey, ApiRequestBody body) {
        RestTemplate restTemplate = new RestTemplate();
        String url = builderUri.toString();

        // 1. Create and configure HTTP headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("API-KEY", ApiKey); // Replace with your API key header name

        // 2. Create the request body (Can be a Map, POJO, or JSON String)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("pmidc_complaint_number", body.getPmidcComplaintNumber());
        requestBody.put("pmidc_status", body.getPmidcStatus());

        // 3. Combine body and headers into an HttpEntity
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // 4. Execute the POST request
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        // 5. Handle response
        System.out.println("Status Code: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
    }
}
