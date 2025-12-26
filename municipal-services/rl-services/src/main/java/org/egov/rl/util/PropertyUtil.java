package org.egov.rl.util;

import static org.egov.rl.util.RLConstants.ASMT_MODULENAME;
import static org.egov.rl.util.RLConstants.BILL_AMOUNT_PATH;
import static org.egov.rl.util.RLConstants.BILL_NO_DEMAND_ERROR_CODE;
import static org.egov.rl.util.RLConstants.BILL_NO_PAYABLE_DEMAND_ERROR_CODE;
import static org.egov.rl.util.RLConstants.RL_MASTER_MODULE_NAME;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import net.minidev.json.JSONArray;


import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.MdmsResponse;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AdditionalFeeRate;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.ProcessInstance;
import org.egov.rl.models.RLProperty;
import org.egov.rl.models.TaxRate;
import org.egov.rl.models.collection.GetBillCriteria;
import org.egov.rl.models.enums.CreationReason;
import org.egov.rl.models.workflow.ProcessInstanceRequest;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.service.BoundaryService;
import org.egov.rl.web.contracts.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PropertyUtil extends CommonUtils {

	
		@Autowired
		private ServiceRequestRepository restRepo;

		@Autowired
		private ObjectMapper mapper;

		@Autowired
		private RentLeaseConfiguration config;
		
		@Autowired
		BoundaryService boundaryService;


		public List<RLProperty> getCalculateAmount(String propertyId,RequestInfo requestInfo, String tenantId, String moduleName) {

			List<RLProperty> calculateAmount = new ArrayList<RLProperty>();
			StringBuilder uri = new StringBuilder();
			uri.append(config.getMdmsHost()).append(config.getMdmsEndpoint());

			MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestCalculationType(requestInfo, tenantId, moduleName,propertyId);

			Object o = restRepo.fetchResult(uri, mdmsCriteriaReq).get();
		
			MdmsResponse mdmsResponse = mapper.convertValue(o , MdmsResponse.class);
			if (mdmsResponse.getMdmsRes().get(RL_MASTER_MODULE_NAME) == null) {
				throw new CustomException("FEE_NOT_AVAILABLE", "Property rent/lease fee is not available.");
			}
			JSONArray jsonArray = mdmsResponse.getMdmsRes().get(RLConstants.RL_MASTER_MODULE_NAME).get("RLProperty");

			try {
				calculateAmount = mapper.readValue(jsonArray.toJSONString(),
						mapper.getTypeFactory().constructCollectionType(List.class, RLProperty.class));
			} catch (JsonProcessingException e) {
				log.info("Exception occured while converting amount for allotment " + e);
			}

			return calculateAmount;

		}

		public List<TaxRate> getHeadTaxAmount(RequestInfo requestInfo, String tenantId, String moduleName) {

			List<TaxRate> calculateAmount = new ArrayList<TaxRate>();
			StringBuilder uri = new StringBuilder();
			uri.append(config.getMdmsHost()).append(config.getMdmsEndpoint());

			MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestTaxHead(requestInfo, tenantId, moduleName);

			Object o = restRepo.fetchResult(uri, mdmsCriteriaReq).get();
		
			MdmsResponse mdmsResponse = mapper.convertValue(o , MdmsResponse.class);
			if (mdmsResponse.getMdmsRes().get(RL_MASTER_MODULE_NAME) == null) {
				throw new CustomException("FEE_NOT_AVAILABLE", "Property tax fee is not available.");
			}
			JSONArray jsonArray = mdmsResponse.getMdmsRes().get(RLConstants.RL_MASTER_MODULE_NAME).get("TaxRates");

			try {
				calculateAmount = mapper.readValue(jsonArray.toJSONString(),
						mapper.getTypeFactory().constructCollectionType(List.class, TaxRate.class));
			} catch (JsonProcessingException e) {
				log.info("Exception occured while converting amount for allotment: " + e);
			}

			return calculateAmount;

		}

		
		/**
		 * Fetches ServiceCharge configuration from MDMS
		 */
		public List<AdditionalFeeRate> getServiceChargeConfig(RequestInfo requestInfo, String tenantId, String moduleName) {
			return getAdditionalFeeConfig(requestInfo, tenantId, moduleName, "ServiceCharge");
		}

		/**
		 * Fetches PenaltyFee configuration from MDMS
		 */
		public List<AdditionalFeeRate> getPenaltyFeeConfig(RequestInfo requestInfo, String tenantId, String moduleName) {
			return getAdditionalFeeConfig(requestInfo, tenantId, moduleName, "PenaltyFee");
		}

		/**
		 * Fetches InterestAmount configuration from MDMS
		 */
		public List<AdditionalFeeRate> getInterestAmountConfig(RequestInfo requestInfo, String tenantId, String moduleName) {
			return getAdditionalFeeConfig(requestInfo, tenantId, moduleName, "InterestAmount");
		}

		/**
		 * Generic method to fetch any fee configuration from MDMS
		 * This method provides flexibility for future fee types
		 */
		public List<AdditionalFeeRate> getFeeConfig(RequestInfo requestInfo, String tenantId, String moduleName, String feeType) {
			return getAdditionalFeeConfig(requestInfo, tenantId, moduleName, feeType);
		}

		/**
		 * Generic method to fetch additional fee configurations from MDMS
		 * Flexible method that handles various MDMS configurations and formats
		 */
		private List<AdditionalFeeRate> getAdditionalFeeConfig(RequestInfo requestInfo, String tenantId, String moduleName, String configType) {
			List<AdditionalFeeRate> feeConfigs = new ArrayList<>();
			StringBuilder uri = new StringBuilder();
			uri.append(config.getMdmsHost()).append(config.getMdmsEndpoint());

			MdmsCriteriaReq mdmsCriteriaReq = getMdmsRequestForAdditionalFees(requestInfo, tenantId, moduleName, configType);
			
			boundaryService.getPaymentAmountDetails(mdmsCriteriaReq);
			
			return feeConfigs;
		}

		/**
		 * Processes and validates fee configurations
		 */
		private List<AdditionalFeeRate> processFeeConfigurations(List<AdditionalFeeRate> feeConfigs, String configType) {
			List<AdditionalFeeRate> processedConfigs = new ArrayList<>();
			
			for (AdditionalFeeRate feeConfig : feeConfigs) {
				// Set feeType if not present
				if (feeConfig.getFeeType() == null || feeConfig.getFeeType().trim().isEmpty()) {
					feeConfig.setFeeType(configType);
				}
				
				// Handle active field - flexible conversion
				if (feeConfig.getActive() == null) {
					feeConfig.setActive("true"); // Default to active
				} else {
					// Convert boolean to string if needed
					String activeValue = feeConfig.getActive().toString().toLowerCase();
					if ("true".equals(activeValue) || "1".equals(activeValue) || "yes".equals(activeValue)) {
						feeConfig.setActive("true");
					} else {
						feeConfig.setActive("false");
					}
				}
				
				// Validate configuration
				if (isValidFeeConfiguration(feeConfig)) {
					processedConfigs.add(feeConfig);
				} else {
					log.warn("Invalid fee configuration skipped: {}", feeConfig);
				}
			}
			
			return processedConfigs;
		}

		/**
		 * Validates fee configuration
		 */
		private boolean isValidFeeConfiguration(AdditionalFeeRate feeConfig) {
			// Must have at least one amount calculation method
			boolean hasAmount = feeConfig.getFlatAmount() != null && feeConfig.getFlatAmount().compareTo(BigDecimal.ZERO) > 0;
			boolean hasRate = feeConfig.getRate() != null && feeConfig.getRate().compareTo(BigDecimal.ZERO) > 0;
			boolean hasAmountField = feeConfig.getAmount() != null && feeConfig.getAmount().compareTo(BigDecimal.ZERO) > 0;
			
			if (!hasAmount && !hasRate && !hasAmountField) {
				log.warn("Fee configuration has no valid amount calculation method: {}", feeConfig);
				return false;
			}
			
			// Validate rate if present
			if (feeConfig.getRate() != null && feeConfig.getRate().compareTo(new BigDecimal("100")) > 0) {
				// Rate seems unusually high, but continue processing
			}
			
			return true;
		}

		/**
		 * Creates MDMS request for additional fee configurations
		 */
		private MdmsCriteriaReq getMdmsRequestForAdditionalFees(RequestInfo requestInfo, String tenantId, String moduleName, String configType) {
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName(configType);
			List<MasterDetail> masterDetailList = new ArrayList<>();
			masterDetailList.add(masterDetail);

			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setMasterDetails(masterDetailList);
			moduleDetail.setModuleName(moduleName);
			List<ModuleDetail> moduleDetailList = new ArrayList<>();
			moduleDetailList.add(moduleDetail);

			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			mdmsCriteria.setModuleDetails(moduleDetailList);

			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);
			mdmsCriteriaReq.setRequestInfo(requestInfo);

			return mdmsCriteriaReq;
		}

		private MdmsCriteriaReq getMdmsRequestCalculationType(RequestInfo requestInfo, String tenantId, String moduleName,String propertyId) {
			
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(requestInfo); // from your context
			
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("RLProperty");
			masterDetail.setFilter("$.[?(@.propertyId == '"+propertyId+"')]");
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);			
			return mdmsCriteriaReq;
			
		}
		
       private MdmsCriteriaReq getMdmsRequestTaxHead(RequestInfo requestInfo, String tenantId, String moduleName) {
			
			MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
			mdmsCriteriaReq.setRequestInfo(requestInfo); // from your context
			
			MdmsCriteria mdmsCriteria = new MdmsCriteria();
			mdmsCriteria.setTenantId(tenantId);
			
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName("rentAndLease");
			MasterDetail masterDetail = new MasterDetail();
			masterDetail.setName("TaxRates");
//			masterDetail.setFilter("$.[?(@.propertyId == '"+propertyId+"')]");
			moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
			mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
			mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);			
			return mdmsCriteriaReq;
			
		}

	}
