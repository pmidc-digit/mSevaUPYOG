package org.egov.bpa.scheduler;

import java.util.TimeZone;

import org.egov.bpa.util.BPAConstants;

import org.quartz.JobDetail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;

/**
 * Configures the Quartz Job and CronTrigger for BPA Auto Escalation.
 * Default cron: every day at midnight (MON-FRI).
 * Override via property: scheduler.bpa.auto.escalation.cron
 *
 * The trigger bean is picked up by QuartzConfig via List<Trigger> autowiring.
 */
@Configuration
public class BPAAutoEscalationJobConfig {

    /**
     * Cron expression for BPA auto escalation.
     * Default: 0 0 0 ? * MON-FRI  (12:00 AM midnight, Monday to Friday)
     */
    @Value("${scheduler.bpa.auto.escalation.cron:0 0 0 ? * MON-FRI}")
    private String cronExpression;

    @Bean
    public JobDetailFactoryBean bpaAutoEscalationJobDetail() {
        JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
        jobDetailFactory.setJobClass(BPAAutoEscalationScheduler.class);
        jobDetailFactory.setName("bpaAutoEscalationJob");
        jobDetailFactory.setGroup("bpa-escalation");
        jobDetailFactory.setDurability(true);
        return jobDetailFactory;
    }

    @Bean
    public CronTriggerFactoryBean bpaAutoEscalationTrigger(JobDetail bpaAutoEscalationJobDetail) {
        CronTriggerFactoryBean cronTriggerFactoryBean = new CronTriggerFactoryBean();
        cronTriggerFactoryBean.setJobDetail(bpaAutoEscalationJobDetail);
        cronTriggerFactoryBean.setCronExpression(cronExpression);
        cronTriggerFactoryBean.setTimeZone(TimeZone.getTimeZone(BPAConstants.TIME_ZONE));
        cronTriggerFactoryBean.setGroup("bpa-escalation");
        cronTriggerFactoryBean.setName("bpaAutoEscalationTrigger");
        return cronTriggerFactoryBean;
    }
}
