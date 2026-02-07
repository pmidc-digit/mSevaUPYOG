package org.egov.proprate.web.models;

import lombok.Data;

@Data
public class SearchCriteria {
    private String tenantId;
    
    // Geographical IDs
    private String districtId;
    private String tehsilId;
    private String villageId;
    private String segmentId; // Maps to segment_level_id
    
    // Classification IDs
    private String usageCategoryId;

    // Geographical Names (Keep these for flexibility if needed)
    private String districtName;
    private String tehsilName;
    private String villageName;
    private String segmentName;        
    // Control Flags
    private Boolean isRateCheck; 
    private Boolean isActive;    
}