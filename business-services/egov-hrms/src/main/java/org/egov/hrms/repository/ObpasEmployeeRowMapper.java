package org.egov.hrms.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.hrms.model.AuditDetails;
import org.egov.hrms.model.ObpasEmployee;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class ObpasEmployeeRowMapper implements ResultSetExtractor<List<ObpasEmployee>> {

    @Override
    public List<ObpasEmployee> extractData(ResultSet rs) throws SQLException, DataAccessException {

        List<ObpasEmployee> list = new ArrayList<>();

        while (rs.next()) {

            AuditDetails audit = AuditDetails.builder()
                    .createdBy(rs.getString("createdby"))
                    .createdDate(rs.getLong("createddate"))
                    .lastModifiedBy(rs.getString("lastmodifiedby"))
                    .lastModifiedDate(rs.getLong("lastmodifieddate"))
                    .build();

            ObpasEmployee emp = new ObpasEmployee();
            emp.setUuid(rs.getString("uuid"));
            emp.setTenantId(rs.getString("tenantid"));
            emp.setUserUUID(rs.getString("userid"));
            emp.setCategory(rs.getString("category"));
            emp.setSubcategory(rs.getString("subcategory"));
            emp.setZone(rs.getString("zone"));
            emp.setAssignedTenantId(rs.getString("assigned_tenantid"));
            emp.setAuditDetails(audit);

            list.add(emp);
        }

        return list;
    }
}
