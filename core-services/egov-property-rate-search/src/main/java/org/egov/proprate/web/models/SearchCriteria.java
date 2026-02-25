package org.egov.proprate.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Hides any null fields from the JSON output
public class SearchCriteria {
    private String tenantId;
    
    // Geographical IDs
    private String districtId;
    private String tehsilId;
    private String villageId;
    private String segmentId;    // Parent Segment (segment_level_id)
    private String subSegmentId; // Specific Sub-Segment (sub_segment_id)

    // Classification IDs
    private String usageCategoryId;
    private String subCategoryId;
    
    // Control Flags
    private Boolean isRateCheck; 
    private Boolean isActive;    
    
    /** * Added to fix the "undefined" error in ResponseFactory.
     * When true, the DAO should fetch standalone Usage Categories.
     */
    private Boolean getUsageCategories; 

    // Geographical Names (For reference/display)
    private String districtName;
    private String tehsilName;
    private String villageName;
    private String segmentName;        
    private String subSegmentName;
}