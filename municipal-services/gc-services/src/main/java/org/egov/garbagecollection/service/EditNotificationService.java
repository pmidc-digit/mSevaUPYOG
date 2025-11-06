package org.egov.garbagecollection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.User;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.util.NotificationUtil;
import org.egov.garbagecollection.validator.ValidateProperty;
import org.egov.garbagecollection.web.models.*;
import org.egov.garbagecollection.web.models.users.UserDetailResponse;
import org.egov.garbagecollection.web.models.workflow.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

import static org.egov.garbagecollection.constants.GCConstants.*;

@Service
@Slf4j
public class EditNotificationService {

	@Autowired
	private GCConfiguration config;

	@Autowired
	private NotificationUtil notificationUtil;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private WorkflowNotificationService workflowNotificationService;
	
	@Autowired
	private ValidateProperty validateProperty;
	
	@Autowired
	private GcServicesUtil gcServicesUtil;
	

	public void sendEditNotification(GarbageConnectionRequest request) {
		try {
			String applicationStatus = request.getGarbageConnection().getApplicationStatus();
			List<String> configuredChannelNames =  notificationUtil.fetchChannelList(request.getRequestInfo(), request.getGarbageConnection().getTenantId(), WATER_SERVICE_BUSINESS_ID, request.getGarbageConnection().getProcessInstance().getAction());

			User userInfoCopy = request.getRequestInfo().getUserInfo();
			User userInfo = notificationUtil.getInternalMicroserviceUser(request.getGarbageConnection().getTenantId());
			request.getRequestInfo().setUserInfo(userInfo);

			Property property = validateProperty.getOrValidateProperty(request);

			request.getRequestInfo().setUserInfo(userInfoCopy);

			if(configuredChannelNames.contains(CHANNEL_NAME_EVENT)) {
				if (config.getIsUserEventsNotificationEnabled() != null && config.getIsUserEventsNotificationEnabled()) {
					EventRequest eventRequest = getEventRequest(request, property);
					if (eventRequest != null) {
						notificationUtil.sendEventNotification(eventRequest);
					}
				}
			}
			if(configuredChannelNames.contains(CHANNEL_NAME_SMS)){
				if (config.getIsSMSEnabled() != null && config.getIsSMSEnabled()) {
				List<SMSRequest> smsRequests = getSmsRequest(request, property);
				if (!CollectionUtils.isEmpty(smsRequests)) {
					notificationUtil.sendSMS(smsRequests);
				}
			}}
		} catch (Exception ex) {
			log.error("Exception when trying to send notification. ", ex);
		}
	}

