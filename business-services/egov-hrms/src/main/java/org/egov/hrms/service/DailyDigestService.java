package org.egov.hrms.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.hrms.model.DailyDigestReport;
import org.egov.hrms.model.EmailRequest;
import org.egov.hrms.model.EmployeeEmailRecipient;
import org.egov.hrms.model.PendingTaskSummary;
import org.egov.hrms.producer.HRMSProducer;
import org.egov.hrms.repository.DailyDigestRepository;
import org.egov.hrms.utils.HRMSConstants;
import org.egov.hrms.utils.ResponseInfoFactory;
import org.egov.hrms.web.contract.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Slf4j
public class DailyDigestService {

    public static final String MSG_CODE_DIGEST_EMAIL_SUBJECT = "hrms.employee.daily.digest.email.subject";
    public static final String MSG_CODE_DIGEST_EMAIL_BODY = "hrms.employee.daily.digest.email.body";

    @Autowired
    private DailyDigestRepository dailyDigestRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private HRMSProducer hrmsProducer;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @Value("${state.level.tenant.id:pb}")
    private String stateLevelTenantId;

    @Value("${kafka.topics.notification.email}")
    private String notificationEmailTopic;

    @Value("${egov.hrms.daily.digest.batch.size:100}")
    private int dailyDigestBatchSize;

    @Value("${egov.hrms.daily.digest.batch.delay.ms:50}")
    private long dailyDigestBatchDelayMs;

    @Value("${egov.hrms.employee.app.link}")
    private String employeeAppLink;

