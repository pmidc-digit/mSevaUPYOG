package org.egov.search.repository;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
import org.egov.custom.mapper.billing.impl.Bill;
import org.egov.custom.mapper.billing.impl.BillRowMapper;
import org.egov.custom.mapper.billing.impl.IntegratedBillRowMapper;
import org.egov.search.model.Definition;
import org.egov.search.model.PropertyBasedBill;
import org.egov.search.model.SearchRequest;
import org.egov.search.utils.SearchUtils;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import lombok.extern.slf4j.Slf4j;



@Repository
@Slf4j
public class SearchRepository {
		
    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	
	@Value("${max.sql.execution.time.millisec:45000}")
	private Long maxExecutionTime;
	
	@Autowired
	private SearchUtils searchUtils;
	
	@Autowired
	public static ResourceLoader resourceLoader;

	@Autowired
	private BillRowMapper rowMapper;
	
	@Autowired
	private IntegratedBillRowMapper integratedRowMapper;
	
			
	public List<String> fetchData(SearchRequest searchRequest, Definition definition) {
        Map<String, Object> preparedStatementValues = new HashMap<>();
        String query = searchUtils.buildQuery(searchRequest, definition.getSearchParams(), definition.getQuery(), preparedStatementValues);
		log.info("Final Query: " + query);
		//log.debug("preparedStatementValues: " + preparedStatementValues);
 		List<PGobject> maps = namedParameterJdbcTemplate.queryForList(query, preparedStatementValues, PGobject.class);
 		log.info("data before convertPGOBjects" + maps);
		return searchUtils.convertPGOBjects(maps);
	}
	
	public Object fetchWithCustomMapper(SearchRequest searchRequest, Definition searchDefinition) {
        Map<String, Object> preparedStatementValues = new HashMap<>();
		
        String query = searchUtils.buildQuery(searchRequest, searchDefinition.getSearchParams(), searchDefinition.getQuery(), preparedStatementValues);
		try {
			log.info("Final Query: " + query);
			//log.debug("preparedStatementValues: " + preparedStatementValues);
			List<PropertyBasedBill> result = null;
			List<Bill> result1 = null;

			 Map<String, Object> searchCriteria = (Map<String, Object>) searchRequest.getSearchCriteria();

			    // Validate searchCriteria and get the URL
			    String url = null;
			    if (searchCriteria != null) {
			        url = (String) searchCriteria.get("url");
			    }

			    // Check if URL contains 'integrated'
			    if (url != null && url.contains("integrated")) {
			        log.info("URL contains 'integrated': " + url);
			        // Add logic specific to integrated billing URLs
			        result = namedParameterJdbcTemplate.query(query, preparedStatementValues, integratedRowMapper);
			    } else {
			        log.info("URL does not contain 'integrated': " + url);
			        result1 = namedParameterJdbcTemplate.query(query, preparedStatementValues, rowMapper);
			    }
			
			Map<String, String> business = (Map<String, String>) searchRequest.getSearchCriteria();
	        
	   
			if (result != null && !result.isEmpty()) {
			    return result;
			}

	     else {
	         String businesService = business.get("businesService");
		     if ((businesService.equalsIgnoreCase("SW")|| businesService.equalsIgnoreCase("WS")) && !result1.isEmpty())
				Collections.sort(result1.get(0).getBillDetails(), (b1, b2) -> b2.getFromPeriod().compareTo(b1.getFromPeriod()));

	    	 return result1;
	     		}
	     } catch (CustomException e) {
			throw e;
		}
	}
// 	public Integer  getUniqueCitizenCount() {
	     
// 		try {
			
// 			  String query = "select count(*) from eg_user where type=:CITIZEN";
// 		        log.info("Final Query: " + query);
// 		        String CITIZEN ="CITIZEN";
// 				//log.debug("preparedStatementValues: " + preparedStatementValues);
// 		        Map<String, String> params = Collections.singletonMap("CITIZEN", CITIZEN);
// 		        int count = namedParameterJdbcTemplate.queryForObject(query, params, Integer.class);
// 				return count;
// 		} catch (CustomException e) {
// 			throw e;
// 		}
// 	}
	public Integer  getUniqueCitizenCount(String date) {
	    
		try {
			 Timestamp timestamp = Timestamp.valueOf(date);
			  String query = "select distinct(count(uuid)) from eg_user where type='CITIZEN' and active = true and createddate <='"+timestamp+"'";
		        log.info("Final Query: " + query);
		        String CITIZEN ="CITIZEN";
		   		        Map<String, String> params = Collections.singletonMap("CITIZEN", CITIZEN);
		     		        int count = namedParameterJdbcTemplate.queryForObject(query, params, Integer.class);
				return count;
		} catch (CustomException e) {
			throw e;
		}
	}

}
