package org.egov.filestore.utils;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.common.contract.request.RequestInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ContextConfiguration(classes = {StorageUtil.class})
@ExtendWith(SpringExtension.class)
class StorageUtilTest {
    @MockitoBean
    private ObjectMapper objectMapper;

    @Autowired
    private StorageUtil storageUtil;

    @SuppressWarnings("unchecked")
	@Test
    void testGetRequestInfo() throws JsonProcessingException {
        RequestInfo requestInfo = new RequestInfo();
        when(objectMapper.readValue((String) any(), (Class<RequestInfo>) any())).thenReturn(requestInfo);
        assertSame(requestInfo, storageUtil.getRequestInfo("Request Info Base64"));
        verify(objectMapper).readValue((String) any(), (Class<RequestInfo>) any());
    }
}

