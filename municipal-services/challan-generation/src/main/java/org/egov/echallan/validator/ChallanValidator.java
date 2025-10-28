package org.egov.echallan.validator;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.echallan.config.ChallanConfiguration;
import org.egov.echallan.model.Amount;
import org.egov.echallan.model.Challan;
import org.egov.echallan.model.Challan.StatusEnum;
import org.egov.echallan.model.ChallanRequest;
import org.egov.echallan.model.RequestInfoWrapper;
import org.egov.echallan.repository.ServiceRequestRepository;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import static org.egov.echallan.util.ChallanConstants.*;

@Component
@Slf4j
public class ChallanValidator {

	@Autowired
	private ChallanConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	
	public void validateFields(ChallanRequest request, Object mdmsData) {
		Challan challan = request.getChallan();
		List<Map<String,Object>> taxPeriods = null;
		List<String> requiredTaxHeadCodes =new ArrayList<String>();
		List<String> currentTaxHeadCodes = new ArrayList<String>();
		Map<String, String> errorMap = new HashMap<>();

		taxPeriods =  JsonPath.read(mdmsData, MDMS_FINACIALYEAR_PATH);
		String jsonPath = MDMS_TAXHEADCODES_PATH.replace("{}",challan.getBusinessService());
		requiredTaxHeadCodes = JsonPath.read(mdmsData, jsonPath);

		List<Amount> entAmount = challan.getAmount();
		int totalAmt = 0;
		if (entAmount != null && !entAmount.isEmpty()) {
			for (Amount amount : entAmount) {
				if (amount.getAmount() != null) {
					totalAmt += amount.getAmount().intValue();
					if (amount.getTaxHeadCode() != null && !amount.getTaxHeadCode().isEmpty())
						currentTaxHeadCodes.add(amount.getTaxHeadCode());
					if (amount.getAmount().compareTo(new BigDecimal(0)) == -1)
						errorMap.put("Negative Amount", "Amount cannot be negative");
				}
			}
		}

		if(totalAmt <= 0) {
			errorMap.put("Zero amount","Challan cannot be generated for zero amount");
		}
		if (challan.getCitizen().getMobileNumber() == null)
            errorMap.put("NULL_Mobile Number", " Mobile Number cannot be null");
		if (challan.getBusinessService() == null)
            errorMap.put("NULL_BusinessService", " Business Service cannot be null");
		// Tax period will be auto-populated from MDMS, no validation needed

		// Validate offence-related fields
		validateOffenceFields(challan, mdmsData, errorMap);

		/*This valication will be handled at Zuul level. If a employee doesn't have access to that tenant the
		create API wont be called

		if(!echallan.getTenantId().equalsIgnoreCase(request.getRequestInfo().getUserInfo().getTenantId()))
        	 errorMap.put("Invalid Tenant", "Invalid tenant id");*/

		Boolean validFinancialYear = false;
		if(challan.getTaxPeriodTo() != null && challan.getTaxPeriodFrom() != null){
			for(Map<String,Object> financialYearProperties: taxPeriods){
				Long startDate = (Long) financialYearProperties.get(MDMS_STARTDATE);
				Long endDate = (Long) financialYearProperties.get(MDMS_ENDDATE);
				if (challan.getTaxPeriodFrom() <= challan.getTaxPeriodTo() && challan.getTaxPeriodFrom() >= startDate
						&& challan.getTaxPeriodTo() <= endDate)
				 	validFinancialYear = true;
			}
		 }

		if(!validFinancialYear)
			errorMap.put("Invalid TaxPeriod", "Tax period details are invalid");

        List<String> localityCodes = getLocalityCodes(challan.getTenantId(), request.getRequestInfo());

//		if (!localityCodes.contains(echallan.getAddress().getLocality().getCode()))
//			errorMap.put("Invalid Locality", "Locality details are invalid");

        if(!currentTaxHeadCodes.isEmpty() && !requiredTaxHeadCodes.isEmpty()){
        	if(!currentTaxHeadCodes.containsAll(requiredTaxHeadCodes))
				errorMap.put("INAVLID_TAXHEAD_CODE_DETAILS", "Mandatory taxhead codes details are not present in request for provided business service");
		}
        else
			errorMap.put("INAVLID_TAXHEAD_CODE_DETAILS", "Taxhead codes details are not present in request or in mdms records for provided business service");

		if (!errorMap.isEmpty())
        	 throw new CustomException(errorMap);
        
		
	}

	public List<String> getLocalityCodes(String tenantId, RequestInfo requestInfo){
		StringBuilder builder = new StringBuilder(config.getBoundaryHost());
		builder.append(config.getFetchBoundaryEndpoint());
		builder.append("?tenantId=");
		builder.append(tenantId);
		builder.append("&hierarchyTypeCode=");
		builder.append(HIERARCHY_CODE);
		builder.append("&boundaryType=");
		builder.append(BOUNDARY_TYPE);

		Object result = serviceRequestRepository.fetchResult(builder, new RequestInfoWrapper(requestInfo));

		List<String> codes = JsonPath.read(result, LOCALITY_CODE_PATH);
		return codes;
	}



