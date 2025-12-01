package org.egov.rl.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.collection.BillResponse;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static org.egov.rl.util.RLConstants.PT_BUSINESSSERVICE;

import java.util.LinkedHashMap;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BillingService {
	
	@Value("${egbs.host}")
	private String billingHost;
	
	@Value("${egbs.fetchbill.endpoint}")
	private String fetchBillEndpoint;
	
	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;
	
	public BillResponse fetchBill(AllotmentDetails allotmentDetails, RequestInfo requestInfo) {
		
		StringBuilder uri = new StringBuilder(billingHost);
		uri.append(fetchBillEndpoint);
		uri.append("?").append("tenantId=").append(allotmentDetails.getTenantId());
		uri.append("&businessService=").append(PT_BUSINESSSERVICE);
		uri.append("&consumerCode=").append(allotmentDetails.getApplicationNumber());
		
		try {
        	Optional<Object> response = serviceRequestRepository.fetchResult(uri, RequestInfoWrapper.builder().requestInfo(requestInfo).build());
        	
        	if(response.isPresent()) {
        		LinkedHashMap<String, Object> responseMap = (LinkedHashMap<String, Object>)response.get();
                BillResponse billResponse = mapper.convertValue(responseMap,BillResponse.class);
                return billResponse;
        	}
        	
        	else {
        		return null;
        		
        	}
        }

        catch(IllegalArgumentException  e)
        {
            throw new CustomException("IllegalArgumentException","ObjectMapper not able to convert response into bill response");
        }
	}

}
