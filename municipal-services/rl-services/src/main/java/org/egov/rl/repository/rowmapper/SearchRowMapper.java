package org.egov.rl.repository.rowmapper;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.egov.rl.models.*;
import org.egov.rl.models.enums.Relationship;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.models.user.User;
import org.egov.rl.service.BoundaryService;
import org.egov.rl.service.UserService;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SearchRowMapper implements ResultSetExtractor<List<AllotmentDetails>> {
    
	@Autowired
	private ObjectMapper mapper;
    
	@Autowired
	RestTemplate restTemplate;// = new RestTemplate();
	
	@Autowired
	UserService userService;
    
	@Override
	public List<AllotmentDetails> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<AllotmentDetails> currentAllotment =new ArrayList<>();
		AuditDetails auditDetails = null;
		while (rs.next()) {
			auditDetails = getAuditDetail(rs, "allotment");
			currentAllotment.add(AllotmentDetails.builder()
					.id(rs.getString("id"))
					.propertyId(rs.getString("property_id"))
					.tenantId(rs.getString("tenant_id"))
					.isAutoRenewal(rs.getBoolean("is_auto_renewal"))
					.previousApplicationNumber(rs.getString("previous_application_number"))
					.applicationStatus(rs.getInt("application_status"))
					.applicationType(rs.getString("application_type"))
					.startDate(rs.getLong("start_date"))
					.endDate(rs.getLong("end_date"))
					.termAndCondition(rs.getString("term_and_condition"))
					.ownerInfo(null)
					.penaltyType(rs.getString("penalty_type"))
					.createdTime(rs.getLong("created_time"))
					.createdBy(rs.getString("created_by"))
					.auditDetails(auditDetails)
  					.build());
		}
		
		return currentAllotment;

	}

	private AuditDetails getAuditDetail(ResultSet rs, String source) throws SQLException {
		if ("allotment".equals(source)) {
			Long lastModifiedTime = rs.getLong("lastmodified_time");
			if (rs.wasNull())
				lastModifiedTime = null;

			return AuditDetails.builder().createdBy(rs.getString("created_by")).createdTime(rs.getLong("created_time"))
					.lastModifiedBy(rs.getString("lastmodified_time")).lastModifiedTime(lastModifiedTime).build();
		}
		return null;
	}
		
}

