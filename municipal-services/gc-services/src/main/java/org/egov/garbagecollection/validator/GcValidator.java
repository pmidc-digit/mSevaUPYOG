package org.egov.garbagecollection.validator;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.egov.garbagecollection.service.GcFieldValidator;
import org.egov.garbagecollection.service.GcService;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.Property;
import org.egov.garbagecollection.web.models.SearchCriteria;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.service.MeterInfoValidator;
import org.egov.garbagecollection.service.PropertyValidator;
import org.egov.garbagecollection.service.GcFieldValidator;
import org.egov.garbagecollection.util.EncryptionDecryptionUtil;
import org.egov.garbagecollection.web.models.OwnerInfo;
import org.egov.garbagecollection.web.models.ValidatorResult;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.Connection.StatusEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import lombok.extern.slf4j.Slf4j;


@Component
@Slf4j
public class GcValidator {

    @Autowired
    private PropertyValidator propertyValidator;

    @Autowired
    private GcFieldValidator waterFieldValidator;

    @Autowired
    private MeterInfoValidator meterInfoValidator;

    @Autowired
    private ValidateProperty validateProperty;

    @Autowired
    private GcService gcService;

    @Autowired
    EncryptionDecryptionUtil encryptionDecryptionUtil;

    /**
     * Used strategy pattern for avoiding multiple if else condition
     *
     * @param waterConnectionRequest
     * @param reqType
     */
    public void validateGarbageConnection(GarbageConnectionRequest waterConnectionRequest, int reqType) {
        Map<String, String> errorMap = new HashMap<>();
        String channel = waterConnectionRequest.getGarbageConnection().getChannel();
        if (StringUtils.isEmpty(waterConnectionRequest.getGarbageConnection().getProcessInstance())
                || StringUtils.isEmpty(waterConnectionRequest.getGarbageConnection().getProcessInstance().getAction())) {
            errorMap.put("INVALID_ACTION", "Workflow obj can not be null or action can not be empty!!");
            throw new CustomException(errorMap);
        }
        ValidatorResult isPropertyValidated = propertyValidator.validate(waterConnectionRequest, reqType);
        if (!isPropertyValidated.isStatus())
            errorMap.putAll(isPropertyValidated.getErrorMessage());

        // Validate unit for connection (NEW)
        if (reqType == GCConstants.CREATE_APPLICATION) {
            try {
                Property property = validateProperty.getOrValidateProperty(waterConnectionRequest);
                validateProperty.validateUnitForConnection(waterConnectionRequest, property);
                validateConnectionsPerProperty(waterConnectionRequest);
            } catch (CustomException e) {
                errorMap.putAll(e.getErrors());
            }
        }
        String usertype = waterConnectionRequest.getRequestInfo().getUserInfo().getType();
        if (!usertype.equalsIgnoreCase("CITIZEN")) {
            ValidatorResult isWaterFieldValidated = waterFieldValidator.validate(waterConnectionRequest, reqType);
            if (!isWaterFieldValidated.isStatus())
                errorMap.putAll(isWaterFieldValidated.getErrorMessage());
            ValidatorResult isMeterInfoValidated = meterInfoValidator.validate(waterConnectionRequest, reqType);
            if (!isMeterInfoValidated.isStatus())
                errorMap.putAll(isMeterInfoValidated.getErrorMessage());
        }
        if (waterConnectionRequest.getGarbageConnection().getProcessInstance().getAction().equalsIgnoreCase("PAY"))
            errorMap.put("INVALID_ACTION", "Pay action cannot be perform directly");

        if (channel != null) {
            if (!GCConstants.CHANNEL_VALUES.contains(channel))
                errorMap.put("INVALID_CHANNEL", "The value given for channel field is invalid");
            if (reqType == GCConstants.CREATE_APPLICATION && waterConnectionRequest.getRequestInfo().getUserInfo().getType().equalsIgnoreCase("EMPLOYEE") && channel.equalsIgnoreCase("CITIZEN"))
                errorMap.put("INVALID_CHANNEL", "The value given for channel field is invalid for employee role");
            if (reqType == GCConstants.CREATE_APPLICATION && waterConnectionRequest.getRequestInfo().getUserInfo().getType().equalsIgnoreCase("CITIZEN") && !channel.equalsIgnoreCase("CITIZEN"))
                errorMap.put("INVALID_CHANNEL", "The value given for channel field is invalid for citizen role");
        }

        if (!errorMap.isEmpty())
            throw new CustomException(errorMap);
    }

    public void validatePropertyForConnection(List<GarbageConnection> waterConnectionList) {
        waterConnectionList.forEach(waterConnection -> {
            if (StringUtils.isEmpty(waterConnection.getId())) {
                StringBuilder builder = new StringBuilder();
                builder.append("PROPERTY UUID NOT FOUND FOR ")
                        .append(waterConnection.getConnectionNo() == null ? waterConnection.getApplicationNo()
                                : waterConnection.getConnectionNo());
                log.error(builder.toString());
            }
        });
    }

