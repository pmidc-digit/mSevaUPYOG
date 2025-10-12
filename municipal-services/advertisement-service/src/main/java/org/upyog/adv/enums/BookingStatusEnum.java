package org.upyog.adv.enums;

public enum BookingStatusEnum {
	AVAILABLE,
	BOOKING_IN_PROGRESS,
	BOOKED,
	CANCELLATION_REQUESTED,
	PENDING_FOR_PAYMENT,
	PENDING_FOR_VERIFICATION,
	PAYMENT_FAILED,
	CANCELLED,
	BOOKING_EXPIRED;
	String status;
	
	public String getStatus() {
		return status;
	}

}
