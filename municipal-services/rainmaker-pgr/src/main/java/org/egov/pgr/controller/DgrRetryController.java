package org.egov.pgr.controller;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.contract.DgrRetryRequest;
import org.egov.pgr.contract.RequestInfoWrapper;
import org.egov.pgr.service.DgrRetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * DgrRetryController - Endpoints for DGR Retry Operations:
 *
 * 1. POST /v1/dgr/process-failed-topic
 *    Checks messages/lags in Kafka topic "dgr-failed-records" and re-processes them.
 *
 * 2. POST /v1/dgr/retry-by-ids
 *    Retries specific multiple serviceRequestIds provided as comma-separated or JSON list.
 *
 * 3. GET /v1/dgr/failed-topic-status
 *    Returns the current lag and total message count of "dgr-failed-records" topic.
 */
@Controller
@RequestMapping(value = "/v1/dgr/")
@Slf4j
public class DgrRetryController {

    @Autowired
    private DgrRetryService dgrRetryService;

    /**
     * API 1: Process failed records directly from Kafka topic "dgr-failed-records".
     *
     * Example:
     *   POST /v1/dgr/process-failed-topic?limit=50&fromBeginning=true
     *   Body: { "RequestInfo": { ... } }
     */
    @PostMapping(value = {"process-failed-topic", "retry-from-topic", "retry-failed"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processFailedTopic(
            @RequestBody(required = false) DgrRetryRequest retryRequest,
            @RequestParam(value = "limit", required = false, defaultValue = "100") Integer limit,
            @RequestParam(value = "fromBeginning", required = false, defaultValue = "false") Boolean fromBeginning) {

        log.info("DGR process-failed-topic endpoint triggered (limit={}, fromBeginning={})", limit, fromBeginning);

        RequestInfo requestInfo = (retryRequest != null) ? retryRequest.getRequestInfo() : null;
        Integer effectiveLimit = (retryRequest != null && retryRequest.getLimit() != null) ? retryRequest.getLimit() : limit;
        Boolean effectiveFromBeginning = (retryRequest != null && retryRequest.getFromBeginning() != null)
                ? retryRequest.getFromBeginning() : fromBeginning;

        Map<String, Object> result = dgrRetryService.processFailedTopicRecords(
                requestInfo, effectiveLimit, effectiveFromBeginning);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * API 2: Retry specific multiple serviceRequestIds (comma-separated or JSON array).
     *
     * Examples:
     *   POST /v1/dgr/retry-by-ids?serviceRequestIds=PB-GRO-2024-001,PB-GRO-2024-002
     *   Body: { "RequestInfo": { ... } }
     *
     *   OR
     *   POST /v1/dgr/retry-by-ids
     *   Body: {
     *     "RequestInfo": { ... },
     *     "serviceRequestIds": ["PB-GRO-2024-001", "PB-GRO-2024-002"]
     *   }
     */
    @PostMapping("retry-by-ids")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> retryByServiceRequestIds(
            @RequestBody(required = false) DgrRetryRequest retryRequest,
            @RequestParam(value = "serviceRequestIds", required = false) String serviceRequestIdsParam) {

        log.info("DGR retry-by-ids endpoint triggered with params: serviceRequestIdsParam={}", serviceRequestIdsParam);

        RequestInfo requestInfo = (retryRequest != null) ? retryRequest.getRequestInfo() : null;
        List<String> idList = new ArrayList<>();

        // Priority 1: From query param (comma-separated)
        if (serviceRequestIdsParam != null && !serviceRequestIdsParam.trim().isEmpty()) {
            String[] split = serviceRequestIdsParam.split(",");
            for (String s : split) {
                if (s != null && !s.trim().isEmpty()) {
                    idList.add(s.trim());
                }
            }
        }

        // Priority 2: From JSON body list
        if (idList.isEmpty() && retryRequest != null && retryRequest.getServiceRequestIds() != null) {
            idList.addAll(retryRequest.getServiceRequestIds().stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toList()));
        }

        if (idList.isEmpty()) {
            Map<String, Object> errResponse = new HashMap<>();
            errResponse.put("error", "No serviceRequestIds provided. Pass ?serviceRequestIds=ID1,ID2 or in JSON body.");
            return new ResponseEntity<>(errResponse, HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> result = dgrRetryService.retryByServiceRequestIds(requestInfo, idList);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * API 3: Get topic lag / message count on "dgr-failed-records".
     *
     * GET /v1/dgr/failed-topic-status
     */
    @GetMapping("failed-topic-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFailedTopicStatus() {
        Map<String, Object> status = dgrRetryService.getFailedTopicStatus();
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    /**
     * API 4: Retry pending records from DB where dgr_grievance_id is NULL or empty.
     *
     * Queries eg_pgr_service table for complaints that don't have a DGR grievance ID
     * and pushes them to DGR's CreateGrievance API.
     *
     * Examples:
     *   POST /v1/dgr/retry-pending
     *   Body: { "RequestInfo": { ... } }
     *
     *   POST /v1/dgr/retry-pending?tenantId=pb.jalandhar&limit=100&offset=0
     *   Body: { "RequestInfo": { ... } }
     *
     *   POST /v1/dgr/retry-pending
     *   Body: {
     *     "RequestInfo": { ... },
     *     "tenantId": "pb.jalandhar",
     *     "fromDate": 1724630400000,
     *     "limit": 100,
     *     "offset": 0
     *   }
     */
    @PostMapping("retry-pending")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> retryPendingFromDb(
            @RequestBody(required = false) DgrRetryRequest retryRequest,
            @RequestParam(value = "tenantId", required = false) String tenantIdParam,
            @RequestParam(value = "fromDate", required = false) Long fromDateParam,
            @RequestParam(value = "limit", required = false, defaultValue = "50") Integer limitParam,
            @RequestParam(value = "offset", required = false, defaultValue = "0") Integer offsetParam) {

        log.info("DGR retry-pending endpoint triggered (tenantId={}, fromDate={}, limit={}, offset={})",
                tenantIdParam, fromDateParam, limitParam, offsetParam);

        RequestInfo requestInfo = (retryRequest != null) ? retryRequest.getRequestInfo() : null;

        // Priority: body params > query params
        String tenantId = (retryRequest != null && retryRequest.getTenantId() != null)
                ? retryRequest.getTenantId() : tenantIdParam;
        Long fromDate = (retryRequest != null && retryRequest.getFromDate() != null)
                ? retryRequest.getFromDate() : fromDateParam;
        Integer limit = (retryRequest != null && retryRequest.getLimit() != null)
                ? retryRequest.getLimit() : limitParam;
        Integer offset = (retryRequest != null && retryRequest.getOffset() != null)
                ? retryRequest.getOffset() : offsetParam;

        Map<String, Object> result = dgrRetryService.retryPendingFromDb(
                requestInfo, tenantId, fromDate, limit, offset);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
