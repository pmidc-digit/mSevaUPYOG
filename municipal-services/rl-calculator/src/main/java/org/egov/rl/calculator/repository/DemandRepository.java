package org.egov.rl.calculator.repository;

import com.fasterxml.jackson.databind.JsonNode;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

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
			return Collections.emptyList();
		}
		List<Object> preparedStmtList = new ArrayList<>();

		String placeholders = rentableIds.stream().map(id -> "?").collect(Collectors.joining(", "));
		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (" + placeholders + ") ORDER BY createdtime DESC LIMIT 1";
		preparedStmtList.addAll(rentableIds);
		try {
			return jdbcTemplate.query(sql, preparedStmtList.toArray(), demandRowMapper);
		} catch (NoSuchElementException e) {
			return Collections.emptyList();
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}
	
	public List<Demand> getDemandsNotiByConsumerCode(List<String> rentableIds) {
		if (rentableIds == null || rentableIds.isEmpty()) {
			return Collections.emptyList();
		}
		List<Object> preparedStmtList = new ArrayList<>();

		String placeholders = rentableIds.stream().map(id -> "?").collect(Collectors.joining(", "));
		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (" + placeholders + ") AND ispaymentcompleted=false ORDER BY createdtime DESC LIMIT 1";
		preparedStmtList.addAll(rentableIds);
		try {
			return jdbcTemplate.query(sql, preparedStmtList.toArray(), demandRowMapper);
		} catch (NoSuchElementException e) {
			return Collections.emptyList();
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

	public Demand getDemandsByConsumerCodeAndPerioud(String consumercode, long startDate, long endDate) {

		List<Object> preparedStmtList = new ArrayList<>();
		List<Object> subQueryParams = new ArrayList<>();

		if (consumercode == null) {
			return null; // avoid "IN ()" SQL
		}

		String sql = "SELECT * FROM egbs_demand_v1 WHERE status = 'ACTIVE' AND consumercode IN (?) AND taxperiodfrom=? and taxperiodto=?";

		subQueryParams.add(consumercode);
		subQueryParams.add(startDate);
		subQueryParams.add(endDate);
		try {

			preparedStmtList.addAll(subQueryParams);
			return jdbcTemplate.query(sql, preparedStmtList.toArray(), demandRowMapper).stream().findFirst()
					.orElse(null);
		} catch (NoSuchElementException e) {
			return null;
		} catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}

	public List<Demand> getDemandsByConsumerCodeByOrderBy(List<String> applicationNumber) {
		if (applicationNumber == null || applicationNumber.isEmpty()) {
			return Collections.emptyList();
		}
		List<Object> preparedStmtList = new ArrayList<>();

		String placeholders = applicationNumber.stream().map(id -> "?").collect(Collectors.joining(", "));
		String sql = "SELECT * FROM egbs_demand_v1 WHERE consumercode IN (" + placeholders + ") ORDER BY textperiodto DESC limit 1";
		preparedStmtList.addAll(applicationNumber);
		try {
			return jdbcTemplate.query(sql, preparedStmtList.toArray(), demandRowMapper);
		} catch (NoSuchElementException e) {
			return Collections.emptyList();
		}  catch (Exception e) {
			log.error("Error while fetching demands for rentable IDs and period", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demands for the given rentable IDs and period");
		}
	}

	public List<DemandDetail> getDemandsDetailsByDemandId(List<String> dId) {
		if (dId == null || dId.isEmpty()) {
			return Collections.emptyList();
		}
		List<Object> preparedStmtList = new ArrayList<>();

		String placeholders = dId.stream().map(id -> "?").collect(Collectors.joining(", "));
		String query = "SELECT * FROM egbs_demanddetail_v1 WHERE demandid IN (" + placeholders + ")";
		preparedStmtList.addAll(dId);
		try {
			return jdbcTemplate.query(query, preparedStmtList.toArray(), demandDetailRowMapper);
		} catch (NoSuchElementException e) {
			return Collections.emptyList();
		} catch (Exception e) {
			log.error("Error while fetching demand details for IDs", e);
			throw new CustomException("DEMAND_FETCH_ERROR",
					"Failed to fetch demand details for the given IDs");
		}
	}

	/**
	 * Fetches ALL unpaid ACTIVE rl-services demands for a tenant (and optionally a consumerCode).
	 * No expiry-based pre-filtering — the caller (sendNotificationUpdateDemand) applies
	 * {@code getDueCutoffEpoch(taxPeriodFrom, dueDay)} in Java as the authoritative overdue check.
	 */
	public List<Demand> getExpiredUnpaidDemands(String tenantId, long currentTime, String consumerCode) {
		List<Object> preparedStmtList = new ArrayList<>();

		StringBuilder queryBuilder = new StringBuilder(
			"SELECT * FROM egbs_demand_v1 " +
			"WHERE tenantid = ? " +
			"  AND ispaymentcompleted = false " +
			"  AND businessservice = 'rl-services' " +
			"  AND status = 'ACTIVE'"
		);
		preparedStmtList.add(tenantId);

		if (consumerCode != null && !consumerCode.trim().isEmpty()) {
			queryBuilder.append(" AND consumercode = ?");
			preparedStmtList.add(consumerCode);
		}

		log.info("getExpiredUnpaidDemands SQL query: {}", queryBuilder);
		log.info("getExpiredUnpaidDemands params: tenantId={}, consumerCode={}", tenantId, consumerCode);

		try {
			List<Demand> demands = jdbcTemplate.query(queryBuilder.toString(), preparedStmtList.toArray(), demandRowMapper);
			log.info("getExpiredUnpaidDemands: total fetched from DB = {} (all unpaid ACTIVE, overdue filtering in Java)", demands.size());
			return demands;
		} catch (Exception e) {
			log.error("Error while fetching unpaid demands for tenantId={}, consumerCode={}", tenantId, consumerCode, e);
			throw new CustomException("DEMAND_FETCH_ERROR", "Failed to fetch unpaid demands");
		}
	}

	public List<Demand> getAllUnpaidDemands(String tenantId, String consumerCode) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = "SELECT * FROM egbs_demand_v1 WHERE tenantid = ? AND consumercode = ? AND businessservice = 'rl-services' AND status = 'ACTIVE' AND ispaymentcompleted = false";
		preparedStmtList.add(tenantId);
		preparedStmtList.add(consumerCode);
		try {
			return jdbcTemplate.query(query, preparedStmtList.toArray(), demandRowMapper);
		} catch (Exception e) {
			log.error("Error while fetching unpaid demands for tenant: {} and consumerCode: {}", tenantId, consumerCode, e);
			throw new CustomException("DEMAND_FETCH_ERROR", "Failed to fetch unpaid demands");
		}
	}

	/**
	 * Billing cycle ("feesPeriodCycle") per application number, read from the rl-services allotment table that
	 * lives in the same database.
	 *
	 * <p>Only used as a fallback when a demand's own billing period cannot identify its cycle - i.e. an arrear
	 * demand whose period spans the whole arrears window (see {@code DemandService.DueDateResolver}).
	 * Never throws: on any failure (missing table/column, unreadable JSON) an empty map is returned so callers
	 * keep their previous behaviour.
	 */
	public Map<String, String> getBillingCyclesByApplicationNumbers(List<String> applicationNumbers) {
		if (applicationNumbers == null || applicationNumbers.isEmpty()) {
			return Collections.emptyMap();
		}
		Map<String, String> cycleByApplication = new HashMap<>();
		try {
			String placeholders = applicationNumbers.stream().map(id -> "?").collect(Collectors.joining(", "));
			String sql = "SELECT application_number, additional_details::text AS details FROM eg_rl_allotment "
					+ "WHERE application_number IN (" + placeholders + ")";
			jdbcTemplate.query(sql, applicationNumbers.toArray(), rs -> {
				String cycle = extractFeesPeriodCycle(rs.getString("details"));
				if (cycle != null && !cycle.trim().isEmpty()) {
					cycleByApplication.put(rs.getString("application_number"), cycle.trim());
				}
			});
			log.debug("Read feesPeriodCycle for {}/{} application(s)", cycleByApplication.size(), applicationNumbers.size());
		} catch (Exception e) {
			log.warn("Could not read feesPeriodCycle from eg_rl_allotment for {} application(s): {}",
					applicationNumbers.size(), e.getMessage());
			return Collections.emptyMap();
		}
		return cycleByApplication;
	}

	/**
	 * Extracts {@code propertyDetails[0].feesPeriodCycle} from the allotment additional_details JSON.
	 * The column keeps the payload either directly or wrapped as {"value": &lt;object|json string&gt;} (see the
	 * rl-services AllotmentRowMapper), and older records store the property details as a plain array - all
	 * shapes are handled, anything else yields null.
	 */
	private String extractFeesPeriodCycle(String rawJson) {
		if (rawJson == null || rawJson.trim().isEmpty()) {
			return null;
		}
		try {
			JsonNode root = mapper.readTree(rawJson);
			JsonNode value = (root != null && root.has("value")) ? root.get("value") : root;
			if (value != null && value.isTextual()) {
				value = mapper.readTree(value.asText());
			}
			if (value == null || value.isNull()) {
				return null;
			}
			// New format: object with "propertyDetails"; old format: the property details array itself
			JsonNode propertyDetails = value.isArray() ? value : value.get("propertyDetails");
			if (propertyDetails != null && propertyDetails.isArray() && propertyDetails.size() > 0) {
				JsonNode first = propertyDetails.get(0);
				if (first != null && first.hasNonNull("feesPeriodCycle")) {
					return first.path("feesPeriodCycle").asText();
				}
			}
		} catch (Exception e) {
			log.debug("Could not parse feesPeriodCycle from allotment additional_details: {}", e.getMessage());
		}
		return null;
	}

	/**
	 * Existing, non-cancelled rl-services demands of a consumer code.
	 *
	 * <p>Used to keep demand generation idempotent: a retried {@code _calculate} (gateway/UI timeout, ops rerun)
	 * must never create a second demand for a period that already has one.
	 *
	 * <p>Fails closed - if the check itself cannot be executed the caller must not create demands, otherwise
	 * duplicates (and therefore duplicate bills) become possible.
	 */
	public List<Demand> getExistingDemands(String tenantId, String consumerCode) {
		if (consumerCode == null) {
			return Collections.emptyList();
		}
		String sql = "SELECT * FROM egbs_demand_v1 WHERE businessservice = 'rl-services' AND status <> 'CANCELLED' "
				+ "AND tenantid = ? AND consumercode = ?";
		try {
			return jdbcTemplate.query(sql, new Object[] { tenantId, consumerCode }, demandRowMapper);
		} catch (Exception e) {
			log.error("Duplicate check failed for consumer {}: {}", consumerCode, e.getMessage(), e);
			throw new CustomException("DEMAND_DUPLICATE_CHECK_FAILED",
					"Could not verify existing demands for " + consumerCode
							+ ". Refusing to create demands to avoid duplicates.");
		}
	}

	/**
	 * Demand details - tax head, tax amount and collected amount - per demand id. Needed to recognise an already
	 * existing arrear demand (its period cannot be matched exactly, its period end is the instant it was created)
	 * and to compare the stored arrears with the values in a later request without a second round trip.
	 *
	 * <p>Returns an empty map when the lookup fails; the period based duplicate check keeps working without it.
	 */
	public Map<String, List<DemandDetail>> getDemandDetailsByDemandIds(List<String> demandIds) {
		Map<String, List<DemandDetail>> detailsByDemandId = new HashMap<>();
		for (DemandDetail detail : getDemandsDetailsByDemandId(demandIds)) {
			if (detail.getDemandId() != null) {
				detailsByDemandId.computeIfAbsent(detail.getDemandId(), key -> new ArrayList<>()).add(detail);
			}
		}
		return detailsByDemandId;
	}
}
