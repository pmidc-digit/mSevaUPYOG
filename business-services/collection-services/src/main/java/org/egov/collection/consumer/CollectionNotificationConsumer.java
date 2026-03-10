package org.egov.collection.consumer;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.collection.model.Payment;
import org.egov.collection.model.PaymentDetail;
import org.egov.collection.model.PaymentRequest;
import org.egov.collection.producer.CollectionProducer;
import org.egov.collection.web.contract.Bill;
import org.egov.common.contract.request.RequestInfo;
import org.egov.collection.config.ApplicationProperties;

import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;

import static org.egov.collection.config.CollectionServiceConstants.*;

@Slf4j
@Component
public class CollectionNotificationConsumer {

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private ApplicationProperties applicationProperties;

	@Autowired
	private CollectionProducer producer;

	@Autowired
	private RestTemplate restTemplate;

	@KafkaListener(topics = { "${kafka.topics.payment.create.name}", "${kafka.topics.payment.receiptlink.name}" },
			concurrency =  "${kafka.topics.bankaccountservicemapping.concurreny.count}" )
	public void listen(HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		try {
			PaymentRequest req = objectMapper.convertValue(record, PaymentRequest.class);
			sendNotification(req);
		} catch (Exception e) {
			log.error("Exception while reading from the queue: ", e);
		}
	}

	private void sendNotification(PaymentRequest paymentRequest) {
	    Payment payment = paymentRequest.getPayment();
	    
	    for (PaymentDetail paymentDetail : payment.getPaymentDetails()) {
	        String mobNo = payment.getMobileNumber();
	        Bill bill = paymentDetail.getBill();
	        String emailId = (bill != null) ? bill.getPayerEmail() : null;
	        
	        String paymentStatus = (payment.getPaymentStatus() == null) ? "NEW" : payment.getPaymentStatus().toString();
	        String message = buildSmsBody(bill, paymentDetail, paymentRequest.getRequestInfo(), paymentStatus);
	        
	        if (!StringUtils.isEmpty(message)) {
	            // --- SMS Notification ---
	            HashMap<String, Object> smsRequest = new HashMap<>();
	            smsRequest.put("mobileNumber", mobNo);
	            smsRequest.put("message", message);
	            producer.producer(applicationProperties.getSmsTopic(), smsRequest);

	            // --- HTML Email Notification ---
	            if (!StringUtils.isEmpty(emailId) && emailId.contains("@")) {
	                HashMap<String, Object> emailRequest = new HashMap<>();
	                
	                // Call the new formatting method
	                String htmlContent = buildHtmlEmailContent(message, payment, paymentDetail);

	                emailRequest.put("emailTo", emailId);
	                emailRequest.put("body", htmlContent);
	                emailRequest.put("subject", "Payment Successful Notification - mSeva");
	                emailRequest.put("isHTML", true);

	                producer.producer(applicationProperties.getEmailTopic(), emailRequest);
	            }
	        } else {
	            log.error("Message not configured! No notification will be sent.");
	        }
	    }
	}
	
