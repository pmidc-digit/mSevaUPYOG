package org.egov.rl.calculator.service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.jayway.jsonpath.Filter;
import com.jayway.jsonpath.JsonPath;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.AllotmentRequest;
import org.egov.rl.calculator.web.models.SMSRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;
import com.jayway.jsonpath.JsonPath;

import static org.egov.rl.calculator.util.RLConstants.*;

@Slf4j
@Service
public class NotificationService {

	@Autowired
	private NotificationUtil notifUtil;

	@Autowired
	private Configurations configs;

	@Autowired
	private RestTemplate restTemplate;

	@Value("${notification.url}")
	private String notificationURL;

	public void sendNotificationSMS(AllotmentRequest allotmentRequest) {

		String msg = notifUtil.getLocalizationMessages(allotmentRequest.getAllotment().getTenantId(),
				allotmentRequest.getRequestInfo());

		// Ignoring paid status, since it's wired from payment consumer directly
		if (!StringUtils.isEmpty(msg)) {
//			msg = replaceCommonValues(property, msg, localisedState);
			prepareMsgAndSend(allotmentRequest, msg);
		}
	}




	private String getLocalisedState(String completeMsgs) {

		String state = "APPROVED";
		
		switch (state) {

		case WF_STATUS_REJECTED:
			return notifUtil.getMessageTemplate(WF_STATUS_REJECTED_LOCALE, completeMsgs);

		case WF_STATUS_DOCVERIFIED:
			return notifUtil.getMessageTemplate(WF_STATUS_DOCVERIFIED_LOCALE, completeMsgs);

		case WF_STATUS_FIELDVERIFIED:
			return notifUtil.getMessageTemplate(WF_STATUS_FIELDVERIFIED_LOCALE, completeMsgs);

		case WF_STATUS_OPEN:
			return notifUtil.getMessageTemplate(WF_STATUS_OPEN_LOCALE, completeMsgs);

		case PT_UPDATE_OWNER_NUMBER:
			return notifUtil.getMessageTemplate(PT_UPDATE_OWNER_NUMBER, completeMsgs);

		}
		return state;
	}

	/**
	 * Prepares msg for each owner and send
	 *
	 * @param request
	 * @param msg
	 */
	private void prepareMsgAndSend(AllotmentRequest request, String msg) {

		AllotmentDetails allotmentDetails = request.getAllotment();
		RequestInfo requestInfo = request.getRequestInfo();
		
		Map<String, String> mobileNumberToOwner = new HashMap<>();
		request.getAllotment().getOwnerInfo().forEach(u->{
			mobileNumberToOwner.put(u.getMobileNo(), u.getName());
		});
		
		String tenantId = allotmentDetails.getTenantId();
		String moduleName="rl-services";
		
		String action = "RL_PAYMENT_REMINDER";
		msg=notifUtil.getMessageTemplate(action, msg);
		
		List<String> configuredChannelNames = notifUtil.fetchChannelList(requestInfo, tenantId, moduleName,action);
		Set<String> mobileNumbers = new HashSet<>();

		log.info("mobileNumbers sms: " + mobileNumbers);
		log.info("mobileNumberToOwner sms: " + mobileNumberToOwner);
		log.info("CHANNEL_NAME_SMS sms: " + configuredChannelNames);
		
		List<SMSRequest> smsRequests = notifUtil.createSMSRequest(msg, mobileNumberToOwner);
		if (configuredChannelNames.contains(CHANNEL_NAME_SMS)) {
			log.info("Inside  sms: " + smsRequests);
			notifUtil.sendSMS(smsRequests);
		}
	
	}

