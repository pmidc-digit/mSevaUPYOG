package org.egov.demand.repository.rowmapper;

import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.dao.DataAccessException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.egov.demand.model.Canceldemandsearch;

@Component  
public class Demandcancelwrapper implements ResultSetExtractor<List<Canceldemandsearch>> {

    @Override
    public List<Canceldemandsearch> extractData(ResultSet rs) throws SQLException, DataAccessException {
        List<Canceldemandsearch> waterDetailList = new ArrayList<>();

        while (rs.next()) {
            Canceldemandsearch demandDetails = new Canceldemandsearch();
            demandDetails.setDemandid(rs.getString("id"));
            demandDetails.setConsumercode(rs.getString("consumercode"));
            demandDetails.setBusinessservice(rs.getString("businessservice"));
            demandDetails.setTenantId(rs.getString("tenantId"));
            demandDetails.setTaxPeriodFrom(rs.getString("taxPeriodFrom"));
            demandDetails.setTaxPeriodTo(rs.getString("taxPeriodTo"));
            waterDetailList.add(demandDetails);
        }
        return waterDetailList;
    }
}
