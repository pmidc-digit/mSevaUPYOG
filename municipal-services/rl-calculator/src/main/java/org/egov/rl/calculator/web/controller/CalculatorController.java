package org.egov.rl.calculator.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.service.DemandService;
import org.egov.rl.calculator.util.ResponseInfoFactory;
import org.egov.rl.calculator.web.models.AllotmentRequest;
import org.egov.rl.calculator.web.models.CalculationReq;
import org.egov.rl.calculator.web.models.GetBillCriteria;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandResponse;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.List;
@Slf4j
@Controller
@RequestMapping("/v1")
public class CalculatorController {

	@Autowired
	private DemandService demandService;

	@Autowired
	private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/_calculate")
    public ResponseEntity<DemandResponse> create(@Valid @RequestBody CalculationReq allotmentRequest) {


    	DemandResponse demandResponse =demandService.createDemand(allotmentRequest);
       demandResponse.setResponseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(allotmentRequest.getRequestInfo(), true));
        return new ResponseEntity<>(demandResponse, HttpStatus.CREATED);
    }

	@PostMapping("/_updatedemand")
	public ResponseEntity<DemandResponse> updateDemand(@RequestBody @Valid RequestInfoWrapper requestInfoWrapper,
													   @ModelAttribute @Valid GetBillCriteria getBillCriteria) {
		return new ResponseEntity<>(demandService.updateDemands(getBillCriteria, requestInfoWrapper), HttpStatus.OK);
	}
	@PostMapping("/_estimate")
	public ResponseEntity<DemandResponse> estimate(@Valid @RequestBody CalculationReq allotmentRequest) {
		DemandResponse demandResponse =demandService.estimate(true,allotmentRequest);
		demandResponse.setResponseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(allotmentRequest.getRequestInfo(), true));
		return new ResponseEntity<>(demandResponse, HttpStatus.CREATED);
	}

//	@PostMapping("/_jobscheduler")
//	public ResponseEntity<Void> jobScheduler(@Valid @RequestBody RequestInfo requestInfo) {
//		log.info("Starting job scheduler for rent demands.");
//		demandService.generateDemands(requestInfo);
//		log.info("Finished job scheduler for rent demands.");
//		return new ResponseEntity<>(HttpStatus.OK);
//	}

}
