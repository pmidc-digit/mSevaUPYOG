package org.egov.layout.repository.builder;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.tracer.model.CustomException;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class LayoutFuzzySearchQueryBuilder {

    private ObjectMapper mapper;
    private LAYOUTConfiguration config;

    @Autowired
    public LayoutFuzzySearchQueryBuilder(ObjectMapper mapper, LAYOUTConfiguration config) {
        this.mapper = mapper;
        this.config = config;
    }

    private static final String BASE_QUERY = "{\n" +
            "  \"from\": {{OFFSET}},\n" +
            "  \"size\": {{LIMIT}},\n" +
            "  \"sort\": {\n" +
            "    \"Data.createdTime\": { \"order\": \"desc\" }\n" +
            "  },\n" +
            "  \"query\": {}\n" +
            "}";

    private static final String wildCardQueryTemplate = "{\"query_string\": {\"default_field\": \"{{VAR}}\", \"query\": \"*{{PARAM}}*\"}}";
    private static final String queryTemplate = "{\"query_string\": {\"default_field\": \"{{VAR}}\", \"query\": \"{{PARAM}}\"}}";

    public String getFuzzySearchQuery(LayoutSearchCriteria criteria) {
        try {
            String baseQuery = addPagination(criteria);
            JsonNode node = mapper.readTree(baseQuery);
            ObjectNode insideMatch = (ObjectNode) node.get("query");
            List<JsonNode> mustList = new LinkedList<>();

            // 1. Tenant Filter (Data.tenantId)
            if (criteria.getTenantId() != null) {
                mustList.add(getInnerNode(criteria.getTenantId(), "Data.tenantId", false));
            }

            // 2. Owner Name Filter
            if (criteria.getOwnerName() != null) {
                mustList.add(getInnerNode(criteria.getOwnerName(), "Data.owners.name", true));
            }

            // 3. Application Number
            if (criteria.getApplicationNo() != null) {
                mustList.add(getInnerNode(criteria.getApplicationNo(), "Data.applicationNo.keyword", false));
            }

            // 4. Layout Number
            if (criteria.getLayoutNo() != null) {
                mustList.add(getInnerNode(criteria.getLayoutNo(), "Data.layoutNo.keyword", false));
            }

            // 5. Mobile Number
            if (criteria.getMobileNumber() != null) {
                mustList.add(getInnerNode(criteria.getMobileNumber(), "Data.owners.mobileNumber.keyword", false));
            }

            // 6. Address / Locality
            if (criteria.getAddress() != null) {
                List<JsonNode> addressShouldClauses = new LinkedList<>();
                addressShouldClauses.add(getInnerNode(criteria.getAddress(), "Data.owners.permanentAddress", true));
                addressShouldClauses.add(getInnerNode(criteria.getAddress(), "Data.owners.correspondenceAddress", true));

                Map<String, Object> shouldBool = new HashMap<>();
                shouldBool.put("should", addressShouldClauses);
                shouldBool.put("minimum_should_match", 1);
                
                mustList.add(mapper.convertValue(new HashMap<String, Object>() {{ put("bool", shouldBool); }}, JsonNode.class));
            }

            // 7. Application Status
            if (criteria.getApplicationStatus() != null) {
                mustList.add(getInnerNode(criteria.getApplicationStatus(), "Data.applicationStatus.keyword", false));
            }

            // Final query assembly
            Map<String, Object> boolMap = new HashMap<>();
            boolMap.put("must", mustList);
            insideMatch.set("bool", mapper.convertValue(boolMap, JsonNode.class));

            return mapper.writeValueAsString(node);

        } catch (Exception e) {
            log.error("ES_QUERY_BUILDER_ERROR", e);
            throw new CustomException("QUERY_BUILD_ERROR", "Failed to build JSON query for Layout fuzzy search");
        }
    }

    private JsonNode getInnerNode(String param, String var, boolean isWildCard) throws JsonProcessingException {
        String template = isWildCard ? wildCardQueryTemplate : queryTemplate;
        String innerQuery = template.replace("{{PARAM}}", getEscapedString(param));
        innerQuery = innerQuery.replace("{{VAR}}", var);
        return mapper.readTree(innerQuery);
    }

    private String addPagination(LayoutSearchCriteria criteria) {
        Long limit = config.getDefaultLimit().longValue();
        Long offset = config.getDefaultOffset().longValue();

        if (criteria.getLimit() != null) {
            limit = Math.min(criteria.getLimit().longValue(), config.getMaxSearchLimit().longValue());
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
