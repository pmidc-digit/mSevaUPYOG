package org.egov.bpa.scheduler;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Defines the Quartz JobDetail and CronTrigger for BPA Auto Escalation.
 * The trigger bean is picked up by QuartzConfig via List<Trigger> autowiring.
 */
@Configuration
public class BPAAutoEscalationJobConfig {

    @Value("${scheduler.bpa.auto.escalation.cron:0 0 0 * * MON-FRI}")
    private String cronExpression;

    @Bean
    public JobDetail bpaAutoEscalationJobDetail() {
        return JobBuilder.newJob(BPAAutoEscalationScheduler.class)
                .withIdentity("bpaAutoEscalationJob")
                .withDescription("BPA Auto Escalation Job")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger bpaAutoEscalationTrigger(JobDetail bpaAutoEscalationJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(bpaAutoEscalationJobDetail)
                .withIdentity("bpaAutoEscalationTrigger")
                .withDescription("BPA Auto Escalation Cron Trigger")
                .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                .build();
    }
}
