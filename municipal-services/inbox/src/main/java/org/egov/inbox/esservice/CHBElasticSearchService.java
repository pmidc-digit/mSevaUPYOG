package org.egov.inbox.esservice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.inbox.config.InboxConfiguration;
import org.egov.inbox.web.model.InboxSearchCriteria;
import org.egov.inbox.web.model.workflow.ProcessInstanceSearchCriteria;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.egov.inbox.util.BpaConstants.CITIZEN;
import static org.egov.inbox.util.BpaConstants.MOBILE_NUMBER_PARAM;
import static org.egov.inbox.util.TLConstants.LOCALITY_PARAM;

@Slf4j
@Service
public class CHBElasticSearchService {

    private static final String DEFAULT_SORT_BY = "Data.lastModifiedTime";
    private static final String DEFAULT_SORT_ORDER = "desc";

    @Autowired
    private InboxConfiguration config;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper mapper;

    public List<String> fetchApplicationNumbersFromElasticSearch(InboxSearchCriteria criteria,
                                                                  HashMap<String, String> statusIdNameMap,
                                                                  RequestInfo requestInfo,
                                                                  List<String> userUUIDs,
                                                                  List<String> userRoles) {
        JsonNode responseNode = executeSearch(criteria, statusIdNameMap, userUUIDs, userRoles, false);
        return extractBookingNos(responseNode);
    }
    public Integer fetchApplicationCountFromElasticSearch(InboxSearchCriteria criteria,
                                                           HashMap<String, String> statusIdNameMap,
                                                           RequestInfo requestInfo,
                                                           List<String> userUUIDs,
                                                           List<String> userRoles) {
        JsonNode responseNode = executeSearch(criteria, statusIdNameMap, userUUIDs, userRoles, true);
        return extractTotalCount(responseNode);
    }

