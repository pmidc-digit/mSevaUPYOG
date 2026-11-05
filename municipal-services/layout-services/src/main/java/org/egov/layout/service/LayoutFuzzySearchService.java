package org.egov.layout.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.layout.repository.ElasticSearchRepository;
import org.egov.layout.repository.LAYOUTRepository;
import org.egov.layout.web.model.Layout;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LayoutFuzzySearchService {

    private ElasticSearchRepository elasticSearchRepository;
    private ObjectMapper mapper;
    private LAYOUTRepository layoutRepository;

    @Autowired
    public LayoutFuzzySearchService(ElasticSearchRepository elasticSearchRepository, ObjectMapper mapper, LAYOUTRepository layoutRepository) {
        this.elasticSearchRepository = elasticSearchRepository;
        this.mapper = mapper;
        this.layoutRepository = layoutRepository;
    }

    private static final String ES_DATA_PATH = "$.hits.hits[*]._source.Data";

    /**
     * Executes fuzzy search by coordinating between ES and the Database.
     * @param requestInfo Standard eGov request metadata
     * @param criteria Search parameters
     * @return Ordered list of Layouts
     */
    public List<Layout> getLayouts(RequestInfo requestInfo, LayoutSearchCriteria criteria) {

        log.info("Initiating fuzzy search with criteria: {}", criteria);

        // 1. Validate that at least one fuzzy field is provided
        validateFuzzySearchCriteria(criteria);

        // 2. Search ElasticSearch for matching IDs
        Object esResponse = elasticSearchRepository.fuzzySearchForLayouts(criteria);

        // 3. Extract IDs and group by TenantId
        Map<String, Set<String>> tenantIdToApplicationNos = getTenantIdToApplicationNoMap(esResponse);

        if (CollectionUtils.isEmpty(tenantIdToApplicationNos)) {
            return new LinkedList<>();
        }

        List<Layout> layouts = new LinkedList<>();

        // 4. Hydrate full layout data from DB
        for (Map.Entry<String, Set<String>> entry : tenantIdToApplicationNos.entrySet()) {
            
            LayoutSearchCriteria dbCriteria = LayoutSearchCriteria.builder()
                    .tenantId(entry.getKey())
                    .build();
            // LayoutSearchCriteria only has a single applicationNo field, we might need to set ids or loop.
            // Or better, set it on ids if application numbers are not supported as a list.
            // But wait, LayoutSearchCriteria has applicationNo as String.
            // We can fetch them individually, or we can use the ids if ES returns them, but usually applicationNo is used.
            // LayoutRepository might need to support list of applicationNo, or we query in loop.
            // For now, let's query in loop or fetch by IDs. Let's see if LayoutSearchCriteria has applicationNo as list. No, it is String.
            // So we will loop over application numbers.
            for (String applicationNo : entry.getValue()) {
                dbCriteria.setApplicationNo(applicationNo);
                List<Layout> dbLayouts = layoutRepository.getNocData(dbCriteria);
                if (!CollectionUtils.isEmpty(dbLayouts)) {
                    layouts.addAll(dbLayouts);
                }
            }
        }

        // 5. Restore the order of results based on ElasticSearch relevance score
        return orderByESScore(layouts, esResponse);
    }

    /**
     * Re-sorts the DB results to match the ranking (score) provided by ES.
     */
    private List<Layout> orderByESScore(List<Layout> layouts, Object esResponse) {

        List<Layout> orderedLayouts = new LinkedList<>();

        if (!CollectionUtils.isEmpty(layouts)) {
            Map<String, List<Layout>> idToLayoutMap = new LinkedHashMap<>();

            // Map connections by their business identifier (Application Number) to a list of layout objects
            layouts.forEach(layout -> idToLayoutMap.computeIfAbsent(layout.getApplicationNo(), k -> new ArrayList<>()).add(layout));

            try {
                List<Map<String, Object>> data = JsonPath.read(esResponse, ES_DATA_PATH);

                if (!CollectionUtils.isEmpty(data)) {
                    for (Map<String, Object> map : data) {
                        String applicationNo = JsonPath.read(map, "$.applicationNo");
                        if (idToLayoutMap.containsKey(applicationNo)) {
                            orderedLayouts.addAll(idToLayoutMap.get(applicationNo));
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to parse ES response during ordering phase", e);
                throw new CustomException("PARSING_ERROR", "Failed to extract applicationNos from ES response");
            }
        }

        return orderedLayouts;
    }

    /**
     * Parses the ES response to create a map of TenantId to ApplicationNumbers.
     */
    private Map<String, Set<String>> getTenantIdToApplicationNoMap(Object esResponse) {

        Map<String, Set<String>> tenantIdToApplicationNos = new LinkedHashMap<>();

        try {
            List<Map<String, Object>> data = JsonPath.read(esResponse, ES_DATA_PATH);

            if (!CollectionUtils.isEmpty(data)) {
                for (Map<String, Object> map : data) {
                    String tenantId = JsonPath.read(map, "$.tenantId");
                    String applicationNo = JsonPath.read(map, "$.applicationNo");

                    if (tenantId != null && applicationNo != null && !applicationNo.trim().isEmpty()) {
                        tenantIdToApplicationNos
                            .computeIfAbsent(tenantId, k -> new HashSet<>())
                            .add(applicationNo);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse ES response during ID extraction", e);
            throw new CustomException("PARSING_ERROR", "Failed to extract layout data from ES response");
        }

        return tenantIdToApplicationNos;
    }

    /**
     * Ensures search parameters are valid for a fuzzy search.
     */
    private void validateFuzzySearchCriteria(LayoutSearchCriteria criteria) {

        // 1. Absolute Mandatory: tenantId must be present for ALL searches
        if (criteria.getTenantId() == null || criteria.getTenantId().trim().isEmpty()) {
            throw new CustomException("EG_LAYOUT_SEARCH_TENANTID_MANDATORY", "TenantId is mandatory for all search operations.");
        }

        // 2. Minimum Criteria: At least one fuzzy parameter must exist
        if (criteria.getApplicationNo() == null && 
            criteria.getLayoutNo() == null && 
            criteria.getOwnerName() == null && 
            criteria.getAddress() == null &&
            criteria.getMobileNumber() == null
            ) {
            
            throw new CustomException("INVALID_SEARCH_CRITERIA", "Please provide at least one search parameter (Application No, Layout No, Name, Address, or Mobile Number).");
        }
    }
}