    /**
     * Validate for previous data to current data
     *
     * @param request      water connection request
     * @param searchResult water connection search result
     */
    public void validateUpdate(GarbageConnectionRequest request, GarbageConnection searchResult, int reqType) {
        validateAllIds(request.getGarbageConnection(), searchResult);
        validateDuplicateDocuments(request);
        setFieldsFromSearch(request, searchResult, reqType);

    }

    /**
     * Validates if all ids are same as obtained from search result
     *
     * @param updateGarbageConnection The water connection request from update request
     * @param searchResult            The water connection from search result
     */
    private void validateAllIds(GarbageConnection updateGarbageConnection, GarbageConnection searchResult) {
        Map<String, String> errorMap = new HashMap<>();
        if (!searchResult.getApplicationNo().equals(updateGarbageConnection.getApplicationNo()))
            errorMap.put("INVALID UPDATE", "The application number from search: " + searchResult.getApplicationNo()
                    + " and from update: " + updateGarbageConnection.getApplicationNo() + " does not match");
        if (!CollectionUtils.isEmpty(errorMap))
            throw new CustomException(errorMap);
    }

    /**
     * Validates application documents for duplicates
     *
     * @param request The waterConnection Request
     */
    private void validateDuplicateDocuments(GarbageConnectionRequest request) {
        if (request.getGarbageConnection().getDocuments() != null) {
            List<String> documentFileStoreIds = new LinkedList<>();
            request.getGarbageConnection().getDocuments().forEach(document -> {
                if (documentFileStoreIds.contains(document.getFileStoreId()))
                    throw new CustomException("DUPLICATE_DOCUMENT_ERROR",
                            "Same document cannot be used multiple times");
                else
                    documentFileStoreIds.add(document.getFileStoreId());
            });
        }
    }

    /**
     * Enrich Immutable fields
     *
     * @param request      Water connection request
     * @param searchResult water connection search result
     */
    private void setFieldsFromSearch(GarbageConnectionRequest request, GarbageConnection searchResult, int reqType) {
        if (reqType == GCConstants.UPDATE_APPLICATION) {
            request.getGarbageConnection().setConnectionNo(searchResult.getConnectionNo());
        }

        /*
         * Replace the requestBody data and data from dB for those fields that come as masked (data containing "*" is
         * identified as masked) in requestBody
         *
         * */
        if (!CollectionUtils.isEmpty(request.getGarbageConnection().getConnectionHolders()) &&
                !CollectionUtils.isEmpty(searchResult.getConnectionHolders())) {

            List<OwnerInfo> connHolders = request.getGarbageConnection().getConnectionHolders();
            //	searchResult = encryptionDecryptionUtil.decryptObject(searchResult, "WnSConnectionDecrypDisabled", GarbageConnection.class, request.getRequestInfo());
            List<OwnerInfo> searchedConnHolders = searchResult.getConnectionHolders();

            if (!ObjectUtils.isEmpty(connHolders.get(0).getOwnerType()) &&
                    !ObjectUtils.isEmpty(searchedConnHolders.get(0).getOwnerType())) {

                int k = 0;
                for (OwnerInfo holderInfo : connHolders) {
                    if (holderInfo.getOwnerType().contains("*"))
                        holderInfo.setOwnerType(searchedConnHolders.get(k).getOwnerType());
                    if (holderInfo.getRelationship().contains("*"))
                        holderInfo.setRelationship(searchedConnHolders.get(k).getRelationship());

                    k++;
                }
            }
        }
    }

    public void validateConnectionStatus(List<GarbageConnection> previousConnectionsList, GarbageConnectionRequest garbageConnectionRequest, int reqType) {
        Map<String, String> errorMap = new HashMap<>();
        GarbageConnection garbageConnection = previousConnectionsList.stream().filter(wc -> wc.getOldApplication().booleanValue() == false).findFirst().orElse(null);
        if (garbageConnection != null) {
            if (reqType == GCConstants.RECONNECTION && !(garbageConnection.getStatus() == StatusEnum.ACTIVE
                    && GCConstants.DISCONNECTION_FINAL_STATE.equals(garbageConnection.getApplicationStatus()))) {
                errorMap.put("INVALID APPLICATION", "Reconnection can only be applied on a disconnected connection.");
            }
            if (reqType == GCConstants.DISCONNECT_CONNECTION && !(garbageConnection.getStatus() == StatusEnum.ACTIVE
                    && (GCConstants.MODIFIED_FINAL_STATE_DISCONNECTED.equals(garbageConnection.getApplicationStatus()))
                    || GCConstants.STATUS_APPROVED.equals(garbageConnection.getApplicationStatus()))) {
                errorMap.put("INVALID APPLICATION", "The connection is either in workflow or already closed");
            }
            if (reqType == GCConstants.DISCONNECT_CONNECTION && !(garbageConnection.getStatus() == StatusEnum.ACTIVE
                    && (GCConstants.STATUS_APPROVED.equals(garbageConnection.getApplicationStatus())))) {
                errorMap.put("INVALID APPLICATION", "The connection is either in workflow or already closed");
            }
        }

        if (!CollectionUtils.isEmpty(errorMap))
            throw new CustomException(errorMap);
    }

