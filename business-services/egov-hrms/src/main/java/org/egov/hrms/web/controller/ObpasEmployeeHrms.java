package org.egov.hrms.web.controller;

import lombok.var;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.model.EmployeeWithWard;
import org.egov.hrms.service.EmployeeService;
import org.egov.hrms.web.contract.EmployeeRequest;
import org.egov.hrms.web.contract.EmployeeResponse;
import org.egov.hrms.web.contract.EmployeeSearchCriteria;
import org.egov.hrms.web.contract.ObpasEmployeeRequest;
import org.egov.hrms.web.contract.ObpasEmployeeSearchCriteria;
import org.egov.hrms.web.contract.ObpassEmployeeResponse;
import  org.egov.hrms.model.EmployeewardResponse;
import org.egov.hrms.web.contract.RequestInfoWrapper;
import org.egov.hrms.web.validator.EmployeeValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("obpass/employees")
public class ObpasEmployeeHrms {

	@Autowired
	private EmployeeService employeeService;
	
	@Autowired
	private EmployeeValidator validator;


	/**
	 * Maps Post Requests for _create & returns ResponseEntity of either
	 * EmployeeResponse type or ErrorResponse type
	 *
	 * @param employeeRequest
	 * @param bindingResult
	 * @return ResponseEntity<?>
	 */
	@PostMapping(value = "/_create")
	@ResponseBody
	public ResponseEntity<?> create(@RequestBody @Valid ObpasEmployeeRequest employeeRequest) {
		validator.validateRequest(employeeRequest);
		ObpassEmployeeResponse employeeResponse = employeeService.create(employeeRequest);
        return new ResponseEntity<>(employeeResponse, HttpStatus.ACCEPTED);
	}


	
	/**
	 * Maps Post Requests for _search & returns ResponseEntity of either
	 * EmployeeResponse type or ErrorResponse type
	 *
	 * @param criteria
	 * @param bindingResult
	 * @return ResponseEntity<?>
	 */
	@PostMapping(value = "/_search")
	@ResponseBody
	public ResponseEntity<?> search(@RequestBody @Valid RequestInfoWrapper requestInfoWrapper, @ModelAttribute @Valid ObpasEmployeeSearchCriteria criteria) {
		
		ObpassEmployeeResponse employeeResponse = employeeService.obpasSearch(criteria, requestInfoWrapper.getRequestInfo());
		return new ResponseEntity<>(employeeResponse,HttpStatus.OK);
	}
	
	 @PostMapping("/_delete")
		@ResponseBody
		public ResponseEntity<?> delete(@RequestBody @Valid ObpasEmployeeRequest employeeRequest) {
//			validator.validateRequest(employeeRequest);
			ObpassEmployeeResponse employeeResponse = employeeService.delete(employeeRequest);
	        return new ResponseEntity<>(employeeResponse, HttpStatus.ACCEPTED);
		}



}
