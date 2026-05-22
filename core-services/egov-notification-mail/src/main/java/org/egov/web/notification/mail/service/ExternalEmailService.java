package org.egov.web.notification.mail.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.egov.web.notification.mail.consumer.contract.Email;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
@Slf4j
public class ExternalEmailService implements EmailService {

    public static final String EXCEPTION_MESSAGE = "Exception creating HTML email";

    private final JavaMailSender mailSender;

    public ExternalEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(Email email) {
        if (email.isHTML()) {
            sendHTMLEmail(email);
        } else {
            sendTextEmail(email);
        }
    }

    private void sendTextEmail(Email email) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email.getEmailTo().toArray(new String[0]));
        mailMessage.setSubject(email.getSubject());
        mailMessage.setText(email.getBody());
        mailSender.send(mailMessage);
    }

    private void sendHTMLEmail(Email email) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email.getEmailTo().toArray(new String[0]));
            helper.setSubject(email.getSubject());
            helper.setText(email.getBody(), true);

            mailSender.send(message);

        } catch (MessagingException e) {
            log.error(EXCEPTION_MESSAGE, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
}