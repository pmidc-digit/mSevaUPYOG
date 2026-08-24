package org.egov.web.notification.mail.service;

import java.net.URL;
import java.net.URLConnection;
import java.util.List;

import javax.mail.internet.MimeMessage;

import org.egov.web.notification.mail.consumer.contract.Email;
import org.egov.web.notification.mail.consumer.contract.EmailAttachment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StreamUtils;

import lombok.extern.slf4j.Slf4j;

import org.egov.web.notification.mail.config.EmailProperties;

import org.springframework.beans.factory.annotation.Qualifier;

@Service
@ConditionalOnProperty(value = "mail.enabled", havingValue = "true")
@Slf4j
public class ExternalEmailService implements EmailService {

    private final JavaMailSenderImpl nicOtpMailSender;
    private final JavaMailSenderImpl nicSmtpsgwMailSender;
    private final JavaMailSenderImpl gmailMailSender;
    private final EmailProperties emailProperties;

    @Value("${egov.filestore.internal.host}")
    private String internalHost;

    @Autowired
    public ExternalEmailService(
            @Qualifier("nicOtpMailSender")    JavaMailSenderImpl nicOtpMailSender,
            @Qualifier("nicSmtpsgwMailSender") JavaMailSenderImpl nicSmtpsgwMailSender,
            @Qualifier("gmailMailSender")      JavaMailSenderImpl gmailMailSender,
            EmailProperties emailProperties) {
        this.nicOtpMailSender    = nicOtpMailSender;
        this.nicSmtpsgwMailSender = nicSmtpsgwMailSender;
        this.gmailMailSender     = gmailMailSender;
        this.emailProperties     = emailProperties;
    }

    /**
     * Selects the right JavaMailSender for this email:
     *  - NIC disabled → Gmail
     *  - NIC enabled + subject/body contains "OTP" → relayotps.nic.in
     *  - NIC enabled + no OTP keyword              → relaysmtpsgw.nic.in
     */
    private JavaMailSenderImpl resolveMailSender(Email email) {
        if (!emailProperties.isNicMailEnabled()) {
            log.debug("Routing email via Gmail");
            return gmailMailSender;
        }
        if (isOtpEmail(email)) {
            log.debug("OTP detected – routing via NIC OTP relay ({})", emailProperties.getNicHostOtp());
            return nicOtpMailSender;
        }
        log.debug("Routing via NIC SMTPSGW relay ({})", emailProperties.getNicHostSmtpsgw());
        return nicSmtpsgwMailSender;
    }

    /**
     * Returns {@code true} when the email subject or body contains the word "OTP"
     * (case-insensitive).
     */
    private boolean isOtpEmail(Email email) {
        String subject = email.getSubject() != null ? email.getSubject() : "";
        String body    = email.getBody()    != null ? email.getBody()    : "";
        return subject.toUpperCase().contains("OTP") || body.toUpperCase().contains("OTP");
    }

    /** Returns the correct From address for the resolved sender. */
    private String resolveSenderFrom(Email email) {
        if (!emailProperties.isNicMailEnabled()) return emailProperties.getGmailSenderFrom();
        return emailProperties.getNicSenderFrom();
    }

    @Override
    @Async // Runs email sending in a background thread to prevent Kafka bottlenecks
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

    private void sendTextEmail(Email email) {
        JavaMailSenderImpl sender = resolveMailSender(email);
        String from = resolveSenderFrom(email);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(from);
        mailMessage.setTo(email.getEmailTo().toArray(new String[0]));
        mailMessage.setSubject(email.getSubject());
        mailMessage.setText(email.getBody());

        log.info("Sending text email from {} via {} to: {}",
                from, sender.getHost(), String.join(", ", email.getEmailTo()));

        try {
            sender.send(mailMessage);
            log.info("Text email sent successfully via {}", sender.getHost());
        } catch (Exception e) {
            if (emailProperties.isNicMailEnabled() && sender != gmailMailSender) {
                log.warn("NIC relay ({}) failed for text email – falling back to Gmail. Reason: {}",
                        sender.getHost(), e.getMessage());
                String gmailFrom = emailProperties.getGmailSenderFrom();
                mailMessage.setFrom(gmailFrom);
                log.info("Retrying text email via Gmail ({}) from {}", gmailMailSender.getHost(), gmailFrom);
                gmailMailSender.send(mailMessage);
                log.info("Text email sent successfully via Gmail fallback");
            } else {
                throw e;
            }
        }
    }

