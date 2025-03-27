package org.egov.ndc.util;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.SMSRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import static org.egov.ndc.util.NDCConstants.ACTION_STATUS_CREATED;
import static org.egov.ndc.util.NDCConstants.ACTION_STATUS_INITIATED;
import static org.egov.ndc.util.NDCConstants.ACTION_STATUS_REJECTED;
import static org.egov.ndc.util.NDCConstants.ACTION_STATUS_APPROVED;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NotificationUtil {

	@Autowired
	private NDCConfiguration config;

	@Autowired
	private Producer producer;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	

	/**
	 * Send the SMSRequest on the SMSNotification kafka topic
	 * 
	 * @param smsRequestList
	 *            The list of SMSRequest to be sent
	 */
	public void sendSMS(List<SMSRequest> smsRequestList, boolean isSMSEnabled) {
		if (isSMSEnabled) {
			if (CollectionUtils.isEmpty(smsRequestList))
				log.info("Messages from localization couldn't be fetched!");
			for (SMSRequest smsRequest : smsRequestList) {
				producer.push(config.getSmsNotifTopic(), smsRequest);
				log.info("MobileNumber: " + smsRequest.getMobileNumber() + " Messages: " + smsRequest.getMessage());
			}
		}
	}

	/**
	 * Creates sms request for the each owners
	 * 
	 * @param message
	 *            The message for the specific ndc
	 * @param mobileNumberToOwnerName
	 *            Map of mobileNumber to OwnerName
	 * @return List of SMSRequest
	 */
	public List<SMSRequest> createSMSRequest(String message, Map<String, String> mobileNumberToOwner) {
		List<SMSRequest> smsRequest = new LinkedList<>();
		for (Map.Entry<String, String> entryset : mobileNumberToOwner.entrySet()) {
			smsRequest.add(new SMSRequest(entryset.getKey(), message));
		}
		return smsRequest;
	}

	/**
	 * Returns the uri for the localization call
	 * 
	 * @param tenantId
	 *            TenantId of the propertyRequest
	 * @return The uri for localization search call
	 */
	public StringBuilder getUri(String tenantId, RequestInfo requestInfo) {
		if (config.getIsLocalizationStateLevel())
			tenantId = tenantId.split("\\.")[0];
		String locale = "en_IN";
		if (!StringUtils.isEmpty(requestInfo.getMsgId()) && requestInfo.getMsgId().split("|").length >= 2)
			locale = requestInfo.getMsgId().split("\\|")[1];

		StringBuilder uri = new StringBuilder();
		uri.append(config.getLocalizationHost()).append(config.getLocalizationContextPath())
				.append(config.getLocalizationSearchEndpoint()).append("?").append("locale=").append(locale)
				.append("&tenantId=").append(tenantId).append("&module=").append(NDCConstants.SEARCH_MODULE);
		return uri;
	}

	/**
	 * Fetches messages from localization service
	 * 
	 * @param tenantId
	 *            tenantId of the NDC
	 * @param requestInfo
	 *            The requestInfo of the request
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
	 * Creates customized message based on ndc
	 * 
	 * @param ndc
	 *            The ndc for which message is to be sent
	 * @param localizationMessage
	 *            The messages from localization
	 * @return customized message based on ndc
	 */
	public String getCustomizedMsg(RequestInfo requestInfo, Ndc ndc, String localizationMessage) {
		String message = null, messageTemplate;
		String messageCode;
		if(ndc.getWorkflow() == null)
			messageCode = ndc.getWorkflow() + "_" + ndc.getApplicationStatus();
		else 
			messageCode = ndc.getWorkflow().getAction() + "_" + ndc.getApplicationStatus();
		switch (messageCode) {
		case ACTION_STATUS_CREATED:
			messageTemplate = getMessageTemplate(messageCode, localizationMessage);
			if (!StringUtils.isEmpty(messageTemplate))
				message = getInitiatedMsg(ndc, messageTemplate);
			break;
		case ACTION_STATUS_INITIATED:
			messageTemplate = getMessageTemplate(messageCode, localizationMessage);
			if (!StringUtils.isEmpty(messageTemplate))
				message = getInitiatedMsg(ndc, messageTemplate);
			break;
		case ACTION_STATUS_APPROVED:
			messageTemplate = getMessageTemplate(messageCode, localizationMessage);
			if (!StringUtils.isEmpty(messageTemplate))
				message = getInitiatedMsg(ndc, messageTemplate);
			break;
		case ACTION_STATUS_REJECTED:
			messageTemplate = getMessageTemplate(messageCode, localizationMessage);
			if (!StringUtils.isEmpty(messageTemplate))
				message = getInitiatedMsg(ndc, messageTemplate);
			break;
		}
		return message;
	}

	/**
	 * Extracts message for the specific code
	 * 
	 * @param notificationCode
	 *            The code for which message is required
	 * @param localizationMessage
	 *            The localization messages
	 * @return message for the specific code
	 */
	@SuppressWarnings("rawtypes")
	public String getMessageTemplate(String notificationCode, String localizationMessage) {
		String path = "$..messages[?(@.code==\"{}\")].message";
		path = path.replace("{}", notificationCode);
		String message = null;
		try {
			List data = JsonPath.parse(localizationMessage).read(path);
			if (!CollectionUtils.isEmpty(data))
				message = data.get(0).toString();
			else
				log.error("Fetching from localization failed with code " + notificationCode);
		} catch (Exception e) {
			log.warn("Fetching from localization failed", e);
		}
		return message;
	}

	/**
	 * Creates customized message for initiate
	 * 
	 * @param ndc
	 *            tenantId of the ndc
	 * @param message
	 *            Message from localization for initiate
	 * @return customized message for initiate
	 */
	private String getInitiatedMsg(Ndc ndc, String message) {
		String type = null;
		if(ndc.getNdcType().equalsIgnoreCase(NDCConstants.FIRE_NDC_TYPE)){
			type = "Fire";
		}else{
			type = "AAI";
		}
		message = message.replace("{1}", type);
		message = message.replace("{2}", ndc.getApplicationNo());
		return message;
	}

}