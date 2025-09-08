package org.egov.pt.calculator.service;

import static org.egov.pt.calculator.util.CalculatorConstants.BILLINGSLAB_KEY;
import static org.egov.pt.calculator.util.CalculatorConstants.FINANCIALYEAR_MASTER_KEY;
import static org.egov.pt.calculator.util.CalculatorConstants.PT_ROUNDOFF;
import static org.egov.pt.calculator.util.CalculatorConstants.PT_TIME_INTEREST;
import static org.egov.pt.calculator.util.CalculatorConstants.PT_TIME_PENALTY;
import static org.egov.pt.calculator.util.CalculatorConstants.PT_TIME_REBATE;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.stream.Collectors;

import javax.xml.stream.events.StartDocument;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.pt.calculator.repository.Repository;
import org.egov.pt.calculator.util.CalculatorConstants;
import org.egov.pt.calculator.util.CalculatorUtils;
import org.egov.pt.calculator.util.Configurations;
import org.egov.pt.calculator.validator.CalculationValidator;
import org.egov.pt.calculator.web.models.Calculation;
import org.egov.pt.calculator.web.models.CalculationCriteria;
import org.egov.pt.calculator.web.models.CalculationReq;
import org.egov.pt.calculator.web.models.DemandDetailAndCollection;
import org.egov.pt.calculator.web.models.GetBillCriteria;
import org.egov.pt.calculator.web.models.TaxHeadEstimate;
import org.egov.pt.calculator.web.models.collections.Payment;
import org.egov.pt.calculator.web.models.demand.Bill;
import org.egov.pt.calculator.web.models.demand.BillResponse;
import org.egov.pt.calculator.web.models.demand.Demand;
import org.egov.pt.calculator.web.models.demand.Demand.DemandStatusEnum;
import org.egov.pt.calculator.web.models.demand.DemandDetail;
import org.egov.pt.calculator.web.models.demand.DemandRequest;
import org.egov.pt.calculator.web.models.demand.DemandResponse;
import org.egov.pt.calculator.web.models.demand.TaxHeadMaster;
import org.egov.pt.calculator.web.models.demand.TaxPeriod;
import org.egov.pt.calculator.web.models.property.OwnerInfo;
import org.egov.pt.calculator.web.models.property.Property;
import org.egov.pt.calculator.web.models.property.PropertyDetail;
import org.egov.pt.calculator.web.models.property.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;

@Service
@Slf4j
public class DemandService {

	@Autowired
	private EstimationService estimationService;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private Configurations configs;

	@Autowired
	private AssessmentService assessmentService;

	@Autowired
	private CalculatorUtils utils;

	@Autowired
	private Repository repository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PayService payService;

	@Autowired
	private MasterDataService mstrDataService;

	@Autowired
	private CalculationValidator validator;

	@Autowired
	private MasterDataService mDataService;

	@Autowired
    private PaymentService paymentService;

