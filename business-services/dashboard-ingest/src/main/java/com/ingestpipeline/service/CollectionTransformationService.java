package com.ingestpipeline.service;

import com.bazaarvoice.jolt.Chainr;
import com.bazaarvoice.jolt.JsonUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.ingestpipeline.util.ConfigLoader;
import com.ingestpipeline.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service(Constants.Qualifiers.TRANSFORM_COLLECTION_SERVICE)
public class CollectionTransformationService implements TransformService {

    public static final Logger LOGGER = LoggerFactory.getLogger(CollectionTransformationService.class);


    private static final String SEPARATOR = "_";
    private static final String JSON_EXTENSION = ".json";
    private static final String OBJECTIVE = "transform";
    private static final String CONFIGROOT = "config/";
    private static final String JOLT_SPEC = "spec";

    private static final String TRANSACTION_ID = "transactionId";
    private static final String ID = "id";



    @Autowired
    private ConfigLoader configLoader;

    private String previousKey= "";

    @Override
    public Boolean transformData(Map incomingData) {

        Map incomingDataCopy = new HashMap<>();
        incomingDataCopy.putAll(incomingData);
        incomingData.clear();

        String dataContext = incomingDataCopy.get(Constants.DATA_CONTEXT) != null 
                ? incomingDataCopy.get(Constants.DATA_CONTEXT).toString() : "";
        String dataContextVersion = incomingDataCopy.get(Constants.DATA_CONTEXT_VERSION) != null 
                ? incomingDataCopy.get(Constants.DATA_CONTEXT_VERSION).toString() : "v1";
        ObjectMapper mapper = new ObjectMapper();
        List chainrSpecJSON = null ;

        try {

            JsonNode incomingNode = mapper.convertValue(incomingDataCopy, JsonNode.class);

            // Attempt to load the primary transform spec
            String trsFile = OBJECTIVE.concat(SEPARATOR).concat(dataContext).concat(SEPARATOR).concat(dataContextVersion).concat(JSON_EXTENSION);
            String strFile = configLoader.get(trsFile);

            // Fallback: if requested spec not found, try alternative version (v1 <-> v2)
            if (strFile == null) {
                LOGGER.warn("Transform spec '{}' not found in ConfigLoader. Checking alternative version...", trsFile);
                String altVersion = "v2".equalsIgnoreCase(dataContextVersion) ? "v1" : "v2";
                String altTrsFile = OBJECTIVE.concat(SEPARATOR).concat(dataContext).concat(SEPARATOR).concat(altVersion).concat(JSON_EXTENSION);
                strFile = configLoader.get(altTrsFile);
                if (strFile != null) {
                    LOGGER.info("Successfully resolved alternative transform spec: {}", altTrsFile);
                    trsFile = altTrsFile;
                }
            }

            if (strFile == null) {
                LOGGER.error("No transform specification found for context '{}' with version '{}' or fallback. Loaded resources: {}",
                        dataContext, dataContextVersion, configLoader.getResourceNames());
                return Boolean.FALSE;
            }

            JsonNode specNode = mapper.readTree(strFile);

            previousKey = "";
            String previousField = findParentKey(specNode.findPath(JOLT_SPEC), "$i", "");
            List<JsonNode> parentFieldValues = incomingNode.findValues(previousField);
            if (parentFieldValues == null || parentFieldValues.isEmpty() || parentFieldValues.get(0).size() == 0) {
                LOGGER.error("Cannot find parent field '{}' in incoming payment data", previousField);
                return Boolean.FALSE;
            }
            int parentNodeSize = parentFieldValues.get(0).size();

            boolean hasJ = specNode.toString().contains("$j");

            for(int i=0; (i<parentNodeSize); i++){
                if (hasJ) {
                    previousKey = "";
                    String jField = findParentKey(specNode.findPath(JOLT_SPEC), "$j", "");
                    List<JsonNode> nestedList = incomingNode.findValues(jField);
                    if (nestedList != null && nestedList.size() > i && nestedList.get(i) instanceof ArrayNode) {
                        ArrayNode nestedNodes = (ArrayNode) nestedList.get(i);
                        for(int j=0; j< nestedNodes.size(); j++){
                            JsonNode idNode = nestedNodes.get(j).get(ID);
                            String spec = specNode.toString();
                            spec = spec.replace("$i", i+"");
                            spec = spec.replace("$j", j+"");

                            InputStream stream = new ByteArrayInputStream(spec.getBytes());
                            chainrSpecJSON = JsonUtils.jsonToList(stream);
                            Chainr chainr = Chainr.fromSpec( chainrSpecJSON );
                            Object inputJSON = incomingDataCopy.get(Constants.DATA_OBJECT);

                            try {
                                Object transformedOutput = chainr.transform( inputJSON );

                                Map incomingMap = new HashMap();
                                incomingMap.put(Constants.DATA_CONTEXT, dataContext);
                                incomingMap.put(Constants.DATA_CONTEXT_VERSION, dataContextVersion);
                                incomingMap.put(Constants.DATA_OBJECT , transformedOutput);

                                String idVal = (idNode != null && !idNode.isNull()) ? idNode.asText() : (incomingNode.has(ID) ? incomingNode.get(ID).asText() : ("doc_" + i + "_" + j));
                                incomingMap.put(Constants.IDENTIFIER, idVal);
                                incomingData.put(idVal, incomingMap);

                            } catch (Exception e) {
                                LOGGER.error("Encountered an error while transforming the JSON : " + e.getMessage(), e);
                                return Boolean.FALSE;
                            }
                        }
                    }
                } else {
                    // Spec has only $i (single-level array transformation, e.g. paymentDetails)
                    ArrayNode iArray = (ArrayNode) parentFieldValues.get(0);
                    JsonNode currentINode = iArray.get(i);
                    JsonNode idNode = (currentINode != null && currentINode.has(ID)) ? currentINode.get(ID) : null;
                    String spec = specNode.toString();
                    spec = spec.replace("$i", i+"");

                    InputStream stream = new ByteArrayInputStream(spec.getBytes());
                    chainrSpecJSON = JsonUtils.jsonToList(stream);
                    Chainr chainr = Chainr.fromSpec( chainrSpecJSON );
                    Object inputJSON = incomingDataCopy.get(Constants.DATA_OBJECT);

                    try {
                        Object transformedOutput = chainr.transform( inputJSON );

                        Map incomingMap = new HashMap();
                        incomingMap.put(Constants.DATA_CONTEXT, dataContext);
                        incomingMap.put(Constants.DATA_CONTEXT_VERSION, dataContextVersion);
                        incomingMap.put(Constants.DATA_OBJECT , transformedOutput);

                        String idVal = (idNode != null && !idNode.isNull()) ? idNode.asText() : (incomingNode.has(ID) ? incomingNode.get(ID).asText() : ("doc_" + i));
                        incomingMap.put(Constants.IDENTIFIER, idVal);
                        incomingData.put(idVal, incomingMap);

                    } catch (Exception e) {
                        LOGGER.error("Encountered an error while transforming the JSON : " + e.getMessage(), e);
                        return Boolean.FALSE;
                    }
                }
            }
            return Boolean.TRUE;

        } catch (Exception e) {
            LOGGER.error("Encountered an error : " + e.getMessage(), e);
            return Boolean.FALSE;

        }

    }

