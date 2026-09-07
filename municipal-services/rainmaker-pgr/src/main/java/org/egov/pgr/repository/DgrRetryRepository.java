package org.egov.pgr.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * DgrRetryRepository - fetches service requests where dgr_grievance_id is missing.
 * Uses pagination and filtering to prevent OutOfMemory / GC overhead issues on large datasets.
 */
@Repository
@Slf4j
public class DgrRetryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Returns a list of service requests that are missing a DGR grievance ID.
     * Filtered by optional parameters and paginated with a safe default limit.
     */
    public List<Map<String, Object>> fetchPendingDgrServiceRequests(
            String serviceRequestId, String tenantId, Long fromDate, Integer limit, Integer offset) {

        StringBuilder query = new StringBuilder(
                "SELECT servicerequestid, tenantid, accountid, phone, createdtime " +
                "FROM eg_pgr_service " +
                "WHERE (dgr_grievance_id IS NULL OR dgr_grievance_id = '') " +
                "  AND active = true "
        );

        List<Object> params = new ArrayList<>();

        if (serviceRequestId != null && !serviceRequestId.trim().isEmpty()) {
            query.append(" AND servicerequestid = ? ");
            params.add(serviceRequestId.trim());
        }

        if (tenantId != null && !tenantId.trim().isEmpty()) {
            query.append(" AND tenantid = ? ");
            params.add(tenantId.trim());
        }

        // Hard-code rule: Never fetch/process complaints created before 7th Jan 2026 00:00:00 IST (1767724200000L)
        long cutoffEpoch = org.egov.pgr.utils.PGRConstants.DGR_CUTOFF_DATE_EPOCH;
        long effectiveFromDate = (fromDate != null && fromDate > cutoffEpoch) ? fromDate : cutoffEpoch;
        query.append(" AND createdtime >= ? ");
        params.add(effectiveFromDate);

        query.append(" ORDER BY createdtime DESC ");

        int queryLimit = (limit != null && limit > 0 && limit <= 1000) ? limit : 500;  // max cap: 1000, default: 500
        int queryOffset = (offset != null && offset >= 0) ? offset : 0;

        query.append(" LIMIT ? OFFSET ? ");
        params.add(queryLimit);
        params.add(queryOffset);

        log.info("Fetching pending DGR records: SQL=[{}] params={}", query, params);
        try {
            List<Map<String, Object>> result = jdbcTemplate.queryForList(query.toString(), params.toArray());
            log.info("Pending DGR records found: {}", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error fetching pending DGR service requests: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Looks up basic info (tenantid, accountid, phone, dgr_grievance_id, createdtime) for a single serviceRequestId.
     */
    public Map<String, Object> findServiceRequestSummary(String serviceRequestId) {
        if (serviceRequestId == null || serviceRequestId.trim().isEmpty()) {
            return null;
        }
        String sql = "SELECT servicerequestid, tenantid, accountid, phone, dgr_grievance_id, createdtime FROM eg_pgr_service WHERE servicerequestid = ? LIMIT 1";
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, serviceRequestId.trim());
            return (list != null && !list.isEmpty()) ? list.get(0) : null;
        } catch (Exception e) {
            log.error("Error querying eg_pgr_service for serviceRequestId={}: {}", serviceRequestId, e.getMessage());
            return null;
        }
    }
}
