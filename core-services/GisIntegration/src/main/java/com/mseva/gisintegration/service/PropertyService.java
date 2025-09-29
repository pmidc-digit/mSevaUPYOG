package com.mseva.gisintegration.service;

import com.mseva.gisintegration.exception.DuplicatePropertyException;
import com.mseva.gisintegration.model.Property;
import com.mseva.gisintegration.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyService {

	private static final Logger log = LoggerFactory.getLogger(PropertyService.class);

	@Autowired
	private PropertyRepository propertyRepository;

	public Property insertProperty(Property property) {
		log.info("Inserting property with details: {}", property);
		// Ensure service field is handled if needed (usually it will be part of property object)
		// No special handling needed here unless additional logic is required
		return propertyRepository.save(property);
	}

	public List<Property> findByPropertyid(String propertyid, String tenantid) {
		return propertyRepository.findByPropertyid(propertyid, tenantid);
	}

	public List<Property> findBySurveyid(String surveyid, String tenantid) {
		return propertyRepository.findBySurveyid(surveyid, tenantid);
	}

	public java.util.List<Property> findBySurveyidAndPropertyid(String surveyid, String propertyid, String tenantid) {
		return propertyRepository.findBySurveyidAndPropertyid(surveyid, propertyid, tenantid);
	}

	public java.util.Map<String, Object> createOrUpdateProperty(Property property) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		java.util.Map<String, String> responseInfo = new java.util.HashMap<>();
		responseInfo.put("status", "successful");

		List<Property> existingProperties = null;
		if ((property.getSurveyid() != null && !property.getSurveyid().isEmpty())
				&& (property.getPropertyid() != null && !property.getPropertyid().isEmpty())) {
			log.info("Searching property by surveyid and propertyid: {}, {}", property.getSurveyid(),
					property.getPropertyid());
			existingProperties = propertyRepository.findBySurveyidAndPropertyid(property.getSurveyid(),
					property.getPropertyid(), property.getTenantid());
		} else if (property.getSurveyid() != null && !property.getSurveyid().isEmpty()) {
			log.info("Searching property by surveyid: {}", property.getSurveyid());
			existingProperties = propertyRepository.findBySurveyid(property.getSurveyid(), property.getTenantid());
		} else if (property.getPropertyid() != null && !property.getPropertyid().isEmpty()) {
			log.info("Searching property by propertyid: {}", property.getPropertyid());
			existingProperties = propertyRepository.findByPropertyid(property.getPropertyid(), property.getTenantid());
		}

		if (existingProperties == null || existingProperties.isEmpty()) {
			// Check if surveyid exists in DB but propertyid does not
			if (property.getSurveyid() != null && !property.getSurveyid().isEmpty()) {
				List<Property> propertiesBySurveyId = propertyRepository.findBySurveyid(property.getSurveyid(), property.getTenantid());
				if (propertiesBySurveyId != null && !propertiesBySurveyId.isEmpty()) {
					// Update the property with surveyid
					Property existingProperty = propertiesBySurveyId.get(0);
					log.info(
							"Property id is new but survey id {} is already present in DB, updating property with id: {}",
							property.getSurveyid(), existingProperty.getUuid());
					if (property.getTenantid() != null)
						existingProperty.setTenantid(property.getTenantid());
					if (property.getPropertyid() != null)
						existingProperty.setPropertyid(property.getPropertyid());
					if (property.getSurveyid() != null)
						existingProperty.setSurveyid(property.getSurveyid());
					if (property.getOldpropertyid() != null)
						existingProperty.setOldpropertyid(property.getOldpropertyid());
					if (property.getFirmbusinessname() != null)
						existingProperty.setFirmbusinessname(property.getFirmbusinessname());
					if (property.getAddress() != null)
						existingProperty.setAddress(property.getAddress());
					if (property.getLocalitycode() != null)
						existingProperty.setLocalitycode(property.getLocalitycode());
					if (property.getLocalityname() != null)
						existingProperty.setLocalityname(property.getLocalityname());
					if (property.getBlockname() != null)
						existingProperty.setBlockname(property.getBlockname());
					if (property.getZonename() != null)
						existingProperty.setZonename(property.getZonename());
					if (property.getPlotsize() != null)
						existingProperty.setPlotsize(property.getPlotsize());
					if (property.getPropertyusagetype() != null)
						existingProperty.setPropertyusagetype(property.getPropertyusagetype());
					if (property.getPropertytype() != null)
						existingProperty.setPropertytype(property.getPropertytype());
					if (property.getOwnershipcategory() != null)
						existingProperty.setOwnershipcategory(property.getOwnershipcategory());
					if (property.getPaymentdate() != null)
						existingProperty.setPaymentdate(property.getPaymentdate());
					if (property.getReceiptnumber() != null)
						existingProperty.setReceiptnumber(property.getReceiptnumber());
					if (property.getAmountpaid() != null)
						existingProperty.setAmountpaid(property.getAmountpaid());
					if (property.getAssessmentyear() != null)
						existingProperty.setAssessmentyear(property.getAssessmentyear());
                    if (property.getBillamount() != null)
                        existingProperty.setBillamount(property.getBillamount());
                    long now = System.currentTimeMillis();
                    existingProperty.setLastmodifiedtime(now);
                    Property savedProperty = propertyRepository.save(existingProperty);
                    responseInfo.put("method", "update");
                    response.put("ResponseInfo", responseInfo);
                    response.put("Property", savedProperty);
                    return response;
				}
			}
			log.info("Property with surveyid or propertyid does not exist, creating new property");
            long now = System.currentTimeMillis();
            property.setCreatedtime(now);
            property.setLastmodifiedtime(now);
            Property savedProperty = insertProperty(property);
            responseInfo.put("method", "create");
            response.put("ResponseInfo", responseInfo);
            response.put("Property", savedProperty);
            return response;
		} else {
			// New feature: check financial year difference
			boolean createNew = false;
			boolean yearExists = false;
			for (Property existingProperty : existingProperties) {
				if (property.getAssessmentyear() != null && property.getAssessmentyear().equals(existingProperty.getAssessmentyear())) {
					yearExists = true;
					break;
				}
			}
			if (!yearExists) {
				createNew = true;
			}
			if (createNew) {
				log.info("Financial year differs, creating new property");
				long now = System.currentTimeMillis();
				property.setCreatedtime(now);
				property.setLastmodifiedtime(now);
				Property savedProperty = insertProperty(property);
				responseInfo.put("method", "create");
				response.put("ResponseInfo", responseInfo);
				response.put("Property", savedProperty);
				return response;
			} else {
				// Update existing property with non-null fields
				for (Property existingProperty : existingProperties) {
					if (property.getAssessmentyear() != null && property.getAssessmentyear().equals(existingProperty.getAssessmentyear())) {
						log.info("Updating existing property with id: {}", existingProperty.getUuid());
						if (property.getTenantid() != null)
							existingProperty.setTenantid(property.getTenantid());
						if (property.getPropertyid() != null)
							existingProperty.setPropertyid(property.getPropertyid());
						if (property.getSurveyid() != null)
							existingProperty.setSurveyid(property.getSurveyid());
						if (property.getOldpropertyid() != null)
							existingProperty.setOldpropertyid(property.getOldpropertyid());
						if (property.getFirmbusinessname() != null)
							existingProperty.setFirmbusinessname(property.getFirmbusinessname());
						if (property.getAddress() != null)
							existingProperty.setAddress(property.getAddress());
						if (property.getLocalitycode() != null)
							existingProperty.setLocalitycode(property.getLocalitycode());
						if (property.getLocalityname() != null)
							existingProperty.setLocalityname(property.getLocalityname());
						if (property.getBlockname() != null)
							existingProperty.setBlockname(property.getBlockname());
						if (property.getZonename() != null)
							existingProperty.setZonename(property.getZonename());
						if (property.getPlotsize() != null)
							existingProperty.setPlotsize(property.getPlotsize());
						if (property.getPropertyusagetype() != null)
							existingProperty.setPropertyusagetype(property.getPropertyusagetype());
						if (property.getPropertytype() != null)
							existingProperty.setPropertytype(property.getPropertytype());
						if (property.getOwnershipcategory() != null)
							existingProperty.setOwnershipcategory(property.getOwnershipcategory());
						if (property.getPaymentdate() != null)
							existingProperty.setPaymentdate(property.getPaymentdate());
						if (property.getReceiptnumber() != null)
							existingProperty.setReceiptnumber(property.getReceiptnumber());
						if (property.getAmountpaid() != null)
							existingProperty.setAmountpaid(property.getAmountpaid());
						if (property.getAssessmentyear() != null)
							existingProperty.setAssessmentyear(property.getAssessmentyear());
                        if (property.getBillamount() != null)
                            existingProperty.setBillamount(property.getBillamount());
                        if (property.getService() != null)
                            existingProperty.setService(property.getService());
                        long now = System.currentTimeMillis();
                        existingProperty.setLastmodifiedtime(now);
                        Property savedProperty = propertyRepository.save(existingProperty);
                        responseInfo.put("method", "update");
                        response.put("ResponseInfo", responseInfo);
                        response.put("Property", savedProperty);
                        return response;
					}
				}
				// No matching property found, create new
				log.info("No matching property found, creating new property");
				Property savedProperty = insertProperty(property);
				responseInfo.put("method", "create");
				response.put("ResponseInfo", responseInfo);
				response.put("Property", savedProperty);
				return response;
			}
		}
	}
}
