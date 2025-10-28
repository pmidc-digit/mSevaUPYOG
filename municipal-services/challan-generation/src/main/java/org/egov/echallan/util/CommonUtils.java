package org.egov.echallan.util;


import org.egov.common.contract.request.RequestInfo;
import org.egov.echallan.config.ChallanConfiguration;
import org.egov.echallan.model.AuditDetails;
import org.egov.echallan.model.ChallanRequest;
import org.egov.echallan.repository.ServiceRequestRepository;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import com.jayway.jsonpath.JsonPath;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Getter
@Slf4j
public class CommonUtils {

	
	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private ChallanConfiguration configs;

    @Autowired
	private ServiceRequestRepository serviceRequestRepository;

    private ChallanConstants constants;
	

  
    /**
     * Method to return auditDetails for create/update flows
     *
     * @param by
     * @param isCreate
     * @return AuditDetails
     */
    public AuditDetails getAuditDetails(String by, Boolean isCreate) {
    	
        Long time = System.currentTimeMillis();
        
        if(isCreate)
            return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time).build();
        else
            return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
    }

    public Object mDMSCall(ChallanRequest request){
        RequestInfo requestInfo = request.getRequestInfo();
        String tenantId = request.getChallan().getTenantId();
        String service = request.getChallan().getBusinessService();
        MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo, tenantId, service);
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }

    public StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(configs.getMdmsHost()).append(configs.getMdmsEndPoint());
    }

    private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo,String tenantId, String service){
        List<ModuleDetail> moduleDetails = getModuleDeatilRequest(service);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId)
                .build();

        MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria)
                .requestInfo(requestInfo).build();
        return mdmsCriteriaReq;
    }

    private List<ModuleDetail> getModuleDeatilRequest(String service) {
        // filter to only get code field from master data
        final String filterCode = "$.[?(@.service=='"+service+"')]";

        // Create separate module details for billing service and challan module
        List<ModuleDetail> moduleDetails = new ArrayList<>();
        
        // Billing service module
        List<MasterDetail> billingMasters = new ArrayList<>();
        billingMasters.add(MasterDetail.builder().name(ChallanConstants.TAXPERIOD_MASTER).filter(filterCode).build());
        billingMasters.add(MasterDetail.builder().name(ChallanConstants.TAXPHEADCODE_MASTER).filter(filterCode).build());
        
        ModuleDetail billingModule = ModuleDetail.builder().masterDetails(billingMasters)
                .moduleName(ChallanConstants.BILLING_SERVICE).build();
        moduleDetails.add(billingModule);
        
        // Challan module for offence data
        List<MasterDetail> challanMasters = new ArrayList<>();
        challanMasters.add(MasterDetail.builder().name(ChallanConstants.OFFENCE_TYPE_MASTER).build());
        challanMasters.add(MasterDetail.builder().name(ChallanConstants.OFFENCE_CATEGORY_MASTER).build());
        challanMasters.add(MasterDetail.builder().name(ChallanConstants.OFFENCE_SUBCATEGORY_MASTER).build());
        challanMasters.add(MasterDetail.builder().name(ChallanConstants.RATES_MASTER).build());
        
        ModuleDetail challanModule = ModuleDetail.builder().masterDetails(challanMasters)
                .moduleName(ChallanConstants.CHALLAN_MODULE).build();
        moduleDetails.add(challanModule);

        return moduleDetails;
    }

    /**
     * Fetches rate details from MDMS based on subcategory
     * Returns Map containing amount
     */
	public Map<String, Object> fetchRateDetailsFromMDMS(Object mdmsData, String subCategoryId) {
		try {
			String jsonPath = ChallanConstants.MDMS_RATES_PATH.replace("{}", subCategoryId);
			List<Map<String, Object>> rateDetails = JsonPath.read(mdmsData, jsonPath);
			if (rateDetails != null && !rateDetails.isEmpty()) {
				return rateDetails.get(0);
			}
		} catch (Exception e) {
			log.error("Error fetching rate details from MDMS for subcategory: {}", subCategoryId, e);
		}
		return new HashMap<>();
	}
	
	public Map<String, Object> fetchTaxPeriodFromMDMS(Object mdmsData, String businessService) {
		try {
			String jsonPath = ChallanConstants.MDMS_FINACIALYEAR_PATH;
			List<Map<String, Object>> taxPeriods = JsonPath.read(mdmsData, jsonPath);
			if (taxPeriods != null && !taxPeriods.isEmpty()) {
				// Find the tax period for the specific business service
				for (Map<String, Object> taxPeriod : taxPeriods) {
					if (businessService.equals(taxPeriod.get("service"))) {
						return taxPeriod;
					}
				}
				// If no specific service found, return the first active tax period
				for (Map<String, Object> taxPeriod : taxPeriods) {
					if (Boolean.TRUE.equals(taxPeriod.get("isActive"))) {
						return taxPeriod;
					}
				}
				// Fallback to first tax period
				return taxPeriods.get(0);
			}
		} catch (Exception e) {
			log.error("Error fetching tax period from MDMS for business service: {}", businessService, e);
		}
		return new HashMap<>();
	}
	
	/**
	 * Fetches amount from MDMS based on subcategory name
	 */
	public BigDecimal fetchAmountFromSubCategoryName(Object mdmsData, String subCategoryName) {
		try {
			List<Map<String, Object>> subCategories = JsonPath.read(mdmsData, ChallanConstants.MDMS_OFFENCE_SUBCATEGORY_PATH);
			for (Map<String, Object> subCategory : subCategories) {
				if (subCategoryName.equals(subCategory.get("name"))) {
					String subCategoryId = (String) subCategory.get("id");
					// Now fetch amount from rates using the subcategory ID
					String jsonPath = ChallanConstants.MDMS_RATES_PATH.replace("{}", subCategoryId);
					List<Map<String, Object>> rateDetails = JsonPath.read(mdmsData, jsonPath);
					if (rateDetails != null && !rateDetails.isEmpty()) {
						return new BigDecimal(rateDetails.get(0).get("amount").toString());
					}
					break;
				}
			}
		} catch (Exception e) {
			log.error("Error fetching amount from subcategory name: {}", subCategoryName, e);
		}
		return null;
	}

 
}
