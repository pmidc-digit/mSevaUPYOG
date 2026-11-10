package org.egov.rl.calculator.service.jobs.bulkDemand;

import org.egov.rl.calculator.util.RLConstants;
import org.quartz.JobDetail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import java.util.TimeZone;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;

/**
 * Configures the Quartz Job and CronTrigger for bulk demand generation.
 * Default cron: twice a day at 12:00 AM (midnight) and 12:00 PM (noon) IST.
 * Override via property: scheduler.bulk.cron
 */
@Configuration
public class BulkDemandGenerationJobConfig {

    /**
     * Cron expression for bulk demand generation.
     * Default: 0 0 0,12 * * ? (every day at 12:00 AM and 12:00 PM)
     */
    @Value("${scheduler.bulk.cron:0 0 0,12 * * ?}")
    private String bulkDemandCronExpression;

    @Bean
    public JobDetailFactoryBean bulkDemandGenerationJobDetail() {
        JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
        jobDetailFactory.setJobClass(BulkDemandGenerationJob.class);
        jobDetailFactory.setName("bulkDemandGenerationJob");
        jobDetailFactory.setGroup("demand-generation");
        jobDetailFactory.setDurability(true);
        return jobDetailFactory;
    }

    @Bean
    public CronTriggerFactoryBean bulkDemandGenerationTrigger(JobDetail bulkDemandGenerationJobDetail) {
        CronTriggerFactoryBean cronTriggerFactoryBean = new CronTriggerFactoryBean();
        cronTriggerFactoryBean.setJobDetail(bulkDemandGenerationJobDetail);
        cronTriggerFactoryBean.setCronExpression(bulkDemandCronExpression);
        cronTriggerFactoryBean.setTimeZone(TimeZone.getTimeZone(RLConstants.TIME_ZONE));
        cronTriggerFactoryBean.setGroup("demand-generation");
        cronTriggerFactoryBean.setName("bulkDemandGenerationTrigger");
        return cronTriggerFactoryBean;
    }
}
