package org.egov.wf.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.WorKflowRepository;
import org.egov.wf.util.EscalationUtil;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceReminderCriteria;
import org.egov.wf.web.models.UserWorkloadDigest;
import org.egov.wf.web.models.WorkflowReminderRequest;
import org.egov.wf.web.models.WorkflowReminderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class WorkflowReminderService {

    @Autowired
    private WorKflowRepository workflowRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private WorkflowNotificationService notificationService;

    @Autowired
    private WorkflowConfig config;

    @Autowired
    private MDMSService mdmsService;

    @Autowired
    private EscalationUtil escalationUtil;

    private final AtomicBoolean isReminderRunning = new AtomicBoolean(false);
    private final AtomicBoolean isCancelRequested = new AtomicBoolean(false);
    private final AtomicLong jobStartTime = new AtomicLong(0L);
    private volatile Thread activeWorkerThread;

    /**
     * Entry point for triggering reminders. Runs asynchronously on a low-priority daemon thread (default)
     * or synchronously for testing. Prevents concurrent executions using an atomic flag with automatic
     * stale lock expiry and manual force override capabilities.
     *
     * @param request WorkflowReminderRequest containing criteria, optional tenantId, force flag, and async flag
     * @return WorkflowReminderResponse containing status, message, and diagnostic SLA metrics
     */
    public WorkflowReminderResponse triggerDailyReminders(WorkflowReminderRequest request) {
        if (config != null && Boolean.FALSE.equals(config.getIsReminderEnabled())) {
            log.info("Workflow daily reminders are disabled in configuration.");
            return WorkflowReminderResponse.builder()
                    .status("DISABLED")
                    .message("Workflow daily reminder notifications are currently disabled in configuration.")
                    .build();
        }

        long timeoutMs = (config != null && config.getReminderLockTimeoutMinutes() != null && config.getReminderLockTimeoutMinutes() > 0)
                ? config.getReminderLockTimeoutMinutes() * 60 * 1000L
                : 15 * 60 * 1000L;

        boolean isForce = request != null && Boolean.TRUE.equals(request.getForce());

        // Check if previous job is running or stale
        if (isReminderRunning.get()) {
            long runningDuration = System.currentTimeMillis() - jobStartTime.get();
            if (isForce) {
                log.warn("Force execution requested. Overriding existing reminder job lock (held for {} ms).", runningDuration);
                resetReminderJob();
            } else if (runningDuration > timeoutMs) {
                log.warn("Previous reminder job appears hung or stale (running for {} ms > threshold {} ms). Forcing automatic lock reset.",
                        runningDuration, timeoutMs);
                resetReminderJob();
            } else {
                long runningSeconds = Math.max(1, runningDuration / 1000);
                log.warn("A workflow reminder job is already running (running for {}s). Skipping duplicate trigger.", runningSeconds);
                return WorkflowReminderResponse.builder()
                        .status("ALREADY_RUNNING")
                        .message("Workflow daily reminder job is already in progress (running for " + runningSeconds
                                + "s). Please wait for it to finish, pass force=true to override, or call /process/_resetreminder.")
                        .build();
            }
        }

        if (!isReminderRunning.compareAndSet(false, true)) {
            log.warn("Concurrent trigger contention detected. Another reminder job acquired the lock.");
            return WorkflowReminderResponse.builder()
                    .status("ALREADY_RUNNING")
                    .message("Workflow daily reminder job is already in progress. Please wait for it to finish.")
                    .build();
        }

        jobStartTime.set(System.currentTimeMillis());
        isCancelRequested.set(false);
        boolean isAsync = request == null || request.getAsync() == null || Boolean.TRUE.equals(request.getAsync());

        Map<String, UserWorkloadDigest> userDigestMap;
        WorkflowReminderResponse response;

        try {
            ProcessInstanceReminderCriteria criteria = ProcessInstanceReminderCriteria.builder()
                    .tenantId(request != null ? request.getTenantId() : null)
                    .businessService(request != null ? request.getBusinessService() : null)
                    .businessServices(request != null ? request.getBusinessServices() : null)
                    .assignee(request != null ? request.getAssignee() : null)
                    .force(isForce)
                    .build();

            userDigestMap = workflowRepository.getActiveWorkloadSummary(criteria);
            int totalEmployees = (userDigestMap != null) ? userDigestMap.size() : 0;
            int totalApplications = (userDigestMap != null)
                    ? userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getTotalApplications).sum() : 0;
            int totalUnderSla = (userDigestMap != null)
                    ? userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getUnderSlaCount).sum() : 0;
            int totalCompletingSla = (userDigestMap != null)
                    ? userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getCompletingSlaCount).sum() : 0;
            int totalOverSla = (userDigestMap != null)
                    ? userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getOverSlaCount).sum() : 0;

            String message = isAsync
                    ? "Workflow daily reminder notifications triggered in background for " + totalEmployees + " user(s) with " + totalApplications + " pending application(s)."
                    : "Workflow daily reminder notifications dispatched successfully for " + totalEmployees + " user(s).";

            response = WorkflowReminderResponse.builder()
                    .status(isAsync ? "TRIGGERED" : "COMPLETED")
                    .message(message)
                    .totalProcessed(totalEmployees)
                    .totalApplications(totalApplications)
                    .totalUnderSla(totalUnderSla)
                    .totalCompletingSla(totalCompletingSla)
                    .totalOverSla(totalOverSla)
                    .build();
        } catch (Throwable t) {
            log.error("Failed during preparation phase of workflow reminder job. Releasing lock immediately: ", t);
            isReminderRunning.set(false);
            jobStartTime.set(0L);
            isCancelRequested.set(false);
            throw t;
        }

        if (isAsync) {
            final Map<String, UserWorkloadDigest> finalDigestMap = userDigestMap;
            activeWorkerThread = new Thread(() -> {
                try {
                    executeWorkloadDigestJobWithMap(request, finalDigestMap);
                } catch (Throwable t) {
                    log.error("Fatal exception in workflow reminder background worker: ", t);
                } finally {
                    isReminderRunning.set(false);
                    jobStartTime.set(0L);
                    isCancelRequested.set(false);
                    activeWorkerThread = null;
                    log.info("Workflow reminder background worker completed and released lock.");
                }
            }, "wf-reminder-worker");
            activeWorkerThread.setPriority(Thread.MIN_PRIORITY);
            activeWorkerThread.setDaemon(true);
            activeWorkerThread.start();
        } else {
            try {
                executeWorkloadDigestJobWithMap(request, userDigestMap);
            } catch (Throwable t) {
                log.error("Fatal exception during synchronous workflow reminder execution: ", t);
                throw t;
            } finally {
                isReminderRunning.set(false);
                jobStartTime.set(0L);
                isCancelRequested.set(false);
            }
        }

        return response;
    }

    /**
     * Forcibly resets the running state of the reminder job. Interrupts the worker thread if alive.
     *
     * @return true if a job was actively running and was reset, false otherwise
     */
    public boolean resetReminderJob() {
        boolean wasRunning = isReminderRunning.getAndSet(false);
        jobStartTime.set(0L);
        isCancelRequested.set(true);

        Thread worker = activeWorkerThread;
        if (worker != null && worker.isAlive()) {
            try {
                log.info("Interrupting active workflow reminder worker thread: {}", worker.getName());
                worker.interrupt();
            } catch (Exception e) {
                log.warn("Failed to interrupt active worker thread: ", e);
            }
        }
        activeWorkerThread = null;
        log.info("Workflow daily reminder lock has been reset. Was previously running: {}", wasRunning);
        return wasRunning;
    }

    /**
     * Gracefully signals the active reminder job to stop processing.
     */
    public boolean cancelReminderJob() {
        if (isReminderRunning.get()) {
            isCancelRequested.set(true);
            log.info("Cancellation requested for running workflow reminder job.");
            return true;
        }
        return false;
    }

    /**
     * Executes the daily reminder job. Defaults to the Consolidated Daily Workload Digest
     * (bifurcating by business service) to completely eliminate employee flooding and pod/DB choking.
     */
    public int executeReminderJob(WorkflowReminderRequest request) {
        if (config != null && Boolean.TRUE.equals(config.getIsReminderDigestEnabled())) {
            return executeWorkloadDigestJob(request);
        }
        return executeIndividualReminderJob(request);
    }

    /**
     * Consolidated Daily Workload Digest:
     * 1. Aggregates pending applications by assignee and business service via PostgreSQL GROUP BY.
     * 2. Sends exactly ONE Email and ONE SMS to each active employee with a bifurcated breakdown of their queue.
     * 3. Prevents flooding employees: An officer with 50 applications receives 1 clean digest, not 50 emails/SMS.
     * 4. Reduces statewide notification volume from ~40,000 down to ~1,000–1,500 messages total across Punjab.
     * 5. Protects downstream services with batch user profile lookup, localization caching, and Kafka throttling.
     */
    public int executeWorkloadDigestJob(WorkflowReminderRequest request) {
        return executeWorkloadDigestJobWithMap(request, null);
    }

    public int executeWorkloadDigestJobWithMap(WorkflowReminderRequest request, Map<String, UserWorkloadDigest> preloadedMap) {
        long startTime = System.currentTimeMillis();
        log.info("Starting workflow consolidated daily workload digest job across Punjab...");

        RequestInfo requestInfo = (request != null && request.getRequestInfo() != null)
                ? request.getRequestInfo()
                : new RequestInfo();

        long batchDelayMs = (config != null && config.getReminderBatchDelayMs() != null && config.getReminderBatchDelayMs() >= 0)
                ? config.getReminderBatchDelayMs()
                : 50L;

        Map<String, UserWorkloadDigest> userDigestMap = preloadedMap;
        if (userDigestMap == null) {
            ProcessInstanceReminderCriteria criteria = ProcessInstanceReminderCriteria.builder()
                    .tenantId(request != null ? request.getTenantId() : null)
                    .businessService(request != null ? request.getBusinessService() : null)
                    .businessServices(request != null ? request.getBusinessServices() : null)
                    .build();
            userDigestMap = workflowRepository.getActiveWorkloadSummary(criteria);
        }

        if (CollectionUtils.isEmpty(userDigestMap)) {
            log.info("No active assigned applications found for reminder digest. Exiting.");
            return 0;
        }

        int totalEmployees = userDigestMap.size();
        int totalApplications = userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getTotalApplications).sum();
        int totalUnderSla = userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getUnderSlaCount).sum();
        int totalCompletingSla = userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getCompletingSlaCount).sum();
        int totalOverSla = userDigestMap.values().stream().mapToInt(UserWorkloadDigest::getOverSlaCount).sum();

        log.info("Workload summary retrieved: {} active employee(s) with {} applications [Under SLA: {}, Completing SLA: {}, Over SLA: {}].",
                totalEmployees, totalApplications, totalUnderSla, totalCompletingSla, totalOverSla);

        // 2. Pre-fetch localization templates once for state tenant 'pb'
        String stateTenant = config != null ? config.getStateLevelTenantId() : "pb";
        String localizationJson = notificationService.getLocalizationMessages(stateTenant, requestInfo);
        String smsDigestCode = config != null ? config.getSmsDigestTemplateId() : "EG_WF_DIGEST_MSG";
        String emailDigestCode = config != null ? config.getEmailDigestTemplateId() : "EG_WF_DIGEST_EMAIL";
        String emailDigestCitizenCode = config != null ? config.getEmailDigestCitizenTemplateId() : "EG_WF_DIGEST_EMAIL_CITIZEN";

        String smsDigestTemplate = notificationService.getMessageTemplate(smsDigestCode, localizationJson);
        String emailDigestTemplate = notificationService.getMessageTemplate(emailDigestCode, localizationJson);
        String emailDigestCitizenTemplate = notificationService.getMessageTemplate(emailDigestCitizenCode, localizationJson);

        if (StringUtils.isBlank(smsDigestTemplate) && StringUtils.isBlank(emailDigestTemplate) && StringUtils.isBlank(emailDigestCitizenTemplate)) {
            log.debug("Neither digest SMS ('{}') nor Email ('{}') template configured in localization. Skipping.",
                    smsDigestCode, emailDigestCode);
            return 0;
        }

        // 3. Batch search users from User Service (in chunks of 100 UUIDs)
        List<String> allUuids = new ArrayList<>(userDigestMap.keySet());
        Map<String, User> userProfileMap = new HashMap<>();
        int userBatchSize = 100;
        for (int i = 0; i < allUuids.size(); i += userBatchSize) {
            if (isCancelRequested.get()) {
                log.info("Cancellation detected while resolving user profiles. Halting.");
                return 0;
            }
            int end = Math.min(i + userBatchSize, allUuids.size());
            List<String> uuidChunk = allUuids.subList(i, end);
            try {
                Map<String, User> chunkUsers = userService.searchUser(requestInfo, uuidChunk);
                if (chunkUsers != null) {
                    userProfileMap.putAll(chunkUsers);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch user profiles for chunk [{} - {}]: ", i, end, e);
            }
        }

        // 4. Dispatch exactly 1 consolidated digest per employee
        int totalDigestsSent = 0;
        for (Map.Entry<String, UserWorkloadDigest> entry : userDigestMap.entrySet()) {
            if (isCancelRequested.get()) {
                log.info("Cancellation detected during digest dispatching. Halting at employee #{}.", totalDigestsSent);
                break;
            }

            String userUuid = entry.getKey();
            UserWorkloadDigest digest = entry.getValue();
            User user = userProfileMap.get(userUuid);

            // Defensive fallback if user record is missing in User Service
            if (user == null) {
                user = User.builder().uuid(userUuid).build();
            }

            boolean isCitizen = notificationService.isCitizen(user);
            if (isCitizen) {
                digest.filterForCitizen();
                if (digest.getTotalApplications() <= 0) {
                    log.info("Skipping reminder digest for citizen {}: all pending application(s) have SLA passed by more than {} days.",
                            user.getUuid(), (config != null && config.getReminderCitizenSlaPassedMaxDays() != null) ? config.getReminderCitizenSlaPassedMaxDays() : 2);
                    continue;
                }
            }

            String targetEmailTemplate = emailDigestTemplate;
            if (isCitizen && StringUtils.isNotBlank(emailDigestCitizenTemplate)) {
                targetEmailTemplate = emailDigestCitizenTemplate;
            }

            notificationService.sendWorkloadDigestNotification(requestInfo, user, digest, smsDigestTemplate, targetEmailTemplate);
            totalDigestsSent++;

            // Throttle pause between employee digests to ensure smooth Kafka / SMS gateway delivery
            if (batchDelayMs > 0) {
                try {
                    Thread.sleep(batchDelayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Interrupted during digest throttling.");
                    break;
                }
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Workflow consolidated daily workload digest completed in {} ms. Sent digests to {} employee(s) representing {} total applications.",
                duration, totalDigestsSent, totalApplications);

        return totalDigestsSent;
    }

    /**
     * Individual Reminder Mode (fallback): Iterates ULB-by-ULB with keyset seek pagination and employee capping.
     */
    public int executeIndividualReminderJob(WorkflowReminderRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting individual workflow daily reminder job across Punjab ULBs...");

        RequestInfo requestInfo = (request != null && request.getRequestInfo() != null)
                ? request.getRequestInfo()
                : new RequestInfo();

        int batchSize = (config != null && config.getReminderBatchSize() != null && config.getReminderBatchSize() > 0)
                ? config.getReminderBatchSize()
                : 50;

        long batchDelayMs = (config != null && config.getReminderBatchDelayMs() != null && config.getReminderBatchDelayMs() >= 0)
                ? config.getReminderBatchDelayMs()
                : 100L;

        long tenantDelayMs = (config != null && config.getReminderTenantDelayMs() != null && config.getReminderTenantDelayMs() >= 0)
                ? config.getReminderTenantDelayMs()
                : 500L;

        int maxPerUser = (request != null && request.getMaxPerUser() != null)
                ? request.getMaxPerUser()
                : (config != null && config.getReminderMaxPerUser() != null ? config.getReminderMaxPerUser() : 1);

        List<String> targetTenants = resolveTargetTenants(requestInfo, request != null ? request.getTenantId() : null);
        log.info("Individual reminder will process {} target tenant(s). Batch size: {}, Max per user: {}",
                targetTenants.size(), batchSize, maxPerUser);

        Map<String, String> localizationJsonCache = new ConcurrentHashMap<>();
        Map<String, String> smsTemplateCache = new ConcurrentHashMap<>();
        Map<String, String> emailTemplateCache = new ConcurrentHashMap<>();
        Map<String, User> userCache = new ConcurrentHashMap<>();
        Map<String, Integer> userReminderCounts = new ConcurrentHashMap<>();

        int totalRemindersSent = 0;
        int totalTenantsProcessed = 0;

        try {
            for (String tenantId : targetTenants) {
                if (isCancelRequested.get()) {
                    log.info("Workflow reminder job cancellation detected. Halting further execution.");
                    break;
                }

                int tenantSent = processTenantApplications(requestInfo, tenantId, request, batchSize, batchDelayMs,
                        maxPerUser, localizationJsonCache, smsTemplateCache, emailTemplateCache, userCache, userReminderCounts);

                totalRemindersSent += tenantSent;
                totalTenantsProcessed++;

                if (tenantDelayMs > 0 && totalTenantsProcessed < targetTenants.size()) {
                    try {
                        Thread.sleep(tenantDelayMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Reminder job interrupted during inter-ULB throttling.");
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error occurred during workflow daily reminder execution: ", e);
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Individual daily reminder job completed in {} ms. Processed {} ULBs, sent {} reminders across {} employees.",
                duration, totalTenantsProcessed, totalRemindersSent, userReminderCounts.size());

        return totalRemindersSent;
    }

    private int processTenantApplications(RequestInfo requestInfo, String tenantId, WorkflowReminderRequest request,
                                         int batchSize, long batchDelayMs, int maxPerUser,
                                         Map<String, String> localizationJsonCache,
                                         Map<String, String> smsTemplateCache,
                                         Map<String, String> emailTemplateCache,
                                         Map<String, User> userCache,
                                         Map<String, Integer> userReminderCounts) {

        ProcessInstanceReminderCriteria criteria = ProcessInstanceReminderCriteria.builder()
                .tenantId(tenantId)
                .businessService(request != null ? request.getBusinessService() : null)
                .businessServices(request != null ? request.getBusinessServices() : null)
                .limit(batchSize)
                .build();

        String stateTenantId = getStateTenantId(tenantId);
        String smsTemplate = smsTemplateCache.computeIfAbsent(stateTenantId, t -> {
            String json = localizationJsonCache.computeIfAbsent(t, key -> notificationService.getLocalizationMessages(t, requestInfo));
            String code = config != null ? config.getSmsTemplateId() : "EG_WF_ASSIGNEE_MSG";
            return notificationService.getMessageTemplate(code, json);
        });

        String emailTemplate = emailTemplateCache.computeIfAbsent(stateTenantId, t -> {
            String json = localizationJsonCache.computeIfAbsent(t, key -> notificationService.getLocalizationMessages(t, requestInfo));
            String code = config != null ? config.getEmailTemplateId() : "EG_WF_ASSIGNEE_EMAIL";
            return notificationService.getMessageTemplate(code, json);
        });

        int tenantReminders = 0;
        String lastId = null;

        while (!isCancelRequested.get()) {
            criteria.setLastId(lastId);

            List<String> processInstanceIds = workflowRepository.getActiveAssignedProcessInstanceIds(criteria);
            if (CollectionUtils.isEmpty(processInstanceIds)) {
                break;
            }

            lastId = processInstanceIds.get(processInstanceIds.size() - 1);

            List<ProcessInstance> batchProcessInstances = workflowRepository.getProcessInstancesByIds(processInstanceIds);
            if (CollectionUtils.isEmpty(batchProcessInstances)) {
                break;
            }

            enrichBatchUsers(requestInfo, batchProcessInstances, userCache);

            for (ProcessInstance pi : batchProcessInstances) {
                if (pi == null || CollectionUtils.isEmpty(pi.getAssignes())) {
                    continue;
                }

                List<User> eligibleAssignees = new ArrayList<>();
                for (User assignee : pi.getAssignes()) {
                    if (assignee == null || StringUtils.isBlank(assignee.getUuid())) {
                        continue;
                    }

                    // Citizens whose SLA has passed by more than configured days (default: 2 days) should not receive reminders
                    if (notificationService.isCitizen(assignee)) {
                        long maxOverdueMs = (config != null && config.getReminderCitizenSlaPassedMaxHours() != null && config.getReminderCitizenSlaPassedMaxHours() > 0)
                                ? config.getReminderCitizenSlaPassedMaxHours() * 3600000L
                                : 172800000L; // default 2 days in milliseconds
                        long sla = pi.getBusinesssServiceSla() != null ? pi.getBusinesssServiceSla()
                                : (pi.getStateSla() != null ? pi.getStateSla()
                                : (pi.getState() != null && pi.getState().getSla() != null ? pi.getState().getSla() : 0L));
                        long lastModifiedTime = (pi.getAuditDetails() != null && pi.getAuditDetails().getLastModifiedTime() != null)
                                ? pi.getAuditDetails().getLastModifiedTime() : 0L;
                        long remainingSla = sla - (System.currentTimeMillis() - lastModifiedTime);
                        if (remainingSla < -maxOverdueMs) {
                            log.debug("Skipping individual reminder for citizen {}: application {} SLA passed by more than 2 days.",
                                    assignee.getUuid(), pi.getBusinessId());
                            continue;
                        }
                    }

                    String userKey = (config != null && Boolean.TRUE.equals(config.getReminderPerBusinessService()))
                            ? (assignee.getUuid().trim() + "_" + StringUtils.defaultString(pi.getBusinessService()))
                            : assignee.getUuid().trim();

                    int currentCount = userReminderCounts.getOrDefault(userKey, 0);
                    if (maxPerUser <= 0 || currentCount < maxPerUser) {
                        eligibleAssignees.add(assignee);
                        userReminderCounts.put(userKey, currentCount + 1);
                    }
                }

                if (!eligibleAssignees.isEmpty()) {
                    pi.setAssignes(eligibleAssignees);
                    notificationService.sendReminderNotificationForProcessInstance(requestInfo, pi, smsTemplate, emailTemplate);
                    tenantReminders += eligibleAssignees.size();
                }
            }

            if (processInstanceIds.size() < batchSize) {
                break;
            }

            if (batchDelayMs > 0) {
                try {
                    Thread.sleep(batchDelayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        if (tenantReminders > 0) {
            log.info("Completed reminder notifications for tenant {}: sent {} reminder(s).", tenantId, tenantReminders);
        }

        return tenantReminders;
    }

    private List<String> resolveTargetTenants(RequestInfo requestInfo, String tenantId) {
        if (StringUtils.isNotBlank(tenantId) && tenantId.contains(".")) {
            return Collections.singletonList(tenantId.trim());
        }

        List<String> tenants = new ArrayList<>();
        try {
            if (mdmsService != null && escalationUtil != null) {
                Object mdmsData = mdmsService.mDMSCall(requestInfo);
                List<String> mdmsTenants = escalationUtil.getTenantIds(mdmsData);
                if (!CollectionUtils.isEmpty(mdmsTenants)) {
                    for (String t : mdmsTenants) {
                        if (StringUtils.isNotBlank(t) && !t.equalsIgnoreCase("pb") && t.contains(".")) {
                            tenants.add(t.trim());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not retrieve tenant IDs from MDMS, falling back to database: ", e);
        }

        if (CollectionUtils.isEmpty(tenants)) {
            tenants = workflowRepository.getDistinctTenantIds();
        }

        if (CollectionUtils.isEmpty(tenants)) {
            String defaultState = config != null ? config.getStateLevelTenantId() : "pb";
            tenants = Collections.singletonList(defaultState);
        }

        return tenants;
    }

    private void enrichBatchUsers(RequestInfo requestInfo, List<ProcessInstance> processInstances, Map<String, User> userCache) {
        if (CollectionUtils.isEmpty(processInstances)) {
            return;
        }

        Set<String> missingUuids = new HashSet<>();
        for (ProcessInstance pi : processInstances) {
            if (pi == null) {
                continue;
            }
            if (!CollectionUtils.isEmpty(pi.getAssignes())) {
                for (User u : pi.getAssignes()) {
                    if (u != null && StringUtils.isNotBlank(u.getUuid()) && !userCache.containsKey(u.getUuid().trim())) {
                        missingUuids.add(u.getUuid().trim());
                    }
                }
            }
            if (pi.getAssigner() != null && StringUtils.isNotBlank(pi.getAssigner().getUuid())
                    && !userCache.containsKey(pi.getAssigner().getUuid().trim())) {
                missingUuids.add(pi.getAssigner().getUuid().trim());
            }
        }

        if (!missingUuids.isEmpty()) {
            try {
                Map<String, User> fetched = userService.searchUser(requestInfo, new ArrayList<>(missingUuids));
                if (fetched != null && !fetched.isEmpty()) {
                    userCache.putAll(fetched);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch users from user service for UUIDs: {}", missingUuids, e);
            }
        }

        for (ProcessInstance pi : processInstances) {
            if (pi == null) {
                continue;
            }
            if (!CollectionUtils.isEmpty(pi.getAssignes())) {
                List<User> enrichedList = new ArrayList<>();
                for (User u : pi.getAssignes()) {
                    if (u != null && u.getUuid() != null) {
                        User enriched = userCache.get(u.getUuid().trim());
                        enrichedList.add(enriched != null ? enriched : u);
                    }
                }
                pi.setAssignes(enrichedList);
            }
            if (pi.getAssigner() != null && pi.getAssigner().getUuid() != null) {
                User enrichedAssigner = userCache.get(pi.getAssigner().getUuid().trim());
                if (enrichedAssigner != null) {
                    pi.setAssigner(enrichedAssigner);
                }
            }
        }
    }

    private String getStateTenantId(String tenantId) {
        String defaultState = config != null ? config.getStateLevelTenantId() : "pb";
        if (StringUtils.isBlank(tenantId)) {
            return defaultState;
        }
        if (Boolean.TRUE.equals(config.getIsLocalizationStateLevel()) && tenantId.contains(".")) {
            return tenantId.split("\\.")[0];
        }
        return tenantId;
    }

    public boolean isJobRunning() {
        return isReminderRunning.get();
    }
}
