package org.egov.rl.services.util;

import com.jayway.jsonpath.Filter;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.PlainAccessRequest;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.models.event.*;
import org.egov.rl.services.models.user.UserDetailResponse;
import org.egov.rl.services.models.user.UserSearchRequest;
import org.egov.rl.services.producer.AllotmentProducer;
import org.egov.rl.services.repository.ServiceRequestRepository;
import org.egov.rl.services.service.UserService;
import org.egov.rl.services.web.contracts.Email;
import org.egov.rl.services.web.contracts.EmailRequest;
import org.egov.rl.services.web.contracts.SMSRequest;
import org.egov.tracer.model.CustomException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

import static com.jayway.jsonpath.Criteria.where;
import static com.jayway.jsonpath.Filter.filter;
import static org.egov.rl.services.util.RLConstants.*;

@Slf4j
@Component
public class NotificationUtil {

	private ServiceRequestRepository serviceRequestRepository;

	private RentLeaseConfiguration config;

	private AllotmentProducer allotmentProducer;

	private RestTemplate restTemplate;

	private UserService userService;

	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsUrl;

	@Autowired
	public NotificationUtil(ServiceRequestRepository serviceRequestRepository, RentLeaseConfiguration config,
			AllotmentProducer allotmentProducer, RestTemplate restTemplate, UserService userService) {
		this.serviceRequestRepository = serviceRequestRepository;
		this.config = config;
		this.allotmentProducer = allotmentProducer;
		this.restTemplate = restTemplate;
		this.userService = userService;
	}

