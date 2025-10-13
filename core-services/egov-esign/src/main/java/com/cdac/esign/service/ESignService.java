package com.cdac.esign.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.BufferedInputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.springframework.core.io.ByteArrayResource;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateFactory;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.X509Certificate;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import com.cdac.esign.encryptor.RSAKeyUtil;
import com.cdac.esign.form.FormXmlDataAsp;
import com.cdac.esign.form.RequestXmlForm;

import com.cdac.esign.xmlparser.AspXmlGenerator;
import com.cdac.esign.xmlparser.XmlSigning;
//iText 7 core
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.StampingProperties;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;

//iText 7 layout
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

//iText 7 signatures
import com.itextpdf.signatures.BouncyCastleDigest;
import com.itextpdf.signatures.DigestAlgorithms;
import com.itextpdf.signatures.IExternalDigest;
import com.itextpdf.signatures.IExternalSignature;
import com.itextpdf.signatures.ITSAClient;
import com.itextpdf.signatures.PdfSigner;
import com.itextpdf.signatures.PdfSignatureAppearance;
import com.itextpdf.signatures.PrivateKeySignature;
import com.itextpdf.signatures.TSAClientBouncyCastle;

//BouncyCastle
import org.bouncycastle.jce.provider.BouncyCastleProvider;

//Java standard

