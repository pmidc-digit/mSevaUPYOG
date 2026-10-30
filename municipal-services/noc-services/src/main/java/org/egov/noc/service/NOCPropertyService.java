package org.egov.noc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import org.egov.noc.config.NOCConfiguration;
import org.egov.noc.repository.ServiceRequestRepository;
import org.egov.noc.web.model.Noc;
import org.egov.noc.web.model.NocRequest;
import org.egov.noc.web.model.bpa.Address;
import org.egov.noc.web.model.bpa.Boundary;
import org.egov.noc.web.model.bpa.GeoLocation;
import org.egov.noc.web.model.property.Property;
import org.egov.noc.web.model.property.PropertyRequest;
import org.egov.noc.web.model.property.PropertyResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
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



	public void createProperty(NocRequest nocRequest, Object mdmsData) {
		Noc noc = nocRequest.getNoc();
		Property property = createPropertFromNOC(noc, mdmsData);

		PropertyRequest propertyRequest = PropertyRequest.builder().property(property)
				.requestInfo(nocRequest.getRequestInfo()).build();

		Object result = serviceRequestRepository.fetchResult(getPropertyCreateURL(), propertyRequest);
		List<Property> propertyList = getPropertyDetails(result);
		String propertyId = propertyList.isEmpty() ? null : propertyList.stream().findFirst().get().getPropertyId();
		if (propertyId == null) {
			throw new CustomException("PROPERTY CREATION ERROR", "Property services error");

		}
		Object object = nocRequest.getNoc().getNocDetails().getAdditionalDetails();
		DocumentContext context = JsonPath.parse(object);
		context.put("$.applicationDetails.owners.*", "propertyId", propertyId);

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

	private Property createPropertFromNOC(Noc noc, Object mdmsData) {

		Map<String,Object> additionalDetails = (Map<String, Object>)noc.getNocDetails().getAdditionalDetails();
		if (additionalDetails == null)
			throw new CustomException("INVALID_NOC_DATA", "additionalDetails is null in NOC; cannot create property.");

		Map<String, Object> siteDetails = (Map<String, Object>) additionalDetails.get("siteDetails");
		if (siteDetails == null)
			throw new CustomException("INVALID_NOC_DATA", "siteDetails is missing in additionalDetails; cannot create property.");

		// Fix P1: coordinates may be absent for older/incomplete applications — handle gracefully
		Map<String, String> coordinates = (Map<String, String>) additionalDetails.get("coordinates");
		Double latitude  = null;
		Double longitude = null;
		if (coordinates != null) {
			if (coordinates.get("Latitude1")  != null) latitude  = Double.valueOf(coordinates.get("Latitude1"));
			if (coordinates.get("Longitude1") != null) longitude = Double.valueOf(coordinates.get("Longitude1"));
		} else {
			log.warn("createPropertFromNOC: 'coordinates' is absent in additionalDetails for NOC {}. Defaulting lat/lon to null.", noc.getApplicationNo());
		}

		String buildingStatus = siteDetails.getOrDefault("buildingStatus", "").toString();
		String specificationBuildingCategory = siteDetails.getOrDefault("specificationBuildingCategory", "").toString();
		String localityCode = JsonPath.read(siteDetails, "$.localityAreaType.code");
		List<Object> floorArea = (List<Object>)siteDetails.getOrDefault("floorArea", Collections.EMPTY_LIST);

		List<String> buildingTypeList = JsonPath.read(mdmsData, "$.MdmsRes.NOC.BuildingType.[?(@.name == '" + buildingStatus + "')].code");
		List<String> propertyUsageList = JsonPath.read(mdmsData, "$.MdmsRes.NOC.BuildingCategory.[?(@.name == '" + specificationBuildingCategory + "')].propertyUsage");

		if(CollectionUtils.isEmpty(propertyUsageList))
			throw new CustomException("UPDATE ERROR", "Property Usage not found for the Building Category : " + specificationBuildingCategory);

		if(CollectionUtils.isEmpty(buildingTypeList))
			throw new CustomException("UPDATE ERROR", "Building Type code not found in MDMS for buildingStatus : " + buildingStatus);

		// Fix P1: guard netTotalArea null to avoid NullPointerException in BigDecimal constructor
		Object netTotalAreaObj = siteDetails.get("netTotalArea");
		double landArea = 0.0;
		if (netTotalAreaObj != null && !netTotalAreaObj.toString().trim().isEmpty()) {
			landArea = new BigDecimal(netTotalAreaObj.toString())
					.multiply(BigDecimal.valueOf(1.19599)).setScale(2, RoundingMode.HALF_UP).doubleValue();
		} else {
			log.warn("createPropertFromNOC: 'netTotalArea' is missing in siteDetails for NOC {}. Defaulting landArea to 0.0.", noc.getApplicationNo());
		}

		Address address = Address.builder()
				.tenantId(noc.getTenantId())
				.plotNo(siteDetails.getOrDefault("plotNo", "").toString())
				.district(siteDetails.getOrDefault("district", "").toString())
				.city(siteDetails.getOrDefault("ulbName", "").toString())
				.geoLocation(GeoLocation.builder()
						.latitude(latitude)
						.longitude(longitude).build())
				.locality(Boundary.builder().code(localityCode).build())
				.build();

		noc.getOwners().stream().forEach(owner -> {
			if(owner.getOwnerType() == null)
				owner.setOwnerType("NONE");
		});

		ObjectNode propertyAdditionalDetails = (ObjectNode)JsonNodeFactory.instance.objectNode();
		propertyAdditionalDetails.put("vasikaNo", noc.getVasikaNumber());
		propertyAdditionalDetails.put("vasikaDate", noc.getVasikaDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));

		return Property.builder()
				.address(address).accountId(noc.getAccountId())
				.landArea(landArea)
				.usageCategory(propertyUsageList.get(0))
				.ownershipCategory(noc.getOwners().size() == 1 ? "INDIVIDUAL.SINGLEOWNER" : "INDIVIDUAL.MULTIPLEOWNERS" )
				.owners(noc.getOwners())
				.tenantId(noc.getTenantId())
				.propertyType(buildingTypeList.get(0))
				.noOfFloors(Long.valueOf(floorArea != null ? floorArea.size() : 0 ))
				.additionalDetails(propertyAdditionalDetails)
				.build();

	}

}
