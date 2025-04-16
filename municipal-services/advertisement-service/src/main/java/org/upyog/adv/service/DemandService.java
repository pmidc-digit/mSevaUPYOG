package org.upyog.adv.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.egov.common.contract.request.User;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.adv.config.BookingConfiguration;
import org.upyog.adv.constants.BookingConstants;
import org.upyog.adv.repository.DemandRepository;
import org.upyog.adv.util.BookingUtil;
import org.upyog.adv.util.MdmsUtil;
import org.upyog.adv.validator.BookingValidator;
import org.upyog.adv.web.models.AdvertisementDemandEstimationCriteria;
import org.upyog.adv.web.models.BookingDetail;
import org.upyog.adv.web.models.BookingRequest;
import org.upyog.adv.web.models.billing.Demand;
import org.upyog.adv.web.models.billing.DemandDetail;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DemandService {

	@Autowired
	private BookingConfiguration config;
	
	@Autowired
	private CalculationService calculationService;

	@Autowired
	private DemandRepository demandRepository;
	
	@Autowired
	private BookingValidator bookingValidator;

	@Autowired
	private MdmsUtil mdmsUtil;
	
	
	/**
	 * 1. Fetch tax heads from mdms tax-heads.json 2. Map amount to tax heads from
	 * CalculateType.json 3. Create XDemand for particular tax heads 4. Bill will be
	 * automatically generated when fetch bill api is called for demand created by
	 * this API
	 * 
	 * @param bookingRequest
	 * @return
	 */

	public List<Demand> createDemand(BookingRequest bookingRequest, Object mdmsData, boolean generateDemand) {
		String tenantId = bookingRequest.getBookingApplication().getTenantId();
		// String consumerCode = "ADV-8e9d3352-1014-4ed2-97c0-24454ced19c1";
		String consumerCode = bookingRequest.getBookingApplication().getBookingNo();
		BookingDetail bookingDetail = bookingRequest.getBookingApplication();
		User user = bookingRequest.getRequestInfo().getUserInfo();

		User owner = User.builder().name(user.getName()).emailId(user.getEmailId()).mobileNumber(user.getMobileNumber())
				.build();

		Map<String, Object> mdmsDataMap = (Map<String, Object>) mdmsData;

		
		List<Map<String, Object>> taxRateList = (List<Map<String, Object>>) ((Map<String, Object>) ((Map<String, Object>) mdmsDataMap
				.get("MdmsRes")).get("Advertisement")).get("TaxAmount");
		List<String> taxRateCodes = taxRateList.stream().map(tax -> (String) tax.get("feeType")) 
																								
				.collect(Collectors.toList());

		List<DemandDetail> demandDetails = calculationService.calculateDemand(bookingRequest, taxRateCodes);

		LocalDate maxdate = getMaxBookingDate(bookingDetail);

		
		Demand demand = Demand.builder().consumerCode(consumerCode)
				 .demandDetails(demandDetails).payer(owner)
				 .tenantId(tenantId)
				.taxPeriodFrom(BookingUtil.getCurrentTimestamp()).taxPeriodTo(BookingUtil.minusOneDay(maxdate))
				.consumerType(config.getModuleName()).businessService(config.getBusinessServiceName()).additionalDetails(null).build();

		List<Demand> demands = new ArrayList<>();
		demands.add(demand);
		if (!generateDemand) {
			BigDecimal totalAmount = demandDetails.stream().map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO,
					BigDecimal::add);
			demand.setAdditionalDetails(totalAmount);
			return demands;
		}
		log.info("Sending call to billing service for generating demand for booking no : " + consumerCode);
		return demandRepository.saveDemand(bookingRequest.getRequestInfo(), demands);
	}
	
	
	//This gets the demand for request without getting booking number by calling teh create demand method
	public List<Demand> getDemand(AdvertisementDemandEstimationCriteria estimationCriteria){
		log.info("Getting demand for request without booking no");

		
		String tenantId = estimationCriteria.getTenantId().split("\\.")[0];
		if (estimationCriteria.getTenantId().split("\\.").length == 1) {
			throw new CustomException(BookingConstants.INVALID_TENANT, "Please provide valid tenant id for booking creation");
		}
		BookingDetail bookingDetail = BookingDetail.builder().tenantId(tenantId)
				.CartDetails(estimationCriteria.getCartDetails())
				.build();
		BookingRequest bookingRequest = BookingRequest.builder().bookingApplication(bookingDetail)
				.requestInfo(estimationCriteria.getRequestInfo()).build();
		Object mdmsData = mdmsUtil.mDMSCall(bookingRequest.getRequestInfo(), tenantId);
		List<Demand> demands = createDemand(bookingRequest, mdmsData, false);
		return demands;
	}
	
	private LocalDate getMaxBookingDate(BookingDetail bookingDetail) {
		
		return bookingDetail.getCartDetails().stream().map(detail -> detail.getBookingDate())
				.max( LocalDate :: compareTo)
		        .get();
	}
	
	
	

}
