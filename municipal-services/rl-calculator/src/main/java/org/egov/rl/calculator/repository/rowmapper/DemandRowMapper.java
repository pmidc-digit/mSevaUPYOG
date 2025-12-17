package org.egov.rl.calculator.repository.rowmapper;

import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DemandRowMapper implements RowMapper<Demand> {

    @Override
    public Demand mapRow(ResultSet rs, int rowNum) throws SQLException {
        // Map the basic fields of the Demand object
        Demand demand = Demand.builder()
                .id(rs.getString("id"))
                .consumerCode(rs.getString("consumercode"))
                .tenantId(rs.getString("tenantid"))
                .taxPeriodFrom(rs.getLong("taxperiodfrom"))
                .taxPeriodTo(rs.getLong("taxperiodto"))
                .businessService(rs.getString("businessservice"))
                .minimumAmountPayable(rs.getBigDecimal("minimumamountpayable"))
                .status(Demand.DemandStatusEnum.valueOf(rs.getString("status")))
                .build();

        // Map the DemandDetails if available
        List<DemandDetail> demandDetails = new ArrayList<>();
        // Assuming you have a separate table for demand details, you can fetch and map them here
        // For now, this is left as an empty list
        demand.setDemandDetails(demandDetails);

        return demand;
    }
}
