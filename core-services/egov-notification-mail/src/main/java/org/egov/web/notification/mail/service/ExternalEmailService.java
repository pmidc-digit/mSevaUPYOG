package org.egov.web.notification.mail.service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.egov.web.notification.mail.consumer.contract.Email;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
@Slf4j
public class ExternalEmailService implements EmailService {

	public static final String EXCEPTION_MESSAGE = "Exception creating HTML email";
	private JavaMailSenderImpl mailSender;

    public ExternalEmailService(JavaMailSenderImpl mailSender) {
        this.mailSender = mailSender;
    }
    
    @Override
    public void sendEmail(Email email) {
		if(email.isHTML()) {
			sendHTMLEmail(email);
		} else {
			sendTextEmail(email);
		}
    }

	private void sendTextEmail(Email email) {
		final SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setFrom(mailSender.getUsername());
		mailMessage.setTo(email.getEmailTo().toArray(new String[0]));
		mailMessage.setSubject(email.getSubject());
		mailMessage.setText(email.getBody());
		log.info("Sending text email to: {}", String.join(", ", email.getEmailTo()));
		log.info("Subject: {}", email.getSubject());
		log.info("Body: {}", email.getBody());
		mailSender.send(mailMessage);
	}
	
	
	private void sendHTMLEmail(Email email) {
	    MimeMessage message = mailSender.createMimeMessage();
	    try {
	        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
	        helper.setTo(email.getEmailTo().toArray(new String[0]));
	        helper.setSubject(email.getSubject());
	        helper.setText(email.getBody(), true);

	        if (email.getAttachments() != null && !email.getAttachments().isEmpty()) {
	            for (String urlString : email.getAttachments()) {
	                try {
	                    // 1. Download bytes to memory FIRST
	                    java.net.URL url = new java.net.URL(urlString);
	                    byte[] bytes = org.springframework.util.StreamUtils.copyToByteArray(url.openStream());
	                    
	                    if (bytes.length > 0) {
	                        // 2. Use ByteArrayResource instead of UrlResource
	                        helper.addAttachment("Sanction_Letter.pdf", new org.springframework.core.io.ByteArrayResource(bytes));
	                        log.info("Attachment buffered to memory. Size: {} bytes", bytes.length);
	                    }
	                } catch (Exception e) {
	                    log.error("Failed to buffer attachment from URL: " + urlString, e);
	                }
	            }
	        }

	        log.info("Handing over to Mail Server for delivery...");
	        mailSender.send(message);
	        log.info("Email sent successfully to: " + email.getEmailTo()); // This log should now appear

	    } catch (Exception e) {
	        log.error("CRITICAL: Error during SMTP handover", e);
	    }
	}
}
