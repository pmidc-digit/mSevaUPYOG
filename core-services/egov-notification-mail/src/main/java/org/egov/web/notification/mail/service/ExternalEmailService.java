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
	                    java.net.URL url = new java.net.URL(urlString);
	                    java.net.URLConnection conn = url.openConnection();

	                    // Only apply the SSL bypass if the URL belongs to your trusted domain
	                    if (urlString.contains("lgpunjab.gov.in") && conn instanceof javax.net.ssl.HttpsURLConnection) {
	                        
	                        log.info("Applying internal SSL bypass for trusted domain: lgpunjab.gov.in");
	                        
	                        javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
	                            new javax.net.ssl.X509TrustManager() {
	                                public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
	                                public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
	                                public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
	                            }
	                        };

	                        javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
	                        sc.init(null, trustAllCerts, new java.security.SecureRandom());
	                        
	                        ((javax.net.ssl.HttpsURLConnection) conn).setSSLSocketFactory(sc.getSocketFactory());
	                    }

	                    // Set a timeout so the thread doesn't hang if the site is down
	                    conn.setConnectTimeout(10000); // 10 seconds
	                    conn.setReadTimeout(10000);

	                    byte[] bytes = org.springframework.util.StreamUtils.copyToByteArray(conn.getInputStream());
	                    
	                    if (bytes != null && bytes.length > 0) {
	                        String fileName = "Sanction_Letter.pdf"; 
	                        helper.addAttachment(fileName, new org.springframework.core.io.ByteArrayResource(bytes));
	                        log.info("Attachment buffered successfully. Size: {} bytes", bytes.length);
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
