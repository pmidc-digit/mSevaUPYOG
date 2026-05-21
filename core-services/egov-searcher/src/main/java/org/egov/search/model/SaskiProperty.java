package org.egov.search.model;

import java.util.List;

import org.egov.custom.mapper.billing.impl.Bill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaskiProperty {
	 private String propertyId;
	 private String obpassFileNo;
	    private String obpassApplicantName;
	    private String tenantId;
	    private String oldPropertyId;
	    private String allotmentNo;
	    private String allotmentDate;
	    private String vasikaNo;
	    private String vasikaDate;
	    private String createdTime;
	    
}
