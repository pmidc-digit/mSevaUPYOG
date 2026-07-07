package org.egov.garbagecollection.repository;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.web.models.*;

public interface GcDao {
	void saveGarbageConnection(GarbageConnectionRequest garbageConnectionRequest);

	List<GarbageConnection> getGarbageConnectionList(SearchCriteria criteria, RequestInfo requestInfo);
	
	Integer getGarbageConnectionsCount(SearchCriteria criteria, RequestInfo requestInfo);
	
	void updateGarbageConnection(GarbageConnectionRequest garbageConnectionRequest, boolean isStateUpdatable);
	
	GarbageConnectionResponse getGarbageConnectionListForPlainSearch(SearchCriteria criteria,RequestInfo requestInfo);

	void updateOldGarbageConnections(GarbageConnectionRequest garbageConnectionRequest);

	Integer getTotalApplications(SearchCriteria criteria);
	
	List<String> fetchGarbageConnectionIds(SearchCriteria criteria);
	

	void updateEncryptionStatus(EncryptionCount encryptionCount);
	
	List<GarbageConnection> getPlainGarbageConnectionSearch(SearchCriteria criteria);
	
	EncryptionCount getLastExecutionDetail(SearchCriteria criteria);
}