	/**
	 * Extracts message for the specific code
	 *
	 * @param notificationCode    The code for which message is required
	 * @param localizationMessage The localization messages
	 * @return message for the specific code
	 */
	public String getMessageTemplate(String notificationCode, String localizationMessage) {

		String path = "$..messages[?(@.code==\"{}\")].message";
		path = path.replace("{}", notificationCode);
		String message = "";
		try {
			if (log.isDebugEnabled()) {
				log.debug(localizationMessage);
				log.debug(path);
			}
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
	 * @param tenantId    tenantId of the PT
	 * @param requestInfo The requestInfo of the request
	 * @return Localization messages for the module
	 */
	public String getLocalizationMessages(String tenantId, RequestInfo requestInfo) {

		String locale = NOTIFICATION_LOCALE;
		Boolean isRetryNeeded = false;
		String jsonString = null;
		LinkedHashMap responseMap = null;

		if (!StringUtils.isEmpty(requestInfo.getMsgId()) && requestInfo.getMsgId().split("\\|").length >= 2) {
			locale = requestInfo.getMsgId().split("\\|")[1];
			isRetryNeeded = true;
		}

		responseMap = (LinkedHashMap) serviceRequestRepository
				.fetchResult(getUri(tenantId, requestInfo, locale), requestInfo).get();
		jsonString = new JSONObject(responseMap).toString();

		if (StringUtils.isEmpty(jsonString) && isRetryNeeded) {

			responseMap = (LinkedHashMap) serviceRequestRepository
					.fetchResult(getUri(tenantId, requestInfo, NOTIFICATION_LOCALE), requestInfo).get();
			jsonString = new JSONObject(responseMap).toString();
			if (StringUtils.isEmpty(jsonString))
				throw new CustomException("EG_RL_LOCALE_ERROR",
						"Localisation values not found for Rent And Lease notifications");
		}
		return jsonString;
	}

	/**
	 * Returns the uri for the localization call
	 *
	 * @param tenantId TenantId of the propertyRequest
	 * @return The uri for localization search call
	 */
	public StringBuilder getUri(String tenantId, RequestInfo requestInfo, String locale) {

		if (config.getIsLocalizationStateLevel())
			tenantId = tenantId.split("\\.")[0];

		StringBuilder uri = new StringBuilder();
		uri.append(config.getLocalizationHost()).append(config.getLocalizationContextPath())
				.append(config.getLocalizationSearchEndpoint()).append("?").append("locale=").append(locale)
				.append("&tenantId=").append(tenantId).append("&module=").append(NOTIFICATION_MODULENAME);

		return uri;
	}

	/**
	 * Creates sms request for the each owners
	 *
	 * @param message                 The message for the specific tradeLicense
	 * @param mobileNumberToOwnerName Map of mobileNumber to OwnerName
	 * @return List of SMSRequest
	 */
	public List<SMSRequest> createSMSRequest(String message, Map<String, String> mobileNumberToOwnerName) {

		List<SMSRequest> smsRequest = new LinkedList<>();
		for (Map.Entry<String, String> entryset : mobileNumberToOwnerName.entrySet()) {
			String customizedMsg = message.replace(NOTIFICATION_OWNERNAME, entryset.getValue());
			smsRequest.add(new SMSRequest(entryset.getKey(), customizedMsg));
		}
		return smsRequest;
	}

	/**
	 * Send the SMSRequest on the SMSNotification kafka topic
	 *
	 * @param smsRequestList The list of SMSRequest to be sent
	 */
	public void sendSMS(List<SMSRequest> smsRequestList) {

		if (config.getIsSMSNotificationEnabled()) {
			if (CollectionUtils.isEmpty(smsRequestList))
				log.info("Messages from localization couldn't be fetched!");
			for (SMSRequest smsRequest : smsRequestList) {
				allotmentProducer.push(config.getSmsNotifTopic(), smsRequest);
				log.info("Sending SMS notification: ");
				if (log.isDebugEnabled())
					log.debug(
							"MobileNumber: " + smsRequest.getMobileNumber() + " Messages: " + smsRequest.getMessage());
			}
		}
	}

	/**
	 * Fetches UUIDs of CITIZENs based on the phone number.
	 *
	 * @param mobileNumbers
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public Map<String, String> fetchUserUUIDs(Set<String> mobileNumbers, RequestInfo requestInfo, String tenantId) {

		Map<String, String> mapOfPhnoAndUUIDs = new HashMap<>();
		StringBuilder uri = new StringBuilder();
		uri.append(config.getUserHost()).append(config.getUserSearchEndpoint());
		Map<String, Object> userSearchRequest = new HashMap<>();
		userSearchRequest.put("RequestInfo", requestInfo);
		userSearchRequest.put("tenantId", tenantId);
		userSearchRequest.put("userType", "CITIZEN");
		for (String mobileNo : mobileNumbers) {
			userSearchRequest.put("userName", mobileNo);
			try {
				Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest).get();
				if (null != user) {
					String uuid = JsonPath.read(user, "$.user[0].uuid");
					mapOfPhnoAndUUIDs.put(mobileNo, uuid);
				} else {
					log.error("Service returned null while fetching user for username - " + mobileNo);
				}
			} catch (Exception e) {
				log.error("Exception while fetching user for username - " + mobileNo);
				log.error("Exception trace: ", e);
				continue;
			}
		}
		return mapOfPhnoAndUUIDs;
	}

	/**
	 * Pushes the event request to Kafka Queue.
	 *
	 * @param request
	 */
	public void sendEventNotification(EventRequest request) {
		log.info("EVENT notification sent!");
		allotmentProducer.push(config.getSaveUserEventsTopic(), request);
	}

	/**
	 * Creates email request for the each owners
	 *
	 * @param message               The message for the specific tradeLicense
	 * @param mobileNumberToEmailId Map of mobileNumber to emailIds
	 * @return List of EmailRequest
	 */

    private static final Pattern HELPLINE_AND_EMAIL_PATTERN = Pattern.compile(
            "Helpline:\\s*(?:<strong>)?\\s*1800-1800-0172\\s*(?:</strong>)?\\s*(?:&nbsp;|\\s)*(?:\\|(?:&nbsp;|\\s)*)?"
            + "Email:\\s*(?:<a\\s+[^>]*>)?\\s*support\\.mseva@punjab\\.gov\\.in\\s*(?:</a>)?\\s*(?:(?:&nbsp;|\\s)*(?:\\||(?:&nbsp;\\|\\s*))(?:\\s|&nbsp;)*)?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern HELPLINE_ONLY_PATTERN = Pattern.compile(
            "Helpline:\\s*(?:<strong>)?\\s*1800-1800-0172\\s*(?:</strong>)?\\s*(?:(?:&nbsp;|\\s)*(?:\\||(?:&nbsp;\\|\\s*))(?:\\s|&nbsp;)*)?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern EMAIL_ONLY_PATTERN = Pattern.compile(
            "Email:\\s*(?:<a\\s+[^>]*>)?\\s*support\\.mseva@punjab\\.gov\\.in\\s*(?:</a>)?\\s*(?:(?:&nbsp;|\\s)*(?:\\||(?:&nbsp;\\|\\s*))(?:\\s|&nbsp;)*)?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CLEAN_LEADING_PIPE_BR = Pattern.compile(
            "(<br\\s*/?>\\s*)(?:&nbsp;|\\s)*(?:\\||(?:&nbsp;\\|\\s*))(?:\\s|&nbsp;)*",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CLEAN_LEADING_PIPE_LINE = Pattern.compile(
            "(^\\s*)(?:&nbsp;|\\s)*(?:\\||(?:&nbsp;\\|\\s*))(?:\\s|&nbsp;)*",
            Pattern.MULTILINE | Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitizes email body by stripping helpline number and support email
     *
     * @param body Email body (HTML or plain text)
     * @return Sanitized body without helpline and support email
     */
    public static String sanitizeEmailBody(String body) {
        if (StringUtils.isEmpty(body)) {
            return body;
        }
        String cleaned = HELPLINE_AND_EMAIL_PATTERN.matcher(body).replaceAll("");
        cleaned = HELPLINE_ONLY_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = EMAIL_ONLY_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = cleaned.replace("1800-1800-0172", "").replace("support.mseva@punjab.gov.in", "");
        cleaned = CLEAN_LEADING_PIPE_BR.matcher(cleaned).replaceAll("$1");
        cleaned = CLEAN_LEADING_PIPE_LINE.matcher(cleaned).replaceAll("$1");
        return cleaned;
    }

	public List<EmailRequest> createEmailRequest(RequestInfo requestInfo, String message,
			Map<String, String> mobileNumberToEmailId) {

		List<EmailRequest> emailRequest = new LinkedList<>();
		for (Map.Entry<String, String> entryset : mobileNumberToEmailId.entrySet()) {
			String customizedMsg = message;
			if (message.contains(NOTIFICATION_EMAIL))
				customizedMsg = customizedMsg.replace(NOTIFICATION_EMAIL, entryset.getValue());

			if (StringUtils.isEmpty(entryset.getValue()))
				log.info("Email ID is empty, no notification will be sent ");

			String subject = "";
			String body = sanitizeEmailBody(customizedMsg);
			Email emailobj = Email.builder().emailTo(Collections.singleton(entryset.getValue())).isHTML(false)
					.body(body).subject(subject).build();
			EmailRequest email = new EmailRequest(requestInfo, emailobj);
			emailRequest.add(email);
		}
		return emailRequest;
	}

	/**
	 * Send the EmailRequest on the EmailNotification kafka topic
	 *
	 * @param emailRequestList The list of EmailRequest to be sent
	 */
	public void sendEmail(List<EmailRequest> emailRequestList) {

		if (config.getIsEmailNotificationEnabled()) {
			if (CollectionUtils.isEmpty(emailRequestList))
				log.info("Messages from localization couldn't be fetched!");
			for (EmailRequest emailRequest : emailRequestList) {
				if (emailRequest != null && emailRequest.getEmail() != null && !StringUtils.isEmpty(emailRequest.getEmail().getBody())) {
					emailRequest.getEmail().setBody(sanitizeEmailBody(emailRequest.getEmail().getBody()));
					allotmentProducer.push(config.getEmailNotifTopic(), emailRequest);
					log.info("Sending EMAIL notification! ");
					log.info("Email Id: " + emailRequest.getEmail().toString());
				} else {
					log.info("Email body is empty, hence no email notification will be sent.");
				}
			}

		}
	}

	/**
	 * Fetches email ids of CITIZENs based on the phone number.
	 *
	 * @param mobileNumbers
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */

	public Map<String, String> fetchUserEmailIds(Set<String> mobileNumbers, RequestInfo requestInfo, String tenantId) {
		Map<String, String> mapOfPhnoAndEmailIds = new HashMap<>();
		StringBuilder uri = new StringBuilder();
		uri.append(config.getUserHost()).append(config.getUserSearchEndpoint());
		Map<String, Object> userSearchRequest = new HashMap<>();
		userSearchRequest.put("RequestInfo", requestInfo);
		userSearchRequest.put("tenantId", tenantId);
		userSearchRequest.put("userType", "CITIZEN");
		for (String mobileNo : mobileNumbers) {
			userSearchRequest.put("userName", mobileNo);
			try {
				Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest).get();
				if (null != user) {
					if (JsonPath.read(user, "$.user[0].emailId") != null) {
						String email = JsonPath.read(user, "$.user[0].emailId");
						mapOfPhnoAndEmailIds.put(mobileNo, email);
					}
				} else {
					log.error("Service returned null while fetching user for username - " + mobileNo);
				}
			} catch (Exception e) {
				log.error("Exception while fetching user for username - " + mobileNo);
				log.error("Exception trace: ", e);
				continue;
			}
		}
		return mapOfPhnoAndEmailIds;
	}

	/**
	 * Method to shortent the url returns the same url if shortening fails
	 * 
	 * @param url
	 */
	public String getShortenedUrl(String url) {

		HashMap<String, String> body = new HashMap<>();
		body.put("url", url);
		StringBuilder builder = new StringBuilder(config.getUrlShortnerHost());
		builder.append(config.getUrlShortnerEndpoint());
		String res = restTemplate.postForObject(builder.toString(), body, String.class);

		if (StringUtils.isEmpty(res)) {
			log.error("URL_SHORTENING_ERROR", "Unable to shorten url: " + url);
			;
			return url;
		} else
			return res;
	}

	public List<String> fetchChannelList(RequestInfo requestInfo, String tenantId, String moduleName, String action) {
		List<String> masterData = new ArrayList<>();
		StringBuilder uri = new StringBuilder();
		uri.append(mdmsHost).append(mdmsUrl);
		if (StringUtils.isEmpty(tenantId))
			return masterData;
		MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestForChannelList(requestInfo, tenantId.split("\\.")[0]);

		Filter masterDataFilter = filter(where(MODULE).is(moduleName).and(ACTION).is(action));
		try {
			Object response = restTemplate.postForObject(uri.toString(), mdmsCriteriaReq, Map.class);
			masterData = JsonPath.parse(response).read("$.MdmsRes.Channel.channelList[?].channelNames[*]",
					masterDataFilter);
		} catch (Exception e) {
			log.error("Exception while fetching workflow states to ignore: ", e);
		}
		return masterData;
	}

	private MdmsCriteriaReq getMdmsRequestForChannelList(RequestInfo requestInfo, String tenantId) {
		MasterDetail masterDetail = new MasterDetail();
		masterDetail.setName(CHANNEL_LIST);
		List<MasterDetail> masterDetailList = new ArrayList<>();
		masterDetailList.add(masterDetail);

		ModuleDetail moduleDetail = new ModuleDetail();
		moduleDetail.setMasterDetails(masterDetailList);
		moduleDetail.setModuleName(CHANNEL);
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
	 * Fetches User Object based on the UUID.
	 *
	 * @param username    - username of User
	 * @param requestInfo - Request Info Object
	 * @param tenantId    - Tenant Id
	 * @return - Returns User object with given UUID
	 */
	public UserDetailResponse fetchUserByUUID(String username, RequestInfo requestInfo, String tenantId) {
		User userInfoCopy = requestInfo.getUserInfo();

		User userInfo = getInternalMicroserviceUser(tenantId);
		requestInfo.setUserInfo(userInfo);

		UserSearchRequest userSearchRequest = userService.getBaseUserSearchRequest(tenantId, requestInfo);
		userSearchRequest.setUserName(username);

		UserDetailResponse userDetailResponse = userService.getUser(userSearchRequest);
		requestInfo.setUserInfo(userInfoCopy);
		return userDetailResponse;
	}

	/**
	 * Fetches User Object based on the UUID with unmasked/decrypted plain details.
	 *
	 * @param uuid        - UUID of User
	 * @param requestInfo - Request Info Object
	 * @param tenantId    - Tenant Id
	 * @return - Returns UserDetailResponse with decrypted User
	 */
	public UserDetailResponse fetchUserByUuid(String uuid, RequestInfo requestInfo, String tenantId) {
		if (StringUtils.isBlank(uuid)) {
			return null;
		}

		User userInfoCopy = requestInfo != null ? requestInfo.getUserInfo() : null;
		PlainAccessRequest plainAccessRequestCopy = requestInfo != null ? requestInfo.getPlainAccessRequest() : null;

		String stateTenantId = (tenantId != null && tenantId.contains(".")) ? tenantId.split("\\.")[0] : (tenantId != null ? tenantId : "pb");
		User userInfo = getInternalMicroserviceUser(stateTenantId);

		if (requestInfo == null) {
			requestInfo = new RequestInfo();
		}
		requestInfo.setUserInfo(userInfo);

		PlainAccessRequest plainAccessRequest = PlainAccessRequest.builder()
				.plainRequestFields(Arrays.asList("name", "mobileNumber", "emailId", "fatherOrHusbandName", "gender", "userName"))
				.recordId(uuid)
				.build();
		requestInfo.setPlainAccessRequest(plainAccessRequest);

		UserSearchRequest userSearchRequest = userService.getBaseUserSearchRequest(stateTenantId, requestInfo);
		userSearchRequest.setUuid(Collections.singleton(uuid));

		UserDetailResponse userDetailResponse = null;
		try {
			userDetailResponse = userService.getUser(userSearchRequest);
		} catch (Exception e) {
			log.error("Exception while fetching plain user by UUID: {}", uuid, e);
		} finally {
			if (requestInfo != null) {
				requestInfo.setUserInfo(userInfoCopy);
				requestInfo.setPlainAccessRequest(plainAccessRequestCopy);
			}
		}
		return userDetailResponse;
	}

	/**
	 *
	 * @param tenantId
	 * @return internal microservice user to fetch plain user details
	 */
	public User getInternalMicroserviceUser(String tenantId) {
		// Creating role with INTERNAL_MICROSERVICE_ROLE
		Role role = Role.builder().name("Internal Microservice Role").code("INTERNAL_MICROSERVICE_ROLE")
				.tenantId(tenantId).build();

		// Creating userinfo with uuid and role of internal microservice role
		User userInfo = User.builder().uuid(config.getEgovInternalMicroserviceUserUuid()).type("SYSTEM")
				.roles(Collections.singletonList(role)).id(0L).build();

		return userInfo;
	}

	public String getCustomizedMsg(AllotmentDetails allotmentDetails,
			String localizationMessage) {
		String message = null, messageTemplate;
		String ACTION_STATUS = allotmentDetails.getWorkflow().getAction();

		switch (ACTION_STATUS) {

		case RL_WF_APPLY:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_APPLY, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_DOC_VERIFY:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_DOCVERIFY, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_FIELDINSPECTION:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_FIELDINSPECTION, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_REJECT:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_REJECT, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_APPROVE:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_APPROVE, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_DISCONNECTION_REQUEST:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_DISCONNECTION_REQUEST, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_DISCONNECTION_FIELD_INSPECTION:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_DISCONNECTION_FIELD_INSPECTION,
					localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_PAY:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_PAY, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_PAY_SETTLEMENT_AMOUNT:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_PAY_SETTLEMENT_AMOUNT, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;

		case RL_WF_CLOSED:
			messageTemplate = getMessageTemplate(RLConstants.NOTIFICATION_CLOSED, localizationMessage);
			message = getMessageWithApplicationNumber(allotmentDetails, messageTemplate);
			break;
		}
		return message;
	}

	private String getMessageWithApplicationNumber(AllotmentDetails allotmentDetails, String message) {
		message = message.replace("{1}", allotmentDetails.getOwnerInfo().get(0).getName());
		message = message.replace("{2}", allotmentDetails.getApplicationNumber());
		message = message.replace("{3}", allotmentDetails.getApplicationType());
		return message;
	}

}
