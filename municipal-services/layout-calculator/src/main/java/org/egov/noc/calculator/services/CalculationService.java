package org.egov.noc.calculator.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;

import org.egov.common.contract.request.RequestInfo;
import org.egov.noc.calculator.utils.LAYOUTConstants;
import org.egov.noc.calculator.utils.ResponseInfoFactory;
import org.egov.noc.calculator.web.models.Calculation;
import org.egov.noc.calculator.web.models.CalculationCriteria;
import org.egov.noc.calculator.web.models.CalculationReq;
import org.egov.noc.calculator.web.models.Layout;
import org.egov.noc.calculator.web.models.demand.Category;
import org.egov.noc.calculator.web.models.demand.TaxHeadEstimate;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CalculationService {

	

	@Autowired
	private MDMSService mdmsService;

	@Autowired
	private DemandService demandService;

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
    private LAYOUTService nocService;

	@Autowired
	private ResponseInfoFactory responseInfoFactory;

	public List<Calculation> calculate(CalculationReq calculationReq, boolean getCalculationOnly){
		
		List<Calculation> calculations = getCalculations(calculationReq);

		if(!getCalculationOnly) {
			demandService.generateDemands(calculationReq.getRequestInfo(), calculations,calculationReq.getCalculationCriteria().get(0).getFeeType());
		}
		return calculations;
	}

	public List<Calculation> getCalculations(CalculationReq calculationReq){
		
		List<Calculation> calculations = new LinkedList<>();
		
		for(CalculationCriteria criteria : calculationReq.getCalculationCriteria()) {
			
			 if(criteria.getApplicationNumber()!=null && criteria.getLayout() == null) {
         		Layout noc = nocService.getNOC(calculationReq.getRequestInfo(), criteria.getTenantId(), criteria.getApplicationNumber());
         		criteria.setLayout(noc);
			 	}
			 if (criteria.getLayout() == null)
	                throw new CustomException(LAYOUTConstants.INVALID_APPLICATION_NUMBER, "Demand cannot be generated for applicationNumber " +
	                		criteria.getApplicationNumber() + "  NOC application with this number does not exist ");
			 
			
			List<TaxHeadEstimate> estimates = new LinkedList<>();;

			if(((Map<String, Object>)criteria.getLayout().getLayoutDetails().getAdditionalDetails()).containsKey("calculations")
					&& LAYOUTConstants.FEE_TYPE_PAY2.equalsIgnoreCase(criteria.getFeeType())) {
				String filter = "$.calculations.[?(@.isLatest == true)].taxHeadEstimates.*";
				List<Map> userCalculations = JsonPath.read(criteria.getLayout().getLayoutDetails().getAdditionalDetails(), filter);
				for(Map userCalculation : userCalculations){
					TaxHeadEstimate taxHeadEstimate = mapper.convertValue(userCalculation, TaxHeadEstimate.class);
					estimates.add(taxHeadEstimate);
				}
			}
			
			String tenantId = criteria.getTenantId();
			BigDecimal plotArea = new BigDecimal(0);
			BigDecimal builtUpArea = new BigDecimal(0);
			BigDecimal basementArea = new BigDecimal(0);
			String category = "";
			String finYear = "";
			String roadTypeVal = "";

//			Object additionalDetailsData = criteria.getNoc().getNocDetails().getAdditionalDetails();


			Map<String, Object> siteDetails1 = (Map<String, Object>)((Map<String, Object>)criteria.getLayout().getLayoutDetails().getAdditionalDetails()).get("siteDetails");
			LinkedHashMap<String, Object> roadType = (LinkedHashMap<String, Object>) siteDetails1.get("roadType");
			roadTypeVal = (String) roadType.get("name");

			if(criteria.getLayout().getLayoutDetails().getAdditionalDetails() != null) {
				Map<String, Object> siteDetails = (Map<String, Object>)((Map<String, Object>)criteria.getLayout().getLayoutDetails().getAdditionalDetails()).get("siteDetails");


				if(siteDetails.get("netTotalArea") != null)
					plotArea = new BigDecimal(siteDetails.getOrDefault("netTotalArea", "0").toString().trim());
				if(siteDetails.get("totalFloorArea") != null)
					builtUpArea = new BigDecimal(siteDetails.getOrDefault("totalFloorArea", "0").toString().trim());
				if(siteDetails.get("basementArea") != null)
					basementArea = new BigDecimal(siteDetails.getOrDefault("basementArea", "0").toString().trim());
				if(siteDetails.get("buildingCategory") != null) {
					LinkedHashMap<String, Object> buildingCategory = (LinkedHashMap<String, Object>) siteDetails.get("buildingCategory");
					category = (String) buildingCategory.get("name");

				}
				
				LocalDate today = LocalDate.now();
				if(today.getMonthValue() > 3)
					finYear = today.getYear() + "-" + ((today.getYear() % 2000) +1);
				else
					finYear = (today.getYear()-1) + "-" + (today.getYear()) % 2000;
				
			}
			Object mdmsData = mdmsService.getMDMSSanctionFeeCharges(calculationReq.getRequestInfo(), tenantId, LAYOUTConstants.MDMS_CHARGES_TYPE_CODE, category, finYear,criteria.getFeeType());
			String feeApplicationType = (String)
					((Map<String, Object>) criteria.getLayout()
							.getLayoutDetails()
							.getAdditionalDetails())
							.getOrDefault("feeApplicationType", "PROPOSED");
			if(estimates.isEmpty())
				estimates = calculateFee(calculationReq.getRequestInfo(), mdmsData, plotArea, builtUpArea, basementArea,roadTypeVal,feeApplicationType);

			if(estimates.isEmpty())
				throw new CustomException("NO_FEE_CONFIGURED","No fee configured for the application");	
			
			List<Long> taxPeriodFrom = JsonPath.read(mdmsData, LAYOUTConstants.MDMS_TAX_PERIOD_FROM_PATH);
			List<Long> taxPeriodTo = JsonPath.read(mdmsData, LAYOUTConstants.MDMS_TAX_PERIOD_TO_PATH);
			
			Calculation calculation = new Calculation();
			calculation.setApplicationNumber(criteria.getApplicationNumber());
			calculation.setTenantId(criteria.getTenantId());
			calculation.setTaxHeadEstimates(estimates);
			calculation.setTotalAmount(estimates.stream().map(TaxHeadEstimate::getEstimateAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
			calculation.setTaxPeriodFrom(taxPeriodFrom != null && !taxPeriodFrom.isEmpty() ? taxPeriodFrom.get(0) : System.currentTimeMillis());
			calculation.setTaxPeriodTo(taxPeriodTo != null && !taxPeriodTo.isEmpty() ? taxPeriodTo.get(0) : null);
			calculation.setLayout(criteria.getLayout());
			calculations.add(calculation);
			
		}
		
		return calculations;
	}

	private Double getFlatFee(CalculationReq calculationReq) {
		Object mdmsData = mdmsService.mDMSCall(calculationReq.getRequestInfo(), calculationReq.getCalculationCriteria().get(0).getTenantId());
		String jsonPathExpression = "$.MdmsRes.layout.NocFee[0].flatFee";

		try {
			String jsonResponse = mapper.writeValueAsString(mdmsData);
			Number flatFee = JsonPath.read(jsonResponse, jsonPathExpression);
			Double flatFeeValue = flatFee.doubleValue();
			System.out.println("Flat Fee (extracted with JsonPath): " + flatFeeValue);
			return flatFeeValue;
		} catch (Exception e) {
			log.error("Error extracting flatFee: " + e.getMessage());
			throw new CustomException("ERROR_FETCHING_FEE_FROM_MDMS","Error extracting flatFee: " + e.getMessage());
		}
	}
	
	/**
	 * Calculate the Sanction fee of the BPA application
	 * @param requestInfo to call the MDMS API
	 * @param tanentId required to call the MDMS API
	 * @param plotArea Plot area of the Building
	 * @param builtUpArea Build-up area of the Building
	 * @param basementArea Basement area of the Building
	 * @param category Usage type of the Building
	 * @param finYear Current financial year
	 * @return List of TaxHeadEstimate for the Demand creation
	 */
	private List<TaxHeadEstimate> calculateFee (RequestInfo requestInfo, Object mdmsData, BigDecimal plotArea, BigDecimal builtUpArea, BigDecimal basementArea,String roadType,String applicationType) {
		List<TaxHeadEstimate> estimates = new LinkedList<>();
		List<Map<String,Object>> chargesTypejsonOutput = JsonPath.read(mdmsData, LAYOUTConstants.MDMS_CHARGES_TYPE_PATH);
		
		chargesTypejsonOutput.forEach(chargesType -> {
			BigDecimal rate = new BigDecimal(chargesType.containsKey("rate") ? (Double) chargesType.get("rate") : 0.0);
			TaxHeadEstimate estimate = new TaxHeadEstimate();
			BigDecimal amount= BigDecimal.ZERO;
			String taxhead= chargesType.get("taxHeadCode").toString();
			
			switch (taxhead) {
			
			case LAYOUTConstants.LAYOUT_PROCESSING_FEE:
				BigDecimal acarPlotArea = plotArea.multiply(LAYOUTConstants.SQMETER_TO_SQYARD).divide(LAYOUTConstants.ACAR_TO_SQYARD, 0, RoundingMode.CEILING).setScale(0, RoundingMode.CEILING);
				if(acarPlotArea.equals(BigDecimal.ONE))
					amount = new BigDecimal(chargesType.containsKey("fee") ? (Double) chargesType.get("fee") : 0.0);
				else {
					amount = acarPlotArea.subtract(BigDecimal.ONE)
							.multiply(rate)
							.add(new BigDecimal(chargesType.containsKey("fee") ? (Double) chargesType.get("fee") : 0.0))
							.setScale(0, RoundingMode.CEILING);
				}
				break;
			case LAYOUTConstants.LAYOUT_SCRUTINY_FEE:

				List<Map<String, Object>> slabs = (List<Map<String, Object>>) chargesType.get("slabs");

				Map<String, Object> matchedSlab = slabs.stream()
						.filter(slab -> ((String) slab.get("applicationType")).equalsIgnoreCase(applicationType))
						.findFirst()
						.orElse(Collections.EMPTY_MAP);

			rate = new BigDecimal((Double) matchedSlab.getOrDefault("rate", 0.0));

				amount = plotArea
						.multiply(rate)
						.setScale(0, RoundingMode.CEILING);

				break;
			case LAYOUTConstants.NOC_CLU_CHARGES:
				if(chargesType.containsKey("slabs")) {
					Map<String,Double> slabAmountMap = ((List<Map<String, Object>>)chargesType.get("slabs")).stream()
							.collect(Collectors.toMap(slab -> slab.get("roadType").toString(), slab -> (Double)slab.get("rate")));
					Double cluSlabAmount = slabAmountMap.containsKey(roadType) ? slabAmountMap.get(roadType) : slabAmountMap.get("Other Road");
					amount = BigDecimal.valueOf(cluSlabAmount).multiply(plotArea).setScale(0, RoundingMode.HALF_UP);
				}
				break;
			case LAYOUTConstants.NOC_EXTERNAL_DEVELOPMENT_CHARGES:
				amount=rate.multiply(builtUpArea).setScale(0, RoundingMode.HALF_UP);
				break;


			}
			
			estimate.setEstimateAmount(amount);
			estimate.setCategory(Category.FEE);
			estimate.setTaxHeadCode(taxhead);
			estimates.add(estimate);
			
		});
		
		//Updating Urban Development Cess based on other fees
//		estimates.stream().filter(estimate -> estimate.getTaxHeadCode().equalsIgnoreCase(LAYOUTConstants.NOC_URBAN_DEVELOPMENT_CESS)).forEach(estimate -> {
//			BigDecimal totalFee = estimates.stream().filter(est -> est.getTaxHeadCode().equalsIgnoreCase(LAYOUTConstants.LAYOUT_PROCESSING_FEES) ||
//					est.getTaxHeadCode().equalsIgnoreCase(LAYOUTConstants.NOC_CLU_CHARGES) ||
//					est.getTaxHeadCode().equalsIgnoreCase(LAYOUTConstants.NOC_EXTERNAL_DEVELOPMENT_CHARGES))
//			.map(est -> est.getEstimateAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
//			estimate.setEstimateAmount(estimate.getEstimateAmount().multiply(totalFee).divide(BigDecimal.valueOf(100.0)).setScale(0, RoundingMode.HALF_UP));
//		});
		

		return estimates;
	}

}
