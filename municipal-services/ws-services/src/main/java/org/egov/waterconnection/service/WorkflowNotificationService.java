package org.egov.waterconnection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.tracer.model.CustomException;
import org.egov.waterconnection.config.WSConfiguration;
import org.egov.waterconnection.constants.WCConstants;
import org.egov.waterconnection.repository.ServiceRequestRepository;
import org.egov.waterconnection.util.NotificationUtil;
import org.egov.waterconnection.util.WaterServicesUtil;
import org.egov.waterconnection.validator.ValidateProperty;
import org.egov.waterconnection.web.models.*;
import org.egov.waterconnection.web.models.collection.PaymentResponse;
import org.egov.waterconnection.web.models.users.UserDetailResponse;
import org.egov.waterconnection.web.models.users.UserSearchRequest;
import org.egov.waterconnection.web.models.workflow.BusinessService;
import org.egov.waterconnection.web.models.workflow.ProcessInstance;
import org.egov.waterconnection.web.models.workflow.State;
import org.egov.waterconnection.workflow.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import static org.egov.waterconnection.constants.WCConstants.*;

@Service
@Slf4j
public class WorkflowNotificationService {

    @Autowired
    private NotificationUtil notificationUtil;

    @Autowired
    private WSConfiguration config;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private WorkflowService workflowService;

    @Autowired
    private WaterServicesUtil waterServiceUtil;

    @Autowired
    private ValidateProperty validateProperty;

    @Autowired
    private UserService userService;

    String tenantIdReplacer = "$tenantId";
    String urlReplacer = "url";
    String requestInfoReplacer = "RequestInfo";
    String WaterConnectionReplacer = "WaterConnection";
    String fileStoreIdReplacer = "$fileStoreIds";
    String totalAmount= "totalAmount";
    String applicationFee = "applicationFee";
    String serviceFee = "serviceFee";
    String tax = "tax";
    String applicationNumberReplacer = "$applicationNumber";
    String consumerCodeReplacer = "$consumerCode";
    String connectionNoReplacer = "$connectionNumber";
    String mobileNoReplacer = "$mobileNo";
    String applicationKey = "$applicationkey";
    String propertyKey = "property";
    String businessService = "WS.ONE_TIME_FEE";



    /**
     *
     * @param request record is bill response.
     * @param topic topic is bill generation topic for water.
     */
    public void process(WaterConnectionRequest request, String topic) {
        try {
        	log.info("In process of consumer to generate notifications");
            String applicationStatus = request.getWaterConnection().getApplicationStatus();
            List<String> configuredChannelNames=new ArrayList<String>();
            
            log.info("configuredChannelNames for request Type " + request.getWaterConnection().getApplicationType() + " is :: "  + WATER_SERVICE_BUSINESS_ID+" action :  : " +request.getWaterConnection().getProcessInstance().getAction());
            
            
			if(request.getWaterConnection().getApplicationType().equalsIgnoreCase(WCConstants.WATER_RECONNECTION) || request.getWaterConnection().getApplicationType().equalsIgnoreCase(WCConstants.DISCONNECT_WATER_CONNECTION))
            	configuredChannelNames=  notificationUtil.fetchChannelList(request.getRequestInfo(), request.getWaterConnection().getTenantId(), "WS.CREATE", request.getWaterConnection().getProcessInstance().getAction());
            else
                configuredChannelNames =  notificationUtil.fetchChannelList(request.getRequestInfo(), request.getWaterConnection().getTenantId(), WATER_SERVICE_BUSINESS_ID, request.getWaterConnection().getProcessInstance().getAction());
            log.info("configuredChannelNames for request Type " + request.getWaterConnection().getApplicationType() + " is :: "  + configuredChannelNames);
			User userInfoCopy = request.getRequestInfo().getUserInfo();
            User userInfo = notificationUtil.getInternalMicroserviceUser(request.getWaterConnection().getTenantId());
            request.getRequestInfo().setUserInfo(userInfo);

            Property property = validateProperty.getOrValidateProperty(request);

            request.getRequestInfo().setUserInfo(userInfoCopy);
            if(configuredChannelNames.contains(CHANNEL_NAME_EVENT)){
                if (config.getIsUserEventsNotificationEnabled() != null && config.getIsUserEventsNotificationEnabled()) {
                    EventRequest eventRequest = getEventRequest(request, topic, property, applicationStatus);
                    if (eventRequest != null) {
                        notificationUtil.sendEventNotification(eventRequest);
                    }
                }}
            if(configuredChannelNames.contains(CHANNEL_NAME_SMS)){
                if (config.getIsSMSEnabled() != null && config.getIsSMSEnabled()) {
                    List<SMSRequest> smsRequests = getSmsRequest(request, topic, property, applicationStatus);
                    if (!CollectionUtils.isEmpty(smsRequests)) {
                        notificationUtil.sendSMS(smsRequests);
                    }
                }}
            if(configuredChannelNames.contains(CHANNEL_NAME_EMAIL)){
                if (config.getIsEmailNotificationEnabled() != null && config.getIsEmailNotificationEnabled()) {
                    List<EmailRequest> emailRequests = getEmailRequest(request, topic, property, applicationStatus);
                    if (!CollectionUtils.isEmpty(emailRequests)) {
                        notificationUtil.sendEmail(emailRequests);
                    }
                }}
        } catch (Exception ex) {
            log.error("Error occured while processing the record from topic : " + topic, ex);
        }

    }

    /**
     *
     * @param request Water Connection Request
     * @param topic Topic Name
     * @param property Property Object
     * @param applicationStatus Application Status
     * @return EventRequest Object
     */
    private EventRequest getEventRequest(WaterConnectionRequest request, String topic, Property property, String applicationStatus) {
        String localizationMessage = notificationUtil
                .getLocalizationMessages(property.getTenantId(), request.getRequestInfo());
        ProcessInstance workflow = request.getWaterConnection().getProcessInstance();

        int reqType = WCConstants.UPDATE_APPLICATION;
        if ((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION))
                && waterServiceUtil.isModifyConnectionRequestForNotification(request)) {
            reqType = WCConstants.MODIFY_CONNECTION;
        }
        if((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) &&
            (!workflow.getAction().equalsIgnoreCase(APPROVE_CONNECTION)) &&
                waterServiceUtil.isDisconnectConnectionRequest(request))
        {
            reqType = DISCONNECT_CONNECTION;
        }
        
