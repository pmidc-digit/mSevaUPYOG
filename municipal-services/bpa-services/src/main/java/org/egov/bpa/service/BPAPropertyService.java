package org.egov.bpa.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.egov.bpa.config.BPAConfiguration;
import org.egov.bpa.repository.ServiceRequestRepository;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.BPARequest;
import org.egov.bpa.web.model.RequestInfoWrapper;
import org.egov.bpa.web.model.enums.CreationReason;
import org.egov.bpa.web.model.landInfo.Address;
import org.egov.bpa.web.model.landInfo.LandInfo;
import org.egov.bpa.web.model.property.Channel;
import org.egov.bpa.web.model.property.Property;
import org.egov.bpa.web.model.property.PropertyCriteria;
import org.egov.bpa.web.model.property.PropertyRequest;
import org.egov.bpa.web.model.property.PropertyResponse;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.tracer.model.CustomException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

@Service
public class BPAPropertyService {

	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	private BPAConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public StringBuilder getPropertyCreateURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertyCreateEndpoint());
	}

	public StringBuilder getPropertyURL() {
		return new StringBuilder().append(config.getPropertyHost()).append(config.getPropertySearchEndpoint());
	}

	public List<Property> propertySearch(List<String> propertyId, BPARequest bpaRequest) {
		PropertyCriteria propertyCriteria = new PropertyCriteria();
		HashSet<String> propertyIds = new HashSet<>();
		propertyIds.addAll(propertyIds);
		propertyCriteria.setPropertyIds(propertyIds);
		propertyCriteria.setTenantId(bpaRequest.getBPA().getTenantId());

		propertyCriteria.setTenantId(bpaRequest.getBPA().getTenantId());
		if (bpaRequest.getRequestInfo().getUserInfo() != null
				&& "EMPLOYEE".equalsIgnoreCase(bpaRequest.getRequestInfo().getUserInfo().getType())) {
			propertyCriteria.setTenantId(bpaRequest.getBPA().getTenantId());
		}
		if (bpaRequest.getRequestInfo().getUserInfo() != null
				&& "SYSTEM".equalsIgnoreCase(bpaRequest.getRequestInfo().getUserInfo().getType())
				&& "INTERNAL_MICROSERVICE_ROLE"
						.equalsIgnoreCase(bpaRequest.getRequestInfo().getUserInfo().getRoles().get(0).getCode())) {

		}
		if (bpaRequest.getRequestInfo().getUserInfo() != null
				&& "SYSTEM".equalsIgnoreCase(bpaRequest.getRequestInfo().getUserInfo().getType())
				&& !("INTERNAL_MICROSERVICE_ROLE"
						.equalsIgnoreCase(bpaRequest.getRequestInfo().getUserInfo().getRoles().get(0).getCode()))) {
			bpaRequest.getRequestInfo().getUserInfo().setType("EMPLOYEE");
			List<Role> oldRoles = bpaRequest.getRequestInfo().getUserInfo().getRoles();
			List<Role> newRoles = new ArrayList<>();
			for (Role role : oldRoles) {
				if (!role.getCode().equalsIgnoreCase("ANONYMOUS"))
					newRoles.add(role);
			}
			bpaRequest.getRequestInfo().getUserInfo().setRoles(newRoles);
			HashMap<String, Object> addDetail = objectMapper.convertValue(bpaRequest.getBPA().getAdditionalDetails(),
					HashMap.class);
			propertyCriteria.setTenantId(bpaRequest.getBPA().getTenantId());
//			propertyCriteria.setLocality(addDetail.get(localityCode).toString());
		}
		Object result = serviceRequestRepository.fetchResult(
				getPropertyURL(propertyId.get(0), bpaRequest, propertyCriteria, bpaRequest.getRequestInfo()),
				RequestInfoWrapper.builder().requestInfo(bpaRequest.getRequestInfo()).build());
		List<Property> propertyList = getPropertyDetails(result);
		if (CollectionUtils.isEmpty(propertyList)) {
			throw new CustomException("INCORRECT_PROPERTY_ID",
					"Incorrect Property Id. Water Connection cannot be created.");
		}
		return propertyList;
	}

	public void createProperty(BPARequest bpaRequest) {
		BPA bpa = bpaRequest.getBPA();
		LandInfo landInfo = bpa.getLandInfo();

		Property property = createPropertFromBPA(bpa);

		PropertyRequest propertyRequest = PropertyRequest.builder().property(property)
				.requestInfo(bpaRequest.getRequestInfo()).build();

		Object result = serviceRequestRepository.fetchResult(getPropertyCreateURL(), propertyRequest);
		List<Property> propertyList = getPropertyDetails(result);
		String propertyId = propertyList.isEmpty() ? null : propertyList.stream().findFirst().get().getPropertyId();
		if (propertyId == null) {
			throw new CustomException("PROPERTY CREATION ERROR", "Property services error");

		}
		Object object = bpaRequest.getBPA().getAdditionalDetails();
		if (object instanceof Map) {
			Map<String, Object> additionalDetails = (Map<String, Object>) object;
			additionalDetails.put("propertyuid", propertyId);
			bpaRequest.getBPA().setAdditionalDetails(additionalDetails);
		} else {
			Map<String, Object> additionalDetails = new HashMap<>();
			additionalDetails.put("propertyuid", propertyId);
			bpaRequest.getBPA().setAdditionalDetails(additionalDetails);
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

	public StringBuilder getPropertyURL(String propertyIds, BPARequest bpaRequest, PropertyCriteria criteria,
			RequestInfo requestInfo) {
		StringBuilder url = new StringBuilder(getPropertyURL());
		boolean iscitizen = requestInfo.getUserInfo().getType().equalsIgnoreCase("CITIZEN") && requestInfo.getUserInfo()
				.getRoles().stream().map(Role::getCode).collect(Collectors.toSet()).contains("CITIZEN");
		boolean isanyparametermatch = false;
		url.append("?");
		if (!iscitizen) {
			if (!StringUtils.isEmpty(criteria.getTenantId())) {
				isanyparametermatch = true;
				url.append(bpaRequest.getBPA().getTenantId()).append(criteria.getTenantId());
			}
		} else {

			if (!StringUtils.isEmpty(criteria.getTenantId())) {
				isanyparametermatch = true;
				url.append(bpaRequest.getBPA().getTenantId()).append("pb");
			}

		}
		if (!CollectionUtils.isEmpty(criteria.getPropertyIds())) {
			if (isanyparametermatch)
				url.append("&");
			isanyparametermatch = true;
			String propertyIdsString = criteria.getPropertyIds().stream().map(propertyId -> propertyId)
					.collect(Collectors.toSet()).stream().collect(Collectors.joining(","));
			url.append(propertyIds).append(propertyIdsString);
		}
//			if (!StringUtils.isEmpty(criteria.getMobileNumber())) {
//				if (isanyparametermatch)url.append("&");
//				isanyparametermatch = true;
//				url.append(mobileNumber).append(criteria.getMobileNumber());
//			}
//			if (!StringUtils.isEmpty(criteria.getDoorNo())) {
//				if (isanyparametermatch)url.append("&");
//				isanyparametermatch = true;
//				url.append(doorNo).append(criteria.getDoorNo());
//			}
//			if (!StringUtils.isEmpty(criteria.getName())) {
//				if (isanyparametermatch)url.append("&");
//				isanyparametermatch = true;
//				url.append(name).append(criteria.getName());
//			}
//			if (!StringUtils.isEmpty(criteria.getLocality())) {
//				if (isanyparametermatch)url.append("&");
//				isanyparametermatch = true;
//				url.append(locality).append(criteria.getLocality());
//			}
//			if (!CollectionUtils.isEmpty(criteria.getUuids())) {
//				if (isanyparametermatch)url.append("&");
//				String uuidString = criteria.getUuids().stream().map(uuid -> uuid).collect(Collectors.toSet()).stream()
//						.collect(Collectors.joining(","));
//				url.append(uuids).append(uuidString);
//			}
		return url;
	}
	
	private Property createPropertFromBPA(BPA bpa) {
		
		Map<String,Object> additionalDetails = (Map<String, Object>)bpa.getAdditionalDetails();
		
		Address address = objectMapper.convertValue(bpa.getLandInfo().getAddress(), Address.class);
		address.setId("");
		address.setAuditDetails(null);
		
		bpa.getLandInfo().getOwners().stream().forEach(owner -> {
			if(owner.getOwnerType() == null)
				owner.setOwnerType("NONE");
		});
		
		return Property.builder()
				.address(address).accountId(bpa.getAccountId())
				.landArea(Double.valueOf(additionalDetails.get("area").toString()))
				.usageCategory((String)additionalDetails.get("usage").toString().toUpperCase())
				.ownershipCategory(bpa.getLandInfo().getOwnershipCategory())
				.owners(bpa.getLandInfo().getOwners())
				.tenantId(bpa.getTenantId())
				.propertyType("VACANT")
				.build();
		
	}

}