    /**
     * Validate that:
     * 1. Unit doesn't already have an active connection
     * 2. Property doesn't exceed max 3 connections
     */
    private void validateConnectionsPerProperty(GarbageConnectionRequest request) {
        if (request == null || request.getGarbageConnection() == null) {
            throw new CustomException("INVALID_REQUEST", "Garbage connection request or connection details cannot be null");
        }
        
        String propertyId = request.getGarbageConnection().getPropertyId();
        String unitId = request.getGarbageConnection().getUnitId();
        String tenantId = request.getGarbageConnection().getTenantId();

        // Validate required fields
        if (StringUtils.isEmpty(propertyId)) {
            throw new CustomException("INVALID_PROPERTY_ID", "Property ID is required for creating a garbage connection");
        }
        if (StringUtils.isEmpty(tenantId)) {
            throw new CustomException("INVALID_TENANT_ID", "Tenant ID is required for creating a garbage connection");
        }
        if (StringUtils.isEmpty(unitId)) {
            throw new CustomException("INVALID_UNIT_ID", "Unit ID is required for creating a garbage connection");
        }
        if (request.getRequestInfo() == null) {
            throw new CustomException("INVALID_REQUEST_INFO", "Request info cannot be null");
        }

        try {
            // Search for existing connections for this property and unit
            SearchCriteria criteriaForUnit = SearchCriteria.builder()
                    .propertyId(propertyId)
                    .unitId(unitId)
                    .tenantId(tenantId)
                    .build();

            // Search for all connections on the property to check max limit
            SearchCriteria criteriaForProperty = SearchCriteria.builder()
                    .propertyId(propertyId)
                    .tenantId(tenantId)
                    .build();

            // Check if unit already has a connection
            List<GarbageConnection> unitConnections = gcService.search(criteriaForUnit, request.getRequestInfo());
            
            if (unitConnections != null && !unitConnections.isEmpty()) {
                // Consider a connection active only when both status is ACTIVE
                // and applicationStatus is CONNECTION_ACTIVATED
                boolean unitHasActiveConnection = unitConnections.stream()
                        .filter(conn -> conn != null && conn.getStatus() != null && conn.getApplicationStatus() != null)
                        .anyMatch(conn -> conn.getStatus() == StatusEnum.ACTIVE
                                && GCConstants.STATUS_APPROVED.equalsIgnoreCase(conn.getApplicationStatus()));

                if (unitHasActiveConnection) {
                    throw new CustomException("UNIT_ALREADY_HAS_CONNECTION",
                            "Unit " + unitId + " already has an active garbage connection. " +
                                    "Only one connection is allowed per unit.");
                }
            }

            // Check max 3 connections per property
            List<GarbageConnection> propertyConnections = gcService.search(criteriaForProperty, request.getRequestInfo());
            
            if (propertyConnections != null && !propertyConnections.isEmpty()) {
                // Filter active connections only
                List<GarbageConnection> activeConnections = propertyConnections.stream()
                    .filter(conn -> conn != null && conn.getStatus() != null && conn.getStatus() == StatusEnum.ACTIVE
                        && conn.getApplicationStatus() != null && GCConstants.STATUS_APPROVED.equalsIgnoreCase(conn.getApplicationStatus()))
                    .collect(Collectors.toList());
                
                if (activeConnections.size() >= 3) {
                    throw new CustomException("MAX_CONNECTIONS_EXCEEDED",
                            "Property " + propertyId + " already has 3 active connections. " +
                                    "Maximum 3 garbage connections are allowed per property.");
                }
                
                log.info("Validation passed: Property {} has {} active connections, adding connection for unit {}",
                        propertyId, activeConnections.size(), unitId);
            }
        } catch (CustomException e) {
            throw e; // Re-throw CustomException as-is
        } catch (Exception e) {
            log.error("Error while validating connections per property for propertyId: {}, unitId: {}", propertyId, unitId, e);
            throw new CustomException("CONNECTION_VALIDATION_ERROR", 
                    "An error occurred while validating connections for property: " + propertyId + 
                    ". Error: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}