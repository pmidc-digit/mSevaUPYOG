package org.egov.rl.repository.rowmapper;


import org.egov.rl.models.*;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class ClsurerRowMapper implements ResultSetExtractor<List<AllotmentClsure>> {
    
	@Override
	public List<AllotmentClsure> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<AllotmentClsure> clsure =new ArrayList<>();
		AuditDetails auditDetails = null;
	
		while (rs.next()) {
			auditDetails = getAuditDetail(rs, "clsure");
			clsure.add(AllotmentClsure.builder()
					.id(rs.getString("id"))
					.allotmentId(rs.getString("allotment_id"))
					.tenantId(rs.getString("tenant_id"))
					.status(rs.getString("status"))
					.applicationNumber(rs.getString("application_number"))
					.allotedApplicationNumber(rs.getString("alloted_application_number"))
					.amountToBeDeducted(rs.getString("amount_to_be_deducted"))
					.amountToBeRefund(rs.getString("amount_to_be_refund"))
					.refundAmount(rs.getString("refund_amount"))
					.notesComments(rs.getString("notes_comments"))
					.uploadProof(rs.getString("upload_proof"))
					.reasonForClosure(rs.getString("reason_for_clsure"))
					.auditDetails(auditDetails)
  					.build());
		}
		return clsure;
	}
	private AuditDetails getAuditDetail(ResultSet rs, String source) throws SQLException {
		if ("clsure".equals(source)) {
			Long lastModifiedTime = rs.getLong("lastmodified_time");
			if (rs.wasNull())
				lastModifiedTime = null;

			return AuditDetails.builder().createdBy(rs.getString("created_by")).createdTime(rs.getLong("created_time"))
					.lastModifiedBy(rs.getString("lastmodified_time")).lastModifiedTime(lastModifiedTime).build();
		}
		return null;
	}
}