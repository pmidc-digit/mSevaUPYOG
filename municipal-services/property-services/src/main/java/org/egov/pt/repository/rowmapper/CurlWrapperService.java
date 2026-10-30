package org.egov.pt.repository.rowmapper;

import org.egov.pt.config.PropertyConfiguration;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.http.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CurlWrapperService {

    private final PropertyConfiguration config;
    private final RestTemplate restTemplate;

    @Autowired
    public CurlWrapperService(RestTemplate restTemplate, PropertyConfiguration config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    public String fetchData(String ulb, String uidNo) {
        String url = normalize(config.getThirdPartyhost()) + "/" + normalize(config.getThirdPartysubUrl())
                + "?ULB=" + ulb + "&UIDNo=" + uidNo;

        String authHeader = "Basic " + config.getThirdpartykey();
        return executeRequest(url, HttpMethod.GET, null, authHeader);
    }

    public String fetchBathindaData(String ulb, String uidNo) {
        if (StringUtils.isEmpty(uidNo) || uidNo.split("-").length != 3)
            throw new CustomException("INVALID_UID", "Invalid UID");

        String url = normalize(config.getThirdPartyBhatindahost()) + "/"
                + normalize(config.getThirdPartyBhatindasubUrl())
                + "?ULB=" + ulb + "&UIDNo=" + uidNo;

        String[] uidNoArr = uidNo.split("-");
        Map<String, String> payload = new HashMap<>();
        payload.put("Uidno", uidNoArr[0]);
        payload.put("UidnoArr1", uidNoArr[1]);
        payload.put("UidnoArr2", uidNoArr[2]);

        String authHeader = "Bearer " + getToken();
        return executeRequest(url, HttpMethod.POST, payload, authHeader);
    }

    public String fetchDataByBlock(Map<String, Object> requestParam) {
        String url = normalize(config.getThirdPartyhost()) + "/"
                + normalize(config.getThirdPartyFetchDataByBlockSubUrl());

        Map<String, Object> body = new HashMap<>(requestParam);
        body.remove("RequestInfo");

        String authHeader = "Basic " + config.getThirdpartykey();
        return executeRequest(url, HttpMethod.POST, body, authHeader);
    }

    public String getLocalitiesList() {
        String url = normalize(config.getThirdPartyBhatindahost()) + "/"
                + normalize(config.getThirdPartyBhatindaGetLocalitiesListSubUrl());

        String authHeader = "Bearer " + getToken();
        return executeRequest(url, HttpMethod.GET, null, authHeader);
    }

    public String getLocalityPropertiesList(Map<String, Object> requestParam) {
        StringBuilder urlBuilder = new StringBuilder(normalize(config.getThirdPartyBhatindahost()));
        urlBuilder.append("/").append(normalize(config.getThirdPartyBhatindaGetLocalityPropertiesListSubUrl()));

        if (requestParam.containsKey("LocalityId")) {
            urlBuilder.append("?LocalityId=").append(requestParam.get("LocalityId"));
        } else if (requestParam.containsKey("localityId")) {
            urlBuilder.append("?LocalityId=").append(requestParam.get("localityId"));
        }

        String authHeader = "Bearer " + getToken();
        return executeRequest(urlBuilder.toString(), HttpMethod.GET, null, authHeader);
    }

    private String executeRequest(String url, HttpMethod method, Object body, String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        if (method != HttpMethod.GET) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }
        headers.add("Authorization", authHeader);
        headers.add("Accept", "application/json, text/plain, */*");

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, method, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("Unexpected status: " + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String normalize(String value) {
        if (value == null)
            return "";
        value = value.trim();
        if (value.startsWith("/"))
            value = value.substring(1);
        if (value.endsWith("/"))
            value = value.substring(0, value.length() - 1);
        return value;
    }

    public String getToken() {
        String url = normalize(config.getPmidcAuthHost()) + "/" + normalize(config.getPmidcAuthPath());

        String finalUser = config.getDefaultUserName();
        String finalPass = config.getDefaultPassword();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

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
            throw new IllegalStateException(
                    String.format("Auth API error: HTTP %d, body=%s", e.getRawStatusCode(),
                            e.getResponseBodyAsString()),
                    e);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to call Auth API: " + e.getMessage(), e);
        }
    }
}
