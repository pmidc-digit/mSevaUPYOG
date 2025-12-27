package org.egov.rl.repository;

import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.repository.builder.CommonQueryBuilder;
import org.egov.rl.repository.rowmapper.AllotmentRowMapper;
import org.egov.rl.repository.rowmapper.DocumentRowMapper;
import org.egov.rl.repository.rowmapper.OwnerInfoRowMapper;
import org.egov.rl.repository.rowmapper.GlobleRowMapper;
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
	OwnerInfoRowMapper ownerInfoRowMapper;
	
	@Autowired
	DocumentRowMapper documentRowMapper;
	
	@Autowired
	private AllotmentRowMapper rowMapper;
	
	@Autowired
	private GlobleRowMapper globleRowMapper;
	
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
		String query = queryBuilder.getAllotmentByApplicationNumber(criterias, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}
	
	public List<AllotmentDetails> getAllotedByTanentIds(AllotmentCriteria criterias) {
		
		String query = queryBuilder.createdAllotedQuery(criterias.getTenantId());
        return jdbcTemplate.query(query, globleRowMapper);
	}
	
   public List<AllotmentDetails> getAllotedByPropertyIdsAndStatusActive(String propertyId,String tenantId) {
		
		String query = queryBuilder.getAllotedByPropertyIdsAndStatusActive(propertyId, tenantId);
		return jdbcTemplate.query(query, globleRowMapper);
	}
   
	public List<AllotmentDetails> getAllotedApplications(AllotmentCriteria searchCriteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getAllotmentSearch(searchCriteria, preparedStmtList);
		log.info("Final query: " + query);
		return jdbcTemplate.query(query, preparedStmtList.toArray(), globleRowMapper);
	}

	 public List<OwnerInfo> getOwnerInfoListByAllotmentId(String propertyId) {
		 List<Object> preparedStmtList = new ArrayList<>();
				
			String query = queryBuilder.createdOwnerInfoQuery(propertyId, preparedStmtList);
			return jdbcTemplate.query(query, preparedStmtList.toArray(), ownerInfoRowMapper);
	 }
	 
	 public List<Document> getDocumentListByAllotmentId(String propertyId) {
		 List<Object> preparedStmtList = new ArrayList<>();
				
			String query = queryBuilder.createdDocumentsQuery(propertyId, preparedStmtList);
			return jdbcTemplate.query(query, preparedStmtList.toArray(), documentRowMapper);
	 }
}
