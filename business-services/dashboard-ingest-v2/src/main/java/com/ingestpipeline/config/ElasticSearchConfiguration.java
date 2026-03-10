package com.ingestpipeline.config;

import org.springframework.context.annotation.Configuration;

/**
 * Placeholder configuration for Elasticsearch when using HTTP REST calls.
 * RestHighLevelClient is intentionally not used to keep compatibility with ES 8 via HTTP.
 */
@Configuration
public class ElasticSearchConfiguration {

}
