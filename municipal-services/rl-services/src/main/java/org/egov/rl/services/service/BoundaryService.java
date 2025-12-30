package org.egov.rl.services.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.models.PropertyReportSearchRequest;
import org.egov.rl.services.models.RLProperty;
import org.egov.rl.services.util.RLConstants;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BoundaryService {

	@Value("${egov.location.host}")
	private String locationHost;

	@Value("${egov.location.context.path}")
	private String locationContextPath;

	@Value("${egov.location.endpoint}")
	private String locationEndpoint;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private RentLeaseConfiguration configs;

	@Autowired
	RestTemplate restTemplate;


	public List<RLProperty> loadPropertyData(PropertyReportSearchRequest propertyReportSearchRequest) {
		List<RLProperty> propertyList = null;
		JsonNode body = null;
		try {
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(propertyReportSearchRequest.getRequestInfo()); // from your context
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(propertyReportSearchRequest.getSearchProperty().getTenantId());
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName(RLConstants.RL_MASTER_MODULE_NAME);
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName(RLConstants.RL_PROPERTY_NAME);
			masterDetail.setFilter(propertyReportSearchRequest.getSearchProperty().getFilter());
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();
			JsonNode propertyArrayNode = body.get("MdmsRes").get(RLConstants.RL_MASTER_MODULE_NAME).get(RLConstants.RL_PROPERTY_NAME);
			
			propertyList = mapper.convertValue(propertyArrayNode, new TypeReference<List<RLProperty>>() {
			});

			if (body.isArray()) {
				throw new CustomException("MDMS CONFIG FILE INFO ERROR",
						"MDMS config file wrong formate, please provide the valid property file information in mdms");
			}
			if (body.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"startDate cannot be wrong, please provide the valid propertyId and tenentId information");
			}
		}catch(CustomException e) {
			throw e;	
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("PROPERTY LOADING ERROR", "property loading error from mdms ,please provide valid tenantId information");
		}
		return propertyList;
	}

	
	
	public List<RLProperty> allPropertyList(AllotmentRequest allotementRequest) {
		String propertyId = Optional.ofNullable(allotementRequest.getAllotment().get(0).getPropertyId()).orElse(null);
		String tenantId = Optional.ofNullable(allotementRequest.getAllotment().get(0).getTenantId()).orElse(null);
		JsonNode body = null;
		List<RLProperty> propertyList =null;
		try {
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(allotementRequest.getRequestInfo()); 
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName(RLConstants.RL_MASTER_MODULE_NAME);
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName(RLConstants.RL_PROPERTY_NAME);
			if(propertyId!=null) {
			  masterDetail.setFilter("$.[?(@.propertyId=='"+propertyId+"')]");
			}
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();
			JsonNode propertyArrayNode = body.get("MdmsRes").get(RLConstants.RL_MASTER_MODULE_NAME).get(RLConstants.RL_PROPERTY_NAME);
			if (propertyArrayNode.isArray()) {
				propertyList = mapper.convertValue(propertyArrayNode, new TypeReference<List<RLProperty>>() {
					
			});
			}
			if (body.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"propertyId cannot be wrong, please provide the valid propertyId and tenentId information");
			}
		}catch(CustomException e) {
			throw e;	
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("PROPERTY LOADING ERROR", "property loading error from mdms ,please provide valid tenantId information");
		}
		return propertyList;
	}
	
	public void validateAndLoadPropertyData(AllotmentRequest allotementRequest, Map<String, String> errorMap) {
		try {
			String propertyId = Optional.ofNullable(allotementRequest.getAllotment().get(0).getPropertyId()).orElse(null);
			String tenantId = Optional.ofNullable(allotementRequest.getAllotment().get(0).getTenantId()).orElse(null);

			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(allotementRequest.getRequestInfo()); // from your context
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("RLProperty");
			masterDetail.setFilter("$.[?(@.propertyId=='" + propertyId + "')]");
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<Map> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, Map.class);
			Map<String, Object> body = response.getBody();

			Map<String, Object> mdms = (Map<String, Object>) body.get("MdmsRes");
			Map<String, Object> rentLease = (Map<String, Object>) mdms.get("rentAndLease");
			List<Map<String, Object>> rlProps = (List<Map<String, Object>>) rentLease.get("RLProperty");
			if (rlProps.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"propertyId and tenantId cannot be wrong, please provide the valid propertyId and tenentId information");
			} else {
				JsonNode node = mapper.valueToTree(rlProps);
				allotementRequest.getAllotment().get(0).setAdditionalDetails(node);
			}
			if (!errorMap.isEmpty())
				throw new CustomException(errorMap);
		} catch (Exception e) {
			throw new CustomException("TENANT ID INFO ERROR",
					"TENANT ID is wrong, please provide the valid tenentId information");

		}
	}

}
