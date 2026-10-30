package org.egov.garbagecollection.service;

import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.GarbageConnectionResponse;
import org.egov.garbagecollection.web.models.SearchCriteria;

public interface GcService {

	List<GarbageConnection> createGarbageConnection(GarbageConnectionRequest garbageConnectionRequest);
	
		List<GarbageConnection> createGarbageConnection(GarbageConnectionRequest garbageConnectionRequest, Boolean isMigration);

	List<GarbageConnection> search(SearchCriteria criteria, RequestInfo requestInfo);
    void disConnectGarbageConnection(String connectionNo,RequestInfo requestInfo,String tenantId);

	Integer countAllGarbageApplications(SearchCriteria criteria, RequestInfo requestInfo);

	List<GarbageConnection> updateGarbageConnection(GarbageConnectionRequest garbageConnectionRequest);
	
	GarbageConnectionResponse plainSearch(SearchCriteria criteria, RequestInfo requestInfo);
	public List<GarbageConnection> searchGarbageConnectionPlainSearch(SearchCriteria criteria, RequestInfo requestInfo);
}