package org.egov.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.report.service.ReportService;
import org.egov.swagger.model.PdcRequest;
import org.egov.swagger.model.SearchParam;
import org.egov.tracer.model.CustomException;
import org.egov.common.contract.request.RequestInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pdc")
@Slf4j
public class pdcController {
    
    private final ReportService reportService;

    public pdcController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{moduleName}")
    @ResponseBody
    public ResponseEntity<?> getReportData(
            @PathVariable("moduleName") String moduleName,
            @RequestParam Map<String, String> searchParams,
            @RequestBody(required = false) RequestInfo reqInfo) {
        try {
        	 String authToken = null;

             if (searchParams.containsKey("authToken")) {
                 authToken = searchParams.get("authToken");
             } else if (reqInfo != null && reqInfo.getAuthToken() != null) {
                 authToken = reqInfo.getAuthToken();
             }

             if (authToken == null || authToken.isEmpty()) {
                 throw new CustomException("AUTH_TOKEN_MISSING", "Auth token is required but not provided.");
             }

             PdcRequest reportRequest = new PdcRequest();
             reportRequest.setReportName(moduleName);

             // Set other parameters based on searchParams
             if (searchParams.containsKey("departmentId")) {
                 reportRequest.setDepartmentId(searchParams.get("departmentId"));
             }
             if (searchParams.containsKey("authorityID")) {
                 reportRequest.setTenantId(searchParams.get("authorityID"));
             }
             if (searchParams.containsKey("serviceID")) {
                 reportRequest.setServiceId(searchParams.get("serviceID"));
             }

             if (reportRequest.getSearchParams() == null) {
                 reportRequest.setSearchParams(new ArrayList<>());
             }

             // Add tenantId, serviceId, and departmentId as search parameters
             if (reportRequest.getTenantId() != null) {
                 SearchParam tenantParam = new SearchParam();
                 tenantParam.setName("tenantId");
                 tenantParam.setInput(reportRequest.getTenantId());
                 reportRequest.getSearchParams().add(tenantParam);
             }
             if (reportRequest.getServiceId() != null) {
                 SearchParam serviceParam = new SearchParam();
                 serviceParam.setName("serviceID");
                 serviceParam.setInput(reportRequest.getServiceId());
                 reportRequest.getSearchParams().add(serviceParam);
             }

             if (reportRequest.getDepartmentId() != null) {
                 SearchParam departmentParam = new SearchParam();
                 departmentParam.setName("departmentId");
                 departmentParam.setInput(reportRequest.getDepartmentId());
                 reportRequest.getSearchParams().add(departmentParam);
             }

             // Set the authToken in requestInfo
             RequestInfo requestInfo = new RequestInfo();
             requestInfo.setAuthToken(authToken);
             reportRequest.setRequestInfo(requestInfo);

             // Call the service to get the report data
             List<Object> reportResponse = reportService.getpdcReportData(
                     reportRequest, moduleName,
                     reportRequest.getReportName(),
                     authToken
             );

             return new ResponseEntity<>(reportResponse, HttpStatus.OK);
        } catch (CustomException e) {
            log.error("Error in getting report data", e);
            throw e;

        } catch (Exception e) {
            log.error("Unexpected error in getting report data", e);
            throw new CustomException("ERROR_IN_RETRIEVING_REPORT_DATA", e.getMessage());
        }
    }
}