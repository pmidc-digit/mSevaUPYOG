
package org.egov.rl.repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
//import org.egov.rl.repository.builder.AllotmentApplicationSearchQueryBuilder;
import org.egov.rl.repository.builder.AllotmentApplicationSearchQueryBuilder2;
import org.egov.rl.repository.builder.AllotmentQueryBuilder;
import org.egov.rl.repository.rowmapper.AllotmentRowMapper;
import org.egov.rl.repository.rowmapper.DocumentRowMapper;
import org.egov.rl.repository.rowmapper.OwnerInfoRowMapper;
import org.egov.rl.repository.rowmapper.SearchRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Repository
public class AllotmentRepository {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private AllotmentQueryBuilder queryBuilder;
	
	@Autowired
	OwnerInfoRowMapper ownerInfoRowMapper;
	
	@Autowired
	DocumentRowMapper documentRowMapper;
//	
//
//	@Autowired
//	private AllotmentApplicationSearchQueryBuilder searchQueryBuilder;

	@Autowired
	private AllotmentApplicationSearchQueryBuilder2 searchQueryBuilder2;
	
	@Autowired
	private AllotmentRowMapper rowMapper;
	
	@Autowired
	private SearchRowMapper searchRowMapper;
	    
	
	public List<AllotmentDetails> getAllotmentByIds(AllotmentCriteria criterias) {

		List<Object> preparedStmtList = new ArrayList<>();
		
		String query = queryBuilder.getAllotmentSearchById(criterias, preparedStmtList);

        log.info("Executing Query: {}", query);
        log.info("With Parameters: {}", preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
//      AllotmentRequest result =  jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
//      result.setRequestInfo(null);
//      return result;

	}
	
	public List<AllotmentDetails> getAllotmentByApplicationNumber(AllotmentCriteria criterias) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getAllotmentByApplicationNumber(criterias, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
	}
	
	public List<AllotmentDetails> getAllotedByTanentIds(AllotmentCriteria criterias) {
		
		String query = queryBuilder.createdAllotedQuery(criterias.getTenantId());
        return jdbcTemplate.query(query, searchRowMapper);
	}
	
//   public List<AllotmentDetails> getAllotedByPropertyIds(String propertyId,String tenantId) {
//		
//		String query = queryBuilder.getAllotmentByPropertyId(propertyId, tenantId);
//		return jdbcTemplate.query(query, searchRowMapper);
//	}
   public List<AllotmentDetails> getAllotedByPropertyIdsAndStatusActive(String propertyId,String tenantId,String previousApplicationNumber) {
		
		String query = queryBuilder.getAllotedByPropertyIdsAndStatusActive(propertyId, tenantId,previousApplicationNumber);
		return jdbcTemplate.query(query, searchRowMapper);
	}
   
	public List<AllotmentDetails> getAllotedApplications(AllotmentCriteria searchCriteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = searchQueryBuilder2.getAllotmentSearch(searchCriteria, preparedStmtList);
		log.info("Final query: " + query);
		return jdbcTemplate.query(query, preparedStmtList.toArray(), searchRowMapper);
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
