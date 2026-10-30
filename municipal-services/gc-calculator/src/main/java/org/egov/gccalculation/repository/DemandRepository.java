package org.egov.gccalculation.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.gccalculation.config.GCCalculationConfiguration;
import org.egov.gccalculation.web.models.Demand;
import org.egov.gccalculation.web.models.DemandNotificationObj;
import org.egov.gccalculation.web.models.DemandRequest;
import org.egov.gccalculation.web.models.DemandResponse;
import org.egov.gccalculation.producer.GCCalculationProducer;
import org.egov.gccalculation.repository.builder.DemandQueryBuilder;
import org.egov.gccalculation.repository.rowmapper.DemandRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.util.CollectionUtils;

@Repository
public class DemandRepository {

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private GCCalculationConfiguration config;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private GCCalculationProducer wsCalculationProducer;

	@Autowired
	private DemandQueryBuilder demandQueryBuilder;

	@Autowired
	private DemandRowMapper demandRowMapper;
	@Autowired
	private JdbcTemplate jdbcTemplate;

	/**
	 * Creates demand
	 * 
	 * @param requestInfo The RequestInfo of the calculation Request
	 * @param demands     The demands to be created
	 * @return The list of demand created
	 */
	public List<Demand> saveDemand(RequestInfo requestInfo, List<Demand> demands,
			DemandNotificationObj notificationObj) {
		StringBuilder url = new StringBuilder(config.getBillingServiceHost());
		url.append(config.getDemandCreateEndPoint());
		DemandRequest request = new DemandRequest(requestInfo, demands);
		try {
			Object result = serviceRequestRepository.fetchResult(url, request);
			List<Demand> demandList = mapper.convertValue(result, DemandResponse.class).getDemands();
			if (!CollectionUtils.isEmpty(demandList)) {
				notificationObj.setSuccess(true);
				wsCalculationProducer.push(config.getOnDemandsSaved(), notificationObj);
			}
			return demandList;
		} catch (IllegalArgumentException e) {
			notificationObj.setSuccess(false);
			wsCalculationProducer.push(config.getOnDemandsFailure(), notificationObj);
			throw new CustomException("EG_WS_PARSING_ERROR", "Failed to parse response of create demand");
		}
	}
	 /**
     * Creates demand
     * @param requestInfo The RequestInfo of the calculation Request
     * @param demands The demands to be created
     * @return The list of demand created
     */
    public List<Demand> saveDemand(RequestInfo requestInfo, List<Demand> demands){
        StringBuilder url = new StringBuilder(config.getBillingServiceHost());
        url.append(config.getDemandCreateEndPoint());
        DemandRequest request = new DemandRequest(requestInfo,demands);
        Object result = serviceRequestRepository.fetchResult(url, request);
        try{
           return  mapper.convertValue(result,DemandResponse.class).getDemands();
        }
        catch(IllegalArgumentException e){
            throw new CustomException("PARSING_ERROR","Failed to parse response of create demand");
        }
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
		try {
			return mapper.convertValue(result, DemandResponse.class).getDemands();
		} catch (IllegalArgumentException e) {
			throw new CustomException("EG_WS_PARSING_ERROR", "Failed to parse response of update demand");
		}
	}

	/**
	 * Fetches demand from DB based on a map of business code and set of consumer
	 * codes
	 * 
	 * @param businessConsumercodeMap
	 * @param tenantId
	 * @return
	 */
	public List<Demand> getDemandsForConsumerCodes(Set<String> businessConsumercodes, String tenantId) {

		List<Object> presparedStmtList = new ArrayList<>();
		String sql = demandQueryBuilder.getDemandQueryForConsumerCodes(businessConsumercodes, presparedStmtList,
				tenantId);
		return jdbcTemplate.query(sql, presparedStmtList.toArray(), demandRowMapper);
	}

}
