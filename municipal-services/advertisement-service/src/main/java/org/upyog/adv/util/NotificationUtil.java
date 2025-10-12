package org.upyog.adv.util;

import java.util.ArrayList;
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
import org.upyog.adv.config.BookingConfiguration;
import org.upyog.adv.constants.BookingConstants;
import org.upyog.adv.enums.BookingStatusEnum;
import org.upyog.adv.kafka.Producer;
import org.upyog.adv.repository.ServiceRequestRepository;
import org.upyog.adv.web.models.BookingDetail;
import org.upyog.adv.web.models.BookingRequest;
import org.upyog.adv.web.models.events.EventRequest;
import com.jayway.jsonpath.JsonPath;

import digit.models.coremodels.SMSRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class NotificationUtil {

	private ServiceRequestRepository serviceRequestRepository;

	private BookingConfiguration config;

	private Producer producer;

	private final String URL = "url";
	private static final String PAYMENT_LINK = "PAYMENT_LINK";

	private static final String PERMISSION_LETTER_LINK = "PERMISSION_LETTER_LINK";
	private static final String VIEW_APPLICATION_LINK = "VIEW_APPLICATION_LINK";
	public static final String MESSAGE_TEXT = "MESSAGE_TEXT";
	public static final String ACTION_LINK = "ACTION_LINK";

	@Autowired
	public NotificationUtil(ServiceRequestRepository serviceRequestRepository, BookingConfiguration config,
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
				.append(BookingConstants.NOTIFICATION_MODULE_NAME);
		return uri;
	}

	/**
	 * Creates sms request for the each owners
	 * 
	 * @param mobileNumberToOwnerName Map of mobileNumber to OwnerName
	 * @return List of SMSRequest
	 */
	public List<SMSRequest> createSMSRequest(BookingRequest bookingRequest, String message,
			Map<String, String> mobileNumberToOwnerName) {

		List<SMSRequest> smsRequest = new LinkedList<>();
		// message = "Dear Citizen, Your OTP to complete your UPYOG Registration is
		// 12345.\\n\\nUPYOG" + "#1207167462318135756#1207167462307097438" ;
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
			producer.push(config.getSmsNotifTopic(), smsRequest);
			log.debug("SMS request object : " + smsRequest);
			log.info("Sending SMS notification to MobileNumber: " + smsRequest.getMobileNumber() + " Messages: "
					+ smsRequest.getMessage());
		}
	}

	/**
	 * Pushes the event request to Kafka Queue.
	 *
	 * @param request
	 */
	public void sendEventNotification(EventRequest request) {
		log.info("EVENT notification sent!");
		producer.push(config.getSaveUserEventsTopic(), request);
	}

	/**
	 * 
	 * Get message from {@code localizationMessage} for particular event Replace
	 * dynamic values of messages
	 * 
	 * @param bookingDetail
	 * @param localizationMessage
	 * @param actionStatus
	 * @return
	 */
	public Map<String, String> getCustomizedMsg(BookingDetail bookingDetail, String localizationMessage,
			String actionStatus, String eventType) {
		String messageTemplate = null, link = null;
		String notificationEventType = actionStatus + "_" + eventType;
		log.info(" booking status : " + bookingDetail.getBookingStatus());
		log.info(" booking status ACTION_STATUS : " + actionStatus);
		log.info("notificationEventType  : " + notificationEventType);

		BookingStatusEnum notificationType = BookingStatusEnum.valueOf(actionStatus);

		switch (notificationType) {

		case BOOKING_CREATED:
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, actionStatus);
			break;

		case BOOKED:
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			link = getActionLink(bookingDetail, actionStatus);
			break;

		case CANCELLED:
			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
			break;

//		case PAYMENT_FAILED:
//			messageTemplate = getMessageTemplate(notificationEventType, localizationMessage);
//			link = getActionLink(bookingDetail, actionStatus);
//			break;

		default:
			messageTemplate = "Localization message not available for  status : " + actionStatus;
			break;

		}

		Map<String, String> messageMap = new HashMap<String, String>();
		messageMap.put(ACTION_LINK, link);
		messageMap.put(MESSAGE_TEXT, messageTemplate);

		log.info("getCustomizedMsg messageTemplate : " + messageTemplate);
		return messageMap;
	}

	public String getActionLink(BookingDetail bookingDetail, String action) {
		String link = null;
		if (BookingConstants.BOOKING_CREATED_STATUS.equals(action)) {
			// Payment Link
			link = config.getUiAppHost() + config.getPayLinkSMS().replace("$consumerCode", bookingDetail.getBookingNo())
					.replace("$mobile", bookingDetail.getApplicantDetail().getApplicantMobileNo())
					.replace("$tenantId", bookingDetail.getTenantId())
					.replace("$businessService", config.getBusinessServiceName());
		} else if (BookingConstants.BOOKED_STATUS.equals(action)) {
			// Permission letter link
			link = config.getUiAppHost()
					+ config.getPermissionLetterLink().replace("$consumerCode", bookingDetail.getBookingNo())
							.replace("$mobile", bookingDetail.getApplicantDetail().getApplicantMobileNo())
							.replace("$tenantId", bookingDetail.getTenantId())
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
