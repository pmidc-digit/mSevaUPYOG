package com.cdac.esign.service;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.egov.common.contract.request.RequestInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.cdac.esign.encryptor.RSAKeyUtil;
import com.cdac.esign.exception.ESignException;
import com.cdac.esign.form.FormXmlDataAsp;
import com.cdac.esign.form.RequestXmlForm;
import com.cdac.esign.repository.ImageStoreRepositry;
import com.cdac.esign.xmlparser.AspXmlGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
// iText 7 Imports
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDictionary;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfName;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.StampingProperties;
import com.itextpdf.kernel.pdf.canvas.parser.PdfCanvasProcessor;
import com.itextpdf.signatures.IExternalSignatureContainer;
import com.itextpdf.signatures.PdfSignatureAppearance;
import com.itextpdf.signatures.PdfSigner;
import com.jayway.jsonpath.JsonPath;
import com.cdac.esign.eventListener.LastPositionListener;

@Service
public class ESignService {

    private static final Logger logger = LoggerFactory.getLogger(ESignService.class);

    // ADDED: timeouts so a hung filestore cannot block request threads forever
    private static final int CONNECT_TIMEOUT_MS = 10000;
    private static final int READ_TIMEOUT_MS = 60000;

    @Autowired
    private AspXmlGenerator aspXmlGenerator;

    @Autowired
    private Environment env;
    
    @Autowired
    private MDMSService mdmsService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private ImageStoreRepositry imageStoreRepositry;
    
