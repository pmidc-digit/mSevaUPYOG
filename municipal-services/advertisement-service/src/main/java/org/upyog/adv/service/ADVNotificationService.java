package org.upyog.adv.service;

import static com.jayway.jsonpath.Criteria.where;
import static com.jayway.jsonpath.Filter.filter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.upyog.adv.config.BookingConfiguration;
import org.upyog.adv.constants.BookingConstants;
import org.upyog.adv.repository.ServiceRequestRepository;
import org.upyog.adv.util.NotificationUtil;
import org.upyog.adv.web.models.BookingDetail;
import org.upyog.adv.web.models.BookingRequest;
import org.upyog.adv.web.models.events.Action;
import org.upyog.adv.web.models.events.ActionItem;
import org.upyog.adv.web.models.events.Event;
import org.upyog.adv.web.models.events.EventRequest;
import org.upyog.adv.web.models.events.Recepient;
import org.upyog.adv.web.models.events.Source;

import com.jayway.jsonpath.Filter;
import com.jayway.jsonpath.JsonPath;

import digit.models.coremodels.SMSRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ADVNotificationService {
	@Autowired
	private BookingConfiguration config;
	@Autowired
	private NotificationUtil util;
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
	@Autowired
	private ADVEncryptionService advEncryptionService;

	public void process(BookingRequest bookingRequest, String status) {
		BookingDetail bookingDetail = bookingRequest.getBookingApplication();
		// Decrypt applicant detail it will be used in notification
		bookingDetail = advEncryptionService.decryptObject(bookingDetail, bookingRequest.getRequestInfo());

		log.info("Processing notification for booking no : " + bookingDetail.getBookingNo() + " with status : "
				+ status);
		String tenantId = bookingRequest.getBookingApplication().getTenantId();
		String action = status;

		List<String> configuredChannelNames = fetchChannelList(new RequestInfo(), tenantId.split("\\.")[0],
				config.getModuleName(), action);

		log.info("Fetching localization message for notification");
		// All notification messages are part of this messages object
		String localizationMessages = util.getLocalizationMessages(tenantId, bookingRequest.getRequestInfo());

		if (configuredChannelNames.contains(BookingConstants.CHANNEL_NAME_EVENT)) {
			sendEventNotification(localizationMessages, bookingRequest, status);
		}

//		Uncomment below when sms Integration is required
//		if (configuredChannelNames.contains(BookingConstants.CHANNEL_NAME_SMS)) {
//			sendMessageNotification(localizationMessages, bookingRequest, status);
//		}
	}

	/**
	 * 
	 * @param localizationMessages
	 * @param bookingRequest
	 * @param status
	 */
	private void sendMessageNotification(String localizationMessages, BookingRequest bookingRequest, String status) {
		BookingDetail bookingDetail = bookingRequest.getBookingApplication();
		Map<String, String> messageMap = new HashMap<String, String>();
		String message = null;
		try {
			messageMap = util.getCustomizedMsg(bookingRequest.getBookingApplication(), localizationMessages, status,
					BookingConstants.CHANNEL_NAME_SMS);

			message = messageMap.get(NotificationUtil.MESSAGE_TEXT);
			/**
			 * Dynamic values Place holders {APPLICANT_NAME} {BOOKING_NO}
			 * {COMMUNITY_HALL_NAME} {LINK} - Optional
			 */
			message = String.format(message, bookingDetail.getApplicantDetail().getApplicantName(),
					bookingDetail.getBookingNo(), messageMap.get(NotificationUtil.ACTION_LINK));
		} catch (Exception e) {
			log.error("Exception occcured while fetching message", e);
			e.printStackTrace();
		}
		log.info("Message for sending sms notification : " + message);
		if (message != null) {
			List<SMSRequest> smsRequests = new LinkedList<>();
			if (config.getIsSMSNotificationEnabled()) {
				Map<String, String> mobileNumberToOwner = new HashMap<String, String>();
				mobileNumberToOwner.put(bookingDetail.getApplicantDetail().getApplicantMobileNo(),
						bookingDetail.getApplicantDetail().getApplicantName());
				enrichSMSRequest(bookingRequest, smsRequests, mobileNumberToOwner, message);
				if (!CollectionUtils.isEmpty(smsRequests))
					util.sendSMS(smsRequests);
			}
		}

	}

	private void sendEventNotification(String localizationMessages, BookingRequest bookingRequest, String status) {
		BookingDetail bookingDetail = bookingRequest.getBookingApplication();
		Map<String, String> messageMap = new HashMap<String, String>();
		String message = null;
		try {
			messageMap = util.getCustomizedMsg(bookingRequest.getBookingApplication(), localizationMessages, status,
					BookingConstants.CHANNEL_NAME_EVENT);

			message = messageMap.get(NotificationUtil.MESSAGE_TEXT);
			
			message = String.format(message, bookingDetail.getApplicantDetail().getApplicantName(),
					bookingDetail.getBookingNo());

		} catch (Exception e) {
			log.error("Exception occcured while fetching message", e);
			e.printStackTrace();
		}
		log.info("Message for sending event notification : " + message);
		if (message != null) {
			if (null != config.getIsUserEventsNotificationEnabled()) {
				if (config.getIsUserEventsNotificationEnabled()) {
					EventRequest eventRequest = getEventsForAdvertisementEventRequest(bookingRequest, message,
							messageMap.get(NotificationUtil.ACTION_LINK));
					if (null != eventRequest)
						util.sendEventNotification(eventRequest);
				}
			}
		}
	}

	/**
	 * Enriches the smsRequest with the customized messages
	 * 
	 * @param bpaRequest  The bpaRequest from kafka topic
	 * @param smsRequests List of SMSRequets
	 */
	private void enrichSMSRequest(BookingRequest bookingRequest, List<SMSRequest> smsRequests,
			Map<String, String> mobileNumberToOwner, String message) {
		smsRequests.addAll(util.createSMSRequest(bookingRequest, message, mobileNumberToOwner));
	}

	private EventRequest getEventsForAdvertisementEventRequest(BookingRequest request, String message,
			String actionLink) {

		List<Event> events = new ArrayList<>();
		String tenantId = request.getBookingApplication().getTenantId();
		List<String> toUsers = new ArrayList<>();

		// Mobile no will be used to filter out user to send notification
		String mobileNumber = request.getRequestInfo().getUserInfo().getMobileNumber();

		Map<String, String> mapOfPhoneNoAndUUIDs = fetchUserUUIDs(mobileNumber, request.getRequestInfo(), tenantId);

		if (CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs.keySet())) {
			log.error("UUID search failed in event  processing for ADV!");
		}

		toUsers.add(mapOfPhoneNoAndUUIDs.get(mobileNumber));

		log.info("Message for user event : " + message);
		Recepient recepient = Recepient.builder().toUsers(toUsers).toRoles(null).build();
		log.info("Recipient object in ADV event :" + recepient.toString());

		ActionItem actionItem = ActionItem.builder().actionUrl(actionLink).code("LINK").build();
		List<ActionItem> actionItems = new ArrayList<>();
		actionItems.add(actionItem);

		Action action = Action.builder().tenantId(tenantId).id(mobileNumber).actionUrls(actionItems)
				.eventId(BookingConstants.CHANNEL_NAME_EVENT).build();
		// new Action(tenantId, mobileNumber,
		// CommunityHallBookingConstants.CHANNEL_NAME_EVENT , null) ;

		events.add(Event.builder().tenantId(tenantId).description(message)
				.eventType(BookingConstants.USREVENTS_EVENT_TYPE).name(BookingConstants.USREVENTS_EVENT_NAME)
				.postedBy(BookingConstants.USREVENTS_EVENT_POSTEDBY).source(Source.WEBAPP).actions(action)
				.recepient(recepient).eventDetails(null).actions(null).build());

		if (!CollectionUtils.isEmpty(events)) {
			return EventRequest.builder().requestInfo(request.getRequestInfo()).events(events).build();
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
	private Map<String, String> fetchUserUUIDs(String mobileNumber, RequestInfo requestInfo, String tenantId) {
		Map<String, String> mapOfPhoneNoAndUUIDs = new HashMap<>();
		StringBuilder uri = new StringBuilder();
		uri.append(config.getUserHost()).append(config.getUserSearchEndpoint());
		Map<String, Object> userSearchRequest = new HashMap<>();
		userSearchRequest.put("RequestInfo", requestInfo);
		userSearchRequest.put("tenantId", tenantId);
		userSearchRequest.put("userType", BookingConstants.CITIZEN);
		userSearchRequest.put("userName", mobileNumber);
		try {

			Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest);
			log.info("User fetched in fetUserUUID method of ADV notfication consumer" + user.toString());
//			if (null != user) {
//				String uuid = JsonPath.read(user, "$.user[0].uuid");
			if (user != null) {
				String uuid = JsonPath.read(user, "$.user[0].uuid");
				mapOfPhoneNoAndUUIDs.put(mobileNumber, uuid);
				log.info("mapOfPhoneNoAndUUIDs : " + mapOfPhoneNoAndUUIDs);
			}
		} catch (Exception e) {
			log.error("Exception while fetching user for username - " + mobileNumber);
			log.error("Exception trace: ", e);
		}

		return mapOfPhoneNoAndUUIDs;
	}

	/**
	 * Method to fetch the list of channels for a particular action from mdms config
	 * from mdms configs returns the message minus some lines to match In App
	 * Templates
	 * 
	 * @param requestInfo
	 * @param tenantId
	 * @param moduleName
	 * @param action
	 */
	private List<String> fetchChannelList(RequestInfo requestInfo, String tenantId, String moduleName, String action) {
		List<String> masterData = new ArrayList<>();
		StringBuilder uri = new StringBuilder();
		uri.append(config.getMdmsHost()).append(config.getMdmsPath());
		if (StringUtils.isEmpty(tenantId))
			return masterData;
		MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestForChannelList(requestInfo, tenantId, moduleName, action);
		// Can create filter as string using this
		Filter masterDataFilter = filter(
				where(BookingConstants.MODULE).is(moduleName).and(BookingConstants.ACTION).is(action));

		try {
			Object response = serviceRequestRepository.fetchResult(uri, mdmsCriteriaReq);
			masterData = JsonPath.parse(response).read("$.MdmsRes.Channel.channelList[?].channelNames[*]",
					masterDataFilter);
		} catch (Exception e) {
			log.error("Exception while fetching workflow states to ignore: ", e);
		}

		return masterData;
	}

	private MdmsCriteriaReq getMdmsRequestForChannelList(RequestInfo requestInfo, String tenantId, String moduleName,
			String action) {

		MasterDetail masterDetail = new MasterDetail();
		masterDetail.setName(BookingConstants.CHANNEL_LIST);
		masterDetail.setFilter("[?(@['module'] == '" + moduleName + "' && @['action'] == '" + action + "')]");
		List<MasterDetail> masterDetailList = new ArrayList<>();
		masterDetailList.add(masterDetail);

		ModuleDetail moduleDetail = new ModuleDetail();
		moduleDetail.setMasterDetails(masterDetailList);
		moduleDetail.setModuleName(BookingConstants.CHANNEL);
		List<ModuleDetail> moduleDetailList = new ArrayList<>();
		moduleDetailList.add(moduleDetail);

		MdmsCriteria mdmsCriteria = new MdmsCriteria();
		mdmsCriteria.setTenantId(tenantId);
		mdmsCriteria.setModuleDetails(moduleDetailList);

		MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
		mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);
		mdmsCriteriaReq.setRequestInfo(requestInfo);

		return mdmsCriteriaReq;
	}

}
