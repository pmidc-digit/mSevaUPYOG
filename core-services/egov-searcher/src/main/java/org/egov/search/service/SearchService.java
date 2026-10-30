package org.egov.search.service;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.egov.SearchApplicationRunnerImpl;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.search.model.Definition;
import org.egov.search.model.SearchDefinition;
import org.egov.search.model.SearchRequest;
import org.egov.search.repository.SearchRepository;
import org.egov.search.utils.ResponseInfoFactory;
import org.egov.search.utils.SearchReqValidator;
import org.egov.search.utils.SearchUtils;
import org.egov.tracer.model.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

@Service
public class SearchService {

	@Autowired
	private SearchApplicationRunnerImpl runner;
	
	@Autowired
	private SearchRepository searchRepository;
	
	@Autowired
	private SearchReqValidator searchReqValidator;
	
	@Autowired
	private ResponseInfoFactory responseInfoFactory;
	
	@Autowired
	private SearchUtils searchUtils;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired(required = false)
	private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

	@Autowired(required = false)
	private org.springframework.web.client.RestTemplate restTemplate;

	@Value("${kafka.topic.audit:audit_data}")
	private String auditTopic;

	@Value("${egov.enc.host:http://localhost:1234}")
	private String egovEncHost;

	@Value("${egov.enc.decrypt.endpoint:/egov-enc-service/crypto/v1/_decrypt}")
	private String egovEncDecryptPath;
	
	public static final Logger log = LoggerFactory.getLogger(SearchService.class);

	
	public Object searchData(SearchRequest searchRequest, String moduleName, String searchName) {
		searchReqValidator.validate(searchRequest, moduleName, searchName);
		Map<String, SearchDefinition> searchDefinitionMap = runner.getSearchDefinitionMap();
		Definition searchDefinition = null;
		searchDefinition = searchUtils.getSearchDefinition(searchDefinitionMap, moduleName, searchName);
		List<String> maps = new ArrayList<>();
		Object data = null;
		try{
			if(null != searchDefinition.getIsCustomerRowMapEnabled()) {
				if(!searchDefinition.getIsCustomerRowMapEnabled()) {
					maps = searchRepository.fetchData(searchRequest, searchDefinition);
					if ((searchDefinition.getDecryptionPathId()!= null)&&(searchRequest.getRequestInfo()!=null)&&(searchRequest.getRequestInfo().getUserInfo()!=null))
					{
						data = enrichedOuputData(maps, searchDefinition, searchRequest);
					}
				}
				else {
					//This is a custom logic for bill-genie, we'll need to write code seperately to support custom rowmap logic for any search.
					data =  searchRepository.fetchWithCustomMapper(searchRequest, searchDefinition);
					Map<String, Object> result = new HashMap<>();
					result.put("ResponseInfo", responseInfoFactory.createResponseInfoFromRequestInfo(searchRequest.getRequestInfo(), true));
					String outputKey = searchDefinition.getOutput().getOutJsonPath().split("\\.")[1];
					result.put(outputKey, data);
					data = result;
				}
			}else {
				maps = searchRepository.fetchData(searchRequest, searchDefinition);
				if ((searchDefinition.getDecryptionPathId()!= null)&&(searchRequest.getRequestInfo()!=null)&&(searchRequest.getRequestInfo().getUserInfo()!=null))
				{
					data = enrichedOuputData(maps, searchDefinition, searchRequest);
				}
			}
		}catch(CustomException ce){
			log.error("CustomException: ", ce);
			throw ce;
		}catch(Exception e){
			log.error("Exception: ",e);
			throw new CustomException("DB_QUERY_EXECUTION_ERROR", "There was an error encountered at the Db");
		}
		if(null == data) {
			try{
	            if (!maps.isEmpty() && maps.get(0) instanceof String) {
	                String response = maps.get(0);
	                JsonElement element = JsonParser.parseString(response);

	                if (element.isJsonObject()) {
	                    data = formatResult(maps, searchDefinition, searchRequest);
	                } else if (element.isJsonPrimitive() && element.getAsJsonPrimitive().isNumber()) {
	                    Map<String, Object> result = new HashMap<>();
	                    result.put("TotalCount", element.getAsInt());
	                    data = result;
	                } else {
	                    data = formatResult(maps, searchDefinition, searchRequest);
	                }
	            } else {
	                data = formatResult(maps, searchDefinition, searchRequest);
	            }
	        }catch(Exception e){
				log.error("Exception: ",e);
				throw new CustomException("RESULT_FORMAT_ERROR", 
						"There was an error encountered while formatting the result, Verify output config from the yaml file.");
			}	
		}
		
		return data;
	}
	
