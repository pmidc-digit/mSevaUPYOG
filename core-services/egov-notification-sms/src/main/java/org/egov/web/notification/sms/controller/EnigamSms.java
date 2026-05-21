package org.egov.web.notification.sms.controller;

import org.egov.web.notification.sms.models.Sms;
import org.egov.web.notification.sms.models.SmsRequest;
import org.egov.web.notification.sms.service.SMSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/outsource")
public class EnigamSms {

    @Autowired
    private SMSService smsService;

    @PostMapping("/sms/send")
    public ResponseEntity<String> sendSms(@RequestBody SmsRequest smsRequest) {
        smsService.sendSMS(smsRequest.getSms());
        return ResponseEntity.ok("SMS sent successfully");
    }
}
