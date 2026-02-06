package org.egov.proprate.repository.querybuilder;

import org.egov.proprate.web.models.RateSearchRequest;
import org.egov.proprate.web.models.SearchCriteria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.Map;

@Component
public class PropertyRateQueryBuilder {
	
	@Value("${property-rate.missing-limit}")
	private int defaultLimit;

    /* =========================
       BASE QUERY CONSTANTS
       ========================= */

    private static final String BASE_SELECT =
            "SELECT prm.rate_id, prm.property_rate, prm.unit, prm.segment_no, prm.is_active, " +
            "sl.segment_list_name, " +
            "vm.village_name, vm.village_id, vm.is_urban, " +
            "tm.tehsil_name, tm.tehsil_id, " +
            "dm.district_name, dm.district_id, " +
            "sm.segment_name, sm.segment_level_id, " +
            "uc.usage_category_name, uc.usage_category_id ";

    private static final String BASE_FROM =
            "FROM revenue_property_rate_master prm " +
            "INNER JOIN revenue_segment_list sl ON prm.segment_list_id = sl.segment_list_id " +
            "INNER JOIN revenue_segment_master sm ON sl.segment_level_id = sm.segment_level_id " +
            "INNER JOIN revenue_village_master vm ON sm.village_id = vm.village_id " +
            "INNER JOIN revenue_tehsil_master tm ON vm.tehsil_id = tm.tehsil_id " +
            "INNER JOIN revenue_district_master dm ON tm.district_id = dm.district_id " +
            "INNER JOIN revenue_usage_category_master uc ON prm.usage_category_id = uc.usage_category_id "; // Joined PRM directly to Usage Category

    private static final String BASE_WHERE = "WHERE 1=1 ";

    /* =========================
       DRILL DOWN QUERIES
       ========================= */

    private static final String FETCH_DISTRICTS =
            "SELECT district_name, district_id FROM revenue_district_master ORDER BY district_name";

    private static final String FETCH_TEHSILS =
            "SELECT tm.tehsil_name, tm.tehsil_id FROM revenue_tehsil_master tm " +
            "WHERE tm.district_id = :districtId ORDER BY tm.tehsil_name";

    private static final String FETCH_VILLAGES =
            "SELECT vm.village_name, vm.village_id, vm.is_urban FROM revenue_village_master vm " +
            "WHERE vm.tehsil_id = :tehsilId ORDER BY vm.village_name";

    private static final String FETCH_SEGMENTS =
            "SELECT sm.segment_name, sm.segment_level_id FROM revenue_segment_master sm " +
            "WHERE sm.village_id = :villageId ORDER BY sm.segment_name";

    private static final String FETCH_USAGE_CATEGORIES =
            "SELECT usage_category_name, usage_category_id FROM revenue_usage_category_master " +
            "ORDER BY usage_category_name";

    /* =========================
       MISSING/MAPPED PROPERTIES QUERIES (Unchanged logic, just maintaining)
       ========================= */
    private static final String MISSING_PROPERTIES =
             "SELECT DISTINCT ON (p.propertyid) p.propertyid, p.tenantid, add.locality AS localityCode, o.userid AS ownerUuid, p.landarea, p.superbuiltuparea, p.propertytype, p.usagecategory, " +
             "add.doorno, add.plotno, add.street, add.landmark, add.city, add.pincode, add.district, add.state, add.latitude, add.longitude " + 
             "FROM eg_pt_property p " +
             "LEFT JOIN revenue_property_integration r ON p.propertyid = r.propertyid " +
             "LEFT JOIN eg_pt_address add ON p.id = add.propertyid " +
             "LEFT JOIN public.eg_pt_owner o ON o.propertyid = p.id " +
             "WHERE p.status = 'ACTIVE' " +
             "AND (r.propertyid IS NULL OR r.isproratacal = true) ";

    private static final String MAPPED_PROPERTIES =
            "SELECT DISTINCT ON (p.propertyid) " +
            "r.id as integration_id, r.districtid, r.tehsilid, r.village_id, r.locality, r.isproratacal, " +
            "dm.district_name, tm.tehsil_name, vm.village_name, " + 
            "p.propertyid, p.tenantid, add.locality AS localityCode, o.userid AS ownerUuid, " +
            "p.landarea, p.superbuiltuparea, p.propertytype, p.usagecategory, " +
            "add.doorno, add.plotno, add.street, add.landmark, add.city, add.pincode, add.district, add.state, add.latitude, add.longitude " + 
            "FROM eg_pt_property p " +
            "INNER JOIN revenue_property_integration r ON p.propertyid = r.propertyid " +
            "LEFT JOIN revenue_district_master dm ON r.districtid::integer = dm.district_id " +
            "LEFT JOIN revenue_tehsil_master tm ON r.tehsilid::integer = tm.tehsil_id " +
            "LEFT JOIN revenue_village_master vm ON r.village_id::integer = vm.village_id " + 
            "LEFT JOIN eg_pt_address add ON p.id = add.propertyid " +
            "LEFT JOIN public.eg_pt_owner o ON o.propertyid = p.id " +
            "WHERE p.status = 'ACTIVE' " +
            "AND r.propertyid IS NOT NULL ";

