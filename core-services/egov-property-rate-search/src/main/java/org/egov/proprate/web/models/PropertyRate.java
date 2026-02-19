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

    // Classification (Can remain flat or be nested similarly if needed)
    private Boundary category;
    private Boundary subCategory;
    
    private String segmanentName;
    private BigDecimal rate;
    private String unit;
    private String rateId;
    private Boolean isActive;
}