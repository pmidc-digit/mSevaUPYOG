package org.egov.rl.calculator.service.jobs.notification;

import java.util.TimeZone;

import org.egov.rl.calculator.util.RLConstants;
import org.quartz.JobDetail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;

/**
 * Configures the Quartz Job and CronTrigger for demand notification updates.
 * Default cron: every day at 10:30 PM.
 * Override via property: scheduler.notification.cron
 */
@Configuration
public class NotificationJobConfig {

    /**
     * Cron expression for notification and demand update job.
     * Default: 0 30 22 * * ? (every day at 10:30 PM)
     */
    @Value("${scheduler.notification.cron:0 30 22 * * ?}")
    private String notificationCronExpression;

    @Bean
    public JobDetailFactoryBean notificationJobDetail() {
        JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
        jobDetailFactory.setJobClass(NotificationJob.class);
        jobDetailFactory.setName("notificationAndDemandUpdateJob");
        jobDetailFactory.setGroup("notification");
        jobDetailFactory.setDurability(true);
        return jobDetailFactory;
    }

    @Bean
    public CronTriggerFactoryBean notificationTrigger(JobDetail notificationJobDetail) {
        CronTriggerFactoryBean cronTriggerFactoryBean = new CronTriggerFactoryBean();
        cronTriggerFactoryBean.setJobDetail(notificationJobDetail);
        cronTriggerFactoryBean.setCronExpression(notificationCronExpression);
        cronTriggerFactoryBean.setTimeZone(TimeZone.getTimeZone(RLConstants.TIME_ZONE));
        cronTriggerFactoryBean.setGroup("notification");
        cronTriggerFactoryBean.setName("notificationTrigger");
        return cronTriggerFactoryBean;
    }
}