        if(workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION) &&
                    waterServiceUtil.isReconnectConnectionRequest(request))
            {
                reqType = RECONNECTION ;
            }

        String message = notificationUtil.getCustomizedMsgForInApp(workflow.getAction(), applicationStatus,
                localizationMessage, reqType);
        if(workflow.getAction().equalsIgnoreCase(APPROVE_DISCONNECTION_CONST) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
            message = notificationUtil.getCustomizedMsgForInApp(workflow.getAction(), PENDING_FOR_DISCONNECTION_EXECUTION_STATUS_CODE,
                    localizationMessage, reqType);
        }
        if(workflow.getAction().equalsIgnoreCase(ACTION_PAY) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
           log.info("Skipping for action status -> "+workflow.getAction().equalsIgnoreCase(ACTION_PAY)+"_"+request.getWaterConnection().getApplicationStatus()
                   +" because -> "+workflow.getComment());
           return null;
        }

        if (message == null) {
            log.info("No message Found For Topic : " + topic);
            return null;
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
        if (!CollectionUtils.isEmpty(request.getWaterConnection().getConnectionHolders())) {
            request.getWaterConnection().getConnectionHolders().forEach(holder -> {
                if (!StringUtils.isEmpty(holder.getMobileNumber())) {
                    ownersMobileNumbers.add(holder.getMobileNumber());
                }
            });
        }

        for (String mobileNumber : ownersMobileNumbers) {
            UserDetailResponse userDetailResponse = fetchUserByUsername(mobileNumber, request.getRequestInfo(), request.getWaterConnection().getTenantId());
            if (!CollectionUtils.isEmpty(userDetailResponse.getUser())) {
                OwnerInfo user = userDetailResponse.getUser().get(0);
                mobileNumbersAndNames.put(user.getMobileNumber(), user.getName());
                mapOfPhoneNoAndUUIDs.put(user.getMobileNumber(), user.getUuid());
            } else {
                log.info("No User for mobile {} skipping event", mobileNumber);
            }
        }

        //Send the notification to applicant
        if (!StringUtils.isEmpty(request.getRequestInfo().getUserInfo().getMobileNumber())) {
            mobileNumbersAndNames.put(request.getRequestInfo().getUserInfo().getMobileNumber(), request.getRequestInfo().getUserInfo().getName());
            mapOfPhoneNoAndUUIDs.put(request.getRequestInfo().getUserInfo().getMobileNumber(), request.getRequestInfo().getUserInfo().getUuid());
        }


        Map<String, String> mobileNumberAndMessage = getMessageForMobileNumber(mobileNumbersAndNames, request,
                message, property);
        if (message.contains("{receipt download link}"))
            mobileNumberAndMessage = setRecepitDownloadLink(mobileNumberAndMessage, request, message, property);
        Set<String> mobileNumbers = mobileNumberAndMessage.keySet().stream().collect(Collectors.toSet());

        if (CollectionUtils.isEmpty(mapOfPhoneNoAndUUIDs.keySet())) {
            log.info("UUID search failed here !");
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
            // List<String> payTriggerList =
            // Arrays.asList(config.getPayTriggers().split("[,]"));

            Action action = getActionForEventNotification(mobileNumberAndMessage, mobile, request, property);
            events.add(Event.builder().tenantId(property.getTenantId())
                    .description(mobileNumberAndMessage.get(mobile)).eventType(WCConstants.USREVENTS_EVENT_TYPE)
                    .name(WCConstants.USREVENTS_EVENT_NAME).postedBy(WCConstants.USREVENTS_EVENT_POSTEDBY)
                    .source(Source.WEBAPP).recepient(recepient).eventDetails(null).actions(action).build());
        }
        if (!CollectionUtils.isEmpty(events)) {
            return EventRequest.builder().requestInfo(request.getRequestInfo()).events(events).build();
        } else {
            return null;
        }
    }

    /**
     *
     * @param mobileNumberAndMessage List of Mobile Numbers and messages
     * @param mobileNumber MobileNumber
     * @param connectionRequest Connection Request
     * @param property Property
     * @return return action link
     */
    public Action getActionForEventNotification(Map<String, String> mobileNumberAndMessage,
                                                String mobileNumber, WaterConnectionRequest connectionRequest, Property property) {
        String messageTemplate = mobileNumberAndMessage.get(mobileNumber);
        List<ActionItem> items = new ArrayList<>();
        if (messageTemplate.contains("{Action Button}")) {
            String code = StringUtils.substringBetween(messageTemplate, "{Action Button}", "{/Action Button}");
            messageTemplate = messageTemplate.replace("{Action Button}", "");
            messageTemplate = messageTemplate.replace("{/Action Button}", "");
            messageTemplate = messageTemplate.replace(code, "");
            String actionLink = "";
            if (code.equalsIgnoreCase("Download Application")) {
                actionLink = config.getNotificationUrl() + config.getViewHistoryLink();
                actionLink = actionLink.replace(applicationNumberReplacer, connectionRequest.getWaterConnection().getApplicationNo());
            }
            if (code.equalsIgnoreCase("PAY NOW")||code.equalsIgnoreCase("Pay Dues")) {
                actionLink = config.getNotificationUrl() + config.getViewHistoryLink();
                actionLink = actionLink.replace(applicationNumberReplacer, connectionRequest.getWaterConnection().getApplicationNo());
            }
            if (code.equalsIgnoreCase("DOWNLOAD RECEIPT")) {
                actionLink = config.getNotificationUrl() + config.getMyPaymentsLink();
            }
            if (code.equalsIgnoreCase("View History Link")) {
                actionLink = config.getNotificationUrl() + config.getViewHistoryLink();
                actionLink = actionLink.replace(mobileNoReplacer, mobileNumber);
                actionLink = actionLink.replace(applicationNumberReplacer, connectionRequest.getWaterConnection().getApplicationNo());
                actionLink = actionLink.replace(tenantIdReplacer, property.getTenantId());
            }
            if (code.equalsIgnoreCase("Connection Detail Page")) {
                actionLink = config.getNotificationUrl() + config.getConnectionDetailsLink();
                actionLink = actionLink.replace(applicationNumberReplacer, connectionRequest.getWaterConnection().getApplicationNo());
            }
            ActionItem item = ActionItem.builder().actionUrl(actionLink).code(code).build();
            items.add(item);
            mobileNumberAndMessage.replace(mobileNumber, messageTemplate);
        }
        return Action.builder().actionUrls(items).build();
    }

    /**
     *
     * @param waterConnectionRequest Water Connection Request
     * @param topic Topic Name
     * @param property Property Object
     * @param applicationStatus Application Status
     * @return Returns list of SMSRequest
     */
    private List<SMSRequest> getSmsRequest(WaterConnectionRequest waterConnectionRequest, String topic,
                                           Property property, String applicationStatus) {
        String localizationMessage = notificationUtil.getLocalizationMessages(property.getTenantId(),
                waterConnectionRequest.getRequestInfo());
        ProcessInstance workflow = waterConnectionRequest.getWaterConnection().getProcessInstance();

        int reqType = WCConstants.UPDATE_APPLICATION;
        if ((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION))
                && waterServiceUtil.isModifyConnectionRequestForNotification(waterConnectionRequest)) {
            reqType = WCConstants.MODIFY_CONNECTION;
        }
        if((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) &&
                (!workflow.getAction().equalsIgnoreCase(APPROVE_CONNECTION)) &&
                waterServiceUtil.isDisconnectConnectionRequest(waterConnectionRequest))
        {
            reqType = DISCONNECT_CONNECTION;
        }

        if((workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) &&
        		waterServiceUtil.isReconnectConnectionRequest(waterConnectionRequest))
        {
        	reqType = RECONNECTION;
        }
        
        String message = notificationUtil.getCustomizedMsgForSMS(
                workflow.getAction(), applicationStatus,
                localizationMessage, reqType);
        if(workflow.getAction().equalsIgnoreCase(APPROVE_DISCONNECTION_CONST) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
            message = notificationUtil.getCustomizedMsgForSMS(workflow.getAction(), PENDING_FOR_DISCONNECTION_EXECUTION_STATUS_CODE,
                    localizationMessage, reqType);
        }
        if(workflow.getAction().equalsIgnoreCase(ACTION_PAY) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
            log.info("Skipping for action status -> "+workflow.getAction().equalsIgnoreCase(ACTION_PAY)+"_"+waterConnectionRequest.getWaterConnection().getApplicationStatus()
                    +" because -> "+workflow.getComment());
            return Collections.emptyList();
        }
        if (message == null) {
            log.info("No message Found For Topic : " + topic);
            return Collections.emptyList();
        }
        log.info("SMS body is "+message);

           //Send the notification to all owners
            Map<String, String> mobileNumbersAndNames = new HashMap<>();
            property.getOwners().forEach(owner -> {
                if (owner.getMobileNumber() != null)
                {
                    mobileNumbersAndNames.put(owner.getMobileNumber(),owner.getName());
                }
            });

            //send the notification to the connection holders
            if (!CollectionUtils.isEmpty(waterConnectionRequest.getWaterConnection().getConnectionHolders())) {
                waterConnectionRequest.getWaterConnection().getConnectionHolders().forEach(holder -> {
                    if (!StringUtils.isEmpty(holder.getMobileNumber())) {
                        mobileNumbersAndNames.put(holder.getMobileNumber(),holder.getName());
                    }
                });
            }

            
            //Send the notification to applicant
            if(!StringUtils.isEmpty(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber())&& waterConnectionRequest.getRequestInfo().getUserInfo().getType().equalsIgnoreCase("CITIZEN"))
            {
                mobileNumbersAndNames.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getName());
            }


        Map<String, String> mobileNumberAndMessage = getMessageForMobileNumber(mobileNumbersAndNames,
                waterConnectionRequest, message, property);
        if (message.contains("{receipt download link}"))
            mobileNumberAndMessage = setRecepitDownloadLink(mobileNumberAndMessage, waterConnectionRequest, message, property);
        List<SMSRequest> smsRequest = new ArrayList<>();
        mobileNumberAndMessage.forEach((mobileNumber, msg) -> {
            SMSRequest req = SMSRequest.builder().mobileNumber(mobileNumber).message(msg).category(Category.NOTIFICATION).build();
            smsRequest.add(req);
        });
        return smsRequest;
    }

    /**
     * Creates email request for each owner
     *
     * @param waterConnectionRequest Water Connection Request
     * @param topic Topic Name
     * @param property Property Object
     * @param applicationStatus Application Status
     * @return List of EmailRequest
     */
    private List<EmailRequest> getEmailRequest(WaterConnectionRequest waterConnectionRequest, String topic,
                                           Property property, String applicationStatus) {
        String localizationMessage = notificationUtil.getLocalizationMessages(property.getTenantId(),
                waterConnectionRequest.getRequestInfo());
        ProcessInstance workflow = waterConnectionRequest.getWaterConnection().getProcessInstance();

        int reqType = WCConstants.UPDATE_APPLICATION;
        if ((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION))
                && waterServiceUtil.isModifyConnectionRequestForNotification(waterConnectionRequest)) {
            reqType = WCConstants.MODIFY_CONNECTION;
        }
        if((!workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) &&
                (!workflow.getAction().equalsIgnoreCase(APPROVE_CONNECTION)) &&
                waterServiceUtil.isDisconnectConnectionRequest(waterConnectionRequest))
        {
            reqType = DISCONNECT_CONNECTION;
        }

        if((workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) &&
        		waterServiceUtil.isReconnectConnectionRequest(waterConnectionRequest))
        {
        	reqType = RECONNECTION;
        }
        
        String message = notificationUtil.getCustomizedMsgForEmail(
                workflow.getAction(), applicationStatus,
                localizationMessage, reqType);
        if(workflow.getAction().equalsIgnoreCase(APPROVE_DISCONNECTION_CONST) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
            message = notificationUtil.getCustomizedMsgForEmail(workflow.getAction(), PENDING_FOR_DISCONNECTION_EXECUTION_STATUS_CODE,
                    localizationMessage, reqType);
        }
        if(workflow.getAction().equalsIgnoreCase(ACTION_PAY) && workflow.getComment()!=null
                && workflow.getComment().contains(WORKFLOW_NO_PAYMENT_CODE))
        {
            log.info("Skipping for action status -> "+workflow.getAction().equalsIgnoreCase(ACTION_PAY)+"_"+waterConnectionRequest.getWaterConnection().getApplicationStatus()
                    +" because -> "+workflow.getComment());
            return Collections.emptyList();
        }
        if (message == null && !workflow.getAction().equalsIgnoreCase(WCConstants.ACTIVATE_CONNECTION)) {
            log.info("No message Found For Topic : " + topic);
            return Collections.emptyList();
        }

        //Send the notification to all owners
        Set<String> ownersUuids = new HashSet<>();

        property.getOwners().forEach(owner -> {
            if (owner.getUuid() != null)
                ownersUuids.add(owner.getUuid());
        });

        //send the notification to the connection holders
        if (!CollectionUtils.isEmpty(waterConnectionRequest.getWaterConnection().getConnectionHolders())) {
            waterConnectionRequest.getWaterConnection().getConnectionHolders().forEach(holder -> {
                if (!StringUtils.isEmpty(holder.getUuid())) {
                    ownersUuids.add(holder.getUuid());
                }
            });
        }

        UserDetailResponse userDetailResponse = fetchUserByUUID(ownersUuids,waterConnectionRequest.getRequestInfo(),waterConnectionRequest.getWaterConnection().getTenantId());
        Map<String, String> mobileNumbersAndNames = new HashMap<>();
        for(OwnerInfo user:userDetailResponse.getUser())
        {
            mobileNumbersAndNames.put(user.getMobileNumber(),user.getName());
        }

        Set<String> mobileNumbers = new HashSet<String>();
        mobileNumbers.addAll(mobileNumbersAndNames.keySet());

        Map<String,String> mobileNumberAndEmailId = new HashMap<>();
        for(OwnerInfo user:userDetailResponse.getUser()) {
            mobileNumberAndEmailId.put(user.getMobileNumber(), user.getEmailId());
        }

        //Send the notification to applicant
        if(!StringUtils.isEmpty(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber()))
        {
            mobileNumbersAndNames.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getName());
            mobileNumbers.add(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber());
            mobileNumberAndEmailId.put(waterConnectionRequest.getRequestInfo().getUserInfo().getMobileNumber(), waterConnectionRequest.getRequestInfo().getUserInfo().getEmailId());
        }

        if (message != null) {
        	Map<String, String> mobileNumberAndMessage = getMessageForMobileNumber(mobileNumbersAndNames,
                    waterConnectionRequest, message, property);

            if (message.contains("{receipt download link}"))
                mobileNumberAndMessage = setRecepitDownloadLink(mobileNumberAndMessage, waterConnectionRequest, message, property);	
		}
        
    	String fileStoreId = getTargetFileStoreId(waterConnectionRequest.getWaterConnection());
 	   
 		List<String> attachments = new ArrayList<>();
 	    
 	    if (!StringUtils.isEmpty(fileStoreId)) {
 	        String publicUrl = fetchFileStorePublicUrl(waterConnectionRequest.getWaterConnection().getTenantId(), fileStoreId);
 	        if (!StringUtils.isEmpty(publicUrl)) {
 	            attachments.add(publicUrl); //
 	        }
 	    }

 		List<EmailRequest> emailRequestList = new LinkedList<>();
 	    for (Map.Entry<String, String> entry : mobileNumberAndEmailId.entrySet()) {
 	        if (StringUtils.isEmpty(entry.getValue())) continue;

 	        String ownerName = mobileNumbersAndNames.get(entry.getKey());
 	        
 	        // Generate the formal government message tailored for attachments
 	       String htmlBody = buildSanctionEmailContent(ownerName, property, waterConnectionRequest); 	        
 	        String subject = "OFFICIAL NOTICE: Sanction Order Issued for Application " + 
 	                         waterConnectionRequest.getWaterConnection().getApplicationNo();

 	        Email emailObj = Email.builder()
 	                .emailTo(Collections.singleton(entry.getValue()))
 	                .isHTML(true)
 	                .body(htmlBody)
 	                .subject(subject)
 	                .attachments(attachments)
 	                .build();

 	        emailRequestList.add(new EmailRequest(waterConnectionRequest.getRequestInfo(), emailObj));
 	    }
 	    return emailRequestList;
 	}
    
    
    
    private String buildSanctionEmailContent(String ownerName, Property property, WaterConnectionRequest request) {
        WaterConnection conn = request.getWaterConnection();
        
        // 1. Dynamic City Name from TenantId
        String tenantId = conn.getTenantId();
        String cityName = "City";
        if (tenantId != null && tenantId.contains(".")) {
            String rawCity = tenantId.split("\\.")[1];
            cityName = rawCity.substring(0, 1).toUpperCase() + rawCity.substring(1).toLowerCase();
        }

        // 2. Data Preparation
        String name = ownerName != null ? ownerName : "Citizen";
        String waterSource = conn.getWaterSource() != null ? conn.getWaterSource().replace("_", " ") : "Municipal Supply";
        String plotSize = (property.getLandArea() != null) ? property.getLandArea() + " Sq.Yds" : "N/A";
        String usageCategory = (property.getUsageCategory() != null) 
                               ? property.getUsageCategory().replace("_", " ") : "Domestic";
        
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd MMMM, yyyy");
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("IST"));
        String executionDate = (conn.getConnectionExecutionDate() != null && conn.getConnectionExecutionDate() > 0) 
                               ? sdf.format(new java.util.Date(conn.getConnectionExecutionDate())) : "Scheduled";

        return "<html>"
            + "<body style='margin:0; padding:0; background-color: #f4f7f9; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>"
            + "  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding: 40px 20px;'>"
            + "    <tr>"
            + "      <td align='center'>"
            + "        <div style='max-width: 650px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.12); border: 1px solid #e1e8ed;'>"
            
            // --- UPDATED OFFICIAL HEADER ---
            + "          <div style='background: linear-gradient(135deg, #1a237e 0%, #311b92 100%); padding: 50px 40px; text-align: center;'>"
            + "            <div style='color: rgba(255,255,255,0.8); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 10px;'>Department of Water Supply & Sewerage | " + cityName + "</div>"
            + "            <h1 style='margin: 0; color: #ffffff; font-size: 36px; font-weight: 300; line-height: 1.2;'>Connection <span style='font-weight: 800; color: #ffd600;'>Activated</span></h1>"
            + "            <p style='margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 15px; font-style: italic;'>Official Confirmation of Connection Allotment</p>"
            + "          </div>"

            // --- Body Content ---
            + "          <div style='padding: 50px 45px;'>"
            + "            <p style='font-size: 18px; color: #2c3e50; margin-bottom: 25px;'>Dear <b>" + name + "</b>,</p>"
            + "      <p style='font-size: 15px; color: #475569; line-height: 1.8;'>"
            + "        We are pleased to inform you that your water supply connection has been successfully commissioned within the <b>" + cityName + " Municipal Water Infrastructure</b>. "
            + "        Your consumer profile (Consumer No: <b>" + conn.getConnectionNo() + "</b>) is now active for all billing and service requirements."
            + "      </p>"

            // --- Summary Grid ---
            + "            <div style='background-color: #fbfcfd; border-radius: 16px; border: 1px solid #eceff1; padding: 30px; margin-bottom: 40px;'>"
            + "              <table width='100%' border='0' cellspacing='0' cellpadding='0'>"
            + "                <tr>"
            + "                  <td style='padding-bottom: 25px;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Consumer Number</small><br><b style='font-size: 22px; color: #1a237e;'>" + (conn.getConnectionNo() != null ? conn.getConnectionNo() : "ACTIVATED") + "</b></td>"
            + "                  <td style='padding-bottom: 25px; text-align: right;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Property ID</small><br><b style='font-size: 15px;'>" + conn.getPropertyId() + "</b></td>"
            + "                </tr>"
            + "                <tr>"
            + "                  <td style='padding: 20px 0; border-top: 1px solid #eceff1;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Water Source</small><br><b>" + waterSource + "</b></td>"
            + "                  <td style='padding: 20px 0; border-top: 1px solid #eceff1; text-align: right;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Plot Size</small><br><b>" + plotSize + "</b></td>"
            + "                </tr>"
            + "                <tr>"
            + "                  <td style='padding-top: 20px; border-top: 1px solid #eceff1;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Usage Category</small><br><b>" + usageCategory + "</b></td>"
            + "                  <td style='padding-top: 20px; border-top: 1px solid #eceff1; text-align: right;'><small style='color: #90a4ae; font-size: 10px; text-transform: uppercase; font-weight: bold;'>Execution Date</small><br><b>" + executionDate + "</b></td>"
            + "                </tr>"
            + "              </table>"
            + "            </div>"

            // --- Attachment Alert ---
            + "            <div style='background-color: #fff9e6; border-left: 4px solid #ffc107; padding: 25px; border-radius: 4px; margin-bottom: 40px;'>"
            + "              <p style='margin: 0; font-size: 14px; color: #856404; line-height: 1.5;'><b>Digital Sanction Letter Attached</b><br>Please keep a printed copy of the attached PDF on-site for the Junior Engineer's verification during connection installation.</p>"
            + "            </div>"

            // --- Button ---
            + "            <div style='text-align: center;'>"
            + "              <a href='https://mseva.lgpunjab.gov.in/citizen' style='background-color: #1a237e; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 10px 20px rgba(26,35,126,0.2);'>Access Portal Dashboard</a>"
            + "            </div>"
            + "          </div>"

            // --- Minimal Footer ---
            + "          <div style='background-color: #fcfdfe; padding: 30px; text-align: center; border-top: 1px solid #f0f3f5;'>"
            + "            <p style='margin: 0; font-size: 11px; color: #b0bec5;'>System generated notification | Municipal Corporation of " + cityName + "</p>"
            + "          </div>"
            + "        </div>"
            + "      </td>"
            + "    </tr>"
            + "  </table>"
            + "</body></html>";
    }
    
    
    
	private String fetchFileStorePublicUrl(String tenantId, String fileStoreId) {
	    // 1. Get the template from properties
	    // Template: /filestore/v1/files/url?tenantId=$tenantId&fileStoreIds=$fileStoreIds
	    String linkTemplate = config.getFileStoreLink();
	    
	    // 2. Perform the replacement to clean the URI
	    String processedLink = linkTemplate
	            .replace("$tenantId", "pb")
	            .replace("$fileStoreIds", fileStoreId);

	    // 3. Combine Host and Path into a StringBuilder
	    StringBuilder finalUri = new StringBuilder();
	    finalUri.append(config.getFileStoreHost()).append(processedLink);
	    
	    try {
	        log.info("Fetching FileStore URL using GET: {}", finalUri.toString());

	        // 4. Call your specific GET method
	        Object response = serviceRequestRepository.fetchResultUsingGet(finalUri);
	        
	        // 5. Convert and Extract
	        Map<String, Object> responseMap = mapper.convertValue(response, Map.class);
	        
	        if (responseMap != null && responseMap.containsKey(fileStoreId)) {
	            String fileUrl = (String) responseMap.get(fileStoreId); 
	            log.info("Successfully fetched URL for fileStoreId {}: {}", fileStoreId, fileUrl);
	            return fileUrl;
	        }
	    } catch (Exception e) {
	        log.error("Failed to fetch public URL from FileStore for ID: " + fileStoreId, e);
	    }
	    return null;
	}
	
	private String getTargetFileStoreId(WaterConnection connection) {
	    Object additionalDetails = connection.getAdditionalDetails();
	    
	    if (additionalDetails == null) return null;

	    try {
	        // Safely convert the ObjectNode to a Map
	        Map<String, Object> detailsMap = mapper.convertValue(additionalDetails, Map.class);
	        
	        if (detailsMap.containsKey("sanctionFileStoreId")) {
	            return (String) detailsMap.get("sanctionFileStoreId");
	        }
	    } catch (Exception e) {
	        log.error("Error parsing additionalDetails for sanctionFileStoreId", e);
	    }
	    
	    return null;
	}
	

    public Map<String, String> getMessageForMobileNumber(Map<String, String> mobileNumbersAndNames,
                                                         WaterConnectionRequest waterConnectionRequest, String message, Property property) {
        Map<String, String> messageToReturn = new HashMap<>();
        for (Entry<String, String> mobileAndName : mobileNumbersAndNames.entrySet()) {
            String messageToReplace = message;
            Boolean isConnectionNoPresent = !StringUtils.isEmpty(waterConnectionRequest.getWaterConnection().getConnectionNo());

            if (messageToReplace.contains("{Owner Name}"))
                messageToReplace = messageToReplace.replace("{Owner Name}", mobileAndName.getValue());
            if (messageToReplace.contains("{Service}"))
                messageToReplace = messageToReplace.replace("{Service}", WCConstants.SERVICE_FIELD_VALUE_NOTIFICATION);

            if (messageToReplace.contains("{Plumb Info}"))
                messageToReplace = getMessageForPlumberInfo(waterConnectionRequest.getWaterConnection(), messageToReplace);

            if (messageToReplace.contains("{SLA}"))
                messageToReplace = messageToReplace.replace("{SLA}", getSLAForState(waterConnectionRequest, property, config.getBusinessServiceValue()));

            if (messageToReplace.contains("{Application number}"))
                messageToReplace = messageToReplace.replace("{Application number}", waterConnectionRequest.getWaterConnection().getApplicationNo());

            if (messageToReplace.contains("{Connection number}"))
                messageToReplace = messageToReplace.replace("{Connection number}", isConnectionNoPresent ? waterConnectionRequest.getWaterConnection().getConnectionNo() : "NA");

            if(messageToReplace.contains("{Reason for Rejection}"))
                messageToReplace = messageToReplace.replace("{Reason for Rejection}",  waterConnectionRequest.getWaterConnection().getProcessInstance().getComment());

//            if (messageToReplace.contains("{Application download link}")) {
//                String actionLink = config.getNotificationUrl() + config.getViewHistoryLink();
//                actionLink = actionLink.replace(applicationNumberReplacer, waterConnectionRequest.getWaterConnection().getApplicationNo());
//                messageToReplace = messageToReplace.replace("{Application download link}", waterServiceUtil.getShortnerURL(actionLink));
//            }

            if (messageToReplace.contains("{mseva URL}"))
                messageToReplace = messageToReplace.replace("{mseva URL}",
                        waterServiceUtil.getShortnerURL(config.getNotificationUrl()));

            if (messageToReplace.contains("{mseva app link}"))
                messageToReplace = messageToReplace.replace("{mseva app link}",
                        waterServiceUtil.getShortnerURL(config.getMSevaAppLink()));

            if (messageToReplace.contains("{View History Link}")) {
                String historyLink = config.getNotificationUrl() + config.getViewHistoryLink();
                historyLink = historyLink.replace(mobileNoReplacer, mobileAndName.getKey());
                historyLink = historyLink.replace(applicationNumberReplacer, waterConnectionRequest.getWaterConnection().getApplicationNo());
                historyLink = historyLink.replace(tenantIdReplacer, property.getTenantId());
                messageToReplace = messageToReplace.replace("{View History Link}",
                        waterServiceUtil.getShortnerURL(historyLink));
            }
            if (messageToReplace.contains("{payment link}")) {
                String paymentLink = config.getNotificationUrl() +  config.getViewHistoryLink();
                paymentLink = paymentLink.replace(mobileNoReplacer, mobileAndName.getKey());
                paymentLink = paymentLink.replace(applicationNumberReplacer, waterConnectionRequest.getWaterConnection().getApplicationNo());
                paymentLink = paymentLink.replace(tenantIdReplacer, property.getTenantId());
                messageToReplace = messageToReplace.replace("{payment link}",
                        waterServiceUtil.getShortnerURL(paymentLink));
            }
			/*if (messageToReplace.contains("{receipt download link}")){
				messageToReplace = messageToReplace.replace("{receipt download link}",
						waterServiceUtil.getShortnerURL(config.getNotificationUrl()));
			}*/
            if (messageToReplace.contains("{connection details page}")) {
                String connectionDetaislLink = config.getNotificationUrl() + config.getConnectionDetailsLink();
                connectionDetaislLink = connectionDetaislLink.replace(applicationNumberReplacer,
                        waterConnectionRequest.getWaterConnection().getApplicationNo());
                messageToReplace = messageToReplace.replace("{connection details page}",
                        waterServiceUtil.getShortnerURL(connectionDetaislLink));
            }
            if (messageToReplace.contains("{Date effective from}")) {
                if (waterConnectionRequest.getWaterConnection().getDateEffectiveFrom() != null) {
                    LocalDate date = Instant
                            .ofEpochMilli(waterConnectionRequest.getWaterConnection().getDateEffectiveFrom() > 10
                                    ? waterConnectionRequest.getWaterConnection().getDateEffectiveFrom()
                                    : waterConnectionRequest.getWaterConnection().getDateEffectiveFrom() * 1000)
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    messageToReplace = messageToReplace.replace("{Date effective from}", date.format(formatter));
                } else {
                    messageToReplace = messageToReplace.replace("{Date effective from}", "");
                }
            }
            messageToReturn.put(mobileAndName.getKey(), messageToReplace);
        }
        return messageToReturn;
    }

    /**
     * This method returns message to replace for plumber info depending upon
     * whether the plumber info type is either SELF or ULB
     *
     * @param waterConnection Water Connection Object
     * @param messageTemplate Message Template
     * @return updated messageTemplate
     */

    @SuppressWarnings("unchecked")
    public String getMessageForPlumberInfo(WaterConnection waterConnection, String messageTemplate) {
        HashMap<String, Object> addDetail = mapper.convertValue(waterConnection.getAdditionalDetails(),
                HashMap.class);
        if(!StringUtils.isEmpty(String.valueOf(addDetail.get(WCConstants.DETAILS_PROVIDED_BY)))){
            String detailsProvidedBy = String.valueOf(addDetail.get(WCConstants.DETAILS_PROVIDED_BY));
            if ( StringUtils.isEmpty(detailsProvidedBy) || detailsProvidedBy.equalsIgnoreCase(WCConstants.SELF)) {
                String code = StringUtils.substringBetween(messageTemplate, "{Plumb Info}", "{/Plumb Info}");
                messageTemplate = messageTemplate.replace("{Plumb Info}", "");
                messageTemplate = messageTemplate.replace("{/Plumb Info}", "");
                messageTemplate = messageTemplate.replace(code, "");
            } else {
                messageTemplate = messageTemplate.replace("{Plumb Info}", "").replace("{/Plumb Info}", "");
                messageTemplate = messageTemplate.replace("{Plumb name}",
                        StringUtils.isEmpty(waterConnection.getPlumberInfo().get(0).getName()) ? ""
                                : waterConnection.getPlumberInfo().get(0).getName());
                messageTemplate = messageTemplate.replace("{Plumb Licence No.}",
                        StringUtils.isEmpty(waterConnection.getPlumberInfo().get(0).getLicenseNo()) ? ""
                                : waterConnection.getPlumberInfo().get(0).getLicenseNo());
                messageTemplate = messageTemplate.replace("{Plumb Mobile No.}",
                        StringUtils.isEmpty(waterConnection.getPlumberInfo().get(0).getMobileNumber()) ? ""
                                : waterConnection.getPlumberInfo().get(0).getMobileNumber());
            }

        }else{
            String code = StringUtils.substringBetween(messageTemplate, "{Plumb Info}", "{/Plumb Info}");
            messageTemplate = messageTemplate.replace("{Plumb Info}", "");
            messageTemplate = messageTemplate.replace("{/Plumb Info}", "");
            messageTemplate = messageTemplate.replace(code, "");
        }
        return messageTemplate;

    }

    /**
     * Fetches SLA of CITIZEN based on the phone number.
     *
     * @param connectionRequest Water Connection Request
     * @param property Property
     * @return string consisting SLA
     */

    public String getSLAForState(WaterConnectionRequest connectionRequest, Property property, String businessServiceName) {
        String resultSla = "";
        BusinessService businessService = workflowService.getBusinessService(property.getTenantId(),
                connectionRequest.getRequestInfo(), businessServiceName);
        if (businessService != null && businessService.getStates() != null && businessService.getStates().size() > 0) {
            for (State state : businessService.getStates()) {
                if (WCConstants.PENDING_FOR_CONNECTION_ACTIVATION.equalsIgnoreCase(state.getState())) {
                    resultSla = String.valueOf((state.getSla() == null ? 0L : state.getSla()) / 86400000);
                }
            }
        }
        return resultSla;
    }


    /**
     * Fetches UUIDs of CITIZEN based on the phone number.
     *
     * @param mobileNumbers - List of Mobile Numbers
     * @param requestInfo - Request Information
     * @param tenantId - Tenant Id
     * @return Returns List of MobileNumbers and UUIDs
     */
    public Map<String, String> fetchUserUUIDs(Set<String> mobileNumbers, RequestInfo requestInfo, String tenantId) {
        Map<String, String> mapOfPhoneNoAndUUIDs = new HashMap<>();
        StringBuilder uri = new StringBuilder();
        uri.append(config.getUserHost()).append(config.getUserSearchEndpoint());
        Map<String, Object> userSearchRequest = new HashMap<>();
        userSearchRequest.put("RequestInfo", requestInfo);
        userSearchRequest.put("tenantId", tenantId);
        userSearchRequest.put("userType", "CITIZEN");
        for(String mobileNo: mobileNumbers) {
            userSearchRequest.put("userName", mobileNo);
            try {
                Object user = serviceRequestRepository.fetchResult(uri, userSearchRequest);
                if(null != user) {
                    String uuid = JsonPath.read(user, "$.user[0].uuid");
                    mapOfPhoneNoAndUUIDs.put(mobileNo, uuid);
                }else {
                    log.error("Service returned null while fetching user for username - "+mobileNo);
                }
            }catch(Exception e) {
                log.error("Exception while fetching user for username - "+mobileNo);
                log.error("Exception trace: ",e);
            }
        }
        return mapOfPhoneNoAndUUIDs;
    }

    /**
     * Fetch URL for application download link
     *
     * @param waterConnectionRequest Water Connection Request
     * @param property Property
     * @return application download link
     */
    private String getApplicationDownloadLink(WaterConnectionRequest waterConnectionRequest, Property property) {
        CalculationCriteria criteria = CalculationCriteria.builder().applicationNo(waterConnectionRequest.getWaterConnection().getApplicationNo())
                .waterConnection(waterConnectionRequest.getWaterConnection()).tenantId(property.getTenantId()).build();
        CalculationReq calRequest = CalculationReq.builder().calculationCriteria(Arrays.asList(criteria))
                .requestInfo(waterConnectionRequest.getRequestInfo()).isconnectionCalculation(false).isDisconnectionRequest(false).isReconnectionRequest(false).build();
        try {
            Object response = serviceRequestRepository.fetchResult(waterServiceUtil.getEstimationURL(), calRequest);
            CalculationRes calResponse = mapper.convertValue(response, CalculationRes.class);
            JSONObject waterObject = mapper.convertValue(waterConnectionRequest.getWaterConnection(), JSONObject.class);
            if (CollectionUtils.isEmpty(calResponse.getCalculation())) {
                throw new CustomException("NO_ESTIMATION_FOUND", "Estimation not found!!!");
            }
            waterObject.put(totalAmount, calResponse.getCalculation().get(0).getTotalAmount());
            waterObject.put(applicationFee, calResponse.getCalculation().get(0).getFee());
            waterObject.put(serviceFee, calResponse.getCalculation().get(0).getCharge());
            waterObject.put(tax, calResponse.getCalculation().get(0).getTaxAmount());
            waterObject.put(propertyKey, property);
            String tenantId = property.getTenantId().split("\\.")[0];
            String fileStoreId = getFielStoreIdFromPDFService(waterObject, waterConnectionRequest.getRequestInfo(), tenantId);
            return getApplicationDownloadLink(tenantId, fileStoreId);
        } catch (Exception ex) {
            log.error("Calculation response error!!", ex);
            throw new CustomException("WATER_CALCULATION_EXCEPTION", "Calculation response can not parsed!!!");
        }
    }
    /**
     * Get file store id from PDF service
     *
     * @param waterObject Water Connection Object
     * @param requestInfo Request Information
     * @param tenantId Tenant Id
     * @return file store id
     */
    private String getFielStoreIdFromPDFService(JSONObject waterObject, RequestInfo requestInfo, String tenantId) {
        JSONArray waterConnectionList = new JSONArray();
        waterConnectionList.add(waterObject);
        JSONObject requestPayload = new JSONObject();
        requestPayload.put(requestInfoReplacer, requestInfo);
        requestPayload.put(WaterConnectionReplacer, waterConnectionList);
        try {
            StringBuilder builder = new StringBuilder();
            builder.append(config.getPdfServiceHost());
            String pdfLink = config.getPdfServiceLink();
            pdfLink = pdfLink.replace(tenantIdReplacer, tenantId).replace(applicationKey, WCConstants.PDF_APPLICATION_KEY);
            builder.append(pdfLink);
            Object response = serviceRequestRepository.fetchResult(builder, requestPayload);
            DocumentContext responseContext = JsonPath.parse(response);
            List<Object> fileStoreIds = responseContext.read("$.filestoreIds");
            if(CollectionUtils.isEmpty(fileStoreIds)) {
                throw new CustomException("EMPTY_FILESTORE_IDS_FROM_PDF_SERVICE", "File Store Id doesn't exist in pdf service");
            }
            return fileStoreIds.get(0).toString();
        } catch (Exception ex) {
            log.error("PDF file store id response error!!", ex);
            throw new CustomException("WATER_FILESTORE_PDF_EXCEPTION", "PDF response can not parsed!!!");
        }
    }

    /**
     *
     * @param tenantId TenantId
     * @param fileStoreId File Store Id
     * @return file store id
     */
    private String getApplicationDownloadLink(String tenantId, String fileStoreId) {
        String fileStoreServiceLink = config.getFileStoreHost() + config.getFileStoreLink();
        fileStoreServiceLink = fileStoreServiceLink.replace(tenantIdReplacer, tenantId);
        fileStoreServiceLink = fileStoreServiceLink.replace(fileStoreIdReplacer, fileStoreId);
        try {
            Object response = serviceRequestRepository.fetchResultUsingGet(new StringBuilder(fileStoreServiceLink));
            DocumentContext responseContext = JsonPath.parse(response);
            List<Object> fileStoreIds = responseContext.read("$.fileStoreIds");
            if (CollectionUtils.isEmpty(fileStoreIds)) {
                throw new CustomException("EMPTY_FILESTORE_IDS_FROM_PDF_SERVICE",
                        "NO file store id found from pdf service");
            }
            JSONObject obje = mapper.convertValue(fileStoreIds.get(0), JSONObject.class);
            return obje.get(urlReplacer).toString();
        } catch (Exception ex) {
            log.error("PDF file store id response error!!", ex);
            throw new CustomException("WATER_FILESTORE_PDF_EXCEPTION", "PDF response can not parsed!!!");
        }
    }

    public Map<String, String> setRecepitDownloadLink(Map<String, String> mobileNumberAndMessage,
                                                      WaterConnectionRequest waterConnectionRequest, String message, Property property) {

        Map<String, String> messageToReturn = new HashMap<>();
        String receiptNumber = getReceiptNumber(waterConnectionRequest);
        for (Entry<String, String> mobileAndMsg : mobileNumberAndMessage.entrySet()) {
            String messageToReplace = mobileAndMsg.getValue();
            String link = config.getNotificationUrl() + config.getMyPaymentsLink();
//            link = waterServiceUtil.getShortnerURL(link);
//            messageToReplace = messageToReplace.replace("{receipt download link}", link);
            messageToReturn.put(mobileAndMsg.getKey(), messageToReplace);

        }
        return messageToReturn;

    }

    public String getReceiptNumber(WaterConnectionRequest waterConnectionRequest){
        String consumerCode,service;
        if(StringUtils.isEmpty(waterConnectionRequest.getWaterConnection().getConnectionNo())){
            consumerCode = waterConnectionRequest.getWaterConnection().getApplicationNo();
            service = businessService;
        }
        else{
            consumerCode = waterConnectionRequest.getWaterConnection().getConnectionNo();
            service = "WS";
        }
        StringBuilder URL = waterServiceUtil.getcollectionURL();
        URL.append(service).append("/_search").append("?").append("consumerCodes=").append(consumerCode)
                .append("&").append("tenantId=").append(waterConnectionRequest.getWaterConnection().getTenantId());
        RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(waterConnectionRequest.getRequestInfo()).build();
        Object response = serviceRequestRepository.fetchResult(URL,requestInfoWrapper);
        PaymentResponse paymentResponse = mapper.convertValue(response, PaymentResponse.class);
        return paymentResponse.getPayments().get(0).getPaymentDetails().get(0).getReceiptNumber();
    }

    /**
     * Fetches User Object based on the UUID.
     *
     * @param uuids - set of UUIDs of User
     * @param requestInfo - Request Info Object
     * @param tenantId - Tenant Id
     * @return - Returns User object with given UUID
     */
    public UserDetailResponse fetchUserByUUID(Set<String> uuids, RequestInfo requestInfo, String tenantId) {
        User userInfoCopy = requestInfo.getUserInfo();

        User userInfo = notificationUtil.getInternalMicroserviceUser(tenantId);
        requestInfo.setUserInfo(userInfo);

        UserSearchRequest userSearchRequest = userService.getBaseUserSearchRequest(tenantId, requestInfo);
        userSearchRequest.setUuid(uuids);

        UserDetailResponse userDetailResponse = userService.getUser(userSearchRequest);
        requestInfo.setUserInfo(userInfoCopy);
        return userDetailResponse;
    }

    /**
     * Fetches User Object based on the UUID.
     *
     * @param username - username of User
     * @param requestInfo - Request Info Object
     * @param tenantId - Tenant Id
     * @return - Returns User object with given UUID
     */
    public UserDetailResponse fetchUserByUsername(String username, RequestInfo requestInfo, String tenantId) {
        User userInfoCopy = requestInfo.getUserInfo();

        User userInfo = notificationUtil.getInternalMicroserviceUser(tenantId);
        requestInfo.setUserInfo(userInfo);

        UserSearchRequest userSearchRequest = userService.getBaseUserSearchRequest(tenantId, requestInfo);
        userSearchRequest.setUserName(username);

        UserDetailResponse userDetailResponse = userService.getUser(userSearchRequest);
        requestInfo.setUserInfo(userInfoCopy);
        return userDetailResponse;
    }

}
