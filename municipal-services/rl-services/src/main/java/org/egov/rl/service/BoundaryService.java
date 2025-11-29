package org.egov.rl.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.PropertyReportSearchRequest;
import org.egov.rl.models.RLProperty;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

@Service
public class BoundaryService {

	@Value("${egov.location.host}")
	private String locationHost;

	@Value("${egov.location.context.path}")
	private String locationContextPath;

	@Value("${egov.location.endpoint}")
	private String locationEndpoint;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private RentLeaseConfiguration configs;
	
	@Autowired
	private AllotmentRepository allotmentRepository;

	@Autowired
	RestTemplate restTemplate;// = new RestTemplate();

	public JsonNode loadPropertyData(AllotmentRequest allotementRequest) {
		String propertyId = Optional.ofNullable(allotementRequest.getAllotment().getPropertyId()).orElse(null);
		String tenantId = Optional.ofNullable(allotementRequest.getAllotment().getTenantId()).orElse(null);
		JsonNode body = null;
		try {
//System.out.println("-----"+allotementRequest.getRequestInfo());
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(allotementRequest.getRequestInfo()); // from your context
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("RLProperty");
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();

			if (body.isArray()) {
				for (JsonNode node : body) {
					if (node.has("propertyId") && node.get("propertyId").asText().equals(propertyId)) {
						body = node; // return only the matched property
						break;
					}
				}
			}
			if (body.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"propertyId cannot be wrong, please provide the valid propertyId and tenentId information");
			}else {
				List<AllotmentDetails> allotmentDetails=allotmentRepository.getAllotedByPropertyIds(propertyId, tenantId);
				if(allotmentDetails.size()>0) {
				   throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"This property already alloted in this tenantId, please provide the another property information");
				}
			}
		}catch(CustomException e) {
			throw e;	
		} catch (Exception e) {
//			e.printStackTrace();
			throw new CustomException("PROPERTY LOADING ERROR", "property loading error from mdms ,please provide valid tenantId information");
//			throw e;

		}
		return body;
	}

	public List<RLProperty> loadPropertyData(PropertyReportSearchRequest propertyReportSearchRequest) {
		List<RLProperty> propertyList = null;
		JsonNode body = null;
		try {
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(propertyReportSearchRequest.getRequestInfo()); // from your context
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(propertyReportSearchRequest.getSearchProperty().getTenantId());
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("RLProperty");
			masterDetail.setFilter(propertyReportSearchRequest.getSearchProperty().getFilter());
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();
			// Navigate to the array node
			JsonNode propertyArrayNode = body.get("MdmsRes").get("rentAndLease").get("RLProperty");

			
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
//			throw e;
		}
		return propertyList;
	}

	public JsonNode getPaymentAmountDetails(MdmsCriteriaReq mdmsCriteriaReq) {
		JsonNode body = null;
		try {
			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();

			if (body.isArray()) {
				for (JsonNode node : body) {
                      double baseFee=node.get("baseRent").asDouble();
                      double securityDeposit=node.get("securityDeposit").asDouble();
                      double latePaymentPercentage=node.get("latePayment").asDouble();
                      double texPercentage=getTexAmount(mdmsCriteriaReq.getMdmsCriteria().getTenantId(),mdmsCriteriaReq.getRequestInfo());
                      double latePayment=(baseFee * (latePaymentPercentage/100)); 
                      double textAmount = (baseFee * (texPercentage/100));
                      break;
				}
			}

			if (body.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"startDate cannot be wrong, please provide the valid propertyId and tenentId information");
			}
		}catch(CustomException e) {
			throw e;	
		} catch (Exception e) {
//			throw e;
			throw new CustomException("PROPERTY LOADING ERROR", "property loading error from mdms ,please provide valid tenantId information");

		}
		return body;
	}
	
	public double getTexAmount(String tenantId,RequestInfo requestInfo) {
		JsonNode body = null;
		double amount =	0.0;
		
		try {
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(requestInfo); // from your context
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("TaxRates");
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);

			String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
			ResponseEntity<JsonNode> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, JsonNode.class);
			body = response.getBody();
			
			if (body.isArray()) {
				for (JsonNode node : body) {
					amount=amount+node.get("amount").asDouble();
				}
			}
			if (body.isEmpty()) {
				throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
						"startDate cannot be wrong, please provide the valid propertyId and tenentId information");
			}
		}catch(CustomException e) {
			throw e;	
		} catch (Exception e) {
			throw new CustomException("PROPERTY LOADING ERROR", "property loading error from mdms ,please provide valid tenantId information");

		}
		return amount;
	}


}
