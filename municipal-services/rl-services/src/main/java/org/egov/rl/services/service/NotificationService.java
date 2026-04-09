package org.egov.rl.services.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.models.event.Event;
import org.egov.rl.services.models.event.EventRequest;
import org.egov.rl.services.models.event.Recepient;
import org.egov.rl.services.repository.ServiceRequestRepository;
import org.egov.rl.services.util.NotificationUtil;
import org.egov.rl.services.util.RLConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {
	
	@Autowired
	private RentLeaseConfiguration config;
	
	@Autowired
	private NotificationUtil util;
	
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public void process(AllotmentRequest request) {
		EventRequest eventRequest = getEventsForAllotment(request);
		log.info("Event Request in Rl process method" + eventRequest.toString());
		if (null != eventRequest)
			util.sendEventNotification(eventRequest);
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

		toUsers.add(mapOfPhoneNoAndUUIDs.get(mobileNumber));
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
}
