package org.egov.wscalculation.repository.builder;



import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.tracer.model.CustomException;
import org.egov.wscalculation.config.WSCalculationConfiguration;
import org.egov.wscalculation.web.models.SearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class WSFuzzySearchQueryBuilder {

    private ObjectMapper mapper;
    private WSCalculationConfiguration config;

    @Autowired
    public WSFuzzySearchQueryBuilder(ObjectMapper mapper, WSCalculationConfiguration config) {
        this.mapper = mapper;
        this.config = config;
    }

    private static final String BASE_QUERY = "{\n" +
            "  \"from\": {{OFFSET}},\n" +
            "  \"size\": {{LIMIT}},\n" +
            "  \"sort\": {\n" +
            "    \"Data.auditDetails.createdTime\": { \"order\": \"desc\" }\n" +
            "  },\n" +
            "  \"query\": {}\n" +
            "}";

    private static final String wildCardQueryTemplate = "{\"query_string\": {\"default_field\": \"{{VAR}}\", \"query\": \"*{{PARAM}}*\"}}";
    private static final String queryTemplate = "{\"query_string\": {\"default_field\": \"{{VAR}}\", \"query\": \"{{PARAM}}\"}}";

    public String getFuzzySearchQuery(SearchCriteria criteria) {
        try {
            String baseQuery = addPagination(criteria);
            JsonNode node = mapper.readTree(baseQuery);
            ObjectNode insideMatch = (ObjectNode) node.get("query");
            List<JsonNode> mustList = new LinkedList<>();

            // 1. Tenant Filter (Data.tenantId)
            if (criteria.getTenantId() != null) {
                mustList.add(getInnerNode(criteria.getTenantId(), "Data.tenantId", false));
            }

            // 2. Owner Name Filter (Data.ownerNames)
            if (criteria.getOwnerName() != null) {
                mustList.add(getInnerNode(criteria.getOwnerName(), "Data.ownerNames", true));
            }

            // 3. Property ID (Data.propertyId)
            if (criteria.getPropertyId() != null) {
                mustList.add(getInnerNode(criteria.getPropertyId(), "Data.propertyId.keyword", false));
            }

            // 4. Old Property ID (Data.oldPropertyId)
            if (criteria.getOldPropertyId() != null) {
                mustList.add(getInnerNode(criteria.getOldPropertyId(), "Data.oldPropertyId.keyword", false));
            }

            // 5. Door No (Data.doorNo)
            if (criteria.getDoorNo() != null) {
                mustList.add(getInnerNode(criteria.getDoorNo(), "Data.doorNo.keyword", false));
            }

            // 6. Locality (Data.locality)
            if (criteria.getLocality() != null) {
                mustList.add(getInnerNode(criteria.getLocality(), "Data.locality.keyword", false));
            }

            // 7. Ward (Data.ward.code)
            if (criteria.getWard() != null) {
                mustList.add(getInnerNode(criteria.getWard(), "Data.ward.code.keyword", false));
            }

            // 8. Acknowledgement Number (Data.acknowldgementNumber)
            if (!CollectionUtils.isEmpty(criteria.getAcknowledgementIds())) {
                for (String ackNo : criteria.getAcknowledgementIds()) {
                    mustList.add(getInnerNode(ackNo, "Data.acknowldgementNumber.keyword", false));
                }
            }

            // 9. Status (Data.status)
            if (criteria.getStatus() != null) {
                mustList.add(getInnerNode(criteria.getStatus(), "Data.status.keyword", false));
            }

            // 10. Date Range Filter (Created Time)
            if (criteria.getFromDate() != null || criteria.getToDate() != null) {
                Map<String, Object> rangeParams = new HashMap<>();
                if (criteria.getFromDate() != null) rangeParams.put("gte", criteria.getFromDate());
                if (criteria.getToDate() != null) rangeParams.put("lte", criteria.getToDate());
                
                Map<String, Object> rangeField = new HashMap<>();
                rangeField.put("Data.auditDetails.createdTime", rangeParams);
                mustList.add(mapper.convertValue(new HashMap<String, Object>() {{ put("range", rangeField); }}, JsonNode.class));
            }

            // Final query assembly
            Map<String, Object> boolMap = new HashMap<>();
            boolMap.put("must", mustList);
            insideMatch.set("bool", mapper.convertValue(boolMap, JsonNode.class));

            return mapper.writeValueAsString(node);

        } catch (Exception e) {
            log.error("ES_QUERY_BUILDER_ERROR", e);
            throw new CustomException("QUERY_BUILD_ERROR", "Failed to build JSON query for Property fuzzy search");
        }
    }

    private JsonNode getInnerNode(String param, String var, boolean isWildCard) throws JsonProcessingException {
        String template = isWildCard ? wildCardQueryTemplate : queryTemplate;
        String innerQuery = template.replace("{{PARAM}}", getEscapedString(param));
        innerQuery = innerQuery.replace("{{VAR}}", var);
        return mapper.readTree(innerQuery);
    }

    private String addPagination(SearchCriteria criteria) {
        Long limit = config.getMeterReadingDefaultLimit() != null ? config.getMeterReadingDefaultLimit().longValue() : 50L;
        Long offset = config.getMeterReadingDefaultOffset() != null ? config.getMeterReadingDefaultOffset().longValue() : 0L;

        if (criteria.getLimit() != null) {
            limit = Math.min(criteria.getLimit().longValue(), 500L); // Using 500 as max limit
        }
        if (criteria.getOffset() != null) {
            offset = criteria.getOffset().longValue();
        }

        return BASE_QUERY.replace("{{OFFSET}}", offset.toString())
                         .replace("{{LIMIT}}", limit.toString());
    }

    private String getEscapedString(String inputString) {
        final String[] metaCharacters = {"\\", "/", "^", "$", "{", "}", "[", "]", "(", ")", "*", "+", "?", "|", "<", ">", "-", "&", "%"};
        for (String character : metaCharacters) {
            if (inputString.contains(character)) {
                inputString = inputString.replace(character, "\\\\" + character);
            }
        }
        return inputString;
    }
}
