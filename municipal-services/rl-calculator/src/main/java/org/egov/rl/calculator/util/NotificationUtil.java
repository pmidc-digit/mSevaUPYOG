package org.egov.rl.calculator.util;


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
import org.egov.rl.calculator.producer.Producer;
import org.egov.rl.calculator.repository.ServiceRequestRepository;
import org.egov.rl.calculator.service.UserService;
import org.egov.rl.calculator.web.models.AllotmentDetails;
import org.egov.rl.calculator.web.models.Email;
import org.egov.rl.calculator.web.models.EmailRequest;
import org.egov.rl.calculator.web.models.SMSRequest;
import org.egov.rl.calculator.web.models.UserDetailResponse;
import org.egov.rl.calculator.web.models.UserSearchRequest;
import org.egov.tracer.model.CustomException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;
import static org.egov.rl.calculator.util.RLConstants.*;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.jayway.jsonpath.Criteria.where;
import static com.jayway.jsonpath.Filter.filter;


@Slf4j
@Component
public class NotificationUtil {



    private ServiceRequestRepository serviceRequestRepository;
	
    private Configurations config;

    private Producer producer;

    private RestTemplate restTemplate;

    private UserService userService;
    
	public static final String ACTION_STATUS_APPLY = "APPLY";

	public static final String ACTION_STATUS_VERIFY = "VERIFY";

	public static final String ACTION_STATUS_APPROVE = "APPROVE";

	public static final String ACTION_STATUS_REJECT = "REJECT";



    @Value("${egov.mdms.host}")
    private String mdmsHost;

    @Value("${egov.mdms.search.endpoint}")
    private String mdmsUrl;

    @Autowired
    public NotificationUtil(ServiceRequestRepository serviceRequestRepository, Configurations config,
                            Producer producer, RestTemplate restTemplate,UserService userService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.config = config;
        this.producer = producer;
        this.restTemplate = restTemplate;
        this.userService = userService;
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
     * @param tenantId
     *            tenantId of the PT
     * @param requestInfo
     *            The requestInfo of the request
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

		responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(getUri(tenantId, requestInfo, locale), requestInfo).get();
		jsonString = new JSONObject(responseMap).toString();

		if (StringUtils.isEmpty(jsonString) && isRetryNeeded) {

			responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(getUri(tenantId, requestInfo, NOTIFICATION_LOCALE), requestInfo).get();
			jsonString = new JSONObject(responseMap).toString();
			if(StringUtils.isEmpty(jsonString))
				throw new CustomException("EG_RL_LOCALE_ERROR","Localisation values not found for Rent And Lease notifications");
		}
		return jsonString;
	}


    /**
     * Returns the uri for the localization call
     *
     * @param tenantId
     *            TenantId of the propertyRequest
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
     * @param message
     *            The message for the specific tradeLicense
     * @param mobileNumberToOwnerName
     *            Map of mobileNumber to OwnerName
     * @return List of SMSRequest
     */
    public List<SMSRequest> createSMSRequest(String message, Map<String, String> mobileNumberToOwnerName) {
    	
        List<SMSRequest> smsRequest = new LinkedList<>();
        for (Map.Entry<String, String> entryset : mobileNumberToOwnerName.entrySet()) {
        	smsRequest.add(SMSRequest.builder().message(message).mobileNumber(entryset.getKey()).build());
            		
        }
        return smsRequest;
    }


