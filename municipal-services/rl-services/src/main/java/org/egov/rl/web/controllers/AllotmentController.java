
package org.egov.rl.web.controllers;

import java.util.Arrays;
import java.util.List;

import javax.validation.Valid;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.AllotmentResponse;
import org.egov.rl.models.RequestInfoWrapper;
import org.egov.rl.service.AllotmentService;
import org.egov.rl.util.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/allotment")
@Slf4j
public class AllotmentController {

	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	@Autowired
	private AllotmentService allotmentService;

	@PostMapping("/_create")
	public ResponseEntity<AllotmentResponse> create(@Valid @RequestBody AllotmentRequest allotmentRequest) {

		AllotmentDetails allotmentDetails = allotmentService.allotmentCreate(allotmentRequest);
		ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(allotmentRequest.getRequestInfo(),
				true);
		AllotmentResponse response = AllotmentResponse.builder().allotment(Arrays.asList(allotmentDetails))
				.responseInfo(resInfo).build();
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/_update")
	public ResponseEntity<AllotmentResponse> update(@Valid @RequestBody AllotmentRequest allotmentRequest) {
		AllotmentDetails allotmentDetails = allotmentService.allotmentUpdate(allotmentRequest);
		ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(allotmentRequest.getRequestInfo(),
				true);
		AllotmentResponse response = AllotmentResponse.builder().allotment(Arrays.asList(allotmentDetails))
				.responseInfo(resInfo).build();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/v1/_search")
	public ResponseEntity<AllotmentResponse> rlSearch(@RequestBody RequestInfoWrapper requestInfoWrapper,
			@Valid @ModelAttribute AllotmentCriteria allotmentCriteria) {
		List<AllotmentDetails> applications = allotmentService
				.searchAllotedApplications(requestInfoWrapper.getRequestInfo(), allotmentCriteria);
		ResponseInfo responseInfo = responseInfoFactory
				.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true);
		AllotmentResponse response = AllotmentResponse.builder().allotment(applications).responseInfo(responseInfo)
				.build();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