    /* =========================
       MAIN QUERY BUILDER
       ========================= */

    public String getSearchQuery(RateSearchRequest request, Map<String, Object> params) {

        SearchCriteria criteria = request.getSearchCriteria();
        boolean isRateCheck = criteria.getIsRateCheck() != null && criteria.getIsRateCheck();

        if (isRateCheck) {
            StringBuilder query = new StringBuilder();
            query.append(BASE_SELECT).append(BASE_FROM).append(BASE_WHERE);

            addFilters(query, criteria, params);

            if (criteria.getIsActive() != null) {
                query.append(" AND prm.is_active = :isActive");
                params.put("isActive", criteria.getIsActive());
            }

            query.append(" ORDER BY prm.segment_no ASC");
            return query.toString();
        }

        /* DRILL DOWN LOGIC (Sub-category step removed)
        */
        if (!ObjectUtils.isEmpty(criteria.getUsageCategoryId())) {
            // Previously returned FETCH_SUB_CATEGORIES. 
            // Now, if usage category is selected, the drill-down usually ends or moves to rate check.
            params.put("usageCategoryId", Integer.parseInt(criteria.getUsageCategoryId()));
            // Adjust return based on your UI flow. If selection of Usage Category is the final step:
            return null; 
        }

        if (!ObjectUtils.isEmpty(criteria.getSegmentId())) {
            return FETCH_USAGE_CATEGORIES;
        }

        if (!ObjectUtils.isEmpty(criteria.getVillageId())) {
            params.put("villageId", Integer.parseInt(criteria.getVillageId()));
            return FETCH_SEGMENTS;
        }

        if (!ObjectUtils.isEmpty(criteria.getTehsilId())) {
            params.put("tehsilId", Integer.parseInt(criteria.getTehsilId()));
            return FETCH_VILLAGES;
        }

        if (!ObjectUtils.isEmpty(criteria.getDistrictId())) {
            params.put("districtId", Integer.parseInt(criteria.getDistrictId()));
            return FETCH_TEHSILS;
        }

        return FETCH_DISTRICTS;
    }

    /* =========================
       FILTER BUILDER
       ========================= */

    private void addFilters(StringBuilder query, SearchCriteria criteria, Map<String, Object> params) {
        if (!ObjectUtils.isEmpty(criteria.getDistrictId())) {
            query.append(" AND dm.district_id = :districtId");
            params.put("districtId", Integer.parseInt(criteria.getDistrictId()));
        }
        if (!ObjectUtils.isEmpty(criteria.getTehsilId())) {
            query.append(" AND tm.tehsil_id = :tehsilId");
            params.put("tehsilId", Integer.parseInt(criteria.getTehsilId()));
        }
        if (!ObjectUtils.isEmpty(criteria.getVillageId())) {
            query.append(" AND vm.village_id = :villageId");
            params.put("villageId", Integer.parseInt(criteria.getVillageId()));
        }
        if (!ObjectUtils.isEmpty(criteria.getSegmentId())) {
            query.append(" AND sm.segment_level_id = :segmentId");
            params.put("segmentId", Integer.parseInt(criteria.getSegmentId()));
        }
        if (!ObjectUtils.isEmpty(criteria.getUsageCategoryId())) {
            query.append(" AND uc.usage_category_id = :usageCategoryId");
            params.put("usageCategoryId", Integer.parseInt(criteria.getUsageCategoryId()));
        }
        
        // Removed subCategoryId filter block from here

        if (!ObjectUtils.isEmpty(criteria.getDistrictName())) {
            query.append(" AND dm.district_name = :districtName");
            params.put("districtName", criteria.getDistrictName());
        }
        if (!ObjectUtils.isEmpty(criteria.getTehsilName())) {
            query.append(" AND tm.tehsil_name = :tehsilName");
            params.put("tehsilName", criteria.getTehsilName());
        }
        if (!ObjectUtils.isEmpty(criteria.getVillageName())) {
            query.append(" AND vm.village_name = :villageName");
            params.put("villageName", criteria.getVillageName());
        }
    }

    public String searchMissingRevenueProperties(String tenantId, String localityCode, Integer limit, Boolean isMissing, String propertyId, Map<String, Object> params) {
        StringBuilder query = new StringBuilder();
        if (isMissing != null && isMissing) {
            query.append(MISSING_PROPERTIES);
        } else {
            query.append(MAPPED_PROPERTIES);
        }

        if (!ObjectUtils.isEmpty(localityCode)) {
            query.append(" AND add.locality = :localityCode ");
            params.put("localityCode", localityCode);
        }
        if (!ObjectUtils.isEmpty(tenantId)) {
            query.append(" AND p.tenantid = :tenantId ");
            params.put("tenantId", tenantId);
        }
        if (!ObjectUtils.isEmpty(propertyId)) {
            query.append(" AND p.propertyid = :propertyId ");
            params.put("propertyId", propertyId);
        }

        query.append(" ORDER BY p.propertyid ");
        int finalLimit = (limit != null) ? limit : defaultLimit;
        query.append(" LIMIT :limit");
        params.put("limit", finalLimit);

        return query.toString();
    }
}