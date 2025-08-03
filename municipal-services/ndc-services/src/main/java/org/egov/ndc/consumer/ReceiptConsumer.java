package org.egov.ndc.consumer;

import org.egov.ndc.service.PaymentUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class ReceiptConsumer {

    private PaymentUpdateService paymentUpdateService;


    @Autowired
    public ReceiptConsumer(PaymentUpdateService paymentUpdateService) {
        this.paymentUpdateService = paymentUpdateService;
    }

    @KafkaListener(topics = {"${kafka.topics.receipt.create}"})
    public void listenPayments(final HashMap<String, Object> record) {
        paymentUpdateService.process(record);
    }
}
