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
            PdcRequest reportRequest = new PdcRequest();
            reportRequest.setReportName(moduleName);

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
            
            // Set authToken from searchParams or RequestInfo
            if (searchParams.containsKey("authToken")) {
                RequestInfo requestInfo = new RequestInfo();
                requestInfo.setAuthToken(searchParams.get("authToken"));
                reportRequest.setRequestInfo(requestInfo);
            } else if (reqInfo != null) {
                reportRequest.setRequestInfo(reqInfo);
            }

            List<Object> reportResponse = reportService.getpdcReportData(
                    reportRequest, moduleName,
                    reportRequest.getReportName(),
                    reportRequest.getRequestInfo() != null ? reportRequest.getRequestInfo().getAuthToken() : null
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