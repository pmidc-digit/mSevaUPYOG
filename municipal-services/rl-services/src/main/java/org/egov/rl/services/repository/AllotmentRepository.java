package org.egov.rl.services.repository;

import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.egov.rl.services.models.AllotmentCriteria;
import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.repository.builder.CommonQueryBuilder;
import org.egov.rl.services.repository.rowmapper.AllotmentRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
public class AllotmentRepository {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private CommonQueryBuilder queryBuilder;
	
	@Autowired
	private AllotmentRowMapper rowMapper;
	
	public JdbcTemplate getJdbcTemplate() {
		return jdbcTemplate;
	}	    
   
	public List<AllotmentDetails> getAllotmentSearch(AllotmentCriteria searchCriteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getAllotmentSearch(searchCriteria, preparedStmtList);
		log.info("Final query: " + query);
		return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}

}
