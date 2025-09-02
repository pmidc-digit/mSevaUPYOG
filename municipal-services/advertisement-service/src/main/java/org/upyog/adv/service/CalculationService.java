package org.upyog.adv.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.adv.config.BookingConfiguration;
import org.upyog.adv.constants.BookingConstants;
import org.upyog.adv.util.MdmsUtil;
import org.upyog.adv.web.models.*;

import org.upyog.adv.web.models.billing.DemandDetail;
import org.upyog.adv.web.models.billing.TaxHeadMaster;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CalculationService {
	
	@Autowired
	private MdmsUtil mdmsUtil;
	@Autowired
	private BookingConfiguration config;

	/**
	 * @param bookingRequest
	 * @param mdmsData
	 * @return
	 */
	// Returns Demand detail: 
	//Gets the headMasters from the billing service and calculation type from mdms
	//Calls processCalculationForDemandGeneration to get the demand detail
	public List<DemandDetail> calculateDemand(BookingRequest bookingRequest, List<String> taxRateCodes, Object mdmsData) throws JsonProcessingException {

		String tenantId = bookingRequest.getBookingApplication().getTenantId().split("\\.")[0];
		Map<String, Object> mdmsDataMap = (Map<String, Object>) mdmsData;


		List<Map<String, Object>> taxRateList = (List<Map<String, Object>>) ((Map<String, Object>) ((Map<String, Object>) mdmsDataMap
				.get("MdmsRes")).get("Advertisement")).get("TaxAmount");

	List<TaxHeadMaster> headMasters = mdmsUtil.getTaxHeadMasterList(bookingRequest.getRequestInfo(), tenantId , BookingConstants.BILLING_SERVICE);

		List<Advertisements> calculationTypes = mdmsUtil.getAdvertisements(bookingRequest.getRequestInfo(), tenantId , config.getModuleName(), bookingRequest.getBookingApplication().getCartDetails().get(0) );



		log.info("calculationTypes " + calculationTypes);

		List<DemandDetail> demandDetails = processCalculationForDemandGeneration(tenantId, calculationTypes,
				bookingRequest, headMasters, taxRateCodes, taxRateList);

		return demandDetails;

	}


	private List<DemandDetail> processCalculationForDemandGeneration(String tenantId,
                                                                     List<Advertisements> advertisements, BookingRequest bookingRequest, List<TaxHeadMaster> headMasters, List<String> taxRateCodes, Object taxRateList) {

		Map<String, Long> advBookingDaysMap = bookingRequest.getBookingApplication().getCartDetails()
				.stream().collect(Collectors.groupingBy(CartDetail::getAddType, Collectors.counting()));

		final List<DemandDetail> demandDetails = new LinkedList<>();
		
        List<String> taxHeadCodes = headMasters.stream().map(head -> head.getCode()).collect(Collectors.toList());
		
		log.info("tax head codes  : " + taxHeadCodes);

		//Demand for which tax is applicable is stored
		List<Advertisements> taxableFeeType = new ArrayList<>();

		CartDetail cartDetail = bookingRequest.getBookingApplication().getCartDetails().get(0);
		BigDecimal advBookingDays = new BigDecimal(advBookingDaysMap.get(cartDetail.getAddType()));


//		BigDecimal advBookingDays = new BigDecimal(advBookingDaysMap.get(bookingRequest.getBookingApplication().getCartDetails().get(0).getAddType()));
		String advertisementId = cartDetail.getAdvertisementId();

		for (Advertisements type : advertisements) {
			if (taxHeadCodes.contains(type.getFeeType()) && type.getId().equals(Integer.parseInt(advertisementId))) {
				if (type.isTaxApplicable()) {
					//Add taxable fee
					taxableFeeType.add(type);
				} else if (!taxRateCodes.contains(type.getFeeType())) {
					DemandDetail data =  DemandDetail.builder().taxAmount(type.getAmount())
							.taxHeadMasterCode(type.getFeeType()).tenantId(tenantId).build();
					//Add fixed fee for which tax is not applicable
					demandDetails.add(data);
				}
			}
		}



		
		log.info("taxable fee type : " + taxableFeeType);

		List<DemandDetail> taxableDemands = taxableFeeType.stream().map(data ->
		
		DemandDetail.builder().taxAmount(data.getAmount().multiply(advBookingDays))
				.taxHeadMasterCode(data.getFeeType()).tenantId(tenantId).build()).collect(Collectors.toList());
		
		log.info("taxableDemands : " + taxableDemands);
		
		BigDecimal totalTaxableAmount = taxableDemands.stream()
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		demandDetails.addAll(taxableDemands);

		log.info("Total Taxable amount for the booking : " + totalTaxableAmount);

		List<Map<String, Object>> taxRateListMap = (List<Map<String, Object>>)taxRateList;


		taxRateListMap.forEach(rateMap -> {
			// Extract values from map
			String feeType = (String) rateMap.get("feeType");
			BigDecimal rate = new BigDecimal(rateMap.get("rate").toString());

			// Calculate tax amount
			BigDecimal taxAmount = calculateAmount(totalTaxableAmount, rate);

			// Build DemandDetail object
			DemandDetail demandDetail = DemandDetail.builder()
					.taxAmount(taxAmount)
					.taxHeadMasterCode(feeType) // use feeType here
					.tenantId(tenantId)         // pass tenantId
					.build();

			demandDetails.add(demandDetail);
		});



		return demandDetails;
	}

	private BigDecimal calculateAmount(BigDecimal base, BigDecimal pct) {
		return base.multiply(pct).divide(BookingConstants.ONE_HUNDRED, RoundingMode.FLOOR);
	}

}
