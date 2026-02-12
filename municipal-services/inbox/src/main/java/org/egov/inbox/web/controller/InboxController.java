package org.egov.inbox.web.controller;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;

import javax.validation.Valid;

import com.fasterxml.jackson.databind.JsonNode;
import org.egov.inbox.service.DSSInboxFilterService;
import org.egov.inbox.service.ElasticSearchService;
import org.egov.inbox.service.InboxService;
import org.egov.inbox.web.model.InboxRequest;
import org.egov.inbox.web.model.InboxResponse;
import org.egov.inbox.util.ResponseInfoFactory;
import org.egov.inbox.web.model.dss.InboxMetricCriteria;
import org.egov.inbox.web.model.elasticsearch.InboxElasticSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

/**
 * Home redirection to swagger api documentation 
 */
@Slf4j
@RestController
@RequestMapping("/v1")
public class InboxController {
	
	@Autowired
	private InboxService inboxService;
	
	
	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	@Autowired
	private DSSInboxFilterService dssInboxService;

	@Autowired
	private ElasticSearchService elasticSearchService;
	
	
	@PostMapping(value = "/_search")
	public ResponseEntity<InboxResponse> search(@Valid @RequestBody  InboxRequest inboxRequest) {
		
		// Debug logging for UserInfo tenant issue
		log.info("=== INBOX SEARCH DEBUG ===");
		log.info("Request TenantId from criteria: {}", inboxRequest.getInbox() != null ? inboxRequest.getInbox().getTenantId() : "null");
		if(inboxRequest.getRequestInfo() != null && inboxRequest.getRequestInfo().getUserInfo() != null) {
			log.info("UserInfo TenantId: {}", inboxRequest.getRequestInfo().getUserInfo().getTenantId());
			log.info("UserInfo UUID: {}", inboxRequest.getRequestInfo().getUserInfo().getUuid());
			log.info("UserInfo Roles: {}", inboxRequest.getRequestInfo().getUserInfo().getRoles());
		} else {
			log.info("UserInfo is NULL");
		}
		log.info("=== END DEBUG ===");
		
		InboxResponse response = inboxService.fetchInboxData(inboxRequest.getInbox(),inboxRequest.getRequestInfo());
		
		response.setResponseInfo(
				responseInfoFactory.createResponseInfoFromRequestInfo(inboxRequest.getRequestInfo(), true));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/dss/_search")
	public ResponseEntity<Map<String, BigDecimal>> getChartV2(@Valid @RequestBody InboxMetricCriteria request) {
		Map<String, BigDecimal> response = dssInboxService.getAggregateData(request);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/elastic/_search")
	public ResponseEntity<Map<String, Object>>  elasticSearch(@Valid @RequestBody InboxElasticSearchRequest request) {
		Map<String, Object> data = elasticSearchService.search(request);
		return new ResponseEntity<>(data, HttpStatus.OK);
	}
	
}
