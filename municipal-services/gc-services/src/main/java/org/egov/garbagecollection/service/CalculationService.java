package org.egov.garbagecollection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.repository.GcDao;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.web.models.*;
import org.egov.garbagecollection.web.models.collection.Bill;
import org.egov.garbagecollection.web.models.collection.BillResponse;
import org.egov.garbagecollection.workflow.WorkflowIntegrator;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;

@Service
@Slf4j
public class CalculationService {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
    
	@Autowired
	private GcServicesUtil gcServiceUtil;

	@Autowired
	private WorkflowIntegrator wfIntegrator;

	@Autowired
	private GCConfiguration config;

	@Autowired
	private GcDao gcDao;

	@Autowired
	private GcService gcService;

	@Autowired
	private EnrichmentService enrichmentService;

	/**
	 * 
	 * @param request
	 * 
	 * If action would be APPROVE_FOR_CONNECTION then
	 * 
	 *Estimate the fee for water application and generate the demand
	 * 
	 */
	public void calculateFeeAndGenerateDemand(GarbageConnectionRequest request, Property property) {
		if(GCConstants.APPROVE_CONNECTION_CONST.equalsIgnoreCase(request.getGarbageConnection().getProcessInstance().getAction()) && !(request.isReconnectRequest() || request.getGarbageConnection().getApplicationType().equalsIgnoreCase(GCConstants.GARBAGE_RECONNECTION))) {
			CalculationCriteria criteria = CalculationCriteria.builder()
					.applicationNo(request.getGarbageConnection().getApplicationNo())
					.garbageConnection(request.getGarbageConnection())
					.tenantId(property.getTenantId()).build();
			CalculationReq calRequest = CalculationReq.builder().calculationCriteria(Arrays.asList(criteria))
					.requestInfo(request.getRequestInfo()).isconnectionCalculation(false).isDisconnectionRequest(false).isReconnectionRequest(false).build();
			try {
				Object response = serviceRequestRepository.fetchResult(gcServiceUtil.getCalculatorURL(), calRequest);
				CalculationRes calResponse = mapper.convertValue(response, CalculationRes.class);
			} catch (Exception ex) {
				log.error("Calculation response error!!", ex);
				throw new CustomException("WATER_CALCULATION_EXCEPTION", "Calculation response can not parsed!!!");
			}
		} else if (GCConstants.APPROVE_DISCONNECTION_CONST.equalsIgnoreCase(request.getGarbageConnection().getProcessInstance().getAction())) {
			CalculationCriteria criteria = CalculationCriteria.builder()
					.applicationNo(request.getGarbageConnection().getApplicationNo())
					.garbageConnection(request.getGarbageConnection())
					.tenantId(property.getTenantId()).connectionNo(request.getGarbageConnection().getConnectionNo()).build();
			CalculationReq calRequest = CalculationReq.builder().calculationCriteria(Arrays.asList(criteria))
          .requestInfo(request.getRequestInfo()).isconnectionCalculation(false).isDisconnectionRequest(true).isReconnectionRequest(false).build();
		      
			try {
				Object response = serviceRequestRepository.fetchResult(gcServiceUtil.getCalculatorURL(), calRequest);
				CalculationRes calResponse = mapper.convertValue(response, CalculationRes.class);
			} catch (ServiceCallException e) {
				throw new ServiceCallException(e.getError());
			} catch (Exception ex) {
				log.error("Calculation response error!!", ex);
				throw new CustomException("WATER_CALCULATION_EXCEPTION", "Calculation response can not parsed!!!");
			}
		}
		else if (GCConstants.RECONNECT_DISCONNECTION_CONST.equalsIgnoreCase(request.getGarbageConnection().getProcessInstance().getAction()) && (request.isReconnectRequest() || request.getGarbageConnection().getApplicationType().equalsIgnoreCase(GCConstants.GARBAGE_RECONNECTION))) {
			CalculationCriteria criteria = CalculationCriteria.builder()
					.applicationNo(request.getGarbageConnection().getApplicationNo())
					.garbageConnection(request.getGarbageConnection())
					.tenantId(property.getTenantId()).connectionNo(request.getGarbageConnection().getConnectionNo()).build();
			CalculationReq calRequest = CalculationReq.builder().calculationCriteria(Arrays.asList(criteria))
					.requestInfo(request.getRequestInfo()).isconnectionCalculation(false).isDisconnectionRequest(false).isReconnectionRequest(true).build();
			try {
				Object response = serviceRequestRepository.fetchResult(gcServiceUtil.getCalculatorURL(), calRequest);
				CalculationRes calResponse = mapper.convertValue(response, CalculationRes.class);
			} catch (ServiceCallException e) {
				throw new ServiceCallException(e.getError());
			} catch (Exception ex) {
				log.error("Calculation response error!!", ex);
				throw new CustomException("WATER_CALCULATION_EXCEPTION", "Calculation response can not parsed!!!");
			}
		}
	}

