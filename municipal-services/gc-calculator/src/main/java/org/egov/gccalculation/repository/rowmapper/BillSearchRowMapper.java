package org.egov.gccalculation.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.egov.gccalculation.web.models.BillSearch;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class BillSearchRowMapper implements ResultSetExtractor<List<BillSearch>> {

	@Override
	public List<BillSearch> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<BillSearch> waterDetailList = new ArrayList<>();
		while (rs.next()) {
			BillSearch waterDetails=new BillSearch();
			
			waterDetails.setId(rs.getString("id"));
			waterDetailList.add(waterDetails);
		}
		return waterDetailList;
	}
}