	private EventRequest getEventRequest(GarbageConnectionRequest waterConnectionRequest, Property property) {
		String localizationMessage = notificationUtil
				.getLocalizationMessages(property.getTenantId(), waterConnectionRequest.getRequestInfo());
		ProcessInstance workflow = waterConnectionRequest.getGarbageConnection().getProcessInstance();

		String code = GCConstants.WS_EDIT_IN_APP;
		if ((!workflow.getAction().equalsIgnoreCase(GCConstants.ACTIVATE_CONNECTION))
				&& gcServicesUtil.isModifyConnectionRequestForNotification(waterConnectionRequest)) {
			code = GCConstants.WS_MODIFY_IN_APP;
		}
		if ((!workflow.getAction().equalsIgnoreCase(GCConstants.ACTIVATE_CONNECTION)) &&
				(!workflow.getAction().equalsIgnoreCase(APPROVE_CONNECTION)) && gcServicesUtil.isDisconnectConnectionRequest(waterConnectionRequest)) {
			code = WS_DISCONNECT_EDIT_INAPP;
		}

		String message = notificationUtil.getCustomizedMsg(code, localizationMessage);
		if (message == null) {
			log.info("No localized message found!!, Using default message");
			message = notificationUtil.getCustomizedMsg(DEFAULT_OBJECT_EDIT_APP_MSG, localizationMessage);
			if(code.equalsIgnoreCase(GCConstants.WS_MODIFY_IN_APP))
				message = notificationUtil.getCustomizedMsg(DEFAULT_OBJECT_MODIFY_APP_MSG, localizationMessage);
		}

		Map<String, String> mobileNumbersAndNames = new HashMap<>();
		Map<String, String> mapOfPhoneNoAndUUIDs = new HashMap<>();

		Set<String> ownersMobileNumbers = new HashSet<>();
		//Send the notification to all owners
		property.getOwners().forEach(owner -> {
			if (owner.getMobileNumber() != null)
				ownersMobileNumbers.add(owner.getMobileNumber());
		});

		//send the notification to the connection holders
		if (!CollectionUtils.isEmpty(waterConnectionRequest.getGarbageConnection().getConnectionHolders())) {
			waterConnectionRequest.getGarbageConnection().getConnectionHolders().forEach(holder -> {
				if (!StringUtils.isEmpty(holder.getMobileNumber())) {
					ownersMobileNumbers.add(holder.getMobileNumber());
				}
			});
		}

		for (String mobileNumber : ownersMobileNumbers) {
			UserDetailResponse userDetailResponse = workflowNotificationService.fetchUserByUsername(mobileNumber, waterConnectionRequest.getRequestInfo(), waterConnectionRequest.getGarbageConnection().getTenantId());
			if (!CollectionUtils.isEmpty(userDetailResponse.getUser())) {
				OwnerInfo user = userDetailResponse.getUser().get(0);
				mobileNumbersAndNames.put(user.getMobileNumber(), user.getName());
				mapOfPhoneNoAndUUIDs.put(user.getMobileNumber(), user.getUuid());
			} else {
				log.info("No User for mobile {} skipping event", mobileNumber);
			}
		}

		//Send the notification to applicant
		if (!StringUtils.isEmpty(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber())) {
			mobileNumbersAndNames.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getName());
			mapOfPhoneNoAndUUIDs.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getUuid());
		}

		Map<String, String> mobileNumberAndMessage = workflowNotificationService.getMessageForMobileNumber(mobileNumbersAndNames, waterConnectionRequest, message, property);
		Set<String> mobileNumbers = mobileNumberAndMessage.keySet().stream().collect(Collectors.toSet());

		if (CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs.keySet())) {
			log.info("UUID search failed!");
		}
		List<Event> events = new ArrayList<>();
		for (String mobile : mobileNumbers) {
			if (null == mapOfPhoneNoAndUUIDs.get(mobile) || null == mobileNumberAndMessage.get(mobile)) {
				log.error("No UUID/SMS for mobile {} skipping event", mobile);
				continue;
			}
			List<String> toUsers = new ArrayList<>();
			toUsers.add(mapOfPhoneNoAndUUIDs.get(mobile));
			Recepient recepient = Recepient.builder().toUsers(toUsers).toRoles(null).build();
			Action action = workflowNotificationService.getActionForEventNotification(mobileNumberAndMessage, mobile,
					waterConnectionRequest, property);
			events.add(Event.builder().tenantId(property.getTenantId())
					.description(mobileNumberAndMessage.get(mobile)).eventType(GCConstants.USREVENTS_EVENT_TYPE)
					.name(GCConstants.USREVENTS_EVENT_NAME).postedBy(GCConstants.USREVENTS_EVENT_POSTEDBY)
					.source(Source.WEBAPP).recepient(recepient).eventDetails(null).actions(action).build());
		}
		if (!CollectionUtils.isEmpty(events)) {
			return EventRequest.builder().requestInfo(waterConnectionRequest.getRequestInfo()).events(events).build();
		} else {
			return null;
		}

	}

	private List<SMSRequest> getSmsRequest(GarbageConnectionRequest waterConnectionRequest, Property property) {
		String localizationMessage = notificationUtil
				.getLocalizationMessages(property.getTenantId(), waterConnectionRequest.getRequestInfo());
		ProcessInstance workflow = waterConnectionRequest.getGarbageConnection().getProcessInstance();

		String code = GCConstants.WS_EDIT_SMS;
		if ((!workflow.getAction().equalsIgnoreCase(GCConstants.ACTIVATE_CONNECTION))
				&& gcServicesUtil.isModifyConnectionRequestForNotification(waterConnectionRequest)) {
			code = WS_MODIFY_SMS;
		}
		if ((!workflow.getAction().equalsIgnoreCase(GCConstants.ACTIVATE_CONNECTION)) &&
				(!workflow.getAction().equalsIgnoreCase(APPROVE_CONNECTION)) && gcServicesUtil.isDisconnectConnectionRequest(waterConnectionRequest)) {
			code = WS_DISCONNECT_EDIT_SMS;
		}
		
		String message = notificationUtil.getCustomizedMsg(code, localizationMessage);
		if (message == null) {
			log.info("No localized message found!!, Using default message");
			message = notificationUtil.getCustomizedMsg(DEFAULT_OBJECT_EDIT_SMS_MSG, localizationMessage);
			if(code.equalsIgnoreCase(GCConstants.WS_MODIFY_SMS))
				message = notificationUtil.getCustomizedMsg(DEFAULT_OBJECT_MODIFY_SMS_MSG, localizationMessage);
		}

			//Send the notification to all owners
		Set<String> ownersUuids = new HashSet<>();
		property.getOwners().forEach(owner -> {
				if (owner.getUuid() != null)
				{
					ownersUuids.add(owner.getUuid());
				}
			});

			//send the notification to the connection holders
			if(!CollectionUtils.isEmpty(waterConnectionRequest.getGarbageConnection().getConnectionHolders())) {
				waterConnectionRequest.getGarbageConnection().getConnectionHolders().forEach(holder -> {
					if (!org.apache.commons.lang.StringUtils.isEmpty(holder.getUuid())) {
						ownersUuids.add(holder.getUuid());
					}
				});
			}

			UserDetailResponse userDetailResponse = workflowNotificationService.fetchUserByUUID(ownersUuids,waterConnectionRequest.getRequestInfo(),waterConnectionRequest.getGarbageConnection().getTenantId());
			Map<String, String> mobileNumbersAndNames = new HashMap<>();
			for(OwnerInfo user:userDetailResponse.getUser())
			{
				mobileNumbersAndNames.put(user.getMobileNumber(),user.getName());
			}

			//Send the notification to applicant
			if(!org.apache.commons.lang.StringUtils.isEmpty(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber()))
			{
				mobileNumbersAndNames.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getName());
			}

		Map<String, String> mobileNumberAndMessage = workflowNotificationService
				.getMessageForMobileNumber(mobileNumbersAndNames, waterConnectionRequest, message, property);
		List<SMSRequest> smsRequest = new ArrayList<>();
		mobileNumberAndMessage.forEach((mobileNumber, msg) -> {
			SMSRequest req = SMSRequest.builder().mobileNumber(mobileNumber).message(msg).category(Category.NOTIFICATION).build();
			smsRequest.add(req);
		});
		return smsRequest;
	}
}
