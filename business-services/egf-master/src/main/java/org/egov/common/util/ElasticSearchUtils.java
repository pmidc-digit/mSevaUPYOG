package org.egov.common.util;

import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Elasticsearch utility class.
 * Note: Elasticsearch TransportClient has been removed in the Spring Boot 4.x upgrade.
 * This class is stubbed out. Re-implement with the new Elasticsearch Java API Client
 * (co.elastic.clients:elasticsearch-java) when ES support is needed.
 */
@Service
public class ElasticSearchUtils {

	// Stubbed out - ES TransportClient removed in Elasticsearch 8.x
	// Methods previously used BoolQueryBuilder which is no longer available

}