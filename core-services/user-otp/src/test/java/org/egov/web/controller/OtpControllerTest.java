package org.egov.web.controller;

import org.egov.Resources;
import org.egov.TestConfiguration;
import org.egov.domain.exception.*;
import org.egov.domain.model.OtpRequest;
import org.egov.domain.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OtpControllerTest {

    private MockMvc mockMvc;

    private final Resources resources = new Resources();

    @Mock
    private OtpService otpService;

    @InjectMocks
    private OtpController otpController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(otpController)
                .setControllerAdvice(new TestConfiguration())
                .build();
    }

    @Test
    void shouldReturnSuccessResponseWhenOtpIsSent() throws Exception {

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpSendRequest.json")))
                .andExpect(status().isCreated())
                .andExpect(content().json(resources.getFileContents("otpSendSuccessResponse.json")));

        verify(otpService).sendOtp(any(OtpRequest.class));
    }

    @Test
    void shouldReturnBadRequestWhenMandatoryFieldsMissing() throws Exception {

        lenient().doThrow(new InvalidOtpRequestException(
                        new OtpRequest("", "", null, "CITIZEN", false)))
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpRequestWithoutMandatoryFields.json")))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(resources.getFileContents("otpMandatoryFieldsErrorResponse.json")));
    }

    @Test
    void shouldReturnErrorWhenUserNotFound() throws Exception {

        lenient().doThrow(new UserNotFoundException())
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpSendLoginRequest.json")))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(resources.getFileContents("unknownMobileNumberErrorResponse.json")));
    }

    @Test
    void shouldReturnErrorWhenUserAlreadyExists() throws Exception {

        lenient().doThrow(new UserAlreadyExistInSystemException())
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpSendRegisterRequest.json")))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(resources.getFileContents("userAlreadyExistInSystemResponse.json")));
    }

    @Test
    void shouldReturnErrorWhenUserDoesNotExist() throws Exception {

        lenient().doThrow(new UserNotExistingInSystemException())
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpSendLoginRequest.json")))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(resources.getFileContents("userNotExistInSytemResponse.json")));
    }

    @Test
    void shouldReturnErrorWhenMobileNotFound() throws Exception {

        lenient().doThrow(new UserMobileNumberNotFoundException())
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpRequestWithoutMandatoryFields.json")))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(resources.getFileContents("invalidMobileNumberErrorResponse.json")));
    }

    @Test
    void shouldReturn500ForUnhandledException() throws Exception {

        String exceptionMessage = "Some exception message";

        lenient().doThrow(new RuntimeException(exceptionMessage))
                .when(otpService).sendOtp(any(OtpRequest.class));

        mockMvc.perform(post("/v1/_send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("invalidOtpSendRequest.json")))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(exceptionMessage));
    }
}