import java.security.Security;






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

        // Step 1: Upload PDF to filestore API
  //      String fileStoreId = uploadPdfToFilestore(file, tenantId);
  //      logger.info("PDF uploaded to filestore with ID: {}", fileStoreId);

        // Step 2: Get PDF URL from filestore
        String pdfUrl = getPdfUrlFromFilestore(fileStoreId, tenantId);
        logger.info("Retrieved PDF URL: {}", pdfUrl);
        String pemKey = env.getProperty("esign.private.key");
    	if (pemKey == null) {
    	    logger.warn("No esign.private.key found");
    	} else {
    	    // convert escaped "\n" into real newlines (if present)
    	    String unescaped = pemKey.contains("\\n") ? pemKey.replace("\\n", System.lineSeparator()) : pemKey;


    	//    logger.info("ESign private key (FULL):\n{}", unescaped);
    	}
        PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);
        // Step 3: Download PDF from URL as byte array (in-memory processing)
        byte[] pdfBytes = downloadPdfFromUrlAsBytes(pdfUrl);
        logger.info("Downloaded PDF as byte array, size: {} bytes", pdfBytes.length);

        // Step 4: Process PDF in-memory (no disk I/O)
        Map<String, String> result = pdfEmbedder.pdfSigner(pdfBytes);
        String fileHash = result.get("hash");
        String fileStoreIds = result.get("fileStoreId");
        logger.info("Generated PDF hash: {}", fileHash);

        // Generate XML data for eSign request
        Date now = new Date();
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));

        FormXmlDataAsp formXmlDataAsp = new FormXmlDataAsp();
        Random randNum = new Random();
        int randInt = Math.abs(randNum.nextInt());

        formXmlDataAsp.setVer(env.getProperty("esign.version"));
        formXmlDataAsp.setSc(env.getProperty("esign.sc"));
        formXmlDataAsp.setTs(dateFormat.format(now));
        formXmlDataAsp.setTxn("" + fileStoreIds);
        formXmlDataAsp.setEkycId("");
        formXmlDataAsp.setEkycIdType(env.getProperty("esign.ekyc.id.type"));
        formXmlDataAsp.setAspId(env.getProperty("esign.asp.id"));
        formXmlDataAsp.setAuthMode(env.getProperty("esign.auth.mode"));
        formXmlDataAsp.setResponseSigType(env.getProperty("esign.response.sig.type"));
        formXmlDataAsp.setResponseUrl(env.getProperty("esign.response.host")+ env.getProperty("esign.response.url"));
        formXmlDataAsp.setId("1");
        formXmlDataAsp.setHashAlgorithm(env.getProperty("esign.hash.algorithm"));
        formXmlDataAsp.setDocInfo(env.getProperty("esign.doc.info"));
        formXmlDataAsp.setDocHashHex(fileHash);

        // Generate and sign XML
        String strToEncrypt = aspXmlGenerator.generateAspXml(formXmlDataAsp);
        String xmlData = "";

        try {
			/*
			 * Encryption encryption = new Encryption(); xmlData = new
			 * com.cdac.esign.xmlparser.XmlSigning().signXmlStringNew( strToEncrypt,
			 * encryption.getPrivateKey(env.getProperty("esign.private.key.filename")));
			 */
        	
        	
            
            // Use in your eSign call
             xmlData = new com.cdac.esign.xmlparser.XmlSigning()
                    .signXmlStringNew(strToEncrypt, privateKey);
             
            logger.info("XML signed and saved successfully ");
        } catch (Exception e) {
            logger.error("Error in Encryption/Signing", e);
            throw new RuntimeException("Error in Encryption/Signing", e);
        }
        String tenantSuffix = tenantId.contains(".") ? tenantId.split("\\.")[1] : tenantId;
        String aspTxnID = fileStoreIds + "-" + tenantSuffix;


        DateFormat dateFormats = new SimpleDateFormat("yy-mm");
        dateFormats.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));
        // Prepare response
        RequestXmlForm responseForm = new RequestXmlForm();
        responseForm.setId(fileStoreIds);
        responseForm.setType("1");
        responseForm.setDescription("Y");
        responseForm.seteSignRequest(xmlData);
        responseForm.setAspTxnID(aspTxnID);
        responseForm.setContentType("application/xml");

        logger.info("Document upload processed successfully, transaction ID: {}", responseForm.getAspTxnID());
        return responseForm;
    }

    public String processDocumentCompletion(String eSignResponseXml, String espTxnID, HttpServletRequest request) throws Exception {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        // 1️⃣ Parse eSign XML response
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        org.w3c.dom.Document xmlDoc = dBuilder.parse(new ByteArrayInputStream(eSignResponseXml.getBytes(StandardCharsets.UTF_8)));
        xmlDoc.getDocumentElement().normalize();

        if (!"1".equals(xmlDoc.getDocumentElement().getAttribute("status"))) {
            String errCode = xmlDoc.getDocumentElement().getAttribute("errCode");
            String errMsg = xmlDoc.getDocumentElement().getAttribute("errMsg");
            throw new RuntimeException("eSign failed: " + errCode + " - " + errMsg);
        }

        // 2️⃣ Extract signer info
        String userCertBase64 = xmlDoc.getElementsByTagName("UserX509Certificate").item(0).getTextContent();
        byte[] certBytes = Base64.getDecoder().decode(userCertBase64.replaceAll("\\s+", ""));
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        X509Certificate userCert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certBytes));

        if (userCert == null) {
            throw new IllegalStateException("Parsed user certificate is null");
        }

        
        String fileStoreId;
        String tenantSuffix;

        if (espTxnID.contains("-")) {
            String[] parts = espTxnID.split("-", 2); // Split into 2 parts
            fileStoreId = parts[0];
            tenantSuffix = parts[1];
        } else {
            // fallback if no delimiter
            fileStoreId = espTxnID;
            tenantSuffix = env.getProperty("default.tenant.id", "pb"); // default tenant
        }

        // Reconstruct full tenantId if needed
        String tenantId = tenantSuffix; 
        
        
        String subjectDN = userCert.getSubjectX500Principal().getName();
        Map<String, String> certFields = new HashMap<>();
        LdapName ldapDN = new LdapName(subjectDN);
        for (Rdn rdn : ldapDN.getRdns()) {
            certFields.put(rdn.getType(), rdn.getValue().toString());
        }

        String cn = certFields.getOrDefault("CN", "Temp User");
        String o = certFields.getOrDefault("O", "Temp Org");
        String st = certFields.getOrDefault("ST", "Temp State");
        String c = certFields.getOrDefault("C", "IN");
        String location = st + ", " + c;

        String reason = "Document signed via eSign";
        if (xmlDoc.getElementsByTagName("SignReason").getLength() > 0) {
            reason = xmlDoc.getElementsByTagName("SignReason").item(0).getTextContent();
        }

        // 3️⃣ Download PDF from filestore
