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
	MonthCalculationService monthCalculationService;

	@Autowired
	NotificationUtil notificationUtil;

	@Autowired
	NotificationService notificationService;

	@Autowired
	DemandRepository demandRepository;

	public Demand monthlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		log.info("----------Monthly  Demand Creation----for Application Number--"+d.getApplicationNumber());
		Demand demands = demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream()
				.findFirst().orElse(null);
		if (demands != null) {
			long diff = monthCalculationService.diffDay(demands.getTaxPeriodTo());
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay, 3);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
			if (diff == 2 && (demandRepository.getDemandsByConsumerCodeAndPerioud(d.getApplicationNumber(), startDay,
					endDay) == null)) {
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demands = demandService.createSingleDemand(expiryDate, d, requestInfo);
				return demands;
			}
		}
		return null;
		
	}

	public Demand quterlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {

		log.info("----------Quterly  Demand Creation----for Application Number--"+d.getApplicationNumber());
		Demand demands = demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream()
				.findFirst().orElse(null);
		if (demands != null) {
			long diff = monthCalculationService.diffDay(demands.getTaxPeriodTo());
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay, 3);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
			if (diff == 2 && (demandRepository.getDemandsByConsumerCodeAndPerioud(d.getApplicationNumber(), startDay,
					endDay) == null)) {
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demands = demandService.createSingleDemand(expiryDate, d, requestInfo);
				return demands;
			}
		}
		return null;
	}

	public Demand biannualBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {

		log.info("----------Biaaual create demand------for Application Number--"+d.getApplicationNumber());
		Demand demands = demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream()
				.findFirst().orElse(null);
		if (demands != null) {
			long diff = monthCalculationService.diffDay(demands.getTaxPeriodTo());
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay, 6);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
			if (diff == 2 && (demandRepository.getDemandsByConsumerCodeAndPerioud(d.getApplicationNumber(), startDay,
					endDay) == null)) {
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demands = demandService.createSingleDemand(expiryDate, d, requestInfo);
				return demands;
			}
		}
		return null;
	}

	public Demand yearlyBillGenerate(LocalDate currentDate, AllotmentDetails d, RequestInfo requestInfo) {
		log.info("----------Yearly create demand-----for Application Number--"+d.getApplicationNumber());
		Demand demands = demandRepository.getDemandsByConsumerCode(Arrays.asList(d.getApplicationNumber())).stream()
				.findFirst().orElse(null);
		if (demands != null) {
			long diff = monthCalculationService.diffDay(demands.getTaxPeriodTo());
			long startDay = monthCalculationService.firstDay(demands.getTaxPeriodTo());
			long endDay = monthCalculationService.lastDayTimeOfCycle(startDay, 12);
			long expiryDate = monthCalculationService.addAfterPenaltyDays(endDay, requestInfo, d.getTenantId());
			if (diff == 2 && (demandRepository.getDemandsByConsumerCodeAndPerioud(d.getApplicationNumber(), startDay,
					endDay) == null)) {
				d.setStartDate(startDay);
				d.setEndDate(endDay);
				demands = demandService.createSingleDemand(expiryDate, d, requestInfo);
				return demands;
			}
		}
		return null;
	}
}
