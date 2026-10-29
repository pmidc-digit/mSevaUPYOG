package org.egov.web.notification.mail.web;

import javax.validation.Valid;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.web.notification.mail.consumer.contract.Email;
import org.egov.web.notification.mail.consumer.contract.EmailRequest;
import org.egov.web.notification.mail.consumer.contract.EmailResponse;
import org.egov.web.notification.mail.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for sending emails directly via HTTP.
 *
 * POST /notification/email/v1/_send
 *
 * Request body (standard eGov format):
 * {
 *   "RequestInfo": { ... },
 *   "email": {
 *     "emailTo": ["recipient@example.com"],
 *     "subject": "Subject line",
 *     "body": "<h1>Hello</h1>",
 *     "isHTML": true
 *   }
 * }
 */
@RestController
@RequestMapping("/notification/email/v1")
@Slf4j
public class EmailController {

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Accepts an email send request and dispatches it asynchronously.
     * Returns 202 Accepted immediately; actual delivery happens in background.
     */
    @PostMapping("/_send")
    public ResponseEntity<EmailResponse> sendEmail(@Valid @RequestBody EmailRequest emailRequest) {

        RequestInfo requestInfo = emailRequest.getRequestInfo();
        Email email = emailRequest.getEmail();

        log.info("Received HTTP email send request for: {} | subject: {}",
                email != null ? email.getEmailTo() : "null",
                email != null ? email.getSubject() : "null");

        if (email == null) {
            log.warn("Email payload is null in request");
            return ResponseEntity.badRequest().build();
        }

        // Dispatch asynchronously (same path as Kafka consumer)
        emailService.sendEmail(email);

        ResponseInfo responseInfo = ResponseInfo.builder()
                .apiId(requestInfo != null ? requestInfo.getApiId() : "")
                .ver(requestInfo != null ? requestInfo.getVer() : "")
                .ts(requestInfo != null ? requestInfo.getTs() : null)
                .resMsgId("uief87324")
                .msgId(requestInfo != null ? requestInfo.getMsgId() : "")
                .status("successful")
                .build();

        EmailResponse response = EmailResponse.builder()
                .responseInfo(responseInfo)
                .email(email)
                .build();

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}