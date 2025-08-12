package org.egov.ndc.service.notification;

import java.util.*;

import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.service.UserService;
import org.egov.ndc.util.NotificationUtil;
import org.egov.ndc.web.model.NdcRequest;
import org.egov.ndc.web.model.SMSRequest;
import org.egov.ndc.web.model.UserResponse;
import org.egov.ndc.web.model.ndc.NdcApplicationSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NDCNotificationService {

	private NDCConfiguration config;

	private NotificationUtil util;

	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private UserService userService;

	@Autowired
	public NDCNotificationService(NDCConfiguration config, NotificationUtil util,
                                  ServiceRequestRepository serviceRequestRepository) {
		this.config = config;
		this.util = util;
		this.serviceRequestRepository = serviceRequestRepository;
	}

	/**
	 * Creates and send the sms based on the NDCRequest
	 * 
	 * @param request
	 *            The NDCRequest listenend on the kafka topic
	 */
	public void process(NdcRequest ndcRequest) {
		List<SMSRequest> smsRequests = new LinkedList<>();
		if (null != config.getIsSMSEnabled()) {
			if (config.getIsSMSEnabled()) {
				enrichSMSRequest(ndcRequest, smsRequests);
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
	private void enrichSMSRequest(NdcRequest ndcRequest, List<SMSRequest> smsRequests) {
		String tenantId = ndcRequest.getNdc().getTenantId();
		String localizationMessages = util.getLocalizationMessages(tenantId, ndcRequest.getRequestInfo());
		String message = util.getCustomizedMsg(ndcRequest.getRequestInfo(), ndcRequest.getNdc(), localizationMessages);
		if(message != null){
			Map<String, String> mobileNumberToOwner = getUserList(ndcRequest);
			smsRequests.addAll(util.createSMSRequest(message, mobileNumberToOwner));
		}
		
	}

	/**
	 * To get the Users to whom we need to send the sms notifications or event
	 * notifications.
	 * 
	 * @param ndcRequest
	 * @return
	 */
	private Map<String, String> getUserList(NdcRequest ndcRequest) {
		Map<String, String> mobileNumberToOwner = new HashMap<>();
		String tenantId = ndcRequest.getNdc().getTenantId();
		String stakeUUID = ndcRequest.getNdc().getAccountId();
		Set<String> ownerId = new HashSet<>();
		ownerId.add(stakeUUID);
		NdcApplicationSearchCriteria ndcSearchCriteria = new NdcApplicationSearchCriteria();
		ndcSearchCriteria.setOwnerIds(ownerId);
		ndcSearchCriteria.setTenantId(tenantId);
		UserResponse userDetailResponse = userService.getUser(ndcSearchCriteria, ndcRequest.getRequestInfo());
		mobileNumberToOwner.put(userDetailResponse.getUser().get(0).getMobileNumber(),
				userDetailResponse.getUser().get(0).getName());
		return mobileNumberToOwner;
	}

}
