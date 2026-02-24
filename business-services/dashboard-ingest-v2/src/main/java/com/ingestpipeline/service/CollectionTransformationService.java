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


    @Override
    public Boolean transformData(Map incomingData) {

        Map incomingDataCopy = new HashMap<>();
        incomingDataCopy.putAll(incomingData);
        incomingData.clear();

        String dataContext = incomingDataCopy.get(Constants.DATA_CONTEXT).toString();
        String dataContextVersion = incomingDataCopy.get(Constants.DATA_CONTEXT_VERSION).toString();
        ObjectMapper mapper = new ObjectMapper();
        List chainrSpecJSON = null ;

        try {

            JsonNode incomingNode = mapper.convertValue(incomingDataCopy, JsonNode.class);
            //LOGGER.info("incoming data: "+incomingNode);
            //JsonNode identifier = incomingNode.get(Constants.DATA_OBJECT).get(TRANSACTION_ID);


            //To change: for loading the file from config root
            String trsFile = OBJECTIVE.concat(SEPARATOR).concat(dataContext).concat(SEPARATOR).concat(dataContextVersion).concat(JSON_EXTENSION);
            String strFile = configLoader.get(trsFile);
            JsonNode specNode = mapper.readTree(strFile);
            // LOGGER.info("specNode:## "+specNode);


            /*LOGGER.info("sourceUrl## "+strFile);

            String sourceUrl = CONFIGROOT.concat(OBJECTIVE.concat(SEPARATOR).concat(dataContext).concat(SEPARATOR).concat(dataContextVersion).concat(JSON_EXTENSION));

            LOGGER.info("sourceUrl## "+sourceUrl);

            JsonNode specNode = mapper.readTree(this.getClass().getClassLoader().getResourceAsStream(sourceUrl));

            LOGGER.info("specNode:## "+specNode);*/

            //String sourceUrl = (OBJECTIVE.concat(SEPARATOR).concat(dataContext).concat(SEPARATOR).concat(dataContextVersion).concat(JSON_EXTENSION));
            //JsonNode specNode = mapper.readTree(configLoader.get(sourceUrl));

            String previousField = findParentKey(specNode.findPath(JOLT_SPEC), "$i", "");
            if (previousField == null || previousField.isEmpty()) {
                LOGGER.error("Unable to determine parent key ($i) from spec");
                return Boolean.FALSE;
            }
            List<JsonNode> parentValues = incomingNode.findValues(previousField);
            if (parentValues == null || parentValues.size() == 0 || parentValues.get(0) == null) {
                LOGGER.error("No values found for parent key: {}", previousField);
                return Boolean.FALSE;
            }
            int parentNodeSize = parentValues.get(0).size();

            for(int i=0; (i<parentNodeSize); i++){
                previousField = findParentKey(specNode.findPath(JOLT_SPEC), "$j", "");
                if (previousField == null || previousField.isEmpty()) {
                    LOGGER.error("Unable to determine nested parent key ($j) from spec");
                    return Boolean.FALSE;
                }
                List<JsonNode> nestedValuesList = incomingNode.findValues(previousField);
                if (nestedValuesList == null || nestedValuesList.size() == 0 || nestedValuesList.get(i) == null) {
                    LOGGER.error("No nested values found for key: {} at index: {}", previousField, i);
                    return Boolean.FALSE;
                }
                ArrayNode nestedNodes = (ArrayNode) nestedValuesList.get(i);

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

                        incomingMap.put(Constants.IDENTIFIER, idNode.asText());
                        incomingData.put(idNode.asText(), incomingMap);

                    } catch (Exception e) {
                        LOGGER.error("Encountered an error while transforming the JSON : " + e.getMessage());
                        return Boolean.FALSE;
                    }

                }
            }
            // LOGGER.info("After collection transformation incomingData size "+incomingData.size()+" entries "+incomingData.entrySet());
            return Boolean.TRUE;

        } catch (Exception e) {
            LOGGER.error("Encountered an error : " + e.getMessage());
            return Boolean.FALSE;

        }

    }

    private String findParentKey(JsonNode node, String value, String key) {
        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();

            if (entry.getKey().equalsIgnoreCase(value)) {
                return key == null ? "" : key;
            } else if (entry.getValue().isObject()) {
                String found = findParentKey(entry.getValue(), value, entry.getKey());
                if (found != null && !found.isEmpty()) return found;
            }
        }
        return "";

    }

}




