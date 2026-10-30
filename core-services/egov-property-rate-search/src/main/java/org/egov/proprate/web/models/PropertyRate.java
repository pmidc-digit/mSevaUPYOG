package org.egov.proprate.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyRate {
    
    // The Root of the Hierarchy
    private Hierarchy.District district; 

    // Classification
    private Boundary category;
    private Boundary subCategory;
    
    // Mapping the unit as a Boundary object to capture both ID and Name
    private Boundary unit; 
    
    // New field for the conversion formula from revenue_prop_unit
    private BigDecimal conversionFormula;

    private String segmanentName;
    private BigDecimal rate;
    private String rateId;
    private Boolean isActive;
}