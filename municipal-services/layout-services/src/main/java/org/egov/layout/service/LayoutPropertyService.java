package org.egov.layout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;

import org.egov.layout.web.model.Layout;
import org.egov.layout.web.model.LayoutRequest;
import org.egov.layout.web.model.bpa.Address;

import org.egov.layout.web.model.property.Property;
import org.egov.layout.web.model.property.PropertyRequest;
import org.egov.layout.web.model.property.PropertyResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LayoutPropertyService {

	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	private LAYOUTConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public StringBuilder getPropertyCreateURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertyCreateEndpoint());
	}

	public StringBuilder getPropertyURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertySearchEndpoint());
	}



	public void createProperty(LayoutRequest layoutRequest) {
		Layout layout = layoutRequest.getLayout();
		Property property = createPropertFromCLU(layout);

		PropertyRequest propertyRequest = PropertyRequest.builder().property(property)
				.requestInfo(layoutRequest.getRequestInfo()).build();

		Object result = serviceRequestRepository.fetchResult(getPropertyCreateURL(), propertyRequest);
		List<Property> propertyList = getPropertyDetails(result);
		String propertyId = propertyList.isEmpty() ? null : propertyList.stream().findFirst().get().getPropertyId();
		if (propertyId == null) {
			throw new CustomException("PROPERTY CREATION ERROR", "Property services error");

		}
		Object object = layoutRequest.getLayout().getNocDetails().getAdditionalDetails();
		if (object instanceof Map) {
			Map<String, Object> additionalDetails = (Map<String, Object>) object;
			additionalDetails.put("propertyuid", propertyId);
			layoutRequest.getLayout().getNocDetails().setAdditionalDetails(additionalDetails);
		} else {
			Map<String, Object> additionalDetails = new HashMap<>();
			additionalDetails.put("propertyuid", propertyId);
			layoutRequest.getLayout().getNocDetails().setAdditionalDetails(additionalDetails);
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

	private Property createPropertFromCLU(Layout layout) {
		
		Map<String,Object> additionalDetails = (Map<String, Object>)layout.getNocDetails().getAdditionalDetails();
		Map<String, Object> siteDetails = (Map<String, Object>) additionalDetails.get("siteDetails");
		Address address = Address.builder()
				.tenantId(layout.getTenantId())
				.plotNo(siteDetails.getOrDefault("plotNo",
						"").toString())
				.district(siteDetails.getOrDefault("district",
						"").toString())
				.city(siteDetails.get("ulbName").toString())
				.build();
		address.setId("");
		address.setAuditDetails(null);
		
		layout.getOwners().stream().forEach(owner -> {
			if(owner.getOwnerType() == null)
				owner.setOwnerType("NONE");
		});
		
		return Property.builder()
				.address(address).accountId(layout.getAccountId())
				.landArea(Double.valueOf(siteDetails.get("netTotalArea").toString()))
				.usageCategory(null)
				.ownershipCategory(null)
				.owners(layout.getOwners())
				.tenantId(layout.getTenantId())
				.propertyType("VACANT")
				.build();
		
	}

}
