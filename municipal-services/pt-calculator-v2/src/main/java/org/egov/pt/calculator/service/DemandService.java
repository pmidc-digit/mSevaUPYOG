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
import java.util.Calendar;
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

				applytimeBasedApplicables(demand, requestInfoWrapper, timeBasedExmeptionMasterMap,taxPeriods);

				JSONArray otsArray = (JSONArray) timeBasedExmeptionMasterMap.get(CalculatorConstants.OTS_MASTER);
				processOtsForDemand(demand, otsArray);

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
		
		if (oldTaxAmt.compareTo(newTax) > 0 && oldTaxAmt.subtract(newTax).abs().compareTo(BigDecimal.ONE) >= 0) {
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

		 long currentTimeMillis = System.currentTimeMillis();
	        Instant instant = Instant.ofEpochMilli(currentTimeMillis);
	        ZonedDateTime zdt = instant.atZone(ZoneId.systemDefault());
	        int month = zdt.getMonthValue();
		BigDecimal oldRebate = BigDecimal.ZERO;
		for(DemandDetail demandDetail : details) {
			if(demandDetail.getTaxHeadMasterCode().equalsIgnoreCase(PT_TIME_REBATE)){
				oldRebate = oldRebate.add(demandDetail.getTaxAmount());
				if (month>13) 
				{
				log.info("Rebate amount Before: "+oldRebate);
				demandDetail.setTaxAmount(BigDecimal.ZERO);
				isRebateUpdated=true;
				}
			}
		}
		
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

	private static final DateTimeFormatter OTS_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	/**
	 * Processes One Time Settlement (OTS) scheme evaluation and waivers for a demand.
	 *
	 * <p>Three cases are handled:
	 * <ul>
	 *   <li><b>No payment:</b> Apply OTS waveoffs normally if applicable, or reset if expired.</li>
	 *   <li><b>Partial payment:</b> Revoke OTS waveoffs by setting their taxAmount to zero.
	 *       The apportion service had settled the OTS heads (collectionAmount = -76, -493) during
	 *       payment distribution. Setting taxAmount=0 creates outstanding on those heads so the
	 *       citizen owes: remaining tax balance + revoked waveoff amounts (e.g. 87+76+493=656).</li>
	 *   <li><b>Full payment:</b> All non-OTS heads are settled; skip without touching OTS heads.</li>
	 * </ul>
	 * </p>
	 */
	private void processOtsForDemand(Demand demand, JSONArray otsArray) {
		if (CollectionUtils.isEmpty(otsArray)) {
			log.info("OTS configuration is empty. No wave-offs to apply for demand: {}", demand.getId());
			return;
		}

		// Sum outstanding balance on non-OTS heads (taxAmount - collectionAmount)
		BigDecimal nonOtsOutstanding = demand.getDemandDetails().stream()
				.filter(dd -> !CalculatorConstants.OTS_PENALTY_WAVEOFF.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_INTEREST_WAVEOFF.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_PENALTY_WAVEOFF_REMOVAL.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_INTEREST_WAVEOFF_REMOVAL.equals(dd.getTaxHeadMasterCode()))
				.map(dd -> {
					BigDecimal tax = dd.getTaxAmount() != null ? dd.getTaxAmount() : BigDecimal.ZERO;
					BigDecimal col = dd.getCollectionAmount() != null ? dd.getCollectionAmount() : BigDecimal.ZERO;
					return tax.subtract(col);
				})
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		boolean hasPaymentCollected = demand.getDemandDetails().stream()
				.filter(dd -> !CalculatorConstants.OTS_PENALTY_WAVEOFF.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_INTEREST_WAVEOFF.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_PENALTY_WAVEOFF_REMOVAL.equals(dd.getTaxHeadMasterCode())
						&& !CalculatorConstants.OTS_INTEREST_WAVEOFF_REMOVAL.equals(dd.getTaxHeadMasterCode()))
				.anyMatch(dd -> dd.getCollectionAmount() != null
						&& dd.getCollectionAmount().compareTo(BigDecimal.ZERO) > 0);

		if (hasPaymentCollected) {
			if (nonOtsOutstanding.compareTo(BigDecimal.ZERO) > 0) {
				// PARTIAL payment: non-OTS balance still remains (e.g. PT_TAX has 87 outstanding).
				// Revoke OTS waveoffs → citizen must pay back the waived amounts too.
				log.info("Partial payment detected on demand: {}. Non-OTS outstanding: {}. Revoking OTS waveoffs.",
						demand.getId(), nonOtsOutstanding);
				revokeOtsWaveoffs(demand);
			} else {
				// FULL payment: all non-OTS heads fully settled. OTS heads are correctly
				// settled by apportion (collectionAmount = taxAmount). No action needed.
				log.info("Full payment detected on demand: {}. OTS waveoffs already settled by apportion.", demand.getId());
			}
			return;
		}

		int demandFY = getFinancialYearStart(demand.getTaxPeriodFrom());
		String fyShort = demandFY + "-" + String.valueOf(demandFY + 1).substring(2);
		String fyLong  = demandFY + "-" + (demandFY + 1);
		String demandTenantId = demand.getTenantId();

		boolean otsApplied = false;

		for (Object item : otsArray) {
			if (!(item instanceof Map)) continue;
			@SuppressWarnings("unchecked")
			Map<String, Object> otsMap = (Map<String, Object>) item;

			if (isOtsApplicable(otsMap, demandTenantId, fyShort, fyLong)) {
				BigDecimal interestRate = parseBigDecimal(otsMap.get("interestRatePercent"));
				BigDecimal penaltyRate  = parseBigDecimal(otsMap.get("penaltyRatePercent"));

				log.info("OTS is Enabled and Applicable for Tenant: {}, FY: {} (Interest Waiver: {}%, Penalty Waiver: {}%)",
						demandTenantId, fyShort, interestRate, penaltyRate);

				otsEnabled(demand, interestRate, penaltyRate);
				otsApplied = true;
				break;
			}
		}

		if (!otsApplied) {
			resetExpiredOtsWaveoffs(demand, demandFY);
		}
	}

	/**
	 * Revokes OTS waveoffs after a partial payment by adding positive REMOVAL demand details.
	 *
	 * <p>Instead of mutating the original waveoff entries (which destroys audit trail),
	 * this method adds new demand details with positive amounts that cancel out the waveoffs:
	 * <pre>
	 *   OTS_PENALTY_WAVEOFF:          taxAmt=-76,  col=-76  → untouched
	 *   OTS_PENALTY_WAVEOFF_REMOVAL:  taxAmt=+76,  col=0    → NEW (outstanding=+76)
	 * </pre>
	 * Net effect: waveoff is nullified, citizen owes the original penalty/interest amounts.</p>
	 *
	 * <p>This method is idempotent: if REMOVAL heads already exist, their amounts are updated
	 * rather than adding duplicates.</p>
	 */
	private void revokeOtsWaveoffs(Demand demand) {
		List<DemandDetail> details = demand.getDemandDetails();
		String demandId = demand.getId();
		String tenantId = demand.getTenantId();

		BigDecimal penaltyWaveoffAmt = BigDecimal.ZERO;
		BigDecimal interestWaveoffAmt = BigDecimal.ZERO;
		DemandDetail existingPenaltyRemoval = null;
		DemandDetail existingInterestRemoval = null;

		for (DemandDetail detail : details) {
			String taxHead = detail.getTaxHeadMasterCode();
			if (CalculatorConstants.OTS_PENALTY_WAVEOFF.equals(taxHead) && detail.getTaxAmount() != null) {
				penaltyWaveoffAmt = penaltyWaveoffAmt.add(detail.getTaxAmount()); // negative value
			} else if (CalculatorConstants.OTS_INTEREST_WAVEOFF.equals(taxHead) && detail.getTaxAmount() != null) {
				interestWaveoffAmt = interestWaveoffAmt.add(detail.getTaxAmount()); // negative value
			} else if (CalculatorConstants.OTS_PENALTY_WAVEOFF_REMOVAL.equals(taxHead)) {
				existingPenaltyRemoval = detail;
			} else if (CalculatorConstants.OTS_INTEREST_WAVEOFF_REMOVAL.equals(taxHead)) {
				existingInterestRemoval = detail;
			}
		}

		// Add/update PENALTY REMOVAL head (positive amount to cancel the negative waveoff)
		if (penaltyWaveoffAmt.compareTo(BigDecimal.ZERO) < 0) {
			BigDecimal removalAmt = penaltyWaveoffAmt.abs();
			if (existingPenaltyRemoval != null) {
				existingPenaltyRemoval.setTaxAmount(removalAmt);
			} else {
				details.add(DemandDetail.builder()
						.taxAmount(removalAmt)
						.taxHeadMasterCode(CalculatorConstants.OTS_PENALTY_WAVEOFF_REMOVAL)
						.demandId(demandId)
						.tenantId(tenantId)
						.build());
			}
			log.info("Partial payment → Added OTS_PENALTY_WAVEOFF_REMOVAL: +{} for demand: {}", removalAmt, demandId);
		}

		// Add/update INTEREST REMOVAL head (positive amount to cancel the negative waveoff)
		if (interestWaveoffAmt.compareTo(BigDecimal.ZERO) < 0) {
			BigDecimal removalAmt = interestWaveoffAmt.abs();
			if (existingInterestRemoval != null) {
				existingInterestRemoval.setTaxAmount(removalAmt);
			} else {
				details.add(DemandDetail.builder()
						.taxAmount(removalAmt)
						.taxHeadMasterCode(CalculatorConstants.OTS_INTEREST_WAVEOFF_REMOVAL)
						.demandId(demandId)
						.tenantId(tenantId)
						.build());
			}
			log.info("Partial payment → Added OTS_INTEREST_WAVEOFF_REMOVAL: +{} for demand: {}", removalAmt, demandId);
		}
	}

	/**
	 * Validates whether an OTS rule is enabled, matches the tenant and demand financial year, and is within active dates.
	 */
	private boolean isOtsApplicable(Map<String, Object> otsMap, String demandTenantId, String fyShort, String fyLong) {
		boolean isEnabled = Boolean.parseBoolean(String.valueOf(otsMap.get("isOTSEnabled")));
		if (!isEnabled) return false;

		// Tenant-specific array matching ("tenantId": ["pb.ludhiana", "pb.amritsar"] or "tenantsApplicable")
		Object tenantIdObj = otsMap.get("tenantId");
		if (tenantIdObj == null) {
			tenantIdObj = otsMap.get("tenantsApplicable");
		}

		if (tenantIdObj instanceof List) {
			List<?> tenantList = (List<?>) tenantIdObj;
			if (!tenantList.isEmpty()) {
				boolean tenantMatches = tenantList.stream()
						.filter(t -> t != null)
						.map(Object::toString)
						.anyMatch(t -> t.equalsIgnoreCase(demandTenantId) || demandTenantId.startsWith(t + "."));
				if (!tenantMatches) {
					return false;
				}
			}
		} else if (tenantIdObj instanceof String && !((String) tenantIdObj).trim().isEmpty()) {
			String ruleTenant = ((String) tenantIdObj).trim();
			if (!ruleTenant.equalsIgnoreCase(demandTenantId) && !demandTenantId.startsWith(ruleTenant + ".")) {
				return false;
			}
		}

		Object fyObj = otsMap.get("financialYearsApplicable");
		if (fyObj == null) return false;

		String fyApplicable = fyObj.toString();
		boolean fyMatches = fyApplicable.equals(fyShort) || fyApplicable.equals(fyLong);
		if (!fyMatches) return false;

		Object endDateObj = otsMap.get("OTSEndDate");
		if (endDateObj == null) return false;

		try {
			LocalDate localDate = LocalDate.parse(endDateObj.toString(), OTS_DATE_FORMATTER);
			long otsEndEpoch = localDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
			return otsEndEpoch >= System.currentTimeMillis();
		} catch (Exception e) {
			log.error("Error parsing OTS end date: {}", endDateObj, e);
			return false;
		}
	}

	/**
	 * Resets OTS wave-offs to zero when OTS has expired or is not applicable, provided zero collection has occurred.
	 */
	private void resetExpiredOtsWaveoffs(Demand demand, int demandFY) {
		Map<String, BigDecimal> penaltyAndInterestCollected = demand.getDemandDetails().stream()
				.filter(d -> CalculatorConstants.PT_TIME_PENALTY.equals(d.getTaxHeadMasterCode()) 
						  || CalculatorConstants.PT_TIME_INTEREST.equals(d.getTaxHeadMasterCode()))
				.collect(Collectors.groupingBy(
						DemandDetail::getTaxHeadMasterCode,
						Collectors.mapping(DemandDetail::getCollectionAmount,
								Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
				));

		BigDecimal penaltyCollected  = penaltyAndInterestCollected.getOrDefault(CalculatorConstants.PT_TIME_PENALTY, BigDecimal.ZERO);
		BigDecimal interestCollected = penaltyAndInterestCollected.getOrDefault(CalculatorConstants.PT_TIME_INTEREST, BigDecimal.ZERO);

		demand.getDemandDetails().forEach(detail -> {
			String taxHead = detail.getTaxHeadMasterCode();

			if (CalculatorConstants.OTS_PENALTY_WAVEOFF.equals(taxHead) && penaltyCollected.compareTo(BigDecimal.ZERO) == 0) {
				detail.setTaxAmount(BigDecimal.ZERO);
				log.info("OTS expired -> Reset OTS penalty wave-off to 0 for demand FY: {}", demandFY);
			}

			if (CalculatorConstants.OTS_INTEREST_WAVEOFF.equals(taxHead) && interestCollected.compareTo(BigDecimal.ZERO) == 0) {
				detail.setTaxAmount(BigDecimal.ZERO);
				log.info("OTS expired -> Reset OTS interest wave-off to 0 for demand FY: {}", demandFY);
			}
		});

		log.info("No valid OTS for demand FY: {}. Cleared OTS wave-offs where collected amount is 0.", demandFY);
	}

	private BigDecimal parseBigDecimal(Object val) {
		if (val == null) return BigDecimal.ZERO;
		try {
			return new BigDecimal(val.toString());
		} catch (Exception e) {
			return BigDecimal.ZERO;
		}
	}

	/**
	 * Resolves the starting financial year (e.g. 2024 for FY 2024-25) from tax period epoch milliseconds.
	 */
	private int getFinancialYearStart(Long epochMillis) {
		if (epochMillis == null) return Calendar.getInstance().get(Calendar.YEAR);
		Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
		cal.setTimeInMillis(epochMillis);
		int year = cal.get(Calendar.YEAR);
		int month = cal.get(Calendar.MONTH); // April = 3 (0-indexed)
		return (month >= Calendar.APRIL) ? year : year - 1;
	}

	/**
	 * Calculates and applies OTS (One Time Settlement) penalty and interest wave-offs on demand details.
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

		if (existingPenaltyWaveoff != null) {
			if (unpaidPenalty.compareTo(BigDecimal.ZERO) > 0 && penaltyWaveoff.compareTo(BigDecimal.ZERO) > 0) {
				existingPenaltyWaveoff.setTaxAmount(penaltyWaveoff.negate());
			} else {
				existingPenaltyWaveoff.setTaxAmount(BigDecimal.ZERO);
			}
		} else if (unpaidPenalty.compareTo(BigDecimal.ZERO) > 0 && penaltyWaveoff.compareTo(BigDecimal.ZERO) > 0) {
			details.add(DemandDetail.builder()
					.taxAmount(penaltyWaveoff.negate())
					.taxHeadMasterCode(CalculatorConstants.OTS_PENALTY_WAVEOFF)
					.demandId(demandId)
					.tenantId(tenantId)
					.build());
		}

		if (existingInterestWaveoff != null) {
			if (unpaidInterest.compareTo(BigDecimal.ZERO) > 0 && interestWaveoff.compareTo(BigDecimal.ZERO) > 0) {
				existingInterestWaveoff.setTaxAmount(interestWaveoff.negate());
			} else {
				existingInterestWaveoff.setTaxAmount(BigDecimal.ZERO);
			}
		} else if (unpaidInterest.compareTo(BigDecimal.ZERO) > 0 && interestWaveoff.compareTo(BigDecimal.ZERO) > 0) {
			details.add(DemandDetail.builder()
					.taxAmount(interestWaveoff.negate())
					.taxHeadMasterCode(CalculatorConstants.OTS_INTEREST_WAVEOFF)
					.demandId(demandId)
					.tenantId(tenantId)
					.build());
		}

		return true;
	}

}
