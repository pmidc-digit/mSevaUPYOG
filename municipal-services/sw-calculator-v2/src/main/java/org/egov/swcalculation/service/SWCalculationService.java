package org.egov.swcalculation.service;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.swcalculation.web.models.*;

public interface SWCalculationService {
	
	List<Calculation> getCalculation(CalculationReq request);
	
//	void generateDemandBasedOnTimePeriod(RequestInfo requestInfo);
	
	String generateSingleDemand(SingleDemand singledemand);
	
	void generateBillBasedLocalityOrTenant(RequestInfo requestInfo, SchedulerLevel schedulerLevel);
	
	void generateDemandBasedOnTimePeriod(RequestInfo requestInfo, BulkDemandCriteria bulkDemandCriteria);
	
	List<Calculation> getEstimation(CalculationReq request);
	
	String generateDemandForConsumerCodeBasedOnTimePeriod(RequestInfo requestInfo, BulkBillCriteria bulkBillCriteria);
	
	List<SewerageConnection> getConnnectionWithPendingDemand(RequestInfo requestInfo, BulkBillCriteria bulkBillCriteria);

}
