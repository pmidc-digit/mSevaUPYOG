package digit.service;

import static digit.constants.MDMSMigrationToolkitConstants.DOT_SEPARATOR;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.saasquatch.jsonschemainferrer.JsonSchemaInferrer;

import digit.config.Configuration;
import digit.repository.ServiceRequestRepository;
import digit.util.FileReader;
import digit.util.FileWriter;
import digit.web.models.SchemaDefinition;
import digit.web.models.SchemaDefinitionRequest;
import digit.web.models.SchemaMigrationRequest;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;

@Service
@Slf4j
public class SchemaDefinitionMigrationService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FileWriter fileWriter;

    @Autowired
    private FileReader fileReader;

    @Autowired
    private JsonSchemaInferrer inferrer;
    
    @Autowired
    private Configuration config;

    @Value("${master.schema.files.dir}")
    public String schemaFilesDirectory;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private LocalizationService localizationService;

    private Map<String, JsonNode> schemaCodeToSchemaJsonMap;

    public void beginMigration(SchemaMigrationRequest schemaMigrationRequest) {
        // Fetch schema code to schema definition map
        Map<String, JsonNode> schemaCodeVsSchemaDefinitionMap = fileReader.readFiles(schemaFilesDirectory);

        List<SchemaDefinition> schemaDefinitionPOJOs = new ArrayList<>();

        // Go through each schemas and generate SchemaDefinition DTOs
        schemaCodeVsSchemaDefinitionMap.keySet().forEach(schemaCode -> {
            SchemaDefinition schemaDefinition = SchemaDefinition.builder()
                    .tenantId(schemaMigrationRequest.getSchemaMigrationCriteria().getTenantId())
                    .isActive(Boolean.TRUE)
                    .code(schemaCode)
                    .definition(schemaCodeVsSchemaDefinitionMap.get(schemaCode))
                    .id(UUID.randomUUID().toString())
                    .build();
            schemaDefinitionPOJOs.add(schemaDefinition);
        });

        schemaDefinitionPOJOs.forEach(schemaDefinition -> {            SchemaDefinitionRequest schemaDefinitionRequest = SchemaDefinitionRequest.builder()
                    .requestInfo(schemaMigrationRequest.getRequestInfo())
                    .schemaDefinition(schemaDefinition)
                    .build();

            // Send it to kafka/make API calls to MDMS service schema APIs
            try {
            	serviceRequestRepository.fetchResult(new StringBuilder(config.getMdmsV2Host() + config.getMdmsV2SchemaCreateEndPoint()), schemaDefinitionRequest);
            	// Push schema and property localization codes to egov-localization
            	localizationService.pushSchemaLocalization(
            			schemaDefinition.getCode(),
            			schemaDefinition.getDefinition(),
            			schemaMigrationRequest.getRequestInfo(),
            			schemaMigrationRequest.getSchemaMigrationCriteria().getTenantId()
            	);
			} catch (Exception e) {
				log.error("Error in : " + schemaDefinition);
			}
        });
    }


    public void generateSchemaDefinition() {
        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        
        Map<String, Map<String, Object>> masterConfigMap = MDMSApplicationRunnerImpl.getMasterConfigMap();

        schemaCodeToSchemaJsonMap = new HashMap<>();

        // Traverse tenantMap across the tenants, modules and masters to generate schema for each master
        tenantMap.keySet().forEach(tenantId -> {
            tenantMap.get(tenantId).keySet().forEach(module -> {
                tenantMap.get(tenantId).get(module).keySet().forEach(master -> {
                    JSONArray masterDataJsonArray = MDMSApplicationRunnerImpl
                            .getTenantMap()
                            .get(tenantId)
                            .get(module)
                            .get(master);

                    if (!masterDataJsonArray.isEmpty()) {
                        // Convert master data to JsonNode
//                        JsonNode jsonNode = objectMapper.convertValue(masterDataJsonArray.get(0), JsonNode.class);

                        // Feed the converted master data to jsonSchemaInferrer for generating schema
//                        JsonNode schemaNode = inferrer.inferForSample(jsonNode);
                        
                        try {	
                        	ObjectNode schemaNode = getSchemaNode(masterDataJsonArray);
                        	if(!schemaNode.get("properties").has("id")) {
                        		addIdFieldInSchema(schemaNode);
                            }
                        	
                        	// Fix array fields missing items definition
                        	fixArrayFieldsInSchema(schemaNode);
                        	
                        	// Populate schemaCodeToSchemaJsonMap
                            schemaCodeToSchemaJsonMap.put(module + DOT_SEPARATOR + master, schemaNode);
                            log.info("Schema generated for : " + module + DOT_SEPARATOR + master);
                            // Write generated schema definition to files with the name in module.master format
                            fileWriter.writeJsonToFile(schemaNode, module + DOT_SEPARATOR + master);
                        	
						} catch (Exception e) {
							log.error("Error in : " + module + DOT_SEPARATOR + master + " - " + e.getMessage());
						}
                        
                    }

                });
            });
        });
    }
    
    /**
     * Add ID Field in the Master Data Schema
     *  
     * @param schemaNode
     * @throws Exception
     */
    private void addIdFieldInSchema(JsonNode schemaNode)throws Exception {
    	ObjectNode properties = (ObjectNode)schemaNode.get("properties");
    	JsonNode typeNode = objectMapper.readTree("{\"type\":\"string\"}");
    	properties.set("id", typeNode);
    	
    	ArrayNode required = (ArrayNode)schemaNode.get("required");
    	required.add("id");
    }

    /**
     * Recursively fix array properties in schema that miss an 'items' definition
     * 
     * @param node
     */
    private void fixArrayFieldsInSchema(JsonNode node) {
        if (node == null || !node.isObject()) return;
        ObjectNode objNode = (ObjectNode) node;

        if (objNode.has("type") && "array".equals(objNode.get("type").asText())) {
            if (!objNode.has("items")) {
                ObjectNode itemsNode = objectMapper.createObjectNode();
                itemsNode.put("type", "string");
                objNode.set("items", itemsNode);
            }
        }

        if (objNode.has("properties") && objNode.get("properties").isObject()) {
            Iterator<JsonNode> elements = objNode.get("properties").elements();
            while (elements.hasNext()) {
                fixArrayFieldsInSchema(elements.next());
            }
        }

        if (objNode.has("items") && objNode.get("items").isObject()) {
            fixArrayFieldsInSchema(objNode.get("items"));
        }
    }
    
    /**
     * Generate Master Data Schema
     * 
     * @param masterDataJsonArray
     * @return
     */
	private ObjectNode getSchemaNode(JSONArray masterDataJsonArray) {
		// 1. Get Master Data Size
		Long dataSize = Long.valueOf(masterDataJsonArray.size());
		// 2. Convert all records in masterDataJsonArray into a List of JsonNodes
		List<JsonNode> sampleNodes = new ArrayList<>();
		for (Object record : masterDataJsonArray) {
			sampleNodes.add(objectMapper.convertValue(record, JsonNode.class));
		}
		// 3. Collect top-level entries to determine required fields
		List<Entry<String, Object>> entryList = (List<Map.Entry<String, Object>>) masterDataJsonArray.stream()
				.map(data -> objectMapper.convertValue(data, HashMap.class))
				.flatMap(dataMap -> dataMap.entrySet().stream()).collect(Collectors.toList());
		
		// A field is required only if it is present in 100% of master data records
		List<String> requiredList = entryList.stream().map(Entry::getKey)
				.collect(Collectors.groupingBy(Function.identity(), Collectors.counting())).entrySet().stream()
				.filter(entry -> entry.getValue().equals(dataSize)).map(Entry::getKey).collect(Collectors.toList());
		
		// 4. Infer schema across ALL sample records (merges all fields automatically)
		JsonNode schemaNode = inferrer.inferForSamples(sampleNodes);
		Map<String, Object> schemaNodeMap = objectMapper.convertValue(schemaNode, Map.class);

		schemaNodeMap.put("required", requiredList);
		schemaNodeMap.put("x-unique", Arrays.asList("id"));
		return objectMapper.convertValue(schemaNodeMap, ObjectNode.class);
	}
    
}
