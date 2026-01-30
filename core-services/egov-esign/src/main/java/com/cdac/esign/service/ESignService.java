package com.cdac.esign.service;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.NodeList;

import com.cdac.esign.encryptor.RSAKeyUtil;
import com.cdac.esign.form.FormXmlDataAsp;
import com.cdac.esign.form.RequestXmlForm;
import com.cdac.esign.xmlparser.AspXmlGenerator;
import com.cdac.esign.xmlparser.XmlSigning;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// iText 7 Imports
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDictionary;
import com.itextpdf.kernel.pdf.PdfName;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.StampingProperties;
import com.itextpdf.signatures.IExternalSignatureContainer;
import com.itextpdf.signatures.PdfSignatureAppearance;
import com.itextpdf.signatures.PdfSigner;

@Service
public class ESignService {

    private static final Logger logger = LoggerFactory.getLogger(ESignService.class);

    @Autowired
    private PdfEmbedder pdfEmbedder;

    @Autowired
    private AspXmlGenerator aspXmlGenerator;

    @Autowired
    private XmlSigning xmlSigning;

    @Autowired
    private Environment env;

    public RequestXmlForm processDocumentUpload(String fileStoreId, String tenantId) throws Exception {

        logger.info("Processing document upload for tenantId: {}", tenantId);

        // Step 1: Get PDF URL from filestore
        String pdfUrl = getPdfUrlFromFilestore(fileStoreId, tenantId);
        logger.info("Retrieved PDF URL: {}", pdfUrl);
        
        String pemKey = env.getProperty("esign.private.key");
        logger.info("Loaded eSign Private Key from configuration \n"+pemKey);
        if (pemKey == null) {
            logger.warn("No esign.private.key found");
        }
        
        // Load Private Key for signing the XML REQUEST (not the PDF)
        PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);

        // Step 2: Download PDF from URL as byte array
        byte[] pdfBytes = downloadPdfFromUrlAsBytes(pdfUrl);
        logger.info("Downloaded PDF as byte array, size: {} bytes", pdfBytes.length);

        // Step 3: Process PDF in-memory to get Hash
        // NOTE: Ensure pdfEmbedder calculates the hash correctly for the document 
        // that will eventually be signed.
        Map<String, String> result = pdfEmbedder.pdfSigner(pdfBytes);
        String fileHash = result.get("hash");
        // We use the original fileStoreId for tracking
        String fileStoreIds = fileStoreId; 
        logger.info("Generated PDF hash: {}", fileHash);

