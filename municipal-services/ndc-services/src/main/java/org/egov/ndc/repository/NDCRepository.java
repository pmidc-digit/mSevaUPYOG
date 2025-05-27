package org.egov.ndc.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.builder.NdcQueryBuilder;
import org.egov.ndc.repository.rowmapper.NdcRowMapper;
import org.egov.ndc.web.model.ndc.NdcApplicationRequest;
import org.egov.ndc.web.model.ndc.NdcApplicationSearchCriteria;
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


	public Set<String> getExistingUuids(String tableName, List<String> uuids) {
		String sql = queryBuilder.getExistingUuids(tableName, uuids);
		return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("uuid")).stream().collect(Collectors.toSet());
	}

	public boolean checkApplicantExists(String uuid) {
		String sql = queryBuilder.checkApplicantExists(uuid);
		String query = jdbcTemplate.queryForObject(sql, new Object[]{uuid}, String.class);
		return query != null;
	}

	public List<NdcApplicationRequest> fetchNdcApplications(NdcApplicationSearchCriteria criteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getNdcApplicationSearchQuery(criteria, preparedStmtList);
		System.out.println(query);
		log.info(query);
		log.info(preparedStmtList.toString());
		return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}
}