    private JsonNode executeSearch(InboxSearchCriteria criteria,
                                   HashMap<String, String> statusIdNameMap,
                                   List<String> userUUIDs,
                                   List<String> userRoles,
                                   boolean countOnly) {
        Map<String, Object> query = buildSearchQuery(criteria, statusIdNameMap, userUUIDs, userRoles, countOnly);

        String url = config.getIndexServiceHost() + config.getEsCHBIndex() + config.getIndexServiceHostSearchEndpoint();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(mapper.writeValueAsString(query), headers);

            ResponseEntity<Object> response = restTemplate.postForEntity(url, requestEntity, Object.class);
            return mapper.convertValue(response.getBody(), JsonNode.class);
        } catch (Exception e) {
            log.error("Failed to fetch CHB records from ES", e);
            throw new CustomException("CHB_ES_SEARCH_ERROR", "Failed to fetch CHB inbox data from elasticsearch");
        }
    }

    private Map<String, Object> buildSearchQuery(InboxSearchCriteria criteria,
                                                 HashMap<String, String> statusIdNameMap,
                                                 List<String> userUUIDs,
                                                 List<String> userRoles,
                                                 boolean countOnly) {
        HashMap<String, Object> moduleSearchCriteria = criteria.getModuleSearchCriteria();
        ProcessInstanceSearchCriteria processCriteria = criteria.getProcessSearchCriteria();

        int offset = criteria.getOffset() == null ? 0 : criteria.getOffset();
        int limit = criteria.getLimit() == null ? 50 : criteria.getLimit();

        List<Map<String, Object>> mustClauses = new ArrayList<>();
        List<Map<String, Object>> shouldClauses = new ArrayList<>();

        mustClauses.add(termsClause("Data.tenantId.keyword", normalizeValues(criteria.getTenantId())));

        if (moduleSearchCriteria != null && moduleSearchCriteria.containsKey(LOCALITY_PARAM)) {
            mustClauses.add(termsClause("Data.locality.keyword", normalizeValues(moduleSearchCriteria.get(LOCALITY_PARAM))));
        }

        if (moduleSearchCriteria != null && moduleSearchCriteria.containsKey("applicationNumber")) {
            mustClauses.add(termsClause("Data.bookingNo.keyword", normalizeValues(moduleSearchCriteria.get("applicationNumber"))));
        }

        if (moduleSearchCriteria != null && moduleSearchCriteria.containsKey("uuid")) {
            mustClauses.add(termsClause("Data.bookingId.keyword", normalizeValues(moduleSearchCriteria.get("uuid"))));
        }

        if (!ObjectUtils.isEmpty(processCriteria.getAssignee())) {
            mustClauses.add(termsClause("Data.workflowAssigneeUuids.keyword", normalizeValues(processCriteria.getAssignee())));
        }

        List<String> statusIdsToFilter = getStatusIdsForSearch(processCriteria, statusIdNameMap);
        if (!CollectionUtils.isEmpty(statusIdsToFilter)) {
            mustClauses.add(termsClause("Data.workflowStatusId.keyword", statusIdsToFilter));
        }

        if (moduleSearchCriteria != null && moduleSearchCriteria.containsKey(MOBILE_NUMBER_PARAM)) {
            List<String> mobileNumbers = normalizeValues(moduleSearchCriteria.get(MOBILE_NUMBER_PARAM));
            shouldClauses.add(termsClause("Data.applicantMobileNo.keyword", mobileNumbers));
            shouldClauses.add(termsClause("Data.applicantAlternateMobileNo.keyword", mobileNumbers));
        }

        if (!CollectionUtils.isEmpty(userUUIDs) && !CollectionUtils.isEmpty(userRoles) && userRoles.contains(CITIZEN)) {
            shouldClauses.add(termsClause("Data.owners.uuid.keyword", userUUIDs));
        }

        Map<String, Object> boolNode = new LinkedHashMap<>();
        boolNode.put("must", mustClauses);
        if (!CollectionUtils.isEmpty(shouldClauses)) {
            boolNode.put("should", shouldClauses);
            boolNode.put("minimum_should_match", 1);
        }

        Map<String, Object> queryNode = new LinkedHashMap<>();
        queryNode.put("query", new LinkedHashMap<String, Object>() {{
            put("bool", boolNode);
        }});

        if (countOnly) {
            queryNode.put("from", 0);
            queryNode.put("size", 0);
            return queryNode;
        }

        queryNode.put("from", offset);
        queryNode.put("size", limit);
        queryNode.put("sort", new ArrayList<Map<String, Object>>() {{
            add(new LinkedHashMap<String, Object>() {{
                put(DEFAULT_SORT_BY, new LinkedHashMap<String, Object>() {{
                    put("order", DEFAULT_SORT_ORDER);
                }});
            }});
        }});

        return queryNode;
    }

    private List<String> getStatusIdsForSearch(ProcessInstanceSearchCriteria processCriteria,
                                               HashMap<String, String> statusIdNameMap) {
        if (!ObjectUtils.isEmpty(processCriteria.getStatus())) {
            return statusIdNameMap.entrySet().stream()
                    .filter(entry -> processCriteria.getStatus().contains(entry.getValue()))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }

        return new ArrayList<>(statusIdNameMap.keySet());
    }

    private Map<String, Object> termsClause(String field, List<String> values) {
        Map<String, Object> termsNode = new LinkedHashMap<>();
        termsNode.put(field, values);

        Map<String, Object> clause = new LinkedHashMap<>();
        clause.put("terms", termsNode);
        return clause;
    }

    private List<String> normalizeValues(Object value) {
        if (value == null) {
            return new ArrayList<>();
        }

        if (value instanceof Collection) {
            return ((Collection<?>) value).stream()
                    .filter(item -> item != null && !item.toString().trim().isEmpty())
                    .map(item -> item.toString().trim())
                    .collect(Collectors.toList());
        }

        String raw = String.valueOf(value).trim();
        if (raw.isEmpty()) {
            return new ArrayList<>();
        }

        if (raw.contains(",")) {
            String[] split = raw.split(",");
            List<String> values = new ArrayList<>();
            for (String each : split) {
                String normalized = each.trim();
                if (!normalized.isEmpty()) {
                    values.add(normalized);
                }
            }
            return values;
        }

        return new ArrayList<String>() {{
            add(raw);
        }};
    }

    private List<String> extractBookingNos(JsonNode responseNode) {
        List<String> bookingNos = new ArrayList<>();
        if (responseNode == null || responseNode.path("hits").path("hits").isMissingNode()) {
            return bookingNos;
        }

        for (JsonNode hit : responseNode.path("hits").path("hits")) {
            JsonNode bookingNo = hit.path("_source").path("Data").path("bookingNo");
            if (!bookingNo.isMissingNode() && !bookingNo.isNull() && !bookingNo.asText().trim().isEmpty()) {
                bookingNos.add(bookingNo.asText());
            }
        }

        return bookingNos;
    }

    private Integer extractTotalCount(JsonNode responseNode) {
        if (responseNode == null) {
            return 0;
        }

        JsonNode totalNode = responseNode.path("hits").path("total");
        if (totalNode.isIntegralNumber()) {
            return totalNode.asInt();
        }

        JsonNode valueNode = totalNode.path("value");
        return valueNode.isIntegralNumber() ? valueNode.asInt() : 0;
    }
}
