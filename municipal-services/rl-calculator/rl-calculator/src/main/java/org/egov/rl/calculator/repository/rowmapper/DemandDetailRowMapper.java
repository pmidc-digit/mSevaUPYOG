package org.egov.rl.calculator.repository.rowmapper;

import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class DemandDetailRowMapper implements ResultSetExtractor<List<DemandDetail>> {

    @Override
    public List<DemandDetail> extractData(ResultSet rs) throws SQLException, DataAccessException {
        // Map the basic fields of the Demand object

    	List<DemandDetail> demandDetails = new ArrayList<>();
    	while (rs.next()) {
    		demandDetails.add(DemandDetail.builder()
                    .id(rs.getString("id"))
                    .demandId(rs.getString("demandid"))
                    .tenantId(rs.getString("tenantid"))
                    .taxHeadMasterCode(rs.getString("taxheadcode"))
                    .collectionAmount(rs.getBigDecimal("collectionamount"))
                    .taxAmount(rs.getBigDecimal("taxamount"))
                    .auditDetails(auditDetails(rs))
                    .build());
    	}
        return demandDetails;
    }
    
    public AuditDetails auditDetails(ResultSet rs) {
    	try {
			return AuditDetails.builder()
					.createdBy(rs.getString("createdby")).createdTime(rs.getLong("createdtime"))
					.lastModifiedBy(rs.getString("lastmodifiedby")).lastModifiedTime(rs.getLong("lastmodifiedtime"))
					.build();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	return null;
    }
    
}
