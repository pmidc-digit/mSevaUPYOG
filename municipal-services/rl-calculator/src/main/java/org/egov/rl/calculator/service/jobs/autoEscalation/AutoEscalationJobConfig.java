package org.egov.rl.calculator.service.jobs.autoEscalation;

import java.util.TimeZone;

import org.egov.rl.calculator.util.RLConstants;
import org.quartz.JobDetail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;

/**
 * This class is a placeholder for the configuration of the Auto Escalation Job.
 * It can be used to define beans, job details, and triggers for the Auto Escalation Job.
 */
@Configuration
public class AutoEscalationJobConfig {
	
	/**
     * Cron expression for Auto Escalation.
     * Default: 0 0 4 * * ? (every day at 04:00 AM)
     */
    @Value("${scheduler.autoescalation.cron:0 0 4 * * ?}")
	private String autoEscalationCronExpression;
    
    @Bean
    public JobDetailFactoryBean autoEscalationJobDetail() {
        JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
        jobDetailFactory.setJobClass(AutoEscalationJob.class);
        jobDetailFactory.setName("autoEscalationJob");
        jobDetailFactory.setGroup("auto-escalation");
        jobDetailFactory.setDurability(true);
        return jobDetailFactory;
    }

    @Bean
    public CronTriggerFactoryBean autoEscalationTrigger(JobDetail autoEscalationJobDetail) {
        CronTriggerFactoryBean cronTriggerFactoryBean = new CronTriggerFactoryBean();
        cronTriggerFactoryBean.setJobDetail(autoEscalationJobDetail);
        cronTriggerFactoryBean.setCronExpression(autoEscalationCronExpression);
        cronTriggerFactoryBean.setTimeZone(TimeZone.getTimeZone(RLConstants.TIME_ZONE));
        cronTriggerFactoryBean.setGroup("auto-escalation");
        cronTriggerFactoryBean.setName("autoEscalationTrigger");
        return cronTriggerFactoryBean;
    }
}
