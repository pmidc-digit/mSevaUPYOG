package org.upyog.adv.enums;

public enum BookingStatusEnum {
	AVAILABLE,
	BOOKING_CREATED,
	BOOKED,
	CANCELLATION_REQUESTED,
	PENDING_FOR_PAYMENT,
	PAYMENT_FAILED,
	CANCELLED,
	BOOKING_EXPIRED;
	
	String status;
	
	public String getStatus() {
		return status;
	}

}