    /**
     * PHASE 1: Prepare PDF with Dynamic Location & Custom TXN ID
     */
    public RequestXmlForm processDocumentUpload(String fileStoreId, String tenantId, String signerName, String callbackUrl, RequestInfo requestInfo) throws Exception {

        logger.info("Processing Phase 1 for tenant: {}, signer: {}", tenantId, signerName);

        // ADDED: input guards
        if (StringUtils.isEmpty(fileStoreId)) {
            throw new ESignException(HttpStatus.BAD_REQUEST, "Missing fileStoreId");
        }
        if (StringUtils.isEmpty(tenantId)) {
            throw new ESignException(HttpStatus.BAD_REQUEST, "Missing tenantId");
        }
        if (tenantId.contains("'")) { // tenantId is placed inside a JsonPath filter below
            throw new ESignException(HttpStatus.BAD_REQUEST, "Invalid tenantId");
        }

        if (signerName == null || signerName.trim().isEmpty()) {
            signerName = "Authorized Signatory"; 
        }

        // ADDED: fail clearly instead of building "null..." as response url
        if (StringUtils.isEmpty(env.getProperty("esign.response.host")) || StringUtils.isEmpty(env.getProperty("esign.response.url"))) {
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Server configuration error: esign.response.host / esign.response.url is missing");
        }
        String responseUrl = env.getProperty("esign.response.host") + env.getProperty("esign.response.url");
        
        //Added Custome response Url logic
        if(!StringUtils.isEmpty(callbackUrl))
        	responseUrl += "?callbackUrl=" + callbackUrl + "&tenantId=" + tenantId;
        
        // 1. Get Original PDF
        String pdfUrl = getPdfUrlFromFilestore(fileStoreId, tenantId);
        byte[] originalPdfBytes = downloadPdfFromUrlAsBytes(pdfUrl);

        // 2. PREPARE THE PDF (Text Only)
        ByteArrayOutputStream preparedPdfStream = new ByteArrayOutputStream();
        String fileHash; // CHANGED: declared outside the try so it can be used after it
        try { // ADDED: any failure while preparing the PDF is reported as ESignException (stack trace logged)
        PdfReader reader = new PdfReader(new ByteArrayInputStream(originalPdfBytes));
        PdfSigner signer = new PdfSigner(reader, preparedPdfStream, new StampingProperties());
        
        Map<String, Object> positionMap = getEsignPosition(originalPdfBytes);
        
        PdfSignatureAppearance appearance = signer.getSignatureAppearance();
        float width = 160;
        float height = 64;
        // CHANGED: (Float) cast on the Integer/Double defaults threw ClassCastException when no text position was found
        Float lastTextY = ((Number) positionMap.getOrDefault("lastY", 50)).floatValue() - height;
        Float textX = ((Number) positionMap.getOrDefault("pageWidth", 540.0)).floatValue() - width;
        appearance.setPageRect(new Rectangle(textX, lastTextY < 0 ? 0 : lastTextY, width, height));
        appearance.setPageNumber((Integer)positionMap.getOrDefault("lastPage", 1));

        DateFormat dateFormat = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss z");
        dateFormat.setTimeZone(TimeZone.getTimeZone("IST"));
        
        // --- DYNAMIC LOCATION LOGIC ---
        // Extract "Nabha" from "pb.nabha"
        String city = getCityFromTenantId(tenantId);
        String locationText = city.equalsIgnoreCase("Punjab") ? "India" : city + ", India";

        String layer2Text = "Digitally Signed by " + signerName + "\n" +
                            "Date: " + dateFormat.format(new Date()) + "\n" +
                            "Reason: mSeva eSign\n" + 
                            "Location: " + locationText; // <--- DYNAMIC LOCATION
        
        if(requestInfo != null && requestInfo.getUserInfo() != null) { // CHANGED: null-safe requestInfo
        	try { // ADDED: MDMS / user-service / null role data must not break signing; default text above is used
        	Object mdmsData = mdmsService.mDMSCall(requestInfo, tenantId.split("\\.")[0]);
        	String designation = userService.getEmployeeDesignation(requestInfo, requestInfo.getUserInfo().getUuid(), requestInfo.getUserInfo().getTenantId());
        	List<String> designations = JsonPath.read(mdmsData, "$.MdmsRes.common-masters.Designation.[?(@.code == '" + designation + "')].name");
        	if(CollectionUtils.isEmpty(designations))
        		designation = "Citizen";
        	else
        		designation = designations.get(0);
        	
        	if("Citizen".equalsIgnoreCase(designation)) {
        		List<String> roles = requestInfo.getUserInfo().getRoles().stream()
        		.filter(role -> (role.getTenantId().equalsIgnoreCase("pb")
        				|| role.getTenantId().equalsIgnoreCase(tenantId)) 
        				&& !role.getCode().equalsIgnoreCase("CITIZEN"))
        		.map(role -> {
        			String[] roleNameAr = role.getName().split(" ");
        			return roleNameAr[roleNameAr.length - 1];
        			
        		})
        		.collect(Collectors.toList());
        		
        		if(!CollectionUtils.isEmpty(roles))
        			designation = roles.get(0);
        		
        	}
        	
        	List<String> ulbTypeList = JsonPath.read(mdmsData, "$.MdmsRes.tenant.tenants.[?(@.code == '" + tenantId + "')].city.ulbType");
			String ulbType = CollectionUtils.isEmpty(ulbTypeList) ? "" : ulbTypeList.get(0);
        	
//        	layer2Text = "Digitally Signed by " + requestInfo.getUserInfo().getName() + "\n" +
//                    "Date: " + dateFormat.format(new Date()) + "\n" +
//                    ulbType + ", " + city +"\n" + 
//                    designation; // <--- DYNAMIC LOCATION
        	
			layer2Text = "Digitally Signed by " + requestInfo.getUserInfo().getName() +"\n" + 
							designation + "\n" + 
							ulbType + "\n" + 
							city + "\n" + 
							dateFormat.format(new Date());
        	} catch (Exception e) { // ADDED
        		logger.error("Could not resolve designation/ULB details for signature text; using default text", e);
        	}
        }

        // CHANGED: split into two lines so a missing image gives a clear error instead of a NullPointerException
        byte[] baseImageBytes = imageStoreRepositry.getBaseImageBytes();
        if (baseImageBytes == null || baseImageBytes.length == 0) {
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Signature base image is not configured");
        }
        ImageData baseImageData = ImageDataFactory.create(baseImageBytes);

        appearance.setLayer2Text(layer2Text); // Set the dynamic text (with location) as Layer 2 of the signature
        appearance.setImage(baseImageData); // Set the base image (e.g. "esign.jpeg") as the background of the signature
        appearance.setImageScale(0.3f); // Scale down the image to fit within the signature rectangle
        appearance.setRenderingMode(PdfSignatureAppearance.RenderingMode.DESCRIPTION);

        signer.setFieldName("Signature1");

        // 3. Capture Hash
        HashCapturingContainer hashContainer = new HashCapturingContainer(PdfName.Adobe_PPKLite, PdfName.Adbe_pkcs7_detached);
        signer.signExternalContainer(hashContainer, 16384); 

        fileHash = hashContainer.getHashAsHex();
        } catch (ESignException e) { // ADDED
            throw e;
        } catch (Exception e) { // ADDED
            logger.error("Failed to prepare the PDF for signing", e);
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to prepare the PDF for signing", e);
        }
        // ADDED
        if (StringUtils.isEmpty(fileHash)) {
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to compute document hash");
        }

        // 4. Upload Prepared PDF
        byte[] preparedPdfBytes = preparedPdfStream.toByteArray();
        String tempFileResponse = uploadPdfToFilestore(preparedPdfBytes, tenantId);
        String rawFileStoreId = extractFileStoreIdFromResponse(tempFileResponse);

        // --- CUSTOM TXN ID LOGIC ("pb.nabha-UUID") ---
        String customTxnId = tenantId + "-" + rawFileStoreId; 
        if(customTxnId.length() > 50) {
        	int additionalLength = customTxnId.length() - 50;
        	// ADDED: substring() below would throw StringIndexOutOfBoundsException for a negative end index
        	if (tenantId.length() - additionalLength - 1 < 0) {
        		throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "File store id is too long to build a transaction id");
        	}
        	customTxnId = tenantId.substring(0, tenantId.length() - additionalLength -1 ) + "-" + rawFileStoreId;
        }
        logger.info("Generated Custom TXN ID: {}", customTxnId);

