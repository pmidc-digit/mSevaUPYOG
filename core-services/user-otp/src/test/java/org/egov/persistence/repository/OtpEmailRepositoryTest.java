package org.egov.persistence.repository;

import org.egov.persistence.contract.EmailMessage;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OtpEmailRepositoryTest {

    private static final String EMAIL_TOPIC = "email.topic";

    @Mock
    private CustomKafkaTemplate<String, EmailMessage> kafkaTemplate;

    private OtpEmailRepository repository;

    @BeforeEach
    void setUp() {
        repository = new OtpEmailRepository(kafkaTemplate, EMAIL_TOPIC);
    }

    @Test
    void shouldNotSendEmailWhenEmailAddressIsNotPresent() {

        repository.send(null, "otpNumber");

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