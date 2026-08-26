package org.egov.swservice.repository;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.swservice.web.models.*;

public interface SewerageDao {
	void saveSewerageConnection(SewerageConnectionRequest sewerageConnectionRequest);

	List<SewerageConnection> getSewerageConnectionList(SearchCriteria criteria, RequestInfo requestInfo);
	
	Integer getSewerageConnectionsCount(SearchCriteria criteria, RequestInfo requestInfo);
	
	List<String> fetchSewerageConnectionIds(SearchCriteria criteria);
	
	void updateSewerageConnection(SewerageConnectionRequest sewerageConnectionRequest, boolean isStateUpdatable);
	
	List<SewerageConnection> getPlainSewerageConnectionSearch(SearchCriteria criteria);

	List<SewerageConnection> getSewerageConnectionPlainSearchList(SearchCriteria criteria,
			RequestInfo requestInfo);

	void updateOldSewerageConnections(SewerageConnectionRequest sewerageConnectionRequest);

	Integer getTotalApplications(SearchCriteria criteria);

	void updateEncryptionStatus(EncryptionCount encryptionCount);

	EncryptionCount getLastExecutionDetail(SearchCriteria criteria);

    void updateOldBillStatus(UpdateBillStatusReq updateBillStatusReq);

    void updatePayerIDForDemand(UpdateDemandPayerRequest updateDemandPayerRequest);

}
