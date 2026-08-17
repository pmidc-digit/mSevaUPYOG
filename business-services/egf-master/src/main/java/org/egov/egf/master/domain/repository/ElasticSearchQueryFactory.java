package org.egov.egf.master.domain.repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Elasticsearch query factory - STUBBED OUT.
 * The Elasticsearch TransportClient and BoolQueryBuilder have been removed
 * in the Spring Boot 4.x upgrade (ES 8.x removed TransportClient).
 * Only the prepareOrderBys utility method is retained.
 * Re-implement with the new Elasticsearch Java API Client when ES support is needed.
 */
@Service
public class ElasticSearchQueryFactory {

	public List<String> prepareOrderBys(String sortBy) {
		List<String> orderByList = new ArrayList<String>();
		List<String> sortByList = new ArrayList<String>();
		if (sortBy.contains(",")) {
			sortByList = Arrays.asList(sortBy.split(","));
		} else {
			sortByList = Arrays.asList(sortBy);
		}
		for (String s : sortByList) {
			if (s.contains(" ")
					&& (s.toLowerCase().trim().endsWith("asc") || s.toLowerCase().trim().endsWith("desc"))) {
				orderByList.add(s.trim());
			} else {
				orderByList.add(s.trim() + " asc");
			}
		}

		return orderByList;
	}

}
