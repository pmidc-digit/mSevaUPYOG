
/*
 * eGov suite of products ... (same license header as your other controllers)
 */

package org.egov.hrms.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.service.UserEmployeeService;
import org.egov.hrms.web.contract.UserEmployeeRequest;
import org.egov.hrms.web.contract.UserEmployeeResponse;
import org.egov.hrms.web.contract.UserEmployeeSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/user-employee")
@Validated
public class UserEmployeeController {

    @Autowired
    private UserEmployeeService userEmployeeService;

    /**
     * Create (batch-friendly): POST /user-employee/_create
     * Body: { "RequestInfo": {...}, "UserEmployees": [ ... ] }
     */
    @PostMapping(value = "/_create")
    @ResponseBody
    public ResponseEntity<?> create(@RequestBody @Valid UserEmployeeRequest userEmployeeRequest) {
        UserEmployeeResponse response = userEmployeeService.create(userEmployeeRequest);
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    /**
     * Search: POST /user-employee/_search
     * Body carries RequestInfo; query params carry criteria via @ModelAttribute.
     * Example: POST /user-employee/_search?tenantId=pb.amritsar&ward=Ward-4&limit=10
     */
    @PostMapping(value = "/_search")
    @ResponseBody
    public ResponseEntity<?> search(@RequestBody @Valid RequestInfo requestInfo,
                                    @ModelAttribute @Valid UserEmployeeSearchCriteria criteria) {
        UserEmployeeResponse response = userEmployeeService.search(criteria, requestInfo);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
