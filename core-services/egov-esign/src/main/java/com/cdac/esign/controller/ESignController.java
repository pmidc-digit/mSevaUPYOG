package com.cdac.esign.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cdac.esign.form.RequestXmlForm;
import com.cdac.esign.service.ESignService;

@Controller
public class ESignController {

    private static final Logger logger = LoggerFactory.getLogger(ESignController.class);

    @Autowired
    private ESignService eSignService;

    @PostMapping("/upload")
    public ResponseEntity<RequestXmlForm> uploadAndSignDocument(
            @RequestParam("file") String fileStoreId, 
            @RequestParam("tenantid") String tenantId,
            // 1. ADDED: New Parameter for Signer Name (Optional)
            @RequestParam(value = "signerName", required = false) String signerName) {

        logger.info("Received upload request for file: {}, tenant: {}, signer: {}", fileStoreId, tenantId, signerName);

        try {
            // 2. UPDATED: Passing the dynamic 'signerName' instead of null
            RequestXmlForm responseForm = eSignService.processDocumentUpload(fileStoreId, tenantId);
            
            logger.info("Document upload processed successfully for transaction: {}", responseForm.getAspTxnID());
            return ResponseEntity.ok(responseForm);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid input parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error processing document upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, String>> completeSigning(
            @RequestParam("eSignResponse") String response,
            @RequestParam("espTxnID") String espTxnID,
            HttpServletRequest request) {

        logger.info("Received complete signing request for espTxnID: {}", espTxnID);

        try {
            String fileUrl = eSignService.processDocumentCompletion(response, espTxnID, request);
            logger.info("Document signing completed successfully: {}", fileUrl);

            Map<String, String> body = new HashMap<>();
            body.put("status", "SUCCESS");
            body.put("fileUrl", fileUrl);

            return ResponseEntity.ok(body);

        } catch (IllegalStateException e) {
            logger.warn("Session expired or invalid state: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("status", "FAILED");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (RuntimeException e) {
            logger.error("Error processing signature: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("status", "FAILED");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error processing signature", e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "FAILED");
            error.put("error", "Error processing signature");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}