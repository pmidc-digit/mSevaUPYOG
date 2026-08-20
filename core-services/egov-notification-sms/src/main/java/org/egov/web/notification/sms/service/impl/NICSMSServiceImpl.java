package org.egov.web.notification.sms.service.impl;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

import org.egov.web.notification.sms.config.SMSProperties;
import org.egov.web.notification.sms.models.Sms;
import org.egov.web.notification.sms.service.BaseSMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@ConditionalOnProperty(value = "sms.provider.class", havingValue = "NIC", matchIfMissing = true)
public class NICSMSServiceImpl extends BaseSMSService {

    @Autowired
    private SMSProperties smsProperties;

    private SSLContext sslContext;

    @PostConstruct
    public void postConstruct() {
        log.info("NIC SMS Service initializing...");

        try {
            sslContext = SSLContext.getInstance("TLSv1.2");

            if (smsProperties.isVerifyCertificate()) {

                try (InputStream is = getClass().getClassLoader()
                        .getResourceAsStream("smsgwsmsgovin.cer")) {

                    CertificateFactory cf = CertificateFactory.getInstance("X.509");
                    X509Certificate cert = (X509Certificate) cf.generateCertificate(is);

                    KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());
                    ks.load(null);
                    ks.setCertificateEntry("sms-cert", cert);

                    TrustManagerFactory tmf =
                            TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                    tmf.init(ks);

                    sslContext.init(null, tmf.getTrustManagers(), null);

                }

            } else {
                log.info("SSL certificate verification disabled");

                sslContext.init(null, new javax.net.ssl.TrustManager[]{
                        new javax.net.ssl.X509TrustManager() {
                            public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                            public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {}
                            public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[0]; }
                        }
                }, null);
            }

        } catch (Exception e) {
            log.error("Error initializing SSL context", e);
        }
    }

    @Override
    protected void submitToExternalSmsService(Sms sms) {

        try {
            String url = resolveGatewayUrl(sms);
            StringBuilder finalData = new StringBuilder();

            boolean isOtp = isOtpMessage(sms);

            if (isOtp) {
                finalData.append("username=").append(smsProperties.getUsername());
                finalData.append("&pin=").append(smsProperties.getPassword());
            } else {
                finalData.append("username=").append(smsProperties.getSmsUsername());
                finalData.append("&pin=").append(smsProperties.getSmsPassword());
            }

            String smsBody = sms.getMessage();

            String[] parts = smsBody.split("\\|");

            if (parts.length > 1) {
                String templateId = parts[2];
                sms.setTemplateId(templateId);
                smsBody = parts[0];
            } else if (StringUtils.isEmpty(sms.getTemplateId())) {
                log.warn("Template ID missing, SMS not sent");
                return;
            }

            String message = URLEncoder.encode(smsBody, StandardCharsets.UTF_8);

            finalData.append("&message=").append(message);
            finalData.append("&mnumber=91").append(sms.getMobileNumber());
            finalData.append("&signature=").append(smsProperties.getSenderid());
            finalData.append("&dlt_entity_id=").append(smsProperties.getSmsEntityId());

            finalData.append("&dlt_template_id=")
                    .append(sms.getTemplateId() != null
                            ? sms.getTemplateId()
                            : smsProperties.getSmsDefaultTmplid());

            if (smsProperties.isSmsEnabled()) {

                HttpsURLConnection conn =
                        (HttpsURLConnection) new URL(url + "?" + finalData).openConnection();

                conn.setSSLSocketFactory(sslContext.getSocketFactory());
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                BufferedReader rd = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));

                StringBuilder response = new StringBuilder();
                String line;

                while ((line = rd.readLine()) != null) {
                    response.append(line);
                }

                rd.close();
                conn.disconnect();

                log.info("SMS Response: {}", response);

            } else {
                log.info("SMS disabled. Data: {}", finalData);
            }

        } catch (Exception e) {
            log.error("Error sending SMS to {}", sms.getMobileNumber(), e);
        }
    }

//    private boolean textIsInEnglish(String text) {
//        ArrayList<Character.UnicodeBlock> english = new ArrayList<>();
//        english.add(Character.UnicodeBlock.BASIC_LATIN);
//        english.add(Character.UnicodeBlock.LATIN_1_SUPPLEMENT);
//        english.add(Character.UnicodeBlock.LATIN_EXTENDED_A);
//        english.add(Character.UnicodeBlock.GENERAL_PUNCTUATION);
//
//        for (char c : text.toCharArray()) {
//            if (!english.contains(Character.UnicodeBlock.of(c))) {
//                return false;
//            }
//        }
//        return true;
//    }
}