	private Object enrichedOuputData(List<String> maps, Definition searchDefinition, SearchRequest searchRequest ){
		if (maps == null || maps.isEmpty()) {
			return formatDataResult(new ArrayList<>(), searchDefinition, searchRequest);
		}

		Type type = new TypeToken<ArrayList<Map<String, Object>>>() {}.getType();
		Gson gson = new Gson();
		List<Map<String, Object>> mapData = null;
		try {
			mapData = gson.fromJson(maps.toString(), type);
		} catch (Exception e) {
			log.error("Error parsing DB response to Map list: ", e);
		}

		if (mapData == null || mapData.isEmpty()) {
			return formatDataResult(new ArrayList<>(), searchDefinition, searchRequest);
		}

		try {
			User userInfo = null;
			if (searchRequest.getRequestInfo() != null && searchRequest.getRequestInfo().getUserInfo() != null) {
				userInfo = getEncrichedandCopiedUserInfo(searchRequest.getRequestInfo().getUserInfo());
			}

			mapData = decryptData(mapData, searchDefinition.getDecryptionPathId(), userInfo);
			if (userInfo != null) {
				auditDecryptRequest(mapData, searchDefinition.getDecryptionPathId(), searchRequest.getRequestInfo().getUserInfo());
			}
			if (mapData != null) {
				for (Map<String, Object> map : mapData) {
					map.remove("uuid");
				}
			}
		} catch (Exception e) {
			log.error("Exception while decrypting data, returning raw data: ", e);
			if (mapData != null) {
				for (Map<String, Object> map : mapData) {
					map.remove("uuid");
				}
			}
		}

		return formatDataResult(mapData, searchDefinition, searchRequest);
	}

	private List<Map<String, Object>> decryptData(List<Map<String, Object>> mapData, String decryptionPathId, User userInfo) {
		if (mapData == null || mapData.isEmpty() || decryptionPathId == null || userInfo == null) {
			return mapData;
		}

		log.info("Starting decryption for decryptionPathId: {} with record count: {}", decryptionPathId, mapData.size());

		try {
			org.springframework.web.client.RestTemplate rest = this.restTemplate != null ? this.restTemplate : new org.springframework.web.client.RestTemplate();
			if (this.objectMapper != null) {
				rest.getMessageConverters().add(0, new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(this.objectMapper));
			}

			org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
			headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

			String configuredHost = (this.egovEncHost != null) ? this.egovEncHost : "http://localhost:1234";
			String[] hostsToTry = new String[] {
				configuredHost,
				"http://localhost:1234",
				"https://mseva-dev.lgpunjab.gov.in"
			};
			String decryptPath = (this.egovEncDecryptPath != null) ? this.egovEncDecryptPath : "/egov-enc-service/crypto/v1/_decrypt";

			for (Map<String, Object> record : mapData) {
				Map<String, String> cipherFields = new LinkedHashMap<>();
				for (Map.Entry<String, Object> entry : record.entrySet()) {
					if (entry.getValue() instanceof String && isCiphertext((String) entry.getValue())) {
						cipherFields.put(entry.getKey(), (String) entry.getValue());
					}
				}

				if (cipherFields.isEmpty()) {
					continue;
				}

				boolean recordDecrypted = false;
				for (String host : hostsToTry) {
					String url = host + decryptPath;
					try {
						// Try Object payload
						org.springframework.http.HttpEntity<Map<String, String>> req = new org.springframework.http.HttpEntity<>(cipherFields, headers);
						com.fasterxml.jackson.databind.JsonNode responseNode = rest.postForObject(url, req, com.fasterxml.jackson.databind.JsonNode.class);
						if (responseNode != null && responseNode.isObject()) {
							Iterator<Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = responseNode.fields();
							while (fields.hasNext()) {
								Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields.next();
								if (field.getValue().isTextual()) {
									record.put(field.getKey(), field.getValue().asText());
								} else if (!field.getValue().isNull()) {
									record.put(field.getKey(), field.getValue());
								}
							}
							recordDecrypted = true;
							break;
						}
					} catch (Exception ex) {
						// Try Array payload
						try {
							org.springframework.http.HttpEntity<List<Map<String, String>>> req = new org.springframework.http.HttpEntity<>(java.util.Collections.singletonList(cipherFields), headers);
							com.fasterxml.jackson.databind.JsonNode responseNode = rest.postForObject(url, req, com.fasterxml.jackson.databind.JsonNode.class);
							if (responseNode != null && responseNode.isArray() && responseNode.size() > 0) {
								com.fasterxml.jackson.databind.JsonNode item = responseNode.get(0);
								if (item.isObject()) {
									Iterator<Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = item.fields();
									while (fields.hasNext()) {
										Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields.next();
										if (field.getValue().isTextual()) {
											record.put(field.getKey(), field.getValue().asText());
										} else if (!field.getValue().isNull()) {
											record.put(field.getKey(), field.getValue());
										}
									}
									recordDecrypted = true;
									break;
								}
							}
						} catch (Exception ex2) {
							// Continue to next host
						}
					}
				}
				if (recordDecrypted) {
					log.info("Decrypted record successfully: file_no={}", record.get("file_no"));
				} else {
					log.warn("Failed to decrypt record: file_no={}", record.get("file_no"));
				}
			}
		} catch (Exception e) {
			log.error("Exception during direct decryption: ", e);
		}

		return mapData;
	}

