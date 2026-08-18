package org.egov.web.controller;

import org.egov.Resources;
import org.egov.domain.exception.*;
import org.egov.domain.model.*;
import org.egov.domain.service.TokenService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OtpControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private OtpController otpController;

    private final Resources resources = new Resources();

    private static final String IDENTITY = "identity";
    private static final String TENANT_ID = "tenantId";
    private static final String OTP_NUMBER = "otpNumber";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(otpController).build();
    }

    @Test
    void should_return_token() throws Exception {

        Token token = Token.builder()
                .uuid("uuid")
                .identity(IDENTITY)
                .tenantId(TENANT_ID)
                .number("randomNumber")
                .build();

        when(tokenService.create(any(TokenRequest.class))).thenReturn(token);

        mockMvc.perform(post("/v1/_create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("createOtpRequest.json")))
                .andExpect(status().isCreated());
    }

    @Test
    void should_return_token_for_search() throws Exception {

        Token token = Token.builder()
                .uuid("uuid")
                .identity(IDENTITY)
                .tenantId(TENANT_ID)
                .number("randomNumber")
                .build();

        when(tokenService.search(any(TokenSearchCriteria.class))).thenReturn(token);

        mockMvc.perform(post("/v1/_search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("otpSearchRequest.json")))
                .andExpect(status().isOk());
    }

    @Test
    void should_return_success_on_validation() throws Exception {

        Token token = Token.builder()
                .validated(true)
                .tenantId(TENANT_ID)
                .number(OTP_NUMBER)
                .identity(IDENTITY)
                .uuid("uuid")
                .build();

        when(tokenService.validate(any(ValidateRequest.class))).thenReturn(token);

        mockMvc.perform(post("/v1/_validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("validateOtpRequest.json")))
                .andExpect(status().isOk());
    }

    @Test
    void should_return_bad_request_when_invalid_request() throws Exception {

        when(tokenService.validate(any(ValidateRequest.class)))
                .thenThrow(new InvalidTokenValidateRequestException(new ValidateRequest(null, null, null)));

        mockMvc.perform(post("/v1/_validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("invalidOtpValidationRequest.json")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_token_update_fails() throws Exception {

        when(tokenService.validate(any(ValidateRequest.class)))
                .thenThrow(new TokenUpdateException(Token.builder().build()));

        mockMvc.perform(post("/v1/_validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("validateOtpRequest.json")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_validation_fails() throws Exception {

        when(tokenService.validate(any(ValidateRequest.class)))
                .thenThrow(new TokenValidationFailureException());

        mockMvc.perform(post("/v1/_validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("validateOtpRequest.json")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_token_already_used() throws Exception {

        when(tokenService.validate(any(ValidateRequest.class)))
                .thenThrow(new TokenAlreadyUsedException());

        mockMvc.perform(post("/v1/_validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("validateOtpRequest.json")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_create_invalid() throws Exception {

        when(tokenService.create(any(TokenRequest.class)))
                .thenThrow(new InvalidTokenRequestException(new TokenRequest("", "")));

        mockMvc.perform(post("/v1/_create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("invalidOtpRequest.json")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_search_invalid() throws Exception {

        when(tokenService.search(any(TokenSearchCriteria.class)))
                .thenThrow(new InvalidTokenSearchCriteriaException(new TokenSearchCriteria("", "")));

        mockMvc.perform(post("/v1/_search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resources.getFileContents("invalidOtpSearchRequest.json")))
                .andExpect(status().isBadRequest());
    }
}