    /**
     * Send the SMSRequest on the SMSNotification kafka topic
     *
     * @param smsRequestList
     *            The list of SMSRequest to be sent
     */
    public void sendSMS(List<SMSRequest> smsRequestList) {
    	
        if (config.getIsSMSNotificationEnabled()) {
            if (CollectionUtils.isEmpty(smsRequestList))
                log.info("Messages from localization couldn't be fetched!");
            for (SMSRequest smsRequest : smsRequestList) {
                producer.push(config.getSmsNotifTopic(), smsRequest);
                log.info("Sending SMS notification: ");
                if(log.isDebugEnabled())
                	log.debug("MobileNumber: " + smsRequest.getMobileNumber() + " Messages: " + smsRequest.getMessage());
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
        for(String mobileNo: mobileNumbers) {
            userSearchRequest.put("userName", mobileNo);
            try {
                Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest).get();
                if(null != user) {
                    String uuid = JsonPath.read(user, "$.user[0].uuid");
                    mapOfPhnoAndUUIDs.put(mobileNo, uuid);
                }else {
                    log.error("Service returned null while fetching user for username - "+mobileNo);
                }
            }catch(Exception e) {
                log.error("Exception while fetching user for username - "+mobileNo);
                log.error("Exception trace: ",e);
                continue;
            }
        }
        return mapOfPhnoAndUUIDs;
    }

    
    /**
     * Creates email request for the each owners
     *
     * @param message
     *            The message for the specific tradeLicense
     * @param mobileNumberToEmailId
     *            Map of mobileNumber to emailIds
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

    public List<EmailRequest> createEmailRequest(RequestInfo requestInfo,String message, Map<String, String> mobileNumberToEmailId) {

        List<EmailRequest> emailRequest = new LinkedList<>();
        for (Map.Entry<String, String> entryset : mobileNumberToEmailId.entrySet()) {
            String customizedMsg = message;
            if(message.contains(NOTIFICATION_EMAIL))
                customizedMsg = customizedMsg.replace(NOTIFICATION_EMAIL, entryset.getValue());

            if(StringUtils.isEmpty(entryset.getValue()))
                log.info("Email ID is empty, no notification will be sent ");

            String subject = "";
            String body = sanitizeEmailBody(customizedMsg);
            Email emailobj = Email.builder().emailTo(Collections.singleton(entryset.getValue())).isHTML(false).body(body).subject(subject).build();
            EmailRequest email = new EmailRequest(requestInfo,emailobj);
            emailRequest.add(email);
        }
        return emailRequest;
    }


    /**
     * Send the EmailRequest on the EmailNotification kafka topic
     *
     * @param emailRequestList
     *            The list of EmailRequest to be sent
     */
    public void sendEmail(List<EmailRequest> emailRequestList) {

        if (config.getIsEmailNotificationEnabled()) {
            if (CollectionUtils.isEmpty(emailRequestList))
                log.info("Messages from localization couldn't be fetched!");
            for (EmailRequest emailRequest: emailRequestList) {
                if (emailRequest != null && emailRequest.getEmail() != null && !StringUtils.isEmpty(emailRequest.getEmail().getBody())) {
                    emailRequest.getEmail().setBody(sanitizeEmailBody(emailRequest.getEmail().getBody()));
                    producer.push(config.getEmailNotifTopic(), emailRequest);
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
        for(String mobileNo: mobileNumbers) {
            userSearchRequest.put("userName", mobileNo);
            try {
                Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest).get();
                if(null != user) {
                    if(JsonPath.read(user, "$.user[0].emailId")!=null) {
                        String email = JsonPath.read(user, "$.user[0].emailId");
                    mapOfPhnoAndEmailIds.put(mobileNo, email);
                    }
                }else {
                    log.error("Service returned null while fetching user for username - "+mobileNo);
                }
            }catch(Exception e) {
                log.error("Exception while fetching user for username - "+mobileNo);
                log.error("Exception trace: ",e);
                continue;
            }
        }
        return mapOfPhnoAndEmailIds;
    }

    /**
     * Method to shortent the url
     * returns the same url if shortening fails 
     * @param url
     */
    public List<String> fetchChannelList(RequestInfo requestInfo, String tenantId, String moduleName, String action){
        List<String> masterData = new ArrayList<>();
        StringBuilder uri = new StringBuilder();
        uri.append(mdmsHost).append(mdmsUrl);
        if(StringUtils.isEmpty(tenantId))
            return masterData;
        MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestForChannelList(requestInfo, tenantId.split("\\.")[0]);

        Filter masterDataFilter = filter(
                where(MODULE).is(moduleName).and(ACTION).is(action)
                
        		);
        try {
            Object response = restTemplate.postForObject(uri.toString(), mdmsCriteriaReq, Map.class);
            masterData = JsonPath.parse(response).read("$.MdmsRes.Channel.channelList[?].channelNames[*]", masterDataFilter);
        }catch(Exception e) {
            log.error("Exception while fetching workflow states to ignore: ",e);
        }

        return masterData;
    }

    private MdmsCriteriaReq getMdmsRequestForChannelList(RequestInfo requestInfo, String tenantId){
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
     * @param username - username of User
     * @param requestInfo - Request Info Object
     * @param tenantId - Tenant Id
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
     * @param uuid - UUID of the User
     * @param requestInfo - Request Info Object
     * @param tenantId - Tenant Id
     * @return - Returns UserDetailResponse with decrypted User
     */
    public UserDetailResponse fetchUserByUuid(String uuid, RequestInfo requestInfo, String tenantId) {
        if (StringUtils.isBlank(uuid)) {
            return null;
        }

        User userInfoCopy = requestInfo != null ? requestInfo.getUserInfo() : null;
        PlainAccessRequest plainAccessRequestCopy = requestInfo != null ? requestInfo.getPlainAccessRequest() : null;

        String stateTenantId = (tenantId != null && tenantId.contains(".")) ? tenantId.split("\\.")[0] : (tenantId != null ? tenantId : "pb");
        User internalUser = getInternalMicroserviceUser(stateTenantId);

        if (requestInfo == null) {
            requestInfo = new RequestInfo();
        }
        requestInfo.setUserInfo(internalUser);

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
     * Fetches multiple Users by their UUIDs with unmasked/decrypted plain details.
     *
     * @param uuids - Set of UUIDs
     * @param requestInfo - Request Info Object
     * @param tenantId - Tenant Id
     * @return - Map of UUID to decrypted User object
     */
    public Map<String, org.egov.rl.calculator.web.models.User> fetchUsersByUUIDs(Set<String> uuids, RequestInfo requestInfo, String tenantId) {
        if (CollectionUtils.isEmpty(uuids)) {
            return Collections.emptyMap();
        }
        Map<String, org.egov.rl.calculator.web.models.User> userMap = new HashMap<>();
        for (String uuid : uuids) {
            if (StringUtils.isBlank(uuid) || userMap.containsKey(uuid)) continue;
            UserDetailResponse response = fetchUserByUuid(uuid, requestInfo, tenantId);
            if (response != null && !CollectionUtils.isEmpty(response.getUser()) && response.getUser().get(0) != null) {
                userMap.put(uuid, response.getUser().get(0));
            }
        }
        return userMap;
    }

    /**
     *
     * @param tenantId
     * @return internal microservice user to fetch plain user details
     */
    public User getInternalMicroserviceUser(String tenantId)
    {
        //Creating role with INTERNAL_MICROSERVICE_ROLE
        Role role = Role.builder()
                .name("Internal Microservice Role").code("INTERNAL_MICROSERVICE_ROLE")
                .tenantId(tenantId).build();

        //Creating userinfo with uuid and role of internal microservice role
        User userInfo = User.builder()
                .uuid(config.getEgovInternalMicroserviceUserUuid())
                .type("SYSTEM")
                .roles(Collections.singletonList(role)).id(0L).build();

        return userInfo;
    }
}
