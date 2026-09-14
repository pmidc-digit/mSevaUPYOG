package org.egov.rl.calculator.service.jobs.autoEscalation;

import java.time.LocalDateTime;

import org.egov.rl.calculator.service.RLAutoEscalationService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AutoEscalationJob implements Job {

	@Autowired
	RLAutoEscalationService autoEscalationService;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		log.info("Quartz Scheduler - Auto Escalation Job Started Every day at 04:00 AM");
		log.info("Auto Escalation Scheduler Start Date Time: {}", LocalDateTime.now());
		try {
			autoEscalationService.processAutoEscalation();
		} catch (Exception e) {
			log.error("Error during Auto Escalation Job", e);
		}
		log.info("Auto Escalation Scheduler End Date Time: {}", LocalDateTime.now());
	}

}
