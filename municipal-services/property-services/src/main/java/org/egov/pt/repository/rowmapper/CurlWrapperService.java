package org.egov.pt.repository.rowmapper;

import org.egov.pt.config.PropertyConfiguration;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.http.*;

import org.springframework.web.client.RestClientResponseException;

import java.util.HashMap;
import java.util.Map;

@Service
public class CurlWrapperService {

    @Autowired
    private PropertyConfiguration config;

    private RestTemplate restTemplate;

    public CurlWrapperService(RestTemplate restTemplate, PropertyConfiguration config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    public String fetchData(String ulb, String uidNo) {

        StringBuilder urlString = new StringBuilder(config.getThirdPartyhost());
        urlString.append(config.getThirdPartysubUrl())
                .append("?ULB=")
                .append(ulb)
                .append("&UIDNo=")
                .append(uidNo);

        String authHeader = "Basic " + config.getThirdpartykey();

        try {
            URL url = new URL(urlString.toString());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json, text/plain, */*");
            connection.setRequestProperty("Authorization", authHeader);

            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                return response.toString();
            } else {
                return "GET request failed with response code: " + responseCode;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    public String fetchBathindaData(String ulb, String uidNo) {

        if (StringUtils.isEmpty(uidNo) || uidNo.split("-").length != 3)
            throw new CustomException("INVALID_UID", "Invalid UID");

        StringBuilder urlString = new StringBuilder(config.getThirdPartyBhatindahost());
        urlString.append(config.getThirdPartyBhatindasubUrl())
                .append("?ULB=")
                .append(ulb)
                .append("&UIDNo=")
                .append(uidNo);

        String authHeader = "Bearer " + getToken();
        String[] uidNoArr = uidNo.split("-");

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Authorization", authHeader);

        // Payload as Map -> {"UserName":"...", "Password":"..."}
        Map<String, String> payload = new HashMap<>();
        payload.put("Uidno", uidNoArr[0]);
        payload.put("Uidno1", uidNoArr[1]);
        payload.put("Uidno2", uidNoArr[2]);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(urlString.toString(), HttpMethod.POST, entity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("Unexpected status: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String normalize(String host) {
        if (host == null)
            return "";
        return host.endsWith("/") ? host.substring(0, host.length() - 1) : host;
    }

    public String getToken() {
        // Build URL from custom config
        String url = normalize(config.getPmidcAuthHost()) + config.getPmidcAuthPath();

        // Fallback to defaults if not provided
        String finalUser = config.getDefaultUserName();
        String finalPass = config.getDefaultPassword();

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Payload as Map -> {"UserName":"...", "Password":"..."}
        Map<String, String> payload = new HashMap<>();
        payload.put("UserName", finalUser);
        payload.put("Password", finalPass);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("Unexpected status: " + response.getStatusCode());
            }

            Object tokenObj = response.getBody().get("Token");
            if (tokenObj == null) {
                throw new IllegalStateException("Token not present in response body.");
            }
            return tokenObj.toString();

        } catch (RestClientResponseException e) {
            // Return meaningful error with response body
            throw new IllegalStateException(
                    String.format("Auth API error: HTTP %d, body=%s", e.getRawStatusCode(),
                            e.getResponseBodyAsString()),
                    e);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to call Auth API: " + e.getMessage(), e);
        }
    }

    public String fetchDataByBlock(Map<String, Object> requestParam) {

        StringBuilder urlString = new StringBuilder(config.getThirdPartyhost());
        urlString.append(config.getThirdPartyFetchDataByBlockSubUrl());

        Map<String, Object> body = new HashMap<>(requestParam);
        body.remove("RequestInfo");

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Authorization", "Basic " + config.getThirdpartykey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(urlString.toString(), HttpMethod.POST, entity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("Unexpected status: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

}
