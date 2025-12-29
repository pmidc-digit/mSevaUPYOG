package org.egov.rl.repository.rowmapper;

import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.enums.Status;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class OwnerInfoRowMapper implements ResultSetExtractor<List<OwnerInfo>> {

	@Override
	public List<OwnerInfo> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<OwnerInfo> oList = new ArrayList<>();
		while (rs.next()) {
			OwnerInfo o = new OwnerInfo();
			o.setOwnerId(rs.getString("id")); // if your column is named 'id'
			o.setAllotmentId(rs.getString("allotment_id"));
			o.setUserUuid(rs.getString("user_uuid"));
			o.setOwnerType(rs.getString("owner_type"));
			o.setStatus(Status.valueOf(rs.getString("status"))); // default if null
			Object primaryObj = rs.getObject("is_primary_owner");
			if (primaryObj instanceof Boolean) {
				o.setIsPrimaryOwner((Boolean) primaryObj);
			} else if (primaryObj instanceof Number) {
				o.setIsPrimaryOwner(((Number) primaryObj).intValue() != 0);
			} else {
				o.setIsPrimaryOwner(null); // if nullable
			}

			// Double (numeric/decimal)
			Double ownershipPct = (Double) rs.getObject("ownership_percentage");
			o.setOwnerShipPercentage(ownershipPct);
			oList.add(o);
		}
		
		return oList;
	}
}
