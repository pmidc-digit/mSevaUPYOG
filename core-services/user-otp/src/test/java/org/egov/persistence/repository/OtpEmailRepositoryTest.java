package org.egov.persistence.repository;

import org.egov.persistence.contract.EmailMessage;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;
import java.util.HashMap;
import org.egov.domain.model.OtpRequest;
import org.egov.domain.service.LocalizationService;
import org.egov.domain.model.OtpRequestType;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class OtpEmailRepositoryTest {

    private static final String EMAIL_TOPIC = "email.topic";

    @Mock
    private CustomKafkaTemplate<String, EmailMessage> kafkaTemplate;

    @Mock
    private LocalizationService localizationService;

    private OtpEmailRepository repository;

    @BeforeEach
    void setUp() {
        repository = new OtpEmailRepository(kafkaTemplate, EMAIL_TOPIC);
        ReflectionTestUtils.setField(repository, "localizationService", localizationService);
    }

    @BeforeEach
    void setUp() {
        repository = new OtpEmailRepository(kafkaTemplate, EMAIL_TOPIC);
    }

    @Test
    void shouldNotSendEmailWhenEmailAddressIsNotPresent() {
        repository.send(null, "otpNumber", null);
        verify(kafkaTemplate, never()).send(any(), any());
    }

    @Test
    void shouldSendEmailMessage() {
        when(localizationService.getLocalisedMessages(anyString(), anyString(), anyString()))
                .thenReturn(new HashMap<>());
        OtpRequest otpRequest = mock(OtpRequest.class);
        when(otpRequest.getType()).thenReturn(OtpRequestType.PASSWORD_RESET);
        when(otpRequest.isRegistrationRequestType()).thenReturn(false);
        when(otpRequest.isLoginRequestType()).thenReturn(false);

        final EmailMessage expectedEmailMessage = EmailMessage.builder()
                .subject("mSeva Punjab - Password Reset Verification")
                .body("Dear Citizen, Your OTP for recovering password is %s.")
                .sender("")
                .emailTo("foo@bar.com")
                .isHTML(true)
                .build();

        repository.send("foo@bar.com", "otpNumber", otpRequest);
        verify(kafkaTemplate).send(any(), any());
    }

        verify(kafkaTemplate, never()).send(any(), any());
    }

    @Test
    void shouldSendEmailMessage() {

        EmailMessage expectedEmailMessage = EmailMessage.builder()
                .subject("Password Reset")
                .body("Your OTP for recovering password is otpNumber.")
                .sender("")
                .email("foo@bar.com")
                .build();

        repository.send("foo@bar.com", "otpNumber");

        verify(kafkaTemplate)
                .send(EMAIL_TOPIC, expectedEmailMessage);
    }
}