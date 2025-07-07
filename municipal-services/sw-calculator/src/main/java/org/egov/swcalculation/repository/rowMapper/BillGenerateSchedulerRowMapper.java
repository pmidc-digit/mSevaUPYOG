package org.egov.swcalculation.repository.rowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.egov.swcalculation.web.models.AuditDetails;
import org.egov.swcalculation.web.models.BillScheduler;
import org.egov.swcalculation.web.models.BillStatus;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class BillGenerateSchedulerRowMapper implements ResultSetExtractor<List<BillScheduler>> {

	@Override
	public List<BillScheduler> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<BillScheduler> billSchedulerLists = new ArrayList<>();

		while (rs.next()) {
			BillScheduler billScheduler = new BillScheduler();
			billScheduler.setId(rs.getString("id"));
			billScheduler.setTransactionType(rs.getString("transactiontype"));
			billScheduler.setLocality(rs.getString("locality"));
			billScheduler.setBillingcycleStartdate(rs.getLong("billingcyclestartdate"));
			billScheduler.setBillingcycleEnddate(rs.getLong("billingcycleenddate"));
			billScheduler.setStatus(BillStatus.fromValue(rs.getString("status")));
			billScheduler.setTenantId(rs.getString("tenantid"));
			billScheduler.setGrup(rs.getString("groups"));

			AuditDetails auditdetails = AuditDetails.builder().createdBy(rs.getString("createdby"))
					.createdTime(rs.getLong("createdtime")).lastModifiedBy(rs.getString("lastmodifiedby"))
					.lastModifiedTime(rs.getLong("lastmodifiedtime")).build();
			billScheduler.setAuditDetails(auditdetails);
			billSchedulerLists.add(billScheduler);
		}
		return billSchedulerLists;
	}
}
