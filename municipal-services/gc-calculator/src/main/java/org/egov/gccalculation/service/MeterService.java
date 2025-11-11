package org.egov.gccalculation.service;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.gccalculation.web.models.MeterConnectionRequest;
import org.egov.gccalculation.web.models.MeterConnectionRequests;
import org.egov.gccalculation.web.models.MeterReading;
import org.egov.gccalculation.web.models.MeterReadingList;
import org.egov.gccalculation.web.models.MeterReadingSearchCriteria;


public interface MeterService {
	List<MeterReading> createMeterReading(MeterConnectionRequest meterConnectionRequest);
	
	List<MeterReading> updateMeterReading(MeterConnectionRequest meterConnectionRequest);

	
	List<MeterReadingList> createMeterReadings(MeterConnectionRequests meterConnectionlist);
	
	List<MeterReading> searchMeterReadings(MeterReadingSearchCriteria criteria, RequestInfo requestInfo);
}
