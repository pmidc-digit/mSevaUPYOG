package org.egov.encryption;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.encryption.config.EncProperties;
import org.egov.encryption.config.ErrorConstants;
import org.egov.encryption.web.contract.EncReqObject;
import org.egov.encryption.web.contract.EncryptionRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
class EncryptionServiceRestConnection {

    @Autowired
    private EncProperties encProperties;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;


    Object callEncrypt(String tenantId, String type, Object value) throws IOException {
    	value = objectMapper.convertValue(value, new TypeReference<List<Map<String, Object>>>() {});
        EncReqObject encReqObject = new EncReqObject(tenantId, type, value);
        EncryptionRequest encryptionRequest = new EncryptionRequest();
        encryptionRequest.setEncryptionRequests(new ArrayList<>(Collections.singleton(encReqObject)));

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(encProperties.getEgovEncHost() + encProperties.getEgovEncEncryptPath(),
                    encryptionRequest, String.class);
            return objectMapper.readTree(response.getBody()).get(0);
        } catch (Exception e) {
            log.error(ErrorConstants.ENCRYPTION_SERVICE_ERROR_MESSAGE, e);
            throw new CustomException(ErrorConstants.ENCRYPTION_SERVICE_ERROR, ErrorConstants.ENCRYPTION_SERVICE_ERROR_MESSAGE);
        }
    }

    JsonNode callDecrypt(Object ciphertext) {
        try {
        	ciphertext = objectMapper.convertValue(ciphertext, new TypeReference<List<Map<String, Object>>>() {});
        	ResponseEntity<String> resp = restTemplate.postForEntity(
                    encProperties.getEgovEncHost() + encProperties.getEgovEncDecryptPath(), ciphertext, String.class);
        	JsonNode response = objectMapper.readTree(resp.getBody());
//            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
//                    encProperties.getEgovEncHost() + encProperties.getEgovEncDecryptPath(), ciphertext, JsonNode.class);
            return response;
        } catch (Exception e) {
            throw new CustomException(ErrorConstants.ENCRYPTION_SERVICE_ERROR, ErrorConstants.ENCRYPTION_SERVICE_ERROR_MESSAGE);
        }
    }

}