//        String fileStoreId = espTxnID;
//        String tenantId = env.getProperty("default.tenant.id", "pb");
        String pdfUrl = getPdfUrlFromFilestore(fileStoreId, tenantId);
        byte[] pdfBytes = downloadPdfFromUrlAsBytes(pdfUrl);

        // 4️⃣ Stamp PDF text on first page
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)), new PdfWriter(baos));
        com.itextpdf.layout.Document docLayout = new com.itextpdf.layout.Document(pdfDoc);

        PdfPage firstPage = pdfDoc.getPage(1);
        Rectangle pageSize = firstPage.getPageSize();

        float width = 200;
        float height = 60;
        float x = pageSize.getRight() - width - 20;
        float y = pageSize.getBottom() + 20;

       
        docLayout.close();
        pdfDoc.close();

        // 5️⃣ Apply certified PKCS7 signature (locks PDF)
        PdfReader reader = new PdfReader(new ByteArrayInputStream(baos.toByteArray()));
        ByteArrayOutputStream signedBaos = new ByteArrayOutputStream();
        PdfSigner signer = new PdfSigner(reader, signedBaos, new StampingProperties().useAppendMode());
        signer.setFieldName("sigField_" + System.currentTimeMillis());
        signer.getSignatureAppearance()
        .setReason(reason)
        .setLocation(location)
        .setPageRect(new Rectangle(x, y, width, height))
        .setCertificate(userCert)
        .setRenderingMode(PdfSignatureAppearance.RenderingMode.DESCRIPTION);

        String pemKey = env.getProperty("esign.private.key");
        if (pemKey == null || pemKey.trim().isEmpty()) {
            throw new IllegalStateException("esign.private.key is not configured");
        }

        PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);
        if (privateKey == null) {
            throw new IllegalStateException("Private key could not be loaded");
        }

        // ✅ Load CA certificate
        X509Certificate caCert;
        try (InputStream caInputStream = getClass().getClassLoader().getResourceAsStream("eSign_Staging_Public.cer")) {
            if (caInputStream == null) throw new IllegalStateException("CA certificate file not found");
            caCert = (X509Certificate) cf.generateCertificate(caInputStream);
        }

        if (caCert == null) {
            throw new IllegalStateException("CA certificate is null after loading");
        }

        Certificate[] chain = new Certificate[]{userCert, caCert};

        // ✅ External signature and digest
        IExternalSignature pks = new PrivateKeySignature(privateKey, DigestAlgorithms.SHA256, "BC");
        IExternalDigest digest = new BouncyCastleDigest();

        // ✅ Timestamp client - OPTIONAL
        ITSAClient tsaClient;
        try {
            tsaClient = new TSAClientBouncyCastle(env.getProperty("timestamp.service.url", "http://timestamp.digicert.com"));
        } catch (Exception e) {
            logger.warn("⚠️ TSA client could not be initialized, proceeding without timestamp: {}", e.getMessage());
            tsaClient = null; // optionally set to null if unavailable
        }

        // ✅ Final null safety checks
        if (digest == null || pks == null || chain == null || chain.length == 0 || signer == null) {
            throw new IllegalStateException("One or more signing components are null");
        }

        // ✍️ Perform the digital signature
        try {
            logger.info("Attempting to sign PDF...");
            signer.signDetached(digest, pks, chain, null, null, tsaClient, 0, PdfSigner.CryptoStandard.CADES);
            logger.info("PDF signing complete.");
        } catch (Exception e) {
            logger.error("Signing failed:", e);
            throw new RuntimeException("Signing failed", e);
        }

        // 6️⃣ Upload signed PDF
        String fileStoreResponse = uploadPdfToFilestore(signedBaos.toByteArray(), tenantId);

        // 7️⃣ Extract fileStoreId and return URL
        String finalFileStoreId = "";
        if (fileStoreResponse.contains("fileStoreId")) {
            int idx = fileStoreResponse.indexOf("fileStoreId");
            int start = fileStoreResponse.indexOf(":", idx) + 2;
            int end = fileStoreResponse.indexOf("\"", start);
            finalFileStoreId = fileStoreResponse.substring(start, end);
        }

        return getPdfUrlFromFilestore(finalFileStoreId, tenantId);
    }




    /**
     * Calls the filestore API to get the PDF URL
     * @param fileStoreId The file store ID
     * @param tenantId The tenant ID
     * @return PDF URL from the filestore API
     * @throws Exception if API call fails
     */
    private String getPdfUrlFromFilestore(String fileStoreId, String tenantId) throws Exception {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Build the URL
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            String filesUrl = env.getProperty("filestore.files.url", "/filestore/v1/files/url");
            String url = baseUrl + filesUrl + "?tenantId=" + tenantId + "&fileStoreIds=" + fileStoreId;
            logger.info("Filestore URL: {}", url);
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("accept", env.getProperty("http.header.accept", "application/json, text/plain, */*"));
 
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Make the GET request
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            logger.info("Filestore API response status: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful()) {
                // Parse JSON response to extract PDF URL
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(response.getBody());

                // Assuming the response contains a "fileStoreIds" array with file URLs
                JsonNode fileStoreIds = jsonNode.get("fileStoreIds");
                if (fileStoreIds != null && fileStoreIds.isArray() && fileStoreIds.size() > 0) {
                    JsonNode firstFile = fileStoreIds.get(0);
                    if (firstFile.has("url")) {
                        return firstFile.get("url").asText();
                    }
                }

                throw new RuntimeException("PDF URL not found in API response");
            } else {
                throw new RuntimeException("Failed to get PDF URL from filestore API. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("Error calling filestore API", e);
            throw new RuntimeException("Failed to get PDF URL from filestore API", e);
        }
    }

    /**
     * Downloads PDF from URL as byte array (in-memory processing)
     * @param pdfUrl The PDF URL to download
     * @return The PDF content as byte array
     * @throws Exception if download fails
     */
    private byte[] downloadPdfFromUrlAsBytes(String pdfUrl) throws Exception {
        try {
            // Replace domain with configurable base URL
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            pdfUrl = pdfUrl.replaceFirst(
                "^https?://[^/]+",   // match protocol + domain
                baseUrl
            );

            URL url = new URL(pdfUrl);

            try (BufferedInputStream in = new BufferedInputStream(url.openStream());
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

                byte[] dataBuffer = new byte[8192]; // 8KB buffer
                int bytesRead;
                while ((bytesRead = in.read(dataBuffer, 0, 8192)) != -1) {
                    baos.write(dataBuffer, 0, bytesRead);
                }

                return baos.toByteArray();
            }

        } catch (Exception e) {
            logger.error("Error downloading PDF from URL as bytes: {}", pdfUrl, e);
            throw new RuntimeException("Failed to download PDF from URL as bytes", e);
        }
    }


    /**
     * Uploads PDF to filestore API
     * @param file The PDF file to upload
     * @param tenantId The tenant ID
     * @return The fileStoreId from the API response
     * @throws Exception if upload fails
     */
    public  String uploadPdfToFilestore(byte[] pdfBytes, String tenantId) throws Exception {
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
            // tenantId
            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"tenantId\"\r\n\r\n");
            out.writeBytes(tenantId + "\r\n");

            // module
            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"module\"\r\n\r\n");
            out.writeBytes(env.getProperty("default.module", "undefined") + "\r\n");

            // file
            out.writeBytes("--" + boundary + "\r\n");
            out.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"" + env.getProperty("default.signed.filename", "signed.pdf") + "\"\r\n");
            out.writeBytes("Content-Type: " + env.getProperty("default.content.type", "application/pdf") + "\r\n\r\n");
            out.write(pdfBytes);
            out.writeBytes("\r\n");

            out.writeBytes("--" + boundary + "--\r\n");
        }

        int responseCode = conn.getResponseCode();
        InputStream responseStream = (responseCode == 201) ? conn.getInputStream() : conn.getErrorStream();
        String response = readStream(responseStream);
        conn.disconnect();

        return response; // parse JSON to get fileStoreId if needed
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
