package org.egov.bpa.service;

import org.egov.bpa.repository.ServiceRequestRepository;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.property.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Property Services to create and Search the properties
 * 
 * @author Roshan chaudhary
 */

@Service
public class PropertyService {

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public Property createProperty(BPA bpa) {
		Property property = Property.builder().build();
		
		
		
		return property;
	}
	
	private Property createPropertFromBPA() {
		Property property = Property.builder().build();
		
		return property;
	}
	
	
}
