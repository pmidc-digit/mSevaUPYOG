package org.egov.rl.calculator.service;

import java.time.LocalDateTime;


import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.util.RLConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class JobScheduler {

	@Autowired
	ObjectMapper mapper;

	@Autowired
	DemandService demandService;
	
	@Autowired
	RLAutoEscalationService autoEscalationService;

	
//	@Scheduled(cron = "0 * * * * *", zone = RLConstants.TIME_ZONE)
	@Scheduled(cron = "0 30 3 * * *", zone = RLConstants.TIME_ZONE)
	public void bulkDemandGenerationCronJob() {
		log.info("Scheduler Start Every day at 03:30 AM");
		getOAuthToken();
		log.info("Morning Scheduler Start Date Time :{}",LocalDateTime.now());
		  demandService.generateBatchDemand(getOAuthToken(),null,null);
		log.info("Morning Scheduler End Date Time :{}",LocalDateTime.now());
	}
	
	@Scheduled(cron = "0 30 12 * * *", zone = RLConstants.TIME_ZONE)
	public void sendNotificationAndUpdateDemandCronJob() {
		log.info("Scheduler Start Every day at 12:30 PM");
		
		log.info("Afternoon Scheduler Start Date Time :{}",LocalDateTime.now());
		  demandService.sendNotificationAndUpdateDemand(getOAuthToken(),null,null);
		log.info("Afternoon Scheduler End Date Time :{}",LocalDateTime.now());
		
	}


	public RequestInfo getOAuthToken() {

		return autoEscalationService.getDefaultRequestInfo();
	}
}
