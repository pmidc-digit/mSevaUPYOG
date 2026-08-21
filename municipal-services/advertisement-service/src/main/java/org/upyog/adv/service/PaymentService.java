package org.upyog.adv.service;


import java.util.HashMap;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.upyog.adv.config.BookingConfiguration;
import org.upyog.adv.enums.BookingStatusEnum;
import org.upyog.adv.repository.impl.BookingRepositoryImpl;
import org.upyog.adv.web.models.BookingDetail;
import org.upyog.adv.web.models.BookingRequest;
import org.upyog.adv.web.models.billing.PaymentRequest;
import org.upyog.adv.web.models.transaction.Transaction;
import org.upyog.adv.web.models.transaction.TransactionRequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PaymentService {

	@Autowired
	private ObjectMapper mapper;

	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsUrl;

	@Autowired
	private BookingConfiguration configs;

	@Autowired
	private BookingService bookingService;
	
	@Autowired
	private BookingRepositoryImpl bookingRepo;


	public void process(PaymentRequest paymentRequest, String topic) throws JsonProcessingException {
		log.info(" Receipt consumer class entry " + paymentRequest.toString());
		try {
			String businessService = paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService();
			log.info("Payment request processing in ADV method for businessService : " + businessService);
			if (configs.getBusinessServiceName()
					.equals(paymentRequest.getPayment().getPaymentDetails().get(0).getBusinessService())) {
				String bookingNo = paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode();
				log.info("Updating payment status for ADV booking : " + bookingNo);
				log.info("Reciept no of payment : " + paymentRequest.getPayment().getPaymentDetails().get(0).getReceiptNumber());
				log.info("Payment date of payment : " + paymentRequest.getPayment().getPaymentDetails().get(0).getReceiptDate());
				BookingDetail bookingDetail = BookingDetail.builder().bookingNo(bookingNo)
						.build();
				BookingRequest bookingRequest = BookingRequest.builder()
						.requestInfo(paymentRequest.getRequestInfo()).bookingApplication(bookingDetail).build();
				bookingService.updateBookingSynchronously(bookingRequest, paymentRequest.getPayment().getPaymentDetails().get(0), BookingStatusEnum.BOOKED);
				bookingRepo.deleteBookingIdForTimer(bookingRequest.getBookingApplication().getBookingId());
			}
		} catch (IllegalArgumentException e) {
			log.error("Illegal argument exception occured while sending notification ADV : " + e.getMessage());
		} catch (Exception e) {
			log.error("An unexpected exception occurred while sending notification ADV : ", e);
		}

	}

	
   	public void processTransaction(HashMap<String, Object> record, String topic, BookingStatusEnum status){

        // Lightweight pre-filter: extract module/consumerCode directly from the map
        // to skip expensive deserialization for transactions belonging to other services.
        String moduleName = null;
        String bookingNo = null;
        String txnStatusRaw = null;
        Object transactionObj = record.get("Transaction");
        if (transactionObj instanceof Map) {
        	@SuppressWarnings("unchecked")
            Map<String, Object> txnMap = (Map<String, Object>) transactionObj;
        	moduleName = txnMap.get("module") != null ? txnMap.get("module").toString() : null;
        	bookingNo = txnMap.get("consumerCode") != null ? txnMap.get("consumerCode").toString() : null;
        	txnStatusRaw = txnMap.get("txnStatus") != null ? txnMap.get("txnStatus").toString() : null;
        }

        // Payment failure status JSON may not contain module name — derive from consumer code
        if (moduleName == null && bookingNo != null) {
        	moduleName = bookingNo.startsWith("ADV") ? configs.getBusinessServiceName() : null;
        }

        // If this transaction does not belong to ADV, skip all further processing
        if (!configs.getBusinessServiceName().equals(moduleName)) {
        	return;
        }

        TransactionRequest transactionRequest = mapper.convertValue(record, TransactionRequest.class);

        RequestInfo requestInfo = transactionRequest.getRequestInfo();
        Transaction transaction = transactionRequest.getTransaction();
        
        log.info("Transaction in process transaction : " + transaction);
        
        Transaction.TxnStatusEnum transactionStatus = transaction.getTxnStatus();
        
        log.info("moduleName : " + moduleName + "  transactionStatus  : " + transactionStatus);
        
        if((Transaction.TxnStatusEnum.FAILURE.equals(transactionStatus) ||
        		Transaction.TxnStatusEnum.PENDING.equals(transactionStatus))){
        	
        	if(Transaction.TxnStatusEnum.FAILURE.equals(transactionStatus)){
        		status = BookingStatusEnum.PAYMENT_FAILED;
        		
        		bookingRepo.updateStatusForTimer(BookingStatusEnum.PAYMENT_FAILED.toString(), bookingNo);
        	}
        	
        	if(Transaction.TxnStatusEnum.PENDING.equals(transactionStatus)){
        		
        		bookingRepo.updateStatusForTimer(BookingStatusEnum.PENDING_FOR_PAYMENT.toString(), bookingNo);
        	}
        	log.info("For booking no : " + bookingNo + " transaction id : " + transaction.getTxnId());
        	
        	BookingDetail bookingDetail = BookingDetail.builder().bookingNo(bookingNo)
					.build();
			BookingRequest bookingRequest = BookingRequest.builder()
					.requestInfo(requestInfo).bookingApplication(bookingDetail).build();
			bookingService.updateBooking(bookingRequest, null, status);
        }
    }
}
