package org.egov.gccalculation.util;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.gccalculation.config.GCCalculationConfiguration;
import org.egov.gccalculation.constants.GCCalculationConstant;
import org.egov.gccalculation.web.models.*;
import org.egov.gccalculation.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;

@Component
@Getter
public class GCCalculationUtil {

	@Autowired
	private GCCalculationConfiguration configurations;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper objectMapper;

	@Value("${egov.property.service.host}")
	private String propertyHost;

	@Value("${egov.property.searchendpoint}")
	private String searchPropertyEndPoint;

	private final String tenantId = "tenantId=";
	private final String mobileNumber = "mobileNumber=";
	private final String propertyIds = "propertyIds=";
	private final String uuids = "uuids=";

	/**
	 * Returns the tax head search Url with tenantId and WS service name parameters
	 * 
	 * @param tenantId Tenant Id
	 * @param serviceFieldValue Service Field Value
	 * @return Returns Tax Period Search URL
	 */
	public StringBuilder getTaxPeriodSearchUrl(String tenantId, String serviceFieldValue) {
		return new StringBuilder().append(configurations.getBillingServiceHost())
				.append(configurations.getTaxPeriodSearchEndpoint()).append(GCCalculationConstant.URL_PARAMS_SEPARATER)
				.append(GCCalculationConstant.TENANT_ID_FIELD_FOR_SEARCH_URL).append(tenantId)
				.append(GCCalculationConstant.SEPARATER).append(GCCalculationConstant.SERVICE_FIELD_FOR_SEARCH_URL)
				.append(serviceFieldValue);
	}

	/**
	 * Returns the tax head search Url with tenantId and WS service name parameters
	 * 
	 * @param tenantId TenantId
	 * @param serviceFieldValue Service Field Value
	 * @return Returns the Tax Head Search URL
	 */
	public StringBuilder getTaxHeadSearchUrl(String tenantId, String serviceFieldValue) {

		return new StringBuilder().append(configurations.getBillingServiceHost())
				.append(configurations.getTaxheadsSearchEndpoint()).append(GCCalculationConstant.URL_PARAMS_SEPARATER)
				.append(GCCalculationConstant.TENANT_ID_FIELD_FOR_SEARCH_URL).append(tenantId)
				.append(GCCalculationConstant.SEPARATER).append(GCCalculationConstant.SERVICE_FIELD_FOR_SEARCH_URL)
				.append(serviceFieldValue);
	}

	/**
	 * method to create demand search url with demand criteria
	 *
	 * @param getBillCriteria Bill Criteria to search
	 * @return - Returns Demand Search URL
	 */
	public StringBuilder getDemandSearchUrl(GetBillCriteria getBillCriteria) {

		StringBuilder url;
		if (CollectionUtils.isEmpty(getBillCriteria.getConsumerCodes()))
			url = new StringBuilder().append(configurations.getBillingServiceHost())
					.append(configurations.getDemandSearchEndPoint()).append(GCCalculationConstant.URL_PARAMS_SEPARATER)
					.append(GCCalculationConstant.TENANT_ID_FIELD_FOR_SEARCH_URL).append(getBillCriteria.getTenantId())
					.append(GCCalculationConstant.SEPARATER)
					.append(GCCalculationConstant.CONSUMER_CODE_SEARCH_FIELD_NAME)
					.append(getBillCriteria.getConnectionId())
					.append(GCCalculationConstant.WS_CONSUMER_CODE_SEPARATOR)
					.append(getBillCriteria.getConnectionNumber())
					.append(GCCalculationConstant.SEPARATER)
					.append(GCCalculationConstant.BUSINESSSERVICE_FIELD_FOR_SEARCH_URL)
					.append("WS")
				
						;

		else {
			 url = new StringBuilder().append(configurations.getBillingServiceHost())
					.append(configurations.getDemandSearchEndPoint()).append(GCCalculationConstant.URL_PARAMS_SEPARATER)
					.append(GCCalculationConstant.TENANT_ID_FIELD_FOR_SEARCH_URL).append(getBillCriteria.getTenantId())
					.append(GCCalculationConstant.SEPARATER)
					.append(GCCalculationConstant.CONSUMER_CODE_SEARCH_FIELD_NAME)
					.append(StringUtils.join(getBillCriteria.getConsumerCodes(), ","))
					.append(GCCalculationConstant.SEPARATER)
					.append(GCCalculationConstant.BUSINESSSERVICE_FIELD_FOR_SEARCH_URL)
					.append("WS");

			 if(getBillCriteria.getIsPaymentCompleted() != null)
				 url.append(GCCalculationConstant.SEPARATER)
				 .append(GCCalculationConstant.PAYMENT_COMPLETED_SEARCH_FIELD_NAME)
				 .append(getBillCriteria.getIsPaymentCompleted());
		}

		return url;
	}

