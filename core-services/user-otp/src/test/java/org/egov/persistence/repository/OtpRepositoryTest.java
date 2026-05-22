package org.egov.persistence.repository;

import org.egov.Resources;
import org.egov.domain.exception.OtpNumberNotPresentException;
import org.egov.domain.model.OtpRequest;
import org.egov.persistence.contract.Otp;
import org.egov.persistence.contract.OtpResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OtpRepositoryTest {

    private static final String HOST = "http://host";
    private static final String CREATE_OTP_URL = "/otp/_create";

    private final Resources resources = new Resources();

    private MockRestServiceServer server;

    private OtpRepository otpRepository;

    @BeforeEach
    void setUp() {

        RestTemplate restTemplate = new RestTemplate();

        otpRepository = new OtpRepository(
                restTemplate,
                HOST,
                CREATE_OTP_URL
        );

        server = MockRestServiceServer.bindTo(restTemplate).build();
    }

    @Disabled
    @Test
    void shouldReturnOtpForGivenRequest() {

        server.expect(once(), requestTo("http://host/otp/_create"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(
                        resources.getFileContents("otpRequest.json")
                ))
                .andRespond(
                        withSuccess(
                                resources.getFileContents("otpSuccessResponse.json"),
                                MediaType.APPLICATION_JSON
                        )
                );

        OtpRequest domainOtpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .build();

        String otp = otpRepository.fetchOtp(domainOtpRequest);

        server.verify();

        assertEquals("otpNumber", otp);
    }

    @Test
    void shouldThrowExceptionWhenOtpResponseIsNull() {

        OtpRequest domainOtpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .build();

        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        otpRepository = new OtpRepository(
                mockRestTemplate,
                HOST,
                CREATE_OTP_URL
        );

        when(mockRestTemplate.postForObject(
                eq("http://host/otp/_create"),
                any(),
                eq(OtpResponse.class)
        )).thenReturn(null);

        assertThrows(
                OtpNumberNotPresentException.class,
                () -> otpRepository.fetchOtp(domainOtpRequest)
        );
    }

    @Test
    void shouldThrowExceptionWhenOtpNumberInResponseIsNull() {

        OtpRequest domainOtpRequest = OtpRequest.builder()
                .tenantId("tenantId")
                .mobileNumber("mobileNumber")
                .build();

        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        otpRepository = new OtpRepository(
                mockRestTemplate,
                HOST,
                CREATE_OTP_URL
        );

        when(mockRestTemplate.postForObject(
                eq("http://host/otp/_create"),
                any(),
                eq(OtpResponse.class)
        )).thenReturn(
                new OtpResponse(
                        null,
                        Otp.builder()
                                .otp(null)
                                .build()
                )
        );

        assertThrows(
                OtpNumberNotPresentException.class,
                () -> otpRepository.fetchOtp(domainOtpRequest)
        );
    }
}