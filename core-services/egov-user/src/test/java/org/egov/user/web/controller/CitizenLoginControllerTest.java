package org.egov.user.web.controller;

import org.egov.user.domain.service.CitizenLoginService;
import org.egov.user.domain.service.TokenService;
import org.egov.user.domain.service.UserService;
import org.egov.user.web.contract.CitizenLoginResponse;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(MockitoJUnitRunner.class)
public class CitizenLoginControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private TokenService tokenService;

    @Mock
    private CitizenLoginService citizenLoginService;

    private MockMvc mockMvc;

    @Before
    public void setUp() {
        UserController userController = new UserController(userService, tokenService);
        ReflectionTestUtils.setField(userController, "citizenLoginService", citizenLoginService);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    public void test_citizen_login_invalid_otp_returns_oauth2_error_format() throws Exception {
        OAuth2Exception exception = new OAuth2Exception("Invalid OTP. Please enter the valid OTP. You have 6 attempt(s) remaining.");
        exception.addAdditionalInformation("auth_type", "OTP");
        exception.addAdditionalInformation("attempts_left", "6");
        exception.addAdditionalInformation("max_attempts", "7");

        when(citizenLoginService.login(any())).thenThrow(exception);

        mockMvc.perform(post("/citizen/_login")
                        .contentType(MediaType.APPLICATION_JSON_UTF8)
                        .content("{\"mobileNumber\":\"9876543210\",\"otp\":\"000000\",\"tenantId\":\"pb\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_request"))
                .andExpect(jsonPath("$.error_description").value("Invalid OTP. Please enter the valid OTP. You have 6 attempt(s) remaining."))
                .andExpect(jsonPath("$.attempts_left").value("6"))
                .andExpect(jsonPath("$.auth_type").value("OTP"))
                .andExpect(jsonPath("$.max_attempts").value("7"));
    }

    @Test
    public void test_citizen_login_locked_account_returns_oauth2_error_format() throws Exception {
        OAuth2Exception exception = new OAuth2Exception("Account is locked due to multiple failed login attempts. Locked at: 20-11-2026 05:00:00 PM IST. It will unlock at: 20-11-2026 06:00:00 PM IST (59 minute(s) remaining).");
        exception.addAdditionalInformation("account_locked", "true");
        exception.addAdditionalInformation("locked_at", "20-11-2026 05:00:00 PM IST");
        exception.addAdditionalInformation("unlock_at", "20-11-2026 06:00:00 PM IST");
        exception.addAdditionalInformation("remaining_minutes", "59");

        when(citizenLoginService.login(any())).thenThrow(exception);

        mockMvc.perform(post("/citizen/_login")
                        .contentType(MediaType.APPLICATION_JSON_UTF8)
                        .content("{\"mobileNumber\":\"9876543210\",\"otp\":\"123456\",\"tenantId\":\"pb\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_request"))
                .andExpect(jsonPath("$.error_description").value("Account is locked due to multiple failed login attempts. Locked at: 20-11-2026 05:00:00 PM IST. It will unlock at: 20-11-2026 06:00:00 PM IST (59 minute(s) remaining)."))
                .andExpect(jsonPath("$.account_locked").value("true"))
                .andExpect(jsonPath("$.locked_at").value("20-11-2026 05:00:00 PM IST"))
                .andExpect(jsonPath("$.unlock_at").value("20-11-2026 06:00:00 PM IST"))
                .andExpect(jsonPath("$.remaining_minutes").value("59"));
    }

    @Test
    public void test_citizen_login_success() throws Exception {
        CitizenLoginResponse successResponse = CitizenLoginResponse.builder()
                .multipleProfiles(false)
                .accessToken("test-access-token")
                .tokenType("bearer")
                .build();

        when(citizenLoginService.login(any())).thenReturn(successResponse);

        mockMvc.perform(post("/citizen/_login")
                        .contentType(MediaType.APPLICATION_JSON_UTF8)
                        .content("{\"mobileNumber\":\"9876543210\",\"otp\":\"123456\",\"tenantId\":\"pb\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("test-access-token"))
                .andExpect(jsonPath("$.token_type").value("bearer"));
    }
}