        // Step 4: Generate XML data for eSign request
        Date now = new Date();
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));

        FormXmlDataAsp formXmlDataAsp = new FormXmlDataAsp();
        Random randNum = new Random();

        formXmlDataAsp.setVer(env.getProperty("esign.version"));
        formXmlDataAsp.setSc(env.getProperty("esign.sc"));
        formXmlDataAsp.setTs(dateFormat.format(now));
        formXmlDataAsp.setTxn("" + fileStoreIds);
        formXmlDataAsp.setEkycId("");
        formXmlDataAsp.setEkycIdType(env.getProperty("esign.ekyc.id.type"));
        formXmlDataAsp.setAspId(env.getProperty("esign.asp.id"));
        formXmlDataAsp.setAuthMode(env.getProperty("esign.auth.mode"));
        formXmlDataAsp.setResponseSigType(env.getProperty("esign.response.sig.type"));
        formXmlDataAsp.setResponseUrl(env.getProperty("esign.response.host") + env.getProperty("esign.response.url"));
        formXmlDataAsp.setId("1");
        formXmlDataAsp.setHashAlgorithm(env.getProperty("esign.hash.algorithm"));
        formXmlDataAsp.setDocInfo(env.getProperty("esign.doc.info"));
        formXmlDataAsp.setDocHashHex(fileHash);

        // Generate and sign XML
        String strToEncrypt = aspXmlGenerator.generateAspXml(formXmlDataAsp);
        String xmlData = "";

        try {
            // Sign the XML request using ASP's Private Key
            xmlData = new com.cdac.esign.xmlparser.XmlSigning().signXmlStringNew(strToEncrypt, privateKey);
            logger.info("XML signed and saved successfully");
        } catch (Exception e) {
            logger.error("Error in Encryption/Signing", e);
            throw new RuntimeException("Error in Encryption/Signing", e);
        }

        // Prepare response
        RequestXmlForm responseForm = new RequestXmlForm();
        responseForm.setId(fileStoreIds);
        responseForm.setType("1");
        responseForm.setDescription("Y");
        responseForm.seteSignRequest(xmlData);
        responseForm.setAspTxnID("" + fileStoreIds);
        responseForm.setContentType("application/xml");

        logger.info("Document upload processed successfully, transaction ID: {}", responseForm.getAspTxnID());
        return responseForm;
    }

    public String processDocumentCompletion(String eSignResponseXml, String espTxnID, HttpServletRequest request) throws Exception {
        logger.info("Processing Document Completion for TxnID: {}", espTxnID);

        // 1️⃣ Parse eSign XML response
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        org.w3c.dom.Document xmlDoc = dBuilder.parse(new ByteArrayInputStream(eSignResponseXml.getBytes(StandardCharsets.UTF_8)));
        xmlDoc.getDocumentElement().normalize();

        // Check Status
        if (!"1".equals(xmlDoc.getDocumentElement().getAttribute("status"))) {
            throw new RuntimeException("eSign failed: " + xmlDoc.getDocumentElement().getAttribute("errMsg"));
        }

        // 2️⃣ Extract PKCS7 Signature (UPDATED FOR YOUR XML)
        NodeList sigNodes = xmlDoc.getElementsByTagName("DocSignature");
        if (sigNodes.getLength() == 0) {
            throw new RuntimeException("Tag <DocSignature> not found in eSign response");
        }
        
        // Get text content and clean ALL whitespace (newlines, spaces, returns)
        String rawPkcs7 = sigNodes.item(0).getTextContent();
        String cleanedPkcs7 = rawPkcs7.replaceAll("\\s+", ""); 
        
        // Decode
        byte[] encodedSig = Base64.getDecoder().decode(cleanedPkcs7);

        // 3️⃣ Extract User Certificate (For visual appearance)
        X509Certificate userCert = null;
        try {
            NodeList certNodes = xmlDoc.getElementsByTagName("UserX509Certificate");
            if (certNodes.getLength() > 0) {
                String certRaw = certNodes.item(0).getTextContent().replaceAll("\\s+", "");
                byte[] certBytes = Base64.getDecoder().decode(certRaw);
                CertificateFactory cf = CertificateFactory.getInstance("X.509");
                userCert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certBytes));
            }
        } catch (Exception e) {
            logger.warn("Could not extract user certificate (non-fatal): {}", e.getMessage());
        }

        // 4️⃣ Download ORIGINAL PDF
        String tenantId = env.getProperty("default.tenant.id", "pb");
        byte[] pdfBytes = downloadPdfFromUrlAsBytes(getPdfUrlFromFilestore(espTxnID, tenantId));

        // 5️⃣ Inject the External Signature into PDF
        ByteArrayOutputStream signedBaos = new ByteArrayOutputStream();
        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
        PdfSigner signer = new PdfSigner(reader, signedBaos, new StampingProperties());

        // Configure Visual Appearance
        PdfSignatureAppearance appearance = signer.getSignatureAppearance();
        appearance.setPageRect(new Rectangle(400, 50, 200, 50)); 
        appearance.setPageNumber(1);
        appearance.setRenderingMode(PdfSignatureAppearance.RenderingMode.DESCRIPTION);
        appearance.setReason("Document signed via eSign");
        appearance.setLocation("India");
        
        if (userCert != null) {
            appearance.setCertificate(userCert);
        }

        // CRITICAL: Inject the blob found in <DocSignature>
        final byte[] finalSig = encodedSig;
        IExternalSignatureContainer external = new IExternalSignatureContainer() {
            @Override
            public byte[] sign(InputStream is) throws GeneralSecurityException {
                return finalSig; 
            }

            @Override
            public void modifySigningDictionary(PdfDictionary signDic) {
                signDic.put(PdfName.Filter, PdfName.Adobe_PPKLite);
                signDic.put(PdfName.SubFilter, PdfName.Adbe_pkcs7_detached);
            }
        };

        signer.signExternalContainer(external, 16384); // 16KB reserve size

        // 6️⃣ Upload signed PDF
        String fileStoreResponse = uploadPdfToFilestore(signedBaos.toByteArray(), tenantId);
        
        // 7️⃣ Return new URL
        String finalFileStoreId = extractFileStoreIdFromResponse(fileStoreResponse);
        return getPdfUrlFromFilestore(finalFileStoreId, tenantId);
    }    /**
     * Helper to extract fileStoreId from JSON string response
     */
    private String extractFileStoreIdFromResponse(String response) {
        try {
            // Simple string parsing or use ObjectMapper
            if (response.contains("fileStoreId")) {
                int idx = response.indexOf("fileStoreId");
                int start = response.indexOf(":", idx) + 2;
                int end = response.indexOf("\"", start);
                // Handle JSON format differences
                if (response.charAt(start-1) == '"') { 
                     // It was "key": "value"
                } else {
                     // It was "key": value (if number)
                     end = response.indexOf(",", start);
                     if (end == -1) end = response.indexOf("}", start);
                }
                // Safer approach with ObjectMapper if available, but string logic works for simple responses
                String id = response.substring(start, end).replace("\"", "").trim();
                return id;
            }
        } catch (Exception e) {
            logger.error("Error extracting fileStoreId", e);
        }
        // Fallback: assume the response might be the ID itself if not JSON
        return response;
    }

    // ... [getPdfUrlFromFilestore remains unchanged] ...
    private String getPdfUrlFromFilestore(String fileStoreId, String tenantId) throws Exception {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            String filesUrl = env.getProperty("filestore.files.url", "/filestore/v1/files/url");
            String url = baseUrl + filesUrl + "?tenantId=" + tenantId + "&fileStoreIds=" + fileStoreId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("accept", env.getProperty("http.header.accept", "application/json, text/plain, */*"));
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode fileStoreIds = jsonNode.get("fileStoreIds");
                if (fileStoreIds != null && fileStoreIds.isArray() && fileStoreIds.size() > 0) {
                    JsonNode firstFile = fileStoreIds.get(0);
                    if (firstFile.has("url")) {
                        return firstFile.get("url").asText();
                    }
                }
                throw new RuntimeException("PDF URL not found in API response");
            } else {
                throw new RuntimeException("Failed to get PDF URL. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error calling filestore API", e);
            throw new RuntimeException("Failed to get PDF URL from filestore API", e);
        }
    }

    // ... [downloadPdfFromUrlAsBytes remains unchanged] ...
    private byte[] downloadPdfFromUrlAsBytes(String pdfUrl) throws Exception {
        try {
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            pdfUrl = pdfUrl.replaceFirst("^https?://[^/]+", baseUrl);
            URL url = new URL(pdfUrl);

            try (BufferedInputStream in = new BufferedInputStream(url.openStream());
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] dataBuffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(dataBuffer, 0, 8192)) != -1) {
                    baos.write(dataBuffer, 0, bytesRead);
                }
                return baos.toByteArray();
            }
        } catch (Exception e) {
            logger.error("Error downloading PDF", e);
            throw new RuntimeException("Failed to download PDF", e);
        }
    }

    // ... [uploadPdfToFilestore remains unchanged] ...
    public String uploadPdfToFilestore(byte[] pdfBytes, String tenantId) throws Exception {
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
        String uploadUrl = env.getProperty("filestore.upload.url", "/filestore/v1/files");
        URL url = new URL(baseUrl + uploadUrl);

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("accept", "application/json, text/plain, */*");
        conn.setRequestProperty("content-type", "multipart/form-data; boundary=" + boundary);

        try (DataOutputStream out = new DataOutputStream(conn.getOutputStream())) {
            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"tenantId\"\r\n\r\n");
            out.writeBytes(tenantId + "\r\n");

            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"module\"\r\n\r\n");
            out.writeBytes(env.getProperty("default.module", "undefined") + "\r\n");

            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"" + env.getProperty("default.signed.filename", "signed.pdf") + "\"\r\n");
            out.writeBytes("Content-Type: " + env.getProperty("default.content.type", "application/pdf") + "\r\n\r\n");
            out.write(pdfBytes);
            out.writeBytes("\r\n");

            out.writeBytes("--" + boundary + "--\r\n");
        }

        int responseCode = conn.getResponseCode();
        InputStream responseStream = (responseCode == 201) ? conn.getInputStream() : conn.getErrorStream();
        return readStream(responseStream);
    }

    private static String readStream(InputStream inputStream) throws IOException {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int length;
        while ((length = inputStream.read(buffer)) != -1) {
            result.write(buffer, 0, length);
        }
        return result.toString("UTF-8");
    }
}