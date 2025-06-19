package org.egov.waterconnection.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;

import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.egov.waterconnection.config.WSConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Slf4j
public class ServiceRequestRepository {
	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private RestTemplate restTemplate;
	

    @Autowired
    private WSConfiguration configs;

	public Object fetchResult(StringBuilder uri, Object request) {
		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		StringBuilder str = new StringBuilder(this.getClass().getCanonicalName()).append(".fetchResult:")
				.append(System.lineSeparator());
		str.append("URI: ").append(uri.toString()).append(System.lineSeparator());
		try {
			str.append("Request: ").append(mapper.writeValueAsString(request)).append(System.lineSeparator());
			log.debug(str.toString());
			response = restTemplate.postForObject(uri.toString(), request, Map.class);
		} catch (HttpClientErrorException e) {
			log.error("External Service threw an Exception: ", e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		} catch (Exception e) {
			log.error("Exception while fetching from searcher: ", e);
		}
		return response;
	}

	
	
	public Optional<Object> saveGisData(StringBuilder uri, Object request) {

		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		log.info("URI: " + uri.toString());

		try {
			log.info("Request: " + mapper.writeValueAsString(request));
			String authHeader = "Basic " + configs.getGisAuthToken(); // Replace with actual credentials
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

	
	
	public Object fetchResultUsingGet(StringBuilder uri) {
		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		Object response = null;
		StringBuilder str = new StringBuilder(this.getClass().getCanonicalName()).append(".fetchResult:")
				.append(System.lineSeparator());
		str.append("URI: ").append(uri.toString()).append(System.lineSeparator());
		try {
			log.debug(str.toString());
			response = restTemplate.getForObject(uri.toString(), Map.class);
		} catch (HttpClientErrorException e) {
			log.error("External Service threw an Exception: ", e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		} catch (Exception e) {
			log.error("Exception while fetching from searcher: ", e);
		}
		return response;
	}

	public String getShorteningURL(StringBuilder uri, Object request) {
		mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
		String response = null;
		StringBuilder str = new StringBuilder(this.getClass().getCanonicalName()).append(".fetchResult:")
				.append(System.lineSeparator());
		str.append("URI: ").append(uri.toString()).append(System.lineSeparator());
		try {
			log.debug(str.toString());
			response = restTemplate.postForObject(uri.toString(), request, String.class);
		} catch (HttpClientErrorException e) {
			log.error("External Service threw an Exception: ", e);
			throw new ServiceCallException(e.getResponseBodyAsString());
		} catch (Exception e) {
			log.error("Exception while fetching from searcher: ", e);
		}
		return response;
	}

}