	/**
	 * Returns url for demand update Api
	 *
	 * @return Returns UpdateDemandUrl
	 */
	public StringBuilder getUpdateDemandUrl() {
		return new StringBuilder().append(configurations.getBillingServiceHost())
				.append(configurations.getDemandUpdateEndPoint());
	}

	public DemandDetailAndCollection getLatestDemandDetailByTaxHead(String taxHeadCode,
			List<DemandDetail> demandDetails) {
		List<DemandDetail> details = demandDetails.stream()
				.filter(demandDetail -> demandDetail.getTaxHeadMasterCode().equalsIgnoreCase(taxHeadCode))
				.collect(Collectors.toList());
		if (CollectionUtils.isEmpty(details))
			return null;

		BigDecimal taxAmountForTaxHead = BigDecimal.ZERO;
		BigDecimal collectionAmountForTaxHead = BigDecimal.ZERO;
		DemandDetail latestDemandDetail = null;
		long maxCreatedTime = 0L;

		for (DemandDetail detail : details) {
			taxAmountForTaxHead = taxAmountForTaxHead.add(detail.getTaxAmount());
			collectionAmountForTaxHead = collectionAmountForTaxHead.add(detail.getCollectionAmount());
			if (detail.getAuditDetails().getCreatedTime() > maxCreatedTime) {
				maxCreatedTime = detail.getAuditDetails().getCreatedTime();
				latestDemandDetail = detail;
			}
		}

		return DemandDetailAndCollection.builder().taxHeadCode(taxHeadCode).latestDemandDetail(latestDemandDetail)
				.taxAmountForTaxHead(taxAmountForTaxHead).collectionAmountForTaxHead(collectionAmountForTaxHead)
				.build();

	}

	/**
	 * 
	 * @param waterConnectionRequest
	 *            GarbageConnectionRequest containing property
	 * @return List of Property
	 */
	public List<Property> propertySearch(GarbageConnectionRequest waterConnectionRequest) {
		PropertyCriteria propertyCriteria = new PropertyCriteria();
		HashSet<String> propertyIds = new HashSet<>();
		propertyIds.add(waterConnectionRequest.getWaterConnection().getPropertyId());
		propertyCriteria.setPropertyIds(propertyIds);
		propertyCriteria.setTenantId(waterConnectionRequest.getWaterConnection().getTenantId());
		Object result = serviceRequestRepository.fetchResult(getPropertyURL(propertyCriteria),
				RequestInfoWrapper.builder().requestInfo(waterConnectionRequest.getRequestInfo()).build());
		List<Property> propertyList = getPropertyDetails(result);
		if (CollectionUtils.isEmpty(propertyList)) {
			throw new CustomException("INCORRECT_PROPERTY_ID", "PROPERTY SEARCH ERROR!");
		}
		return propertyList;
	}


