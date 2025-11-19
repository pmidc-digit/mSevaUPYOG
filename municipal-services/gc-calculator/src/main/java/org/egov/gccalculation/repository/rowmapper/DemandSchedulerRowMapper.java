package org.egov.gccalculation.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.egov.gccalculation.web.models.GarbageDetails;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class DemandSchedulerRowMapper implements ResultSetExtractor<List<GarbageDetails>> {

	@Override
	public List<GarbageDetails> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<GarbageDetails> waterDetailList = new ArrayList<>();
		while (rs.next()) {
			GarbageDetails waterDetails=new GarbageDetails();
			
			waterDetails.setConnectionExecutionDate(rs.getLong("connectionExecutionDate"));
			waterDetails.setConnectionNo(rs.getString("connectionno"));
			waterDetailList.add(waterDetails);
		}
		return waterDetailList;
	}
}