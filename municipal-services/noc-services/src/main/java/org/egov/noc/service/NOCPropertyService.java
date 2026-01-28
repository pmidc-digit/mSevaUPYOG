package org.egov.noc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import org.egov.noc.config.NOCConfiguration;
import org.egov.noc.repository.ServiceRequestRepository;
import org.egov.noc.web.model.Noc;
import org.egov.noc.web.model.NocRequest;
import org.egov.noc.web.model.bpa.Address;
import org.egov.noc.web.model.property.Property;
import org.egov.noc.web.model.property.PropertyRequest;
import org.egov.noc.web.model.property.PropertyResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NOCPropertyService {

	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	private NOCConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public StringBuilder getPropertyCreateURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertyCreateEndpoint());
	}

	public StringBuilder getPropertyURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertySearchEndpoint());
	}



	public void createProperty(NocRequest nocRequest) {
		Noc noc = nocRequest.getNoc();
		Property property = createPropertFromNOC(noc);

		PropertyRequest propertyRequest = PropertyRequest.builder().property(property)
				.requestInfo(nocRequest.getRequestInfo()).build();

		Object result = serviceRequestRepository.fetchResult(getPropertyCreateURL(), propertyRequest);
		List<Property> propertyList = getPropertyDetails(result);
		String propertyId = propertyList.isEmpty() ? null : propertyList.stream().findFirst().get().getPropertyId();
		if (propertyId == null) {
			throw new CustomException("PROPERTY CREATION ERROR", "Property services error");

		}
		Object object = nocRequest.getNoc().getNocDetails().getAdditionalDetails();
		if (object instanceof Map) {
			Map<String, Object> additionalDetails = (Map<String, Object>) object;
			additionalDetails.put("propertyuid", propertyId);
			nocRequest.getNoc().getNocDetails().setAdditionalDetails(additionalDetails);
		} else {
			Map<String, Object> additionalDetails = new HashMap<>();
			additionalDetails.put("propertyuid", propertyId);
			nocRequest.getNoc().getNocDetails().setAdditionalDetails(additionalDetails);
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
		Map<String, Object>  district = (Map<String, Object>) siteDetails.get("district");
		address.setDistrict((String) district.get("districtName"));
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

	private Property createPropertFromNOC(Noc noc) {
		
		Map<String,Object> additionalDetails = (Map<String, Object>)noc.getNocDetails().getAdditionalDetails();
		Map<String, Object> siteDetails = (Map<String, Object>) additionalDetails.get("siteDetails");
		Address address = buildAddressFromSiteDetails(siteDetails);
		address.setId("");
		address.setAuditDetails(null);
		
		noc.getOwners().stream().forEach(owner -> {
			if(owner.getOwnerType() == null)
				owner.setOwnerType("NONE");
		});
		
		return Property.builder()
				.address(address).accountId(noc.getAccountId())
				.landArea(Double.valueOf(siteDetails.get("specificationPlotArea").toString()))
				.usageCategory(null)
				.ownershipCategory(null)
				.owners(noc.getOwners())
				.tenantId(noc.getTenantId())
				.propertyType("VACANT")
				.build();
		
	}

}