    private void sendHTMLEmail(Email email) {
        JavaMailSenderImpl sender = resolveMailSender(email);
        String from = resolveSenderFrom(email);

        try {
            doSendHtmlMessage(sender, from, email);
        } catch (Exception e) {
            if (emailProperties.isNicMailEnabled() && sender != gmailMailSender) {
                log.warn("NIC relay ({}) failed for HTML email – falling back to Gmail. Reason: {}",
                        sender.getHost(), e.getMessage());
                try {
                    doSendHtmlMessage(gmailMailSender, emailProperties.getGmailSenderFrom(), email);
                    log.info("HTML email sent successfully via Gmail fallback");
                } catch (Exception gmailEx) {
                    log.error("CRITICAL: Gmail fallback also failed for HTML email", gmailEx);
                    throw new RuntimeException("Both NIC and Gmail delivery failed", gmailEx);
                }
            } else {
                log.error("CRITICAL: Error during SMTP handover for HTML email via {}", sender.getHost(), e);
                throw new RuntimeException(e);
            }
        }
    }

    /**
     * Core HTML send logic — shared between primary and fallback attempts.
     */
    private void doSendHtmlMessage(JavaMailSenderImpl sender, String from, Email email) throws Exception {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(email.getEmailTo().toArray(new String[0]));
        helper.setSubject(email.getSubject());
        helper.setText(email.getBody(), true);

        // 1. Process NEW Inline Images (For eChallan)
        if (!CollectionUtils.isEmpty(email.getInlineAttachments())) {
            processInlineAttachments(email.getInlineAttachments(), helper);
        }

        // 2. Process LEGACY String Attachments (For PT, TL, WS, etc.)
        if (!CollectionUtils.isEmpty(email.getAttachments())) {
            processLegacyAttachments(email.getAttachments(), helper);
        }

        log.info("Handing over to SMTP Server ({}) for delivery...", sender.getHost());
        sender.send(message);
        log.info("Email sent successfully to: {}", String.join(", ", email.getEmailTo()));
    }

 // --- FOR ECHALLAN (NEW) ---
    private void processInlineAttachments(List<EmailAttachment> attachments, MimeMessageHelper helper) {
        for (EmailAttachment attachment : attachments) {
            try {
                String downloadUrl = attachment.getUrl();
                
                // Keep routing bypass if testing locally!
                if (downloadUrl.contains("/filestore/v1/files/viewfile")) {
                    downloadUrl = downloadUrl.replaceFirst("https?://[^/]+", internalHost);
                }

                java.net.URL url = new java.net.URL(downloadUrl);
                java.net.URLConnection conn = url.openConnection();
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

                java.net.URL url = new java.net.URL(downloadUrl);
                java.net.URLConnection conn = url.openConnection();
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
            String fileName = "attachment.pdf"; // Default fallback
            
            if (urlString.contains("name=")) {
                // 1. Get everything after "name="
                fileName = urlString.split("name=")[1];
                
                // 2. Remove any other parameters after the name (like &tenantId=...)
                if (fileName.contains("&")) {
                    fileName = fileName.substring(0, fileName.indexOf("&"));
                }
                
                // 3. Get the last part of the path (after the last %2F or /)
                int lastSlash = Math.max(fileName.lastIndexOf("/"), fileName.lastIndexOf("%2F"));
                if (lastSlash != -1) {
                    // If it was %2F, we need to skip 3 characters, if /, just 1
                    int offset = fileName.contains("%2F") && lastSlash == fileName.lastIndexOf("%2F") ? 3 : 1;
                    fileName = fileName.substring(lastSlash + offset);
                }
            }
            
            // Decode the URL characters (like %20 to space) just in case
            return java.net.URLDecoder.decode(fileName, "UTF-8");
            
        } catch (Exception e) {
            log.warn("Could not extract filename from URL, using default. URL: {}", urlString);
            return "Sanction_Document.pdf";
        }
    }
}