//package org.egov.rl.consumer;
//
//
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.List;
//
//import org.egov.rl.config.RentLeaseConfiguration;
//import org.egov.rl.repository.PropertyRepository;
//import org.egov.rl.service.NotificationService;
//import org.egov.rl.util.PTConstants;
//import org.egov.tracer.model.CustomException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.kafka.support.KafkaHeaders;
//import org.springframework.messaging.handler.annotation.Header;
//import org.springframework.stereotype.Component;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import lombok.extern.slf4j.Slf4j;
//
//@Component
//@Slf4j
//public class NotificationConsumer {
//
//	@Autowired
//    private ObjectMapper mapper;
//	
//	@Autowired
//	private RentLeaseConfiguration configs;
//	
//	@Autowired
//	private PropertyRepository repository;
//	
//	@Autowired
//    private AssessmentNotificationService assessmentNotificationService;
//	
//	@Autowired
//	private NotificationService notifService;
//	
//    @KafkaListener(topics = {"${egov.pt.assessment.create.topic}",
//    						 "${egov.pt.assessment.update.topic}",
//    						 "${persister.update.property.topic}",
//    						 "${persister.save.property.topic}"})
//    public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
//
//		try {
//
//			if (topic.equalsIgnoreCase(configs.getCreateAssessmentTopic()) || topic.equalsIgnoreCase(configs.getUpdateAssessmentTopic())) {
//
//				AssessmentRequest request = mapper.convertValue(record, AssessmentRequest.class);
//				assessmentNotificationService.process(topic, request);
//			} else if (topic.equalsIgnoreCase(configs.getSavePropertyTopic()) || topic.equalsIgnoreCase(configs.getUpdatePropertyTopic())) {
//
//				PropertyRequest request = mapper.convertValue(record, PropertyRequest.class);
////		    	Integer count = 0;
//		 //       count = repository.getCountprocess( request.getProperty(),request.getRequestInfo());
//		        	//log.debug("Count  in consumer topic: "+ count);
//		       
////				if (!request.getProperty().isOldDataEncryptionRequest())
////				{
////					// log.info("Inside mutations");
////					if (PTConstants.MUTATION_PROCESS_CONSTANT.equalsIgnoreCase(request.getProperty().getCreationReason().toString())) 
////					{
////						 log.info(" Creation Reason " + request.getProperty().getCreationReason().toString());
////						notifService.sendNotificationForMutation(request);
////					}
////					
////					else {
////						log.info("Inside Create");
////						notifService.sendNotificationForUpdate(request);
////					
////					}
////				}
//			}
//
//        } catch (final Exception e) {
//
//            log.error("Error while listening to value: " + record + " on topic: " + topic + ": ", e);
//        }
//    }
//
//
//
//}
