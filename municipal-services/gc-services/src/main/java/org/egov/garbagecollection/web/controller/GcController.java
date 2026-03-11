package org.egov.garbagecollection.web.controller;

import java.util.List;
import javax.validation.Valid;


import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.service.DocumentService;
import org.egov.garbagecollection.service.GcEncryptionService;
import org.egov.garbagecollection.service.GcService;
import org.egov.garbagecollection.util.ResponseInfoFactory;
import org.egov.garbagecollection.web.models.*;
import org.egov.tracer.model.CustomException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@Builder
@RestController
@Slf4j
@RequestMapping("/gc")
public class GcController {

	@Autowired
	private GcService waterService;
    
    @Autowired
	private DocumentService documentService;
	
	@Autowired
	private final ResponseInfoFactory responseInfoFactory;

	@Autowired
	GcEncryptionService gcEncryptionService;

	@RequestMapping(value = "/_create", method = RequestMethod.POST, produces = "application/json")
	public ResponseEntity<GarbageConnectionResponse> createGarbageConnection(
			@Valid @RequestBody GarbageConnectionRequest garbageConnectionRequest) {
		garbageConnectionRequest.setCreateCall(true);
		List<GarbageConnection> garbageConnections = waterService.createGarbageConnection(garbageConnectionRequest);
		GarbageConnectionResponse response = GarbageConnectionResponse.builder().garbageConnections(garbageConnections)
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(garbageConnectionRequest.getRequestInfo(), true))
				.build();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	@RequestMapping(value = "/_createMigration", method = RequestMethod.POST, produces = "application/json")
	public ResponseEntity<GarbageConnectionResponse> createGarbageConnectionForMigration(
			@Valid @RequestBody GarbageConnectionRequest waterConnectionRequest, @RequestParam(required = true) boolean isMigration) {
		log.info("isMigration::::"+isMigration);
		log.info("++++++++++++++++++==waterConnectionRequest++++++++++++++"+waterConnectionRequest);
		isMigration=true;
		List<GarbageConnection> waterConnection = waterService.createGarbageConnection(waterConnectionRequest,isMigration);
		GarbageConnectionResponse response = GarbageConnectionResponse.builder().garbageConnections(waterConnection)
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(waterConnectionRequest.getRequestInfo(), true))
				.build();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	

