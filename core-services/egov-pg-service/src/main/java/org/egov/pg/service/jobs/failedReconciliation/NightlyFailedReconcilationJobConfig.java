package org.egov.pg.service.jobs.failedReconciliation;

import org.quartz.JobDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;

/**
 * Nightly scheduled job configuration for reconciling failed transactions.
 */
@Configuration
public class NightlyFailedReconcilationJobConfig {

    @Value("${pg.failedTxnReconcileJob.cron:0 0 2 * * ?}")
    private String cronExpression;

    @Bean
    public JobDetailFactoryBean failedTxnReconcilationJob() {
        JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
        jobDetailFactory.setJobClass(NightlyFailedReconcilationJob.class);
        jobDetailFactory.setName("failedTxnReconcilationJob");
        jobDetailFactory.setGroup("status-update");
        jobDetailFactory.setDurability(true);
        return jobDetailFactory;
    }

    @Bean
    @Autowired
    public CronTriggerFactoryBean failedTxnReconcilationTrigger(JobDetail failedTxnReconcilationJob) {
        CronTriggerFactoryBean cronTriggerFactoryBean = new CronTriggerFactoryBean();
        cronTriggerFactoryBean.setJobDetail(failedTxnReconcilationJob);
        cronTriggerFactoryBean.setCronExpression(cronExpression);
        cronTriggerFactoryBean.setName("failedTxnReconcilationTrigger");
        cronTriggerFactoryBean.setGroup("status-update");
        return cronTriggerFactoryBean;
    }
}
