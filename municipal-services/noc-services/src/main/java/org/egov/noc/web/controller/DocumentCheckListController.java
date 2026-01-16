package org.egov.noc.web.controller;


import org.egov.noc.config.ResponseInfoFactory;
import org.egov.noc.service.NOCService;
import org.egov.noc.web.model.CheckListRequest;
import org.egov.noc.web.model.CheckListResponse;
import org.egov.noc.web.model.DocumentCheckList;
import org.egov.noc.web.model.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.websocket.server.PathParam;
import java.util.List;

@RestController
@RequestMapping("/v1/checklist")
public class DocumentCheckListController {
	
	@Autowired
	private NOCService nocService;
	
	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	@PostMapping("/_search")
	public ResponseEntity<CheckListResponse> getDocumentCheckList(@RequestBody RequestInfoWrapper requestInfoWrapper,
																  @PathParam("applicationNo") String applicationNo, @PathParam("tenantId") String tenantId){
		List<DocumentCheckList> checkLists = nocService.searchDocumentCheckLists(applicationNo, tenantId);
		
		return new ResponseEntity<>(CheckListResponse.builder()
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true))
				.checkList(checkLists).build(), HttpStatus.OK);
	}
	
	@PostMapping("/_create")
	public ResponseEntity<CheckListResponse> saveDocumentCheckList(@Valid @RequestBody CheckListRequest checkListRequest){
		List<DocumentCheckList> checkLists = nocService.saveDocumentCheckLists(checkListRequest);
		
		return new ResponseEntity<>(CheckListResponse.builder()
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(checkListRequest.getRequestInfo(), true))
				.checkList(checkLists).build(), HttpStatus.OK);
	}
	
	@PostMapping("/_update")
	public ResponseEntity<CheckListResponse> updateDocumentCheckList(@Valid @RequestBody CheckListRequest checkListRequest){
		List<DocumentCheckList> checkLists = nocService.updateDocumentCheckLists(checkListRequest);
		
		return new ResponseEntity<>(CheckListResponse.builder()
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(checkListRequest.getRequestInfo(), true))
				.checkList(checkLists).build(), HttpStatus.OK);
	}
	
}
