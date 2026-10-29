package org.egov.hrms.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.model.DailyDigestReport;
import org.egov.hrms.service.DailyDigestService;
import org.egov.hrms.web.contract.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/employees/notifications")
public class DailyDigestController {

    @Autowired
    private DailyDigestService dailyDigestService;

    /**
     * Endpoint invoked by Kubernetes CronJob (e.g. daily at 07:00 AM) to trigger
     * email notifications to employees with pending applications across various statuses.
     *
     * @param requestInfoWrapper optional wrapper with RequestInfo
     * @param tenantId           optional tenantId to restrict the digest to a specific ULB/state
     * @return ResponseEntity with execution report and summary metrics
     */
    @PostMapping("/_send-daily-digest")
    @ResponseBody
    public ResponseEntity<DailyDigestReport> triggerDailyPendingDigest(
            @RequestBody(required = false) @Valid RequestInfoWrapper requestInfoWrapper,
            @RequestParam(value = "tenantId", required = false) String tenantId) {

        log.info("Received request to trigger daily pending application digest for tenant: {}", tenantId);
        RequestInfo requestInfo = (requestInfoWrapper != null && requestInfoWrapper.getRequestInfo() != null)
                ? requestInfoWrapper.getRequestInfo() : new RequestInfo();

        DailyDigestReport report = dailyDigestService.sendDailyPendingApplicationDigest(requestInfo, tenantId);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }
}
