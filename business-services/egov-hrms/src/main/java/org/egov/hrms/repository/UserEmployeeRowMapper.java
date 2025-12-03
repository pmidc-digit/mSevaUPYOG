
package org.egov.hrms.repository;

import org.egov.hrms.model.AuditDetails;
import org.egov.hrms.model.UserEmployee;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UserEmployeeRowMapper implements RowMapper<UserEmployee> {

    @Override
    public UserEmployee mapRow(ResultSet rs, int rowNum) throws SQLException {
        AuditDetails audit = AuditDetails.builder()
                .createdBy(rs.getString("createdBy"))
                .createdDate(rs.getLong("createdDate"))
                .lastModifiedBy(rs.getString("lastModifiedBy"))
                .lastModifiedDate(rs.getLong("lastModifiedDate"))
                .build();

        return UserEmployee.builder()
                .id(rs.getLong("id"))
                .category(rs.getString("category"))
                .subcategory(rs.getString("subcategory"))
                .zone(rs.getString("zone"))
                .tenantId(rs.getString("tenantId"))
                .auditDetails(audit)
                .build();
    }
}
