package org.egov.garbagecollection.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;

import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.garbagecollection.web.models.MeterConnectionRequest;
import org.egov.garbagecollection.web.models.MeterReading;
import org.egov.garbagecollection.web.models.MeterReadingResponse;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MeterReadingService {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private GcServicesUtil gcServicesUtil;
	
	@SuppressWarnings("unchecked")
	public void process(GarbageConnectionRequest request, String topic) {
		try {
			BigDecimal initialMeterReading = BigDecimal.ZERO;
			if (!StringUtils.isEmpty(request.getGarbageConnection().getAdditionalDetails())) {
				HashMap<String, Object> addDetail = mapper
						.convertValue(request.getGarbageConnection().getAdditionalDetails(), HashMap.class);
				if (addDetail.getOrDefault(GCConstants.INITIAL_METER_READING_CONST, null) != null) {
					initialMeterReading = new BigDecimal(
							String.valueOf(addDetail.get(GCConstants.INITIAL_METER_READING_CONST)));
					MeterConnectionRequest req = MeterConnectionRequest.builder().meterReading(MeterReading.builder()
							.connectionNo(request.getGarbageConnection().getConnectionNo())
							.currentReading(initialMeterReading.doubleValue())
							.currentReadingDate(request.getGarbageConnection().getConnectionExecutionDate().longValue())
							.tenantId(request.getGarbageConnection().getTenantId())
							.meterStatus(MeterReading.MeterStatusEnum.WORKING)
							.billingPeriod(getBillingPeriod(
									request.getGarbageConnection().getConnectionExecutionDate().longValue()))
							.generateDemand(Boolean.FALSE).lastReading(initialMeterReading.doubleValue())
							.lastReadingDate(request.getGarbageConnection().getConnectionExecutionDate().longValue())
							.build()).requestInfo(request.getRequestInfo()).build();
					log.info("MeterConnectionRequest::::"+ req);
//					Object response = serviceRequestRepository.fetchResult(gcServicesUtil.getMeterReadingCreateURL(),
//							req);
//					MeterReadingResponse readingResponse = mapper.convertValue(response, MeterReadingResponse.class);
//					log.info("MeterReading Response ::::"+mapper.writeValueAsString(readingResponse));
				}
			} else {
				log.info("Intial Meter Reading Not Present!!");
			}
		} catch (Exception ex) {
			log.error("Error while creating meter reading!!!", ex);
		}
	}

	private String getBillingPeriod(Long connectionExecutionDate) {
		int noLength = (int) (Math.log10(connectionExecutionDate) + 1);
		LocalDate currentDate = Instant
				.ofEpochMilli(noLength > 10 ? connectionExecutionDate : connectionExecutionDate * 1000)
				.atZone(ZoneId.systemDefault()).toLocalDate();
		StringBuilder builder = new StringBuilder();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		return builder.append(currentDate.format(formatter)).append(" - ").append(currentDate.format(formatter))
				.toString();
	}
}