	public boolean fetchBill(String tenantId, String connectionNo, RequestInfo requestInfo) {
		boolean isNoPayment = false;
		try {
			Object result = serviceRequestRepository.fetchResult(getFetchBillURL(tenantId, connectionNo)
					, RequestInfoWrapper.builder().requestInfo(requestInfo).build());
			BillResponse billResponse = mapper.convertValue(result, BillResponse.class);
			for (Bill bill : billResponse.getBill()) {
				if (bill.getTotalAmount().equals(BigDecimal.valueOf(0.0))) {
					isNoPayment = true;
				}
			}
		} catch (Exception ex) {
			throw new CustomException("WATER_FETCH_BILL_ERRORCODE", "Error while fetching the bill" + ex.getMessage());
		}
		return isNoPayment;
	}
	
	public boolean fetchBillForReconnect(String tenantId, String connectionNo, RequestInfo requestInfo) {
		boolean isNoPayment = false;
		try {
			Object result = serviceRequestRepository.fetchResult(getFetchBillURLForReconnect(tenantId, connectionNo)
					, RequestInfoWrapper.builder().requestInfo(requestInfo).build());
			BillResponse billResponse = mapper.convertValue(result, BillResponse.class);
			for (Bill bill : billResponse.getBill()) {
				if (bill.getTotalAmount().equals(BigDecimal.valueOf(0.0))) {
					isNoPayment = true;
				}
			}
		} catch (Exception ex) {
			throw new CustomException("WATER_FETCH_BILL_ERRORCODE", "Error while fetching the bill" + ex.getMessage());
		}
		return isNoPayment;
	}

	private StringBuilder getFetchBillURL(String tenantId, String connectionNo) {

		return new StringBuilder().append(config.getBillingServiceHost())
				.append(config.getFetchBillEndPoint()).append(GCConstants.URL_PARAMS_SEPARATER)
				.append(GCConstants.TENANT_ID_FIELD_FOR_SEARCH_URL).append(tenantId)
				.append(GCConstants.SEPARATER).append(GCConstants.CONSUMER_CODE_SEARCH_FIELD_NAME)
				.append(connectionNo).append(GCConstants.SEPARATER)
				.append(GCConstants.BUSINESSSERVICE_FIELD_FOR_SEARCH_URL)
				.append(GCConstants.WATER_TAX_SERVICE_CODE);
	}
	
	private StringBuilder getFetchBillURLForReconnect(String tenantId, String connectionNo) {

		return new StringBuilder().append(config.getBillingServiceHost())
				.append(config.getFetchBillEndPoint()).append(GCConstants.URL_PARAMS_SEPARATER)
				.append(GCConstants.TENANT_ID_FIELD_FOR_SEARCH_URL).append(tenantId)
				.append(GCConstants.SEPARATER).append(GCConstants.CONSUMER_CODE_SEARCH_FIELD_NAME)
				.append(connectionNo).append(GCConstants.SEPARATER)
				.append(GCConstants.BUSINESSSERVICE_FIELD_FOR_SEARCH_URL)
				.append("WSReconnection");
	}
}