	@RequestMapping(value = "/_search", method = RequestMethod.POST)
	public ResponseEntity<GarbageConnectionResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
			@Valid @ModelAttribute SearchCriteria criteria) {
		List<GarbageConnection> waterConnectionList = waterService.search(criteria, requestInfoWrapper.getRequestInfo());
		Integer count = waterService.countAllGarbageApplications(criteria, requestInfoWrapper.getRequestInfo());
		GarbageConnectionResponse response = GarbageConnectionResponse.builder().garbageConnections(waterConnectionList)
				.totalCount(count)
				.responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(),
						true))
				.build();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@RequestMapping(value = "/_update", method = RequestMethod.POST, produces = "application/json")
	public ResponseEntity<GarbageConnectionResponse> updateGarbageConnection(
			@Valid @RequestBody GarbageConnectionRequest waterConnectionRequest) {
		List<GarbageConnection> waterConnection = waterService.updateGarbageConnection(waterConnectionRequest);
		GarbageConnectionResponse response = GarbageConnectionResponse.builder().garbageConnections(waterConnection)
				.responseInfo(responseInfoFactory
						.createResponseInfoFromRequestInfo(waterConnectionRequest.getRequestInfo(), true))
				.build();
		return new ResponseEntity<>(response, HttpStatus.OK);

	}

	@RequestMapping(value = "/_plainsearch", method = RequestMethod.POST)
	public ResponseEntity<GarbageConnectionResponse> plainSearch(
			@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
			@Valid @ModelAttribute SearchCriteria criteria) {
		GarbageConnectionResponse response = waterService.plainSearch(criteria, requestInfoWrapper.getRequestInfo());
		response.setResponseInfo(
				responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true));
		return new ResponseEntity<>(response, HttpStatus.OK);

	}

	/**
	 * Encrypts existing Water records
	 *
	 * @param requestInfoWrapper RequestInfoWrapper
	 * @param criteria SearchCriteria
	 * @return list of updated encrypted data
	 */
	/* To be executed only once */
	@RequestMapping(value = "/_encryptOldData", method = RequestMethod.POST)
	public ResponseEntity<GarbageConnectionResponse> encryptOldData(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
			@Valid @ModelAttribute SearchCriteria criteria){
		throw new CustomException("EG_WS_ENC_OLD_DATA_ERROR", "Privacy disabled: The encryption of old data is disabled");
		/* Un-comment the below code to enable Privacy */
/*		GarbageConnectionResponse waterConnectionResponse = waterEncryptionService.updateOldData(criteria, requestInfoWrapper.getRequestInfo());
		waterConnectionResponse.setResponseInfo(
				responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true));
		return new ResponseEntity<>(waterConnectionResponse, HttpStatus.OK);*/
	}
	
	@RequestMapping(value = "/documents/_create", method = RequestMethod.POST)
	public ResponseEntity<String> saveDocuments(@Valid @RequestBody DocumentRequest documentRequest) {

		documentService.saveDocuments(documentRequest, documentRequest.getRequestInfo());
		return new ResponseEntity<>("WS Connection FilestoreIds Saved", HttpStatus.CREATED);
	}

	@RequestMapping(value="/disconnect", method=RequestMethod.POST)
	public ResponseEntity<String> disConnectGarbageConnection(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,@RequestParam String connectionNo,@RequestParam String tenantId ){
		
		waterService.disConnectGarbageConnection(connectionNo,requestInfoWrapper.getRequestInfo(),tenantId);
		return new ResponseEntity<>(GCConstants.SUCCESS_DISCONNECT_MSG, HttpStatus.CREATED);
	}

	/**
	 * Validate if property/unit can have a new GC connection
	 * Returns connection availability status for frontend
	 */
	@RequestMapping(value = "/_validateConnection", method = RequestMethod.POST)
	public ResponseEntity<ConnectionValidationResponse> validateConnectionAvailability(
			@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
			@RequestParam String propertyId,
			@RequestParam String unitId,
			@RequestParam String tenantId) {
		
		// Search for existing connections for this property and unit
		SearchCriteria criteria = SearchCriteria.builder()
			.propertyId(propertyId)
			.unitId(unitId)
			.tenantId(tenantId)
			.build();
		
		List<GarbageConnection> existingConnections = waterService.search(criteria, requestInfoWrapper.getRequestInfo());
		
		// Filter active connections only (status ACTIVE and applicationStatus CONNECTION_ACTIVATED)
		List<GarbageConnection> activeConnections = existingConnections != null ?
			existingConnections.stream()
				.filter(conn -> conn != null
						&& conn.getStatus() == Connection.StatusEnum.ACTIVE
						&& conn.getApplicationStatus() != null
						&& GCConstants.STATUS_APPROVED.equalsIgnoreCase(conn.getApplicationStatus()))
				.collect(java.util.stream.Collectors.toList()) :
			new java.util.ArrayList<>();
		
		// Check if unit already has a connection
		boolean unitHasConnection = activeConnections.stream()
			.anyMatch(conn -> unitId.equals(conn.getUnitId()));
		
		// Check if property has reached max connections
		boolean maxConnectionsReached = activeConnections.size() >= 3;
		
		// Build response
		ConnectionValidationResponse response = ConnectionValidationResponse.builder()
			.canCreateConnection(!unitHasConnection && !maxConnectionsReached)
			.unitHasActiveConnection(unitHasConnection)
			.activeConnectionsCount(activeConnections.size())
			.maxConnectionsReached(maxConnectionsReached)
			.propertyId(propertyId)
			.unitId(unitId)
			.message(buildValidationMessage(unitHasConnection, maxConnectionsReached, activeConnections.size()))
			.responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(
				requestInfoWrapper.getRequestInfo(), true))
			.build();
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	private String buildValidationMessage(boolean unitHasConnection, boolean maxReached, int activeCount) {
		if (unitHasConnection) {
			return "This unit already has an active garbage connection";
		}
		if (maxReached) {
			return "Property has reached maximum of 3 active connections";
		}
		return "Connection can be created. Property has " + activeCount + " active connection(s)";
	}

}