	private static boolean isCiphertext(String str) {
		return str != null && str.matches("^\\d+\\|[A-Za-z0-9+/=]+$");
	}

	private void auditDecryptRequest(List<Map<String, Object>> maps, String decryptionPathId, User userInfo) {
		try {
			if (objectMapper == null || userInfo == null) {
				return;
			}
			String purpose = "Searcher";

			ObjectNode abacParams = objectMapper.createObjectNode();
			abacParams.set("key", TextNode.valueOf(decryptionPathId));

			List<String> decryptedEntityUuid = new ArrayList<>();

			for (Map<String, Object> map : maps) {
				if (map.containsKey("uuid") && map.get("uuid") != null) {
					decryptedEntityUuid.add((String) map.get("uuid"));
				}
			}

			ObjectNode auditData = objectMapper.createObjectNode();
			auditData.set("entityType", TextNode.valueOf(User.class.getName()));
			auditData.set("decryptedEntityIds", objectMapper.valueToTree(decryptedEntityUuid));

			ObjectNode auditMessage = objectMapper.createObjectNode();
			auditMessage.put("userUuid", userInfo.getUuid());
			auditMessage.put("timestamp", System.currentTimeMillis());
			auditMessage.put("purpose", purpose);
			auditMessage.set("abacParams", abacParams);
			auditMessage.set("data", auditData);

			if (kafkaTemplate != null) {
				kafkaTemplate.send(auditTopic, userInfo.getUuid(), auditMessage.toString());
			}
		} catch (Exception e) {
			log.error("Error auditing decryption: ", e);
		}
	}
	
