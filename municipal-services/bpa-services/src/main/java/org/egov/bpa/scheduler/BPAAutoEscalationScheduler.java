package org.egov.bpa.scheduler;


import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.bpa.service.BPAAutoEscalationService;
import org.egov.bpa.service.BPAService;
import org.egov.bpa.service.UserService;
import org.egov.bpa.util.BPAUtil;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.BPARequest;
import org.egov.bpa.web.model.BPASearchCriteria;
import org.egov.bpa.web.model.Workflow;
import org.egov.bpa.web.model.landInfo.OwnerInfo;
import org.egov.bpa.web.model.workflow.ProcessInstance;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
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

	@Autowired
	private BPAAutoEscalationService bpaAutoEscalationService;
	
	@Autowired
	private BPAService bpaService;

	@Autowired
	private BPAUtil bpaUtil;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private ObjectMapper mapper;
	
	@Scheduled(initialDelay = 1000, fixedRate = 60000)
//	@Scheduled(cron = "0 0 0 ? * MON-FRI")
//	@Scheduled(cron = "0 0 0 * * ?")
	public void autoEscalateBPA() {
		log.info("Start BPA Auto Escalation Scheduler....");
		
		List<Map<String, Object>> autoEscalationMdmsDataList = bpaAutoEscalationService.fetchAutoEscalationMdmsData(getDefaultRequestInfo());
		RequestInfo requestInfo = getDefaultRequestInfo();
		
		autoEscalationMdmsDataList.forEach(autoEscalationMdmsData -> {
			
			List<ProcessInstance> processInstances = bpaAutoEscalationService.fetchAutoEscalationApplications(autoEscalationMdmsData);
			
			startProcess(processInstances, autoEscalationMdmsData, requestInfo);
			
		});
		
		log.info("End BPA Auto Escalation Scheduler.");
	}
	
	private void startProcess(List<ProcessInstance> processInstances, Map<String, Object> autoEscalationMdmsData, RequestInfo requestInfo) {
		
		processInstances.forEach(processInstance -> {
			BPASearchCriteria criteria = new BPASearchCriteria();
			criteria.setTenantId(processInstance.getTenantId());
			criteria.setApplicationNo(processInstance.getBusinessId());
			
			try {
				List<BPA> bpas = bpaService.search(criteria, requestInfo);
				
				bpas.forEach(bpa -> {
					bpa.setWorkflow(Workflow.builder()
							.action(autoEscalationMdmsData.get("action").toString())
							.comments(autoEscalationMdmsData.get("comment").toString())
							.build());
				});
				
				bpaService.update(BPARequest.builder().requestInfo(requestInfo).BPA(bpas.get(0)).build());
			} catch (Exception e) {
				log.error("Error While Auto Escalating Application : " + processInstance.getBusinessId()
				+ " For Action : " + autoEscalationMdmsData.get("action").toString());
			}
			
		});
		
	}
	
	private RequestInfo getDefaultRequestInfo() {
		
		RequestInfo requestInfo = new RequestInfo();
		
		OwnerInfo ownerInfo = userService.searchSystemUser();
		User user = mapper.convertValue(ownerInfo, User.class);
		
		requestInfo.setApiId("Rainmaker");
		requestInfo.setAuthToken("4654e690-8e5e-4ddf-bcc3-756df680120c");
		requestInfo.setUserInfo(user);
		return requestInfo;
		
	}



	private LocalDate getPastNthWorkingDay(LocalDate fromDate, int n) {
		RequestInfo requestInfo = getDefaultRequestInfo();
		if (n < 0) throw new IllegalArgumentException("n must be >= 0");
		Set<LocalDate> holidays = bpaUtil.getMergedHolidayDateSetForMonthWindow(requestInfo,"pb",fromDate);
		LocalDate date = fromDate;

		// If starting on weekend, move to previous Friday
		DayOfWeek dow = date.getDayOfWeek();
		if (dow == DayOfWeek.SATURDAY) date = date.minusDays(1);
		else if (dow == DayOfWeek.SUNDAY) date = date.minusDays(2);

		int remaining = n;
		while (remaining > 0) {
			date = date.minusDays(1);
			DayOfWeek d = date.getDayOfWeek();

			boolean isWeekend = (d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY);
			boolean isHoliday = holidays.contains(date);

			if (!isWeekend && !isHoliday) {
				remaining--;
			}
		}
		return date;
	}



}
