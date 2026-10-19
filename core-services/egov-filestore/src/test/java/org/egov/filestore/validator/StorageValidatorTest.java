package org.egov.filestore.validator;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.filestore.config.FileStoreConfig;
import org.egov.tracer.model.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class StorageValidatorTest {

    private FileStoreConfig fileStoreConfig;
    private StorageValidator storageValidator;
    private ObjectMapper objectMapper;

    private static final String AUTH_UUID = "4e33-2355311-11222";
    private static final String AUTH_ID = "11111111";
    private static final String AUTH_ROLE = "SYSTEM";

    @BeforeEach
    void setUp() {
        fileStoreConfig = mock(FileStoreConfig.class);
        when(fileStoreConfig.getDeleteAuthorizedUserUuid()).thenReturn(AUTH_UUID);
        when(fileStoreConfig.getDeleteAuthorizedUserId()).thenReturn(AUTH_ID);
        when(fileStoreConfig.getDeleteAuthorizedRoleCode()).thenReturn(AUTH_ROLE);

        objectMapper = new ObjectMapper();
        storageValidator = new StorageValidator(fileStoreConfig, objectMapper);
    }

    private Map<String, Object> createValidRequestBody() {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> requestInfo = new HashMap<>();
        Map<String, Object> userInfo = new HashMap<>();

        userInfo.put("uuid", AUTH_UUID);
        userInfo.put("id", Long.parseLong(AUTH_ID));

        Map<String, Object> role = new HashMap<>();
        role.put("code", "SYSTEM");
        role.put("name", "System");
        userInfo.put("roles", Collections.singletonList(role));

        requestInfo.put("userInfo", userInfo);
        requestBody.put("RequestInfo", requestInfo);
        requestBody.put("tenantId", "pb.amritsar");
        requestBody.put("fileStoreIds", Collections.singletonList("test-filestore-id"));

        return requestBody;
    }

    @Test
    void testValidateDeleteRequestSuccess() {
        Map<String, Object> requestBody = createValidRequestBody();
        assertDoesNotThrow(() -> storageValidator.validateDeleteRequest(requestBody, null));
    }

    @Test
    void testValidateDeleteRequestCaseInsensitiveSuccess() {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> requestInfo = new HashMap<>();
        Map<String, Object> userInfo = new HashMap<>();

        userInfo.put("uuid", AUTH_UUID.toUpperCase());
        userInfo.put("id", AUTH_ID);

        Map<String, Object> role = new HashMap<>();
        role.put("code", "system");
        userInfo.put("roles", Collections.singletonList(role));

        requestInfo.put("userInfo", userInfo);
        requestBody.put("requestInfo", requestInfo);

        assertDoesNotThrow(() -> storageValidator.validateDeleteRequest(requestBody, null));
    }

    @Test
    void testValidateDeleteRequestViaQueryParamSuccess() throws Exception {
        Map<String, Object> requestInfo = new HashMap<>();
        Map<String, Object> userInfo = new HashMap<>();

        userInfo.put("uuid", AUTH_UUID);
        userInfo.put("id", Long.parseLong(AUTH_ID));

        Map<String, Object> role = new HashMap<>();
        role.put("code", "SYSTEM");
        userInfo.put("roles", Collections.singletonList(role));
        requestInfo.put("userInfo", userInfo);

        String jsonStr = objectMapper.writeValueAsString(Collections.singletonMap("RequestInfo", requestInfo));

        assertDoesNotThrow(() -> storageValidator.validateDeleteRequest(null, jsonStr));
    }

    @Test
    void testValidateDeleteRequestMissingUserInfoThrows() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("tenantId", "pb.amritsar");

        assertThrows(CustomException.class, () -> storageValidator.validateDeleteRequest(requestBody, null));
    }

    @Test
    void testValidateDeleteRequestInvalidUuidThrows() {
        Map<String, Object> requestBody = createValidRequestBody();
        ((Map<String, Object>) ((Map<String, Object>) requestBody.get("RequestInfo")).get("userInfo"))
                .put("uuid", "wrong-uuid-1234");

        assertThrows(CustomException.class, () -> storageValidator.validateDeleteRequest(requestBody, null));
    }

    @Test
    void testValidateDeleteRequestInvalidIdThrows() {
        Map<String, Object> requestBody = createValidRequestBody();
        ((Map<String, Object>) ((Map<String, Object>) requestBody.get("RequestInfo")).get("userInfo"))
                .put("id", 9999999L);

        assertThrows(CustomException.class, () -> storageValidator.validateDeleteRequest(requestBody, null));
    }

    @Test
    void testValidateDeleteRequestMissingRoleThrows() {
        Map<String, Object> requestBody = createValidRequestBody();
        Map<String, Object> wrongRole = new HashMap<>();
        wrongRole.put("code", "CITIZEN");

        ((Map<String, Object>) ((Map<String, Object>) requestBody.get("RequestInfo")).get("userInfo"))
                .put("roles", Collections.singletonList(wrongRole));

        assertThrows(CustomException.class, () -> storageValidator.validateDeleteRequest(requestBody, null));
    }
}
