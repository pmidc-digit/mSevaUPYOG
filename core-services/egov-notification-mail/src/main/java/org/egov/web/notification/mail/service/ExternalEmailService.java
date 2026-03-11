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
	    MimeMessageHelper helper;
	    try {
	        helper = new MimeMessageHelper(message, true, "UTF-8");
	        helper.setTo(email.getEmailTo().toArray(new String[0]));
	        helper.setSubject(email.getSubject());
	        helper.setText(email.getBody(), true);

	        // --- ADD THIS BLOCK ---
	        if (email.getAttachments() != null && !email.getAttachments().isEmpty()) {
	            for (String url : email.getAttachments()) {
	                try {
	                    // UrlResource downloads the PDF from the URL provided by the Water Service
	                    org.springframework.core.io.UrlResource rt = new org.springframework.core.io.UrlResource(url);
	                    String fileName = rt.getFilename();
	                    
	                    // Fallback if the URL doesn't end with a clear filename
	                    if (fileName == null || !fileName.contains(".")) {
	                        fileName = "Sanction_Letter.pdf";
	                    }
	                    
	                    helper.addAttachment(fileName, rt);
	                    log.info("Successfully attached file: " + fileName);
	                } catch (Exception e) {
	                    log.error("Error attaching file from URL: " + url, e);
	                    // We don't throw an exception here so the email still sends 
	                    // even if one attachment fails.
	                }
	            }
	        }
	        // -----------------------

	    } catch (MessagingException e) {
	        log.error("MessagingException occurred while building HTML email", e);
	        throw new RuntimeException(e);
	    }
	    
	    mailSender.send(message);
	    log.info("Email sent successfully with attachments to: " + email.getEmailTo());
	}
}
