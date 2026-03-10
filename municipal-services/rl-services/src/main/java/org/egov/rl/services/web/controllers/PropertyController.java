package org.egov.rl.services.web.controllers;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.services.models.PropertyReportSearchRequest;
import org.egov.rl.services.models.PropertyReportSearchResponse;
import org.egov.rl.services.service.SearchPropertyService;
import org.egov.rl.services.util.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/property")
@Slf4j
public class PropertyController {

	@Autowired
    private SearchPropertyService searchPropertyService;
	
	@Autowired
	private ResponseInfoFactory responseInfoFactory;
	   
	@PostMapping("/_report")
    public ResponseEntity<PropertyReportSearchResponse> vacantProperty(@RequestBody PropertyReportSearchRequest propertyReportSearchRequest) {
    	ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(propertyReportSearchRequest.getRequestInfo(), true);
		Object propertyList=searchPropertyService.propertyListSearch(propertyReportSearchRequest);
        PropertyReportSearchResponse response = PropertyReportSearchResponse.builder()
                .responseInfo(resInfo)
                .property(propertyList)
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);	
    }  

}