	private String fetchContentFromLocalization(RequestInfo requestInfo, String tenantId, String module, String code) {
		String message = null;
		List<String> codes = new ArrayList<>();
		List<String> messages = new ArrayList<>();
		Object result = null;
		String locale = "";
		if (!StringUtils.isEmpty(requestInfo.getMsgId()) && requestInfo.getMsgId().split("|").length >= 2)
			locale = requestInfo.getMsgId().split("\\|")[1];

		if (StringUtils.isEmpty(locale))
			locale = configs.getFallBackLocale();
		StringBuilder uri = new StringBuilder();
		uri.append(configs.getLocalizationHost()).append(configs.getLocalizationContextPath())
				.append(configs.getLocalizationSearchEndpoint());
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

	/*
	 * Method to get the message template for owner mobile number update
	 * notification
	 */

	private String getMsgForMobileNumberUpdate(String msgCode, String completeMsgs) {

		return notifUtil.getMessageTemplate(msgCode, completeMsgs);
	}

	/*
	 * Method to send notifications to both (old and new) owner mobile number while
	 * updation.
	 */

//	private void prepareMsgAndSendToBothNumbers(PropertyRequest request, Property propertyFromSearch, String msg,
//			Map<String, String> uuidToMobileNumber) {
//
//		Property property = request.getProperty();
//		RequestInfo requestInfo = request.getRequestInfo();
//		List<String> configuredChannelNames = notifUtil.fetchChannelList(requestInfo,
//				request.getProperty().getTenantId(), PTConstants.PT_BUSINESSSERVICE, ACTION_UPDATE_MOBILE);
//		Set<String> mobileNumbers = new HashSet<>();
//
////		property.getOwners().forEach(owner -> {
////
////			if(uuidToMobileNumber.containsKey(owner.getUuid()) && uuidToMobileNumber.get(owner.getUuid())!=owner.getMobileNumber()) {
////				
////				String customizedMsg = msg.replace(PT_OWNER_NAME,owner.getName()).replace(PT_OLD_MOBILENUMBER, uuidToMobileNumber.get(owner.getUuid())).replace(PT_NEW_MOBILENUMBER, owner.getMobileNumber());
////				Map<String, String> mobileNumberToOwner = new HashMap<>();
////				
////				mobileNumberToOwner.put(uuidToMobileNumber.get(owner.getUuid()), owner.getName());
////				mobileNumberToOwner.put(owner.getMobileNumber(),owner.getName());
////				mobileNumbers.add(uuidToMobileNumber.get(owner.getUuid()));
////				mobileNumbers.add(owner.getMobileNumber());
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_SMS)) {
////					List<SMSRequest> smsRequests = notifUtil.createSMSRequest(customizedMsg, mobileNumberToOwner);
////					notifUtil.sendSMS(smsRequests);
////				}
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_EVENT)) {
////					Boolean isActionReq = true;
////					List<SMSRequest> smsRequests = notifUtil.createSMSRequest(customizedMsg, mobileNumberToOwner);
////					List<Event> events = notifUtil.enrichEvent(smsRequests, requestInfo, property.getTenantId(), property, isActionReq);
////					notifUtil.sendEventNotification(new EventRequest(requestInfo, events));
////				}
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_EMAIL)) {
////					Map<String, String> mapOfPhnoAndEmail = notifUtil.fetchUserEmailIds(mobileNumbers, requestInfo, request.getProperty().getTenantId());
////					List<EmailRequest> emailRequests = notifUtil.createEmailRequest(requestInfo, customizedMsg, mapOfPhnoAndEmail);
////					notifUtil.sendEmail(emailRequests);
////				}
////				}
////		});
//
//	}
//
//	public void sendNotificationForAlternateNumberUpdate(PropertyRequest request, Property propertyFromSearch,
//			Map<String, String> uuidToAlternateMobileNumber) {
//
//		Property property = request.getProperty();
//		String msg = null;
//
//		String completeMsgs = notifUtil.getLocalizationMessages(property.getTenantId(), request.getRequestInfo());
//		msg = getMsgForMobileNumberUpdate(PT_UPDATE_ALTERNATE_NUMBER, completeMsgs);
//		prepareMsgAndSendToAlternateNumber(request, propertyFromSearch, msg, uuidToAlternateMobileNumber);
//
//	}
//
//	private void prepareMsgAndSendToAlternateNumber(PropertyRequest request, Property propertyFromSearch, String msg,
//			Map<String, String> uuidToAlternateMobileNumber) {
//
//		Property property = request.getProperty();
//		RequestInfo requestInfo = request.getRequestInfo();
//		List<String> configuredChannelNames = notifUtil.fetchChannelList(request.getRequestInfo(),
//				request.getProperty().getTenantId(), PTConstants.PT_BUSINESSSERVICE,
//				PTConstants.ACTION_ALTERNATE_MOBILE);
//		Set<String> mobileNumbers = new HashSet<>();
//
////		property.getOwners().forEach(owner -> {
////
////			if(owner.getAlternatemobilenumber()!=null && !uuidToAlternateMobileNumber.get(owner.getUuid()).equalsIgnoreCase(owner.getAlternatemobilenumber()) ) {	
////				String customizedMsgForApp = msg.replace(PT_OWNER_NAME,owner.getName()).replace(PT_ALTERNATE_NUMBER, owner.getAlternatemobilenumber());
////				String customizedMsg =  customizedMsgForApp.replace(VIEW_PROPERTY_CODE,"");
////				Map<String, String> mobileNumberToOwner = new HashMap<>();
////				mobileNumberToOwner.put(owner.getMobileNumber(), owner.getName());
////				mobileNumbers.add(owner.getMobileNumber());
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_SMS)) {
////					List<SMSRequest> smsRequests = notifUtil.createSMSRequest(customizedMsg, mobileNumberToOwner);
////					notifUtil.sendSMS(smsRequests);
////				}
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_EVENT)) {
////					Boolean isActionReq = true;
////					List<SMSRequest> smsRequests = notifUtil.createSMSRequest(customizedMsgForApp, mobileNumberToOwner);
////					List<Event> events = notifUtil.enrichEvent(smsRequests, requestInfo, property.getTenantId(), property, isActionReq);
////					notifUtil.sendEventNotification(new EventRequest(requestInfo, events));
////				}
////
////				if(configuredChannelNames.contains(CHANNEL_NAME_EMAIL)) {
////					Map<String, String> mapOfPhnoAndEmail = notifUtil.fetchUserEmailIds(mobileNumbers, requestInfo, request.getProperty().getTenantId());
////					List<EmailRequest> emailRequests = notifUtil.createEmailRequest(requestInfo, customizedMsg, mapOfPhnoAndEmail);
////				 	notifUtil.sendEmail(emailRequests);
////				}
////			}
////		});
//
//	}

	/**
	 * Method to send notifications for citizen feedback
	 *
	 * @param property
	 * @param localizationMsgs
	 * @param serviceType
	 * @return
	 */
//	private void sendNotificationForCitizenFeedback(AllotmentDetails allotmentDetails, String localizationMsgs, String serviceType) {
//
//		String citizenFeedackMessage = notifUtil.getMsgForCitizenFeedbackNotification(property, localizationMsgs, serviceType);
//		Map<String, String> mobileNumberToOwner = new HashMap<>();
//
////		property.getOwners().forEach(owner -> {
////			if (owner.getMobileNumber() != null)
////				mobileNumberToOwner.put(owner.getMobileNumber(), owner.getName());
////		});
//
//		List<SMSRequest> smsRequests = notifUtil.createSMSRequest(citizenFeedackMessage, mobileNumberToOwner);
//		notifUtil.sendSMS(smsRequests);
//
//	}
	




}