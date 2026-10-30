package org.egov.layout.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.model.CustomException;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.builder.LayoutFuzzySearchQueryBuilder;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ElasticSearchRepository {

    private LAYOUTConfiguration config;

    private LayoutFuzzySearchQueryBuilder queryBuilder;

    private RestTemplate restTemplate;

    private ObjectMapper mapper;

    @Autowired
    public ElasticSearchRepository(LAYOUTConfiguration config, LayoutFuzzySearchQueryBuilder queryBuilder, 
                                   RestTemplate restTemplate, ObjectMapper mapper) {
        this.config = config;
        this.queryBuilder = queryBuilder;
        this.restTemplate = restTemplate;
        this.mapper = mapper;
    }

    /**
     * Searches records from elasticsearch based on the fuzzy search criteria for Layouts
     *
     * @param criteria Layout search criteria
     * @return Object (ElasticSearch Response Body)
     */
    public Object fuzzySearchForLayouts(LayoutSearchCriteria criteria) {

        String url = getESURL();

        // Generates the JSON query string for ES
        String searchQuery = queryBuilder.getFuzzySearchQuery(criteria);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (config.getElasticsearchUsername() != null && !config.getElasticsearchUsername().isEmpty() &&
            config.getElasticsearchPassword() != null && !config.getElasticsearchPassword().isEmpty()) {
            headers.setBasicAuth(config.getElasticsearchUsername(), config.getElasticsearchPassword());
        }
        HttpEntity<String> requestEntity = new HttpEntity<>(searchQuery, headers);

        log.info("ES Search URL: {} | Request Body: {}", url, searchQuery);

        ResponseEntity<Object> response = null;
        try {
            response = restTemplate.postForEntity(url, requestEntity, Object.class);
        } catch (Exception e) {
            log.error("Error occurred while fetching data from ElasticSearch", e);
            throw new CustomException("ES_ERROR", "Failed to fetch data from ES for Layouts");
        }

        return response != null ? response.getBody() : null;
    }

    /**
     * Generates elasticsearch search url from layout-service application properties
     * Uses config to build: http://host:port/index-name/_search
     *
     * @return Full ES search URL
     */
    private String getESURL() {

        StringBuilder builder = new StringBuilder(config.getElasticsearchHost());
        
        builder.append(config.getElasticsearchIndexName());
        builder.append(config.getElasticsearchSearchEndpoint());

        return builder.toString();
    }
}
