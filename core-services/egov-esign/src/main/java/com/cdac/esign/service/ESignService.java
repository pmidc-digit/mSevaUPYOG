package com.cdac.esign.service;

import java.io.File;
import java.security.PrivateKey;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Value;

import com.cdac.esign.encryptor.Encryption;
import com.cdac.esign.encryptor.RSAKeyUtil;
import com.cdac.esign.form.FormXmlDataAsp;
import com.cdac.esign.form.RequestXmlForm;
import com.cdac.esign.validator.FieldValidator;
import com.cdac.esign.xmlparser.AspXmlGenerator;
import com.cdac.esign.xmlparser.XmlSigning;

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

    public RequestXmlForm processDocumentUpload(MultipartFile file, String authType, String consent,
            String aadhar, HttpServletRequest request) throws Exception {

        logger.info("Processing document upload for file: {}, authType: {}", file.getOriginalFilename(), authType);

        // Validate input fields
        FieldValidator fieldValidator = new FieldValidator();
        if (!fieldValidator.validateFields(aadhar, consent, authType, new MultipartFile[]{file})) {
            logger.warn("Validation failed for input parameters");
            throw new IllegalArgumentException("Invalid input parameters");
        }

        // Create upload directory if it doesn't exist
        String uploadRootPath = env.getProperty("esign.upload.root.path");
        File uploadRootDir = new File(uploadRootPath);
        if (!uploadRootDir.exists()) {
            uploadRootDir.mkdirs();
            logger.info("Created upload directory: {}", uploadRootPath);
        }

        // Save uploaded file
        String fileName = file.getOriginalFilename();
        File serverFile = new File(uploadRootDir.getAbsolutePath() + File.separator + fileName);
        file.transferTo(serverFile);
        logger.info("Uploaded file saved to: {}", serverFile.getAbsolutePath());

        // Generate PDF hash for signing
        HttpSession session = request.getSession();
        String fileHash = pdfEmbedder.pdfSigner(serverFile, request, session);
        session.setAttribute("pdfEmbedder", pdfEmbedder);
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
        formXmlDataAsp.setTxn("" + randInt);
        formXmlDataAsp.setEkycId("");
        formXmlDataAsp.setEkycIdType(env.getProperty("esign.ekyc.id.type"));
        formXmlDataAsp.setAspId(env.getProperty("esign.asp.id"));
        formXmlDataAsp.setAuthMode(authType);
        formXmlDataAsp.setResponseSigType(env.getProperty("esign.response.sig.type"));
        formXmlDataAsp.setResponseUrl(env.getProperty("esign.response.host")+ env.getProperty("esign.response.url"));
        formXmlDataAsp.setId("1");
        formXmlDataAsp.setHashAlgorithm(env.getProperty("esign.hash.algorithm"));
        formXmlDataAsp.setDocInfo(env.getProperty("esign.doc.info"));
        formXmlDataAsp.setDocHashHex(fileHash);

        // Generate and sign XML
        String strToEncrypt = aspXmlGenerator.generateAspXml(formXmlDataAsp, request);
        String xmlData = "";

        try {
			/*
			 * Encryption encryption = new Encryption(); xmlData = new
			 * com.cdac.esign.xmlparser.XmlSigning().signXmlStringNew( strToEncrypt,
			 * encryption.getPrivateKey(env.getProperty("esign.private.key.filename")));
			 */
        	
        	String pemKey = env.getProperty("esign.private.key");
            PrivateKey privateKey = RSAKeyUtil.loadPrivateKey(pemKey);

            // Use in your eSign call
             xmlData = new com.cdac.esign.xmlparser.XmlSigning()
                    .signXmlStringNew(strToEncrypt, privateKey);
             
            logger.info("XML signed and saved successfully ");
        } catch (Exception e) {
            logger.error("Error in Encryption/Signing", e);
            throw new RuntimeException("Error in Encryption/Signing", e);
        }

        DateFormat dateFormats = new SimpleDateFormat("yy-mm");
        dateFormats.setTimeZone(TimeZone.getTimeZone("GMT+5:30"));
        // Prepare response
        RequestXmlForm responseForm = new RequestXmlForm();
        responseForm.setId(randInt+"-"+dateFormats.format(now));
        responseForm.setType(authType);
        responseForm.setDescription("Y");
        responseForm.seteSignRequest(xmlData);
        responseForm.setAspTxnID("" + randInt);
        responseForm.setContentType("application/xml");

        logger.info("Document upload processed successfully, transaction ID: {}", responseForm.getAspTxnID());
        return responseForm;
    }

    public String processDocumentCompletion(String response, String espTxnID, HttpServletRequest request) {
        logger.info("Processing document completion for espTxnID: {}", espTxnID);

        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                logger.warn("Session expired for espTxnID: {}", espTxnID);
                throw new IllegalStateException("Session expired");
            }

            String filename = pdfEmbedder.signPdfwithDS(response, request, session);

            if (filename.equals("Error")) {
                String error = response.substring(response.indexOf("errCode"), response.indexOf("resCode"));
                logger.error("Error in signing PDF for espTxnID: {}, error: {}", espTxnID, error);
                throw new RuntimeException("Error: " + error);
            }

            logger.info("Document signed successfully: {}", filename);
            return filename;

        } catch (Exception e) {
            logger.error("Error processing signature for espTxnID: {}", espTxnID, e);
            throw new RuntimeException("Error processing signature", e);
        }
    }
}