    private String findParentKey(JsonNode node, String value, String key) {
        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();

            if (entry.getKey().equalsIgnoreCase(value)) {
                previousKey = key;
                break;
            } else if (entry.getValue().isObject()) {
                key = entry.getKey();
                findParentKey(entry.getValue(), value, key);
            }
        }
        return previousKey;

    }


    /*public void transformData() {

        Map incomingData = new HashMap();
*//*        Map incomingDataCopy = new HashMap();
        incomingDataCopy.putAll(incomingData);*//*
        incomingData.clear();
        //String dataContext = incomingData.get(Constants.DATA_CONTEXT).toString();
        //String dataContextVersion = incomingData.get(Constants.DATA_CONTEXT_VERSION).toString();
        ObjectMapper mapper = new ObjectMapper();
        List chainrSpecJSON = null ;
        List<Object> incomingDataList = new ArrayList<>();

        try {

            JsonNode specNode = mapper.readTree(configLoader.get("anytransform_collection_v2.json"));

            JsonNode incoming = mapper.readTree(configLoader.get("anyinput.json"));//TODO: use incomming node object
            Map incommingMap = new HashMap();
            incommingMap = mapper.convertValue(incoming, new TypeReference<Map<String, Object>>(){});

            String previousField = findKey(specNode.findPath(JOLT_SPEC), "$i", "");
            int parentNodeSize = incoming.findValues(previousField).get(0).size();

            for(int i=0; (i<parentNodeSize); i++){
                previousField = findKey(specNode.findPath(JOLT_SPEC), "$j", "");
                ArrayNode nestedNodes = (ArrayNode)incoming.findValues(previousField).get(i);
                for(int j=0; j< nestedNodes.size(); j++){
                    String spec = specNode.toString();
                    LOGGER.info("\"$i\" "+i);
                    LOGGER.info("\"$j\" "+j);


                    spec = spec.replace("$i", i+"");
                    spec = spec.replace("$j", j+"");


                    InputStream stream = new ByteArrayInputStream(spec.getBytes());
                    chainrSpecJSON = JsonUtils.jsonToList(stream);
                    Chainr chainr = Chainr.fromSpec( chainrSpecJSON );
                    Object inputJSON = incommingMap.get(Constants.DATA_OBJECT);
                    try {
                        Object transformedOutput = chainr.transform( inputJSON );
                        LOGGER.info("transformered date "+transformedOutput);

                        Map incomingDataCopy = new HashMap();
                        //incomingDataCopy.putAll(incomingData);

                        incomingDataCopy.put(Constants.DATA_OBJECT , transformedOutput);
                        incomingData.put(i+"-"+j, incomingDataCopy);

                    } catch (Exception e) {
                        LOGGER.error("Encountered an error while tranforming the JSON : " + e.getMessage());
                    }

                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            LOGGER.error("Encountered an error : " + e.getMessage());
        }

        LOGGER.info("incomingData.size() "+incomingData.size()+" keySet "+incomingData.entrySet());



    }*/


}




