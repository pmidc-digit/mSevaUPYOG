package org.egov.custom.mapper.billing.impl;

import org.egov.search.model.SaskiProperty;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component  // <-- Add this
public class SaskiSearchRowMapper implements RowMapper<SaskiProperty> {

    @Override
    public SaskiProperty mapRow(ResultSet rs, int rowNum) throws SQLException {
        SaskiProperty property = new SaskiProperty();
        property.setPropertyId(rs.getString("propertyid"));
        property.setObpassFileNo(rs.getString("obpas_fileno"));
        property.setObpassApplicantName(rs.getString("applicant_name"));
        property.setTenantId(rs.getString("tenantid"));
        property.setOldPropertyId(rs.getString("oldpropertyid"));
        property.setAllotmentNo(rs.getString("allotmentno"));
        property.setAllotmentDate(rs.getString("allotmentdate"));
        property.setVasikaNo(rs.getString("vasikano"));
        property.setVasikaDate(rs.getString("vasikadate"));
        property.setCreatedTime(rs.getString("createdtime"));
        return property;
    }
}
