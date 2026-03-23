package org.egov.gccalculation.consumer;

import java.util.*;
import java.util.stream.Collectors;

import org.egov.gccalculation.config.GCCalculationConfiguration;
import org.egov.gccalculation.validator.GCCalculationWorkflowValidator;
import org.egov.gccalculation.web.models.CalculationReq;
import org.egov.gccalculation.producer.GCCalculationProducer;
import org.egov.gccalculation.service.BulkDemandAndBillGenService;
import org.egov.gccalculation.service.MasterDataService;
import org.egov.gccalculation.service.GCCalculationServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DemandGenerationConsumer {

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private MasterDataService mstrDataService;

	@Autowired
	private BulkDemandAndBillGenService bulkDemandAndBillGenService;

	@Autowired
	private GCCalculationProducer producer;
	
	@Autowired
	private GCCalculationConfiguration config;
	@Autowired
	private GCCalculationServiceImpl wSCalculationServiceImpl;
	@Value("${kafka.topics.bulk.bill.generation.audit}")
	private String bulkBillGenAuditTopic;

	@Value("${persister.demand.based.dead.letter.error.topic}")
	private String demandGenerationErrorTopic;

	@Autowired
	private GCCalculationWorkflowValidator wsCalulationWorkflowValidator;
	/**
	 * Listen the topic for processing the batch records.
	 * 
	 * @param records
	 *            would be calculation criteria.
	 */
	/*
	 * Temp Fix for demand generation
	 * @KafkaListener(topics = { "${egov.watercalculatorservice.createdemand.topic}"
	 * }) public void processMessage(Map<String, Object>
	 * consumerRecord, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) { try{
	 * CalculationReq calculationReq = mapper.convertValue(consumerRecord,
	 * CalculationReq.class); generateDemandInBatch(calculationReq); }catch (final
	 * Exception e){ log.error("KAFKA_PROCESS_ERROR", e); } }
	 */
	@KafkaListener(topics = "${egov.garbagecalculatorservice.createdemand.topic}",
            containerFactory = "kafkaListenerContainerFactoryBatch",
            concurrency = "${egov.garbagecalculatorservice.listener.concurrency}")

		public void listen(final List<Message<?>> records) {
		    log.info("Number of batch records received: " + records.size());
		    for (Message<?> record : records) {
		        try {
		            CalculationReq calculationReq = mapper.convertValue(record.getPayload(), CalculationReq.class);
		            Map<String, Object> masterMap = mstrDataService.loadMasterData(
		                    calculationReq.getRequestInfo(),
		                    calculationReq.getCalculationCriteria().get(0).getTenantId()
		            );
		            generateDemandInBatch(calculationReq, masterMap, config.getDeadLetterTopicBatch());
		            log.info("Processed tenant: " + calculationReq.getCalculationCriteria().get(0).getTenantId() +
		                     " with " + calculationReq.getCalculationCriteria().size() + " calculation criteria.");
		        } catch (Exception e) {
		            log.error("Error processing record: " + record.getPayload(), e);
		        }
		    }
		}

	
	

	/**
	 * Generate demand in bulk on given criteria
	 * 
	 * @param request
	 *            Calculation request
	 * @param masterMap
	 *            master data
	 * @param errorTopic
	 *            error topic
	 */
	private void generateDemandInBatch(CalculationReq request, Map<String, Object> masterMap, String errorTopic) {
		try {
			wSCalculationServiceImpl.bulkDemandGeneration(request, masterMap);
			String connectionNoStrings = request.getCalculationCriteria().stream()
					.map(criteria -> criteria.getConnectionNo()).collect(Collectors.toSet()).toString();
			StringBuilder str = new StringBuilder("Demand generated Successfully. For records : ")
					.append(connectionNoStrings);
			log.info(str.toString());
		} catch (Exception ex) {
			log.error("Demand generation error: ", ex);
			producer.push(errorTopic, request);
		}

	}

	
	
}
