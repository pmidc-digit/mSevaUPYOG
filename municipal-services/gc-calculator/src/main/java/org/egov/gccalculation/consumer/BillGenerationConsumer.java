package org.egov.gccalculation.consumer;

import java.util.ArrayList;
import java.util.List;

import org.egov.gccalculation.constants.GCCalculationConstant;
import org.egov.gccalculation.repository.BillGeneratorDao;
import org.egov.gccalculation.service.DemandService;
import org.egov.gccalculation.web.models.BillGeneratorReq;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class BillGenerationConsumer {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private DemandService demandService;

	@Autowired
	private BillGeneratorDao billGeneratorDao;

	/**
	 * Listen the topic for processing the batch records.
	 * 
	 * @param records
	 *            would be bill generator request.
	 */
	@KafkaListener(topics = {
	"${egov.garbagecalculatorservice.billgenerate.topic}" }, containerFactory = "kafkaListenerContainerFactoryBatch")
	public void listen(final List<Message<?>> records) {
		try {
			log.info("bill generator consumer received records:  " + records.size());

			BillGeneratorReq billGeneratorReq = mapper.convertValue(records.get(0).getPayload(), BillGeneratorReq.class);
			log.info("Number of batch records:  " + billGeneratorReq.getConsumerCodes().size());
			long timeSTamp=System.currentTimeMillis();
			if(billGeneratorReq.getConsumerCodes() != null && !billGeneratorReq.getConsumerCodes().isEmpty() && billGeneratorReq.getTenantId() != null) {
				log.info("Fetch Bill generator initiated for Consumers: {}", billGeneratorReq.getConsumerCodes());
				List<String> failureConsumerCodes = new ArrayList<>();
				  billGeneratorDao.insertBillSchedulerConnectionStatus(
			                new ArrayList<>(billGeneratorReq.getConsumerCodes()),
					        billGeneratorReq.getBillSchedular().getId(),
					        billGeneratorReq.getBillSchedular().getLocality(),
					        GCCalculationConstant.INITIATED,
					        billGeneratorReq.getBillSchedular().getTenantId(),
					        GCCalculationConstant.INITIATED,
					        timeSTamp
					    );
				 
				List<String> fetchBillSuccessConsumercodes = demandService.fetchBillSchedulerSingle(
					    billGeneratorReq.getConsumerCodes(),
					    billGeneratorReq.getTenantId(),
					    billGeneratorReq.getRequestInfoWrapper().getRequestInfo(),
					    failureConsumerCodes ,
					    billGeneratorReq.getBillSchedular().getId(),
					    billGeneratorReq.getBillSchedular().getLocality()
					);	
				
				log.info("Fetch Bill generator completed fetchBillConsumers: {}", fetchBillSuccessConsumercodes);
			}
		}catch(Exception exception) {
			log.error("Exception occurred while generating bills in the sw bill generator consumer");
			
		}



	}

}
