package org.egov.pgr.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * DgrRetryRepository - fetches service requests where dgr_grievance_id is missing.
 */
@Repository
@Slf4j
public class DgrRetryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String FETCH_PENDING_QUERY =
            "SELECT servicerequestid, tenantid, accountid " +
            "FROM eg_pgr_service " +
            "WHERE (dgr_grievance_id IS NULL OR dgr_grievance_id = '') " +
            "  AND active = true " +
            "ORDER BY createdtime ASC";

    /**
     * Returns a list of service requests that are missing a DGR grievance ID.
     * Each row contains: servicerequestid, tenantid, accountid.
     */
    public List<Map<String, Object>> fetchPendingDgrServiceRequests() {
        log.info("Fetching pending DGR service requests (dgr_grievance_id IS NULL)");
        try {
            List<Map<String, Object>> result = jdbcTemplate.queryForList(FETCH_PENDING_QUERY);
            log.info("Pending DGR records found: {}", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error fetching pending DGR service requests: {}", e.getMessage(), e);
            throw e;
        }
    }
}
