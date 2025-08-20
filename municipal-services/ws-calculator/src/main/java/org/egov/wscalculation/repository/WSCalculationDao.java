package org.egov.wscalculation.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.egov.wscalculation.web.models.BillSearch;
import org.egov.wscalculation.web.models.BillSearchs;
import org.egov.wscalculation.web.models.CancelDemand;
import org.egov.wscalculation.web.models.CancelDemandReq;
import org.egov.wscalculation.web.models.Canceldemandsearch;
import org.egov.wscalculation.web.models.MeterConnectionRequest;
import org.egov.wscalculation.web.models.MeterConnectionRequests;
import org.egov.wscalculation.web.models.MeterReading;
import org.egov.wscalculation.web.models.MeterReadingSearchCriteria;
import org.egov.wscalculation.web.models.WaterConnection;
import org.egov.wscalculation.web.models.WaterDetails;

public interface WSCalculationDao {

	void saveMeterReading(MeterConnectionRequest meterConnectionRequest);
	
	void updateMeterReading(MeterConnectionRequest meterConnectionRequest);
	void cancelPreviousMeterReading(CancelDemandReq cancelDemandPayload);
	
	List<MeterReading> searchMeterReadings(MeterReadingSearchCriteria criteria);
	
	ArrayList<String> searchTenantIds();

	ArrayList<String> searchConnectionNos(String connectionType, String tenantId);
	
	List<MeterReading> searchCurrentMeterReadings(MeterReadingSearchCriteria criteria);
	
	int isMeterReadingConnectionExist(List<String> ids);
	
	List<WaterConnection> getConnectionsNoList(String tenantId, String connectionType, Integer batchOffset, Integer batchsize, Long fromDate, Long toDate);
	
	List<WaterConnection> getConnectionsNoListForDemand(String tenantId, String connectionType, Long fromDate, Long toDate);

	List<String> getTenantId();
	
	int isBillingPeriodExists(String connectionNo, String billingPeriod);
	
	List<String> getConnectionsNoByLocality(String tenantId, String connectionType, String locality);
	
	Long searchLastDemandGenFromDate(String consumerCode, String tenantId);
	
	Boolean isConnectionDemandAvailableForBillingCycle(String tenantId, Long taxPeriodFrom, Long taxPeriodTo, String consumerCode); 

	long getConnectionCount(String tenantid, Long fromDate, Long toDate);
	
	List<WaterConnection> getConnection(String tenantId, String consumerCode,String connectionType,Long fromDate, Long toDate);
	List<String> getLocalityList(String tenantId, String locality); 
	List<WaterDetails> getConnectionsNoListforsingledemand(String tenantId, String connectionType, Long taxPeriodFrom,
			Long taxPeriodTo, String cone);

	List<String> fetchUsageCategory(String consumerCodes);
	List<String> fetchSewConnection(String consumerCodes); 
	void updateBillStatus(List<String> consumerCodes, String string, String string2);
	
//	public List<Canceldemandsearch> getConnectionCancel( String businessService, String tenantId, String consumerCode,  Long taxPeriodFrom,
//			Long taxPeriodTo );
	public List<Canceldemandsearch> getConnectionCancels( String tenantId, String demandid);
	
	public Boolean getUpdates(List demandlists);
	public List<Map<String, Object>>  getCollection(String tenatId,Long fromDate, Long toDate, String connectionno);

	
	public List<BillSearchs> getBillss (String tenantId, String demandid);


	
	public Boolean getexpiryBill(List billSearch);
	
	public Boolean getexpiryBills(List billSearchsss);


	List<String> getConnectionsNoByGroups(String tenantId, String connectionType, String groups);

	List<MeterReading> searchCurrentMeterReadingsforUpdate(MeterReadingSearchCriteria criteria);
	String searchLastMeterId(String connectionNo, Long lastReadingDate, Long currentReadingDate, String tenantId);

		
}