	private Object formatDataResult(List<Map<String, Object>> data, Definition searchDefinition, SearchRequest searchRequest) {
		if (searchDefinition.getOutput() != null && searchDefinition.getOutput().getJsonFormat() != null && searchDefinition.getOutput().getOutJsonPath() != null) {
			DocumentContext documentContext = JsonPath.parse((null != searchDefinition.getOutput().getJsonFormat()) ? searchDefinition.getOutput().getJsonFormat() : "{}");
			String[] expressionArray = (searchDefinition.getOutput().getOutJsonPath()).split("[.]");
			StringBuilder expression = new StringBuilder();
			for(int i = 0; i < (expressionArray.length - 1) ; i++ ){
				expression.append(expressionArray[i]);
				if(i != expressionArray.length - 2)
					expression.append(".");
			}
			documentContext.put(expression.toString(), expressionArray[expressionArray.length - 1], data);
			
			ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(searchRequest.getRequestInfo(), true);
			if (searchDefinition.getOutput().getResponseInfoPath() != null) {
				String[] resInfoExpArray = (searchDefinition.getOutput().getResponseInfoPath()).split("[.]");
				StringBuilder resInfoExp = new StringBuilder();
				for(int i = 0; i < (resInfoExpArray.length - 1) ; i++ ){
					resInfoExp.append(resInfoExpArray[i]);
					if(i != resInfoExpArray.length - 2)
						resInfoExp.append(".");
				}
				documentContext.put(resInfoExp.toString(), resInfoExpArray[resInfoExpArray.length - 1], responseInfo);
			}
			return documentContext.jsonString();
		} else {
			Map<String, Object> result = new HashMap<>();
			result.put("ResponseInfo", responseInfoFactory.createResponseInfoFromRequestInfo(searchRequest.getRequestInfo(), true));
			String outputKey = (searchDefinition.getOutput() != null && searchDefinition.getOutput().getOutJsonPath() != null)
					? searchDefinition.getOutput().getOutJsonPath().split("\\.")[1] : "data";
			result.put(outputKey, data);
			return result;
		}
	}
	
	private String formatResult(List<String> maps, Definition searchDefinition, SearchRequest searchRequest){
	    Type type = new TypeToken<ArrayList<Map<String, Object>>>() {}.getType();
		Gson gson = new Gson();
		List<Map<String, Object>> data = gson.fromJson(maps.toString(), type);
		
    	DocumentContext documentContext = JsonPath.parse((null != searchDefinition.getOutput().getJsonFormat()) ? searchDefinition.getOutput().getJsonFormat() : "{}");
		String[] expressionArray = (searchDefinition.getOutput().getOutJsonPath()).split("[.]");
		StringBuilder expression = new StringBuilder();
		for(int i = 0; i < (expressionArray.length - 1) ; i++ ){
			expression.append(expressionArray[i]);
			if(i != expressionArray.length - 2)
				expression.append(".");
		}
		documentContext.put(expression.toString(), expressionArray[expressionArray.length - 1], data);
		
		ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(searchRequest.getRequestInfo(), true);
		String[] resInfoExpArray = (searchDefinition.getOutput().getResponseInfoPath()).split("[.]");
		StringBuilder resInfoExp = new StringBuilder();
		for(int i = 0; i < (resInfoExpArray.length - 1) ; i++ ){
			resInfoExp.append(resInfoExpArray[i]);
			if(i != resInfoExpArray.length - 2)
				resInfoExp.append(".");
		}
		documentContext.put(resInfoExp.toString(), resInfoExpArray[resInfoExpArray.length - 1], responseInfo);
		
		return documentContext.jsonString().toString();
	}

	private User getEncrichedandCopiedUserInfo(User userInfo) {
		List<Role> newRoleList = new ArrayList<>();
		if (userInfo.getRoles() != null) {
			for (Role role : userInfo.getRoles()) {
				Role newRole = Role.builder().code(role.getCode()).name(role.getName()).id(role.getId()).build();
				newRoleList.add(newRole);
			}
		}

		if (newRoleList.stream().filter(role -> (role.getCode() != null) && (userInfo.getType() != null) && role.getCode().equalsIgnoreCase(userInfo.getType())).count() == 0) {
			Role roleFromtype = Role.builder().code(userInfo.getType()).name(userInfo.getType()).build();
			newRoleList.add(roleFromtype);
		}

		User newuserInfo = User.builder().id(userInfo.getId()).userName(userInfo.getUserName()).name(userInfo.getName())
				.type(userInfo.getType()).mobileNumber(userInfo.getMobileNumber()).emailId(userInfo.getEmailId())
				.roles(newRoleList).tenantId(userInfo.getTenantId()).uuid(userInfo.getUuid()).build();
		return newuserInfo;
	}

	public Integer getUniqueCitezen(String date) {
	 	return 	searchRepository.getUniqueCitizenCount(date);
	}
}
