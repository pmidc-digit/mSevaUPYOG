package org.egov.pgr.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.pgr.contract.SearcherRequest;
import org.egov.pgr.contract.ServiceReqSearchCriteria;
import org.egov.tracer.model.ServiceCallException;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
//import org.mockito.Matchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import org.mockito.Mock;
import org.mockito.Mockito;
import static org.mockito.Mockito.lenient;
//import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class ServiceRequestRepositoryTest {
	
	@Mock
	private RestTemplate restTemplate;
	
	
	@InjectMocks
	private ServiceRequestRepository serviceRequestRepository;


	@Disabled
	@Test
	public void testGetServiceRequestsFailure() {
		Object response = new Object();
/*		ReflectionTestUtils.setField(
				serviceRequestRepository, "searcherHost", "http://localhost:8093");
		ReflectionTestUtils.setField(
				serviceRequestRepository, "searcherEndpoint", "/infra-search/{moduleName}/{searchName}/_get");*/
		
		SearcherRequest searcherRequest = Mockito.mock(SearcherRequest.class);
		StringBuilder uri = new StringBuilder();
		uri.append("http://localhost:8093/infra-search/rainmaker-pgr/serviceRequestSearch/_get");
		lenient().when(restTemplate.postForObject(uri.toString(), searcherRequest, Map.class)).thenReturn(null);
		MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
		
		response = serviceRequestRepository.fetchResult(uri, mdmsCriteriaReq);						
				
		assertNull(response);
		
		
	}

	@SuppressWarnings("unchecked")
	@Disabled
	@Test
	public void testGetServiceRequestsSuccess() {
/*		ReflectionTestUtils.setField(
				serviceRequestRepository, "searcherHost", "http://localhost:8093");
		ReflectionTestUtils.setField(
				serviceRequestRepository, "searcherEndpoint", "/infra-search/{moduleName}/{searchName}/_get");*/
		
		RequestInfo requestInfo = new RequestInfo();
		ServiceReqSearchCriteria serviceReqSearchCriteria = new ServiceReqSearchCriteria();
		SearcherRequest searcherRequest = new SearcherRequest();
		searcherRequest.setRequestInfo(requestInfo);
		searcherRequest.setSearchCriteria(serviceReqSearchCriteria);
		MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
		StringBuilder uri = new StringBuilder();
		uri.append("http://localhost:8093/infra-search/rainmaker-pgr/serviceRequestSearch/_get");
		serviceRequestRepository.fetchResult(uri, searcherRequest);				
				
        Mockito.verify(restTemplate).postForObject(
        	    any(String.class),
        	    any(SearcherRequest.class),
        	    any(Class.class));
		
	}
	
	@SuppressWarnings("unchecked")
	@Disabled
	@Test
	public void testGetServiceRequestsException() {
		StringBuilder uri = new StringBuilder();
		uri.append("http://localhost:8093/infra-search/rainmaker-pgr/serviceRequestSearch/_get");
		MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
		Mockito.when(restTemplate.postForObject(uri.toString(), mdmsCriteriaReq, Map.class)).thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));
		assertThrows(ServiceCallException.class, () -> {
	        serviceRequestRepository.fetchResult(uri, mdmsCriteriaReq);
	    });			
	}
	


}
