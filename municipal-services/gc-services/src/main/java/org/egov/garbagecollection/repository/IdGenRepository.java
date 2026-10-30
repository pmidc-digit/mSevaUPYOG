package org.egov.garbagecollection.repository;


import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.web.models.Idgen.IdGenerationRequest;
import org.egov.garbagecollection.web.models.Idgen.IdGenerationResponse;
import org.egov.garbagecollection.web.models.Idgen.IdRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@Slf4j
public class IdGenRepository {


    private RestTemplate restTemplate;

    private GCConfiguration config;
    
    @Autowired
    public IdGenRepository(RestTemplate restTemplate, GCConfiguration config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }


    /**
     * Call iDgen to generateIds
     * @param requestInfo The requestInfo of the request
     * @param tenantId The tenantId of the tradeLicense
     * @param name Name of the format
     * @param format Format of the ids
     * @param count Total Number of idGen ids required
     * @return Returns IdGen Service Response
     */
    public IdGenerationResponse getId(RequestInfo requestInfo, String tenantId, String name, String format, int count) {

        List<IdRequest> reqList = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            reqList.add(IdRequest.builder().idName(name).format(format).tenantId(tenantId).build());
        }
        IdGenerationRequest req = IdGenerationRequest.builder().idRequests(reqList).requestInfo(requestInfo).build();
        IdGenerationResponse response = null;
        try {
            response = restTemplate.postForObject( config.getIdGenHost()+ config.getIdGenPath(), req, IdGenerationResponse.class);
        } catch (HttpClientErrorException e) {
        	log.error("Unable to generate garbage connection ID", e);
            throw new ServiceCallException("Id gen service threw an Exception");
        } catch (Exception e) {
            Map<String, String> map = new HashMap<>();
            map.put(e.getCause().getClass().getName(),e.getMessage());
            throw new CustomException(map);
        }
        return response;
    }



}
