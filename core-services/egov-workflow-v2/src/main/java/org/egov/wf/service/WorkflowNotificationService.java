package org.egov.wf.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;
import org.egov.wf.repository.ServiceRequestRepository;
import org.egov.wf.web.models.Email;
import org.egov.wf.web.models.EmailRequest;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessStateAndAction;
import org.egov.wf.web.models.SMSRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class WorkflowNotificationService {

    @Autowired
    private WorkflowConfig config;

    @Autowired
    private Producer producer;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ObjectMapper mapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");

    /**
     * Sends SMS and Email notifications to assigned users (employees or citizens) upon workflow process transition.
     * Messages are strictly extracted from the localization service. If a template is not present
     * in localization, sending is silently skipped without logging warnings or errors.
     *
     * @param requestInfo            RequestInfo from incoming request
     * @param processStateAndActions Transition state & actions
     */
    public void sendWorkflowTransitionNotification(RequestInfo requestInfo, List<ProcessStateAndAction> processStateAndActions) {
        if (CollectionUtils.isEmpty(processStateAndActions)) {
            return;
        }

        try {
            for (ProcessStateAndAction psa : processStateAndActions) {
                if (psa == null) {
                    continue;
                }

                ProcessInstance pi = psa.getProcessInstanceFromRequest();
                if (pi == null || CollectionUtils.isEmpty(pi.getAssignes())) {
                    continue;
                }

                // Fetch localization messages for tenant
                String localizationMessages = getLocalizationMessages(pi.getTenantId(), requestInfo);
                if (StringUtils.isBlank(localizationMessages)) {
                    log.debug("No localization messages found for tenant: {}. Skipping notifications.", pi.getTenantId());
                    continue;
                }

                // Look up SMS and Email templates directly using configured template IDs
                String smsTemplateId = config != null ? config.getSmsTemplateId() : "EG_WF_ASSIGNEE_MSG";
                String emailTemplateId = config != null ? config.getEmailTemplateId() : "EG_WF_ASSIGNEE_EMAIL";

                String smsTemplate = getMessageTemplate(smsTemplateId, localizationMessages);
                String emailTemplate = getMessageTemplate(emailTemplateId, localizationMessages);

                // If neither template exists in localization, nothing to send
                if (StringUtils.isBlank(smsTemplate) && StringUtils.isBlank(emailTemplate)) {
                    log.debug("Neither SMS ('{}') nor Email ('{}') template configured in localization. Skipping.",
                            smsTemplateId, emailTemplateId);
                    continue;
                }

                String businessId = StringUtils.defaultString(pi.getBusinessId());
                String moduleName = StringUtils.isNotBlank(pi.getModuleName())
                        ? pi.getModuleName()
                        : StringUtils.defaultString(pi.getBusinessService());
                String status = (pi.getState() != null && StringUtils.isNotBlank(pi.getState().getState()))
                        ? pi.getState().getState()
                        : (psa.getResultantState() != null ? StringUtils.defaultString(psa.getResultantState().getState(), "PENDING") : "PENDING");

                String assignerName = getAssignerName(pi, requestInfo);
                String assignmentDate = LocalDateTime.now().format(DATE_FORMATTER);
                String comment = pi.getComment();

                for (User assignee : pi.getAssignes()) {
                    if (assignee == null) {
                        continue;
                    }

                    String assigneeName = getAssigneeName(assignee);
                    String portalUrl = getPortalUrl(assignee);

                    // 1. Send SMS if SMS template is present in localization and user has a mobile number
                    if (config != null && Boolean.TRUE.equals(config.getIsSmsNotificationEnabled())
                            && StringUtils.isNotBlank(smsTemplate)
                            && StringUtils.isNotBlank(assignee.getMobileNumber())) {
                        sendSms(smsTemplate, assignee.getMobileNumber().trim(), assigneeName, businessId, moduleName, assignerName, status, pi.getTenantId());
                    }

                    // 2. Send Email only if user has a valid email and email template is present in localization
                    if (config != null && Boolean.TRUE.equals(config.getIsEmailNotificationEnabled())
                            && StringUtils.isNotBlank(emailTemplate)
                            && hasValidEmail(assignee)) {
                        sendEmail(requestInfo, emailTemplate, assignee.getEmailId().trim(), assigneeName, businessId, moduleName, assignerName, status, assignmentDate, portalUrl, comment);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error occurred while dispatching workflow transition notifications: ", e);
        }
    }

    /**
     * Checks if the user is a citizen based on user type or roles.
     */
    private boolean isCitizen(User user) {
        if (user == null) {
            return false;
        }
        if ("CITIZEN".equalsIgnoreCase(user.getType())) {
            return true;
        }
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            return user.getRoles().stream()
                    .anyMatch(role -> role != null && "CITIZEN".equalsIgnoreCase(role.getCode()));
        }
        return false;
    }

    /**
     * Resolves the display name of the assignee. If name is not provided,
     * defaults to 'Citizen' for citizen users or 'Employee' for employees.
     */
    private String getAssigneeName(User assignee) {
        if (assignee != null && StringUtils.isNotBlank(assignee.getName())) {
            return assignee.getName().trim();
        }
        if (isCitizen(assignee)) {
            return "Citizen";
        }
        return "Employee";
    }

    /**
     * Returns the appropriate portal URL depending on whether the assignee is a citizen or an employee.
     */
    private String getPortalUrl(User assignee) {
        if (config == null) {
            return "";
        }
        if (isCitizen(assignee) && StringUtils.isNotBlank(config.getCitizenPortalUrl())) {
            return config.getCitizenPortalUrl();
        }
        return StringUtils.defaultString(config.getEmployeePortalUrl());
    }

    /**
     * Checks if the user has an existing and valid email address.
     */
    private boolean hasValidEmail(User user) {
        if (user == null || StringUtils.isBlank(user.getEmailId())) {
            return false;
        }
        String email = user.getEmailId().trim();
        int atIndex = email.indexOf('@');
        int dotIndex = email.lastIndexOf('.');
        return atIndex > 0 && atIndex < dotIndex && dotIndex < email.length() - 1;
    }

    /**
     * Fetches localization messages from localization service.
     */
    public String getLocalizationMessages(String tenantId, RequestInfo requestInfo) {
        try {
            if (config == null || serviceRequestRepository == null) {
                return null;
            }

            String defaultStateTenant = StringUtils.defaultIfBlank(config.getStateLevelTenantId(), "pb");
            String stateTenantId = (Boolean.TRUE.equals(config.getIsLocalizationStateLevel()) && tenantId != null && tenantId.contains("."))
                    ? tenantId.split("\\.")[0]
                    : (tenantId != null ? tenantId : defaultStateTenant);

            String locale = StringUtils.defaultIfBlank(config.getFallbackLocale(), "en_IN");
            if (requestInfo != null && StringUtils.isNotBlank(requestInfo.getMsgId())) {
                String[] msgIdParts = requestInfo.getMsgId().split("\\|");
                if (msgIdParts.length >= 2 && StringUtils.isNotBlank(msgIdParts[1])) {
                    locale = msgIdParts[1].trim();
                }
            }

            String moduleName = StringUtils.defaultIfBlank(config.getLocalizationModule(), "rainmaker-workflow");

            StringBuilder uri = new StringBuilder();
            uri.append(StringUtils.defaultString(config.getLocalizationHost()))
                    .append(StringUtils.defaultString(config.getLocalizationContextPath()))
                    .append(StringUtils.defaultString(config.getLocalizationSearchEndpoint()))
                    .append("?locale=").append(locale)
                    .append("&tenantId=").append(stateTenantId)
                    .append("&module=").append(moduleName);

            Object response = serviceRequestRepository.fetchResult(uri, requestInfo);
            if (response != null && mapper != null) {
                return mapper.writeValueAsString(response);
            }
        } catch (Exception e) {
            log.debug("Could not fetch localization messages for tenant: {}", tenantId, e);
        }
        return null;
    }

    /**
     * Extracts message template from localization messages JSON using jsonpath.
     * Returns null if code is not found, without logging warnings.
     */
    public String getMessageTemplate(String notificationCode, String localizationMessage) {
        if (StringUtils.isBlank(notificationCode) || StringUtils.isBlank(localizationMessage)) {
            return null;
        }
        String path = "$..messages[?(@.code==\"{}\")].message";
        path = path.replace("{}", notificationCode.trim());
        try {
            Object messageObj = JsonPath.parse(localizationMessage).read(path);
            if (messageObj instanceof List && !((List<?>) messageObj).isEmpty()) {
                Object item = ((List<?>) messageObj).get(0);
                if (item != null && StringUtils.isNotBlank(item.toString())) {
                    return item.toString();
                }
            }
        } catch (Exception e) {
            log.debug("Localization code {} not found in message payload: {}", notificationCode, e.getMessage());
        }
        return null;
    }

    private String getAssignerName(ProcessInstance pi, RequestInfo requestInfo) {
        if (pi != null && pi.getAssigner() != null && StringUtils.isNotBlank(pi.getAssigner().getName())) {
            return pi.getAssigner().getName().trim();
        } else if (requestInfo != null && requestInfo.getUserInfo() != null && StringUtils.isNotBlank(requestInfo.getUserInfo().getName())) {
            return requestInfo.getUserInfo().getName().trim();
        }
        return "Department Officer";
    }

    private void sendSms(String template, String mobileNumber, String assigneeName, String businessId, String moduleName,
                         String assignerName, String status, String tenantId) {
        try {
            if (config == null || producer == null || StringUtils.isBlank(config.getSmsNotifTopic())) {
                log.warn("SMS producer or topic not configured. Skipping SMS push.");
                return;
            }

            String message = formatSmsMessage(template, assigneeName, businessId, moduleName, assignerName, status);

            SMSRequest smsRequest = SMSRequest.builder()
                    .mobileNumber(mobileNumber)
                    .message(message)
                    .templateId(config.getSmsTemplateId())
                    .tenantId(tenantId)
                    .build();

            producer.push(config.getSmsNotifTopic(), smsRequest);
            log.info("Workflow assignee SMS pushed to topic {} for mobile: {}, application: {}",
                    config.getSmsNotifTopic(), mobileNumber, businessId);
        } catch (Exception e) {
            log.error("Failed to send workflow assignee SMS for application: {}", businessId, e);
        }
    }

    private String formatSmsMessage(String template, String assigneeName, String businessId,
                                    String moduleName, String assignerName, String status) {
        if (StringUtils.isBlank(template)) {
            return "";
        }
        String safeAssigneeName = StringUtils.defaultString(assigneeName);
        String safeBusinessId = StringUtils.defaultString(businessId);
        String safeModuleName = StringUtils.defaultString(moduleName);
        String safeAssignerName = StringUtils.defaultString(assignerName);
        String safeStatus = StringUtils.defaultString(status);

        // Handle {1}, {2}, {3}, {4}, {5} placeholders
        if (template.contains("{1}")) {
            return template.replace("{1}", safeAssigneeName)
                    .replace("{2}", safeBusinessId)
                    .replace("{3}", safeModuleName)
                    .replace("{4}", safeAssignerName)
                    .replace("{5}", safeStatus);
        }
        // Handle {#var#} placeholders if configured in DLT raw style
        String[] vars = new String[]{safeAssigneeName, safeBusinessId, safeModuleName, safeAssignerName, safeStatus};
        String result = template;
        for (String var : vars) {
            if (result.contains("{#var#}")) {
                result = result.replaceFirst(Pattern.quote("{#var#}"), Matcher.quoteReplacement(var));
            }
        }
        return result;
    }

    private void sendEmail(RequestInfo requestInfo, String emailTemplate, String emailId, String assigneeName,
                           String businessId, String moduleName, String assignerName, String status,
                           String assignmentDate, String portalUrl, String comment) {
        try {
            if (config == null || producer == null || StringUtils.isBlank(config.getEmailNotifTopic())) {
                log.warn("Email producer or topic not configured. Skipping Email push.");
                return;
            }

            String subject = "Assignment of New Application: " + businessId + " (" + moduleName + ") - mSeva Punjab";
            String emailBody = buildEmailHtml(emailTemplate, assigneeName, businessId, moduleName, assignerName, status, assignmentDate, portalUrl, comment);

            Email email = Email.builder()
                    .emailTo(Collections.singleton(emailId))
                    .subject(subject)
                    .body(emailBody)
                    .isHTML(true)
                    .build();

            EmailRequest emailRequest = EmailRequest.builder()
                    .requestInfo(requestInfo)
                    .email(email)
                    .build();

            producer.push(config.getEmailNotifTopic(), emailRequest);
            log.info("Workflow assignee Email pushed to topic {} for email: {}, application: {}",
                    config.getEmailNotifTopic(), emailId, businessId);
        } catch (Exception e) {
            log.error("Failed to send workflow assignee Email for application: {}", businessId, e);
        }
    }

    private String buildEmailHtml(String template, String assigneeName, String businessId, String moduleName,
                                  String assignerName, String status, String assignmentDate,
                                  String portalUrl, String comment) {
        if (StringUtils.isBlank(template)) {
            return "";
        }

        String commentSection = "";
        if (StringUtils.isNotBlank(comment)) {
            commentSection = "              <!-- Additional Comments / Remarks Box -->\r\n" +
                    "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"border-collapse:collapse; border:1px solid #cbd5e1; margin:0 0 20px 0;\">\r\n" +
                    "                <tr>\r\n" +
                    "                  <td style=\"background-color:#eef2f6; padding:9px 16px; font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:0.6px; color:#0b2545; border-bottom:1px solid #cbd5e1;\">\r\n" +
                    "                    Additional Comments / Remarks\r\n" +
                    "                  </td>\r\n" +
                    "                </tr>\r\n" +
                    "                <tr>\r\n" +
                    "                  <td style=\"background-color:#f8fafc; padding:14px 16px; font-size:13.5px; line-height:1.6; color:#334155;\">\r\n" +
                    "                    " + escapeHtml(comment.trim()) + "\r\n" +
                    "                  </td>\r\n" +
                    "                </tr>\r\n" +
                    "              </table>\r\n";
        }

        return template
                .replace("{1}", escapeHtml(assigneeName))
                .replace("{2}", escapeHtml(businessId))
                .replace("{3}", escapeHtml(moduleName))
                .replace("{4}", escapeHtml(assignerName))
                .replace("{5}", escapeHtml(status))
                .replace("{6}", escapeHtml(assignmentDate))
                .replace("{7}", portalUrl != null ? portalUrl : "")
                .replace("{8}", escapeHtml(StringUtils.defaultString(comment)))
                .replace("{COMMENT_SECTION}", commentSection);
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