	/**
	 * 
	 * @param waterConnectionRequest
	 *            GarbageConnectionRequest containing property
	 * @return List of Property
	 */
	public List<Property> propertySearch(RequestInfo requestInfo, Set<String> propertyIds, String tenantId, Long limit) {

		PropertyCriteria propertyCriteria = PropertyCriteria.builder()
				.propertyIds(propertyIds)
				.tenantId(tenantId)
				.limit(limit)
				.build();

		StringBuilder url = getPropertyURL(propertyCriteria);
		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder()
				.requestInfo(requestInfo)
				.build();

		Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);
		List<Property> propertyList = getPropertyDetails(result);
		return propertyList;
	}
	
	/**
	 * 
	 * @param waterConnectionRequest
	 *            GarbageConnectionRequest
	 */
	public Property getProperty(GarbageConnectionRequest waterConnectionRequest) {
		Optional<Property> propertyList = propertySearch(waterConnectionRequest).stream().findFirst();
		if (!propertyList.isPresent()) {
			throw new CustomException("INVALID_WATER_CONNECTION_PROPERTY",
					"Water connection cannot be enriched without property");
		}
		Property property = propertyList.get();
		if (StringUtils.isEmpty(property.getUsageCategory())) {
			throw new CustomException("INVALID_WATER_CONNECTION_PROPERTY_USAGE_TYPE",
					"Water connection cannot be enriched without property usage type");
		}
		return property;
	}

	/**
	 * Get specific unit from property for garbage connection billing
	 * 
	 * @param connection GarbageConnection with unitId
	 * @param property Property object containing units
	 * @return Property.Unit for billing calculation
	 */
	public Unit getUnitFromProperty(GarbageConnection connection, Property property) {
		String unitId = connection.getUnitId();
		
		if (StringUtils.isEmpty(unitId)) {
			throw new CustomException("UNIT_ID_REQUIRED", 
				"Unit ID is required for garbage connection calculation");
		}
		
		// Find the specific unit
		Optional<Unit> unit = property.getUnits().stream()
			.filter(u -> u.getId().equals(unitId))
			.findFirst();
		
		if (!unit.isPresent()) {
			throw new CustomException("UNIT_NOT_FOUND", 
				"Unit with ID " + unitId + " not found in property " + property.getPropertyId());
		}
		
		// Validate unit has usageCategory
		if (StringUtils.isEmpty(unit.get().getUsageCategory())) {
			throw new CustomException("UNIT_USAGE_CATEGORY_MISSING", 
				"Unit " + unitId + " does not have a usage category defined");
		}
		
		return unit.get();
	}

	/**
	 * 
	 * @param criteria Property Search Criteria
	 * @return property URL
	 */
	private StringBuilder getPropertyURL(PropertyCriteria criteria) {
		StringBuilder url = new StringBuilder(getPropertyURL());
		boolean isanyparametermatch = false;
		url.append("?");
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			isanyparametermatch = true;
			url.append(tenantId).append(criteria.getTenantId());
		}
		if (!CollectionUtils.isEmpty(criteria.getPropertyIds())) {
			if (isanyparametermatch)
				url.append("&");
			isanyparametermatch = true;
			String propertyIdsString = criteria.getPropertyIds().stream().map(propertyId -> propertyId)
					.collect(Collectors.toSet()).stream().collect(Collectors.joining(","));
			url.append(propertyIds).append(propertyIdsString);
		}
		if (!StringUtils.isEmpty(criteria.getMobileNumber())) {
			if (isanyparametermatch)
				url.append("&");
			isanyparametermatch = true;
			url.append(mobileNumber).append(criteria.getMobileNumber());
		}
		if (!CollectionUtils.isEmpty(criteria.getUuids())) {
			if (isanyparametermatch)
				url.append("&");
			String uuidString = criteria.getUuids().stream().map(uuid -> uuid).collect(Collectors.toSet()).stream()
					.collect(Collectors.joining(","));
			url.append(uuids).append(uuidString);
		}
		if ((criteria.getLimit()) != null) {
			if (isanyparametermatch)
				url.append("&");
			isanyparametermatch = true;
			url.append("limit=").append(criteria.getLimit());
		}
		return url;
	}

	/**
	 * 
	 * @param result
	 *            Response object from property service call
	 * @return List of property
	 */
	private List<Property> getPropertyDetails(Object result) {
		try {
			PropertyResponse propertyResponse = objectMapper.convertValue(result, PropertyResponse.class);
			return propertyResponse.getProperties();
		} catch (Exception ex) {
			throw new CustomException("PARSING_ERROR", "The property json cannot be parsed");
		}
	}

	public StringBuilder getPropertyURL() {
		return new StringBuilder().append(propertyHost).append(searchPropertyEndPoint);
	}
}
