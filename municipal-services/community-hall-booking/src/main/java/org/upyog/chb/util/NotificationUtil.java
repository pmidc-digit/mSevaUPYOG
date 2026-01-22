package org.upyog.chb.util;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.upyog.chb.config.CommunityHallBookingConfiguration;
import org.upyog.chb.constants.CommunityHallBookingConstants;
import org.upyog.chb.enums.BookingStatusEnum;
import org.upyog.chb.kafka.producer.Producer;
import org.upyog.chb.repository.ServiceRequestRepository;
import org.upyog.chb.web.models.CommunityHallBookingDetail;
import org.upyog.chb.web.models.CommunityHallBookingRequest;
import org.upyog.chb.web.models.events.EventRequest;
import org.upyog.chb.web.models.notification.SMSRequest;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class NotificationUtil {

	private ServiceRequestRepository serviceRequestRepository;

	private CommunityHallBookingConfiguration config;

	private Producer producer;

	private final String URL = "url";
	private static final String PAYMENT_LINK = "PAYMENT_LINK";
	private static final String PERMISSION_LETTER_LINK = "PERMISSION_LETTER_LINK";
	
	public static final String MESSAGE_TEXT = "MESSAGE_TEXT";
	public static final String ACTION_LINK = "ACTION_LINK";
	
	// New placeholder constants matching BSNL DLT templates
	private static final String AMOUNT = "{AMOUNT}";
	private static final String PORTAL_LINK = "{PORTAL_LINK}";
	private static final String OFFICE_NAME = "{OFFICE_NAME}";
	private static final String PERMISSION_LETTER_LINK_PLACEHOLDER = "{PERMISSION_LETTER_LINK}";
	private static final String REASON = "{REASON}";
	private static final String DATE = "{DATE}";
	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("dd-MM-yyyy");

	@Autowired
	public NotificationUtil(ServiceRequestRepository serviceRequestRepository, CommunityHallBookingConfiguration config,
			Producer producer) {
		this.serviceRequestRepository = serviceRequestRepository;
		this.config = config;
		this.producer = producer;
	}

	/**
	 * Extracts message for the specific code
	 *
	 * @param notificationCode    The code for which message is required
	 * @param localizationMessage The localization messages
	 * @return message for the specific code
	 */
	@SuppressWarnings({ "unchecked" })
	private String getMessageTemplate(String notificationCode, String localizationMessage) {

		String path = "$..messages[?(@.code==\"{}\")].message";
		path = path.replace("{}", notificationCode);
		String message = "";
		try {
			Object messageObj = JsonPath.parse(localizationMessage).read(path);
			message = ((ArrayList<String>) messageObj).get(0);
		} catch (Exception e) {
			log.warn("Fetching from localization failed", e);
		}
		return message;
	}

	/**
	 * Fetches messages from localization service
	 * 
	 * @param tenantId    tenantId of the BPA
	 * @param requestInfo The requestInfo of the request
	 * @return Localization messages for the module
	 */
	@SuppressWarnings("rawtypes")
	public String getLocalizationMessages(String tenantId, RequestInfo requestInfo) {

		LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(getUri(tenantId, requestInfo),
				requestInfo);
		String jsonString = new JSONObject(responseMap).toString();
		return jsonString;
	}

	/**
	 * Returns the uri for the localization call
	 * 
	 * @param tenantId TenantId of the propertyRequest
	 * @return The uri for localization search call
	 */
	private StringBuilder getUri(String tenantId, RequestInfo requestInfo) {

		if (config.getIsLocalizationStateLevel())
			tenantId = tenantId.split("\\.")[0];

		String locale = "en_IN";
		if (!StringUtils.isEmpty(requestInfo.getMsgId()) && requestInfo.getMsgId().split("|").length >= 2)
			locale = requestInfo.getMsgId().split("\\|")[1];

		StringBuilder uri = new StringBuilder();
		uri.append(config.getLocalizationHost()).append(config.getLocalizationContextPath())
				.append(config.getLocalizationSearchEndpoint()).append("?").append("locale=").append(locale)
				.append("&tenantId=").append(tenantId).append("&module=")
				.append(CommunityHallBookingConstants.NOTIFICATION_MODULE_NAME);
		return uri;
	}

	/**
	 * Creates sms request for the each owners
	 * 
	 * @param mobileNumberToOwnerName Map of mobileNumber to OwnerName
	 * @return List of SMSRequest
	 */
	public List<SMSRequest> createSMSRequest(CommunityHallBookingRequest bookingRequest, String message,
			Map<String, String> mobileNumberToOwnerName) {

		List<SMSRequest> smsRequest = new LinkedList<>();
	//	message  = "Dear Citizen, Your OTP to complete your UPYOG Registration is 12345.\\n\\nUPYOG" + "#1207167462318135756#1207167462307097438" ;
		for (Map.Entry<String, String> entryset : mobileNumberToOwnerName.entrySet()) {
			smsRequest.add(new SMSRequest(entryset.getKey(), message));
		}
		return smsRequest;
	}

	/**
	 * Send the SMSRequest on the SMSNotification kafka topic
	 *
	 * @param smsRequestList The list of SMSRequest to be sent
	 */
	public void sendSMS(List<SMSRequest> smsRequestList) {
		if (CollectionUtils.isEmpty(smsRequestList))
			log.info("Messages fobject is empty in send sms!");
		for (SMSRequest smsRequest : smsRequestList) {
			producer.push(config.getSmsNotifTopic(), smsRequest.getMobileNumber(), smsRequest);
			log.debug("SMS request object : " + smsRequest);
			log.info("Sending SMS notification to MobileNumber: " + smsRequest.getMobileNumber() + " Messages: " + smsRequest.getMessage());
		}
	}

	/**
	 * Pushes the event request to Kafka Queue.
	 *
	 * @param request
	 */
	public void sendEventNotification(EventRequest request) {
		log.info("EVENT notification sent!");
		String key = request.getEvents() != null && !request.getEvents().isEmpty() 
				? request.getEvents().get(0).getTenantId() : null;
		producer.push(config.getSaveUserEventsTopic(), key, request);
	}

	/**
	 * 
	 * Get message from {@code localizationMessage} for particular event
	 * Replace dynamic values of messages
	 * 
	 * @param bookingDetail
	 * @param localizationMessage
	 * @param actionStatus
	 * @param eventType
	 * @return
	 */
	public Map<String, String> getCustomizedMsg(CommunityHallBookingDetail bookingDetail, String localizationMessage, String actionStatus, String eventType) {
		String messageTemplate = null, link = null;
		String notificationEventType = actionStatus + "_" + eventType;
		log.info(" booking status : " + bookingDetail.getBookingStatus());
		log.info(" booking status ACTION_STATUS : " + actionStatus); 
		log.info("notificationEventType  : " + notificationEventType);
		
		BookingStatusEnum notificationType = BookingStatusEnum.valueOf(actionStatus);

		switch (notificationType) {

		case BOOKING_CREATED:
			// Fetch message template from localization for pending payment notification
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, PAYMENT_LINK);
			// Populate dynamic values
			messageTemplate = populateDynamicValues(bookingDetail, messageTemplate);
			// Replace portal link placeholder
			if (link != null && messageTemplate.contains(PORTAL_LINK)) {
				messageTemplate = messageTemplate.replace(PORTAL_LINK, link);
			}
			break;

		case BOOKED:
			// Fetch message template for booking confirmed notification
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, PERMISSION_LETTER_LINK);
			// Populate dynamic values
			messageTemplate = populateDynamicValues(bookingDetail, messageTemplate);
			// Replace permission letter link placeholder
			if (link != null && messageTemplate.contains(PERMISSION_LETTER_LINK_PLACEHOLDER)) {
				messageTemplate = messageTemplate.replace(PERMISSION_LETTER_LINK_PLACEHOLDER, link);
			}
			break;

		case CANCELLED:
			// Fetch message template for cancellation notification
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, PAYMENT_LINK);
			// Populate dynamic values including cancellation reason from workflow comments
			messageTemplate = populateDynamicValues(bookingDetail, messageTemplate);
			// Replace portal link placeholder
			if (link != null && messageTemplate.contains(PORTAL_LINK)) {
				messageTemplate = messageTemplate.replace(PORTAL_LINK, link);
			}
			break;
			
		case PAYMENT_FAILED:
			// Fetch message template for payment failed notification
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, PAYMENT_LINK);
			// Populate dynamic values
			messageTemplate = populateDynamicValues(bookingDetail, messageTemplate);
			break;
			
		case PAYMENT_CONFIRMATION:
			// Fetch message template for payment confirmation notification
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			// Populate dynamic values including payment date
			messageTemplate = populateDynamicValues(bookingDetail, messageTemplate);
			break;
			
		default:
			messageTemplate = "Localization message not available for status : " + actionStatus;
			break;
		}
		
		Map<String, String> messageMap = new HashMap<String, String>();
		messageMap.put(ACTION_LINK, link);
		messageMap.put(MESSAGE_TEXT, messageTemplate);
		
		log.info("getCustomizedMsg messageTemplate : " + messageTemplate);
		return messageMap;
	}
	
	/**
	 * Populates dynamic values in message template
	 * 
	 * @param bookingDetail
	 * @param messageTemplate
	 * @return
	 */
	private String populateDynamicValues(CommunityHallBookingDetail bookingDetail, String messageTemplate) {
		if (messageTemplate == null) {
			return "";
		}
		
		String message = messageTemplate;
		
		// Replace applicant name
		if (bookingDetail.getApplicantDetail() != null && bookingDetail.getApplicantDetail().getApplicantName() != null) {
			message = message.replace(CommunityHallBookingConstants.APPLICANT_NAME, bookingDetail.getApplicantDetail().getApplicantName());
		}
		
		// Replace booking number
		if (bookingDetail.getBookingNo() != null) {
			message = message.replace(CommunityHallBookingConstants.BOOKING_NO, bookingDetail.getBookingNo());
		}
		
		// Replace community hall name
		if (bookingDetail.getCommunityHallName() != null) {
			message = message.replace(CommunityHallBookingConstants.COMMUNITY_HALL_NAME, bookingDetail.getCommunityHallName());
		}
		
		// Replace amount - this will be calculated from demand, for now using placeholder
		if (message.contains(AMOUNT)) {
			// TODO: Get actual amount from billing/demand service
			message = message.replace(AMOUNT, "Rs. [Amount]");
		}
		
		// Replace office name
		if (message.contains(OFFICE_NAME)) {
			message = message.replace(OFFICE_NAME, "PMIDC Office");
		}
		
		// Replace cancellation reason from workflow comments
		if (message.contains(REASON)) {
			String reason = "User Cancellation";
			if (bookingDetail.getWorkflow() != null && !StringUtils.isEmpty(bookingDetail.getWorkflow().getComments())) {
				reason = bookingDetail.getWorkflow().getComments();
			}
			message = message.replace(REASON, reason);
		}
		
		// Replace payment date
		if (message.contains(DATE)) {
			String dateStr = "[Date]";
			if (bookingDetail.getPaymentDate() != null && bookingDetail.getPaymentDate() > 0) {
				try {
					dateStr = DATE_FORMAT.format(new Date(bookingDetail.getPaymentDate()));
				} catch (Exception e) {
					log.error("Error formatting payment date", e);
				}
			}
			message = message.replace(DATE, dateStr);
		}
		
		return message;
	}
	
	public String getActionLink(CommunityHallBookingDetail bookingDetail, String action) {
		String link = null;
		if(PAYMENT_LINK.equals(action)) {
			//Payment Link
			link = config.getUiAppHost() + config.getPayLinkSMS().replace("$consumerCode", bookingDetail.getBookingNo())
					.replace("$mobile", bookingDetail.getApplicantDetail().getApplicantMobileNo()).replace("$tenantId", bookingDetail.getTenantId())
					.replace("$businessService", config.getBusinessServiceName());
		} else if(PERMISSION_LETTER_LINK.toString().equals(action)) {
			//Permission letter link
			link = config.getUiAppHost() + config.getPermissionLetterLink().replace("$consumerCode", bookingDetail.getBookingNo())
					.replace("$mobile", bookingDetail.getApplicantDetail().getApplicantMobileNo()).replace("$tenantId", bookingDetail.getTenantId())
					.replace("$businessService", config.getBusinessServiceName());
		}
		if (null != link) {
			link = getShortnerURL(link);
		}
		return link;
	}

	private String getShortnerURL(String actualURL) {
		net.minidev.json.JSONObject obj = new net.minidev.json.JSONObject();
		obj.put(URL, actualURL);
		String url = config.getUrlShortnerHost() + config.getShortenerEndpoint();

		Object response = serviceRequestRepository.getShorteningURL(new StringBuilder(url), obj);
		return response.toString();
	}
	

}
