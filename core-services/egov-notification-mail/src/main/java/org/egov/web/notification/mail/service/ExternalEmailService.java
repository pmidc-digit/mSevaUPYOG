package org.egov.web.notification.mail.service;

import java.net.URL;
import java.net.URLConnection;
import java.util.List;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.egov.web.notification.mail.consumer.contract.Email;
import org.egov.web.notification.mail.consumer.contract.EmailAttachment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StreamUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
@Slf4j
public class ExternalEmailService implements EmailService {

public static final String EXCEPTION_MESSAGE = "Exception creating HTML email";

private JavaMailSenderImpl mailSender;

@Value("${egov.filestore.internal.host}")
private String internalHost;

    private final JavaMailSender mailSender;

    public ExternalEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async // CRITICAL FIX: Runs email sending in a background thread to prevent Kafka bottlenecks
    public void sendEmail(Email email) {
@Override
@Async
public void sendEmail(Email email) {
    try {
        if (email.isHTML()) {
            sendHTMLEmail(email);
        } else {
            sendTextEmail(email);
        }
    } catch (Exception e) {
        log.error("Error in sendEmail for: " + email.getEmailTo(), e);
    }
}
        }
    }

    private void sendTextEmail(Email email) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
mailMessage.setFrom(mailSender.getUsername());
        mailMessage.setTo(email.getEmailTo().toArray(new String[0]));
        mailMessage.setSubject(email.getSubject());
        mailMessage.setText(email.getBody());
        
        log.info("Sending text email to: {}", String.join(", ", email.getEmailTo()));
        mailSender.send(mailMessage);
    }

    private void sendHTMLEmail(Email email) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailSender.getUsername());
            helper.setTo(email.getEmailTo().toArray(new String[0]));
            helper.setSubject(email.getSubject());
            helper.setText(email.getBody(), true);
            helper.setTo(email.getEmailTo().toArray(new String[0]));
            helper.setSubject(email.getSubject());
            helper.setText(email.getBody(), true);

            // 1. Process NEW Inline Images (For eChallan)
            if (!org.springframework.util.CollectionUtils.isEmpty(email.getInlineAttachments())) {
                processInlineAttachments(email.getInlineAttachments(), helper);
            }

            // 2. Process LEGACY String Attachments (For PT, TL, WS, etc.)
            if (!org.springframework.util.CollectionUtils.isEmpty(email.getAttachments())) {
                processLegacyAttachments(email.getAttachments(), helper);
            }

            log.info("Handing over to SMTP Server ({}) for delivery...", mailSender.getHost());
            mailSender.send(message);
            log.info("Email sent successfully to: {}", String.join(", ", email.getEmailTo()));

        } catch (Exception e) {
            log.error("CRITICAL: Error during SMTP handover for HTML email", e);
        }
    }

    // --- FOR ECHALLAN (NEW) ---
    private void processInlineAttachments(List<EmailAttachment> attachments, MimeMessageHelper helper) {
        for (EmailAttachment attachment : attachments) {
            try {
                String downloadUrl = attachment.getUrl();
                
                if (downloadUrl.contains("/filestore/v1/files/viewfile")) {
                    downloadUrl = downloadUrl.replaceFirst("https?://[^/]+", internalHost);
                }

                URL url = new URL(downloadUrl);
                URLConnection conn = url.openConnection();
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(7000);

                byte[] bytes = org.springframework.util.StreamUtils.copyToByteArray(conn.getInputStream());

                if (bytes != null && bytes.length > 0) {
                    org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(bytes);
                    
                    if (attachment.getContentId() != null && !attachment.getContentId().isEmpty()) {
                        helper.addInline(attachment.getContentId(), resource, attachment.getMimeType());
                        log.info("Attached INLINE image: cid:{}", attachment.getContentId());
                    } else {
                        helper.addAttachment("document.pdf", resource);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to process inline attachment: " + attachment.getUrl(), e);
            }
        }
    }

    // --- FOR OTHER MICROSERVICES (LEGACY) ---
    private void processLegacyAttachments(List<String> attachments, MimeMessageHelper helper) {
        for (String urlString : attachments) {
            try {
                String downloadUrl = urlString;
                
                if (urlString.contains("/filestore/v1/files/viewfile")) {
                    downloadUrl = urlString.replaceFirst("https?://[^/]+", internalHost);
                }

                URL url = new URL(downloadUrl);
                URLConnection conn = url.openConnection();
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(7000);

                byte[] bytes = org.springframework.util.StreamUtils.copyToByteArray(conn.getInputStream());

                if (bytes != null && bytes.length > 0) {
                    String fileName = extractFileName(urlString);
                    helper.addAttachment(fileName, new org.springframework.core.io.ByteArrayResource(bytes));
                    log.info("Attached LEGACY file: {}", fileName);
                }
            } catch (Exception e) {
                log.error("Failed to process legacy attachment: " + urlString, e);
            }
        }
    }

    /**
     * Extracts filename from Filestore URL, handling encoded slashes and query params.
     */
    private String extractFileName(String urlString) {
        try {
            String fileName = "attachment.pdf";
            
            if (urlString.contains("name=")) {
                fileName = urlString.split("name=")[1];
                
                if (fileName.contains("&")) {
                    fileName = fileName.substring(0, fileName.indexOf("&"));
                }
                
                int lastSlash = Math.max(fileName.lastIndexOf("/"), fileName.lastIndexOf("%2F"));
                if (lastSlash != -1) {
                    int offset = fileName.contains("%2F") && lastSlash == fileName.lastIndexOf("%2F") ? 3 : 1;
                    fileName = fileName.substring(lastSlash + offset);
                }
            }
            
            return java.net.URLDecoder.decode(fileName, "UTF-8");
        } catch (Exception e) {
            log.warn("Could not extract filename from URL, using default. URL: {}", urlString);
            return "Sanction_Document.pdf";
        }
    }
        }
    }
}