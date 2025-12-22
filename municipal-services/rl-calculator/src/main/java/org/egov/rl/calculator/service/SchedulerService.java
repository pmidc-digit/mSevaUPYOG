package org.egov.rl.calculator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.repository.Repository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.util.PropertyUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.Status;
import org.egov.rl.calculator.web.models.demand.*;
import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SchedulerService {

	@Autowired
	MasterDataService masterDataService;

	@Autowired
	private DemandService demandService;

	@Autowired
	MonthCalculationService monthCalculationService;

	@Autowired
	NotificationUtil notificationUtil;

	@Autowired
	NotificationService notificationService;
	
	@Autowired
	DemandRepository demandRepository;


	public void monthlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		System.out.println("----------Monthly create demand------");
		boolean isBetween = !currentDate
				.isBefore(Instant.ofEpochMilli(d.getStartDate()).atZone(ZoneId.systemDefault()).toLocalDate())
				&& !currentDate
					 	.isAfter(Instant.ofEpochMilli(d.getEndDate()).atZone(ZoneId.systemDefault()).toLocalDate());
		if (isBetween) {
			LocalDate enDate = Instant.ofEpochMilli(d.getEndDate()).atZone(ZoneId.systemDefault()).toLocalDate();
			String endDateMonth = enDate.getMonth().toString();
			String currentMonth = currentDate.getMonth().toString();
			if (endDateMonth.equals(currentMonth) && enDate.getYear() == currentDate.getYear()) {
				long startDay = monthCalculationService
					 	.formatDay(monthCalculationService.firstDayOfMonth(currentMonth, currentDate.getYear()), true);
				long endDay = d.getEndDate();
				long exparyDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
				System.out.println(startDay + "----" + endDay);
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demandService.createSingleDemand(exparyDate, d, requestInfo);
                      
			} else {
				long startDay = monthCalculationService
					 	.formatDay(monthCalculationService.firstDayOfMonth(currentMonth, currentDate.getYear()), true);
				long endDay = monthCalculationService
					 	.formatDay(monthCalculationService.lastDayOfMonth(currentMonth, currentDate.getYear()), true);
				long exparyDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demandService.createSingleDemand(exparyDate, d, requestInfo);
			}
		}
	}
	
	public void quterlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		System.out.println("----------Quaterly create demand------");
		Demand demands=demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream().findFirst().get();
		long diff=monthCalculationService.diffDay(demands.getTaxPeriodTo());
		if(diff==2) {
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay,3);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay,requestInfo,d.getTenantId());
			d.setStartDate(startDay);
			d.setEndDate(endDay);
			demandService.createSingleDemand(expiryDate, d, requestInfo);
		}
	 }

	public void biannualBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		System.out.println("----------Quaterly create demand------");
		Demand demands=demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream().findFirst().get();
		long diff=monthCalculationService.diffDay(demands.getTaxPeriodTo());
		if(diff==2) {
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay,6);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay,requestInfo,d.getTenantId());
			d.setStartDate(startDay);
			d.setEndDate(endDay);
			demandService.createSingleDemand(expiryDate, d, requestInfo);
		}
	 }
    
	public void yearlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		System.out.println("----------Quaterly create demand------");
		Demand demands=demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream().findFirst().get();
		long diff=monthCalculationService.diffDay(demands.getTaxPeriodTo());
		if(diff==2) {
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay,12);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay,requestInfo,d.getTenantId());
			d.setStartDate(startDay);
			d.setEndDate(endDay);
			demandService.createSingleDemand(expiryDate, d, requestInfo);
		}
	 }

}
