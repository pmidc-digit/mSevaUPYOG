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
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.TimeZone;

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
    private AspXmlGenerator aspXmlGenerator;

    @Autowired
    private Environment env;

    /**
     * PHASE 1: Prepare the PDF, Create Blank Signature Field, Calculate Hash, Upload Temp File.
     */
    public RequestXmlForm processDocumentUpload(String fileStoreId, String tenantId) throws Exception {

        logger.info("Processing document upload (Phase 1) for tenantId: {}", tenantId);

        // 1. Get Original PDF from FileStore
        String pdfUrl = getPdfUrlFromFilestore(fileStoreId, tenantId);
        byte[] originalPdfBytes = downloadPdfFromUrlAsBytes(pdfUrl);

        // 2. PREPARE THE PDF
        ByteArrayOutputStream preparedPdfStream = new ByteArrayOutputStream();
        PdfReader reader = new PdfReader(new ByteArrayInputStream(originalPdfBytes));
        
        // StampingProperties is used to create a new revision/modification
        PdfSigner signer = new PdfSigner(reader, preparedPdfStream, new StampingProperties());

        // A. Set Visual Appearance
        PdfSignatureAppearance appearance = signer.getSignatureAppearance();
        appearance.setPageRect(new Rectangle(400, 50, 200, 50)); 
        appearance.setPageNumber(1);
        appearance.setReason("Digitally Signed via eSign");
        appearance.setLocation("India");

        // B. Set Field Name (Must match Phase 2)
        signer.setFieldName("Signature1");

        // C. Use our helper container to Capture the Hash of the Prepared PDF
        HashCapturingContainer hashContainer = new HashCapturingContainer(PdfName.Adobe_PPKLite, PdfName.Adbe_pkcs7_detached);
        
        // D. "Sign" it (This creates the blank field, calculates hash, and closes the stream)
        signer.signExternalContainer(hashContainer, 16384); 

        // E. Extract the Hash required for e-Nigam
        String fileHash = hashContainer.getHashAsHex();
        logger.info("Generated Hash from Prepared PDF: {}", fileHash);

        // 3. CRITICAL: Upload the PREPARED PDF to FileStore
        // We must use THIS specific file in Phase 2, because the hash matches this file, NOT the original.
        byte[] preparedPdfBytes = preparedPdfStream.toByteArray();
        String tempFileResponse = uploadPdfToFilestore(preparedPdfBytes, tenantId);
        String tempFileStoreId = extractFileStoreIdFromResponse(tempFileResponse);
        
        logger.info("Uploaded Prepared PDF. Temp ID: {}", tempFileStoreId);

        // 4. Generate XML Request
        String pemKey = env.getProperty("esign.private.key");
        if (pemKey == null) logger.warn("No esign.private.key found");
        PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);

        Date now = new Date();
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));

        FormXmlDataAsp formXmlDataAsp = new FormXmlDataAsp();
        formXmlDataAsp.setVer(env.getProperty("esign.version"));
        formXmlDataAsp.setSc(env.getProperty("esign.sc"));
        formXmlDataAsp.setTs(dateFormat.format(now));
        formXmlDataAsp.setTxn(tempFileStoreId); // Use TEMP ID as TXN to track the correct file
        formXmlDataAsp.setEkycId("");
        formXmlDataAsp.setEkycIdType(env.getProperty("esign.ekyc.id.type"));
        formXmlDataAsp.setAspId(env.getProperty("esign.asp.id"));
        formXmlDataAsp.setAuthMode(env.getProperty("esign.auth.mode"));
        formXmlDataAsp.setResponseSigType(env.getProperty("esign.response.sig.type"));
        formXmlDataAsp.setResponseUrl(env.getProperty("esign.response.host") + env.getProperty("esign.response.url"));
        formXmlDataAsp.setId("1");
        formXmlDataAsp.setHashAlgorithm(env.getProperty("esign.hash.algorithm"));
        formXmlDataAsp.setDocInfo(env.getProperty("esign.doc.info"));
        formXmlDataAsp.setDocHashHex(fileHash); // Use the NEW Hash

        String strToEncrypt = aspXmlGenerator.generateAspXml(formXmlDataAsp);
        String xmlData = new com.cdac.esign.xmlparser.XmlSigning().signXmlStringNew(strToEncrypt, privateKey);

        // 5. Return Response
        RequestXmlForm responseForm = new RequestXmlForm();
        responseForm.setId(fileStoreId); // Original ID for reference
        // IMPORTANT: Sending the TEMP ID to frontend so it comes back in Phase 2
        responseForm.setAspTxnID(tempFileStoreId); 
        responseForm.seteSignRequest(xmlData);
        responseForm.setContentType("application/xml");

        return responseForm;
    }

    /**
     * PHASE 2: Process Response, Download Prepared PDF, Inject Signature.
     */
    public String processDocumentCompletion(String eSignResponseXml, String tempFileStoreId, HttpServletRequest request) throws Exception {
        logger.info("Processing Document Completion (Phase 2) for TempID: {}", tempFileStoreId);

        // 1. XML Parsing (With XXE Security Fixes)
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        dbFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbFactory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbFactory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        org.w3c.dom.Document xmlDoc = dBuilder.parse(new ByteArrayInputStream(eSignResponseXml.getBytes(StandardCharsets.UTF_8)));
        xmlDoc.getDocumentElement().normalize();

        if (!"1".equals(xmlDoc.getDocumentElement().getAttribute("status"))) {
            throw new RuntimeException("eSign failed: " + xmlDoc.getDocumentElement().getAttribute("errMsg"));
        }

        // 2. Extract Signature from Response
        NodeList sigNodes = xmlDoc.getElementsByTagName("DocSignature");
        if (sigNodes.getLength() == 0) throw new RuntimeException("DocSignature tag missing");
        
        String cleanedPkcs7 = sigNodes.item(0).getTextContent().replaceAll("\\s+", ""); 
        final byte[] encodedSig = Base64.getDecoder().decode(cleanedPkcs7);

        // 3. Download the PREPARED PDF (Not the Original)
        // We use the ID passed back from the frontend (which originated from Phase 1)
        String tenantId = env.getProperty("default.tenant.id", "pb");
        byte[] preparedPdfBytes = downloadPdfFromUrlAsBytes(getPdfUrlFromFilestore(tempFileStoreId, tenantId));

        // 4. Inject Signature using DEFERRED SIGNING
        ByteArrayOutputStream signedBaos = new ByteArrayOutputStream();
        PdfReader reader = new PdfReader(new ByteArrayInputStream(preparedPdfBytes));
        
        // Note: No StampingProperties used here, we are filling an existing field
        PdfSigner signer = new PdfSigner(reader, signedBaos, new StampingProperties());

        IExternalSignatureContainer external = new IExternalSignatureContainer() {
            @Override
            public byte[] sign(InputStream is) {
                return encodedSig; // Inject the signature bytes from CDAC
            }

            @Override
            public void modifySigningDictionary(PdfDictionary signDic) {
                // Ensure types match PAdES requirements
                signDic.put(PdfName.Filter, PdfName.Adobe_PPKLite);
                signDic.put(PdfName.SubFilter, PdfName.Adbe_pkcs7_detached);
            }
        };

        // CRITICAL: Fill the "Signature1" field created in Phase 1
        // This injects the bytes without shifting the rest of the file, preserving the hash.
        PdfSigner.signDeferred(signer.getDocument(), "Signature1", signedBaos, external);

        // 5. Upload Final Signed PDF
        String fileStoreResponse = uploadPdfToFilestore(signedBaos.toByteArray(), tenantId);
        String finalFileStoreId = extractFileStoreIdFromResponse(fileStoreResponse);
        
        return getPdfUrlFromFilestore(finalFileStoreId, tenantId);
    }

    // ==========================================
    // INNER CLASS: Hash Capturing Container
    // ==========================================
    private static class HashCapturingContainer implements IExternalSignatureContainer {
        private final PdfName filter;
        private final PdfName subFilter;
        private byte[] docHash;

        public HashCapturingContainer(PdfName filter, PdfName subFilter) {
            this.filter = filter;
            this.subFilter = subFilter;
        }

        @Override
        public byte[] sign(InputStream data) throws GeneralSecurityException {
            try {
                // 1. Read the full stream into a byte array (Java 8 compatible)
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                int nRead;
                byte[] temp = new byte[16384]; // 16KB buffer
                while ((nRead = data.read(temp, 0, temp.length)) != -1) {
                    buffer.write(temp, 0, nRead);
                }
                byte[] pdfBytes = buffer.toByteArray();

                // 2. Calculate SHA-256 Hash of the PDF byte range
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                this.docHash = digest.digest(pdfBytes);
                
                return new byte[0]; // Return empty, we are only capturing the hash here
            } catch (Exception e) {
                throw new GeneralSecurityException(e);
            }
        }

        @Override
        public void modifySigningDictionary(PdfDictionary signDic) {
            signDic.put(PdfName.Filter, filter);
            signDic.put(PdfName.SubFilter, subFilter);
        }

        public String getHashAsHex() {
            if (docHash == null) return "";
            StringBuilder hexString = new StringBuilder();
            for (byte b : docHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        }
    }

    // ==========================================
    // HELPER METHODS (FileStore / Utils)
    // ==========================================

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

    private byte[] downloadPdfFromUrlAsBytes(String pdfUrl) throws Exception {
        try {
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            
            // LOGIC: Find "/filestore", cut everything before it, and attach baseUrl
            int splitIndex = pdfUrl.indexOf("/filestore");
            
            if (splitIndex != -1) {
                // Extract part starting from /filestore...
                String relativePath = pdfUrl.substring(splitIndex);
                // Attach base URL: http://localhost:1001 + /filestore/v1/files...
                pdfUrl = baseUrl + relativePath;
            } 
            
            logger.info("Downloading PDF from Modified URL: " + pdfUrl);
            
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
            logger.error("Error downloading PDF from URL: " + pdfUrl, e);
            throw new RuntimeException("Failed to download PDF", e);
        }
    }
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

    private String extractFileStoreIdFromResponse(String response) {
        try {
            if (response.contains("fileStoreId")) {
                int idx = response.indexOf("fileStoreId");
                int start = response.indexOf(":", idx) + 2;
                int end = response.indexOf("\"", start);
                if (response.charAt(start-1) != '"') {
                     end = response.indexOf(",", start);
                     if (end == -1) end = response.indexOf("}", start);
                }
                return response.substring(start, end).replace("\"", "").trim();
            }
        } catch (Exception e) {
            logger.error("Error extracting fileStoreId", e);
        }
        return response;
    }
}