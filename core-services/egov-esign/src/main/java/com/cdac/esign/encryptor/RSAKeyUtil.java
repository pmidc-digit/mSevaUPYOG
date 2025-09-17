package com.cdac.esign.encryptor;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

public class RSAKeyUtil {

    public static PrivateKey loadPrivateKey(String pemKey) throws Exception {
        if (pemKey == null || pemKey.isEmpty()) {
            throw new IllegalArgumentException("Private key not found in application.properties");
        }

        // Restore newlines from \n
        pemKey = pemKey.replace("\\n", "\n");

        // Remove header/footer
        String privateKeyPEM = pemKey
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        // Decode PKCS#1
        byte[] pkcs1Bytes = Base64.getDecoder().decode(privateKeyPEM);

        // Wrap PKCS#1 into PKCS#8
        byte[] pkcs8Header = new byte[]{
                0x30, (byte) 0x82,
                (byte) ((pkcs1Bytes.length + 22) >> 8),
                (byte) (pkcs1Bytes.length + 22),
                0x02, 0x01, 0x00,
                0x30, 0x0d, 0x06, 0x09,
                0x2a, (byte) 0x86, 0x48, (byte) 0x86,
                (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01,
                0x05, 0x00,
                0x04, (byte) 0x82,
                (byte) (pkcs1Bytes.length >> 8),
                (byte) (pkcs1Bytes.length)
        };

        byte[] pkcs8Bytes = new byte[pkcs8Header.length + pkcs1Bytes.length];
        System.arraycopy(pkcs8Header, 0, pkcs8Bytes, 0, pkcs8Header.length);
        System.arraycopy(pkcs1Bytes, 0, pkcs8Bytes, pkcs8Header.length, pkcs1Bytes.length);

        // Build PrivateKey
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(pkcs8Bytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }
}
