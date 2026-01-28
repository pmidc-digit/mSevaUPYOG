package org.egov.proprate.web.models;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.egov.common.contract.response.ResponseInfo;
//import org.egov.proprate.web.controllers.PropertyRateRequest;
//import org.egov.proprate.web.controllers.PropertyRateResponse;
import org.egov.proprate.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.math.BigDecimal;
import java.util.ArrayList; // Added
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        // SCENARIO 1: Return Rates (Using explicit loop to fix type inference)
        // =================================================================
        if (Boolean.TRUE.equals(c.getIsRateCheck())) {
            List<PropertyRate> rates = new ArrayList<>();
            
            for (Map<String, Object> row : results) {
                // 1. Safe Data Extraction
                String segId = safeString(row.get("segment_level_id"));
                String segName = safeString(row.get("segment_name"));
                
                // 2. Build Hierarchy Objects
                Hierarchy.Segment segObj = Hierarchy.Segment.builder()
                    .code(segId)
                    .name(segName)
                    .build();

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

                // 3. Build Rate Object
                PropertyRate rate = PropertyRate.builder()
                    .rateId(safeString(row.get("rate_id")))
                    .rate(safeDecimal(row.get("property_rate")))
                    .unit(safeString(row.get("unit")))
                    .segmanentName(safeString(row.get("segment_list_name")))
                    .isActive(safeBool(row.get("is_active")))
                    .district(distObj)
                    .category(Boundary.builder()
                        .code(safeString(row.get("usage_category_id")))
                        .name(safeString(row.get("usage_category_name"))).build())
                    .subCategory(Boundary.builder()
                        .code(safeString(row.get("sub_category_id")))
                        .name(safeString(row.get("sub_category_name"))).build())
                    .build();
                
                rates.add(rate);
            }
            response.setRates(rates);
        } 
        
        // =================================================================
        // SCENARIO 2: Master Data Drill-Down
        // =================================================================
        else if (!ObjectUtils.isEmpty(c.getUsageCategoryId())) {
            response.setSubCategories(mapToBoundary(results, "sub_category_id", "sub_category_name"));
        }
        else if (!ObjectUtils.isEmpty(c.getSegmentId())) {
            response.setUsageCategories(mapToBoundary(results, "usage_category_id", "usage_category_name"));
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

    // --- HELPER METHODS TO FIX CASTING ISSUES ---

    private List<Boundary> mapToBoundary(List<Map<String, Object>> list, String idKey, String nameKey) {
        List<Boundary> boundaries = new ArrayList<>();
        for (Map<String, Object> row : list) {
            boundaries.add(Boundary.builder()
                .code(safeString(row.get(idKey)))
                .name(safeString(row.get(nameKey)))
                .isUrban(safeBool(row.get("is_urban")))
                .build());
        }
        return boundaries;
    }

    // Safety helpers to handle Nulls and Objects gracefully
    private String safeString(Object obj) {
        return obj != null ? String.valueOf(obj) : null;
    }

    private Boolean safeBool(Object obj) {
        return obj != null && (Boolean) obj;
    }

    private BigDecimal safeDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        return new BigDecimal(String.valueOf(obj));
    }
    
public PropertyRateResponse createCreateResponse(List<AddPropertyRate> rates, PropertyRateRequest request) {
        
        PropertyRateResponse response = new PropertyRateResponse();

        // No need to wrap in Collections.singletonList anymore
        response.setPropertyRates(rates); 

        // Set Response Info
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