
package org.egov.rl.repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.ClosureCriteria;
import org.egov.rl.models.ClsureCriteria;
import org.egov.rl.repository.builder.AllotmentQueryBuilder;
import org.egov.rl.repository.builder.ClosureApplicationSearchQueryBuilder;
import org.egov.rl.repository.builder.ClsureQueryBuilder;
import org.egov.rl.repository.rowmapper.AllotmentRowMapper;
import org.egov.rl.repository.rowmapper.ClsurerRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
public class ClsureRepository {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private ClsureQueryBuilder clsureQueryBuilder;
	
	@Autowired
	private ClosureApplicationSearchQueryBuilder closureApplicationSearchQueryBuilder;

	@Autowired
	private ClsurerRowMapper rowMapper;
    
	
	public List<AllotmentClsure> getClsureByIds(ClsureCriteria criterias) {

		List<Object> preparedStmtList = new ArrayList<>();
		
		String query = clsureQueryBuilder.getClsureSearchById(criterias, preparedStmtList);

        log.info("Executing Query: {}", query);
        log.info("With Parameters: {}", preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);

	}
	
	public List<AllotmentClsure> getClosuredApplications(ClosureCriteria closureCriteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = closureApplicationSearchQueryBuilder.getClosureSearch(closureCriteria, preparedStmtList);
		log.info("Final query: " + query);
		return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}

}
