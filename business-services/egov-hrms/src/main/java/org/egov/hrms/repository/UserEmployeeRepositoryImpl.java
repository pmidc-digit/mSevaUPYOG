
package org.egov.hrms.repository;

import lombok.RequiredArgsConstructor;
import org.egov.hrms.model.AuditDetails;
import org.egov.hrms.model.UserEmployee;
import org.egov.hrms.repository.UserEmployeeRepository;
import org.egov.hrms.repository.UserEmployeeRowMapper;
import org.egov.hrms.web.contract.UserEmployeeSearchCriteria;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class UserEmployeeRepositoryImpl implements UserEmployeeRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final UserEmployeeRowMapper rowMapper = new UserEmployeeRowMapper();

    private static final String INSERT_SQL =
            "INSERT INTO eg_user_employee " +
                    "(id, category, subcategory, zone, tenantId, createdBy, createdDate, lastModifiedBy, lastModifiedDate) " +
                    "VALUES (:id, :category, :subcategory, :zone, :tenantId, :createdBy, :createdDate, :lastModifiedBy, :lastModifiedDate)";

    @Override
    public void save(UserEmployee ue) {
        MapSqlParameterSource params = toParams(ue);
        jdbcTemplate.update(INSERT_SQL, params);
    }

    @Override
    public void saveAll(List<UserEmployee> userEmployees) {
        if (userEmployees == null || userEmployees.isEmpty()) return;
        MapSqlParameterSource[] batch = userEmployees.stream()
                .map(this::toParams)
                .toArray(MapSqlParameterSource[]::new);
        jdbcTemplate.batchUpdate(INSERT_SQL, batch);
    }

    @Override
    public List<UserEmployee> search(UserEmployeeSearchCriteria criteria) {
        StringBuilder sql = new StringBuilder(
                "SELECT id, category, subcategory, zone, tenantId, createdBy, createdDate, lastModifiedBy, lastModifiedDate " +
                        "FROM eg_user_employee WHERE 1=1 "
        );
        MapSqlParameterSource params = new MapSqlParameterSource();

        // Mandatory tenantId
        sql.append(" AND tenantId = :tenantId ");
        params.addValue("tenantId", criteria.getTenantId());

        // Optional filters
        if (criteria.getIds() != null && !criteria.getIds().isEmpty()) {
            sql.append(" AND id IN (:ids) ");
            params.addValue("ids", criteria.getIds());
        }
        if (criteria.getCategory() != null && !criteria.getCategory().trim().isEmpty()) {
            sql.append(" AND category = :category ");
            params.addValue("category", criteria.getCategory().trim());
        }
        if (criteria.getSubcategory() != null && !criteria.getSubcategory().trim().isEmpty()) {
            sql.append(" AND subcategory = :subcategory ");
            params.addValue("subcategory", criteria.getSubcategory().trim());
        }
        if (criteria.getZone() != null && !criteria.getZone().trim().isEmpty()) {
            sql.append(" AND zone = :zone ");
            params.addValue("zone", criteria.getZone().trim());
        }

        // Sorting (Java 8-safe whitelist)
        String sortBy = criteria.getSortBy() != null ? criteria.getSortBy() : "id";
        String sortOrder = criteria.getSortOrder() != null ? criteria.getSortOrder() : "ASC";

        Set<String> allowedSort = new HashSet<>(Arrays.asList(
                "id", "category", "subcategory", "zone", "tenantId", "createdDate", "lastModifiedDate"
        ));

        if (!allowedSort.contains(sortBy)) sortBy = "id";
        if (!"ASC".equalsIgnoreCase(sortOrder) && !"DESC".equalsIgnoreCase(sortOrder)) sortOrder = "ASC";
        sql.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder).append(" ");

        // Pagination
        int limit = criteria.getLimit() != null ? criteria.getLimit() : 50;
        int offset = criteria.getOffset() != null ? criteria.getOffset() : 0;
        sql.append(" LIMIT :limit OFFSET :offset ");
        params.addValue("limit", limit);
        params.addValue("offset", offset);

        return jdbcTemplate.query(sql.toString(), params, rowMapper);
    }

    private MapSqlParameterSource toParams(UserEmployee ue) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", ue.getId())
                .addValue("category", ue.getCategory())
                .addValue("subcategory", ue.getSubcategory())
                .addValue("zone", ue.getZone())
                .addValue("tenantId", ue.getTenantId());

        AuditDetails ad = ue.getAuditDetails();
        params.addValue("createdBy", ad != null ? ad.getCreatedBy() : null)
                .addValue("createdDate", ad != null ? ad.getCreatedDate() : null)
                .addValue("lastModifiedBy", ad != null ? ad.getLastModifiedBy() : null)
                .addValue("lastModifiedDate", ad != null ? ad.getLastModifiedDate() : null);

        return params;
    }
}
