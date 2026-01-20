package org.egov.rl.calculator.repository.rowmapper;

import org.egov.rl.calculator.web.models.Owner;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class SearchDemandRowMapper implements ResultSetExtractor<List<Demand>> {

	@Override
	public List<Demand> extractData(ResultSet rs) throws SQLException, DataAccessException {
		// Map the basic fields of the Demand object

		Map<String, Demand> searchDemand = new LinkedHashMap<>();

		while (rs.next()) {
			String uuid = rs.getString("uuid");
//			System.out.println("uuid:----"+uuid);
			Demand demand = searchDemand.get(uuid);
			if (demand == null) {

				// Map the basic fields of the Demand object
				demand=Demand.builder().id(rs.getString("uuid"))
						.ispaymentcompleted(rs.getBoolean("ispaymentcompleted"))
						.consumerCode(rs.getString("consumercode")).consumerType(rs.getString("consumertype"))
						.tenantId(rs.getString("tenantid")).payer(Owner.builder().uuid(rs.getString("payer")).build())
						.taxPeriodFrom(rs.getLong("taxperiodfrom")).taxPeriodTo(rs.getLong("taxperiodto"))
						.businessService(rs.getString("businessservice"))
						.fixedbillexpirydate(rs.getLong("fixedbillexpirydate"))
						.billExpiryTime(rs.getLong("billexpirytime"))
						.minimumAmountPayable(rs.getBigDecimal("minimumamountpayable"))
						.status(Demand.DemandStatusEnum.valueOf(rs.getString("status"))).build();
			} else {
				demandDetails(demand,rs);
			}
			searchDemand.put(uuid, demand);
			
		}
		return new ArrayList<>(searchDemand.values());
	}

	private void demandDetails(Demand demand, ResultSet rs) {
		DemandDetail demandDetail = null;
		try {
			DemandDetail.builder().id(rs.getString("ddid")).demandId(rs.getString("demandid"))
					.tenantId(rs.getString("tenantid")).taxHeadMasterCode(rs.getString("taxheadcode"))
					.collectionAmount(rs.getBigDecimal("collectionamount")).taxAmount(rs.getBigDecimal("taxamount"))
					.auditDetails(auditDetails(rs)).build();
			demand.addDemandDetailsItem(demandDetail);

		} catch (Exception e) {

		}
	}

	public AuditDetails auditDetails(ResultSet rs) {
		try {
			return AuditDetails.builder().createdBy(rs.getString("createdby")).createdTime(rs.getLong("createdtime"))
					.lastModifiedBy(rs.getString("lastmodifiedby")).lastModifiedTime(rs.getLong("lastmodifiedtime"))
					.build();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
}
