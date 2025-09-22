package com.cdac.esign.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.cdac.esign.form.MyUploadForm;
import com.cdac.esign.form.RequestXmlForm;
import com.cdac.esign.service.ESignService;

@Controller
public class ESignController {

    private static final Logger logger = LoggerFactory.getLogger(ESignController.class);

    @Autowired
    private ESignService eSignService;

    @PostMapping("/upload")
    public ResponseEntity<RequestXmlForm> uploadAndSignDocument(
            @RequestParam("file") String fileStoreId) {

        logger.info("Received upload request for file: {}, authType: {}", fileStoreId);

        try {
            RequestXmlForm responseForm = eSignService.processDocumentUpload(fileStoreId,"pb");
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
    public ResponseEntity<String> completeSigning(
            @RequestParam("eSignResponse") String response,
            @RequestParam("espTxnID") String espTxnID,
            HttpServletRequest request) {

        logger.info("Received complete signing request for espTxnID: {}", espTxnID);

        try {
            String filename = eSignService.processDocumentCompletion(response, espTxnID, request);
            logger.info("Document signing completed successfully: {}", filename);
            return ResponseEntity.ok("Document signed successfully: " + filename);
        } catch (IllegalStateException e) {
            logger.warn("Session expired or invalid state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error processing signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error processing signature", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing signature");
        }
    }

   
}