	/**
	 * Generates and persists the demand to billing service for the given property
	 * 
	 * if the property has been assessed already for the given financial year then
	 * 
	 * it carry forwards the old collection amount to the new demand as advance
	 * 
	 * @param request
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Calculation> generateDemands(CalculationReq request) {

		List<CalculationCriteria> criterias = request.getCalculationCriteria();
		List<Demand> demands = new ArrayList<>();
		List<String> lesserAssessments = new ArrayList<>();
		Map<String, String> consumerCodeFinYearMap = new HashMap<>();
		Map<String,Object> masterMap = mDataService.getMasterMap(request);
	for (CalculationCriteria criteria : criterias) {
		String finanicialYear=	criteria.getProperty().getPropertyDetails().get(0).getFinancialYear();
	        Map<String,Map<String, Object>>finicialYears=(Map<String, Map<String, Object>>) masterMap.get(FINANCIALYEAR_MASTER_KEY);
	        Long startingDateForFinicialYear=  Long.valueOf(finicialYears.get(finanicialYear).get("startingDate").toString());
	        log.info("starting date is" +startingDateForFinicialYear);
	        criteria.setFromDate(startingDateForFinicialYear); 
	        Long endingDateForFinicialYear=  Long.valueOf(finicialYears.get(finanicialYear).get("endingDate").toString());
	        criteria.setToDate(endingDateForFinicialYear);
		}

		Map<String, Calculation> propertyCalculationMap = estimationService.getEstimationPropertyMap(request,masterMap);
		for (CalculationCriteria criteria : criterias) {

			Property property = criteria.getProperty();

			PropertyDetail detail = property.getPropertyDetails().get(0);

			Calculation calculation = propertyCalculationMap.get(property.getPropertyDetails().get(0).getAssessmentNumber());

			String assessmentNumber = detail.getAssessmentNumber();

			// pt_tax for the new assessment
			BigDecimal newTax =  BigDecimal.ZERO;
			Optional<TaxHeadEstimate> advanceCarryforwardEstimate = propertyCalculationMap.get(assessmentNumber).getTaxHeadEstimates()
			.stream().filter(estimate -> estimate.getTaxHeadCode().equalsIgnoreCase(CalculatorConstants.PT_TAX))
				.findAny();
			if(advanceCarryforwardEstimate.isPresent())
				newTax = advanceCarryforwardEstimate.get().getEstimateAmount();

			Demand oldDemand = utils.getLatestDemandForCurrentFinancialYear(request.getRequestInfo(),criteria);

			// true represents that the demand should be updated from this call
			BigDecimal carryForwardCollectedAmount = getCarryForwardAndCancelOldDemand(newTax, criteria,
					request.getRequestInfo(),oldDemand, true);

			if (carryForwardCollectedAmount.doubleValue() >= 0.0) {

				Demand demand = prepareDemand(property, calculation ,oldDemand);

				// Add billingSLabs in demand additionalDetails as map with key calculationDescription
				demand.setAdditionalDetails(Collections.singletonMap(BILLINGSLAB_KEY, calculation.getBillingSlabIds()));

				demands.add(demand);
				consumerCodeFinYearMap.put(demand.getConsumerCode(), detail.getFinancialYear());

			}else {
				lesserAssessments.add(assessmentNumber);
			}
		}
		
		if (!CollectionUtils.isEmpty(lesserAssessments)) {
			throw new CustomException(CalculatorConstants.EG_PT_DEPRECIATING_ASSESSMENT_ERROR,
					CalculatorConstants.EG_PT_DEPRECIATING_ASSESSMENT_ERROR_MSG + lesserAssessments);
		}
		
		DemandRequest dmReq = DemandRequest.builder().demands(demands).requestInfo(request.getRequestInfo()).build();
		String url = new StringBuilder().append(configs.getBillingServiceHost())
				.append(configs.getDemandCreateEndPoint()).toString();
		DemandResponse res = new DemandResponse();

		try {
			res = restTemplate.postForObject(url, dmReq, DemandResponse.class);

		} catch (HttpClientErrorException e) {
			throw new ServiceCallException(e.getResponseBodyAsString());
		}
		log.info(" The demand Response is : " + res);
	//	assessmentService.saveAssessments(res.getDemands(), consumerCodeFinYearMap, request.getRequestInfo());
		return propertyCalculationMap;
	}

	/**
	 * Generates and returns bill from billing service
	 * 
	 * updates the demand with penalty and rebate if applicable before generating
	 * bill
	 * 
	 * @param getBillCriteria
	 * @param requestInfoWrapper
	 */
	public BillResponse getBill(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {

		DemandResponse res = updateDemands(getBillCriteria, requestInfoWrapper);

		/**
		 * Loop through the demands and call generateBill for each demand.
		 * Group the Bills and return the bill responsew
		 */
		List<Bill> bills = new LinkedList<>();
		BillResponse billResponse;
		ResponseInfo responseInfo = null;
		StringBuilder billGenUrl;

		Set<String> consumerCodes = res.getDemands().stream().map(Demand::getConsumerCode).collect(Collectors.toSet());

		// If toDate or fromDate is not given bill is generated across all taxPeriod for the given consumerCode
		if(getBillCriteria.getToDate()==null || getBillCriteria.getFromDate()==null){
			for(String consumerCode : consumerCodes){
				billGenUrl = utils.getBillGenUrl(getBillCriteria.getTenantId(), consumerCode);
				billResponse = mapper.convertValue(repository.fetchResult(billGenUrl, requestInfoWrapper), BillResponse.class);
				responseInfo = billResponse.getResposneInfo();
				bills.addAll(billResponse.getBill());
			}
		}
		// else if toDate and fromDate is given bill is generated for the taxPeriod corresponding to given dates for the given consumerCode
		else {
			for(Demand demand : res.getDemands()){
				billGenUrl = utils.getBillGenUrl(getBillCriteria.getTenantId(),demand.getId(),demand.getConsumerCode());
				billResponse = mapper.convertValue(repository.fetchResult(billGenUrl, requestInfoWrapper), BillResponse.class);
				responseInfo = billResponse.getResposneInfo();
				bills.addAll(billResponse.getBill());
			}
		}


		return BillResponse.builder().resposneInfo(responseInfo).bill(bills).build();
	}

	/**
	 * Method updates the demands based on the getBillCriteria
	 * 
	 * The response will be the list of demands updated for the 
	 * @param getBillCriteria
	 * @param requestInfoWrapper
	 * @return
	 */
	public DemandResponse updateDemands(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {
		 Boolean isOTSEnabled = false;

		
		if (getBillCriteria.getAmountExpected() == null) getBillCriteria.setAmountExpected(BigDecimal.ZERO);
		validator.validateGetBillCriteria(getBillCriteria);
		RequestInfo requestInfo = requestInfoWrapper.getRequestInfo();
		Map<String, Map<String, List<Object>>> propertyBasedExemptionMasterMap = new HashMap<>();
		Map<String, JSONArray> timeBasedExmeptionMasterMap = new HashMap<>();
		mstrDataService.setPropertyMasterValues(requestInfo, getBillCriteria.getTenantId(),
				propertyBasedExemptionMasterMap, timeBasedExmeptionMasterMap);

/*
		if(CollectionUtils.isEmpty(getBillCriteria.getConsumerCodes()))
			getBillCriteria.setConsumerCodes(Collections.singletonList(getBillCriteria.getPropertyId()+ CalculatorConstants.PT_CONSUMER_CODE_SEPARATOR +getBillCriteria.getAssessmentNumber()));
*/

		DemandResponse res = mapper.convertValue(
				repository.fetchResult(utils.getDemandSearchUrl(getBillCriteria), requestInfoWrapper),
				DemandResponse.class);
		if (CollectionUtils.isEmpty(res.getDemands())) {
		Map<String, String> map = new HashMap<>();
			map.put(CalculatorConstants.EMPTY_DEMAND_ERROR_CODE, CalculatorConstants.EMPTY_DEMAND_ERROR_MESSAGE);
		//	throw new CustomException(map);	
		}


		/**
		 * Loop through the consumerCodes and re-calculate the time based applicables
		 */


		Map<String,List<Demand>> consumerCodeToDemandMap = new HashMap<>();
		res.getDemands().forEach(demand -> {
			if(consumerCodeToDemandMap.containsKey(demand.getConsumerCode()))
				consumerCodeToDemandMap.get(demand.getConsumerCode()).add(demand);
			else {
				List<Demand> demands = new LinkedList<>();
				demands.add(demand);
				consumerCodeToDemandMap.put(demand.getConsumerCode(),demands);
			}
		});
		  Long startingDayEpoch = null;
          Long otsEndDateEpoch = null;
          BigDecimal otsRate = null;
		if (!CollectionUtils.isEmpty(consumerCodeToDemandMap)) {
		List<Demand> demandsToBeUpdated = new LinkedList<>();

		String tenantId = getBillCriteria.getTenantId();

		List<TaxPeriod> taxPeriods = mstrDataService.getTaxPeriodList(requestInfoWrapper.getRequestInfo(), tenantId);

		for (String consumerCode : getBillCriteria.getConsumerCodes()) {
			List<Demand> demands = consumerCodeToDemandMap.get(consumerCode);
			if (CollectionUtils.isEmpty(demands))
				continue;
			
			
			for(Demand demand : demands){
				if (demand.getStatus() != null
						&& CalculatorConstants.DEMAND_CANCELLED_STATUS.equalsIgnoreCase(demand.getStatus().toString()))
					throw new CustomException(CalculatorConstants.EG_PT_INVALID_DEMAND_ERROR,
							CalculatorConstants.EG_PT_INVALID_DEMAND_ERROR_MSG);
				/*
				 * OTS Configuration Fix - PI-18953 ( Abhishek Rana)
				 */				
				JSONArray otsArray = (JSONArray) timeBasedExmeptionMasterMap.get("Ots");

				if (otsArray != null && !otsArray.isEmpty()) {
				    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
				    boolean anyOtsApplied = false;

				    int demandFY = getFinancialYearStart(demand.getTaxPeriodFrom());

				    for (Object item : otsArray) {
				        if (item instanceof Map) {
				            Map<String, Object> penaltyMap = (Map<String, Object>) item;
				            boolean otsEnabledFlag = Boolean.parseBoolean(String.valueOf(penaltyMap.get("isOTSEnabled")));

				            if (otsEnabledFlag) {
				                Long localStartingEpoch = null;
				                Long localOtsEndEpoch = null;

				                if (penaltyMap.get("startingDay") != null) {
				                    LocalDate localDate = LocalDate.parse(penaltyMap.get("startingDay").toString(), formatter);
				                    localStartingEpoch = localDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
				                }

				                if (penaltyMap.get("OTSEndDate") != null) {
				                    LocalDate localDate = LocalDate.parse(penaltyMap.get("OTSEndDate").toString(), formatter);
				                    localOtsEndEpoch = localDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
				                }

				                // Extract interest and penalty rates
				                BigDecimal interestRate = penaltyMap.get("interestRatePercent") != null
				                        ? new BigDecimal(penaltyMap.get("interestRatePercent").toString())
				                        : null;
				                BigDecimal penaltyRate = penaltyMap.get("penaltyRatePercent") != null
				                        ? new BigDecimal(penaltyMap.get("penaltyRatePercent").toString())
				                        : null;

				                // If JSON has explicit financial year mapping
				                String fyApplicable = penaltyMap.get("financialYearsApplicable") != null
				                        ? penaltyMap.get("financialYearsApplicable").toString()
				                        : null;

				                if (fyApplicable != null) {
				                    int otsFY = getFinancialYearStart(
				                            LocalDate.parse("01/04/" + fyApplicable.split("-")[0], DateTimeFormatter.ofPattern("dd/MM/yyyy"))
				                                    .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
				                    );

				                    if (demandFY == otsFY) {
				                        log.info("OTS is Enabled for FY: {} (InterestRate: {}, PenaltyRate: {})",
				                                demandFY, interestRate, penaltyRate);
				                        otsEnabled(demand, interestRate, penaltyRate);
				                        anyOtsApplied = true;
				                    }
				                }
				                // Else check by date validity
				                else if (localStartingEpoch != null && localOtsEndEpoch != null &&
				                        demand.getTaxPeriodFrom() >= localStartingEpoch &&
				                        localOtsEndEpoch >= System.currentTimeMillis()) {

				                    log.info("OTS Enabled (Date Based) for Period {} - {}, InterestRate: {}, PenaltyRate: {}",
				                            demand.getTaxPeriodFrom(), demand.getTaxPeriodTo(), interestRate, penaltyRate);

				                    otsEnabled(demand, interestRate, penaltyRate);
				                    anyOtsApplied = true;
				                }
				            }
				        }
				    }

				    if (!anyOtsApplied) {
				        log.info("No applicable OTS found for FY: {}. Applying normal exemptions.", demandFY);
				        applytimeBasedApplicables(demand, requestInfoWrapper, timeBasedExmeptionMasterMap, taxPeriods);
				    }

				} else {
				    log.info("OTS array empty. Applying normal exemptions.");
				    applytimeBasedApplicables(demand, requestInfoWrapper, timeBasedExmeptionMasterMap, taxPeriods);
				}



				roundOffDecimalForDemand(demand, requestInfoWrapper);

				demandsToBeUpdated.add(demand);
			}
		}


		/**
		 * Call demand update in bulk to update the interest or penalty
		 */
		DemandRequest request = DemandRequest.builder().demands(demandsToBeUpdated).requestInfo(requestInfo).build();
		StringBuilder updateDemandUrl = utils.getUpdateDemandUrl();
		repository.fetchResult(updateDemandUrl, request);
		}
		return res;
	}

	
	private int getFinancialYearStart(long epochMillis) {
	    ZoneId zoneId = ZoneId.of("Asia/Kolkata"); 
	    LocalDate date = Instant.ofEpochMilli(epochMillis)
	            .atZone(zoneId)
	            .toLocalDate();

	    return (date.getMonthValue() <= 3) ? date.getYear() - 1 : date.getYear();
	}

public DemandResponse updateDemandsForAssessmentCancel(GetBillCriteria getBillCriteria, RequestInfoWrapper requestInfoWrapper) {
		
		if(getBillCriteria.getAmountExpected() == null) getBillCriteria.setAmountExpected(BigDecimal.ZERO);
		validator.validateGetBillCriteria(getBillCriteria);
		RequestInfo requestInfo = requestInfoWrapper.getRequestInfo();
		Map<String, Map<String, List<Object>>> propertyBasedExemptionMasterMap = new HashMap<>();
		Map<String, JSONArray> timeBasedExmeptionMasterMap = new HashMap<>();
		mstrDataService.setPropertyMasterValues(requestInfo, getBillCriteria.getTenantId(),
				propertyBasedExemptionMasterMap, timeBasedExmeptionMasterMap);

/*
		if(CollectionUtils.isEmpty(getBillCriteria.getConsumerCodes()))
			getBillCriteria.setConsumerCodes(Collections.singletonList(getBillCriteria.getPropertyId()+ CalculatorConstants.PT_CONSUMER_CODE_SEPARATOR +getBillCriteria.getAssessmentNumber()));
*/

		DemandResponse res = mapper.convertValue(
				repository.fetchResult(utils.getDemandSearchUrl(getBillCriteria), requestInfoWrapper),
				DemandResponse.class);
		
		//BillResponse resBill = mapper.convertValue(
		//		repository.fetchResult(utils.getBillSearchUrl(getBillCriteria), requestInfoWrapper),
		//		BillResponse.class);
		if (CollectionUtils.isEmpty(res.getDemands())) {
			Map<String, String> map = new HashMap<>();
			map.put(CalculatorConstants.EMPTY_DEMAND_ERROR_CODE, CalculatorConstants.EMPTY_DEMAND_ERROR_MESSAGE);
			//throw new CustomException(map);
		}
//if(!CollectionUtils.isEmpty(resBill.getDemands()))

		/**
		 * Loop through the consumerCodes and re-calculate the time based applicables
		 */


		Map<String,List<Demand>> consumerCodeToDemandMap = new HashMap<>();
		res.getDemands().forEach(demand -> {
			if(consumerCodeToDemandMap.containsKey(demand.getConsumerCode()))
				consumerCodeToDemandMap.get(demand.getConsumerCode()).add(demand);
			else {
				List<Demand> demands = new LinkedList<>();
				demands.add(demand);
				consumerCodeToDemandMap.put(demand.getConsumerCode(),demands);
			}
		});
		
		if (!CollectionUtils.isEmpty(consumerCodeToDemandMap)) {
			
		List<Demand> demandsToBeUpdated = new LinkedList<>();

		String tenantId = getBillCriteria.getTenantId();

		List<TaxPeriod> taxPeriods = mstrDataService.getTaxPeriodList(requestInfoWrapper.getRequestInfo(), tenantId);

		for (String consumerCode : getBillCriteria.getConsumerCodes()) {
			List<Demand> demands = consumerCodeToDemandMap.get(consumerCode);
			if (CollectionUtils.isEmpty(demands))
			     continue;

			for(Demand demand : demands){
				if (demand.getStatus() != null
						&& CalculatorConstants.DEMAND_CANCELLED_STATUS.equalsIgnoreCase(demand.getStatus().toString()))
					throw new CustomException(CalculatorConstants.EG_PT_INVALID_DEMAND_ERROR,
							CalculatorConstants.EG_PT_INVALID_DEMAND_ERROR_MSG);
				
				String year=getBillCriteria.getAssessmentYear();
				Date date = new Date(demand.getTaxPeriodFrom());
		        DateFormat format = new SimpleDateFormat("yyyy");
		        format.setTimeZone(TimeZone.getTimeZone("Etc/UTC"));
		        String formattedFrom = format.format(date);
		        date = new Date(demand.getTaxPeriodTo());
		        format = new SimpleDateFormat("yyyy");
		        format.setTimeZone(TimeZone.getTimeZone("Etc/UTC"));
		        String formattedTo = format.format(date);
		        String demandYear=formattedFrom+"-"+formattedTo.substring(2);
		        if(year.equalsIgnoreCase(demandYear)) {
				for(DemandDetail demanddetail : demand.getDemandDetails()){
					if(demanddetail.getCollectionAmount().compareTo(BigDecimal.ZERO)>0)
						throw new CustomException(CalculatorConstants.EG_PT_DEMAND_COLLECTED_ERROR,
								CalculatorConstants.EG_PT_DEMAND_COLLECTED_ERROR_MSG);
				}
				demand.setStatus(DemandStatusEnum.CANCELLED);
				//demandsToBeUpdated.add(demand);
		        }
				//applytimeBasedApplicables(demand, requestInfoWrapper, timeBasedExmeptionMasterMap,taxPeriods);

				//roundOffDecimalForDemand(demand, requestInfoWrapper);
				
				demandsToBeUpdated.add(demand);

			}
		}
		

		/**
		 * Call demand update in bulk to update the interest or penalty
		 */
		DemandRequest request = DemandRequest.builder().demands(demandsToBeUpdated).requestInfo(requestInfo).build();
		StringBuilder updateDemandUrl = utils.getUpdateDemandUrl();
		
		repository.fetchResult(updateDemandUrl, request);
		}
		return res;
	}


	/**
	 * if any previous assessments and demands associated with it exists for the
	 * same financial year
	 * 
	 * Then Returns the collected amount of previous demand if the current
	 * assessment is for the current year
	 * 
	 * and cancels the previous demand by updating it's status to inactive
	 * 
	 * @param criteria
	 * @return
	 */
	protected BigDecimal getCarryForwardAndCancelOldDemand(BigDecimal newTax, CalculationCriteria criteria, RequestInfo requestInfo
			,Demand demand, boolean cancelDemand) {

		Property property = criteria.getProperty();

		BigDecimal carryForward = BigDecimal.ZERO;
		BigDecimal oldTaxAmt = BigDecimal.ZERO;

		if(null == property.getPropertyId()) return carryForward;

	//	Demand demand = getLatestDemandForCurrentFinancialYear(requestInfo, property);
		
		if(null == demand) return carryForward;

		carryForward = utils.getTotalCollectedAmountAndPreviousCarryForward(demand);
		
		for (DemandDetail detail : demand.getDemandDetails()) {
			if (detail.getTaxHeadMasterCode().equalsIgnoreCase(CalculatorConstants.PT_TAX))
				oldTaxAmt = oldTaxAmt.add(detail.getTaxAmount());
		}			

		log.debug("The old tax amount in string : " + oldTaxAmt.toPlainString());
		log.debug("The new tax amount in string : " + newTax.toPlainString());
		
		if (oldTaxAmt.compareTo(newTax) > 0) {
			boolean isDepreciationAllowed = utils.isAssessmentDepreciationAllowed(demand,new RequestInfoWrapper(requestInfo));
			if (!isDepreciationAllowed)
				carryForward = BigDecimal.valueOf(-1);
		}

		if (BigDecimal.ZERO.compareTo(carryForward) > 0 || !cancelDemand) return carryForward;
		
		//demand.setStatus(Demand.StatusEnum.CANCELLED);

		List<Demand> demands = utils.getDemandForCurrentFinancialYear(requestInfo,criteria);
		List<Demand> demandsToBeCancelled = demandsToBeCancelled(demands);


		DemandRequest request = DemandRequest.builder().demands(demandsToBeCancelled).requestInfo(requestInfo).build();
		StringBuilder updateDemandUrl = utils.getUpdateDemandUrl();
		repository.fetchResult(updateDemandUrl, request);

		return carryForward;
	}


	private List<Demand> demandsToBeCancelled(List<Demand> demands){

		List<Demand> demandsToBeCancelled = new LinkedList<>();

		demands.forEach(demand -> {
			if(demand.getStatus().equals(Demand.DemandStatusEnum.ACTIVE)){
				demand.setStatus(Demand.DemandStatusEnum.CANCELLED);
				demandsToBeCancelled.add(demand);
			}
		});
		return demandsToBeCancelled;
	}


/*	*//**
	 * @param requestInfo
	 * @param property
	 * @return
	 *//*
	@Deprecated
	public Demand getLatestDemandForCurrentFinancialYear(RequestInfo requestInfo, Property property) {
		
		Assessment assessment = Assessment.builder().propertyId(property.getPropertyId())
				.tenantId(property.getTenantId())
				.assessmentYear(property.getPropertyDetails().get(0).getFinancialYear()).build();

		List<Assessment> assessments = assessmentService.getMaxAssessment(assessment);

		if (CollectionUtils.isEmpty(assessments))
			return null;

		Assessment latestAssessment = assessments.get(0);
		log.debug(" the latest assessment : " + latestAssessment);

		DemandResponse res = mapper.convertValue(
				repository.fetchResult(utils.getDemandSearchUrl(latestAssessment), new RequestInfoWrapper(requestInfo)),
				DemandResponse.class);
		return res.getDemands().get(0);
	}*/





	/**
	 * Prepares Demand object based on the incoming calculation object and property
	 * 
	 * @param property
	 * @param calculation
	 * @return
	 */
	private Demand prepareDemand(Property property, Calculation calculation,Demand demand) {

		String tenantId = property.getTenantId();
		PropertyDetail detail = property.getPropertyDetails().get(0);
		String propertyType = detail.getPropertyType();
		String consumerCode = property.getPropertyId();

		OwnerInfo owner = null;

		for(OwnerInfo ownerInfo : detail.getOwners()){
			if(ownerInfo.getStatus().toString().equalsIgnoreCase(OwnerInfo.OwnerStatus.ACTIVE.toString())){
				owner = ownerInfo;
				break;
			}
		}	

		/*if (null != detail.getCitizenInfo())
			owner = detail.getCitizenInfo();
		else
			owner = detail.getOwners().iterator().next();*/
		
	//	Demand demand = getLatestDemandForCurrentFinancialYear(requestInfo, property);

		List<DemandDetail> details = new ArrayList<>();

		details = getAdjustedDemandDetails(tenantId,calculation,demand);

		return Demand.builder().tenantId(tenantId).businessService(configs.getPtModuleCode()).consumerType(propertyType)
				.consumerCode(consumerCode).payer(owner.toCommonUser()).taxPeriodFrom(calculation.getFromDate())
				.taxPeriodTo(calculation.getToDate()).status(Demand.DemandStatusEnum.ACTIVE)
				.minimumAmountPayable(BigDecimal.valueOf(configs.getPtMinAmountPayable())).demandDetails(details)
				.build();
	}

	/**
	 * Applies Penalty/Rebate/Interest to the incoming demands
	 * 
	 * If applied already then the demand details will be updated
	 * 
	 * @param demand
	 * @return
	 */
	private boolean applytimeBasedApplicables(Demand demand,RequestInfoWrapper requestInfoWrapper,
			Map<String, JSONArray> timeBasedExmeptionMasterMap,List<TaxPeriod> taxPeriods) {

		boolean isCurrentDemand = false;
		String tenantId = demand.getTenantId();
		String demandId = demand.getId();
		
		TaxPeriod taxPeriod = taxPeriods.stream()
				.filter(t -> demand.getTaxPeriodFrom().compareTo(t.getFromDate()) >= 0
				&& demand.getTaxPeriodTo().compareTo(t.getToDate()) <= 0)
		.findAny().orElse(null);
		log.info("Demand TaxPeriod from and To are :::::::::::::"+demand.getTaxPeriodFrom()+","+demand.getTaxPeriodTo());
		log.info("Tax Period matching issssss", taxPeriod);
		if(!(taxPeriod.getFromDate()<= System.currentTimeMillis() && taxPeriod.getToDate() >= System.currentTimeMillis()))
			isCurrentDemand = true;
		/*
		 * method to get the latest collected time from the receipt service
		 */


		List<Payment> payments = paymentService.getPaymentsFromDemand(demand,requestInfoWrapper);


		boolean isRebateUpdated = false;
		boolean isPenaltyUpdated = false;
		boolean isInterestUpdated = false;
		
		List<DemandDetail> details = demand.getDemandDetails();

		BigDecimal taxAmt = utils.getTaxAmtFromDemandForApplicablesGeneration(demand);
		BigDecimal collectedPtTax = BigDecimal.ZERO;
		BigDecimal totalCollectedAmount = BigDecimal.ZERO;

		for (DemandDetail detail : demand.getDemandDetails()) {

			totalCollectedAmount = totalCollectedAmount.add(detail.getCollectionAmount());
			if (CalculatorConstants.TAXES_TO_BE_CONSIDERD.contains(detail.getTaxHeadMasterCode()))
				collectedPtTax = collectedPtTax.add(detail.getCollectionAmount());
		}


		Map<String, BigDecimal> rebatePenaltyEstimates = payService.applyPenaltyRebateAndInterest(taxAmt,collectedPtTax,
                taxPeriod.getFinancialYear(), timeBasedExmeptionMasterMap,payments,taxPeriod,demand);
		
		if(null == rebatePenaltyEstimates) return isCurrentDemand;
		
		BigDecimal rebate = rebatePenaltyEstimates.get(PT_TIME_REBATE);
		BigDecimal penalty = rebatePenaltyEstimates.get(CalculatorConstants.PT_TIME_PENALTY);
		BigDecimal interest = rebatePenaltyEstimates.get(CalculatorConstants.PT_TIME_INTEREST);

		DemandDetailAndCollection latestPenaltyDemandDetail,latestInterestDemandDetail;


		BigDecimal oldRebate = BigDecimal.ZERO;

		
		
		
		
		if(rebate==null){
			rebate=BigDecimal.ZERO;
					
		}
		
		if(penalty==null){
			penalty=BigDecimal.ZERO;
		}
		
		if(interest==null){
			
			interest=BigDecimal.ZERO;
			
		}
		
		if (!isRebateUpdated)
			{if(rebate.compareTo(oldRebate)!=0){
				details.add(DemandDetail.builder().taxAmount(rebate.subtract(oldRebate))
						.taxHeadMasterCode(PT_TIME_REBATE).demandId(demandId).tenantId(tenantId)
						.build());
				
		}}
	

		if(interest.compareTo(BigDecimal.ZERO)!=0){
			latestInterestDemandDetail = utils.getLatestDemandDetailByTaxHead(PT_TIME_INTEREST,details);
			if(latestInterestDemandDetail!=null){
				updateTaxAmount(interest,latestInterestDemandDetail);
				isInterestUpdated = true;
			}
		}

		if(penalty.compareTo(BigDecimal.ZERO)!=0){
			latestPenaltyDemandDetail = utils.getLatestDemandDetailByTaxHead(PT_TIME_PENALTY,details);
			if(latestPenaltyDemandDetail!=null){
				updateTaxAmount(penalty,latestPenaltyDemandDetail);
				isPenaltyUpdated = true;
			}
		}

		
		if (!isPenaltyUpdated && penalty.compareTo(BigDecimal.ZERO) > 0)
			details.add(DemandDetail.builder().taxAmount(penalty).taxHeadMasterCode(CalculatorConstants.PT_TIME_PENALTY)
					.demandId(demandId).tenantId(tenantId).build());
		if (!isInterestUpdated && interest.compareTo(BigDecimal.ZERO) > 0)
			details.add(
					DemandDetail.builder().taxAmount(interest).taxHeadMasterCode(CalculatorConstants.PT_TIME_INTEREST)
							.demandId(demandId).tenantId(tenantId).build());
		
		return isCurrentDemand;
	}

	/*
	 * OTS Configuration Fix - PI-18953 ( Abhishek Rana)
	 */	
	
	private boolean otsEnabled(Demand demand, BigDecimal interestRate, BigDecimal penaltyRate) {
	    String demandId = demand.getId();
	    String tenantId = demand.getTenantId();
	    List<DemandDetail> details = demand.getDemandDetails();

	    BigDecimal totalPenalty = BigDecimal.ZERO;
	    BigDecimal collectedPenalty = BigDecimal.ZERO;

	    BigDecimal totalInterest = BigDecimal.ZERO;
	    BigDecimal collectedInterest = BigDecimal.ZERO;

	    DemandDetail existingPenaltyWaveoff = null;
	    DemandDetail existingInterestWaveoff = null;

	    for (DemandDetail detail : details) {
	        String taxHead = detail.getTaxHeadMasterCode();

	        if (CalculatorConstants.PT_TIME_PENALTY.equals(taxHead)) {
	            totalPenalty = totalPenalty.add(detail.getTaxAmount());
	            collectedPenalty = collectedPenalty.add(detail.getCollectionAmount());
	        } else if (CalculatorConstants.PT_TIME_INTEREST.equals(taxHead)) {
	            totalInterest = totalInterest.add(detail.getTaxAmount());
	            collectedInterest = collectedInterest.add(detail.getCollectionAmount());
	        } else if (CalculatorConstants.OTS_PENALTY_WAVEOFF.equals(taxHead)) {
	            existingPenaltyWaveoff = detail;
	        } else if (CalculatorConstants.OTS_INTEREST_WAVEOFF.equals(taxHead)) {
	            existingInterestWaveoff = detail;
	        }
	    }

	    BigDecimal unpaidPenalty = totalPenalty.subtract(collectedPenalty);
	    BigDecimal unpaidInterest = totalInterest.subtract(collectedInterest);

	    BigDecimal penaltyWaveoff = BigDecimal.ZERO;
	    BigDecimal interestWaveoff = BigDecimal.ZERO;

	    if (penaltyRate != null) {
	        penaltyWaveoff = unpaidPenalty.multiply(penaltyRate)
	                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
	                .setScale(0, RoundingMode.HALF_UP);
	    }

	    if (interestRate != null) {
	        interestWaveoff = unpaidInterest.multiply(interestRate)
	                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
	                .setScale(0, RoundingMode.HALF_UP);
	    }

	    if (unpaidPenalty.compareTo(BigDecimal.ZERO) > 0 && penaltyWaveoff.compareTo(BigDecimal.ZERO) > 0) {
	        if (existingPenaltyWaveoff != null) {
	            existingPenaltyWaveoff.setTaxAmount(penaltyWaveoff.negate());
	        } else {
	            details.add(DemandDetail.builder()
	                    .taxAmount(penaltyWaveoff.negate())
	                    .taxHeadMasterCode(CalculatorConstants.OTS_PENALTY_WAVEOFF)
	                    .demandId(demandId)
	                    .tenantId(tenantId)
	                    .build());
	        }
	    }

	    if (unpaidInterest.compareTo(BigDecimal.ZERO) > 0 && interestWaveoff.compareTo(BigDecimal.ZERO) > 0) {
	        if (existingInterestWaveoff != null) {
	            existingInterestWaveoff.setTaxAmount(interestWaveoff.negate());
	        } else {
	            details.add(DemandDetail.builder()
	                    .taxAmount(interestWaveoff.negate())
	                    .taxHeadMasterCode(CalculatorConstants.OTS_INTEREST_WAVEOFF)
	                    .demandId(demandId)
	                    .tenantId(tenantId)
	                    .build());
	        }
	    }

	    return true;
	}





	/**
	 * 
	 * Balances the decimal values in the newly updated demand by performing a roundoff
	 * 
	 * @param demand
	 * @param requestInfoWrapper
	 */
	public void roundOffDecimalForDemand(Demand demand, RequestInfoWrapper requestInfoWrapper) {
		
		List<DemandDetail> details = demand.getDemandDetails();
		String tenantId = demand.getTenantId();
		String demandId = demand.getId();

		BigDecimal taxAmount = BigDecimal.ZERO;

		// Collecting the taxHead master codes with the isDebit field in a Map
		Map<String, Boolean> isTaxHeadDebitMap = mstrDataService.getTaxHeadMasterMap(requestInfoWrapper.getRequestInfo(), tenantId).stream()
				.collect(Collectors.toMap(TaxHeadMaster::getCode, TaxHeadMaster::getIsDebit));

		/*
		 * Summing the credit amount and Debit amount in to separate variables(based on the taxhead:isdebit map) to send to roundoffDecimal method
		 */

		BigDecimal totalRoundOffAmount = BigDecimal.ZERO;
		for (DemandDetail detail : demand.getDemandDetails()) {

			if(!detail.getTaxHeadMasterCode().equalsIgnoreCase(PT_ROUNDOFF)){
				taxAmount = taxAmount.add(detail.getTaxAmount());
			}
			else{
				totalRoundOffAmount = totalRoundOffAmount.add(detail.getTaxAmount());
			}
		}

		/*
		 *  An estimate object will be returned incase if there is a decimal value
		 *  
		 *  If no decimal value found null object will be returned 
		 */
		TaxHeadEstimate roundOffEstimate = payService.roundOffDecimals(taxAmount,totalRoundOffAmount);



		BigDecimal decimalRoundOff = null != roundOffEstimate
				? roundOffEstimate.getEstimateAmount() : BigDecimal.ZERO;

		if(decimalRoundOff.compareTo(BigDecimal.ZERO)!=0){
				details.add(DemandDetail.builder().taxAmount(roundOffEstimate.getEstimateAmount())
						.taxHeadMasterCode(roundOffEstimate.getTaxHeadCode()).demandId(demandId).tenantId(tenantId).build());
		}


	}


	/**
	 * Creates demandDetails for the new demand by adding all old demandDetails and then adding demandDetails
	 * using the difference between the new and old tax amounts for each taxHead
	 * @param tenantId The tenantId of the property
	 * @param calculation The calculation object for the property
	 * @param oldDemand The oldDemand against the property
	 * @return List of DemanDetails for the new demand
	 */
	private List<DemandDetail> getAdjustedDemandDetails(String tenantId,Calculation calculation,Demand oldDemand){

		List<DemandDetail> details = new ArrayList<>();

		/*Create map of taxHead to list of DemandDetail*/

		Map<String, List<DemandDetail>> taxHeadCodeDetailMap = new LinkedHashMap<>();
		if(oldDemand!=null){
			for(DemandDetail detail : oldDemand.getDemandDetails()){
				if(taxHeadCodeDetailMap.containsKey(detail.getTaxHeadMasterCode()))
					taxHeadCodeDetailMap.get(detail.getTaxHeadMasterCode()).add(detail);
				else {
					List<DemandDetail> detailList  = new LinkedList<>();
					detailList.add(detail);
					taxHeadCodeDetailMap.put(detail.getTaxHeadMasterCode(),detailList);
				}
			}
		}

		for (TaxHeadEstimate estimate : calculation.getTaxHeadEstimates()) {

			List<DemandDetail> detailList = taxHeadCodeDetailMap.get(estimate.getTaxHeadCode());
			taxHeadCodeDetailMap.remove(estimate.getTaxHeadCode());

			if (estimate.getTaxHeadCode().equalsIgnoreCase(CalculatorConstants.PT_ADVANCE_CARRYFORWARD))
				continue;

			if(!CollectionUtils.isEmpty(detailList)){
				details.addAll(detailList);
				BigDecimal amount= detailList.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

				details.add(DemandDetail.builder().taxHeadMasterCode(estimate.getTaxHeadCode())
						.taxAmount(estimate.getEstimateAmount().subtract(amount))
						.collectionAmount(BigDecimal.ZERO)
						.tenantId(tenantId).build());
			}
			else{
				details.add(DemandDetail.builder().taxHeadMasterCode(estimate.getTaxHeadCode())
						.taxAmount(estimate.getEstimateAmount())
						.collectionAmount(BigDecimal.ZERO)
						.tenantId(tenantId).build());
			}
		}

		/*
		* If some taxHeads are in old demand but not in new one a new demandetail
		*  is added for each taxhead to balance it out during apportioning
		* */

		for(Map.Entry<String, List<DemandDetail>> entry : taxHeadCodeDetailMap.entrySet()){
			List<DemandDetail> demandDetails = entry.getValue();
			BigDecimal taxAmount= demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal collectionAmount= demandDetails.stream().map(DemandDetail::getCollectionAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal netAmount = collectionAmount.subtract(taxAmount);
			if(demandDetails!=null && demandDetails.size()>0 && !demandDetails.get(0).getTaxHeadMasterCode().equalsIgnoreCase(PT_ROUNDOFF)) {
			details.add(DemandDetail.builder().taxHeadMasterCode(entry.getKey())
					.taxAmount(netAmount)
					.collectionAmount(BigDecimal.ZERO)
					.tenantId(tenantId).build());
		}else {
			details.add(DemandDetail.builder().taxHeadMasterCode(entry.getKey())
					.taxAmount(taxAmount)
					.collectionAmount(collectionAmount)
					.tenantId(tenantId).build());
		}
		}

		return details;
	}

	/**
	 * Updates the amount in the latest demandDetail by adding the diff between
	 * new and old amounts to it
	 * @param newAmount The new tax amount for the taxHead
	 * @param latestDetailInfo The latest demandDetail for the particular taxHead
	 */
	private void updateTaxAmount(BigDecimal newAmount,DemandDetailAndCollection latestDetailInfo){
		BigDecimal diff = newAmount.subtract(latestDetailInfo.getTaxAmountForTaxHead());
		BigDecimal newTaxAmountForLatestDemandDetail = latestDetailInfo.getLatestDemandDetail().getTaxAmount().add(diff);
		latestDetailInfo.getLatestDemandDetail().setTaxAmount(newTaxAmountForLatestDemandDetail);
	}

}
