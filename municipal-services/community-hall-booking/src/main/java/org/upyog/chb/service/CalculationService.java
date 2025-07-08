package org.upyog.chb.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.chb.config.CommunityHallBookingConfiguration;
import org.upyog.chb.constants.CommunityHallBookingConstants;
import org.upyog.chb.util.CalculationTypeCache;
import org.upyog.chb.util.MdmsUtil;
import org.upyog.chb.web.models.BookingSlotDetail;
import org.upyog.chb.web.models.CalculationType;
import org.upyog.chb.web.models.CommunityHallBookingRequest;
import org.upyog.chb.web.models.billing.DemandDetail;
import org.upyog.chb.web.models.billing.TaxHeadMaster;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CalculationService {
	
	@Autowired
	private MdmsUtil mdmsUtil;
	
	@Autowired
	private CalculationTypeCache calculationTypeCache;
	
	@Autowired
	private CommunityHallBookingConfiguration config;

	/**
	 * @param bookingRequest
	 * @return
	 */
	public List<DemandDetail> calculateDemand(CommunityHallBookingRequest bookingRequest) {

		String tenantId = bookingRequest.getHallsBookingApplication().getTenantId().split("\\.")[0];
		
		List<TaxHeadMaster> headMasters = mdmsUtil.getTaxHeadMasterList(bookingRequest.getRequestInfo(), tenantId , CommunityHallBookingConstants.BILLING_SERVICE);
		
		List<CalculationType> calculationTypes = calculationTypeCache.getcalculationType(bookingRequest.getRequestInfo(), tenantId , config.getModuleName(), bookingRequest.getHallsBookingApplication());

		log.info("Retrieved calculation types: {}", calculationTypes);

		List<DemandDetail> demandDetails = processCalculationForDemandGeneration(tenantId, calculationTypes,
				bookingRequest, headMasters);

		return demandDetails;

	}

	private List<DemandDetail> processCalculationForDemandGeneration(String tenantId,
			List<CalculationType> calculationTypes, CommunityHallBookingRequest bookingRequest, List<TaxHeadMaster> headMasters) {

		Map<String, Long> hallCodeBookingDaysMap = bookingRequest.getHallsBookingApplication().getBookingSlotDetails()
				.stream().collect(Collectors.groupingBy(BookingSlotDetail::getHallCode, Collectors.counting()));
		
		//Demand will be generated using billing service for booking
		final List<DemandDetail> demandDetails = new LinkedList<>();
		
        List<String> taxHeadCodes = headMasters.stream().map(head -> head.getCode()).collect(Collectors.toList());
		
		log.info("tax head codes  : " + taxHeadCodes);

		//Demand for which tax is applicable is stored
		List<CalculationType> taxableFeeType = new ArrayList<>();
		
		BigDecimal hallCodeBookingDays = new BigDecimal(hallCodeBookingDaysMap.get(bookingRequest.getHallsBookingApplication().getBookingSlotDetails().get(0).getHallCode()));
		
		//We have two type of fee 1.taxable(Booking fee, electricity fee etc) and 2.fixed( Security deposit)
		for (CalculationType type : calculationTypes) {
			if (taxHeadCodes.contains(type.getFeeType())) {
				if (type.isTaxApplicable()) {
					//Add taxable fee 
					taxableFeeType.add(type);
				} else {
					DemandDetail data =  DemandDetail.builder().taxAmount(type.getAmount())
					.taxHeadMasterCode(type.getFeeType()).tenantId(tenantId).build();
					//Add fixed fee for which tax is not applicable like security deposit
					demandDetails.add(data);
				}
			}
		}
		
		log.info("taxable fee type : " + taxableFeeType);

		//Calculating taxable demand as per no of days for taxable fee
		List<DemandDetail> taxableDemands = taxableFeeType.stream().map(data ->
		// log.info("data :" + data);
		DemandDetail.builder().taxAmount(data.getAmount().multiply(hallCodeBookingDays))
				.taxHeadMasterCode(data.getFeeType()).tenantId(tenantId).build()).collect(Collectors.toList());
		
		log.info("taxableDemands : " + taxableDemands);
		
		//Adding taxable demands to demand details
		demandDetails.addAll(taxableDemands);
		
		BigDecimal totalTaxableAmount = taxableDemands.stream()
				.map(DemandDetail::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

		log.info("Total Taxable amount for the booking : " + totalTaxableAmount);
		
		calculateTaxDemands(bookingRequest, tenantId, demandDetails, totalTaxableAmount);

		return demandDetails;
	}
	
	private void calculateTaxDemands(CommunityHallBookingRequest bookingRequest, String tenantId,
			List<DemandDetail> demandDetails, BigDecimal totalTaxableAmount) {
		List<CalculationType> taxRates = mdmsUtil.getTaxRatesMasterList(bookingRequest.getRequestInfo(), tenantId,
				config.getModuleName(), bookingRequest.getHallsBookingApplication());
		taxRates.stream().forEach(tax -> {
			DemandDetail demandDetail = DemandDetail.builder()
					.taxAmount(calculateAmount(totalTaxableAmount, tax.getAmount())).taxHeadMasterCode(tax.getFeeType())
					.tenantId(tenantId).build();
			demandDetails.add(demandDetail);
		});
	}

	//Tax is in percentage
	private BigDecimal calculateAmount(BigDecimal amount, BigDecimal tax) {
		return amount.multiply(tax).divide(CommunityHallBookingConstants.ONE_HUNDRED, RoundingMode.FLOOR);
	}

}
