package org.egov.ndc.repository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.builder.NdcQueryBuilder;
import org.egov.ndc.repository.rowmapper.NdcRowMapper;
import org.egov.ndc.web.model.ndc.NdcApplicationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Slf4j
public class NDCRepository {
	
	@Autowired
	private Producer producer;
	
	@Autowired
	private NDCConfiguration config;	

	@Autowired
	private NdcQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private NdcRowMapper rowMapper;

	public List<NdcApplicationRequest> getApplicationById(String applicantId) {
		String sql = queryBuilder.getNdcDetailsQuery(applicantId);
		return jdbcTemplate.query(sql, new Object[]{applicantId}, new NdcRowMapper());
	}


	public Set<String> getExistingUuids(String tableName, List<String> uuids) {
		String sql = queryBuilder.getExistingUuids(tableName, uuids);
		return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("uuid")).stream().collect(Collectors.toSet());
	}

	public boolean checkApplicantExists(String uuid) {
		String sql = queryBuilder.checkApplicantExists(uuid);
		String query = jdbcTemplate.queryForObject(sql, new Object[]{uuid}, String.class);
		return query != null;
	}


}
