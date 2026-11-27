package org.egov.investpunjab.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.config.InvestPunjabConfiguration;
import org.egov.investpunjab.models.DecryptedLoginData;
import org.egov.investpunjab.models.ServiceDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
public class EncryptionService {

    private final InvestPunjabConfiguration config;
    private final ObjectMapper objectMapper;

    @Autowired
    public EncryptionService(InvestPunjabConfiguration config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
    }

    /**
     * Decrypts AES-128-ECB encrypted login payload from Invest Punjab portal.
     * Algorithm matches Node.js: crypto.createDecipheriv('aes-128-ecb', Buffer.from(password), null)
     */
    public String decryptAesEcb(String encryptedBase64Value) {
        try {
            String key = config.getAesSecretKey();
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] decodedBytes = Base64.getDecoder().decode(encryptedBase64Value.trim());
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);

            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Error during AES ECB decryption of login message", e);
            throw new RuntimeException("Decryption failed: " + e.getMessage(), e);
        }
    }

    /**
     * Parses the pipe-separated decrypted login string into DecryptedLoginData.
     * Format: <UserID>|<Username>|<FormName>|{ServiceDetail={...}}|<Return-URL>|<Checksum>
     */
    public DecryptedLoginData parseLoginMessage(String decryptedString) {
        if (StringUtils.isBlank(decryptedString)) {
            return null;
        }

        try {
            String[] parts = decryptedString.split("\\|");
            DecryptedLoginData.DecryptedLoginDataBuilder builder = DecryptedLoginData.builder();
            builder.rawDecryptedText(decryptedString);

            if (parts.length > 0) builder.userId(parts[0].trim());
            if (parts.length > 1) builder.username(parts[1].trim());
            if (parts.length > 2) builder.formIdOrFormName(parts[2].trim());

            if (parts.length > 3) {
                String serviceDetailRaw = parts[3].trim();
                builder.serviceDetail(parseServiceDetail(serviceDetailRaw));
            }

            if (parts.length > 4) builder.returnUrl(parts[4].trim());
            if (parts.length > 5) builder.checksum(parts[5].trim());

            return builder.build();
        } catch (Exception e) {
            log.error("Failed to parse decrypted login string: {}", decryptedString, e);
            return DecryptedLoginData.builder().rawDecryptedText(decryptedString).build();
        }
    }

    private ServiceDetail parseServiceDetail(String raw) {
        try {
            // Normalize JSON if wrapped in {ServiceDetail={...}}
            String json = raw;
            if (json.startsWith("{ServiceDetail=") && json.endsWith("}")) {
                json = json.substring("{ServiceDetail=".length(), json.length() - 1);
            }
            return objectMapper.readValue(json, ServiceDetail.class);
        } catch (Exception e) {
            log.warn("Could not directly parse ServiceDetail JSON string: {}", raw, e);
            return null;
        }
    }

    /**
     * Calculates HMAC-SHA256 CheckSUM with configured secret key.
     */
    public String calculateHmac(String data) {
        try {
            String secret = config.getChecksumSecretKey();
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Error calculating HMAC checksum", e);
            throw new RuntimeException("HMAC generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Validates HMAC CheckSUM.
     */
    public boolean verifyChecksum(String data, String expectedChecksum) {
        if (StringUtils.isBlank(expectedChecksum)) {
            return false;
        }
        String calculated = calculateHmac(data);
        return calculated.equalsIgnoreCase(expectedChecksum.trim());
    }
}
