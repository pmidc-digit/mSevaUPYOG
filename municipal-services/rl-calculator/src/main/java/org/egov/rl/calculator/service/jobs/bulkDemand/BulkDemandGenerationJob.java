package org.egov.rl.calculator.service.jobs.bulkDemand;

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
 * Quartz Job for bulk demand generation.
 * Runs every day at 03:30 AM (IST) by default, configurable via scheduler.bulk.cron.
 */
@Component
@Slf4j
public class BulkDemandGenerationJob implements Job {

    @Autowired
    private DemandService demandService;

    @Autowired
    private RLAutoEscalationService autoEscalationService;

    @Override
    public void execute(JobExecutionContext context) {
        log.info("Quartz Scheduler - Bulk Demand Generation Job Started Every day at 03:30 AM");
        log.info("Morning Scheduler Start Date Time: {}", LocalDateTime.now());
        try {
            RequestInfo requestInfo = autoEscalationService.getDefaultRequestInfo();
            demandService.generateBatchDemand(requestInfo, null, null);
        } catch (Exception e) {
            log.error("Error during Bulk Demand Generation Job", e);
        }
        log.info("Morning Scheduler End Date Time: {}", LocalDateTime.now());
    }
}
