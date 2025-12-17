package org.egov.rl.calculator.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;

import org.egov.rl.calculator.repository.rowmapper.DemandRowMapper;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandRequest;
import org.egov.rl.calculator.web.models.demand.DemandResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
		System.out.println("Request object for fetchResult: " + request);
		System.out.println("URL for fetchResult: " + url);
		Object result = serviceRequestRepository.fetchResult(url, request);
		System.out.println("Result from fetchResult method: " + result);
		DemandResponse response = null;
		try {
			response = mapper.convertValue(result, DemandResponse.class);
			System.out.println("Demand response mapper: " + response);
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
		DemandRequest request = new DemandRequest(requestInfo, demands);
		Object result = serviceRequestRepository.fetchResult(url, request);
		DemandResponse response = null;
		try {
			response = mapper.convertValue(result, DemandResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response of update demand");
		}
		return response.getDemands();

	}

	public List<Demand> getDemandsForRentableIdsAndPeriod(List<String> rentableIds, Long fromDate, Long toDate) {
		String query = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (:rentableIds) AND taxperiodfrom >= :fromDate AND taxperiodto <= :toDate";
		Map<String, Object> params = new HashMap<>();
		params.put("rentableIds", rentableIds);
		params.put("fromDate", fromDate);
		params.put("toDate", toDate);
		Object[] queryParams = new Object[] {
				params.get("rentableIds"),
				params.get("fromDate"),
				params.get("toDate")
		};
		try {
			return jdbcTemplate.query(query, queryParams, new DemandRowMapper());
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR", "Failed to fetch demands for the given rentable IDs and period");
		}
	}
}
