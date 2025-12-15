package org.egov.rl.web.controllers;

import java.util.Arrays;
import java.util.List;

import javax.validation.Valid;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.ClsureRequest;
import org.egov.rl.models.ClsureResponse;
import org.egov.rl.models.NotificationSchedule;
import org.egov.rl.models.SchedullerRequest;
import org.egov.rl.models.SchedullerResponse;
import org.egov.rl.service.ClsureService;
import org.egov.rl.service.NotificationSchedullerService;
import org.egov.rl.util.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/scheduller")
public class NotificationSchedullerController {
	
	 
    @Autowired
    private ResponseInfoFactory responseInfoFactory;
    
    @Autowired
    private NotificationSchedullerService schedullerService;

    @PostMapping("/_create")
    public ResponseEntity<SchedullerResponse> create(@Valid @RequestBody SchedullerRequest schedullerRequest) {

    	List<NotificationSchedule> scheduller =schedullerService.createScheduller(schedullerRequest);
        ResponseInfo resInfo = responseInfoFactory.createResponseInfoFromRequestInfo(schedullerRequest.getRequestInfo(), true);
        SchedullerResponse response = SchedullerResponse.builder()
                .scheduller(scheduller)
                .responseInfo(resInfo)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


}
