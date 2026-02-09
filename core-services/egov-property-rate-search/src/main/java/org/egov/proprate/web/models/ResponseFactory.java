package org.egov.proprate.web.models;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.proprate.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class ResponseFactory {

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    public RateResponse createResponse(List<Map<String, Object>> results, RateSearchRequest request) {
        RateResponse response = new RateResponse();

        response.setResponseInfo(
            responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true)
        );

        SearchCriteria c = request.getSearchCriteria();

        // =================================================================
        // SCENARIO 1: Return Final Rates (Full Nested Hierarchy)
        // =================================================================
        if (Boolean.TRUE.equals(c.getIsRateCheck())) {
            List<PropertyRate> rates = new ArrayList<>();
            
            for (Map<String, Object> row : results) {
                
                // 1. Build Sub-Segment
                Hierarchy.SubSegment subSegObj = Hierarchy.SubSegment.builder()
                        .code(safeString(row.get("sub_segment_id")))
                        .name(safeString(row.get("sub_segment_name"))) 
                        .build();

                // 2. Build Segment
                Hierarchy.Segment segObj = Hierarchy.Segment.builder()
                    .code(safeString(row.get("segment_level_id")))
                    .name(safeString(row.get("segment_name")))
                    .subSegment(subSegObj) 
                    .build();

                // 3. Build Geographical Hierarchy
                Hierarchy.Village vilObj = Hierarchy.Village.builder()
                    .code(safeString(row.get("village_id")))
                    .name(safeString(row.get("village_name")))
                    .isUrban(safeBool(row.get("is_urban")))
                    .segment(segObj) 
                    .build();

                Hierarchy.Tehsil tehObj = Hierarchy.Tehsil.builder()
                    .code(safeString(row.get("tehsil_id")))
                    .name(safeString(row.get("tehsil_name")))
                    .village(vilObj)
                    .build();

                Hierarchy.District distObj = Hierarchy.District.builder()
                    .code(safeString(row.get("district_id")))
                    .name(safeString(row.get("district_name")))
                    .tehsil(tehObj)
                    .build();

                // 4. Build Final Rate Object
                PropertyRate rate = PropertyRate.builder()
                    .rateId(safeString(row.get("rate_id")))
                    .rate(safeDecimal(row.get("property_rate")))
                    .unit(safeString(row.get("unit")))
                    .isActive(safeBool(row.get("is_active")))
                    .district(distObj)
                    .category(Boundary.builder()
                        .code(safeString(row.get("usage_category_id")))
                        .name(safeString(row.get("usage_category_name"))).build())
                    // Added Sub-Category to final rate mapping
                    .subCategory(Boundary.builder()
                        .code(safeString(row.get("sub_category_id")))
                        .name(safeString(row.get("sub_category_name"))).build())
                    .build();
                
                rates.add(rate);
            }
            response.setRates(rates);
        } 
        
        // =================================================================
        // SCENARIO 2: Master Data Drill-Down Logic
        // =================================================================
        
        // New CASE: Fetch Sub-Categories based on selected Usage Category
        else if (!ObjectUtils.isEmpty(c.getUsageCategoryId())) {
            response.setSubCategories(mapToBoundary(results, "sub_category_id", "sub_category_name"));
        }
        
        // CASE: Fetch Usage Categories (Standalone initial list)
        else if (Boolean.TRUE.equals(c.getGetUsageCategories())) {
             response.setUsageCategories(mapToBoundary(results, "usage_category_id", "usage_category_name"));
        }
        
        // CASE: Geographical Drill-down Chain
        else if (!ObjectUtils.isEmpty(c.getSegmentId())) {
            response.setSubSegments(mapToBoundary(results, "sub_segment_id", "sub_segment_name"));
        }
        else if (!ObjectUtils.isEmpty(c.getVillageId())) {
            response.setSegments(mapToBoundary(results, "segment_level_id", "segment_name"));
        }
        else if (!ObjectUtils.isEmpty(c.getTehsilId())) {
            response.setVillages(mapToBoundary(results, "village_id", "village_name"));
        }
        else if (!ObjectUtils.isEmpty(c.getDistrictId())) {
            response.setTehsils(mapToBoundary(results, "tehsil_id", "tehsil_name"));
        }
        else {
            response.setDistricts(mapToBoundary(results, "district_id", "district_name"));
        }

        return response;
    }

    // --- HELPER METHODS ---

    private List<Boundary> mapToBoundary(List<Map<String, Object>> list, String idKey, String nameKey) {
        List<Boundary> boundaries = new ArrayList<>();
        if (ObjectUtils.isEmpty(list)) return boundaries;

        for (Map<String, Object> row : list) {
            boundaries.add(Boundary.builder()
                .code(safeString(row.get(idKey)))
                .name(safeString(row.get(nameKey)))
                .isUrban(safeBool(row.get("is_urban")))
                .build());
        }
        return boundaries;
    }

    private String safeString(Object obj) {
        return obj != null ? String.valueOf(obj) : null;
    }

    private Boolean safeBool(Object obj) {
        if (obj == null) return false;
        if (obj instanceof Boolean) return (Boolean) obj;
        return Boolean.parseBoolean(String.valueOf(obj));
    }

    private BigDecimal safeDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(String.valueOf(obj));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
    
    public PropertyRateResponse createCreateResponse(List<AddPropertyRate> rates, PropertyRateRequest request) {
        PropertyRateResponse response = new PropertyRateResponse();
        response.setPropertyRates(rates); 

        ResponseInfo responseInfo = ResponseInfo.builder()
                .apiId(request.getRequestInfo().getApiId())
                .ver(request.getRequestInfo().getVer())
                .ts(System.currentTimeMillis())
                .resMsgId(request.getRequestInfo().getMsgId())
                .msgId(request.getRequestInfo().getMsgId())
                .status("SUCCESSFUL")
                .build();

        response.setResponseInfo(responseInfo);
        return response;
    }
}