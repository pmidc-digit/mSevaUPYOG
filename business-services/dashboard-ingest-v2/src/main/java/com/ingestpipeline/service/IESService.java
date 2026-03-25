package com.ingestpipeline.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ingestpipeline.model.TargetData;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface IESService {

    public final String DOC_TYPE = "/_doc/";

    ResponseEntity<Object> post(String index, String type, String id, String authToken, String requestNode);

    JsonNode search(String index, ObjectNode searchQuery) throws IOException;

    Boolean push(TargetData requestBody) throws Exception;

    Map search(String index, String query) throws Exception;

    List searchMultiple(String index, String query) throws Exception;

    Boolean push(Map requestBody) throws Exception;

    default boolean createIndex(String indexName){
        return Boolean.TRUE;
    }

    Boolean searchIndex(String index, String query, String dataContextVersion) throws Exception;
}
