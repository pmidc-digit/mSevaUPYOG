package com.cdac.esign.encryptor;

import java.io.StringReader;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.Security;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RSAKeyUtil {

    private static final Logger logger = LoggerFactory.getLogger(RSAKeyUtil.class);

    // Register BouncyCastle Provider once
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public static PrivateKey loadPrivateKey(String pemKey) throws Exception {
        if (pemKey == null || pemKey.isEmpty()) {
            throw new IllegalArgumentException("Private key is empty or null");
        }

        // 1. Fix formatting: Ensure real newlines are present
        // If the key comes from application.properties as a single line with "\n"
        if (pemKey.contains("\\n")) {
            pemKey = pemKey.replace("\\n", "\n");
        }

        // 2. Use Bouncy Castle PEMParser
        // This automatically handles "BEGIN RSA PRIVATE KEY" (PKCS#1) 
        // AND "BEGIN PRIVATE KEY" (PKCS#8) transparently.
        try (StringReader reader = new StringReader(pemKey);
             PEMParser pemParser = new PEMParser(reader)) {

            Object object = pemParser.readObject();

            JcaPEMKeyConverter converter = new JcaPEMKeyConverter().setProvider("BC");

            if (object instanceof PEMKeyPair) {
                // PKCS#1 Key (Traditional "BEGIN RSA PRIVATE KEY")
                PEMKeyPair pemKeyPair = (PEMKeyPair) object;
                KeyPair keyPair = converter.getKeyPair(pemKeyPair);
                return keyPair.getPrivate();
            } else if (object instanceof org.bouncycastle.asn1.pkcs.PrivateKeyInfo) {
                // PKCS#8 Key (Modern "BEGIN PRIVATE KEY")
                return converter.getPrivateKey((org.bouncycastle.asn1.pkcs.PrivateKeyInfo) object);
            } else {
                throw new IllegalArgumentException("Unknown Private Key format: " + object.getClass().getName());
            }
        } catch (Exception e) {
            logger.error("Failed to parse Private Key", e);
            throw new RuntimeException("Could not load Private Key. Ensure it is a valid PEM string.", e);
        }
    }
}