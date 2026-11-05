package org.egov.hrms.repository;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.hrms.model.EmployeeEmailRecipient;
import org.egov.hrms.model.PendingTaskSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.util.*;

@Repository
@Slf4j
public class DailyDigestRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Value("${state.level.tenant.id:pb}")
    private String stateLevelTenantId;

    @Value("${daily.digest.sla.warning.threshold.hours:48}")
    private long slaWarningThresholdHours;

    /**
     * Executes an index-optimized aggregate query on the workflow table (eg_wf_processinstance_v2)
     * joined with eg_wf_state_v2 to fetch current pending task counts, SLA status, and human-readable state names.
     * Filters candidate rows with assignees first to avoid full scans on multi-million row history.
     *
     * @param tenantId optional tenant filter
     * @return Map where key is assignee UUID and value is list of pending task summaries
     */
    public Map<String, List<PendingTaskSummary>> fetchPendingTaskCountsByAssignee(String tenantId) {
        Map<String, List<PendingTaskSummary>> resultMap = new HashMap<>();
        List<Object> params = new ArrayList<>();

        long currentTimeMs = System.currentTimeMillis();
        long warningThresholdMs = slaWarningThresholdHours * 3600 * 1000L;

        StringBuilder query = new StringBuilder();
        query.append("WITH assigned_pi AS ( ");
        query.append("    SELECT id, businessid, businessservice, status, assignee, businessservicesla, lastmodifiedtime, createdtime ");
        query.append("    FROM eg_wf_processinstance_v2 ");
        query.append("    WHERE assignee IS NOT NULL AND TRIM(assignee) != '' ");
        if (!StringUtils.isEmpty(tenantId)) {
            if (tenantId.equalsIgnoreCase(stateLevelTenantId)) {
                query.append("      AND tenantid LIKE ? ");
                params.add(tenantId + "%");
            } else {
                query.append("      AND tenantid = ? ");
                params.add(tenantId);
            }
        }
        query.append("), ");
        query.append("latest_for_assigned AS ( ");
        query.append("    SELECT p.businessid, MAX(p.createdtime) AS max_time ");
        query.append("    FROM eg_wf_processinstance_v2 p ");
        query.append("    WHERE p.businessid IN (SELECT businessid FROM assigned_pi) ");
        query.append("    GROUP BY p.businessid ");
        query.append(") ");
        query.append("SELECT a.assignee, a.businessservice, ");
        query.append("       COALESCE(s.state, s.applicationstatus, a.status) AS status_name, ");
        query.append("       COUNT(*) AS pending_count, ");
        query.append("       SUM(CASE WHEN (a.businessservicesla - (? - a.lastmodifiedtime)) < 0 THEN 1 ELSE 0 END) AS overdue_count, ");
        query.append("       SUM(CASE WHEN (a.businessservicesla - (? - a.lastmodifiedtime)) >= 0 ");
        query.append("                 AND (a.businessservicesla - (? - a.lastmodifiedtime)) <= ? THEN 1 ELSE 0 END) AS due_soon_count, ");
        query.append("       SUM(CASE WHEN (a.businessservicesla - (? - a.lastmodifiedtime)) > ? THEN 1 ELSE 0 END) AS within_sla_count ");
        query.append("FROM assigned_pi a ");
        query.append("INNER JOIN latest_for_assigned l ON a.businessid = l.businessid AND a.createdtime = l.max_time ");
        query.append("LEFT JOIN eg_wf_state_v2 s ON a.status = s.uuid ");
        query.append("GROUP BY a.assignee, a.businessservice, COALESCE(s.state, s.applicationstatus, a.status) ");
        query.append("ORDER BY a.assignee, a.businessservice;");

        params.add(currentTimeMs);
        params.add(currentTimeMs);
        params.add(currentTimeMs);
        params.add(warningThresholdMs);
        params.add(currentTimeMs);
        params.add(warningThresholdMs);

        log.info("Executing optimized workflow aggregation query with SLA breakdown for daily digest");

        try {
            jdbcTemplate.query(query.toString(), params.toArray(), rs -> {
                String assignee = rs.getString("assignee");
                String businessService = rs.getString("businessservice");
                String status = rs.getString("status_name");
                int count = rs.getInt("pending_count");
                int overdue = rs.getInt("overdue_count");
                int dueSoon = rs.getInt("due_soon_count");
                int withinSla = rs.getInt("within_sla_count");

                PendingTaskSummary summary = PendingTaskSummary.builder()
                        .businessService(businessService)
                        .status(status)
                        .pendingCount(count)
                        .overdueCount(overdue)
                        .dueSoonCount(dueSoon)
                        .withinSlaCount(withinSla)
                        .build();

                resultMap.computeIfAbsent(assignee, k -> new ArrayList<>()).add(summary);
            });
        } catch (Exception e) {
            log.error("Failed to query workflow table for daily digest aggregation: ", e);
        }

        return resultMap;
    }

    /**
     * Fallback database query to fetch employee metadata.
     * Note: In environments with data encryption enabled, egov-user service should be used
     * to obtain decrypted PII.
     */
    public Map<String, EmployeeEmailRecipient> fetchActiveEmployeesWithEmail(Set<String> assigneeUuids) {
        Map<String, EmployeeEmailRecipient> recipientMap = new HashMap<>();
        if (CollectionUtils.isEmpty(assigneeUuids)) {
            return recipientMap;
        }

        String query = "SELECT u.uuid, u.name, u.emailid, u.mobilenumber, e.tenantid, e.code " +
                "FROM eg_user u " +
                "INNER JOIN eg_hrms_employee e ON u.uuid = e.uuid " +
                "WHERE u.uuid IN (:uuids) " +
                "  AND u.active = true " +
                "  AND e.active = true " +
                "  AND u.emailid IS NOT NULL " +
                "  AND TRIM(u.emailid) != '';";

        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("uuids", assigneeUuids);

        try {
            namedParameterJdbcTemplate.query(query, parameters, rs -> {
                String uuid = rs.getString("uuid");
                EmployeeEmailRecipient recipient = EmployeeEmailRecipient.builder()
                        .uuid(uuid)
                        .code(rs.getString("code"))
                        .name(rs.getString("name"))
                        .emailId(rs.getString("emailid"))
                        .mobileNumber(rs.getString("mobilenumber"))
                        .tenantId(rs.getString("tenantid"))
                        .build();

                recipientMap.put(uuid, recipient);
            });
        } catch (Exception e) {
            log.error("Failed to fetch active employees from DB: ", e);
        }

        return recipientMap;
    }

    /**
     * Fetches a message template directly from the localization 'message' table as a fallback.
     */
    public String fetchLocalizationMessage(String code, String tenantId, String locale, String module) {
        String sql = "SELECT message FROM message WHERE code = ? AND tenantid = ? AND locale = ? AND module = ? LIMIT 1";
        try {
            List<String> list = jdbcTemplate.query(sql, new Object[]{code, tenantId, locale, module}, (rs, rowNum) -> rs.getString("message"));
            if (!CollectionUtils.isEmpty(list)) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch localization message directly from DB for code {}: {}", code, e.getMessage());
        }
        return null;
    }
}
