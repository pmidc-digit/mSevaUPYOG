package org.egov.rl.calculator.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.repository.rowmapper.DemandDetailRowMapper;
import org.egov.rl.calculator.repository.rowmapper.DemandRowMapper;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.egov.rl.calculator.web.models.demand.DemandRequest;
import org.egov.rl.calculator.web.models.demand.DemandResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Repository
public class DemandRepository {

	@Autowired
	private org.egov.rl.calculator.repository.Repository serviceRequestRepository;

	@Autowired
	private Configurations config;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private DemandRowMapper demandRowMapper;

	@Autowired
	private DemandDetailRowMapper demandDetailRowMapper;

	@Autowired
	private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	/**
	 * Creates demand
	 *
	 * @param requestInfo The RequestInfo of the calculation Request
	 * @return The list of demand created
	 */
	public List<Demand> saveDemand(RequestInfo requestInfo, List<Demand> demand) {
		StringBuilder url = new StringBuilder(config.getBillingServiceHost());
		url.append(config.getDemandCreateEndPoint());
		DemandRequest request = new DemandRequest(requestInfo, demand);
		log.info("Request object for fetchResult: " + request);
		log.info("URL for fetchResult: " + url);
		Object result = serviceRequestRepository.fetchResult(url, request);
		log.info("Result from fetchResult method: " + result);
		DemandResponse response = null;
		try {
			response = mapper.convertValue(result, DemandResponse.class);
			log.info("Demand response mapper: " + response);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response of create demand");
		}
		return response.getDemands();
	}

	/**
	 * Updates the demand
	 *
	 * @param requestInfo The RequestInfo of the calculation Request
	 * @param demands     The demands to be updated
	 * @return The list of demand updated
	 */
	public List<Demand> updateDemand(RequestInfo requestInfo, List<Demand> demands) {
		StringBuilder url = new StringBuilder(config.getBillingServiceHost());
		url.append(config.getDemandUpdateEndPoint());
		DemandRequest request = DemandRequest.builder().demands(demands).requestInfo(requestInfo).build();

		Object result = serviceRequestRepository.fetchResult(url, request);
		DemandResponse response = null;
		try {
			response = mapper.convertValue(result, DemandResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response of update demand");
		}
		return response.getDemands();

	}
	public List<Demand> getDemandsByConsumerCode(List<String> rentableIds) {
		if (rentableIds == null || rentableIds.isEmpty()) {
			return Collections.emptyList(); // avoid "IN ()" SQL
		}

		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (:rentableIds)";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("rentableIds", rentableIds);

		try {
			return namedParameterJdbcTemplate.query(sql, params, demandRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}
	
	public Demand getDemandsByConsumerCodeAndPerioud(String rentableIds,long startDate,long endDate) {
		
		if (rentableIds == null) {
			return null; // avoid "IN ()" SQL
		}

		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (:rentableIds) AND taxperiodfrom=:startDate and taxperiodto=:endDate";

		MapSqlParameterSource params = new MapSqlParameterSource()
				.addValue("rentableIds", Arrays.asList(rentableIds))
				.addValue("startDate", startDate)
				.addValue("endDate", endDate);;

		try {
			return namedParameterJdbcTemplate.query(sql, params, demandRowMapper).stream().findFirst().orElse(null);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}
	
	public List<Demand> getDemandsByConsumerCodeByOrderBy(List<String> rentableIds) {
		if (rentableIds == null || rentableIds.isEmpty()) {
			return Collections.emptyList(); // avoid "IN ()" SQL
		}

		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (:rentableIds) ORDER BY textperiodto DESC";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("rentableIds", rentableIds);

		try {
			return namedParameterJdbcTemplate.query(sql, params, demandRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}

	public List<DemandDetail> getDemandsDetailsByDemandId(List<String> rentableIds) {
		if (rentableIds == null || rentableIds.isEmpty()) {
			return Collections.emptyList(); 
		}

		String query = "SELECT * FROM egbs_demanddetail_v1 WHERE demandid IN (:rentableIds)";

		MapSqlParameterSource params = new MapSqlParameterSource().addValue("rentableIds", rentableIds);

		try {
			return namedParameterJdbcTemplate.query(query, params, demandDetailRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}
}
