package org.egov.rl.calculator.service.jobs.notification;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.service.DemandService;
import org.egov.rl.calculator.service.RLAutoEscalationService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Quartz Job for sending demand notifications and updating demands.
 * Runs every day at 10:30 PM (IST) by default, configurable via scheduler.notification.cron.
 */
@Component
@Slf4j
public class NotificationJob implements Job {

    @Autowired
    private DemandService demandService;

    @Autowired
    private RLAutoEscalationService autoEscalationService;

    @Override
    public void execute(JobExecutionContext context) {
        log.info("Quartz Scheduler - Notification Job Started Every day at 10:30 PM");
        log.info("Afternoon Scheduler Start Date Time: {}", LocalDateTime.now());
        try {
            RequestInfo requestInfo = autoEscalationService.getDefaultRequestInfo();
            demandService.sendNotificationAndUpdateDemand(requestInfo, null, null);
        } catch (Exception e) {
            log.error("Error during Notification and Demand Update Job", e);
        }
        log.info("Afternoon Scheduler End Date Time: {}", LocalDateTime.now());
    }
}
