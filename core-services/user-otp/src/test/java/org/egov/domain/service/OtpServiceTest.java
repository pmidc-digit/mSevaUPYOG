package org.egov.domain.service;

import org.egov.domain.exception.UserAlreadyExistInSystemException;
import org.egov.domain.exception.UserNotExistingInSystemException;
import org.egov.domain.exception.UserNotFoundException;
import org.egov.domain.model.OtpRequest;
import org.egov.domain.model.OtpRequestType;
import org.egov.domain.model.User;
import org.egov.persistence.repository.OtpEmailRepository;
import org.egov.persistence.repository.OtpRepository;
import org.egov.persistence.repository.OtpSMSRepository;
import org.egov.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpSMSRepository otpSMSRepository;

    @Mock
    private OtpEmailRepository otpEmailRepository;

    @InjectMocks
    private OtpService otpService;

    @Test
    void shouldValidateOtpRequestForUserRegistration() {

        OtpRequest otpRequest = mock(OtpRequest.class);

        when(otpRequest.isRegistrationRequestType()).thenReturn(true);

        otpService.sendOtp(otpRequest);

        verify(otpRequest).validate();
    }

    @Test
    void shouldValidateOtpRequestForUserLogin() {

        OtpRequest otpRequest = mock(OtpRequest.class);

        when(otpRequest.isLoginRequestType()).thenReturn(true);

        when(userRepository.fetchUser(
                nullable(String.class),
                nullable(String.class),
                nullable(String.class)))
                .thenReturn(new User(1L, "foo@bar.com", "123"));

        otpService.sendOtp(otpRequest);

        verify(otpRequest).validate();
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyExistsInCaseOfRegister() {

        OtpRequest otpRequest = mock(OtpRequest.class);

        when(otpRequest.isRegistrationRequestType()).thenReturn(true);

        when(userRepository.fetchUser(
                nullable(String.class),
                nullable(String.class),
                nullable(String.class)))
                .thenReturn(new User(1L, "foo@bar.com", "123"));

        assertThrows(
                UserAlreadyExistInSystemException.class,
                () -> otpService.sendOtp(otpRequest)
        );

        verify(otpRequest).validate();
    }

    @Test
    void shouldThrowExceptionWhenUserNotExistsInCaseOfLogin() {

        OtpRequest otpRequest = mock(OtpRequest.class);

        when(otpRequest.isLoginRequestType()).thenReturn(true);

        when(userRepository.fetchUser(
                anyString(),
                anyString(),
                anyString()))
                .thenReturn(null);

        assertThrows(
                UserNotExistingInSystemException.class,
                () -> otpService.sendOtp(otpRequest)
        );

        verify(otpRequest).validate();
    }

    @Test
    void shouldValidateOtpRequestForPasswordReset() {

        otpService.sendOtp(otpRequest);

        verify(otpEmailRepository).send("foo@bar.com", otpNumber, otpRequest);
}