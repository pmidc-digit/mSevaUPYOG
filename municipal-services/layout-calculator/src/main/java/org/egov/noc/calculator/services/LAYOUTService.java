package org.egov.noc.calculator.services;

import java.util.LinkedHashMap;
import org.egov.common.contract.request.RequestInfo;
import org.egov.noc.calculator.config.LAYOUTCalculatorConfig;
import org.egov.noc.calculator.repository.ServiceRequestRepository;
import org.egov.noc.calculator.utils.LAYOUTConstants;
import org.egov.noc.calculator.web.models.LAYOUTResponse;
import org.egov.noc.calculator.web.models.Layout;
import org.egov.noc.calculator.web.models.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class LAYOUTService {

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private LAYOUTCalculatorConfig config;

	public Layout getNOC(RequestInfo requestInfo, String tenantId, String applicationNo) {
		StringBuilder url = getNOCSearchURL();
		url.append("tenantId=");
		url.append(tenantId);
		
		url.append("&");
		url.append("applicationNo=");
		url.append(applicationNo);
		LinkedHashMap responseMap = null;
		responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(url, new RequestInfoWrapper(requestInfo));

		LAYOUTResponse nocResponse = null;

		try {
			nocResponse = mapper.convertValue(responseMap, LAYOUTResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException(LAYOUTConstants.PARSING_ERROR, "Error while parsing response of TradeLicense Search");
		}

		return nocResponse.getLAYOUT().size() > 0 ? nocResponse.getLAYOUT().get(0) : null ;
	}

	private StringBuilder getNOCSearchURL() {
		// TODO Auto-generated method stub
		StringBuilder url = new StringBuilder(config.getLayoutHost());
		url.append(config.getLayoutContextPath());
		url.append(config.getLayoutSearchEndpoint());
		url.append("?");
		return url;
	}
}
