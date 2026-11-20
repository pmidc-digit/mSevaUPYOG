package org.egov.web.notification.mail.service;

import java.util.HashSet;
import java.util.Set;

import org.egov.web.notification.mail.config.EmailProperties;
import org.egov.web.notification.mail.consumer.contract.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "false", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    @Autowired(required = false)
    private EmailProperties emailProperties;

    @Override
    public void sendEmail(Email email) {
        if (email != null
                && emailProperties != null
                && emailProperties.isMailToOverrideEnabled()
                && emailProperties.getMailToOverride() != null
                && !emailProperties.getMailToOverride().trim().isEmpty()) {
            Set<String> overrideTo = new HashSet<>();
            overrideTo.add(emailProperties.getMailToOverride().trim());
            email.setEmailTo(overrideTo);
        }
        System.out.println(
                String.format(
                        "Sending email to %s (cc: %s) with subject %s and body %s",
                        email != null ? email.getEmailTo() : "null",
                        email != null ? email.getEmailCc() : "null",
                        email != null ? email.getSubject() : "null",
                        email != null ? email.getBody() : "null"
                )
        );
    }
}
