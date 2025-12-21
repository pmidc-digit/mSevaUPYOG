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
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collections;
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
	private DemandRowMapper demandRowMapper;

	@Autowired
	private DemandDetailRowMapper demandDetailRowMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

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
		DemandRequest request = DemandRequest.builder().demands(demands).requestInfo(requestInfo).build();

		System.out.println("request--------------" + request);
		Object result = serviceRequestRepository.fetchResult(url, request);
		DemandResponse response = null;
		try {
			response = mapper.convertValue(result, DemandResponse.class);
		} catch (IllegalArgumentException e) {
			throw new CustomException("PARSING ERROR", "Failed to parse response of update demand");
		}
		return response.getDemands();

	}

	public void updateDemandDetails(DemandDetail demandDetail) {
		try {

			String sql = "INSERT INTO egbs_demanddetail_v1("
					+ "	id, demandid, taxheadcode, taxamount, collectionamount, createdby, createdtime, tenantid)\r\n"
					+ "	VALUES (:id, :demandId, :code, :taxAmt, :colAmt, :createdby, :createdtime, :tenantId)";

			MapSqlParameterSource params = new MapSqlParameterSource()
					.addValue("id", demandDetail.getId())
					.addValue("demandId", demandDetail.getDemandId())
					.addValue("code", demandDetail.getTaxHeadMasterCode())
					.addValue("taxAmt", demandDetail.getTaxAmount())
					.addValue("colAmt", demandDetail.getCollectionAmount())
					.addValue("createdby", demandDetail.getAuditDetails().getCreatedBy())
					.addValue("createdtime", demandDetail.getAuditDetails().getCreatedTime())
					.addValue("tenantId", demandDetail.getTenantId());

			namedParameterJdbcTemplate.update(sql, params);
		} catch (Exception e) {
			log.error("Error while updating demanddetails for rentable IDs and period", e);
			throw new CustomException("DEMANDDETAILS_UPDATE_ERROR",
					"Failed to Updating demanddetails for the given rentable IDs and period");
		}
	}
	
	public void updateDemand(Demand demands) {
		try {

			String sql = "UPDATE egbs_demand_v1 SET billexpirytime= :exptime ,fixedbillexpirydate=:fexpry where id=:ids";

			MapSqlParameterSource params = new MapSqlParameterSource()
					.addValue("exptime", demands.getBillExpiryTime())
					.addValue("fexpry", demands.getFixedbillexpirydate())
					.addValue("ids", demands.getId());

			namedParameterJdbcTemplate.update(sql, params);
		} catch (Exception e) {
			log.error("Error while updating demand for rentable IDs and period", e);
			throw new CustomException("DEMAND_UPDATE_ERROR",
					"Failed to Updating demand for the given rentable IDs and period");
		}
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

//	public List<Demand> getDemandsByConsumerCode(List<String> rentableIds) {
//		String query = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (:rentableIds)";
//		Map<String, Object> params = new HashMap<>();
//		params.put("rentableIds", rentableIds);
//		Object[] queryParams = new Object[] { params.get("rentableIds") };
//		try {
//			return jdbcTemplate.query(query, queryParams, demandRowMapper);
//		} catch (Exception e) {
//			log.error("Error while fetching demands for rentable IDs and period", e);
//			throw new CustomException("DEMAND_FETCH_ERROR",
//					"Failed to fetch demands for the given rentable IDs and period");
//		}
//	}

	public List<DemandDetail> getDemandsDetailsByDemandId(List<String> rentableIds) {
		if (rentableIds == null || rentableIds.isEmpty()) {
			return Collections.emptyList(); // avoid "IN ()" SQL
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

//	
//	public List<DemandDetail> getDemandsDetailsByDemandId(List<String> rentableIds) {
//		String query = "SELECT * FROM egbs_demanddetail_v1 WHERE demandid IN (:rentableIds)";
//		Map<String, Object> params = new HashMap<>();
//		params.put("rentableIds", rentableIds);
//		Object[] queryParams = new Object[] { params.get("rentableIds") };
//		try {
//			return jdbcTemplate.query(query, queryParams, demandDetailRowMapper);
//		} catch (Exception e) {
//			log.error("Error while fetching demands for rentable IDs and period", e);
//			throw new CustomException("DEMAND_FETCH_ERROR",
//					"Failed to fetch demands for the given rentable IDs and period");
//		}
//	}
}
