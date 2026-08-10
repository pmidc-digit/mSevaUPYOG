package org.egov.wf.repository;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyBoolean;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import static org.mockito.ArgumentMatchers.anyString;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.test.context.ContextConfiguration;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import static org.mockito.ArgumentMatchers.*;



@ExtendWith(MockitoExtension.class)
class ServiceRequestRepositoryTest {
    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ServiceRequestRepository serviceRequestRepository;

    @Test
    void testFetchResult() throws RestClientException {
        HashMap<Object, Object> objectObjectMap = new HashMap<>();

        when(restTemplate.postForObject(
                anyString(),
                any(),
                eq(Map.class),
                any(Object[].class)   
        )).thenReturn(objectObjectMap);

        when(this.objectMapper.configure(
                any(com.fasterxml.jackson.databind.SerializationFeature.class),
                anyBoolean()
        )).thenReturn(this.objectMapper);

        Object actualFetchResultResult =
                this.serviceRequestRepository.fetchResult(new StringBuilder("Str"), "Request");

        assertSame(objectObjectMap, actualFetchResultResult);
        assertTrue(((Map<Object, Object>) actualFetchResultResult).isEmpty());

        verify(this.restTemplate).postForObject(
                anyString(),
                any(),
                eq(Map.class),
                any(Object[].class)   
        );
    }


    @Test
    void testFetchResultWithPostObject() throws RestClientException {
    	lenient().when(this.restTemplate.postForObject((String) any(), (Object) any(), (Class<Object>) any(), (Object[]) any()))
                .thenReturn("Post For Object");

    	lenient().when(this.objectMapper.configure((com.fasterxml.jackson.databind.SerializationFeature) any(), anyBoolean()))
                .thenThrow(new HttpClientErrorException(HttpStatus.CONTINUE));
        assertThrows(HttpClientErrorException.class,
                () -> this.serviceRequestRepository.fetchResult(new StringBuilder("Str"), "Request"));

        verify(this.objectMapper).configure((com.fasterxml.jackson.databind.SerializationFeature) any(), anyBoolean());
    }
}