    /**
     * Aggregates pending application counts across all workflow modules,
     * resolves decrypted employee contact details via egov-user service,
     * fetches email template from the localization 'message' table,
     * and streams responsive HTML digest emails to the Kafka notification topic.
     *
     * @param requestInfo RequestInfo payload (enriched with system context if needed)
     * @param tenantId    Target tenant (defaults to state-level tenant if null)
     * @return Execution report with process counts and timings
     */
    public DailyDigestReport sendDailyPendingApplicationDigest(RequestInfo requestInfo, String tenantId) {
        long startTime = System.currentTimeMillis();
        String targetTenantId = (!StringUtils.isEmpty(tenantId))
                ? tenantId
                : stateLevelTenantId;

        log.info("Starting Daily Pending Application Digest process for tenant: {}", targetTenantId);

        // Step 1: Bulk aggregation query on workflow table (single query, non-blocking)
        Map<String, List<PendingTaskSummary>> pendingTasksByAssignee =
                dailyDigestRepository.fetchPendingTaskCountsByAssignee(targetTenantId);

        int totalEmployeesWithPendingTasks = pendingTasksByAssignee.size();
        log.info("Found {} employees with pending applications in workflow.", totalEmployeesWithPendingTasks);

        if (totalEmployeesWithPendingTasks == 0) {
            return DailyDigestReport.builder()
                    .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfo, true))
                    .totalEmployeesWithPendingTasks(0)
                    .totalEmailsDispatched(0)
                    .totalSkippedWithoutEmail(0)
                    .executionTimeMillis(System.currentTimeMillis() - startTime)
                    .status("SUCCESS")
                    .message("No pending applications found for digest dispatch.")
                    .build();
        }

        // Step 2: Fetch localized email templates (from message table via localization service / DB fallback)
        Map<String, String> templates = resolveEmailTemplates(requestInfo, targetTenantId);
        String bodyTemplate = templates.get(MSG_CODE_DIGEST_EMAIL_BODY);
        String subjectTemplate = templates.get(MSG_CODE_DIGEST_EMAIL_SUBJECT);

        // Step 3: Resolve and decrypt employee details via egov-user service
        Map<String, EmployeeEmailRecipient> activeRecipients =
                resolveAndDecryptRecipients(requestInfo, pendingTasksByAssignee.keySet(), targetTenantId);

        int emailsDispatched = 0;
        int skippedWithoutEmail = 0;
        int batchCounter = 0;

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMMM yyyy");
        String formattedDate = dateFormat.format(new Date());

        // Step 4: Stream and publish email notifications in controlled batches
        for (Map.Entry<String, List<PendingTaskSummary>> entry : pendingTasksByAssignee.entrySet()) {
            String assigneeUuid = entry.getKey();
            List<PendingTaskSummary> tasks = entry.getValue();

            EmployeeEmailRecipient recipient = activeRecipients.get(assigneeUuid);
            if (recipient == null || !isValidEmail(recipient.getEmailId())) {
                skippedWithoutEmail++;
                continue;
            }

            int totalPendingForEmployee = tasks.stream().mapToInt(PendingTaskSummary::getPendingCount).sum();
            if (totalPendingForEmployee == 0) {
                continue;
            }

            String cleanEmail = recipient.getEmailId().trim();
            String summaryModuleName = getSummaryModuleName(tasks);
            String subject = buildEmailSubject(subjectTemplate, totalPendingForEmployee, summaryModuleName, formattedDate);
            String htmlBody = buildHtmlEmailBody(bodyTemplate, recipient, tasks, totalPendingForEmployee, formattedDate);

            // Construct EmailRequest compatible with egov-notification-mail Email contract
            EmailRequest emailRequest = EmailRequest.builder()
                    .emailTo(Collections.singleton(cleanEmail))
                    .email(cleanEmail)
                    .subject(subject)
                    .body(htmlBody)
                    .isHTML(true)
                    .build();

            // Push to Kafka email topic
            log.info("Dispatching daily digest email for employee: {} ({}) with {} pending applications to {}",
                    recipient.getName(), recipient.getTenantId(), totalPendingForEmployee, cleanEmail);
            hrmsProducer.push(notificationEmailTopic, cleanEmail, emailRequest);
            emailsDispatched++;
            batchCounter++;

            // Throttling: brief pause between batches to protect Kafka/JVM resources
            if (batchCounter >= dailyDigestBatchSize) {
                batchCounter = 0;
                try {
                    Thread.sleep(dailyDigestBatchDelayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Throttling sleep interrupted during daily digest batch processing.");
                }
            }
        }

        long executionTime = System.currentTimeMillis() - startTime;
        log.info("Completed Daily Digest. Total pending assignees: {}, Emails dispatched: {}, Skipped (no email): {}, Time taken: {}ms",
                totalEmployeesWithPendingTasks, emailsDispatched, skippedWithoutEmail, executionTime);

        return DailyDigestReport.builder()
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfo, true))
                .totalEmployeesWithPendingTasks(totalEmployeesWithPendingTasks)
                .totalEmailsDispatched(emailsDispatched)
                .totalSkippedWithoutEmail(skippedWithoutEmail)
                .executionTimeMillis(executionTime)
                .status("SUCCESS")
                .message("Daily digest notifications dispatched successfully.")
                .build();
    }

    /**
     * Fetches templates from localization service (standard DIGIT flow).
     * Falls back directly to the 'message' table in the database if not yet cached in the service.
     */
    private Map<String, String> resolveEmailTemplates(RequestInfo requestInfo, String targetTenantId) {
        Map<String, String> templates = new HashMap<>();
        String stateTenant = targetTenantId.split("\\.")[0];

        // 1. Fetch via localization service
        try {
            Map<String, Map<String, String>> localizedMessages =
                    notificationService.getLocalisedMessages(requestInfo, stateTenant,
                            HRMSConstants.HRMS_LOCALIZATION_ENG_LOCALE_CODE,
                            HRMSConstants.HRMS_LOCALIZATION_MODULE_CODE);
            if (localizedMessages != null) {
                Map<String, String> map = localizedMessages.get(
                        HRMSConstants.HRMS_LOCALIZATION_ENG_LOCALE_CODE + "|" + stateTenant);
                if (map != null) {
                    if (map.containsKey(MSG_CODE_DIGEST_EMAIL_BODY)) {
                        templates.put(MSG_CODE_DIGEST_EMAIL_BODY, map.get(MSG_CODE_DIGEST_EMAIL_BODY));
                    }
                    if (map.containsKey(MSG_CODE_DIGEST_EMAIL_SUBJECT)) {
                        templates.put(MSG_CODE_DIGEST_EMAIL_SUBJECT, map.get(MSG_CODE_DIGEST_EMAIL_SUBJECT));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch templates from localization service: {}", e.getMessage());
        }

        // 2. Fallback to direct DB query on 'message' table
        if (!templates.containsKey(MSG_CODE_DIGEST_EMAIL_BODY)) {
            String dbBody = dailyDigestRepository.fetchLocalizationMessage(
                    MSG_CODE_DIGEST_EMAIL_BODY, stateTenant,
                    HRMSConstants.HRMS_LOCALIZATION_ENG_LOCALE_CODE,
                    HRMSConstants.HRMS_LOCALIZATION_MODULE_CODE);
            if (dbBody != null) {
                templates.put(MSG_CODE_DIGEST_EMAIL_BODY, dbBody);
                log.info("Fetched daily digest email body template directly from message table.");
            }
        }
        if (!templates.containsKey(MSG_CODE_DIGEST_EMAIL_SUBJECT)) {
            String dbSubject = dailyDigestRepository.fetchLocalizationMessage(
                    MSG_CODE_DIGEST_EMAIL_SUBJECT, stateTenant,
                    HRMSConstants.HRMS_LOCALIZATION_ENG_LOCALE_CODE,
                    HRMSConstants.HRMS_LOCALIZATION_MODULE_CODE);
            if (dbSubject != null) {
                templates.put(MSG_CODE_DIGEST_EMAIL_SUBJECT, dbSubject);
                log.info("Fetched daily digest email subject template directly from message table.");
            }
        }

        return templates;
    }

    /**
     * Resolves employee details and decrypts PII using egov-user service.
     * Batches requests in chunks of 50 to prevent HTTP payload size issues.
     */
    private Map<String, EmployeeEmailRecipient> resolveAndDecryptRecipients(RequestInfo originalRequestInfo,
                                                                           Set<String> assigneeUuids,
                                                                           String tenantId) {
        Map<String, EmployeeEmailRecipient> recipientMap = new HashMap<>();
        if (CollectionUtils.isEmpty(assigneeUuids)) {
            return recipientMap;
        }

        RequestInfo internalRequestInfo = enrichWithInternalServiceRole(originalRequestInfo, tenantId);
        List<String> uuidList = new ArrayList<>(assigneeUuids);
        int chunkSize = 50;

        for (int i = 0; i < uuidList.size(); i += chunkSize) {
            List<String> chunk = uuidList.subList(i, Math.min(i + chunkSize, uuidList.size()));

            Map<String, Object> searchCriteria = new HashMap<>();
            searchCriteria.put("uuid", chunk);

            try {
                UserResponse userResponse = userService.getUser(internalRequestInfo, searchCriteria);
                if (userResponse != null && !CollectionUtils.isEmpty(userResponse.getUser())) {
                    for (org.egov.hrms.web.contract.User u : userResponse.getUser()) {
                        if (u.getActive() == null || Boolean.TRUE.equals(u.getActive())) {
                            String email = u.getEmailId();
                            String name = formatEmployeeName(u.getName());

                            EmployeeEmailRecipient recipient = EmployeeEmailRecipient.builder()
                                    .uuid(u.getUuid())
                                    .name(name)
                                    .emailId(email)
                                    .mobileNumber(u.getMobileNumber())
                                    .tenantId(u.getTenantId())
                                    .build();

                            recipientMap.put(u.getUuid(), recipient);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch decrypted users chunk from UserService: ", e);
            }
        }

        log.info("Resolved {} decrypted user records from UserService for {} assignees.",
                recipientMap.size(), assigneeUuids.size());

        Set<String> missingUuids = new HashSet<>(assigneeUuids);
        missingUuids.removeAll(recipientMap.keySet());
        if (!missingUuids.isEmpty()) {
            Map<String, EmployeeEmailRecipient> dbFallbacks =
                    dailyDigestRepository.fetchActiveEmployeesWithEmail(missingUuids);
            for (Map.Entry<String, EmployeeEmailRecipient> entry : dbFallbacks.entrySet()) {
                EmployeeEmailRecipient r = entry.getValue();
                r.setName(formatEmployeeName(r.getName()));
                recipientMap.put(entry.getKey(), r);
            }
        }

        return recipientMap;
    }

    private RequestInfo enrichWithInternalServiceRole(RequestInfo original, String tenantId) {
        RequestInfo reqInfo = new RequestInfo();
        if (original != null) {
            reqInfo.setApiId(original.getApiId());
            reqInfo.setVer(original.getVer());
            reqInfo.setTs(original.getTs());
            reqInfo.setAction(original.getAction());
            reqInfo.setDid(original.getDid());
            reqInfo.setKey(original.getKey());
            reqInfo.setMsgId(original.getMsgId());
            reqInfo.setAuthToken(original.getAuthToken());
            reqInfo.setCorrelationId(original.getCorrelationId());
        }

        String effectiveTenant = (tenantId != null && !tenantId.trim().isEmpty())
                ? tenantId
                : stateLevelTenantId;

        Role role = Role.builder()
                .name(HRMSConstants.INTERNALMICROSERVICEROLE_NAME)
                .code(HRMSConstants.INTERNALMICROSERVICEROLE_CODE)
                .tenantId(effectiveTenant)
                .build();

        User internalUser = User.builder()
                .uuid(UUID.randomUUID().toString())
                .type(HRMSConstants.INTERNALMICROSERVICEUSER_TYPE)
                .roles(Collections.singletonList(role))
                .id(0L)
                .build();

        reqInfo.setUserInfo(internalUser);
        return reqInfo;
    }

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        String trimmed = email.trim();
        if (trimmed.isEmpty() || trimmed.contains("|")) {
            return false;
        }
        return trimmed.contains("@") && trimmed.contains(".");
    }

    private String formatEmployeeName(String name) {
        if (name == null || name.trim().isEmpty() || name.contains("|")) {
            return "Officer";
        }
        return name.trim();
    }

    private String getSummaryModuleName(List<PendingTaskSummary> tasks) {
        if (CollectionUtils.isEmpty(tasks)) return "Citizen Service";
        Set<String> moduleNames = new LinkedHashSet<>();
        for (PendingTaskSummary task : tasks) {
            moduleNames.add(formatModuleName(task.getBusinessService()));
        }
        return String.join(", ", moduleNames);
    }

    private String buildEmailSubject(String subjectTemplate, int totalPending, String moduleName, String formattedDate) {
        if (!StringUtils.isEmpty(subjectTemplate)) {
            return subjectTemplate
                    .replace("{{PENDING_COUNT}}", String.valueOf(totalPending))
                    .replace("$totalPending", String.valueOf(totalPending))
                    .replace("{{MODULE_NAME}}", moduleName)
                    .replace("$moduleName", moduleName)
                    .replace("{{DATE}}", formattedDate)
                    .replace("$date", formattedDate);
        }
        return String.format("Action Required – Pending %s Application [%d Items Pending]", moduleName, totalPending);
    }

    /**
     * Builds HTML email body by injecting values into the official template fetched from the 'message' table.
     */
    private String buildHtmlEmailBody(String bodyTemplate,
                                      EmployeeEmailRecipient recipient,
                                      List<PendingTaskSummary> tasks,
                                      int totalPending,
                                      String formattedDate) {
        String employeeName = formatEmployeeName(recipient.getName());
        String loginUrl = (employeeAppLink != null)
                ? employeeAppLink : "https://mseva.lgpunjab.gov.in/employee/user/login";
        int currentYear = Calendar.getInstance().get(Calendar.YEAR);

        int totalOverdue = tasks.stream().mapToInt(PendingTaskSummary::getOverdueCount).sum();
        int totalDueSoon = tasks.stream().mapToInt(PendingTaskSummary::getDueSoonCount).sum();
        int totalWithinSla = tasks.stream().mapToInt(PendingTaskSummary::getWithinSlaCount).sum();

        StringBuilder rowsHtml = new StringBuilder();
        Set<String> moduleNames = new LinkedHashSet<>();
        Set<String> statusNames = new LinkedHashSet<>();

        for (PendingTaskSummary task : tasks) {
            String moduleName = formatModuleName(task.getBusinessService());
            String statusName = formatStatusName(task.getStatus());
            moduleNames.add(moduleName);
            statusNames.add(statusName);

            rowsHtml.append("<tr>");
            rowsHtml.append("<td style=\"border:1px solid #cbd5e1; padding:10px 12px; font-size:12.5px; color:#374151;\" class=\"dm-cell dm-border\">")
                    .append(moduleName).append("</td>");
            rowsHtml.append("<td style=\"border:1px solid #cbd5e1; padding:10px 12px; font-size:12.5px; color:#374151;\" class=\"dm-cell dm-border\">")
                    .append("<span style=\"display:inline-block; background-color:#f1f5f9; color:#334155; font-size:11px; font-weight:700; letter-spacing:0.3px; padding:3px 8px; border-radius:2px;\">")
                    .append(statusName).append("</span></td>");
            rowsHtml.append("<td align=\"center\" style=\"border:1px solid #cbd5e1; padding:10px 8px; font-size:12.5px; font-weight:700; color:#dc2626;\" class=\"dm-cell dm-border\">")
                    .append(task.getOverdueCount()).append("</td>");
            rowsHtml.append("<td align=\"center\" style=\"border:1px solid #cbd5e1; padding:10px 8px; font-size:12.5px; font-weight:700; color:#d97706;\" class=\"dm-cell dm-border\">")
                    .append(task.getDueSoonCount()).append("</td>");
            rowsHtml.append("<td align=\"center\" style=\"border:1px solid #cbd5e1; padding:10px 8px; font-size:12.5px; font-weight:700; color:#16a34a;\" class=\"dm-cell dm-border\">")
                    .append(task.getWithinSlaCount()).append("</td>");
            rowsHtml.append("<td align=\"center\" style=\"border:1px solid #cbd5e1; padding:10px 8px; font-size:13px; font-weight:800; color:#0f172a;\" class=\"dm-cell dm-border\">")
                    .append(task.getPendingCount()).append("</td>");
            rowsHtml.append("</tr>");
        }

        String summaryModuleName = String.join(", ", moduleNames);
        String summaryStatusName = (statusNames.size() == 1)
                ? statusNames.iterator().next()
                : "Pending Action";

        if (!StringUtils.isEmpty(bodyTemplate)) {
            return bodyTemplate
                    .replace("{{PENDING_COUNT}}", String.valueOf(totalPending))
                    .replace("$totalPending", String.valueOf(totalPending))
                    .replace("{{OVERDUE_COUNT}}", String.valueOf(totalOverdue))
                    .replace("$overdueCount", String.valueOf(totalOverdue))
                    .replace("{{DUE_SOON_COUNT}}", String.valueOf(totalDueSoon))
                    .replace("$dueSoonCount", String.valueOf(totalDueSoon))
                    .replace("{{WITHIN_SLA_COUNT}}", String.valueOf(totalWithinSla))
                    .replace("$withinSlaCount", String.valueOf(totalWithinSla))
                    .replace("{{MODULE_NAME}}", summaryModuleName)
                    .replace("$moduleName", summaryModuleName)
                    .replace("{{APPLICATION_STATUS}}", summaryStatusName)
                    .replace("$applicationStatus", summaryStatusName)
                    .replace("{{DATE}}", formattedDate)
                    .replace("$date", formattedDate)
                    .replace("{{RECIPIENT_NAME}}", employeeName)
                    .replace("$employeeName", employeeName)
                    .replace("{{EMPLOYEE_INBOX_URL}}", loginUrl)
                    .replace("$appLink", loginUrl)
                    .replace("{{CURRENT_YEAR}}", String.valueOf(currentYear))
                    .replace("$year", String.valueOf(currentYear))
                    .replace("{{TABLE_ROWS}}", rowsHtml.toString())
                    .replace("$tableRows", rowsHtml.toString());
        }

        return rowsHtml.toString();
    }

    private String formatModuleName(String businessService) {
        if (businessService == null) return "General";
        switch (businessService.toUpperCase()) {
            case "TL":
            case "NEWTL": return "Trade License";
            case "PT": return "Property Tax";
            case "BPA": return "Building Permission";
            case "WS": return "Water Connection";
            case "SW": return "Sewerage Connection";
            case "PGR": return "Public Grievance";
            case "FIRENOC": return "Fire NOC";
            case "CLU_MC_HIGH":
            case "CLU_NP":
            case "CLU_NP_HIGH": return "Change of Land Use";
            case "LAYOUT_MCL_ABV":
            case "LAYOUT_MCO_ABV": return "Layout Approval";
            case "NDC-SERVICES": return "No Dues Certificate";
            default: return businessService;
        }
    }

    private String formatStatusName(String status) {
        if (status == null) return "Pending Action";
        if (status.matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")) {
            return "Pending Action";
        }
        return status.replace("_", " ").trim();
    }
}
