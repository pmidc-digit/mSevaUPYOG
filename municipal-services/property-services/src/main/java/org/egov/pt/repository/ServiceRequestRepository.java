package org.egov.pt.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.pt.config.PropertyConfiguration;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;


import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;



import lombok.extern.slf4j.Slf4j;

@Repository
@Slf4j
public class ServiceRequestRepository {

	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PropertyConfiguration config;
	
	/**
	 * Fetches results from a REST service using the uri and object
	 * 
	 * @return Object
	 * @author vishal
	 */
	public Optional<Object> fetchResult(StringBuilder uri, Object request) {

		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		log.info("URI: "+uri.toString());
		try {
			log.info("Request: "+mapper.writeValueAsString(request));
			response = restTemplate.postForObject(uri.toString(), request, Map.class);
		} catch (HttpClientErrorException e) {
			
			log.error("External Service threw an Exception: ", e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		} catch (Exception e) {
			
			log.error("Exception while fetching from external service: ", e);
			throw new CustomException("REST_CALL_EXCEPTION : "+uri.toString(),e.getMessage());
		}
		return Optional.ofNullable(response);
	}
	
	public Optional<Object> savegisdata(StringBuilder uri, Object request) {

		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		log.info("URI: " + uri.toString());

		try {
			log.info("Request: " + mapper.writeValueAsString(request));
			String authHeader = "Basic " + config.getGisAuthToken(); // Replace with actual credentials
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("Authorization", authHeader);
			HttpEntity<Object> entity = new HttpEntity<>(request, headers);

			if (uri.toString().contains("_create") || uri.toString().contains("_createOrUpdate")) {
			    ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
			        uri.toString(),
			        HttpMethod.POST,
			        entity,
			        new ParameterizedTypeReference<Map<String, Object>>() {}
			    );
			    response = responseEntity.getBody();
			} else {
			    ResponseEntity<List<Map<String, Object>>> responseEntity = restTemplate.exchange(
			        uri.toString(),
			        HttpMethod.POST,
			        entity,
			        new ParameterizedTypeReference<List<Map<String, Object>>>() {}
			    );
			    response = responseEntity.getBody();
			}



		} catch (HttpClientErrorException e) {
			log.error("External Service threw an Exception: ", e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		} catch (Exception e) {
			log.error("Exception while fetching from external service: ", e);
			throw new CustomException("REST_CALL_EXCEPTION : " + uri.toString(), e.getMessage());
		}

		return Optional.ofNullable(response);
	}

	
	
	public Object fetchmdmsResult(String string, MdmsCriteriaReq request) {
		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		try {
			response = restTemplate.postForObject(string.toString(), request, Map.class);
		}catch(HttpClientErrorException e) {
			log.error("External Service threw an Exception: ",e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		}catch(Exception e) {
			log.error("Exception while fetching from searcher: ",e);
		}

		return response;
	}

}