	private String buildHtmlEmailContent(String message, Payment payment, PaymentDetail paymentDetail) {
	    Bill bill = paymentDetail.getBill();
	    
	    // 1. Data Extraction
	    String payerName = (bill != null && !StringUtils.isEmpty(bill.getPayerName())) ? bill.getPayerName() : "Citizen";
	    String consumerCode = (bill != null) ? bill.getConsumerCode() : "N/A";
	    String receiptNo = paymentDetail.getReceiptNumber();
	    String serviceType = mapServiceCode(paymentDetail.getBusinessService());
	    
	    // Formatting Amounts (Total and Bill Amount)
	    String totalPaid = String.format("%.2f", payment.getTotalAmountPaid());
	    String billAmount = (bill != null) ? String.format("%.2f", bill.getTotalAmount()) : totalPaid;

	    // 2. Time Conversion: UTC to IST (Local Indian Time)
	    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd-MMM-yyyy hh:mm a");
	    sdf.setTimeZone(java.util.TimeZone.getTimeZone("IST")); 
	    String localDateStr = sdf.format(new java.util.Date(payment.getTransactionDate()));

	    // 3. Constructing the Message
	    String detailedMessage = "Dear <b><i>" + payerName + "</i></b>,<br><br>"
	        + "Your payment for <b>" + serviceType + "</b> has been processed successfully. "
	        + "A detailed summary of your transaction is provided below for your records.";

	    return "<html>"
	        + "<body style='font-family: Segoe UI, Tahoma, sans-serif; background-color: #f4f7f6; padding: 20px; color: #333;'>"
	        + "  <div style='max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e0e0e0;'>"
	        + "    "
	        + "    "
	        + "    <div style='background-color: #2c3e50; padding: 20px; text-align: center; color: #ffffff;'>"
	        + "      <h1 style='margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;'>Payment Confirmation</h1>"
	        + "      <p style='margin: 5px 0 0; font-size: 12px; opacity: 0.8;'>mSeva Punjab Municipal Infrastructure Development Company</p>"
	        + "    </div>"
	        + "    "
	        + "    <div style='padding: 35px;'>"
	        + "      <p style='font-size: 16px; line-height: 1.6;'>" + detailedMessage + "</p>"
	        + "      "
	        + "      <h3 style='font-size: 14px; text-transform: uppercase; color: #7f8c8d; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px;'>Transaction Details</h3>"
	        + "      <table style='width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;'>"
	        + "        <tr><td style='padding: 10px 0; color: #7f8c8d;'>Consumer Code/Application No</td><td style='padding: 10px 0; text-align: right;'><b>" + consumerCode + "</b></td></tr>"
	        + "        <tr><td style='padding: 10px 0; color: #7f8c8d;'>Official Receipt No.</td><td style='padding: 10px 0; text-align: right;'><b>" + receiptNo + "</b></td></tr>"
	        + "        <tr><td style='padding: 10px 0; color: #7f8c8d;'>Payment Method</td><td style='padding: 10px 0; text-align: right;'><b>" + payment.getPaymentMode() + "</b></td></tr>"
	        + "        <tr><td style='padding: 10px 0; color: #7f8c8d;'>Transaction Date & Time (IST)</td><td style='padding: 10px 0; text-align: right;'><b>" + localDateStr + "</b></td></tr>"
	        + "        <tr><td style='padding: 10px 0; color: #7f8c8d;'>Total Bill Amount</td><td style='padding: 10px 0; text-align: right;'>INR " + billAmount + "</td></tr>"
	        + "        <tr style='font-size: 18px; color: #27ae60;'><td style='padding: 20px 0; border-top: 2px solid #f4f7f6;'>Amount Paid</td><td style='padding: 20px 0; text-align: right; border-top: 2px solid #f4f7f6;'><b>INR " + totalPaid + "</b></td></tr>"
	        + "      </table>"
	        + "      "
	        + "      "
	        + "      <div style='margin-top: 30px; padding: 20px; background-color: #f0f7ff; border-radius: 6px; border-left: 5px solid #3498db; text-align: center;'>"
	        + "        <p style='margin: 0 0 15px; font-size: 14px; color: #2c3e50;'><b>Your receipt is ready for download</b></p>"
	        + "        <a href='https://mseva.lgpunjab.gov.in/citizen' style='display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;'>Download Official Receipt</a>"
	        + "      </div>"
	        + "      "
	        + "      <p style='margin-top: 30px; font-size: 14px; color: #555;'>Regards,<br><b style='color: #2c3e50;'>Team mSeva (PMIDC)</b></p>"
	        + "    </div>"
	        + "    "
	        + "    <div style='background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 11px; color: #95a5a6; border-top: 1px solid #eee;'>"
	        + "      This is a system-generated receipt for mSeva Punjab Services. No physical signature is required."
	        + "    </div>"
	        + "  </div>"
	        + "</body></html>";
	}

