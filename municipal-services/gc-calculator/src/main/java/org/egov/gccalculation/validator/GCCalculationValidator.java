package org.egov.gccalculation.validator;

import lombok.extern.slf4j.Slf4j;

import org.egov.gccalculation.constants.GCCalculationConstant;
import org.egov.tracer.model.CustomException;
import org.egov.gccalculation.repository.GCCalculationDao;
import org.egov.gccalculation.service.MasterDataService;
import org.egov.gccalculation.util.CalculatorUtil;
import org.egov.gccalculation.web.models.MeterConnectionRequest;
import org.egov.gccalculation.web.models.MeterReading;
import org.egov.gccalculation.web.models.MeterReadingSearchCriteria;
import org.egov.gccalculation.web.models.WaterConnection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Component
@Slf4j
public class GCCalculationValidator {

	@Autowired
	private GCCalculationDao wSCalculationDao;
	
	@Autowired
	private CalculatorUtil calculationUtil;
	
	@Autowired
	private MasterDataService masterDataService;

	/**
	 * 
	 * @param meterreq
	 *            meterReadingConnectionRequest is request for create or update
	 *            meter reading connection
	 * @param isUpdate
	 *            True for create
	 */
	public void validateMeterReading(MeterConnectionRequest meterConnectionRequest, boolean isUpdate) {
		MeterReading meterReading = meterConnectionRequest.getMeterReading();
		Map<String, String> errorMap = new HashMap<>();

		// Future Billing Period Check
		validateBillingPeriod(meterReading.getBillingPeriod());
  
		List<WaterConnection> waterConnectionList = calculationUtil.getWaterConnection(meterConnectionRequest.getRequestInfo(),
				meterReading.getConnectionNo(), meterConnectionRequest.getMeterReading().getTenantId());
		WaterConnection connection = null;
		if(waterConnectionList != null){
			int size = waterConnectionList.size();
			connection = waterConnectionList.get(size-1);
		}

		if (meterConnectionRequest.getMeterReading().getGenerateDemand() && connection == null) {
			errorMap.put("INVALID_METER_READING_CONNECTION_NUMBER", "Invalid water connection number");
		}
		if (connection != null
				&& !GCCalculationConstant.meteredConnectionType.equalsIgnoreCase(connection.getConnectionType())) {
			errorMap.put("INVALID_WATER_CONNECTION_TYPE",
					"Meter reading can not be create for : " + connection.getConnectionType() + " connection");
		}
		Set<String> connectionNos = new HashSet<>();
		connectionNos.add(meterReading.getConnectionNo());
		MeterReadingSearchCriteria criteria = MeterReadingSearchCriteria.builder().
				connectionNos(connectionNos).tenantId(meterReading.getTenantId()).build();
		List<MeterReading> previousMeterReading =null;
		List<Map<String, Object>>  isAnythingPaid=null;
		boolean activeWithPayment = false;

		BigDecimal amountPaid=BigDecimal.ZERO;
		if(isUpdate) { 
			
			previousMeterReading=wSCalculationDao.searchCurrentMeterReadingsforUpdate(criteria);
			log.info("Previous Meter Reading is "+previousMeterReading);
			  isAnythingPaid = wSCalculationDao.getCollection(
			            criteria.getTenantId(),
			            meterConnectionRequest.getMeterReading().getLastReadingDate(),
			            meterConnectionRequest.getMeterReading().getCurrentReadingDate(),
			            meterConnectionRequest.getMeterReading().getConnectionNo()
			    );
			if (isAnythingPaid != null && !isAnythingPaid.isEmpty()) {
		        for (Map<String, Object> row : isAnythingPaid) {
		            String status = (String) row.get("status");
		            BigDecimal collected = row.get("amountCollected") != null
		                    ? (BigDecimal) row.get("amountCollected")
		                    : BigDecimal.ZERO;

		            if ("ACTIVE".equalsIgnoreCase(status) && collected.compareTo(BigDecimal.ZERO) > 0) {
		                activeWithPayment = true;
		                amountPaid = collected;
		                break; // no need to check further
		            }
		        }
		    }
			}
		else
			previousMeterReading=wSCalculationDao.searchCurrentMeterReadings(criteria);
		
		if (!CollectionUtils.isEmpty(previousMeterReading)) {
			Double currentMeterReading = previousMeterReading.get(0).getCurrentReading();
			if (meterReading.getCurrentReading() < currentMeterReading) {
				errorMap.put("INVALID_METER_READING_CONNECTION_NUMBER",
						"Current meter reading has to be greater than the past last readings in the meter reading!");
			}
		}

		if (meterReading.getCurrentReading() < meterReading.getLastReading()) {
			errorMap.put("INVALID_METER_READING_LAST_READING",
					"Current Meter Reading cannot be less than last meter reading");
		}

		if (StringUtils.isEmpty(meterReading.getMeterStatus())) {
			errorMap.put("INVALID_METER_READING_STATUS", "Meter status can not be null");
		}

		if (activeWithPayment) {
		    errorMap.put("PAYMENT_ALREADY_DONE", 
		        "Some Collection Amount Already Taken (Amount = " + amountPaid + ")");
		}
		if (isUpdate && (meterReading.getCurrentReading() == null)) {
			errorMap.put("INVALID_CURRENT_METER_READING",
					"Current Meter Reading cannot be update without current meter reading");
		}

		if (isUpdate && !StringUtils.isEmpty(meterReading.getId())) {
			int n = wSCalculationDao.isMeterReadingConnectionExist(Arrays.asList(meterReading.getId()));
			if (n > 0) {
				errorMap.put("INVALID_METER_READING_CONNECTION", "Meter reading Id already present");
			}
		}
		if (StringUtils.isEmpty(meterReading.getBillingPeriod())) {
			errorMap.put("INVALID_BILLING_PERIOD", "Meter Reading cannot be updated without billing period");
		}
		 
		if(!isUpdate) {
		int billingPeriodNumber = wSCalculationDao.isBillingPeriodExists(meterReading.getConnectionNo(),
				meterReading.getBillingPeriod() );
		if (billingPeriodNumber > 0)
			errorMap.put("INVALID_METER_READING_BILLING_PERIOD", "Billing Period Already Exists");
		}
		if (!errorMap.isEmpty()) {
			throw new CustomException(errorMap);
		}
	}
	
	
  
    
	/**
	 * Billing Period Validation
	 */
	private void validateBillingPeriod(String billingPeriod) {
		if (StringUtils.isEmpty(billingPeriod))
			 throw new CustomException("BILLING_PERIOD_PARSING_ISSUE", "Billing can not empty!!");
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
			ZoneId defaultZoneId = ZoneId.systemDefault();
			Date billingDate = sdf.parse(billingPeriod.split("-")[1].trim());
			Instant instant = billingDate.toInstant();
			LocalDate billingLocalDate = instant.atZone(defaultZoneId).toLocalDate();
			LocalDate localDateTime = LocalDate.now();
			if ((billingLocalDate.getYear() == localDateTime.getYear())
					&& (billingLocalDate.getMonthValue() > localDateTime.getMonthValue())) {
				throw new CustomException("BILLING_PERIOD_ISSUE", "Billing period can not be in future!!");
			}
			if ((billingLocalDate.getYear() > localDateTime.getYear())) {
				throw new CustomException("BILLING_PERIOD_ISSUE", "Billing period can not be in future!!");
			}

		} catch (CustomException | ParseException ex) {
			log.error("", ex);
			if (ex instanceof CustomException)
				throw new CustomException("BILLING_PERIOD_ISSUE", "Billing period can not be in future!!");
			throw new CustomException("BILLING_PERIOD_PARSING_ISSUE", "Billing period can not parsed!!");
		}
	}
}
