package org.egov.rnl.service;

import java.util.List;

import javax.validation.Valid;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rnl.enums.BookingStatusEnum;
import org.egov.rnl.web.models.CommunityHallBookingDetail;
import org.egov.rnl.web.models.CommunityHallBookingRequest;
import org.egov.rnl.web.models.CommunityHallBookingSearchCriteria;
import org.egov.rnl.web.models.CommunityHallSlotAvailabilityResponse;
import org.egov.rnl.web.models.CommunityHallSlotSearchCriteria;

import digit.models.coremodels.PaymentDetail;
import lombok.NonNull;

public interface CommunityHallBookingService {

	CommunityHallBookingDetail createBooking(@Valid CommunityHallBookingRequest communityHallsBookingRequest);
	
	CommunityHallBookingDetail createInitBooking(@Valid CommunityHallBookingRequest communityHallsBookingRequest);	
	
	List<CommunityHallBookingDetail> getBookingDetails(CommunityHallBookingSearchCriteria bookingSearchCriteria, RequestInfo info);

	CommunityHallBookingDetail updateBooking(@Valid CommunityHallBookingRequest communityHallsBookingRequest, PaymentDetail paymentDetail, BookingStatusEnum bookingStatusEnum);

	CommunityHallSlotAvailabilityResponse getCommunityHallSlotAvailability(CommunityHallSlotSearchCriteria criteria, RequestInfo info);

	Integer getBookingCount(@Valid CommunityHallBookingSearchCriteria criteria, @NonNull RequestInfo requestInfo);

	/**
	 * We are updating booking status synchronously for updating booking status on payment success 
	 * Deleting the timer entry here after successful update of booking
	 * @param deleteBookingTimer 
	 */
	void updateBookingSynchronously(CommunityHallBookingRequest communityHallsBookingRequest,
			PaymentDetail paymentDetail, BookingStatusEnum status, boolean deleteBookingTimer);

}
