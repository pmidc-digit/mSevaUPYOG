package org.upyog.chb.service;

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
import org.upyog.chb.config.CommunityHallBookingConfiguration;
import org.upyog.chb.constants.CommunityHallBookingConstants;
import org.upyog.chb.enums.BookingStatusEnum;
import org.upyog.chb.repository.ServiceRequestRepository;
import org.upyog.chb.util.NotificationUtil;
import org.upyog.chb.util.MdmsUtil;
import org.upyog.chb.service.CalculationService;
import java.math.BigDecimal;
import java.util.HashMap;
import org.upyog.chb.web.models.CommunityHallBookingDetail;
import org.upyog.chb.web.models.CommunityHallBookingRequest;
import org.upyog.chb.web.models.events.Action;
import org.upyog.chb.web.models.events.ActionItem;
import org.upyog.chb.web.models.events.Event;
import org.upyog.chb.web.models.events.EventRequest;
import org.upyog.chb.web.models.events.Recepient;
import org.upyog.chb.web.models.events.Source;
import org.upyog.chb.web.models.notification.SMSRequest;

import com.jayway.jsonpath.Filter;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CHBNotificationService {
	@Autowired
	private CommunityHallBookingConfiguration config;
	@Autowired
	private NotificationUtil util;
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
	@Autowired
	private CHBEncryptionService chbEncryptionService;
	@Autowired
	private MdmsUtil mdmsUtil;

	@Autowired
	private CalculationService calculationService;

	public void process(CommunityHallBookingRequest bookingRequest, String status) {
		CommunityHallBookingDetail bookingDetail = bookingRequest.getHallsBookingApplication();
		// Decrypt applicant detail it will be used in notification
		bookingDetail = chbEncryptionService.decryptObject(bookingDetail, bookingRequest.getRequestInfo());

		log.info("Processing notification for booking no : " + bookingDetail.getBookingNo() + " with status : "
				+ status);
		String tenantId = bookingRequest.getHallsBookingApplication().getTenantId();
		String action = status;

		// Pass the real RequestInfo so localization/MDMS lookups use caller context
		List<String> configuredChannelNames = fetchChannelList(bookingRequest.getRequestInfo(), tenantId.split("\\.")[0],
				config.getModuleName(), action);

		log.info("Configured channels for action {} : {}", action, configuredChannelNames);

		log.info("Fetching localization message for notification");
		// All notification messages are part of this messages object
		String localizationMessages = util.getLocalizationMessages(tenantId, bookingRequest.getRequestInfo());

		// Correct mapping: SMS channel should trigger SMS sending, EVENT channel should trigger event notifications
		if (configuredChannelNames.contains(CommunityHallBookingConstants.CHANNEL_NAME_SMS)) {
			sendMessageNotification(localizationMessages, bookingRequest, status);
		}

		if (configuredChannelNames.contains(CommunityHallBookingConstants.CHANNEL_NAME_EVENT)) {
			sendEventNotification(localizationMessages, bookingRequest, status);
		}
	}
	
	/**
	 * 
	 * @param localizationMessages
	 * @param bookingRequest
	 * @param status
	 */
	private void  sendMessageNotification(String localizationMessages, CommunityHallBookingRequest bookingRequest, String status) {
		CommunityHallBookingDetail bookingDetail = bookingRequest.getHallsBookingApplication();

		// Normalize incoming workflow action/status to a booking-status token expected by templates
		String normalizedStatus = normalizeStatusForNotification(status, bookingDetail);

		// Determine which templates to send for the given action/status.
		List<String> statusesToSend = new ArrayList<>();
		try {
			if (BookingStatusEnum.PAYMENT_DONE.name().equals(normalizedStatus)) {
				// On payment action, send both Booking Confirmed (BUSINESS flag BOOKED) and Payment Confirmation
				statusesToSend.add(BookingStatusEnum.BOOKED.name());
				statusesToSend.add(BookingStatusEnum.PAYMENT_DONE.name());
			} else if (BookingStatusEnum.BOOKING_CREATED.name().equals(normalizedStatus)
				|| BookingStatusEnum.PENDING_PAYMENT.name().equals(normalizedStatus)) {
				// On submit action, send Pending Payment message (map BOOKING_CREATED or explicit PENDING_PAYMENT)
				statusesToSend.add(BookingStatusEnum.PENDING_PAYMENT.name());
			} else if (BookingStatusEnum.CANCELLED.name().equals(normalizedStatus)) {
				// On cancel action, send cancelled message
				statusesToSend.add(BookingStatusEnum.CANCELLED.name());
			} else {
				// Default: send message for the normalized status
				statusesToSend.add(normalizedStatus);
			}
		} catch (Exception e) {
			log.error("Error while preparing notification status list", e);
			statusesToSend.add(normalizedStatus);
		}

		// Prepare recipient map (applicant + hall notification number)
		Map<String, String> mobileNumberToOwner = new HashMap<String, String>();
		if (bookingDetail.getApplicantDetail() != null && StringUtils.isNotBlank(bookingDetail.getApplicantDetail().getApplicantMobileNo())) {
			mobileNumberToOwner.put(bookingDetail.getApplicantDetail().getApplicantMobileNo(),
					bookingDetail.getApplicantDetail().getApplicantName());
		}
		try {
			String tenantId = bookingRequest.getHallsBookingApplication().getTenantId();
			Object mdmsData = mdmsUtil.mDMSCall(bookingRequest.getRequestInfo(), tenantId);
			if (mdmsData != null) {
				String hallCode = bookingDetail.getCommunityHallCode();
				List<Object> matched = JsonPath.parse(mdmsData)
						.read("$.MdmsRes." + config.getModuleName() + ".CommunityHalls[?(@.code=='" + hallCode + "')]");
				if (matched != null && !matched.isEmpty()) {
					Object hallNode = matched.get(0);
					try {
						String notifNumber = JsonPath.read(hallNode, "$.notificationNumber");
						if (StringUtils.isNotBlank(notifNumber)) {
							mobileNumberToOwner.put(notifNumber, bookingDetail.getCommunityHallName());
						}
					} catch (Exception e) {
						log.debug("No notificationNumber found for hall {} in MDMS", hallCode);
					}
				}
			}
		} catch (Exception e) {
			log.error("Exception while fetching CommunityHalls from MDMS for notification: ", e);
		}

		// For each configured message status, fetch template, format it and send SMS
		for (String msgStatus : statusesToSend) {
			// If this is a pending payment template, compute amount from calculation service
			if (BookingStatusEnum.PENDING_PAYMENT.name().equals(msgStatus)) {
				try {
					List<org.upyog.chb.web.models.billing.DemandDetail> demandDetails = calculationService.calculateDemand(bookingRequest);
					BigDecimal total = BigDecimal.ZERO;
					for (org.upyog.chb.web.models.billing.DemandDetail dd : demandDetails) {
						if (dd != null && dd.getTaxAmount() != null)
							total = total.add(dd.getTaxAmount());
					}
					// attach amount to booking additionalDetails so populateDynamicValues can pick it
					Map<String, Object> add = new HashMap<>();
					add.put("amount", total.setScale(2, BigDecimal.ROUND_FLOOR).toString());
					bookingDetail.setAdditionalDetails(add);
				} catch (Exception e) {
					log.error("Error while calculating demand for amount in notification", e);
				}
			}
			Map<String, String> messageMap = new HashMap<String, String>();
			String message = null;
			try {
				messageMap = util.getCustomizedMsg(bookingRequest.getHallsBookingApplication(), localizationMessages, msgStatus,
						CommunityHallBookingConstants.CHANNEL_NAME_SMS);
				message = messageMap.get(NotificationUtil.MESSAGE_TEXT);
				if (message != null) {
					message = String.format(message, bookingDetail.getApplicantDetail().getApplicantName(),
							bookingDetail.getBookingNo(), bookingDetail.getCommunityHallName(), messageMap.get(NotificationUtil.ACTION_LINK));
				}
			} catch (Exception e) {
				log.error("Exception occcured while fetching message for status " + msgStatus, e);
			}

			log.info("Message for sending sms notification for status {}: {}", msgStatus, message);
			if (message != null && config.getIsSMSNotificationEnabled()) {
				List<SMSRequest> smsRequests = new LinkedList<>();
				enrichSMSRequest(bookingRequest, smsRequests, mobileNumberToOwner, message);
				if (!CollectionUtils.isEmpty(smsRequests))
					util.sendSMS(smsRequests);
			}
		}
		
	}
	
    private void sendEventNotification(String localizationMessages, CommunityHallBookingRequest bookingRequest, String status) {
    	CommunityHallBookingDetail bookingDetail = bookingRequest.getHallsBookingApplication();
    	Map<String, String> messageMap = new HashMap<String, String>();
    	String message = null;
		try {
			messageMap = util.getCustomizedMsg(bookingRequest.getHallsBookingApplication(), localizationMessages, status
					 , CommunityHallBookingConstants.CHANNEL_NAME_EVENT);
			
			message = messageMap.get(NotificationUtil.MESSAGE_TEXT);
			 /**
			  * Dynamic values Place holders
			  * {APPLICANT_NAME} 
			  * {BOOKING_NO}
			  * {COMMUNITY_HALL_NAME}
			  * {LINK} - Optional			 
			  */
			 message = String.format(message, bookingDetail.getApplicantDetail().getApplicantName(), 
					 bookingDetail.getBookingNo(), bookingDetail.getCommunityHallName());
			 
		}catch (Exception e) {
			log.error("Exception occcured while fetching message", e);
			e.printStackTrace();
		}
		log.info("Message for sending event notification : " + message);
		if (message != null) {
			if (null != config.getIsUserEventsNotificationEnabled()) {
				if (config.getIsUserEventsNotificationEnabled()) {
					EventRequest eventRequest = getEventsForCommunityHallBooking(bookingRequest, message, messageMap.get( NotificationUtil.ACTION_LINK));
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
	private void enrichSMSRequest(CommunityHallBookingRequest bookingRequest, List<SMSRequest> smsRequests,
			Map<String, String> mobileNumberToOwner, String message) {
		smsRequests.addAll(util.createSMSRequest(bookingRequest, message, mobileNumberToOwner));
	}

	private EventRequest getEventsForCommunityHallBooking(CommunityHallBookingRequest request, String message, String actionLink) {

		List<Event> events = new ArrayList<>();
		String tenantId = request.getHallsBookingApplication().getTenantId();
		List<String> toUsers = new ArrayList<>();

		// Mobile no will be used to filter out user to send notification
		String mobileNumber = request.getRequestInfo().getUserInfo().getMobileNumber();

		Map<String, String> mapOfPhoneNoAndUUIDs = fetchUserUUIDs(mobileNumber, request.getRequestInfo(), tenantId);

		if (CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs.keySet())) {
			log.error("UUID search failed in event  processing for CHB!");
		}

		toUsers.add(mapOfPhoneNoAndUUIDs.get(mobileNumber));
		
		log.info("Message for user event : " + message);
		Recepient recepient = Recepient.builder().toUsers(toUsers).toRoles(null).build();
		log.info("Recipient object in CHB event :" + recepient.toString());
		
		ActionItem actionItem = ActionItem.builder().actionUrl(actionLink).code("LINK").build();
		List<ActionItem> actionItems = new ArrayList<>();
		actionItems.add(actionItem);
		
		Action action = Action.builder().tenantId(tenantId).id(mobileNumber).actionUrls(actionItems)
				.eventId(CommunityHallBookingConstants.CHANNEL_NAME_EVENT ).build();
				//new Action(tenantId, mobileNumber, CommunityHallBookingConstants.CHANNEL_NAME_EVENT , null) ;
		
		events.add(Event.builder().tenantId(tenantId).description(message)
				.eventType(CommunityHallBookingConstants.USREVENTS_EVENT_TYPE)
				.name(CommunityHallBookingConstants.USREVENTS_EVENT_NAME)
				.postedBy(CommunityHallBookingConstants.USREVENTS_EVENT_POSTEDBY).source(Source.WEBAPP)
				.actions(action)
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
		userSearchRequest.put("userType", CommunityHallBookingConstants.CITIZEN);
		userSearchRequest.put("userName", mobileNumber);
		try {

			Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest);
			log.info("User fetched in fetUserUUID method of CHB notfication consumer" + user.toString());
//			if (null != user) {
//				String uuid = JsonPath.read(user, "$.user[0].uuid");
			if (user  != null) {
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
		//Can create filter as string using this
		Filter masterDataFilter = filter(where(CommunityHallBookingConstants.MODULE).is(moduleName)
				.and(CommunityHallBookingConstants.ACTION).is(action));

		try {
			Object response = serviceRequestRepository.fetchResult(uri, mdmsCriteriaReq);
			masterData = JsonPath.parse(response).read("$.MdmsRes.Channel.channelList[?].channelNames[*]",
					masterDataFilter);
		} catch (Exception e) {
			log.error("Exception while fetching workflow states to ignore: ", e);
		}

		return masterData;
	}

	private MdmsCriteriaReq getMdmsRequestForChannelList(RequestInfo requestInfo, String tenantId, String moduleName, String action) {

		MasterDetail masterDetail = new MasterDetail();
		masterDetail.setName(CommunityHallBookingConstants.CHANNEL_LIST);
		masterDetail.setFilter("[?(@['module'] == 'CHB' && @['action'] == '"+ action +"')]");
		List<MasterDetail> masterDetailList = new ArrayList<>();
		masterDetailList.add(masterDetail);

		ModuleDetail moduleDetail = new ModuleDetail();
		moduleDetail.setMasterDetails(masterDetailList);
		moduleDetail.setModuleName(CommunityHallBookingConstants.CHANNEL);
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

	/**
	 * Normalize incoming workflow action (like SUBMIT) to booking-status enum name
	 * used by localization templates. Provides sensible fallbacks.
	 */
	private String normalizeStatusForNotification(String action, CommunityHallBookingDetail bookingDetail) {
		if (action == null)
			return bookingDetail != null && bookingDetail.getBookingStatus() != null ? bookingDetail.getBookingStatus()
					: BookingStatusEnum.BOOKING_CREATED.name();
		String upper = action.toUpperCase();
		try {
			BookingStatusEnum.valueOf(upper);
			return upper;
		} catch (IllegalArgumentException e) {
			switch (upper) {
			case "SUBMIT":
				return BookingStatusEnum.PENDING_PAYMENT.name();
			case "PAY":
			case "PAYMENT":
			case "PAYMENT_DONE":
				return BookingStatusEnum.PAYMENT_DONE.name();
			case "APPROVE":
			case "BOOK":
				return BookingStatusEnum.BOOKED.name();
			case "CANCEL":
			case "CANCELLED":
				return BookingStatusEnum.CANCELLED.name();
			default:
				if (bookingDetail != null && bookingDetail.getBookingStatus() != null) {
					try {
						BookingStatusEnum.valueOf(bookingDetail.getBookingStatus());
						return bookingDetail.getBookingStatus();
					} catch (IllegalArgumentException ex) {
						return BookingStatusEnum.BOOKING_CREATED.name();
					}
				}
				return BookingStatusEnum.BOOKING_CREATED.name();
			}
		}
	}
	
	

}
