package org.egov.rl.calculator.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.service.DemandService;
import org.egov.rl.calculator.util.ResponseInfoFactory;
import org.egov.rl.calculator.web.models.CalculationReq;
import org.egov.rl.calculator.web.models.GetBillCriteria;
import org.egov.rl.calculator.web.models.demand.DemandResponse;
import org.egov.rl.calculator.web.models.property.RequestInfoWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.stream.Collectors;

import javax.validation.Valid;

@Slf4j
@Controller
@RequestMapping("/v1")
public class CalculatorController {

	@Autowired
	private DemandService demandService;

	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	@Autowired
	private ObjectMapper mapper;

    @PostMapping("/_calculate")
    public ResponseEntity<DemandResponse> create(@Valid @RequestBody CalculationReq request) {

    	DemandResponse demandResponse =demandService.createDemand(request);
       demandResponse.setResponseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true));
        return new ResponseEntity<>(demandResponse, HttpStatus.CREATED);
    }

	@PostMapping("/_updatedemand")
	public ResponseEntity<DemandResponse> updateDemand(@RequestBody @Valid RequestInfoWrapper requestInfoWrapper,
													   @ModelAttribute @Valid GetBillCriteria getBillCriteria) {
		return new ResponseEntity<>(demandService.updateDemands(getBillCriteria, requestInfoWrapper), HttpStatus.OK);
	}
//	@PostMapping("/_estimate")
//	public ResponseEntity<DemandResponse> estimate(@Valid @RequestBody CalculationReq allotmentRequest) {
//		DemandResponse demandResponse =demandService.estimate(allotmentRequest.getCalculationCriteria().stream().findFirst().get().isSecurityDeposite(),allotmentRequest);
//		demandResponse.setResponseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(allotmentRequest.getRequestInfo(), true));
//		return new ResponseEntity<>(demandResponse, HttpStatus.CREATED);
//	}

    @PostMapping("/_batchDemandGenerate")
	public ResponseEntity<Void> batchDemandGenerate(@Valid @RequestBody RequestInfo requestInfo,
			@ModelAttribute GetBillCriteria getBillCriteria) {
		log.info("Starting bulk demands for rent/lease demands.");
		demandService.generateBatchDemand(requestInfo,getBillCriteria.getTenantId(),getBillCriteria.getConsumerCodes().stream().collect(Collectors.joining()));
		log.info("Finished bulk demands for rent/lease demands.");
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PostMapping("/_generateBill")
	public ResponseEntity<Void> generateBill(@RequestBody(required = false) JsonNode requestBody,
			@ModelAttribute GetBillCriteria getBillCriteria) {
		log.info("Generating bill for tenant: {} consumerCodes: {}", getBillCriteria.getTenantId(), getBillCriteria.getConsumerCodes());
		String consumerCode = null;
		if (getBillCriteria.getConsumerCodes() != null && !getBillCriteria.getConsumerCodes().isEmpty()) {
			consumerCode = getBillCriteria.getConsumerCodes().stream().collect(Collectors.joining());
		}

		JsonNode requestInfoNode = null;
		if (requestBody != null) {
			if (requestBody.has("RequestInfo"))
				requestInfoNode = requestBody.get("RequestInfo");
			else if (requestBody.has("requestInfo"))
				requestInfoNode = requestBody.get("requestInfo");
			else
				requestInfoNode = requestBody;
		}

		RequestInfo requestInfo = null;
		try {
			log.debug("Incoming requestBody: {}", requestBody);
			log.debug("Resolved requestInfoNode: {}", requestInfoNode);
			if (requestInfoNode != null && !requestInfoNode.isNull()) {
				requestInfo = mapper.convertValue(requestInfoNode, RequestInfo.class);
				log.debug("Mapped RequestInfo: {}", requestInfo);
			}
		} catch (Exception e) {
			log.warn("Unable to parse RequestInfo from request body. node={}", requestInfoNode, e);
		}

		demandService.generateBatchDemand(requestInfo, getBillCriteria.getTenantId(), consumerCode);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
