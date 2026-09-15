package org.egov.noc.calculator.services;

import java.util.ArrayList;
import java.util.List;

import org.egov.noc.calculator.config.CLUCalculatorConfig;
import org.egov.noc.calculator.repository.ServiceRequestRepository;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.noc.calculator.utils.CLUConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MDMSService {

	@Autowired
	 private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private CLUCalculatorConfig config;
	
    private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId) {

        // master details for TL module
        List<MasterDetail> flatFeeMasterDetails = new ArrayList<>();
        // filter to only get code field from master data

        final String flatFeeFilter = "$.[?(@.flatFee!=null)]";

        flatFeeMasterDetails.add(MasterDetail.builder().name(CLUConstants.NOC_FEE_MODULE).filter(flatFeeFilter).build());
        ModuleDetail flatFeeModule = ModuleDetail.builder().masterDetails(flatFeeMasterDetails)
                .moduleName(CLUConstants.CLU_MODULE.toLowerCase()).build();

        List<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(flatFeeModule);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId)
                .build();

        return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();
    }

    @Cacheable(value = "mdmsCache", key = "'tenantId'", sync = true)
    public Object mDMSCall(RequestInfo requestInfo,String tenantId){
        MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo,tenantId);
        StringBuilder url = getMdmsSearchUrl();
        Object result = serviceRequestRepository.fetchResult(url , mdmsCriteriaReq);
        return result;
    }

    private StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(config.getMdmsHost()).append(config.getMdmsSearchEndpoint());
    }

    /**
     * Gets the MDMS data for Sanction Fee Charges of BPA
     * @param CalculationReq to retrieve RequestInfo
     * @param tenantId of the BPA
     * @param Charges type code
     * @param BPA category
     * @return MDMS data for Sanction Fee Charges
     */
    public Object getMDMSSanctionFeeCharges (RequestInfo requestInfo, String tenantId, String code,
    		String category, String fromFY, String feeType) {
    	
    	MdmsCriteriaReq mdmsCriteriaReq = getMDMSSanctionFeeRequest(requestInfo, tenantId, code, category, fromFY, feeType);
		StringBuilder url = getMdmsSearchUrl();
		Object result = serviceRequestRepository.fetchResult(url , mdmsCriteriaReq);

		if (result instanceof java.util.Map && CLUConstants.FEE_TYPE_PAY2.equalsIgnoreCase(feeType)) {
			try {
				java.util.Map<String, Object> resultMap = (java.util.Map<String, Object>) result;
				if (resultMap.containsKey("MdmsRes")) {
					java.util.Map<String, Object> mdmsRes = (java.util.Map<String, Object>) resultMap.get("MdmsRes");
					String moduleKey = CLUConstants.CLU_MODULE.toLowerCase();
					if (mdmsRes.containsKey(moduleKey)) {
						java.util.Map<String, Object> moduleMap = (java.util.Map<String, Object>) mdmsRes.get(moduleKey);
						if (moduleMap.containsKey(CLUConstants.MDMS_CHARGES_TYPE)) {
							java.util.List<java.util.Map<String, Object>> chargesTypeList = 
									(java.util.List<java.util.Map<String, Object>>) moduleMap.get(CLUConstants.MDMS_CHARGES_TYPE);
							if (chargesTypeList != null) {
								java.util.List<java.util.Map<String, Object>> filteredList = new java.util.ArrayList<>();
								java.util.List<java.util.Map<String, Object>> defaultList = new java.util.ArrayList<>();
								for (java.util.Map<String, Object> chargesType : chargesTypeList) {
									Object bCategory = chargesType.get("BuildingCategory");
									if (bCategory == null) {
										bCategory = chargesType.get("AppliedCategory");
									}
									if (bCategory != null && !bCategory.toString().trim().isEmpty()) {
										if (bCategory.toString().equalsIgnoreCase(category)) {
											filteredList.add(chargesType);
										}
									} else {
										defaultList.add(chargesType);
									}
								}
								if (!filteredList.isEmpty()) {
									moduleMap.put(CLUConstants.MDMS_CHARGES_TYPE, filteredList);
								} else {
									moduleMap.put(CLUConstants.MDMS_CHARGES_TYPE, defaultList);
								}
							}
						}
					}
				}
			} catch (Exception e) {
				log.error("Error filtering MDMS charges by BuildingCategory: " + e.getMessage(), e);
			}
		}

		return result;
	}

	private MdmsCriteriaReq getMDMSSanctionFeeRequest(RequestInfo requestInfo, String tenantId, String code,
			String category, String fromFY, String feeType) {
        
        List<MasterDetail> sanctionFeeChargesDetails = new ArrayList<>();
        Long currentTime = System.currentTimeMillis();
//        final String filterCodeForCharges = "$.[?(@.active==true && @.code=='" + code + "' && @.Category == '" + category + "' && @.fromFY == '" + fromFY + "' && @.startingDate <= "+ currentTime +" && @.endingDate >= "+ currentTime +" )]";
        final String filterCodeForCharges = "$.[?(@.active==true && @.code=='" + code + "' && @.type == '" + feeType + "' && @.fromFY == '" + fromFY + "' && @.startingDate <= "+ currentTime +" && @.endingDate >= "+ currentTime +" )]";
        sanctionFeeChargesDetails.add(MasterDetail.builder().name(CLUConstants.MDMS_CHARGES_TYPE).filter(filterCodeForCharges).build());
        ModuleDetail fyModuleDtls = ModuleDetail.builder().masterDetails(sanctionFeeChargesDetails)
                .moduleName(CLUConstants.CLU_MODULE.toLowerCase()).build();
        

        List<ModuleDetail> moduleDetails = new ArrayList<>();
        
        moduleDetails.add(fyModuleDtls);

        MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId)
                .build();

        return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();
    }

}
