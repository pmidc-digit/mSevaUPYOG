package org.egov.rl.calculator.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.demand.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
public class SchedulerService {

	@Autowired
	MasterDataService masterDataService;

	@Autowired
	private DemandService demandService;

	@Autowired
	DaysCycleCalculationService daysCycleCalculationService;

	@Autowired
	NotificationUtil notificationUtil;

	@Autowired
	NotificationService notificationService;

	@Autowired
	DemandRepository demandRepository;
	
	public Demand billGenerateByCycle(long startDay,long endDay,long expiryDate, AllotmentDetails allotmentDetails, RequestInfo requestInfo,String cycle) {
		  if (demandRepository.getDemandsByConsumerCodeAndPerioud(allotmentDetails.getApplicationNumber(), startDay,endDay) == null) {
			  allotmentDetails.setStartDate(startDay);
			  allotmentDetails.setEndDate(endDay);
			  return demandService.createSingleDemand(expiryDate, allotmentDetails, requestInfo,cycle);
		  }
		return null;
		
	}
}
