package org.egov.rl.web.controllers;

import io.swagger.annotations.ApiParam;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.models.DemandResponse;
import org.egov.rl.models.collection.GetBillCriteria;
import org.egov.rl.service.DemandService;
import org.egov.rl.util.ResponseInfoFactory;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping("/demand")
public class DemandController {

	@Autowired
	private DemandService demandService;

	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	@PostMapping("/_update")
	public ResponseEntity<DemandResponse> updateDemand(@RequestBody @Valid RequestInfoWrapper requestInfoWrapper,
													   @ModelAttribute @Valid GetBillCriteria getBillCriteria) {
		return new ResponseEntity<>(demandService.updateDemands(getBillCriteria, requestInfoWrapper), HttpStatus.OK);
	}
}
