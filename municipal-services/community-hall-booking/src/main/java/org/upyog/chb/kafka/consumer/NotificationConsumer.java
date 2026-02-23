package org.upyog.chb.kafka.consumer;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.upyog.chb.enums.BookingStatusEnum;
import org.upyog.chb.service.CHBNotificationService;
import org.upyog.chb.util.CommunityHallBookingUtil;
import org.upyog.chb.web.models.CommunityHallBookingDetail;
import org.upyog.chb.web.models.CommunityHallBookingRequest;
import org.springframework.kafka.support.KafkaHeaders;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationConsumer {

	@Autowired
	private CHBNotificationService notificationService;

	@Autowired
	private ObjectMapper mapper;

	@KafkaListener(topics = { "${persister.save.communityhall.booking.topic}", "${persister.update.communityhall.booking.topic}"}, concurrency = "${kafka.consumer.config.concurrency.count}")
	public void listen(final HashMap<String, Object> record, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

		CommunityHallBookingRequest bookingRequest = new CommunityHallBookingRequest();
		try {

			log.info("Consuming record in CHB for notification: " + record.toString() + " from topic: " + topic);
			//log.info("Strigifed json : " + CommunityHallBookingUtil.beuatifyJson(record));
			bookingRequest = mapper.convertValue(record, CommunityHallBookingRequest.class);
		} catch (final Exception e) {
			log.error("Error while processing CHB notification to value: " + record + " on topic: " + topic + ": " + e);
		}

		String bookingStatus = bookingRequest.getHallsBookingApplication().getBookingStatus();
		log.info("CHB Appplication Received with booking no : "
				+ bookingRequest.getHallsBookingApplication().getBookingNo() + " and for status : " +  bookingStatus);
		
		// Send notification to user for all statuses (including PENDING_PAYMENT)
		// Previously PENDING_PAYMENT notifications were skipped; enable them so
		// pending-payment SMS (e.g., on submit) is delivered.
		if (true) {
			CommunityHallBookingDetail bookingDetail = bookingRequest.getHallsBookingApplication();
			if (bookingDetail.getWorkflow() == null || bookingDetail.getWorkflow().getAction() == null) {
				bookingStatus = bookingDetail.getBookingStatus();
			} else {
				bookingStatus = bookingDetail.getWorkflow().getAction();
			}

			log.info(" booking status bookingDetail.getWorkflow() : " + bookingDetail.getWorkflow());

			notificationService.process(bookingRequest, bookingStatus);
		}
	}

}
