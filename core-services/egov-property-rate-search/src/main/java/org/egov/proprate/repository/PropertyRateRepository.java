package org.egov.proprate.repository;

import org.egov.proprate.repository.querybuilder.PropertyRateQueryBuilder;
import org.egov.proprate.web.models.RateSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j // Lombok annotation to provide the 'log' object
@Repository
public class PropertyRateRepository {

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Autowired
    private PropertyRateQueryBuilder queryBuilder;

    /**
     * Searches for property rates or master data based on the request criteria.
     * Returns a List of Maps to handle dynamic columns (drill-down vs full rates).
     *
     * @param request The search request containing criteria
     * @return List of records (as Maps)
     */
    public List<Map<String, Object>> search(RateSearchRequest request) {
        Map<String, Object> params = new HashMap<>();

        // 1. Build the query and populate the params map
        String query = queryBuilder.getSearchQuery(request, params);
        log.info("Executing Search Query: {}", query);
        log.info("Query Parameters: {}", params);
        // 2. Execute using NamedParameterJdbcTemplate
        return namedParameterJdbcTemplate.queryForList(query, params);
    }
    
    
    public List<Map<String, Object>> searchMissingRevenueProperties(String tenantId, String localityCode
    		            ,Integer limit, Boolean isMissing, String propertyId ) {
        Map<String, Object> params = new HashMap<>();

        // 1. Build the query and populate the params map
        String query = queryBuilder.searchMissingRevenueProperties(tenantId,localityCode,limit,isMissing,propertyId , params);
        log.info("Executing Search Query of searchMissingRevenueProperties: {}", query);
        log.info("Query Parameters of searchMissingRevenueProperties: {}", params);
        // 2. Execute using NamedParameterJdbcTemplate
        return namedParameterJdbcTemplate.queryForList(query, params);
    }
}