package org.egov.layout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.layout.config.CLUConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;
import org.egov.layout.web.model.Clu;
import org.egov.layout.web.model.CluRequest;
import org.egov.layout.web.model.bpa.Address;
import org.egov.layout.web.model.property.Property;
import org.egov.layout.web.model.property.PropertyCriteria;
import org.egov.layout.web.model.property.PropertyRequest;
import org.egov.layout.web.model.property.PropertyResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CLUPropertyService {

	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	private CLUConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public StringBuilder getPropertyCreateURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertyCreateEndpoint());
	}

	public StringBuilder getPropertyURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertySearchEndpoint());
	}



	public void createProperty(CluRequest cluRequest) {
		Clu clu = cluRequest.getLayout();
		Property property = createPropertFromCLU(clu);

		PropertyRequest propertyRequest = PropertyRequest.builder().property(property)
				.requestInfo(cluRequest.getRequestInfo()).build();

		Object result = serviceRequestRepository.fetchResult(getPropertyCreateURL(), propertyRequest);
		List<Property> propertyList = getPropertyDetails(result);
		String propertyId = propertyList.isEmpty() ? null : propertyList.stream().findFirst().get().getPropertyId();
		if (propertyId == null) {
			throw new CustomException("PROPERTY CREATION ERROR", "Property services error");

		}
		Object object = cluRequest.getLayout().getNocDetails().getAdditionalDetails();
		if (object instanceof Map) {
			Map<String, Object> additionalDetails = (Map<String, Object>) object;
			additionalDetails.put("propertyuid", propertyId);
			cluRequest.getLayout().getNocDetails().setAdditionalDetails(additionalDetails);
		} else {
			Map<String, Object> additionalDetails = new HashMap<>();
			additionalDetails.put("propertyuid", propertyId);
			cluRequest.getLayout().getNocDetails().setAdditionalDetails(additionalDetails);
		}

	}

	public List<Property> getPropertyDetails(Object result) {

		try {
			DocumentContext context = JsonPath.using(Configuration.defaultConfiguration()).parse(result);
			context.put("Properties.*.owners.*", "status", true);
			PropertyResponse propertyResponse = objectMapper.convertValue(result, PropertyResponse.class);
			return propertyResponse.getProperties();
		} catch (Exception ex) {
			throw new CustomException("PARSING_ERROR", "The property json cannot be parsed");
		}
	}
	private Address buildAddressFromSiteDetails(Map<String, Object> siteDetails) {

		Address address = new Address();

		address.setPlotNo((String) siteDetails.get("plotNo"));
		address.setDistrict((String) siteDetails.get("district"));
		address.setAdditionDetails((String) siteDetails.get("proposedSiteAddress"));

		Map<String, Object> ulb = (Map<String, Object>) siteDetails.get("ulbName");
		if (ulb != null) {
			address.setTenantId((String) ulb.get("code"));

			Map<String, Object> city = (Map<String, Object>) ulb.get("city");
			if (city != null) {
				address.setCity((String) city.get("name"));
			}
		}

		return address;
	}

	private Property createPropertFromCLU(Clu clu) {
		
		Map<String,Object> additionalDetails = (Map<String, Object>)clu.getNocDetails().getAdditionalDetails();
		Map<String, Object> siteDetails = (Map<String, Object>) additionalDetails.get("siteDetails");
		Address address = buildAddressFromSiteDetails(siteDetails);
		address.setId("");
		address.setAuditDetails(null);
		
		clu.getOwners().stream().forEach(owner -> {
			if(owner.getOwnerType() == null)
				owner.setOwnerType("NONE");
		});
		
		return Property.builder()
				.address(address).accountId(clu.getAccountId())
				.landArea(Double.valueOf(siteDetails.get("netTotalArea").toString()))
				.usageCategory(null)
				.ownershipCategory(null)
				.owners(clu.getOwners())
				.tenantId(clu.getTenantId())
				.propertyType("VACANT")
				.build();
		
	}

}
