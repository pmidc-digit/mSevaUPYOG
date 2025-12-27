package org.egov.rl.repository;

import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.repository.builder.CommonQueryBuilder;
import org.egov.rl.repository.rowmapper.AllotmentRowMapper;
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
	    
	
	public List<AllotmentDetails> getAllotmentByIds(AllotmentCriteria criterias) {

		List<Object> preparedStmtList = new ArrayList<>();
		
		String query = queryBuilder.getAllotmentSearchById(criterias, preparedStmtList);
		
        log.info("Executing Query: {}", query);
        log.info("With Parameters: {}", preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}

	public List<AllotmentDetails> getAllotmentForReport(AllotmentCriteria criterias) {

		List<Object> preparedStmtList = new ArrayList<>();
		
		String query = queryBuilder.getAllotmentSearchForReport(criterias, preparedStmtList);

        log.info("Executing Query: {}", query);
        log.info("With Parameters: {}", preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}

	public List<AllotmentDetails> getAllotmentByApplicationNumber(AllotmentCriteria criterias) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getAllotmentSearch(criterias, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}
	
   
	public List<AllotmentDetails> getAllotedApplications(AllotmentCriteria searchCriteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getAllotmentSearch(searchCriteria, preparedStmtList);
		log.info("Final query: " + query);
		return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}

}
