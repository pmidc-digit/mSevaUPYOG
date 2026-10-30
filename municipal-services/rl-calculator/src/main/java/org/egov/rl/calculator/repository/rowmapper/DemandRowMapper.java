package org.egov.rl.calculator.repository.rowmapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.rl.calculator.web.models.Owner;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.postgresql.util.PGobject;
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
public class DemandRowMapper implements ResultSetExtractor<List<Demand>> {

	@Autowired
	private ObjectMapper mapper;

	@Override
	public List<Demand> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<Demand> demandList = new ArrayList<>();
		while (rs.next()) {
			Long fixedBillExpiryDate = rs.getLong("fixedbillexpirydate");
			if (rs.wasNull()) {
				fixedBillExpiryDate = null;
			}

			Long billExpiryTime = rs.getLong("billexpirytime");
			if (rs.wasNull()) {
				billExpiryTime = null;
			}

			Long createdTime = rs.getLong("createdtime");
			if (rs.wasNull()) {
				createdTime = null;
			}

			Long lastModifiedTime = rs.getLong("lastmodifiedtime");
			if (rs.wasNull()) {
				lastModifiedTime = null;
			}

			AuditDetails auditDetails = AuditDetails.builder()
					.createdBy(rs.getString("createdby"))
					.createdTime(createdTime)
					.lastModifiedBy(rs.getString("lastmodifiedby"))
					.lastModifiedTime(lastModifiedTime)
					.build();

			// Map the basic fields of the Demand object
			demandList.add(Demand.builder().id(rs.getString("id"))
					.ispaymentcompleted(rs.getBoolean("ispaymentcompleted"))
					.consumerCode(rs.getString("consumercode"))
					.consumerType(rs.getString("consumertype"))
					.tenantId(rs.getString("tenantid"))
					.payer(Owner.builder().uuid(rs.getString("payer")).build())
					.taxPeriodFrom(rs.getLong("taxperiodfrom"))
					.taxPeriodTo(rs.getLong("taxperiodto"))
					.businessService(rs.getString("businessservice"))
					.fixedbillexpirydate(fixedBillExpiryDate)
					.billExpiryTime(billExpiryTime)
					.auditDetails(auditDetails)
					.minimumAmountPayable(rs.getBigDecimal("minimumamountpayable"))
					.additionalDetails(readAdditionalDetails(rs))
					.status(Demand.DemandStatusEnum.valueOf(rs.getString("status"))).build());
		}
		return demandList;
	}

	/**
	 * Reads the demand {@code additionaldetails} JSON column. Demands created from a legacy arrear carry the
	 * annual {@code futurePenalty} rate here; without this mapping the penalty engine would silently fall back
	 * to the tenant MDMS penalty configuration for every demand read over JDBC.
	 *
	 * <p>Never throws: an unreadable/missing column yields null so demand reads keep working.
	 */
	private Object readAdditionalDetails(ResultSet rs) {
		try {
			Object raw = rs.getObject("additionaldetails");
			if (raw == null) {
				return null;
			}
			String json = (raw instanceof PGobject) ? ((PGobject) raw).getValue() : raw.toString();
			if (json == null || json.trim().isEmpty() || "null".equalsIgnoreCase(json.trim()) || "{}".equals(json.trim())) {
				return null;
			}
			JsonNode node = mapper.readTree(json);
			return (node == null || node.isNull()) ? null : node;
		} catch (Exception e) {
			return null;
		}
	}
}
