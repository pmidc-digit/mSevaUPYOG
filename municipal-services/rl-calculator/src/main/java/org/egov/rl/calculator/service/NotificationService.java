package org.egov.rl.calculator.service;

import java.util.*;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.AllotmentRequest;
import org.egov.rl.calculator.web.models.SMSRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;

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

		String msg = notifUtil.getLocalizationMessages(allotmentRequest.getAllotment().get(0).getTenantId(),
				allotmentRequest.getRequestInfo());
		if (!StringUtils.isEmpty(msg)) {
			prepareMsgAndSend(allotmentRequest, msg);
		}
	}


	/**
	 * Prepares msg for each owner and send
	 *
	 * @param request
	 * @param msg
	 */
	private void prepareMsgAndSend(AllotmentRequest request, String msg) {

		AllotmentDetails allotmentDetails = request.getAllotment().get(0);
		RequestInfo requestInfo = request.getRequestInfo();
		
		Map<String, String> mobileNumberToOwner = new HashMap<>();
		
		String tenantId = allotmentDetails.getTenantId();
		String moduleName="rl-services";
		
		String action = "RLREMENDER";
		msg=notifUtil.getMessageTemplate(action, msg);
		List<String> configuredChannelNames = notifUtil.fetchChannelList(requestInfo, tenantId, moduleName,action);
		List<SMSRequest> smsRequests = notifUtil.createSMSRequest(msg, mobileNumberToOwner);
		if (configuredChannelNames.contains(CHANNEL_NAME_SMS)) {
			log.info("Inside  sms: " + smsRequests);
			notifUtil.sendSMS(smsRequests);
		}
	
	}

}