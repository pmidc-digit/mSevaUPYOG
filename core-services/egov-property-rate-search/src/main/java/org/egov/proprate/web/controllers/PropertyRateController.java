package org.egov.proprate.web.controllers;

import org.egov.proprate.service.PropertyRateService;
import org.egov.proprate.web.models.AddPropertyRate;
import org.egov.proprate.web.models.PropertyRate;
import org.egov.proprate.web.models.PropertyRateRequest;
import org.egov.proprate.web.models.PropertyRateResponse;
import org.egov.proprate.web.models.RateResponse;
import org.egov.proprate.web.models.RateSearchRequest;
import org.egov.proprate.web.models.ResponseFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

@RestController
@RequestMapping("/property-rate")
public class PropertyRateController {

    @Autowired
    private PropertyRateService service;

    @Autowired
    private ResponseFactory responseFactory;

    @PostMapping("/_search")
    public ResponseEntity<RateResponse> search(@RequestBody RateSearchRequest request) {
        // 1. Fetch Data (Get raw list of maps from DB)
        List<Map<String, Object>> results = service.searchRates(request);

        // 2. Build Response (Delegate logic to Factory)
        RateResponse response = responseFactory.createResponse(results, request);

        // 3. Return
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/revenue/_missing")
    public ResponseEntity<Object> searchMissing(
            @RequestParam(value = "tenantId", required = false) String tenantId,
            @RequestParam(value = "localityCode", required = false) String localityCode,
            @RequestParam(value = "propertyId", required = false) String propertyId,
            @RequestParam(value = "limit", required = false) Integer limit) {

        // 1. Better Validation Response
        if (tenantId == null || tenantId.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "tenantId is mandatory and cannot be empty");
            return ResponseEntity.badRequest().body(error);
        }

     List<Map<String, Object>> results = service.searchMissingRevenueProperties(tenantId, localityCode, limit,true,propertyId);

        if (results == null) results = Collections.emptyList();

        // 3. Return the actual data
        return results.isEmpty()
				? ResponseEntity.ok().body(Collections.emptyList())
				: ResponseEntity.ok().body(results);
    }
    
    
    @PostMapping("/revenue/_mappedsearch")
    public ResponseEntity<Object> updatedMissing(
            @RequestParam(value = "tenantId", required = false) String tenantId,
            @RequestParam(value = "localityCode", required = false) String localityCode,
            @RequestParam(value = "propertyId", required = false) String propertyId,
            @RequestParam(value = "limit", required = false) Integer limit) {

        // 1. Better Validation Response
        if (tenantId == null || tenantId.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "tenantId is mandatory and cannot be empty");
            return ResponseEntity.badRequest().body(error);
        }

     List<Map<String, Object>> results = service.searchMissingRevenueProperties(tenantId, localityCode, limit,false,propertyId);

        if (results == null) results = Collections.emptyList();

        // 3. Return the actual data
        return results.isEmpty()
				? ResponseEntity.ok().body(Collections.emptyList())
				: ResponseEntity.ok().body(results);
    }
    
    @PostMapping("/_create") 
    public ResponseEntity<PropertyRateResponse> createPropertyRate(
            @Valid @RequestBody PropertyRateRequest request) { 

        List<AddPropertyRate> savedEntity = service.create(request);

        PropertyRateResponse response = 
                responseFactory.createCreateResponse(savedEntity, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/_update")
    public ResponseEntity<PropertyRateResponse> updatePropertyRate(
            @Valid @RequestBody PropertyRateRequest request) {

        // 1. Call service to process the update logic (validation, enrichment, and repository call)
        List<AddPropertyRate> updatedEntities = service.update(request);

        // 2. Build Response using the Factory
        PropertyRateResponse response = 
                responseFactory.createCreateResponse(updatedEntities, request);

        // 3. Return 200 OK or 201 CREATED depending on your business requirement
        return new ResponseEntity<>(response, HttpStatus.OK);
    }




}