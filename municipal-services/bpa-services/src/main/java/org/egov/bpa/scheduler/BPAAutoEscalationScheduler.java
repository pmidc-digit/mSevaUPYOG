package org.egov.bpa.scheduler;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.bpa.service.BPAAutoEscalationService;
import org.egov.bpa.service.BPAService;
import org.egov.bpa.service.UserService;
import org.egov.bpa.web.model.workflow.ProcessInstance;
import org.egov.bpa.workflow.WorkflowService;
import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@EnableScheduling
public class BPAAutoEscalationScheduler {

	private BPAAutoEscalationService bpaAutoEscalationService;
	
	@Autowired
	public BPAAutoEscalationScheduler(BPAAutoEscalationService bpaAutoEscalationService, BPAService bpaService,
			UserService userService, ObjectMapper mapper, WorkflowService workflowService) {
		super();
		this.bpaAutoEscalationService = bpaAutoEscalationService;
	}

//	@Scheduled(initialDelay = 1000, fixedRate = 60000)
	@Scheduled(cron = "0 0 0 ? * MON-FRI")
//	@Scheduled(cron = "0 0 0 * * ?")
	public void autoEscalateBPA() {
		log.info("Start BPA Auto Escalation Scheduler....");
		
		RequestInfo requestInfo = bpaAutoEscalationService.getDefaultRequestInfo();
		
		Object mdmsdata = bpaAutoEscalationService.autoEscalationMdmsCall(requestInfo);
		List<Map<String, Object>> autoEscalationMdmsDataList = bpaAutoEscalationService.fetchAutoEscalationMdmsData(mdmsdata);
		Set<LocalDate> holidayList = bpaAutoEscalationService.getHolidayList(mdmsdata);
		
		autoEscalationMdmsDataList.forEach(autoEscalationMdmsData -> {
			
			List<ProcessInstance> processInstances = bpaAutoEscalationService.fetchAutoEscalationApplications(autoEscalationMdmsData, holidayList, requestInfo);
			
			bpaAutoEscalationService.startProcess(processInstances, autoEscalationMdmsData, requestInfo);
			
		});
		
		log.info("End BPA Auto Escalation Scheduler.");
	}
	
}
