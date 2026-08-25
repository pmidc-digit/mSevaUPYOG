package org.egov.pgr.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.contract.RequestInfoWrapper;
import org.egov.pgr.service.DgrRetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

/**
 * DgrRetryController - admin endpoint to retry DGR grievance creation
 * for all service requests where dgr_grievance_id is missing in the DB.
 *
 * POST /v1/dgr/retry-failed
 *
 * On success, the existing Kafka persister (update-dgr-pgrid topic)
 * handles the DB update — no direct JDBC write.
 */
@Controller
@RequestMapping(value = "/v1/dgr/")
@Slf4j
public class DgrRetryController {

    @Autowired
    private DgrRetryService dgrRetryService;

    /**
     * Retry all failed DGR grievance creations.
     *
     * Request body: { "RequestInfo": { ... } }
     * Response: {
     *   "totalPending": 5,
     *   "successCount": 3,
     *   "failedCount": 2,
     *   "results": [
     *     { "serviceRequestId": "PB-GRO-...", "status": "SUCCESS", "dgrResponse": "..." },
     *     { "serviceRequestId": "PB-GRO-...", "status": "FAILED",  "error": "..." }
     *   ]
     * }
     */
    @PostMapping("retry-failed")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> retryFailedDgrGrievances(
            @RequestBody RequestInfoWrapper requestInfoWrapper) {

        log.info("DGR retry-failed endpoint triggered");

        RequestInfo requestInfo = requestInfoWrapper.getRequestInfo();
        Map<String, Object> result = dgrRetryService.retryFailedDgrGrievances(requestInfo);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