        // 5. Generate XML
        String xmlData; // CHANGED: declared outside the try
        try { // ADDED: key / XML generation / XML signing failures reported as ESignException
        String pemKey = env.getProperty("esign.private.key");
        if (StringUtils.isEmpty(pemKey)) { // ADDED
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Server configuration error: esign.private.key is missing");
        }
        PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);

        Date now = new Date();
        DateFormat xmlDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        xmlDateFormat.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));

        FormXmlDataAsp formXmlDataAsp = new FormXmlDataAsp();
        formXmlDataAsp.setVer(env.getProperty("esign.version"));
        formXmlDataAsp.setSc(env.getProperty("esign.sc"));
        formXmlDataAsp.setTs(xmlDateFormat.format(now));
        formXmlDataAsp.setTxn(customTxnId); // SEND "pb.nabha-UUID"
        formXmlDataAsp.setEkycId("");
        formXmlDataAsp.setEkycIdType(env.getProperty("esign.ekyc.id.type"));
        formXmlDataAsp.setAspId(env.getProperty("esign.asp.id"));
        formXmlDataAsp.setAuthMode(env.getProperty("esign.auth.mode"));
        formXmlDataAsp.setResponseSigType(env.getProperty("esign.response.sig.type"));
        formXmlDataAsp.setResponseUrl(responseUrl);
        formXmlDataAsp.setId("1");
        formXmlDataAsp.setHashAlgorithm(env.getProperty("esign.hash.algorithm"));
        formXmlDataAsp.setDocInfo(env.getProperty("esign.doc.info"));
        formXmlDataAsp.setDocHashHex(fileHash); 

        String strToEncrypt = aspXmlGenerator.generateAspXml(formXmlDataAsp);
        xmlData = new com.cdac.esign.xmlparser.XmlSigning().signXmlStringNew(strToEncrypt, privateKey);
        } catch (ESignException e) { // ADDED
            throw e;
        } catch (Exception e) { // ADDED
            logger.error("Failed to generate the signed eSign request", e);
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate the signed eSign request (check private key / ASP configuration)", e);
        }
        // ADDED
        if (StringUtils.isEmpty(xmlData)) {
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Generated eSign request is empty");
        }

        RequestXmlForm responseForm = new RequestXmlForm();
        responseForm.setId(fileStoreId); 
        responseForm.setAspTxnID(customTxnId); 
        responseForm.seteSignRequest(xmlData);
        responseForm.setContentType("application/xml");

        return responseForm;
    }

    /**
     * PHASE 2: Handle Response (Strip Prefix)
     */
    public Map<String, String> processDocumentCompletion(String eSignResponseXml, String customTxnId, HttpServletRequest request, String tenantId) throws Exception {
        logger.info("Processing Phase 2 for Custom ID: {}", customTxnId);

        // ADDED
        if (StringUtils.isEmpty(eSignResponseXml)) {
            throw new ESignException(HttpStatus.BAD_REQUEST, "Empty eSign response");
        }
        if (StringUtils.isEmpty(customTxnId)) {
            throw new ESignException(HttpStatus.BAD_REQUEST, "Missing transaction id");
        }

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        dbFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbFactory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbFactory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        org.w3c.dom.Document xmlDoc;
        try { // ADDED: malformed response XML is a client error, not a 500
            xmlDoc = dBuilder.parse(new ByteArrayInputStream(eSignResponseXml.getBytes(StandardCharsets.UTF_8)));
            xmlDoc.getDocumentElement().normalize();
        } catch (SAXException | IOException e) {
            logger.error("Invalid eSign response XML", e);
            throw new ESignException(HttpStatus.BAD_REQUEST, "Invalid eSign response XML", e);
        }

        if (!"1".equals(xmlDoc.getDocumentElement().getAttribute("status"))) {
            // CHANGED: RuntimeException -> ESignException (same message)
            logger.warn("eSign failed. errCode={}, errMsg={}", xmlDoc.getDocumentElement().getAttribute("errCode"), xmlDoc.getDocumentElement().getAttribute("errMsg"));
            throw new ESignException(HttpStatus.UNPROCESSABLE_ENTITY, "eSign failed: " + xmlDoc.getDocumentElement().getAttribute("errMsg"));
        }

        NodeList sigNodes = xmlDoc.getElementsByTagName("DocSignature");
        if (sigNodes.getLength() == 0) throw new ESignException(HttpStatus.BAD_REQUEST, "DocSignature tag missing"); // CHANGED
        String cleanedPkcs7 = sigNodes.item(0).getTextContent().replaceAll("\\s+", ""); 
        final byte[] encodedSig;
        try { // ADDED: invalid Base64 -> 400 instead of 500
            encodedSig = Base64.getDecoder().decode(cleanedPkcs7);
        } catch (IllegalArgumentException e) {
            logger.error("DocSignature is not valid Base64", e);
            throw new ESignException(HttpStatus.BAD_REQUEST, "DocSignature is not valid Base64", e);
        }

        // --- EXTRACT TENANT ID FROM CUSTOM TXN ID ---
        String extractedTenantId = env.getProperty("default.tenant.id", "pb");
        String originalFileStoreId = customTxnId;

        if (customTxnId.contains("-")) {
            // Split at the first hyphen only
            String[] parts = customTxnId.split("-", 2);
            if (parts.length > 1) {
                String potentialTenantId = parts[0]; 
                
                // If the first part contains "pb.", use it as the tenant
                if (potentialTenantId.contains("pb.")) {
                    extractedTenantId = potentialTenantId;
                    originalFileStoreId = parts[1]; // The rest is the UUID
                } else {
                    // If it's just a raw UUID (starts with numbers), keep customTxnId as is
                    extractedTenantId = env.getProperty("default.tenant.id", "pb");
                    originalFileStoreId = customTxnId;
                }
            }
        }

        // ADDED: tenantId is optional on the endpoint; fall back to the one extracted from the txn id
        if (StringUtils.isEmpty(tenantId)) {
            tenantId = extractedTenantId;
        }

        logger.info("Extracted -> Tenant: {}, FileID: {}", tenantId, originalFileStoreId);// Download using EXTRACTED tenant ID
        byte[] preparedPdfBytes = downloadPdfFromUrlAsBytes(getPdfUrlFromFilestore(originalFileStoreId, tenantId));

        ByteArrayOutputStream signedBaos = new ByteArrayOutputStream();
        try { // ADDED: signature embedding failures reported as ESignException
        PdfReader reader = new PdfReader(new ByteArrayInputStream(preparedPdfBytes));
        PdfSigner signer = new PdfSigner(reader, signedBaos, new StampingProperties());

        IExternalSignatureContainer external = new IExternalSignatureContainer() {
            @Override
            public byte[] sign(InputStream is) {
                return encodedSig; 
            }

            @Override
            public void modifySigningDictionary(PdfDictionary signDic) {
                signDic.put(PdfName.Filter, PdfName.Adobe_PPKLite);
                signDic.put(PdfName.SubFilter, PdfName.Adbe_pkcs7_detached);
            }
        };

        PdfSigner.signDeferred(signer.getDocument(), "Signature1", signedBaos, external);
        } catch (Exception e) { // ADDED
            logger.error("Failed to embed the signature into the PDF", e);
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to embed the signature into the PDF", e);
        }
        // ADDED
        if (signedBaos.size() == 0) {
            throw new ESignException(HttpStatus.INTERNAL_SERVER_ERROR, "Signed PDF is empty");
        }

        // Upload using EXTRACTED tenant ID
        String fileStoreResponse = uploadPdfToFilestore(signedBaos.toByteArray(), tenantId);
        String finalFileStoreId = extractFileStoreIdFromResponse(fileStoreResponse);
        String returnFileStoreURL= getPdfUrlFromFilestore(finalFileStoreId, tenantId);

        Map<String, String> result = new HashMap<>();
        result.put("fileStoreId", finalFileStoreId);
        result.put("fileUrl", returnFileStoreURL);
        
        return result;
    }

    // --- HELPER: Extract City Name (e.g. "pb.nabha" -> "Nabha") ---
    private String getCityFromTenantId(String tenantId) {
        if (tenantId == null || tenantId.isEmpty()) return "MSeva";
        
        try {
            // Split by dot (e.g. "pb.nabha" -> ["pb", "nabha"])
            String[] parts = tenantId.split("\\.");
            String city = parts.length > 1 ? parts[1] : parts[0];
            
            // Capitalize (nabha -> Nabha)
            if (city.length() > 0) {
                return city.substring(0, 1).toUpperCase() + city.substring(1);
            }
            return city;
        } catch (Exception e) {
            return "MSeva";
        }
    }

    // --- STANDARD HELPERS (No Changes) ---
 // ==========================================
    // HELPER: Hash Capturing Container
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
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                int nRead;
                byte[] temp = new byte[16384]; 
                while ((nRead = data.read(temp, 0, temp.length)) != -1) {
                    buffer.write(temp, 0, nRead);
                }
                byte[] pdfBytes = buffer.toByteArray();

                // FIX: Use "SHA-256" (with hyphen), not "SHA256"
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                this.docHash = digest.digest(pdfBytes);
                
                return new byte[0]; 
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

    private String getPdfUrlFromFilestore(String fileStoreId, String tenantId) throws Exception {
        try {
            // CHANGED: same RestTemplate, now with connect/read timeouts
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
            factory.setReadTimeout(READ_TIMEOUT_MS);
            RestTemplate restTemplate = new RestTemplate(factory);
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
                throw new ESignException(HttpStatus.NOT_FOUND, "PDF URL not found in API response"); // CHANGED
            } else {
                throw new ESignException(HttpStatus.BAD_GATEWAY, "Failed to get PDF URL. Status: " + response.getStatusCode()); // CHANGED
            }
        } catch (ESignException e) { // ADDED: don't re-wrap our own exceptions
            logger.error("Error calling filestore API", e);
            throw e;
        } catch (Exception e) {
            logger.error("Error calling filestore API", e);
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Failed to get PDF URL from filestore API", e); // CHANGED
        }
    }

    private byte[] downloadPdfFromUrlAsBytes(String pdfUrl) throws Exception {
        try {
            String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
            int splitIndex = pdfUrl.indexOf("/filestore");
            if (splitIndex != -1) {
                String relativePath = pdfUrl.substring(splitIndex);
                pdfUrl = baseUrl + relativePath;
            } 
            URL url = new URL(pdfUrl);
            // ADDED: timeouts (url.openStream() has none)
            URLConnection urlConnection = url.openConnection();
            urlConnection.setConnectTimeout(CONNECT_TIMEOUT_MS);
            urlConnection.setReadTimeout(READ_TIMEOUT_MS);
            try (BufferedInputStream in = new BufferedInputStream(urlConnection.getInputStream());
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] dataBuffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(dataBuffer, 0, 8192)) != -1) {
                    baos.write(dataBuffer, 0, bytesRead);
                }
                byte[] downloaded = baos.toByteArray();
                if (downloaded.length == 0) { // ADDED
                    throw new ESignException(HttpStatus.UNPROCESSABLE_ENTITY, "Downloaded PDF is empty");
                }
                return downloaded;
            }
        } catch (ESignException e) { // ADDED
            logger.error("Error downloading PDF from URL: " + pdfUrl, e);
            throw e;
        } catch (Exception e) {
            logger.error("Error downloading PDF from URL: " + pdfUrl, e);
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Failed to download PDF", e); // CHANGED
        }
    }

    public String uploadPdfToFilestore(byte[] pdfBytes, String tenantId) throws Exception {
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        String baseUrl = env.getProperty("filestore.base.url", "http://localhost:1001");
        String uploadUrl = env.getProperty("filestore.upload.url", "/filestore/v1/files");
        URL url = new URL(baseUrl + uploadUrl);

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        try { // ADDED: upload failures reported as ESignException + connection always released
        conn.setConnectTimeout(CONNECT_TIMEOUT_MS); // ADDED
        conn.setReadTimeout(READ_TIMEOUT_MS); // ADDED
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
        String responseBody = readStream(responseStream);
        // ADDED: only 201 is success (as before); anything else used to return the error body as if it were a fileStoreId
        if (responseCode != 201) {
            logger.error("Filestore upload failed. HTTP {} body: {}", responseCode, responseBody);
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Filestore upload failed with HTTP status " + responseCode);
        }
        return responseBody;
        } catch (ESignException e) { // ADDED
            throw e;
        } catch (Exception e) { // ADDED
            logger.error("Error uploading file to filestore", e);
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Unable to upload file to filestore", e);
        } finally {
            conn.disconnect();
        }
    }
    
    private static String readStream(InputStream inputStream) throws IOException {
        if (inputStream == null) { // ADDED: getErrorStream() can return null
            return "";
        }
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int length;
        while ((length = inputStream.read(buffer)) != -1) {
            result.write(buffer, 0, length);
        }
        return result.toString("UTF-8");
    }

    private String extractFileStoreIdFromResponse(String response) {
        // ADDED
        if (StringUtils.isEmpty(response)) {
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Empty response from filestore");
        }
        try {
            if (response.contains("fileStoreId")) {
                int idx = response.indexOf("fileStoreId");
                int start = response.indexOf(":", idx) + 2;
                int end = response.indexOf("\"", start);
                if (response.charAt(start-1) != '"') {
                     end = response.indexOf(",", start);
                     if (end == -1) end = response.indexOf("}", start);
                }
                String id = response.substring(start, end).replace("\"", "").trim();
                if (!StringUtils.isEmpty(id)) { // ADDED
                    return id;
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting fileStoreId from response: " + response, e);
            throw new ESignException(HttpStatus.BAD_GATEWAY, "Unable to read fileStoreId from filestore response", e); // CHANGED: used to fall through
        }
        // CHANGED: used to return the whole response body as the "fileStoreId"
        logger.error("fileStoreId not found in filestore response: {}", response);
        throw new ESignException(HttpStatus.BAD_GATEWAY, "fileStoreId missing in filestore response");
    }
    
    /**
     * Get last page and last X and Y of the Pdf file content
     * 
     * @param originalPdfBytes
     * @return
     * @throws Exception
     */
    private Map<String, Object> getEsignPosition(byte[] originalPdfBytes) throws Exception{
    	Map<String, Object> positionMap = new HashMap<>();
    	
    	PdfReader pdfReader = new PdfReader(new ByteArrayInputStream(originalPdfBytes));
        PdfDocument document = new PdfDocument(pdfReader);
        try { // ADDED: document is always closed, even on failure
        int totalPages = document.getNumberOfPages();
        if (totalPages < 1) { // ADDED
            throw new ESignException(HttpStatus.UNPROCESSABLE_ENTITY, "PDF has no pages");
        }
        
        try { // ADDED: if text position can't be read, default position is used instead of failing
        LastPositionListener listener = new LastPositionListener();
        PdfCanvasProcessor processor = new PdfCanvasProcessor(listener);
        processor.processPageContent(document.getLastPage());
        
        if(listener.hasPosition()) {
        	positionMap.put("lastX", listener.getLastX());
        	positionMap.put("lastY", listener.getLastY());
        }
        } catch (Exception e) {
            logger.warn("Could not detect last text position; using default position", e);
        }
        positionMap.put("pageWidth", document.getLastPage().getPageSizeWithRotation().getWidth());
        
        positionMap.put("lastPage", totalPages);       
        } finally {
            try {
                document.close();
                pdfReader.close();
            } catch (Exception e) {
                logger.warn("Error closing PDF document", e);
            }
        }
    	return positionMap;
    }
}