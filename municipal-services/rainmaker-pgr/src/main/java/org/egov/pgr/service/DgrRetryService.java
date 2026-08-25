package org.egov.pgr.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.consumer.DgrIntegration;
import org.egov.pgr.contract.ServiceReqSearchCriteria;
import org.egov.pgr.contract.ServiceRequest;
import org.egov.pgr.contract.ServiceResponse;
import org.egov.pgr.model.user.UserResponse;
import org.egov.pgr.repository.DgrRetryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * DgrRetryService - retries DGR CreateGrievance for all service requests
 * where dgr_grievance_id is missing in DB.
 *
 * On success, createGrievance() already pushes to "update-dgr-pgrid" Kafka topic,
 * and the persister handles the DB update — no direct JDBC update needed here.
 */
@Service
@Slf4j
public class DgrRetryService {

    @Autowired
    private DgrRetryRepository dgrRetryRepository;

    @Autowired
    private DgrIntegration dgrIntegration;

    @Autowired
    private GrievanceService grievanceService;

    /**
     * Main retry method.
     *
     * @param requestInfo RequestInfo from the caller (used for searcher + user fetch)
     * @return Summary map: totalPending, successCount, failedCount, results[]
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> retryFailedDgrGrievances(RequestInfo requestInfo) {

        List<Map<String, Object>> pendingRecords = dgrRetryRepository.fetchPendingDgrServiceRequests();

        int totalPending = pendingRecords.size();
        int successCount = 0;
        int failedCount = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        log.info("DGR Retry: {} pending records found", totalPending);

        if (totalPending == 0) {
            return buildSummary(0, 0, 0, results);
        }

        // Generate token once for all retries
        String bearerToken = dgrIntegration.generateLoginToken();
        if (bearerToken == null || bearerToken.trim().isEmpty()
                || "Invalid credentials!".equalsIgnoreCase(bearerToken.trim())) {
            log.error("DGR Retry: Failed to generate token. Aborting.");
            Map<String, Object> errEntry = new HashMap<>();
            errEntry.put("error", "Failed to generate DGR token");
            errEntry.put("status", "ABORTED");
            results.add(errEntry);
            return buildSummary(totalPending, 0, totalPending, results);
        }

        ObjectMapper mapper = new ObjectMapper();

        for (Map<String, Object> row : pendingRecords) {
            String serviceRequestId = (String) row.get("servicerequestid");
            String tenantId = (String) row.get("tenantid");
            String accountId = (String) row.get("accountid");

            Map<String, Object> resultEntry = new HashMap<>();
            resultEntry.put("serviceRequestId", serviceRequestId);
            resultEntry.put("tenantId", tenantId);

            try {
                log.info("DGR Retry: Processing serviceRequestId={}", serviceRequestId);

                // 1. Fetch full ServiceRequest from searcher
                ServiceReqSearchCriteria criteria = ServiceReqSearchCriteria.builder()
                        .tenantId(tenantId.contains(".") ? tenantId.split("\\.")[0] : tenantId)
                        .serviceRequestId(Collections.singletonList(serviceRequestId))
                        .active(true)
                        .build();

                Object searchResponse = grievanceService.getServiceRequestDetailsForPlainSearch(
                        requestInfo, criteria);

                ServiceResponse serviceResponse = mapper.convertValue(searchResponse, ServiceResponse.class);

                if (serviceResponse == null
                        || serviceResponse.getServices() == null
                        || serviceResponse.getServices().isEmpty()) {
                    log.warn("DGR Retry: No service found for serviceRequestId={}", serviceRequestId);
                    resultEntry.put("status", "FAILED");
                    resultEntry.put("error", "Service request not found in DB");
                    failedCount++;
                    results.add(resultEntry);
                    continue;
                }

                // 2. Reconstruct ServiceRequest
                ServiceRequest serviceReqRequest = new ServiceRequest();
                serviceReqRequest.setRequestInfo(requestInfo);
                serviceReqRequest.setServices(serviceResponse.getServices());

                // Attach ActionInfo from ActionHistory (contains media UUIDs)
                if (serviceResponse.getActionHistory() != null
                        && !serviceResponse.getActionHistory().isEmpty()
                        && serviceResponse.getActionHistory().get(0).getActions() != null
                        && !serviceResponse.getActionHistory().get(0).getActions().isEmpty()) {
                    serviceReqRequest.setActionInfo(
                            serviceResponse.getActionHistory().get(0).getActions());
                }

                // 3. Fetch user for the service
                UserResponse userResponse = null;
                try {
                    if (accountId != null && !accountId.trim().isEmpty()) {
                        Long userId = Long.valueOf(accountId.trim());
                        String userTenantId = tenantId.contains(".")
                                ? tenantId.split("\\.")[0] : tenantId;
                        userResponse = grievanceService.getUsers(
                                requestInfo, userTenantId, Collections.singletonList(userId));
                    }
                } catch (Exception e) {
                    log.warn("DGR Retry: Could not fetch user for serviceRequestId={}: {}",
                            serviceRequestId, e.getMessage());
                }

                // 4. Call createGrievance — it handles Kafka push to update-dgr-pgrid on success
                String grievanceApiResponse = dgrIntegration.createGrievance(
                        serviceReqRequest, bearerToken, userResponse);

                log.info("DGR Retry: createGrievance response for {}: {}",
                        serviceRequestId, grievanceApiResponse);

                // Determine success: response contains Grievance_id
                if (grievanceApiResponse != null
                        && grievanceApiResponse.contains("Grievance_id")) {
                    resultEntry.put("status", "SUCCESS");
                    resultEntry.put("dgrResponse", grievanceApiResponse);
                    successCount++;
                } else {
                    resultEntry.put("status", "FAILED");
                    resultEntry.put("dgrResponse", grievanceApiResponse);
                    failedCount++;
                }

            } catch (Exception e) {
                log.error("DGR Retry: Exception for serviceRequestId={}: {}",
                        serviceRequestId, e.getMessage(), e);
                resultEntry.put("status", "FAILED");
                resultEntry.put("error", e.getMessage());
                failedCount++;
            }

            results.add(resultEntry);
        }

        log.info("DGR Retry complete: total={}, success={}, failed={}",
                totalPending, successCount, failedCount);

        return buildSummary(totalPending, successCount, failedCount, results);
    }

    private Map<String, Object> buildSummary(
            int total, int success, int failed, List<Map<String, Object>> results) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalPending", total);
        summary.put("successCount", success);
        summary.put("failedCount", failed);
        summary.put("results", results);
        return summary;
    }
}
