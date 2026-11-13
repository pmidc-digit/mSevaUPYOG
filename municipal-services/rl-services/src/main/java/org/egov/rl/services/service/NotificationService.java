package org.egov.rl.services.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.models.collection.PaymentDetail;
import org.egov.rl.services.models.collection.PaymentRequest;
import org.egov.rl.services.models.event.Event;
import org.egov.rl.services.models.event.EventRequest;
import org.egov.rl.services.models.event.Recepient;
import org.egov.rl.services.repository.ServiceRequestRepository;
import org.egov.rl.services.util.NotificationUtil;
import org.egov.rl.services.util.RLConstants;
import org.egov.rl.services.web.contracts.Email;
import org.egov.rl.services.web.contracts.EmailRequest;
import org.egov.rl.services.web.contracts.SMSRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {
	
	@Autowired
	private RentLeaseConfiguration config;

	@Value("${notification.url:https://mseva-dev.lgpunjab.gov.in/digit-ui/select-language}")
	private String notificationUrl;
	
	@Autowired
	private NotificationUtil util;
	
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public void process(AllotmentRequest request) {
		if (request != null && !CollectionUtils.isEmpty(request.getAllotment())) {
			for (AllotmentDetails allotment : request.getAllotment()) {
				enrichOrDecryptOwners(allotment, request.getRequestInfo());
			}
		}
		EventRequest eventRequest = getEventsForAllotment(request);
		log.info("Event Request in Rl process method: {}", eventRequest);
		if (null != eventRequest)
			util.sendEventNotification(eventRequest);

		sendWorkflowSMS(request);
	}

	private EventRequest getEventsForAllotment(AllotmentRequest request) {

		List<Event> events = new ArrayList<>();
		String tenantId = request.getAllotment().get(0).getTenantId();
		String localizationMessages = util.getLocalizationMessages(tenantId, request.getRequestInfo());
		List<String> toUsers = new ArrayList<>();
		String mobileNumber = request.getAllotment().get(0).getOwnerInfo().get(0).getMobileNo();
		
		Map<String, String> mapOfPhoneNoAndUUIDs = fetchUserUUIDs(mobileNumber, request.getRequestInfo(), tenantId);
		
		if (CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs.keySet())) {
			log.info("UUID search failed!");
		}

		if (!CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs) && mapOfPhoneNoAndUUIDs.containsKey(mobileNumber)) {
			toUsers.add(mapOfPhoneNoAndUUIDs.get(mobileNumber));
		}

		// Fetch and add alternate mobile number recipient if present in additionalDetails
		if (request.getAllotment().get(0).getAdditionalDetails() != null) {
			com.fasterxml.jackson.databind.JsonNode additionalDetails = request.getAllotment().get(0).getAdditionalDetails();
			if (additionalDetails.has("alternateMobileNumber") && !additionalDetails.get("alternateMobileNumber").isNull()) {
				String alternateMobileNumber = additionalDetails.get("alternateMobileNumber").asText();
				if (StringUtils.isNotBlank(alternateMobileNumber)) {
					Map<String, String> mapOfAltPhoneNoAndUUIDs = fetchUserUUIDs(alternateMobileNumber, request.getRequestInfo(), tenantId);
					if (!CollectionUtils.isEmpty(mapOfAltPhoneNoAndUUIDs) && mapOfAltPhoneNoAndUUIDs.containsKey(alternateMobileNumber)) {
						toUsers.add(mapOfAltPhoneNoAndUUIDs.get(alternateMobileNumber));
						log.info("Added alternate recipient UUID: {} for mobile: {}", 
								mapOfAltPhoneNoAndUUIDs.get(alternateMobileNumber), alternateMobileNumber);
					}
				}
			}
		}

		String message = null;
		message = util.getCustomizedMsg(request.getAllotment().get(0),localizationMessages);
		
		log.info("Message for event in Allotment :" + message);
		Recepient recepient = Recepient.builder().toUsers(toUsers).toRoles(null).build();
		log.info("Recipient object in RL:" + recepient.toString());
		events.add(
				Event.builder()
				.tenantId(tenantId)
				.description(message)
				.eventType(RLConstants.USREVENTS_EVENT_TYPE)
				.name(RLConstants.USREVENTS_EVENT_NAME)
				.postedBy(RLConstants.USREVENTS_EVENT_POSTEDBY)
				.source(org.egov.rl.services.models.event.Source.WEBAPP)
				.recepient(recepient)
				.eventDetails(null)
				.actions(null).build());
		if (!CollectionUtils.isEmpty(events)) {
			return EventRequest
					.builder()
					.requestInfo(request.getRequestInfo())
					.events(events)
					.build();
		} else {
			return null;
		}

	}

	/**
	 * Fetches UUIDs of CITIZEN based on the phone number.
	 *
	 * @param mobileNumber - Mobile Numbers
	 * @param requestInfo  - Request Information
	 * @param tenantId     - Tenant Id
	 * @return Returns List of MobileNumbers and UUIDs
	 */
	public Map<String, String> fetchUserUUIDs(String mobileNumber, RequestInfo requestInfo, String tenantId) {
		Map<String, String> mapOfPhoneNoAndUUIDs = new HashMap<>();
		StringBuilder uri = new StringBuilder();
		uri.append(config.getUserHost()).append(config.getUserSearchEndpoint());
		Map<String, Object> userSearchRequest = new HashMap<>();
		userSearchRequest.put("RequestInfo", requestInfo);
		userSearchRequest.put("tenantId", tenantId);
		userSearchRequest.put("userType", "CITIZEN");
		userSearchRequest.put("userName", mobileNumber);
		try {

			Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest);
			log.info("User fetched in fetUserUUID method of pet notfication consumer" + user.toString());
			if (user instanceof Optional) {
				Optional<Object> optionalUser = (Optional<Object>) user;
				if (optionalUser.isPresent()) {
					List<String> uuids = JsonPath.read(optionalUser.get(), "$.user[*].uuid");
					if (!uuids.isEmpty()) {
						mapOfPhoneNoAndUUIDs.put(mobileNumber, uuids.get(0));
					} else {
						log.warn("No user found for mobile number: " + mobileNumber);
					}
				} else {
					log.error("Service returned empty Optional while fetching user for username - " + mobileNumber);
				}
			} else {
				log.error("Service returned null while fetching user for username - " + mobileNumber);
			}
		} catch (Exception e) {
			log.error("Exception while fetching user for username - " + mobileNumber);
			log.error("Exception trace: ", e);
		}
		return mapOfPhoneNoAndUUIDs;
	}

	/**
	 * Dispatches workflow-triggered SMS notifications based on action and status.
	 */
	public void sendWorkflowSMS(AllotmentRequest request) {
		if (request == null || CollectionUtils.isEmpty(request.getAllotment())) {
			return;
		}

		for (AllotmentDetails allotment : request.getAllotment()) {
			try {
				enrichOrDecryptOwners(allotment, request.getRequestInfo());
				String action = allotment.getWorkflow() != null ? allotment.getWorkflow().getAction() : null;
				String status = allotment.getStatus();

				log.info("Checking workflow SMS for application: {}, action: {}, status: {}", 
						allotment.getApplicationNumber(), action, status);

				if (isApproveAction(action, status)) {
					sendApplicationApprovedSMS(request.getRequestInfo(), allotment);
				} else if (isSettlementAction(action, status)) {
					sendSettlementPaymentSMS(request.getRequestInfo(), allotment);
				} else if (isClosedAction(action, status)) {
					sendApplicationClosedSMS(request.getRequestInfo(), allotment);
				}
			} catch (Exception e) {
				log.error("Error sending workflow SMS for application: {}", allotment.getApplicationNumber(), e);
			}
		}
	}

	/**
	 * Application Approved & Initial Allotment Fee Demand (RL_APP_APPROVED_NOTICE)
	 * DLT: Dear {1}, your Rent & Lease application {2} has been APPROVED by {3}. Please pay the allotment fee of Rs.{4} at {5} - mSeva Punjab
	 */
	public void sendApplicationApprovedSMS(RequestInfo requestInfo, AllotmentDetails allotment) {
		String tenantId = allotment.getTenantId();
		List<String> mobileNumbers = getAllMobileNumbers(allotment);
		if (CollectionUtils.isEmpty(mobileNumbers)) {
			log.warn("No mobile number found for application approval SMS: {}", allotment.getApplicationNumber());
			return;
		}

		String template = getMessageFromLocalization(tenantId, requestInfo, 
				RLConstants.NOTIFICATION_APP_APPROVED_SMS, RLConstants.FALLBACK_APP_APPROVED_SMS);

		String ownerName = getOwnerName(allotment);
		String appNo = allotment.getApplicationNumber() != null ? allotment.getApplicationNumber() : "";
		String ulbName = getUlbName(tenantId);
		String fee = getAllotmentFee(allotment);
		String paymentUrl = buildPaymentUrl(appNo, tenantId);

		String message = template.replace("{1}", ownerName)
				.replace("{2}", appNo)
				.replace("{3}", ulbName)
				.replace("{4}", fee)
				.replace("{5}", paymentUrl);

		List<SMSRequest> smsList = new ArrayList<>();
		for (String mobile : mobileNumbers) {
			smsList.add(new SMSRequest(mobile, message));
		}
		util.sendSMS(smsList);
		log.info("Sent RL_APP_APPROVED_NOTICE SMS to {} recipients for application {}", smsList.size(), appNo);

		// Also send Email if email address is present
		try {
			List<String> emailIds = getAllEmailIds(allotment);
			if (!CollectionUtils.isEmpty(emailIds)) {
				String emailTemplate = getMessageFromLocalization(tenantId, requestInfo, 
						RLConstants.NOTIFICATION_APP_APPROVED_EMAIL, null);
				String emailBody;
				if (StringUtils.isNotBlank(emailTemplate)) {
					emailBody = emailTemplate.replace("{1}", ownerName)
							.replace("{2}", appNo)
							.replace("{3}", ulbName)
							.replace("{4}", fee)
							.replace("{5}", paymentUrl);
				} else {
					emailBody = message;
				}

				String subject = "Rent & Lease Application Approved — Application No. " + appNo;
				for (String emailId : emailIds) {
					Email emailObj = Email.builder()
							.emailTo(new HashSet<>(Collections.singletonList(emailId)))
							.isHTML(StringUtils.isNotBlank(emailTemplate))
							.subject(subject)
							.body(emailBody)
							.build();
					util.sendEmail(Collections.singletonList(new EmailRequest(requestInfo, emailObj)));
					log.info("Sent application approved email to {} for app: {}", emailId, appNo);
				}
			}
		} catch (Exception e) {
			log.error("Error sending application approved email for app: {}", appNo, e);
		}
	}

	/**
	 * Lease Surrender / Disconnection Settlement Demand (RL_SETTLEMENT_PAYMENT_NOTICE)
	 * DLT: Dear {1}, settlement dues of Rs.{2} for lease surrender/closure of Allotment {3} are payable. Pay at {4} to complete closure - {5}
	 */
	public void sendSettlementPaymentSMS(RequestInfo requestInfo, AllotmentDetails allotment) {
		String tenantId = allotment.getTenantId();
		List<String> mobileNumbers = getAllMobileNumbers(allotment);
		if (CollectionUtils.isEmpty(mobileNumbers)) {
			log.warn("No mobile number found for settlement SMS: {}", allotment.getApplicationNumber());
			return;
		}

		String template = getMessageFromLocalization(tenantId, requestInfo, 
				RLConstants.NOTIFICATION_LEASE_SETTLEMENT_SMS, RLConstants.FALLBACK_LEASE_SETTLEMENT_SMS);

		String ownerName = getOwnerName(allotment);
		String dues = allotment.getAmountToBeDeducted() != null ? allotment.getAmountToBeDeducted().toPlainString() : "0";
		String appNo = allotment.getApplicationNumber() != null ? allotment.getApplicationNumber() : "";
		String paymentUrl = buildPaymentUrl(appNo, tenantId);
		String ulbName = getUlbName(tenantId);

		String message = template.replace("{1}", ownerName)
				.replace("{2}", dues)
				.replace("{3}", appNo)
				.replace("{4}", paymentUrl)
				.replace("{5}", ulbName);

		List<SMSRequest> smsList = new ArrayList<>();
		for (String mobile : mobileNumbers) {
			smsList.add(new SMSRequest(mobile, message));
		}
		util.sendSMS(smsList);
		log.info("Sent RL_SETTLEMENT_PAYMENT_NOTICE SMS to {} recipients for application {}", smsList.size(), appNo);

		// Also send Email if email address is present
		try {
			List<String> emailIds = getAllEmailIds(allotment);
			if (!CollectionUtils.isEmpty(emailIds)) {
				String emailTemplate = getMessageFromLocalization(tenantId, requestInfo, 
						RLConstants.NOTIFICATION_LEASE_SETTLEMENT_EMAIL, null);
				String emailBody;
				if (StringUtils.isNotBlank(emailTemplate)) {
					emailBody = emailTemplate.replace("{1}", ownerName)
							.replace("{2}", dues)
							.replace("{3}", appNo)
							.replace("{4}", paymentUrl)
							.replace("{5}", ulbName);
				} else {
					emailBody = message;
				}

				String subject = "Settlement Dues Notice: Lease Surrender/Disconnection — Allotment No. " + appNo;
				for (String emailId : emailIds) {
					Email emailObj = Email.builder()
							.emailTo(new HashSet<>(Collections.singletonList(emailId)))
							.isHTML(StringUtils.isNotBlank(emailTemplate))
							.subject(subject)
							.body(emailBody)
							.build();
					util.sendEmail(Collections.singletonList(new EmailRequest(requestInfo, emailObj)));
					log.info("Sent lease settlement email to {} for app: {}", emailId, appNo);
				}
			}
		} catch (Exception e) {
			log.error("Error sending lease settlement email for app: {}", appNo, e);
		}
	}

	/**
	 * Lease Agreement Closed / Cancelled (RL_APPLICATION_CLOSED_NOTICE)
	 * DLT: Dear {1}, Rent & Lease Allotment {2} has been successfully CLOSED in records of {3}. All dues are cleared. Thank you - mSeva Punjab
	 */
	public void sendApplicationClosedSMS(RequestInfo requestInfo, AllotmentDetails allotment) {
		String tenantId = allotment.getTenantId();
		List<String> mobileNumbers = getAllMobileNumbers(allotment);
		if (CollectionUtils.isEmpty(mobileNumbers)) {
			log.warn("No mobile number found for closed SMS: {}", allotment.getApplicationNumber());
			return;
		}

		String template = getMessageFromLocalization(tenantId, requestInfo, 
				RLConstants.NOTIFICATION_LEASE_CLOSED_SMS, RLConstants.FALLBACK_LEASE_CLOSED_SMS);

		String ownerName = getOwnerName(allotment);
		String appNo = allotment.getApplicationNumber() != null ? allotment.getApplicationNumber() : "";
		String ulbName = getUlbName(tenantId);

		String message = template.replace("{1}", ownerName)
				.replace("{2}", appNo)
				.replace("{3}", ulbName);

		List<SMSRequest> smsList = new ArrayList<>();
		for (String mobile : mobileNumbers) {
			smsList.add(new SMSRequest(mobile, message));
		}
		util.sendSMS(smsList);
		log.info("Sent RL_APPLICATION_CLOSED_NOTICE SMS to {} recipients for application {}", smsList.size(), appNo);

		// Also send Email if email address is present
		try {
			List<String> emailIds = getAllEmailIds(allotment);
			if (!CollectionUtils.isEmpty(emailIds)) {
				String emailTemplate = getMessageFromLocalization(tenantId, requestInfo, 
						RLConstants.NOTIFICATION_LEASE_CLOSED_EMAIL, null);
				String emailBody;
				if (StringUtils.isNotBlank(emailTemplate)) {
					emailBody = emailTemplate.replace("{1}", ownerName)
							.replace("{2}", appNo)
							.replace("{3}", ulbName);
				} else {
					emailBody = message;
				}

				String subject = "Official Confirmation: Rent & Lease Allotment No. " + appNo + " Closed";
				for (String emailId : emailIds) {
					Email emailObj = Email.builder()
							.emailTo(new HashSet<>(Collections.singletonList(emailId)))
							.isHTML(StringUtils.isNotBlank(emailTemplate))
							.subject(subject)
							.body(emailBody)
							.build();
					util.sendEmail(Collections.singletonList(new EmailRequest(requestInfo, emailObj)));
					log.info("Sent lease closed email to {} for app: {}", emailId, appNo);
				}
			}
		} catch (Exception e) {
			log.error("Error sending lease closed email for app: {}", appNo, e);
		}
	}

	/**
	 * Payment Successful Confirmation for Rent / Allotment Fee (RL_PAYMENT_SUCCESS_CONFIRM)
	 * DLT: Dear {1}, payment of Rs.{2} received towards Rent & Lease Allotment {3} vide Receipt No.{4}. Download receipt at {5} - mSeva Punjab
	 */
	public void sendPaymentSuccessNotification(PaymentRequest paymentRequest, AllotmentDetails allotment) {
		if (paymentRequest == null || paymentRequest.getPayment() == null) {
			return;
		}

		if (allotment != null) {
			enrichOrDecryptOwners(allotment, paymentRequest.getRequestInfo());
		}

		String tenantId = paymentRequest.getPayment().getTenantId();
		String consumerCode = allotment != null && allotment.getApplicationNumber() != null 
				? allotment.getApplicationNumber()
				: (!CollectionUtils.isEmpty(paymentRequest.getPayment().getPaymentDetails()) 
						&& paymentRequest.getPayment().getPaymentDetails().get(0).getBill() != null
						? paymentRequest.getPayment().getPaymentDetails().get(0).getBill().getConsumerCode() : "");

		String payerName = StringUtils.isNotBlank(paymentRequest.getPayment().getPayerName()) && !isEncrypted(paymentRequest.getPayment().getPayerName())
				? paymentRequest.getPayment().getPayerName()
				: (StringUtils.isNotBlank(paymentRequest.getPayment().getPaidBy()) && !isEncrypted(paymentRequest.getPayment().getPaidBy())
						? paymentRequest.getPayment().getPaidBy() 
						: (allotment != null ? getOwnerName(allotment) : "Citizen"));

		BigDecimal totalAmount = paymentRequest.getPayment().getTotalAmountPaid() != null
				? paymentRequest.getPayment().getTotalAmountPaid()
				: BigDecimal.ZERO;

		PaymentDetail paymentDetail = !CollectionUtils.isEmpty(paymentRequest.getPayment().getPaymentDetails())
				? paymentRequest.getPayment().getPaymentDetails().get(0)
				: null;

		String receiptNumber = paymentDetail != null && StringUtils.isNotBlank(paymentDetail.getReceiptNumber())
				? paymentDetail.getReceiptNumber()
				: (paymentRequest.getPayment().getTransactionNumber() != null 
						? paymentRequest.getPayment().getTransactionNumber() : "N/A");

		String receiptUrl = buildPaymentUrl(consumerCode, tenantId);

		String template = getMessageFromLocalization(tenantId, paymentRequest.getRequestInfo(), 
				RLConstants.NOTIFICATION_PAYMENT_SUCCESS_SMS, RLConstants.FALLBACK_PAYMENT_SUCCESS_SMS);

		String message = template.replace("{1}", payerName)
				.replace("{2}", totalAmount.toPlainString())
				.replace("{3}", consumerCode)
				.replace("{4}", receiptNumber)
				.replace("{5}", receiptUrl);

		// Target mobile numbers: from Payment + allotment owner info
		List<String> mobileNumbers = new ArrayList<>();
		if (StringUtils.isNotBlank(paymentRequest.getPayment().getMobileNumber()) && !isEncrypted(paymentRequest.getPayment().getMobileNumber())) {
			mobileNumbers.add(paymentRequest.getPayment().getMobileNumber());
		}
		if (allotment != null) {
			for (String mob : getAllMobileNumbers(allotment)) {
				if (!mobileNumbers.contains(mob)) {
					mobileNumbers.add(mob);
				}
			}
		}

		List<SMSRequest> smsList = new ArrayList<>();
		for (String mobile : mobileNumbers) {
			smsList.add(new SMSRequest(mobile, message));
		}
		util.sendSMS(smsList);
		log.info("Sent RL_PAYMENT_SUCCESS_CONFIRM SMS to {} recipients for consumerCode: {}", smsList.size(), consumerCode);

		// Also send Email if email address is present
		try {
			Set<String> emailIds = new HashSet<>();
			if (StringUtils.isNotBlank(paymentRequest.getPayment().getPayerEmail())) {
				emailIds.add(paymentRequest.getPayment().getPayerEmail().trim());
			}
			if (allotment != null) {
				emailIds.addAll(getAllEmailIds(allotment));
			}

			if (!CollectionUtils.isEmpty(emailIds)) {
				String emailTemplate = getMessageFromLocalization(tenantId, paymentRequest.getRequestInfo(), 
						RLConstants.NOTIFICATION_PAYMENT_SUCCESS_EMAIL, null);
				String emailBody;
				if (StringUtils.isNotBlank(emailTemplate)) {
					emailBody = emailTemplate.replace("{1}", payerName)
							.replace("{2}", totalAmount.toPlainString())
							.replace("{3}", consumerCode)
							.replace("{4}", receiptNumber)
							.replace("{5}", receiptUrl)
							.replace("{8}", getUlbName(tenantId));
				} else {
					emailBody = message;
				}

				String emailSubject = "Payment Receipt Confirmation — Rent & Lease Allotment " + consumerCode;
				for (String emailId : emailIds) {
					Email emailObj = Email.builder()
							.emailTo(new HashSet<>(Collections.singletonList(emailId)))
							.isHTML(StringUtils.isNotBlank(emailTemplate))
							.subject(emailSubject)
							.body(emailBody)
							.build();
					util.sendEmail(Collections.singletonList(new EmailRequest(paymentRequest.getRequestInfo(), emailObj)));
					log.info("Sent payment confirmation email to {} for consumerCode: {}", emailId, consumerCode);
				}
			}
		} catch (Exception e) {
			log.error("Error sending payment confirmation email for consumerCode: {}", consumerCode, e);
		}
	}

	private List<String> getAllEmailIds(AllotmentDetails allotment) {
		List<String> emails = new ArrayList<>();
		if (allotment != null && !CollectionUtils.isEmpty(allotment.getOwnerInfo())) {
			for (org.egov.rl.services.models.OwnerInfo owner : allotment.getOwnerInfo()) {
				if (owner != null && StringUtils.isNotBlank(owner.getEmailId()) && !isEncrypted(owner.getEmailId())) {
					emails.add(owner.getEmailId().trim());
				}
			}
		}
		return emails;
	}

	private boolean isApproveAction(String action, String status) {
		if (action != null && (action.equalsIgnoreCase(RLConstants.RL_WF_APPROVE) || action.contains("APPROVE"))) {
			return true;
		}
		return RLConstants.PENDING_FOR_PAYMENT_RL_APPLICATION.equalsIgnoreCase(status);
	}

	private boolean isSettlementAction(String action, String status) {
		if (action != null && (action.equalsIgnoreCase(RLConstants.FORWARD_FOR_SATELMENT_RL_APPLICATION)
				|| action.equalsIgnoreCase(RLConstants.RL_WF_PAY_SETTLEMENT_AMOUNT)
				|| action.equalsIgnoreCase("FORWARD_FOR_SETTLEMENT"))) {
			return true;
		}
		return RLConstants.FORWARD_FOR_SATELMENT_RL_APPLICATION.equalsIgnoreCase(status);
	}

	private boolean isClosedAction(String action, String status) {
		if (action != null && (action.equalsIgnoreCase(RLConstants.RL_WF_CLOSED) 
				|| action.equalsIgnoreCase("CANCEL") || action.equalsIgnoreCase("CANCELLED"))) {
			return true;
		}
		return "CLOSED".equalsIgnoreCase(status);
	}

	private String getOwnerName(AllotmentDetails allotment) {
		if (allotment != null && !CollectionUtils.isEmpty(allotment.getOwnerInfo()) 
				&& allotment.getOwnerInfo().get(0) != null 
				&& StringUtils.isNotBlank(allotment.getOwnerInfo().get(0).getName())
				&& !isEncrypted(allotment.getOwnerInfo().get(0).getName())) {
			return allotment.getOwnerInfo().get(0).getName();
		}
		return "Citizen";
	}

	private String getMobileNumber(AllotmentDetails allotment) {
		if (allotment != null && !CollectionUtils.isEmpty(allotment.getOwnerInfo()) 
				&& allotment.getOwnerInfo().get(0) != null 
				&& StringUtils.isNotBlank(allotment.getOwnerInfo().get(0).getMobileNo())
				&& !isEncrypted(allotment.getOwnerInfo().get(0).getMobileNo())) {
			return allotment.getOwnerInfo().get(0).getMobileNo();
		}
		return null;
	}

	private List<String> getAllMobileNumbers(AllotmentDetails allotment) {
		List<String> mobileNumbers = new ArrayList<>();
		String primaryMobile = getMobileNumber(allotment);
		if (StringUtils.isNotBlank(primaryMobile) && !isEncrypted(primaryMobile)) {
			mobileNumbers.add(primaryMobile);
		}
		if (allotment != null && allotment.getAdditionalDetails() != null) {
			com.fasterxml.jackson.databind.JsonNode details = allotment.getAdditionalDetails();
			if (details.has("alternateMobileNumber") && !details.get("alternateMobileNumber").isNull()) {
				String altMobile = details.get("alternateMobileNumber").asText();
				if (StringUtils.isNotBlank(altMobile) && !isEncrypted(altMobile) && !mobileNumbers.contains(altMobile)) {
					mobileNumbers.add(altMobile);
				}
			}
		}
		return mobileNumbers;
	}

	private void enrichOrDecryptOwners(AllotmentDetails allotment, RequestInfo requestInfo) {
		if (allotment == null || CollectionUtils.isEmpty(allotment.getOwnerInfo())) {
			return;
		}
		for (org.egov.rl.services.models.OwnerInfo owner : allotment.getOwnerInfo()) {
			if (owner == null || StringUtils.isBlank(owner.getUserUuid())) {
				continue;
			}
			boolean needsEnrichment = StringUtils.isBlank(owner.getName())
					|| StringUtils.isBlank(owner.getMobileNo())
					|| StringUtils.isBlank(owner.getEmailId())
					|| isEncrypted(owner.getName())
					|| isEncrypted(owner.getMobileNo())
					|| isEncrypted(owner.getEmailId());

			if (needsEnrichment) {
				try {
					org.egov.rl.services.models.user.UserDetailResponse response = 
							util.fetchUserByUuid(owner.getUserUuid(), requestInfo, allotment.getTenantId());
					if (response != null && !CollectionUtils.isEmpty(response.getUser()) && response.getUser().get(0) != null) {
						org.egov.rl.services.models.user.User user = response.getUser().get(0);
						if (StringUtils.isNotBlank(user.getName()) && !isEncrypted(user.getName())) {
							owner.setName(user.getName());
						}
						if (StringUtils.isNotBlank(user.getMobileNumber()) && !isEncrypted(user.getMobileNumber())) {
							owner.setMobileNo(user.getMobileNumber());
						}
						if (StringUtils.isNotBlank(user.getEmailId()) && !isEncrypted(user.getEmailId())) {
							owner.setEmailId(user.getEmailId());
						}
					}
				} catch (Exception e) {
					log.warn("Failed to decrypt owner details for user UUID: {}", owner.getUserUuid(), e);
				}
			}
		}
	}

	private boolean isEncrypted(String value) {
		return value != null && value.contains("|") && value.indexOf('|') > 0;
	}

	private String getAllotmentFee(AllotmentDetails allotment) {
		try {
			if (allotment != null && allotment.getAdditionalDetails() != null) {
				com.fasterxml.jackson.databind.JsonNode details = allotment.getAdditionalDetails();
				if (details.has("allotmentFee") && !details.get("allotmentFee").isNull()) {
					return details.get("allotmentFee").asText();
				}
				if (details.has("securityDeposit") && !details.get("securityDeposit").isNull()) {
					return details.get("securityDeposit").asText();
				}
			}
		} catch (Exception e) {
			log.warn("Error reading fee from allotment details: {}", e.getMessage());
		}
		return "0";
	}

	private String getUlbName(String tenantId) {
		if (StringUtils.isBlank(tenantId)) {
			return "mSeva Punjab";
		}
		String[] parts = tenantId.split("\\.");
		String city = parts.length > 1 ? parts[1] : parts[0];
		if ("pb".equalsIgnoreCase(city)) {
			return "mSeva Punjab";
		}
		return "Municipal Corporation " + Character.toUpperCase(city.charAt(0)) + city.substring(1);
	}

	private String buildPaymentUrl(String consumerCode, String tenantId) {
		if (StringUtils.isNotBlank(notificationUrl)) {
			if (notificationUrl.contains("select-language")) {
				return notificationUrl;
			}
			return notificationUrl + "/" + consumerCode + "?tenantId=" + tenantId;
		}
		String baseHost = "https://mseva.lgpunjab.gov.in";
		if (config != null && config.getUiAppHost() != null && !config.getUiAppHost().isEmpty()) {
			baseHost = config.getUiAppHost();
		}
		String longUrl = baseHost + "/digit-ui/citizen/payment/my-bills/rl-services/" + consumerCode + "?tenantId=" + tenantId;
		try {
			if (util != null) {
				return util.getShortenedUrl(longUrl);
			}
		} catch (Exception e) {
			log.warn("Failed to shorten URL: {}, using direct URL", longUrl);
		}
		return longUrl;
	}

	private String getMessageFromLocalization(String tenantId, RequestInfo requestInfo, String code, String defaultTemplate) {
		try {
			String localizationMessages = util.getLocalizationMessages(tenantId, requestInfo);
			if (StringUtils.isNotBlank(localizationMessages)) {
				String template = util.getMessageTemplate(code, localizationMessages);
				if (StringUtils.isNotBlank(template)) {
					return template;
				}
			}
		} catch (Exception e) {
			log.warn("Localization lookup failed for code: {}, falling back to default template", code);
		}
		return defaultTemplate;
	}
}
