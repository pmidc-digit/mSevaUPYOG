package org.egov.bpa.scheduler;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.bpa.service.BPAAutoEscalationService;
import org.egov.bpa.web.model.workflow.ProcessInstance;
import org.egov.common.contract.request.RequestInfo;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Quartz Job that performs BPA Auto Escalation.
 * Quartz instantiates this via reflection.
 */
@Component
@Slf4j
public class BPAAutoEscalationScheduler implements Job {

	@Autowired
	private BPAAutoEscalationService bpaAutoEscalationService;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		log.info("Start BPA Auto Escalation Scheduler....");

		RequestInfo requestInfo = bpaAutoEscalationService.getDefaultRequestInfo();

		Object mdmsdata = bpaAutoEscalationService.autoEscalationMdmsCall(requestInfo);
		List<Map<String, Object>> autoEscalationMdmsDataList = bpaAutoEscalationService
				.fetchAutoEscalationMdmsData(mdmsdata);
		Set<LocalDate> holidayList = bpaAutoEscalationService.getHolidayList(mdmsdata);

		autoEscalationMdmsDataList.forEach(autoEscalationMdmsData -> {

			List<ProcessInstance> processInstances = bpaAutoEscalationService
					.fetchAutoEscalationApplications(autoEscalationMdmsData, holidayList, requestInfo);

			bpaAutoEscalationService.startProcess(processInstances, autoEscalationMdmsData, requestInfo);

		});

		log.info("End BPA Auto Escalation Scheduler.");

	}
	
}
