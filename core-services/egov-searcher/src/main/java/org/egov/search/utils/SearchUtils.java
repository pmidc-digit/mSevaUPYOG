package org.egov.search.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.egov.search.model.Definition;
import org.egov.search.model.Pagination;
import org.egov.search.model.Params;
import org.egov.search.model.Query;
import org.egov.search.model.SearchDefinition;
import org.egov.search.model.SearchParams;
import org.egov.search.model.SearchRequest;
import org.egov.tracer.model.CustomException;
import org.json.JSONArray;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import org.egov.search.model.ExternalService;
import org.springframework.web.client.RestTemplate;
import com.google.gson.Gson;
import java.net.URI;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SearchUtils {

	@Value("${pagination.default.page.size}")
	private String defaultPageSize;

	@Value("${pagination.default.offset}")
	private String defaultOffset;
	
	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private RestTemplate restTemplate;

	@Value("${state.level.tenant.id:pb}")
	private String stateLevelTenantId;

	@Value("${egov.mdms.host:}")
	private String mdmsHost;
	
	@Value("${operaters.list}")
	private List<String> operators;
	
	/**
	 * Builds the query reqd for search
	 * 
	 * @param searchRequest
	 * @param searchParam
	 * @param query
	 * @param preparedStatementValues
	 * @return
	 */
	public String buildQuery(SearchRequest searchRequest, SearchParams searchParam, Query query, Map<String, Object> preparedStatementValues) {
		return buildQuery(searchRequest, searchParam, query, null, preparedStatementValues);
	}

	public String buildQuery(SearchRequest searchRequest, SearchParams searchParam, Query query, Definition definition, Map<String, Object> preparedStatementValues) {
		StringBuilder queryString = new StringBuilder();
		StringBuilder where = new StringBuilder();
		String finalQuery = null;
		String baseQuery = query.getBaseQuery();
		if (definition != null && !CollectionUtils.isEmpty(definition.getExternalService())) {
			baseQuery = populateExternalServiceValues(definition, baseQuery, searchRequest);
		}
		queryString.append(baseQuery);
		if(!CollectionUtils.isEmpty(searchParam.getParams())) {
			Object criteriaObj = searchRequest.getSearchCriteria();
			String whereClause;
			if (criteriaObj instanceof Map) {
			    Map<String, Object> criteriaMap = (Map<String, Object>) criteriaObj;
			    Object url = criteriaMap.get("url");
			    if (url != null && url.toString().contains("inboxswachsearchall")) {
			        whereClause = buildWhereClauseForSwachSearchAll(searchRequest, searchParam, preparedStatementValues); // custom logic
			    } else {
			        whereClause = buildWhereClause(searchRequest, searchParam, preparedStatementValues); // default logic
			    }
			} else {
			    whereClause = buildWhereClause(searchRequest, searchParam, preparedStatementValues); // fallback
			}
			String paginationClause = getPaginationClause(searchRequest, searchParam.getPagination());
			where.append(" WHERE ").append(whereClause + " ");
			if (null != query.getGroupBy()) {
				queryString.append(" GROUP BY ").append(query.getGroupBy() + " ");
			}
			if (null != query.getOrderBy()) {
				where.append(" ORDER BY ").append(query.getOrderBy().split(",")[0]).append(" ").append(query.getOrderBy().split(",")[1]);
			}
			if (null != query.getSort()) {
				queryString.append(" " + query.getSort());
			}
			finalQuery = queryString.toString().replace("$where", where.toString());
			finalQuery = finalQuery.replace("$pagination", paginationClause);
		}else {
			finalQuery = queryString.toString();
		}
		
		return finalQuery;
	}
	
	/**
	 * Builds the where clause based on configs and request
	 * 
	 * @param searchRequest
	 * @param searchParam
	 * @param preparedStatementValues
	 * @return
	 */
	
	public String buildWhereClauseForSwachSearchAll(SearchRequest searchRequest, SearchParams searchParam,  Map<String, Object> preparedStatementValues) {
	    StringBuilder whereClause = new StringBuilder();
	    String condition = searchParam.getCondition();
	    Pattern p = Pattern.compile("->>");
	    try {
	        String request = mapper.writeValueAsString(searchRequest);
	        List<Params> paramsList = searchParam.getParams();

	        for (int i = 0; i < paramsList.size(); i++) {
	            Params param = paramsList.get(i);
	            Object paramValue = null;

	            try {
	                if (null != param.getIsConstant()) {
	                    if (param.getIsConstant())
	                        paramValue = param.getValue();
	                    else
	                        paramValue = JsonPath.read(request, param.getJsonPath());
	                } else
	                    paramValue = JsonPath.read(request, param.getJsonPath());
	            } catch (Exception e) {
	                log.error("Error while building where clause: " + e.getMessage());
	                continue;
	            }

	            // custom tenantid handling starts
	            if ("ser.tenantid".equals(param.getName())) {
	                if (i > 0) whereClause.append(" " + condition + " ");

	                String namedParam = param.getName();
	                List<String> tenantIds = new ArrayList<>();

	                if (paramValue instanceof Collection && !((Collection<?>) paramValue).isEmpty()) {
	                    for (Object val : (Collection<?>) paramValue) {
	                        tenantIds.add(val.toString());
	                    }
	                    whereClause.append("ser.tenantid IN (:").append(namedParam).append(")");
	                    preparedStatementValues.put(namedParam, tenantIds);
	                } else if (paramValue != null) {
	                	if("pb.punjab".equals(paramValue.toString()) ||"pb".equals(paramValue.toString()) || paramValue.toString().trim().isEmpty()) {
	                		whereClause.append("ser.tenantid LIKE :").append(namedParam);
	                		preparedStatementValues.put(namedParam, "%pb%");
	                	}
	                	else {
	                		tenantIds.add(paramValue.toString());
		                    whereClause.append("ser.tenantid IN (:").append(namedParam).append(")");
		                    preparedStatementValues.put(namedParam, tenantIds);
	                	}
	                } else {
	                    whereClause.append("ser.tenantid LIKE :").append(namedParam);
	                    preparedStatementValues.put(namedParam, "%pb%");
	                }
	                continue;
	            }
	            // custom tenantid handling ends

	            if (paramValue == null) continue;

	            if (whereClause.length() > 0) {
	                whereClause.append(" " + condition + " ");
	            }

	            Matcher matcher = p.matcher(param.getName());
	            String namedParam = param.getName();
	            if (matcher.find())
	                namedParam = removeJSONOperatorsForNamedParam(namedParam);
	            namedParam = namedParam.replaceAll("[^a-zA-Z0-9_]", "_") + "_" + i;

	            String operator = null;
	            if (paramValue instanceof net.minidev.json.JSONArray) {
	                String[] validListOperators = {"NOT IN", "IN"};
	                operator = (!StringUtils.isEmpty(param.getOperator())) ? " " + param.getOperator() + " " : " IN ";
	                if (!Arrays.asList(validListOperators).contains(operator))
	                    operator = " IN ";

	                whereClause.append(param.getName()).append(operator).append("(").append(":").append(namedParam).append(")");
	            } else {
	                List<String> validOperators = operators;
	                operator = (!StringUtils.isEmpty(param.getOperator())) ? param.getOperator() : "=";

	                if (!validOperators.contains(operator)) {
	                    operator = "=";
	                }

	                if (operator.equals("GE")) {
	                    operator = ">=";
	                } else if (operator.equals("LE")) {
	                    operator = "<=";
	                } else if (operator.equals("NE")) {
	                    operator = "!=";
	                } else if (operator.equals("LIKE") || operator.equals("ILIKE")) {
	                    paramValue = "%" + paramValue + "%";
	                } else if (operator.equals("TOUPPERCASE")) {
	                    operator = "=";
	                    paramValue = ((String) paramValue).toUpperCase();
	                } else if (operator.equals("TOLOWERCASE")) {
	                    operator = "=";
	                    paramValue = ((String) paramValue).toLowerCase();
	                }

	                whereClause.append(param.getName()).append(" ").append(operator).append(" :").append(namedParam);
	            }

	            preparedStatementValues.put(namedParam, paramValue);
	        }
	    } catch (Exception e) {
	        log.error("Exception while bulding query: ", e);
	        throw new CustomException("QUERY_BUILD_ERROR", "Exception while bulding query");
	    }
	    return whereClause.toString();
	}

	
	public String buildWhereClause(SearchRequest searchRequest, SearchParams searchParam,  Map<String, Object> preparedStatementValues) {
		StringBuilder whereClause = new StringBuilder();
		String condition = searchParam.getCondition();
		Pattern p = Pattern.compile("->>");
		try {
			
			String request = mapper.writeValueAsString(searchRequest);
			List<Params> paramsList = searchParam.getParams();
			
			for (int i =0; i < paramsList.size(); i++) {
				
				Params param = paramsList.get(i);
				Object paramValue = null;
			
				try {
					if (null != param.getIsConstant()) {
						if (param.getIsConstant())
							paramValue = param.getValue();
						else
							paramValue = JsonPath.read(request, param.getJsonPath());
					} else
						paramValue = JsonPath.read(request, param.getJsonPath());

					if (null == paramValue)
						continue;

				} catch (Exception e) {
					log.debug("Optional param not found in request: " + e.getMessage());
					continue;
				}
				
				/**
				 * Add and clause if necessary
				 */
				if (whereClause.length() > 0) {
					whereClause.append(" " + condition + " ");
				}
				Matcher matcher = p.matcher(param.getName());
				String namedParam = param.getName();
				if(matcher.find())
					namedParam = removeJSONOperatorsForNamedParam(namedParam);
				namedParam = namedParam.replaceAll("[^a-zA-Z0-9_]", "_") + "_" + i;

				/**
				 * Array operators
				 */  
				String operator=null;
				if (paramValue instanceof net.minidev.json.JSONArray) {
					String[] validListOperators = {"NOT IN", "IN"};
					operator = (!StringUtils.isEmpty(param.getOperator())) ? " " + param.getOperator() + " " : " IN ";
					if(!Arrays.asList(validListOperators).contains(operator))
						operator = " IN "; 
					
					whereClause.append(param.getName()).append(operator).append("(").append(":"+namedParam).append(")");
				} 
				/**
				 * single operators
				 */
				else {
					List<String> validOperators = operators;
					operator = (!StringUtils.isEmpty(param.getOperator())) ? param.getOperator() : "=";

					if (!validOperators.contains(operator)) {
						operator = "=";
					}
					
					if (operator.equals("GE")) {
						operator = ">=";
					} else if (operator.equals("LE")) {
						operator = "<=";
					} else if (operator.equals("NE")) {
						operator = "!=";
					} else if (operator.equals("LIKE") || operator.equals("ILIKE")) {
						paramValue=	 "%" + paramValue + "%";
					} else if (operator.equals("TOUPPERCASE")) {
						operator =  "=";
						paramValue = ((String) paramValue).toUpperCase();
					} else if (operator.equals("TOLOWERCASE")) {
						operator =  "=";
						paramValue = ((String) paramValue).toLowerCase();
					}
					
					if (param.getName().toLowerCase().endsWith("tenantid") && ("pb.punjab".equalsIgnoreCase(paramValue.toString()) || "pb".equalsIgnoreCase(paramValue.toString())) && "=".equals(operator)) {
						whereClause.append(param.getName()).append(" LIKE :").append(namedParam);
						paramValue = "%pb%";
					} else {
						whereClause.append(param.getName()).append(" " + operator + " ").append(":" + namedParam);
					}
				}

				preparedStatementValues.put(namedParam, paramValue);
			}
		} catch (Exception e) {
			log.error("Exception while bulding query: ", e);
			throw new CustomException("QUERY_BUILD_ERROR", "Exception while bulding query");
		}
		return whereClause.toString();
	}

	
	/**
	 * Pagination clause builder
	 * 
	 * @param searchRequest
	 * @param pagination
	 * @return
	 */
	public String getPaginationClause(SearchRequest searchRequest, Pagination pagination) {
		StringBuilder paginationClause = new StringBuilder();
		Object limit = null;
		Object offset = null;
		if (null != pagination) {
			try {
				limit = JsonPath.read(mapper.writeValueAsString(searchRequest), pagination.getNoOfRecords());
				offset = JsonPath.read(mapper.writeValueAsString(searchRequest), pagination.getOffset());
			} catch (Exception e) {
				log.error("Error while fetching limit and offset, using default values.");
			}
		}
		paginationClause.append(" LIMIT ")
				.append((!StringUtils.isEmpty((null != limit) ? limit.toString() : null) ? limit.toString()
						: defaultPageSize))
				.append(" OFFSET ")
				.append((!StringUtils.isEmpty((null != offset) ? offset.toString() : null) ? offset.toString()
						: defaultOffset));

		return paginationClause.toString();
	}

	/**
	 * Fetches Search Definitions, defined in the configuration.
	 * 
	 * @param searchDefinitionMap
	 * @param moduleName
	 * @param searchName
	 * @return
	 */
	public Definition getSearchDefinition(Map<String, SearchDefinition> searchDefinitionMap, String moduleName,
			String searchName) {
		log.debug("Fetching Definitions for module: " + moduleName + " and search feature: " + searchName);
		List<Definition> definitions = null;
		try {
			definitions = searchDefinitionMap.get(moduleName).getDefinitions().stream()
					.filter(def -> (def.getName().equals(searchName))).collect(Collectors.toList());
		} catch (Exception e) {
			throw new CustomException("NO_SEARCH_DEFINITION_EXCEPTION", "There's no Search Definition provided for this search feature");
		}
		if (CollectionUtils.isEmpty(definitions)) {
			throw new CustomException("NO_SEARCH_DEFINITION_FOUND","There's no Search Definition provided for this search feature");
		}
		return definitions.get(0);

	}

	/**
	 * Formatter util for PG objects.
	 * 
	 * @param maps
	 * @return
	 */
	public List<String> convertPGOBjects(List<PGobject> maps){
		List<String> result = new ArrayList<>();
		if(null != maps || !maps.isEmpty()) {
			for(PGobject obj: maps){
				if(null == obj.getValue())
					break;
				String tuple = obj.toString();
				if(tuple.startsWith("[") && tuple.endsWith("]")){
					try {
						JSONArray jsonArray = new JSONArray(tuple);
						for(int i = 0; i < jsonArray.length();  i++){
							result.add(jsonArray.get(i).toString());
						}
					}catch(Exception e) {
						log.error("Error while building json array!", e);
					}
				}else{
					try{
						result.add(obj.getValue());
					}catch(Exception e){
						log.error("Errow while adding object value to result: " + e.getMessage());
						throw e;
					}
				}
			}
		}
		
		return result;
	}

    private String removeJSONOperatorsForNamedParam(String namedParam) {
        
        /*
         * In the param, if contain the json operators then removing those special characters from param setting as param name
         * for named param. ex, if param name is like bpa.additionadetails->>'applicationtype' then removing the single
         * quote(') and json operator (->>) and setting named param name as bpa.additionadetailsapplicationtype.
         */
        String namedParamTemp = namedParam.replace("'", "");
        StringBuilder namedParamRes = new StringBuilder();
        Pattern pattern = Pattern.compile("->>");
        Matcher m = pattern.matcher(namedParamTemp);
        int lastIndex = 0;
        if (m.find()) {
            namedParamRes.append(namedParamTemp, lastIndex, m.start());
            lastIndex = m.end();
        }

        if (lastIndex < namedParamTemp.length())
            namedParamRes.append(namedParamTemp, lastIndex, namedParamTemp.length());
        return namedParamRes.toString();
    }

	public String populateExternalServiceValues(Definition definition, String baseQuery, SearchRequest searchRequest) {
		String replacetableQuery = baseQuery;
		if (definition.getExternalService() == null || definition.getExternalService().isEmpty()) {
			return replacetableQuery;
		}

		String tenantId = extractTenantId(searchRequest);
		String authToken = (searchRequest.getRequestInfo() != null) ? searchRequest.getRequestInfo().getAuthToken() : null;

		for (ExternalService es : definition.getExternalService()) {
			String requestInfoJson = "";
			String finalJson = "";

			if (es.getPostObject() != null) {
				String jsonObjecttest = es.getPostObject();
				Map<String, Object> map = new HashMap<>();
				map.put("RequestInfo", getRInfo(authToken));
				try {
					Gson gson = new Gson();
					requestInfoJson = gson.toJson(map);
				} catch (Exception e1) {
					log.error("Exception while converting gson to JSON: " + e1.getMessage());
				}
				requestInfoJson = StringUtils.chop(requestInfoJson);
				finalJson = jsonObjecttest.replaceAll("\\$RequestInfo", Matcher.quoteReplacement(requestInfoJson));
				finalJson = finalJson.concat("}");
			}

			String url;
			try {
				url = es.getApiURL();
			} catch (Exception ex) {
				throw new CustomException("YAML_CONFIG_ERROR", ex.getMessage());
			}

			if (StringUtils.isNotEmpty(mdmsHost)) {
				if (url.contains("egov-mdms-service")) {
					url = url.replaceFirst("https?://[^/]+", mdmsHost);
				} else if (url.startsWith("/")) {
					url = mdmsHost + url;
				}
			}

			if (es.getStateData() && (!"default".equals(tenantId))) {
				String stateid = (tenantId != null && tenantId.contains(".")) ? tenantId.split("\\.")[0] : (tenantId != null ? tenantId : stateLevelTenantId);
				url = url.replaceAll("\\$tenantid", stateid);
				if (StringUtils.isNotEmpty(finalJson)) {
					finalJson = finalJson.replaceAll("\\$tenantid", stateid);
				}
			} else {
				String currentTenant = (tenantId != null) ? tenantId : stateLevelTenantId;
				url = url.replaceAll("\\$tenantId", currentTenant);
				url = url.replaceAll("\\$tenantid", currentTenant);
				if (StringUtils.isNotEmpty(finalJson)) {
					finalJson = finalJson.replaceAll("\\$tenantid", currentTenant);
				}
			}

			URI uri = URI.create(url);
			log.info("MDMS URI: " + uri);
			MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
			headers.add("Content-Type", "application/json");

			Object requestPayload = finalJson;
			if (StringUtils.isNotEmpty(finalJson)) {
				try {
					ObjectMapper jsonMapper = (this.mapper != null) ? this.mapper : new ObjectMapper();
					requestPayload = jsonMapper.readTree(finalJson);
				} catch (Exception e) {
					log.error("Exception while parsing finalJson to JsonNode: ", e);
					requestPayload = finalJson;
				}
			}

			HttpEntity<?> request = new HttpEntity<>(requestPayload, headers);

			String res = "";
			try {
				if (es.getPostObject() != null) {
					res = restTemplate.postForObject(uri, request, String.class);
				} else {
					res = restTemplate.postForObject(uri, getRInfo(authToken), String.class);
				}
				log.info("MDMS Response received, length: " + (res != null ? res.length() : 0));
			} catch (Exception e) {
				log.error("Exception while fetching data from external service/MDMS: ", e);
			}

			String finalTupleString = null;
			try {
				if (StringUtils.isNotEmpty(res)) {
					Object jsonObject = JsonPath.read(res, es.getEntity());
					JSONArray mdmsArray = new JSONArray(jsonObject.toString());
					StringBuilder finalString = new StringBuilder();

					for (int i = 0; i < mdmsArray.length(); i++) {
						JSONObject obj = mdmsArray.getJSONObject(i);
						StringBuilder sb = new StringBuilder();
						sb.append("(");
						String[] jsonKeys = es.getKeyOrder().split(",");

						for (int k = 0; k < jsonKeys.length; k++) {
							String key = jsonKeys[k].trim();
							String value = "";
							if (obj.has(key)) {
								value = String.valueOf(obj.get(key));
							}
							if (value.contains("'")) {
								String formatted = value.replace("'", "''");
								sb.append("'").append(formatted).append("'");
							} else {
								sb.append("'").append(value).append("'");
							}
							if (k != jsonKeys.length - 1) {
								sb.append(",");
							}
						}
						sb.append(")");
						if (i != mdmsArray.length() - 1) {
							sb.append(",");
						}
						finalString.append(sb);
					}

					if (mdmsArray.length() > 0) {
						finalTupleString = finalString.toString();
					}
				}
			} catch (Exception e) {
				log.error("Exception while processing MDMS response for table " + es.getTableName(), e);
			}

			if (finalTupleString == null) {
				StringBuilder sb = new StringBuilder();
				sb.append("(");
				String[] keys = es.getKeyOrder().split(",");
				for (int i = 0; i < keys.length; i++) {
					if (i != keys.length - 1) {
						sb.append("'',");
					} else {
						sb.append("''");
					}
				}
				sb.append(")");
				finalTupleString = sb.toString();
			}

			if (es.getTableName() != null) {
				replacetableQuery = replacetableQuery.replace(es.getTableName(), finalTupleString);
			}
		}
		return replacetableQuery;
	}

	private String extractTenantId(SearchRequest searchRequest) {
		if (searchRequest == null) return stateLevelTenantId;
		if (searchRequest.getSearchCriteria() instanceof Map) {
			Map<?, ?> criteriaMap = (Map<?, ?>) searchRequest.getSearchCriteria();
			if (criteriaMap.get("tenantId") != null) {
				return criteriaMap.get("tenantId").toString();
			}
			if (criteriaMap.get("tenantid") != null) {
				return criteriaMap.get("tenantid").toString();
			}
			if (criteriaMap.get("ulb") != null) {
				return criteriaMap.get("ulb").toString();
			}
		}
		if (searchRequest.getRequestInfo() != null && searchRequest.getRequestInfo().getUserInfo() != null) {
			if (searchRequest.getRequestInfo().getUserInfo().getTenantId() != null) {
				return searchRequest.getRequestInfo().getUserInfo().getTenantId();
			}
		}
		return stateLevelTenantId;
	}

	public org.egov.common.contract.request.RequestInfo getRInfo(String authToken) {
		org.egov.common.contract.request.RequestInfo ri = new org.egov.common.contract.request.RequestInfo();
		ri.setAction("action");
		ri.setAuthToken(authToken);
		ri.setApiId("apiId");
		ri.setVer("version");
		ri.setDid("did");
		ri.setKey("key");
		ri.setMsgId("msgId");
		return ri;
	}

}