	private String mapServiceCode(String code) {
	    if (code == null) return "General Service";
	    switch (code.toUpperCase()) {
	        case "PT": return "Property Tax";
	        case "WS": return "Water Supply";
	        case "SW": return "Sewerage";
	        case "TL": return "Trade License";
	        default: return code;
	    }
	}
	private String buildSmsBody(Bill bill, PaymentDetail paymentDetail, RequestInfo requestInfo, String paymentStatus) {
		log.info("Inside BodySms");;
		String message = null;
		String content = null;
		switch (paymentStatus.toUpperCase()) {
		case "NEW":
			content = fetchContentFromLocalization(requestInfo, paymentDetail.getTenantId(),
					COLLECTION_LOCALIZATION_MODULE, WF_MT_STATUS_OPEN_CODE);
			break;
		case "DEPOSITED":
			content = fetchContentFromLocalization(requestInfo, paymentDetail.getTenantId(),
					COLLECTION_LOCALIZATION_MODULE, WF_MT_STATUS_DEPOSITED_CODE);
			break;
		case "CANCELLED":
			content = fetchContentFromLocalization(requestInfo, paymentDetail.getTenantId(),
					COLLECTION_LOCALIZATION_MODULE, WF_MT_STATUS_CANCELLED_CODE);
			break;
		case "DISHONOURED":
			content = fetchContentFromLocalization(requestInfo, paymentDetail.getTenantId(),
					COLLECTION_LOCALIZATION_MODULE, WF_MT_STATUS_DISHONOURED_CODE);
			break;
		default:
			break;
		}
		if (!StringUtils.isEmpty(content)) {
			if (!paymentStatus.equalsIgnoreCase("NEW"))
			{
				StringBuilder link = new StringBuilder();
				link.append(applicationProperties.getUiHost() + "/citizen").append("/otpLogin?mobileNo=")
						.append(bill.getMobileNumber()).append("&redirectTo=")
						.append(applicationProperties.getUiRedirectUrl()).append("&params=")
						.append(paymentDetail.getTenantId() + "," + paymentDetail.getReceiptNumber());

				String receiptLink = getShortenedUrl(link.toString());

				content = content.replaceAll("{rcpt_link}", receiptLink);

				String moduleName = fetchContentFromLocalization(requestInfo, paymentDetail.getTenantId(),
						BUSINESSSERVICE_LOCALIZATION_MODULE, formatCodes(paymentDetail.getBusinessService()));

				if (StringUtils.isEmpty(moduleName))
					moduleName = "Adhoc Tax";
				content = content.replaceAll("<mod_name>", moduleName);
			}
			if (content.contains("<owner_name>"))
				content = content.replaceAll("<owner_name>", bill.getPayerName());
			else
				content = content.replaceAll("<tax_name>", bill.getBusinessService());
			if (content.contains("<amount_paid>"))
				content = content.replaceAll("<amount_paid>", paymentDetail.getTotalAmountPaid().toString());
			Collections.sort(bill.getBillDetails(), (b1, b2) -> b2.getFromPeriod().compareTo(b1.getFromPeriod()));
			String formattedDate = LocalDateTime
					.ofInstant(Instant.ofEpochMilli(bill.getBillDetails().get(0).getFromPeriod()),
							ZoneId.systemDefault())
					.format(DateTimeFormatter.ofPattern("yyyy"));
			String formattedtoDate = LocalDateTime
					.ofInstant(Instant.ofEpochMilli(bill.getBillDetails().get(0).getToPeriod()), ZoneId.systemDefault())
					.format(DateTimeFormatter.ofPattern("yy"));
			if (content.contains("<fin_year>"))

				content = content.replaceAll("<fin_year>", formattedDate + "-" + formattedtoDate);
			content = content.replaceAll("<rcpt_no>", paymentDetail.getReceiptNumber());

			content = content.replaceAll("<unique_id>", bill.getConsumerCode());
			message = content;
		}
		log.info("Final msg: "+message);
		return message;
	}

	private String fetchContentFromLocalization(RequestInfo requestInfo, String tenantId, String module, String code) {
		String message = null;
		List<String> codes = new ArrayList<>();
		List<String> messages = new ArrayList<>();
		Object result = null;
		String locale = "";
		if (requestInfo.getMsgId().contains("|"))
			locale = requestInfo.getMsgId().split("[\\|]")[1];
		if (StringUtils.isEmpty(locale))
			locale = applicationProperties.getFallBackLocale();
		StringBuilder uri = new StringBuilder();
		uri.append(applicationProperties.getLocalizationHost()).append(applicationProperties.getLocalizationEndpoint());
		uri.append("?tenantId=").append(tenantId.split("\\.")[0]).append("&locale=").append(locale).append("&module=")
				.append(module);

		Map<String, Object> request = new HashMap<>();
		request.put("RequestInfo", requestInfo);
		try {
			result = restTemplate.postForObject(uri.toString(), request, Map.class);
			codes = JsonPath.read(result, LOCALIZATION_CODES_JSONPATH);
			messages = JsonPath.read(result, LOCALIZATION_MSGS_JSONPATH);
		} catch (Exception e) {
			log.error("Exception while fetching from localization: " + e);
		}
		if (CollectionUtils.isEmpty(messages)) {
			throw new CustomException("LOCALIZATION_NOT_FOUND", "Localization not found for the code: " + code);
		}
		for (int index = 0; index < codes.size(); index++) {
			if (codes.get(index).equals(code)) {
				message = messages.get(index);
			}
		}
		return message;
	}

	private String formatCodes(String code) {
		String regexForSpecialCharacters = "[-+$&,:;=?@#|'<>.^*()%!]";
		code = code.replaceAll(regexForSpecialCharacters, "");
		code = code.replaceAll(" ", "_");

		return BUSINESSSERVICELOCALIZATION_CODE_PREFIX + code.toUpperCase();
	}

	/**
	 * Method to shortent the url returns the same url if shortening fails
	 * 
	 * @param url
	 */
	public String getShortenedUrl(String url) {

		HashMap<String, String> body = new HashMap<>();
		body.put("url", url);
		StringBuilder builder = new StringBuilder(applicationProperties.getUrlShortnerHost());
		builder.append(applicationProperties.getUrlShortnerEndpoint());
		String res = restTemplate.postForObject(builder.toString(), body, String.class);

		if (StringUtils.isEmpty(res)) {
			log.error("URL_SHORTENING_ERROR", "Unable to shorten url: " + url);
			;
			return url;
		} else
			return res;
	}
	
	
	
}