	public void validateUpdateRequest(ChallanRequest request, List<Challan> searchResult) {
		Challan challan = request.getChallan();
		Map<String, String> errorMap = new HashMap<>();
		if (searchResult.size() == 0)
			errorMap.put("INVALID_UPDATE_REQ_NOT_EXIST", "The Challan to be updated is not in database");
		Challan searchchallan = searchResult.get(0);
		if(!challan.getBusinessService().equalsIgnoreCase(searchchallan.getBusinessService()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_BSERVICE", "The business service is not matching with the Search result");
		if(!challan.getChallanNo().equalsIgnoreCase(searchchallan.getChallanNo()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_CHALLAN_NO", "The Challan Number is not matching with the Search result");
		if(!challan.getAddress().getId().equalsIgnoreCase(searchchallan.getAddress().getId()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_ADDRESS", "Address is not matching with the Search result");
		if(!challan.getCitizen().getUuid().equalsIgnoreCase(searchchallan.getCitizen().getUuid()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_ADDRESS", "User Details not matching with the Search result");
		if(!challan.getCitizen().getName().equalsIgnoreCase(searchchallan.getCitizen().getName()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_NAME", "User Details not matching with the Search result");
		if(!challan.getCitizen().getMobileNumber().equalsIgnoreCase(searchchallan.getCitizen().getMobileNumber()))
			errorMap.put("INVALID_UPDATE_REQ_NOTMATCHED_MOBILENO", "User Details not matching with the Search result");
		if(searchchallan.getApplicationStatus()!=StatusEnum.ACTIVE)
			errorMap.put("INVALID_UPDATE_REQ_CHALLAN_INACTIVE", "Challan cannot be updated/cancelled");
		if(!challan.getTenantId().equalsIgnoreCase(request.getRequestInfo().getUserInfo().getTenantId()))
       	 	errorMap.put("INVALID_UPDATE_REQ_INVALID_TENANTID", "Invalid tenant id");
		if (!errorMap.isEmpty())
            throw new CustomException(errorMap);
		
	}

	public void validateChallanCountRequest(String tenantId){
		Map<String, String> errorMap = new HashMap<>();
		if(StringUtils.isEmpty(tenantId))
			errorMap.put("INVALID_CHALLAN_COUNT_REQ", "Please provide tenant id to get count details");

		if(!CollectionUtils.isEmpty(errorMap.keySet())) {
			throw new CustomException(errorMap);
		}
	}

	/**
	 * Validates offence-related fields against MDMS data
	 */
	private void validateOffenceFields(Challan challan, Object mdmsData, Map<String, String> errorMap) {
		// Validate offence type name
		if (StringUtils.isBlank(challan.getOffenceTypeName())) {
			errorMap.put("NULL_OFFENCE_TYPE", "Offence type name cannot be null");
		} else {
			List<Map<String, Object>> offenceTypes = JsonPath.read(mdmsData, MDMS_OFFENCE_TYPE_PATH);
			boolean validOffenceType = offenceTypes.stream()
					.anyMatch(type -> type.get("name").equals(challan.getOffenceTypeName()));
			if (!validOffenceType) {
				errorMap.put("INVALID_OFFENCE_TYPE", "Invalid offence type name provided");
			}
		}

		// Validate offence category name
		if (StringUtils.isBlank(challan.getOffenceCategoryName())) {
			errorMap.put("NULL_OFFENCE_CATEGORY", "Offence category name cannot be null");
		} else {
			List<Map<String, Object>> categories = JsonPath.read(mdmsData, MDMS_OFFENCE_CATEGORY_PATH);
			boolean validCategory = categories.stream()
					.anyMatch(category -> category.get("name").equals(challan.getOffenceCategoryName()));
			if (!validCategory) {
				errorMap.put("INVALID_OFFENCE_CATEGORY", "Invalid offence category name provided");
			}
		}

		// Validate offence subcategory name
		if (StringUtils.isBlank(challan.getOffenceSubCategoryName())) {
			errorMap.put("NULL_OFFENCE_SUBCATEGORY", "Offence subcategory name cannot be null");
		} else {
			List<Map<String, Object>> subCategories = JsonPath.read(mdmsData, MDMS_OFFENCE_SUBCATEGORY_PATH);
			boolean validSubCategory = subCategories.stream()
					.anyMatch(subCategory -> subCategory.get("name").equals(challan.getOffenceSubCategoryName()));
			if (!validSubCategory) {
				errorMap.put("INVALID_OFFENCE_SUBCATEGORY", "Invalid offence subcategory name provided");
			}
		}

		// Validate challan amount (optional - auto-populated from MDMS if not provided)
		if (challan.getChallanAmount() != null && challan.getChallanAmount().compareTo(BigDecimal.ZERO) <= 0) {
			errorMap.put("INVALID_CHALLAN_AMOUNT", "Challan amount must be greater than zero");
		}
		
		// Validate amount object (if provided manually)
		if (challan.getAmount() != null && !challan.getAmount().isEmpty()) {
			for (Amount amount : challan.getAmount()) {
				if (amount.getAmount() == null || amount.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
					errorMap.put("INVALID_AMOUNT", "Amount must be greater than zero");
				}
				if (StringUtils.isBlank(amount.getTaxHeadCode())) {
					errorMap.put("NULL_TAX_HEAD_CODE", "Tax head code cannot be null");
				}
			}
		}
	}
}
