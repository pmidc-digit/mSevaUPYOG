package org.egov.infra.indexer.bulkindexer;

import java.util.Base64;
import java.util.Map;

import org.egov.infra.indexer.util.IndexerUtils;
import org.egov.infra.indexer.web.contract.Index;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BulkIndexer {

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	@Lazy
	private IndexerUtils indexerUtils;
	
	@Value("${elasticsearch.username}")
	private String username;

	@Value("${elasticsearch.password}")
	private String password;

	@Value("${egov.elasticsearch.api.auth}")
	private String apiAuth;

	@Value("${egov.elasticsearch.api.type.auth}")
	private String typeAuth;

	/**
	 * Methods that makes a REST API call to /_bulk API of the ES. This method
	 * triggers the listener orchestration method in case the ES cluster is down.
	 * 
	 * @param url
	 * @param indexJson
	 * @param index
	 * @throws Exception
	 */
	public void indexJsonOntoES(String url, String indexJson, Index index) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		try {
			log.debug("Record being indexed: " + indexJson);
			final HttpHeaders headers = buildAuthHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			final HttpEntity<String> entity = new HttpEntity<>(indexJson, headers);
			Object response = restTemplate.postForObject(url.toString(), entity, Map.class);
			if (url.contains("_bulk")) {
				if (JsonPath.read(mapper.writeValueAsString(response), "$.errors").equals(true)) {
					log.info("Indexing FAILED!!!!");
					log.info("Response from ES: " + response);
				}
			}
		} catch (final ResourceAccessException e) {
			log.error("ES is DOWN, Pausing kafka listener.......");
			indexerUtils.orchestrateListenerOnESHealth();
		} catch (Exception e) {
			log.error("Exception while trying to index to ES. Note: ES is not Down.", e);
		}
	}

	/**
	 * Fetches mapping from es for a given index and type.
	 * 
	 * @param url
	 * @return
	 */
	public Object getIndexMappingfromES(String url) {
		Object response = null;
		try {
			log.debug("URI: " + url.toString());
			HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders());
			response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();
		} catch (final ResourceAccessException e) {
			log.error("ES is DOWN, Pausing kafka listener.......");
			indexerUtils.orchestrateListenerOnESHealth();
		} catch (Exception e) {
			log.error("Exception while trying to fetch index mapping from ES. Note: ES is not Down.", e);
			return response;
		}
		log.debug("Mapping from ES: " + response);
		return response;

	}

	/**
	 * A common method to make API called ES for data retrieval, it can be used to
	 * get data from ES, modify settings of an index etc
	 * 
	 * @param url
	 * @param body
	 * @param httpMethod
	 * @return
	 */
	public Object getESResponse(String url, Object body, String httpMethod) {
		Object response = null;
		if (null != body) {
			if (httpMethod.equals("POST")) {
				try {
					HttpHeaders headers = buildAuthHeaders();
					headers.setContentType(MediaType.APPLICATION_JSON);
					HttpEntity<Object> entity = new HttpEntity<>(body, headers);
					response = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, Map.class).getBody();
				} catch (Exception e) {
					log.error("POST: Exception while fetching from es: " + e);
				}
			} else if (httpMethod.equals("PUT")) {
				try {
					HttpHeaders headers = buildAuthHeaders();
					headers.setContentType(MediaType.APPLICATION_JSON);
					HttpEntity<Object> entity = new HttpEntity<>(body, headers);
					restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, entity, Map.class);
					response = "OK";
				} catch (Exception e) {
					log.error("PUT: Exception while updating settings on es: " + e);
				}
			}
		} else {
			try {
				HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders());
				response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();
			} catch (Exception e) {
				log.error("GET: Exception while fetching from es: " + e);
			}
		}
		return response;
	}

	/**
	 * Builds HttpHeaders containing the Basic Auth credentials for Elasticsearch.
	 */
	private HttpHeaders buildAuthHeaders() {
		HttpHeaders headers = new HttpHeaders();
		String base64Creds = Base64.getEncoder().encodeToString((username + ":" + password).getBytes());
		headers.add(apiAuth, typeAuth + " " + base64Creds);
		return headers;
	}

}
