package org.egov.echallancalculation.service;


import java.util.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.common.contract.request.RequestInfo;
import org.egov.echallancalculation.config.ChallanConfiguration;
import org.egov.echallancalculation.model.Amount;
import org.egov.echallancalculation.model.Challan;
import org.egov.echallancalculation.util.CalculationUtils;
import org.egov.echallancalculation.web.models.calculation.Calculation;
import org.egov.echallancalculation.web.models.calculation.CalculationReq;
import org.egov.echallancalculation.web.models.calculation.CalulationCriteria;
import org.egov.echallancalculation.web.models.demand.TaxHeadEstimate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class CalculationService {

	
	@Autowired
	private DemandService demandService;
	
	@Autowired
	private CalculationUtils utils;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private ChallanConfiguration config;

	@Autowired
	private RestTemplate restTemplate;

	/**
	 * Get CalculationReq and Calculate the Tax Head on challan
	 */
	public List<Calculation> getCalculation(CalculationReq request) {
		
		List<Calculation> calculations = new ArrayList<Calculation>();
		calculations = getCalculation(request.getRequestInfo(),request.getCalulationCriteria());
		for(CalulationCriteria criteria : request.getCalulationCriteria()){
			String applicationStatus = criteria.getChallan().getApplicationStatus();
			if(applicationStatus.equalsIgnoreCase("CANCELLED"))
				cancelBill(request.getRequestInfo(),criteria.getChallan());
		}
		demandService.generateDemand(request.getRequestInfo(), calculations,  request.getCalulationCriteria().get(0).getChallan().getBusinessService());
		return calculations;
	}
	
	//Creating calculation using amount entered by user
	public List<Calculation> getCalculation(RequestInfo requestInfo, List<CalulationCriteria> criterias){
	      List<Calculation> calculations = new LinkedList<>();
	      for(CalulationCriteria criteria : criterias) {
	          Challan challan = criteria.getChallan();
	          if (criteria.getChallan()==null && criteria.getChallanNo() != null) {
	              challan = utils.getChallan(requestInfo, criteria.getChallanNo(), criteria.getTenantId());
	              criteria.setChallan(challan);
	          }
	          
	          List<TaxHeadEstimate> estimates = new LinkedList<>();
	          
	          // Calculate amount based on challanAmount and MDMS rate
	          BigDecimal finalAmount = BigDecimal.ZERO;
	          String taxHeadCode = "CH.CHALLAN_FINE"; // Default tax head code
	          
	          // Get user-entered challan amount
	          BigDecimal userAmount = BigDecimal.ZERO;
	          if (challan.getChallanAmount() != null && !challan.getChallanAmount().isEmpty()) {
	              try {
	                  userAmount = new BigDecimal(challan.getChallanAmount());
	              } catch (NumberFormatException e) {
	                  log.warn("Invalid challanAmount format: {}", challan.getChallanAmount());
	              }
	          }
	          
	          // Get MDMS rate if subcategory is available
	          BigDecimal mdmsRate = BigDecimal.ZERO;
	          String subCategoryId = null;
	          
	          // Try to get subcategory ID from offenceSubCategoryName first, then from subCategory field
	          if (challan.getOffenceSubCategoryName() != null && !challan.getOffenceSubCategoryName().isEmpty()) {
	              subCategoryId = utils.mapSubCategoryNameToId(requestInfo, challan.getTenantId(), challan.getOffenceSubCategoryName());
	          } else if (challan.getSubCategory() != null && !challan.getSubCategory().isEmpty()) {
	              subCategoryId = challan.getSubCategory();
	          }
	          
	          if (subCategoryId != null) {
	              mdmsRate = utils.getRateFromMDMS(requestInfo, challan.getTenantId(), subCategoryId);
	              taxHeadCode = utils.getTaxHeadCodeFromMDMS(requestInfo, challan.getTenantId(), "CH.CHALLAN_FINE");
	          }
	          
	          // Use the higher amount between user-entered amount and MDMS rate
	          if (userAmount.compareTo(BigDecimal.ZERO) > 0 || mdmsRate.compareTo(BigDecimal.ZERO) > 0) {
	              finalAmount = userAmount.max(mdmsRate);
	              
	              TaxHeadEstimate estimate = new TaxHeadEstimate();
	              estimate.setEstimateAmount(finalAmount);
	              estimate.setTaxHeadCode(taxHeadCode);
	              estimates.add(estimate);
	          } else {
	              // Fallback to existing amount list if no challanAmount or subcategory
	              List<Amount> amount = challan.getAmount();
	              if (amount != null) {
	                  for(Amount amount1 : amount) {
	                      TaxHeadEstimate estimate = new TaxHeadEstimate();
	                      estimate.setEstimateAmount(amount1.getAmount());
	                      estimate.setTaxHeadCode(amount1.getTaxHeadCode());
	                      estimates.add(estimate);
	                  }
	              }
	          }
	          
	          Calculation calculation = new Calculation();
	          calculation.setChallan(criteria.getChallan());
	          calculation.setTenantId(criteria.getTenantId());
	          calculation.setTaxHeadEstimates(estimates);

	          calculations.add(calculation);

	      }
	      return calculations;
	  }

	/**
	 * Test method to demonstrate dynamic calculation with provided payload
	 * This method shows how the higher amount logic works with dynamic MDMS mapping
	 */
	public void testCalculationWithPayload(RequestInfo requestInfo, String tenantId) {
		log.info("=== Testing Dynamic Calculation with Provided Payload ===");
		
		// Example from your payload:
		// "offenceSubCategoryName": "Loud Music After 10 PM"
		// "challanAmount": "200"
		
		String offenceSubCategoryName = "Loud Music After 10 PM";
		String challanAmount = "200";
		
		// Dynamically map offence subcategory name to ID from MDMS
		String subCategoryId = utils.mapSubCategoryNameToId(requestInfo, tenantId, offenceSubCategoryName);
		log.info("Offence Subcategory: {} -> Dynamically mapped to ID: {}", offenceSubCategoryName, subCategoryId);
		
		// Parse user amount
		BigDecimal userAmount = new BigDecimal(challanAmount);
		log.info("User entered challan amount: {}", userAmount);
		
		// Dynamically fetch MDMS rate
		BigDecimal mdmsRate = BigDecimal.ZERO;
		if (subCategoryId != null) {
			mdmsRate = utils.getRateFromMDMS(requestInfo, tenantId, subCategoryId);
			log.info("MDMS rate for {}: {}", subCategoryId, mdmsRate);
		}
		
		// Calculate final amount (higher of the two)
		BigDecimal finalAmount = userAmount.max(mdmsRate);
		log.info("Final amount (higher of user amount and MDMS rate): {}", finalAmount);
		
		log.info("=== Dynamic Calculation Result ===");
		log.info("Tax Head Code: CH.CHALLAN_FINE");
		log.info("Final Amount: {}", finalAmount);
		log.info("===============================================");
	}

	/**
	 * Test method to demonstrate minimumPayableAmount functionality
	 * This method shows how the total amount is calculated and stored in minimumPayableAmount
	 */
	public void testMinimumPayableAmount(RequestInfo requestInfo, String tenantId) {
		log.info("=== Testing Minimum Payable Amount Functionality ===");
		
		// Example calculation with your payload
		String offenceSubCategoryName = "Loud Music After 10 PM";
		String challanAmount = "200";
		
		// Get subcategory ID and rate
		String subCategoryId = utils.mapSubCategoryNameToId(requestInfo, tenantId, offenceSubCategoryName);
		BigDecimal userAmount = new BigDecimal(challanAmount);
		BigDecimal mdmsRate = BigDecimal.ZERO;
		
		if (subCategoryId != null) {
			mdmsRate = utils.getRateFromMDMS(requestInfo, tenantId, subCategoryId);
		}
		
		// Calculate final amount (higher of the two)
		BigDecimal finalAmount = userAmount.max(mdmsRate);
		
		// Simulate round-off calculation
		BigDecimal decimalValue = finalAmount.remainder(BigDecimal.ONE);
		BigDecimal roundOff = BigDecimal.ZERO;
		
		if (decimalValue.compareTo(new BigDecimal("0.5")) >= 0) {
			roundOff = BigDecimal.ONE.subtract(decimalValue);
		} else {
			roundOff = decimalValue.negate();
		}
		
		BigDecimal totalWithRoundOff = finalAmount.add(roundOff);
		
		log.info("User Amount: {}", userAmount);
		log.info("MDMS Rate: {}", mdmsRate);
		log.info("Final Amount (before round-off): {}", finalAmount);
		log.info("Round-off Amount: {}", roundOff);
		log.info("Total Amount (minimumPayableAmount): {}", totalWithRoundOff);
		
		log.info("=== Demand Creation ===");
		log.info("Demand will be created with:");
		log.info("- Tax Head: CH.CHALLAN_FINE");
		log.info("- Amount: {}", finalAmount);
		log.info("- Round-off: {}", roundOff);
		log.info("- minimumPayableAmount: {}", totalWithRoundOff);
		log.info("===============================================");
	}

	public void cancelBill(RequestInfo requestInfo, Challan challan){
		Map<String, Object> request = new HashMap<>();
		Map<String, Object> updateBillCriteria = new HashMap<>();
		List<String> consumerCodes = Arrays.asList(challan.getChallanNo());
		String businessService = challan.getBusinessService();

		updateBillCriteria.put("tenantId", challan.getTenantId());
		updateBillCriteria.put("consumerCodes", consumerCodes);
		updateBillCriteria.put("businessService", businessService);
		updateBillCriteria.put("additionalDetails", challan.getAdditionalDetail());

		request.put("RequestInfo", requestInfo);
		request.put("UpdateBillCriteria", updateBillCriteria);

		StringBuilder url = new StringBuilder();
		url.append(config.getBillingHost()).append(config.getCancelBillEndpoint());
		try {
			Object response = restTemplate.postForObject(url.toString(), request, Map.class);
		}catch(Exception e) {
			log.error("Exception while fetching user: ", e);
		}
	}

	
	
}
