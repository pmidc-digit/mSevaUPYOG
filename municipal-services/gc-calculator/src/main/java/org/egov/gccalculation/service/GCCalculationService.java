package org.egov.gccalculation.service;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.gccalculation.web.models.BulkBillCriteria;
import org.egov.gccalculation.web.models.Calculation;
import org.egov.gccalculation.web.models.CalculationReq;
import org.egov.gccalculation.web.models.SingleDemand;
import org.egov.gccalculation.web.models.WaterConnection;

public interface GCCalculationService {

	List<Calculation> getCalculation(CalculationReq calculationReq);

	void jobScheduler();
	
	void generateDemandBasedOnTimePeriod(RequestInfo requestInfo);
	String  generateSingleDemand(SingleDemand singledemand);
	
//	String cancelDemand(CancelDemand cancelDemand);
	void generateBillBasedLocality(RequestInfo requestInfo);

	void generateDemandBasedOnTimePeriod(RequestInfo requestInfo, BulkBillCriteria bulkBillCriteria);
	
	String generateDemandForConsumerCodeBasedOnTimePeriod(RequestInfo requestInfo, BulkBillCriteria bulkBillCriteria);
	
	List<WaterConnection> getConnnectionWithPendingDemand(RequestInfo requestInfo, BulkBillCriteria bulkBillCriteria);

}
