package org.egov.layout.service.notification;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;
import org.egov.layout.service.UserService;
import org.egov.layout.util.NotificationUtil;
import org.egov.layout.web.model.LayoutRequest;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.egov.layout.web.model.SMSRequest;
import org.egov.layout.web.model.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NOCNotificationService {

	private LAYOUTConfiguration config;

	private NotificationUtil util;

	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private UserService userService;

	@Autowired
	public NOCNotificationService(LAYOUTConfiguration config, NotificationUtil util,
								  ServiceRequestRepository serviceRequestRepository) {
		this.config = config;
		this.util = util;
		this.serviceRequestRepository = serviceRequestRepository;
	}

	/**
	 * Creates and send the sms based on the NOCRequest
	 * 
	 * @param request
	 *            The NOCRequest listenend on the kafka topic
	 */
	public void process(LayoutRequest nocRequest) {
		List<SMSRequest> smsRequests = new LinkedList<>();
		if (null != config.getIsSMSEnabled()) {
			if (config.getIsSMSEnabled()) {
				enrichSMSRequest(nocRequest, smsRequests);
				if (!CollectionUtils.isEmpty(smsRequests))
					util.sendSMS(smsRequests, config.getIsSMSEnabled());
			}
		}
	}

	/**
	 * Enriches the smsRequest with the customized messages
	 * 
	 * @param request
	 *            The bpaRequest from kafka topic
	 * @param smsRequests
	 *            List of SMSRequets
	 */
	private void enrichSMSRequest(LayoutRequest nocRequest, List<SMSRequest> smsRequests) {
		String tenantId = nocRequest.getLayout().getTenantId();
		String localizationMessages = util.getLocalizationMessages(tenantId, nocRequest.getRequestInfo());
		String message = util.getCustomizedMsg(nocRequest.getRequestInfo(), nocRequest.getLayout(), localizationMessages);
		if(message != null){
			Map<String, String> mobileNumberToOwner = getUserList(nocRequest);
			smsRequests.addAll(util.createSMSRequest(message, mobileNumberToOwner));
		}
		
	}

	/**
	 * To get the Users to whom we need to send the sms notifications or event
	 * notifications.
	 * 
	 * @param nocRequest
	 * @return
	 */
	private Map<String, String> getUserList(LayoutRequest nocRequest) {
		Map<String, String> mobileNumberToOwner = new HashMap<>();
		String tenantId = nocRequest.getLayout().getTenantId();
		String stakeUUID = nocRequest.getLayout().getAccountId();
		List<String> ownerId = new ArrayList<String>();
		ownerId.add(stakeUUID);
		LayoutSearchCriteria nocSearchCriteria = new LayoutSearchCriteria();
		nocSearchCriteria.setOwnerIds(ownerId);
		nocSearchCriteria.setTenantId(tenantId);
		UserResponse userDetailResponse = userService.getUser(nocSearchCriteria, nocRequest.getRequestInfo());
		mobileNumberToOwner.put(userDetailResponse.getUser().get(0).getMobileNumber(),
				userDetailResponse.getUser().get(0).getName());
		return mobileNumberToOwner;
	}

}
