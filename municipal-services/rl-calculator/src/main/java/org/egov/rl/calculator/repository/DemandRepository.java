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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
	private JdbcTemplate jdbcTemplate;

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

		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (?)";

		Object[] params;	
		params = new Object[]{
				rentableIds
				};
		try {
			return jdbcTemplate.query(sql, params, demandRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}

	public List<String> getDistinctTenantIds() {
		String sql = "SELECT tenant_id FROM eg_rl_allotment GROUP BY tenant_id";
		return jdbcTemplate.queryForList(sql, String.class);
	}

	public Demand getDemandsByConsumerCodeAndPerioud(String rentableIds, long startDate, long endDate) {

		if (rentableIds == null) {
			return null; // avoid "IN ()" SQL
		}

		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (?) AND taxperiodfrom=? and taxperiodto=?";
		
		Object[] params;	
		params = new Object[]{
				rentableIds,
				startDate,
				endDate
				};

		try {
			return jdbcTemplate.query(sql, params, demandRowMapper).stream().findFirst().orElse(null);
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
		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (?) ORDER BY textperiodto DESC";
		Object[] params;	
		params = new Object[]{
				rentableIds
				};
		try {
			return jdbcTemplate.query(sql, params, demandRowMapper);
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

		String query = "SELECT * FROM egbs_demanddetail_v1 WHERE demandid IN (?)";

		Object[] params;	
		params = new Object[]{
				rentableIds
				};
		try {
			return jdbcTemplate.query(query, params, demandDetailRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}
}
