
package org.egov.rl.web.controllers;

import java.util.Arrays;
import java.util.List;

import javax.validation.Valid;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.AllotmentResponse;
import org.egov.rl.models.ClosureCriteria;
import org.egov.rl.models.ClsureRequest;
import org.egov.rl.models.ClsureResponse;
import org.egov.rl.models.RequestInfoWrapper;
import org.egov.rl.service.AllotmentService;
import org.egov.rl.service.ClsureService;
import org.egov.rl.util.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/clsure")
@Slf4j
public class ClosureController {

   
    @Autowired
    private ResponseInfoFactory responseInfoFactory;
    
    @Autowired
    private ClsureService clsureService;

    @PostMapping("/_create")
    public ResponseEntity<ClsureResponse> create(@Valid @RequestBody ClsureRequest clsureRequest) {

        AllotmentClsure clsure =clsureService.clsureCreate(clsureRequest);
        ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(clsureRequest.getRequestInfo(), true);
        ClsureResponse response = ClsureResponse.builder()
                .clsure(Arrays.asList(clsure))
                .responseInfo(resInfo)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @PostMapping("/_update")
    public ResponseEntity<ClsureResponse> update(@Valid @RequestBody ClsureRequest clsureRequest) {
    	AllotmentClsure clsure =clsureService.clsureUpdate(clsureRequest);
    	ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(clsureRequest.getRequestInfo(), false);
        ClsureResponse response = ClsureResponse.builder()
                .clsure(Arrays.asList(clsure))
                .responseInfo(resInfo)
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);	
    }
    
    @PostMapping("/_search")
    public ResponseEntity<ClsureResponse> search(@RequestBody ClsureRequest clsureRequest) {
    	ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(clsureRequest.getRequestInfo(), true);
        clsureService.clsureSearch(clsureRequest);
    	ClsureResponse response = ClsureResponse.builder()
                .clsure(Arrays.asList(clsureRequest.getAllotmentClsure()))
                .responseInfo(resInfo)
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);	
    }
    
    @RequestMapping(value = "/v1/_search", method = RequestMethod.POST)
  	public ResponseEntity<ClsureResponse> rlSearch(
  			@RequestBody RequestInfoWrapper requestInfoWrapper,
  			@Valid @ModelAttribute ClosureCriteria closureCriteria) {
  		List<AllotmentClsure> applications = clsureService
  				.searchClosedApplications(requestInfoWrapper.getRequestInfo(), closureCriteria);
  		ResponseInfo responseInfo = responseInfoFactory
  				.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true);
  		ClsureResponse response = ClsureResponse.builder().clsure(applications)
  				.responseInfo(responseInfo).build();
  		return new ResponseEntity<>(response, HttpStatus.OK);
  	}
 
}
