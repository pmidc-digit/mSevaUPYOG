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
import org.egov.wf.web.models.UserWorkloadDigest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
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
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

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
                String assignmentDate = ZonedDateTime.now(IST_ZONE).format(DATE_FORMATTER);
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
     * Sends SMS and Email reminder notifications for an active process instance.
     * Uses the same localization templates (EG_WF_ASSIGNEE_MSG and EG_WF_ASSIGNEE_EMAIL).
     */
    public void sendReminderNotificationForProcessInstance(RequestInfo requestInfo, ProcessInstance pi,
                                                          String smsTemplate, String emailTemplate) {
        if (pi == null || CollectionUtils.isEmpty(pi.getAssignes())) {
            return;
        }

        try {
            // If neither template is provided, nothing to send
            if (StringUtils.isBlank(smsTemplate) && StringUtils.isBlank(emailTemplate)) {
                return;
            }

            String businessId = StringUtils.defaultString(pi.getBusinessId());
            String moduleName = StringUtils.isNotBlank(pi.getModuleName())
                    ? pi.getModuleName()
                    : StringUtils.defaultString(pi.getBusinessService());
            String status = (pi.getState() != null && StringUtils.isNotBlank(pi.getState().getState()))
                    ? pi.getState().getState()
                    : (pi.getState() != null && StringUtils.isNotBlank(pi.getState().getApplicationStatus())
                    ? pi.getState().getApplicationStatus() : "PENDING");

            String assignerName = getAssignerName(pi, requestInfo);
            String assignmentDate = getAssignmentDate(pi);
            String comment = pi.getComment();

            for (User assignee : pi.getAssignes()) {
                if (assignee == null) {
                    continue;
                }

                String assigneeName = getAssigneeName(assignee);
                String portalUrl = getPortalUrl(assignee);

                // 1. Send SMS if SMS template is present and user has mobile
                if (config != null && Boolean.TRUE.equals(config.getIsSmsNotificationEnabled())
                        && StringUtils.isNotBlank(smsTemplate)
                        && StringUtils.isNotBlank(assignee.getMobileNumber())) {
                    sendSms(smsTemplate, assignee.getMobileNumber().trim(), assigneeName, businessId, moduleName, assignerName, status, pi.getTenantId());
                }

                // 2. Send Email if Email template is present and user has valid email
                if (config != null && Boolean.TRUE.equals(config.getIsEmailNotificationEnabled())
                        && StringUtils.isNotBlank(emailTemplate)
                        && hasValidEmail(assignee)) {
                    sendEmail(requestInfo, emailTemplate, assignee.getEmailId().trim(), assigneeName, businessId, moduleName, assignerName, status, assignmentDate, portalUrl, comment);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send workflow reminder notification for application: {}", pi.getBusinessId(), e);
        }
    }

    private String getAssignmentDate(ProcessInstance pi) {
        try {
            if (pi != null && pi.getAuditDetails() != null && pi.getAuditDetails().getLastModifiedTime() != null
                    && pi.getAuditDetails().getLastModifiedTime() > 0) {
                return Instant.ofEpochMilli(pi.getAuditDetails().getLastModifiedTime())
                        .atZone(IST_ZONE)
                        .format(DATE_FORMATTER);
            }
        } catch (Exception ignored) {
        }
        return ZonedDateTime.now(IST_ZONE).format(DATE_FORMATTER);
    }

    /**
     * Sends a single consolidated Daily Workload Digest (SMS & Email) to an employee,
     * bifurcating pending applications across different business services.
     */
    public void sendWorkloadDigestNotification(RequestInfo requestInfo, User user, UserWorkloadDigest digest,
                                              String smsDigestTemplate, String emailDigestTemplate) {
        if (user == null || digest == null || digest.getTotalApplications() <= 0) {
            return;
        }

        try {
            boolean isCitizenUser = isCitizen(user);
            String assigneeName = getAssigneeName(user);
            String portalUrl = getPortalUrl(user);
            String totalCount = String.valueOf(digest.getTotalApplications());
            String servicesCount = String.valueOf(digest.getServiceWiseCounts().size());
            String currentDate = ZonedDateTime.now(IST_ZONE).format(DATE_FORMATTER);

            // 1. Send SMS if enabled and mobile is present
            if (config != null && Boolean.TRUE.equals(config.getIsSmsNotificationEnabled())
                    && StringUtils.isNotBlank(smsDigestTemplate)
                    && StringUtils.isNotBlank(user.getMobileNumber())) {
                sendDigestSms(smsDigestTemplate, user.getMobileNumber().trim(), assigneeName, totalCount, servicesCount, digest.getTenantId());
            }

            // 2. Send Email if enabled and valid email is present
            if (config != null && Boolean.TRUE.equals(config.getIsEmailNotificationEnabled())
                    && StringUtils.isNotBlank(emailDigestTemplate)
                    && hasValidEmail(user)) {
                sendDigestEmail(requestInfo, emailDigestTemplate, user.getEmailId().trim(), assigneeName, totalCount, servicesCount, digest, currentDate, portalUrl, isCitizenUser);
            }
        } catch (Exception e) {
            log.error("Failed to send workflow workload digest notification for user: {}", user.getUuid(), e);
        }
    }

    private void sendDigestSms(String template, String mobileNumber, String assigneeName, String totalCount,
                              String servicesCount, String tenantId) {
        try {
            String message = template
                    .replace("{1}", StringUtils.defaultString(assigneeName))
                    .replace("{2}", StringUtils.defaultString(totalCount))
                    .replace("{3}", StringUtils.defaultString(servicesCount));

            if (message.contains("{#var#}")) {
                message = Pattern.compile(Pattern.quote("{#var#}"))
                        .matcher(message)
                        .replaceFirst(Matcher.quoteReplacement(StringUtils.defaultString(assigneeName)));
                message = Pattern.compile(Pattern.quote("{#var#}"))
                        .matcher(message)
                        .replaceFirst(Matcher.quoteReplacement(StringUtils.defaultString(totalCount)));
                message = Pattern.compile(Pattern.quote("{#var#}"))
                        .matcher(message)
                        .replaceFirst(Matcher.quoteReplacement(StringUtils.defaultString(servicesCount)));
            }

            SMSRequest smsRequest = SMSRequest.builder()
                    .mobileNumber(mobileNumber)
                    .message(message)
                    .templateId(config != null ? config.getSmsDigestTemplateId() : "EG_WF_DIGEST_MSG")
                    .tenantId(StringUtils.defaultIfBlank(tenantId, config != null ? config.getStateLevelTenantId() : "pb"))
                    .build();

            producer.push(config.getSmsNotifTopic(), smsRequest);
            log.info("Workflow digest SMS pushed to topic {} for mobile: {}, total applications: {}",
                    config.getSmsNotifTopic(), mobileNumber, totalCount);
        } catch (Exception e) {
            log.error("Failed to send workflow digest SMS to mobile: {}", mobileNumber, e);
        }
    }

    private void sendDigestEmail(RequestInfo requestInfo, String emailTemplate, String emailId, String assigneeName,
                                 String totalCount, String servicesCount, UserWorkloadDigest digest,
                                 String currentDate, String portalUrl, boolean isCitizenUser) {
        try {
            StringBuilder tableRows = new StringBuilder();
            if (digest.getServiceWiseCounts() != null) {
                boolean alternate = false;
                for (Map.Entry<String, Integer> entry : digest.getServiceWiseCounts().entrySet()) {
                    String serviceName = entry.getKey();
                    int totalServiceCount = entry.getValue();
                    String bg = alternate ? "#f8fafc" : "#ffffff";
                    alternate = !alternate;

                    UserWorkloadDigest.ServiceSla sla = (digest.getServiceWiseSla() != null)
                            ? digest.getServiceWiseSla().get(serviceName)
                            : null;

                    String slaSubtext = "";
                    if (sla != null) {
                        if (isCitizenUser) {
                            slaSubtext = "<div style=\"font-size:11px; margin-top:3px; font-weight:normal;\">" +
                                    "<span style=\"color:#16a34a; font-weight:600;\">" + sla.getUnderSla() + " Within Timeline</span> &nbsp;&bull;&nbsp; " +
                                    "<span style=\"color:#d97706; font-weight:600;\">" + sla.getCompletingSla() + " Due Soon</span> &nbsp;&bull;&nbsp; " +
                                    "<span style=\"color:#dc2626; font-weight:600;\">" + sla.getOverSla() + " Overdue</span>" +
                                    "</div>";
                        } else {
                            slaSubtext = "<div style=\"font-size:11px; margin-top:3px; font-weight:normal;\">" +
                                    "<span style=\"color:#16a34a; font-weight:600;\">" + sla.getUnderSla() + " Under SLA</span> &nbsp;&bull;&nbsp; " +
                                    "<span style=\"color:#d97706; font-weight:600;\">" + sla.getCompletingSla() + " Completing</span> &nbsp;&bull;&nbsp; " +
                                    "<span style=\"color:#dc2626; font-weight:600;\">" + sla.getOverSla() + " Over SLA</span>" +
                                    "</div>";
                        }
                    }

                    String serviceDisplayHtml;
                    if (serviceName.contains(" (") && serviceName.endsWith(")")) {
                        int openParen = serviceName.lastIndexOf(" (");
                        String mainName = serviceName.substring(0, openParen);
                        String codeName = serviceName.substring(openParen + 1); // e.g. "(NewTL)"
                        serviceDisplayHtml = escapeHtml(mainName) + " <span style=\"font-size:12px; font-weight:normal; color:#475569;\">" + escapeHtml(codeName) + "</span>";
                    } else {
                        serviceDisplayHtml = escapeHtml(serviceName);
                    }

                    tableRows.append("<tr style=\"background-color:").append(bg).append(";\">")
                            .append("<td style=\"padding:12px 18px; font-size:13px; font-weight:600; color:#1e293b; border-bottom:1px solid #e2e8f0; border-right:1px solid #cbd5e1;\">")
                            .append(serviceDisplayHtml)
                            .append(slaSubtext)
                            .append("</td>")
                            .append("<td style=\"padding:12px 18px; font-size:13px; font-weight:bold; color:#0f172a; border-bottom:1px solid #e2e8f0; text-align:right;\">")
                            .append("<span style=\"display:inline-block; min-width:32px; padding:3px 10px; background-color:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:12px; font-size:12.5px; font-weight:bold; text-align:center;\">")
                            .append(totalServiceCount)
                            .append("</span>")
                            .append("</td>")
                            .append("</tr>");
                }
            }

            String buttonLabel = isCitizenUser ? "Access mSeva Citizen Portal" : "Access mSeva Employee Portal";
            String advisoryHeading = isCitizenUser
                    ? "ACTION REQUIRED: SUBMISSION TIMELINE"
                    : "STATUTORY SLA &amp; RTS WORKFLOW ADVISORY";
            String advisoryText = isCitizenUser
                    ? "<strong>Action Required:</strong> Please submit your application / required documents within <strong>5 days</strong> of it being assigned to you to ensure timely processing and avoid cancellation."
                    : "Under the Punjab Transparency in Delivery of Public Services (RTS) guidelines, all municipal applications are governed by strict Service Level Agreement (SLA) timelines. Cases pending beyond prescribed limits are monitored on the State Administrative Dashboard. Timely scrutiny, approval, and onward disposal are requested.";
            String introText = isCitizenUser
                    ? "This is to place before you the daily status report of municipal applications currently awaiting your action on the <strong>mSeva Punjab</strong> portal. You are requested to review the pending cases listed below and submit the required details or documents at the earliest."
                    : "This is to place before you the daily pendency report of municipal workflow applications currently assigned to your queue on the <strong>mSeva Punjab</strong> portal. You are requested to review the pending cases listed below and ensure timely scrutiny, approval, or onward disposal.";
            String metricSubtitle = isCitizenUser
                    ? "Awaiting your action / submission"
                    : "Awaiting action in your queue";

            String underSlaStr = String.valueOf(digest.getUnderSlaCount());
            String completingSlaStr = String.valueOf(digest.getCompletingSlaCount());
            String overSlaStr = String.valueOf(digest.getOverSlaCount());

            String underSlaTitle = isCitizenUser ? "Within Timeline" : "Under SLA";
            String underSlaDesc = isCitizenUser ? "Comfortable timeline" : "Within time limit";
            String completingSlaTitle = isCitizenUser ? "Action Needed Soon" : "Completing SLA";
            String completingSlaDesc = isCitizenUser ? "Due within 48 hours" : "Due in &le; 48 hours";
            String overSlaTitle = isCitizenUser ? "Overdue Applications" : "Over SLA";
            String overSlaDesc = isCitizenUser ? "Timeline exceeded" : "Statutory deadline breached";

            String slaMetricsSection = "              <!-- SLA Performance Breakdown Grid -->\r\n" +
                    "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin:0 0 24px 0;\">\r\n" +
                    "                <tr>\r\n" +
                    "                  <td class=\"kpi-col\" width=\"31%\" style=\"background-color:#f0fdf4; border:1px solid #bbf7d0; border-top:3px solid #16a34a; padding:12px 14px; vertical-align:top;\">\r\n" +
                    "                    <div style=\"font-size:10.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:#15803d; margin-bottom:4px;\">" + underSlaTitle + "</div>\r\n" +
                    "                    <div style=\"font-size:24px; font-weight:bold; color:#166534; line-height:1.1; margin-bottom:3px;\">" + underSlaStr + "</div>\r\n" +
                    "                    <div style=\"font-size:11px; color:#16a34a;\">" + underSlaDesc + "</div>\r\n" +
                    "                  </td>\r\n" +
                    "                  <td class=\"kpi-spacer\" width=\"3%\" style=\"font-size:0; line-height:0;\">&nbsp;</td>\r\n" +
                    "                  <td class=\"kpi-col\" width=\"32%\" style=\"background-color:#fffbeb; border:1px solid #fde68a; border-top:3px solid #d97706; padding:12px 14px; vertical-align:top;\">\r\n" +
                    "                    <div style=\"font-size:10.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:#b45309; margin-bottom:4px;\">" + completingSlaTitle + "</div>\r\n" +
                    "                    <div style=\"font-size:24px; font-weight:bold; color:#92400e; line-height:1.1; margin-bottom:3px;\">" + completingSlaStr + "</div>\r\n" +
                    "                    <div style=\"font-size:11px; color:#d97706;\">" + completingSlaDesc + "</div>\r\n" +
                    "                  </td>\r\n" +
                    "                  <td class=\"kpi-spacer\" width=\"3%\" style=\"font-size:0; line-height:0;\">&nbsp;</td>\r\n" +
                    "                  <td class=\"kpi-col\" width=\"31%\" style=\"background-color:#fef2f2; border:1px solid #fecaca; border-top:3px solid #dc2626; padding:12px 14px; vertical-align:top;\">\r\n" +
                    "                    <div style=\"font-size:10.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:#b91c1c; margin-bottom:4px;\">" + overSlaTitle + "</div>\r\n" +
                    "                    <div style=\"font-size:24px; font-weight:bold; color:#991b1b; line-height:1.1; margin-bottom:3px;\">" + overSlaStr + "</div>\r\n" +
                    "                    <div style=\"font-size:11px; color:#dc2626;\">" + overSlaDesc + "</div>\r\n" +
                    "                  </td>\r\n" +
                    "                </tr>\r\n" +
                    "              </table>\r\n";

            String emailBody = emailTemplate
                    .replace("{1}", escapeHtml(StringUtils.defaultString(assigneeName)))
                    .replace("{2}", escapeHtml(StringUtils.defaultString(totalCount)))
                    .replace("{3}", escapeHtml(StringUtils.defaultString(servicesCount)))
                    .replace("{4}", tableRows.toString())
                    .replace("{5}", escapeHtml(StringUtils.defaultString(currentDate)))
                    .replace("{6}", escapeHtml(StringUtils.defaultString(portalUrl)))
                    .replace("{7}", escapeHtml(buttonLabel))
                    .replace("{8}", advisoryHeading)
                    .replace("{9}", advisoryText)
                    .replace("{10}", introText)
                    .replace("{11}", metricSubtitle)
                    .replace("{12}", underSlaStr)
                    .replace("{13}", completingSlaStr)
                    .replace("{14}", overSlaStr)
                    .replace("{SLA_METRICS_SECTION}", slaMetricsSection);

            if (!emailBody.contains(slaMetricsSection) && !emailBody.contains("{12}")) {
                if (emailBody.contains("<!-- Service Breakdown Table -->")) {
                    emailBody = emailBody.replace("<!-- Service Breakdown Table -->", slaMetricsSection + "              <!-- Service Breakdown Table -->");
                }
            }

            // Defensive and strict role-isolation replacements to guarantee ZERO cross-role leakage
            if (isCitizenUser) {
                // 1. Intro text replacement if template has hardcoded employee intro
                emailBody = emailBody.replace(
                        "This is to place before you the daily pendency report of municipal workflow applications currently assigned to your queue on the <strong>mSeva Punjab</strong> portal. You are requested to review the pending cases listed below and ensure timely scrutiny, approval, or onward disposal.",
                        introText);
                emailBody = Pattern.compile("This is to place before you the daily pendency report.*?timely scrutiny, approval, or onward disposal\\.", Pattern.DOTALL)
                        .matcher(emailBody)
                        .replaceAll(Matcher.quoteReplacement(introText));

                // 2. Metric subtitle replacement if template has hardcoded queue text
                emailBody = emailBody.replace("Awaiting action in your queue", metricSubtitle);

                // 3. Advisory box replacements if template has hardcoded employee RTS advisory
                emailBody = emailBody.replace("STATUTORY SLA &amp; CITIZEN CHARTER ADVISORY", advisoryHeading);
                emailBody = emailBody.replace("STATUTORY SLA & CITIZEN CHARTER ADVISORY", advisoryHeading);
                emailBody = Pattern.compile("Under the Punjab Transparency in Delivery of Public Services.*?disposal are requested\\.?", Pattern.DOTALL)
                        .matcher(emailBody)
                        .replaceAll(Matcher.quoteReplacement(advisoryText));

                // 4. Button label replacement if template has hardcoded employee button
                emailBody = Pattern.compile("Access\\s+mSeva\\s+Employee\\s+Portal", Pattern.CASE_INSENSITIVE)
                        .matcher(emailBody)
                        .replaceAll(Matcher.quoteReplacement(buttonLabel));

                // 5. Header / subtitle cleanup
                emailBody = emailBody.replace("Official Employee Portal", "Citizen Services Portal");
                emailBody = emailBody.replace("Employee Portal", "Citizen Portal");
                emailBody = emailBody.replace("employee portal", "citizen portal");

                // 6. Strict role isolation guarantee: Ensure word 'employee' or 'officer' never appears anywhere in the citizen email
                emailBody = Pattern.compile("\\bEmployee\\b").matcher(emailBody).replaceAll("Citizen");
                emailBody = Pattern.compile("\\bemployee\\b").matcher(emailBody).replaceAll("citizen");
                emailBody = Pattern.compile("\\bOfficer\\b").matcher(emailBody).replaceAll("Applicant");
                emailBody = Pattern.compile("\\bofficer\\b").matcher(emailBody).replaceAll("applicant");
            } else {
                // EMPLOYEE CASE:
                // 1. Advisory heading: Replace 'CITIZEN CHARTER' with 'RTS WORKFLOW ADVISORY'
                emailBody = emailBody.replace("STATUTORY SLA &amp; CITIZEN CHARTER ADVISORY", advisoryHeading);
                emailBody = emailBody.replace("STATUTORY SLA & CITIZEN CHARTER ADVISORY", advisoryHeading);
                emailBody = emailBody.replace("CITIZEN CHARTER", "RTS CHARTER");
                emailBody = emailBody.replace("Citizen Charter", "RTS Charter");
                emailBody = emailBody.replace("citizen charter", "RTS charter");

                // 2. Button label: Ensure employee button
                emailBody = Pattern.compile("Access\\s+mSeva\\s+Citizen\\s+Portal", Pattern.CASE_INSENSITIVE)
                        .matcher(emailBody)
                        .replaceAll(Matcher.quoteReplacement(buttonLabel));

                // 3. Header / subtitle cleanup
                emailBody = emailBody.replace("Citizen Services Portal", "Official Employee Portal");
                emailBody = emailBody.replace("Citizen Portal", "Employee Portal");
                emailBody = emailBody.replace("citizen portal", "employee portal");

                // 4. Strict role isolation guarantee: Ensure word 'citizen' or 'applicant' never appears anywhere in the employee email
                emailBody = Pattern.compile("\\bCitizen\\b").matcher(emailBody).replaceAll("Employee");
                emailBody = Pattern.compile("\\bcitizen\\b").matcher(emailBody).replaceAll("employee");
                emailBody = Pattern.compile("\\bApplicant\\b").matcher(emailBody).replaceAll("Employee");
                emailBody = Pattern.compile("\\bapplicant\\b").matcher(emailBody).replaceAll("employee");
            }

            String subject = isCitizenUser
                    ? "Action Required: " + totalCount + " Pending Application(s) on mSeva Punjab"
                    : "Official Daily Pendency Report: " + totalCount + " Pending Application(s) in Your Queue | mSeva Punjab";

            Email email = Email.builder()
                    .emailTo(Collections.singleton(emailId))
                    .isHTML(true)
                    .body(emailBody)
                    .subject(subject)
                    .build();

            EmailRequest emailRequest = EmailRequest.builder()
                    .requestInfo(requestInfo)
                    .email(email)
                    .build();

            producer.push(config.getEmailNotifTopic(), emailRequest);
            log.info("Workflow digest Email pushed to topic {} for email: {}, isCitizen: {}, total applications: {}",
                    config.getEmailNotifTopic(), emailId, isCitizenUser, totalCount);
        } catch (Exception e) {
            log.error("Failed to send workflow digest Email to email: {}", emailId, e);
        }
    }

    /**
     * Checks if the user is a citizen based on user type or roles.
     */
    public boolean isCitizen(User user) {
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
     * Resolves the display name of the assignee in proper Title Case (e.g. 'Om Aditya Dutta').
     * If name is not provided, defaults to 'Citizen' for citizen users or 'Employee' for employees.
     */
    private String getAssigneeName(User assignee) {
        if (assignee != null && StringUtils.isNotBlank(assignee.getName())) {
            return toTitleCase(assignee.getName().trim());
        }
        if (assignee != null && StringUtils.isNotBlank(assignee.getUserName())) {
            return toTitleCase(assignee.getUserName().trim());
        }
        if (isCitizen(assignee)) {
            return "Citizen";
        }
        return "Employee";
    }

    /**
     * Converts a full name or phrase to Title Case where each word starts with a capital letter.
     * E.g. 'om aditya dutta' -> 'Om Aditya Dutta', 'AMIT SHARMA' -> 'Amit Sharma'.
     */
    public static String toTitleCase(String text) {
        if (StringUtils.isBlank(text)) {
            return text;
        }
        String[] words = text.trim().split("\\s+");
        StringBuilder titleCase = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) continue;
            if (titleCase.length() > 0) {
                titleCase.append(" ");
            }
            titleCase.append(Character.toTitleCase(word.charAt(0)));
            if (word.length() > 1) {
                titleCase.append(word.substring(1).toLowerCase());
            }
        }
        return titleCase.toString();
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
