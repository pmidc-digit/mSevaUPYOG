package org.upyog.adv.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.validation.Valid;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.upyog.adv.constants.BookingConstants;
import org.upyog.adv.enums.BookingStatusEnum;
import org.upyog.adv.repository.BookingRepository;
import org.upyog.adv.service.*;
import org.upyog.adv.util.BookingUtil;
import org.upyog.adv.util.MdmsUtil;
import org.upyog.adv.validator.BookingValidator;
import org.upyog.adv.web.models.*;
import org.upyog.adv.web.models.billing.PaymentDetail;
import org.upyog.adv.workflow.WorkflowIntegrator;
import org.upyog.adv.web.models.workflow.Workflow;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookingServiceImpl implements BookingService {

	@Autowired
	private MdmsUtil mdmsUtil;

	@Autowired
	@Lazy
	private BookingRepository bookingRepository;
	@Autowired
	private BookingValidator bookingValidator;

	@Autowired
	private EnrichmentService enrichmentService;

	@Autowired
	private DemandService demandService;

	@Autowired
	UserService userService;

	@Autowired
	private PaymentTimerService paymentTimerService;

	@Autowired
	private ADVEncryptionService encryptionService;

	@Autowired(required = false)
	private WorkflowIntegrator workflowIntegrator;

	@Override
	public BookingDetail createBooking(@Valid BookingRequest bookingRequest) throws JsonProcessingException {
		log.info("Create advertisement booking for user : " + bookingRequest.getRequestInfo().getUserInfo().getId());
		String uuid = bookingRequest.getRequestInfo().getUserInfo().getUuid();
		// TODO move to util calss 
		String tenantId = bookingRequest.getBookingApplication().getTenantId().split("\\.")[0];
		if (bookingRequest.getBookingApplication().getTenantId().split("\\.").length == 1) {
			throw new CustomException(BookingConstants.INVALID_TENANT,
					"Please provide valid tenant id for booking creation");
		}

		Object mdmsData = mdmsUtil.mDMSCall(bookingRequest.getRequestInfo(), tenantId);


		// 1. Validate request master data to confirm it has only valid data in records
		bookingValidator.validateCreate(bookingRequest, mdmsData);

		// 2. Add fields that has custom logic like booking no, ids using UUID
		enrichmentService.enrichCreateBookingRequest(bookingRequest);

		// ENcrypt PII data of applicant
		encryptionService.encryptObject(bookingRequest);
		userService.createUser(bookingRequest.getRequestInfo(),bookingRequest.getBookingApplication());

		try {
			if (workflowIntegrator != null && bookingRequest.getBookingApplication().getWorkflow() != null
					&& StringUtils.isNotBlank(bookingRequest.getBookingApplication().getWorkflow().getAction())) {
				String nextStatus = workflowIntegrator.transition(bookingRequest.getRequestInfo(), bookingRequest.getBookingApplication(),
						bookingRequest.getBookingApplication().getWorkflow().getAction());
				if (StringUtils.isNotBlank(nextStatus)) {
					bookingRequest.getBookingApplication().setBookingStatus(nextStatus);
				}
			}
		} catch (Exception ex) {
			log.error("Workflow initiation failed for booking {}", bookingRequest.getBookingApplication().getBookingNo(), ex);
		}





		// 4.Persist the request using persister service
		bookingRepository.saveBooking(bookingRequest);

		String draftId = bookingRequest.getBookingApplication().getDraftId();
		// 5

		String bookingId = bookingRequest.getBookingApplication().getBookingId();

		BookingDetail bookingDetails = encryptionService.decryptObject(bookingRequest.getBookingApplication(),
				bookingRequest.getRequestInfo());

		List<AdvertisementDraftDetail> draftData = bookingRepository.getDraftData(uuid);

		String draftIdFromDraft = "";

		if (draftData != null && !draftData.isEmpty()) {
			draftIdFromDraft = draftData.get(0).getDraftId();
		}

		bookingRepository.updateTimerBookingId(bookingId, bookingDetails.getBookingNo(), draftIdFromDraft);

		if (StringUtils.isNotBlank(draftId)) {
			log.info("Deleting draft entry for draft id: " + draftId);
			bookingRepository.deleteDraftApplication(draftId);
		}



		// Initiate workflow if action provided


		return bookingDetails;
	}

	@Override
	public List<BookingDetail> getBookingDetails(AdvertisementSearchCriteria advertisementSearchCriteria,
			RequestInfo info) {
		// BookingValidator.validateSearch(info, advertisementSearchCriteria);
		List<BookingDetail> bookingDetails = new ArrayList<BookingDetail>();
		// advertisementSearchCriteria =
		// addCreatedByMeToCriteria(advertisementSearchCriteria, info);

		log.info("loading data based on criteria" + advertisementSearchCriteria);
		if (advertisementSearchCriteria.getMobileNumber() != null
				|| advertisementSearchCriteria.getApplicantName() != null) {

			ApplicantDetail applicantDetail = ApplicantDetail.builder()
					.applicantMobileNo(advertisementSearchCriteria.getMobileNumber())
					.applicantName(advertisementSearchCriteria.getApplicantName()).build();
			BookingDetail bookingDetail = BookingDetail.builder().applicantDetail(applicantDetail).build();
			BookingRequest bookingRequest = BookingRequest.builder().bookingApplication(bookingDetail).requestInfo(info)
					.build();

			bookingDetail = encryptionService.encryptObject(bookingRequest);

			advertisementSearchCriteria.setMobileNumber(bookingDetail.getApplicantDetail().getApplicantMobileNo());
			advertisementSearchCriteria.setApplicantName(bookingDetail.getApplicantDetail().getApplicantName());

			log.info("loading data based on criteria after encrypting mobile no : " + advertisementSearchCriteria);

		}

		bookingDetails = bookingRepository.getBookingDetails(advertisementSearchCriteria);

		for (BookingDetail bookingDetail : bookingDetails) {
			AdvertisementSearchCriteria criteria = new AdvertisementSearchCriteria();
			criteria.setTenantId(bookingDetail.getTenantId());

			String bookingId = bookingDetail.getBookingId();
			List<OwnerInfo> owners = bookingRepository.getOwnerByBookingId(bookingId);

			if (owners != null && !owners.isEmpty()) {
				List<String> ownerIds = owners.stream()
						.map(OwnerInfo::getUuid) // Make sure getUuid() returns the correct value
						.filter(Objects::nonNull)
						.collect(Collectors.toList());
				criteria.setOwnerIds(ownerIds);
			}

			UserResponse userDetailResponse = userService.getUser(criteria, info);
			bookingDetail.setOwners(userDetailResponse.getUser());
		}

		// Fetch remaining timer values for the booking details
		// paymentTimerService.getRemainingTimerValue(bookingDetails);

		if (CollectionUtils.isEmpty(bookingDetails)) {
			return bookingDetails;
		}
		bookingDetails = encryptionService.decryptObject(bookingDetails, info);

		return bookingDetails;
	}

	@Override
	public Integer getBookingCount(@Valid AdvertisementSearchCriteria criteria, @NonNull RequestInfo requestInfo) {
		criteria.setCountCall(true);
		Integer bookingCount = 0;

		// criteria = addCreatedByMeToCriteria(criteria, requestInfo);
		bookingCount = bookingRepository.getBookingCount(criteria);

		return bookingCount;
	}

	@Override
	public List<AdvertisementSlotAvailabilityDetail> checkAdvertisementSlotAvailability(
			AdvertisementSlotSearchCriteria criteria, RequestInfo requestInfo) {

		List<AdvertisementSlotAvailabilityDetail> availabilityDetails = bookingRepository
				.getAdvertisementSlotAvailability(criteria);
		log.info("Fetched availability details: " + availabilityDetails);

		List<AdvertisementSlotAvailabilityDetail> availabilityDetailsResponse = convertToAdvertisementAvailabilityResponse(
				criteria, availabilityDetails, requestInfo);

		updateSlotAvailaibilityStatusFromTimer(availabilityDetailsResponse, criteria, requestInfo);
		log.info("Updated availability details: " + availabilityDetailsResponse);

		return availabilityDetailsResponse;
	}

	@Override
	public List<AdvertisementSlotAvailabilityDetail> getAdvertisementSlotAvailability(
			List<AdvertisementSlotSearchCriteria> criteriaList, RequestInfo requestInfo) {

		List<AdvertisementSlotAvailabilityDetail> allAvailabilityDetails = new ArrayList<>();

		for (AdvertisementSlotSearchCriteria criteria : criteriaList) {
			List<AdvertisementSlotAvailabilityDetail> availabilityDetails = checkAdvertisementSlotAvailability(criteria,
					requestInfo);
			allAvailabilityDetails.addAll(availabilityDetails);

		}

		boolean isTimerRequiredForAnyCriteria = criteriaList.stream()
				.anyMatch(criteria -> criteria.getIsTimerRequired());

		boolean slotBookedFlag = setSlotBookedFlag(allAvailabilityDetails);
		log.info("Slot booked flag for criteria : " + slotBookedFlag);
		if (isTimerRequiredForAnyCriteria) {
			bookingRepository.deleteDataFromTimerAndDraft(requestInfo.getUserInfo().getUuid(),
					criteriaList.get(0).getDraftId(), criteriaList.get(0).getBookingId());
		}
		if (isTimerRequiredForAnyCriteria && !slotBookedFlag) {
			// Insert the timer for all criteria at once
			paymentTimerService.insertBookingIdForTimer(criteriaList, requestInfo, allAvailabilityDetails);
			log.info("Inserted booking ID for timer for all criteria.");
		}

		return allAvailabilityDetails;
	}

	@Override
	public boolean setSlotBookedFlag(List<AdvertisementSlotAvailabilityDetail> details) {
		// Check if any slot is booked and return true if so
		return details.stream()
				.anyMatch(slot -> BookingStatusEnum.BOOKED.toString().equals(slot.getSlotStaus()));
	}

	private List<AdvertisementSlotAvailabilityDetail> convertToAdvertisementAvailabilityResponse(
			AdvertisementSlotSearchCriteria criteria, List<AdvertisementSlotAvailabilityDetail> availabiltityDetails,
			RequestInfo requestInfo) {

		List<AdvertisementSlotAvailabilityDetail> availabiltityDetailsResponse = new ArrayList<>();
		LocalDate startDate = BookingUtil.parseStringToLocalDate(criteria.getBookingStartDate());
		LocalDate endDate = BookingUtil.parseStringToLocalDate(criteria.getBookingEndDate());

		List<LocalDate> totalDates = new ArrayList<>();

		// Calculating list of dates for booking
		while (!startDate.isAfter(endDate)) {
			totalDates.add(startDate);
			startDate = startDate.plusDays(1);
		}

		// Enforcing the maximum booking days constraint
		if (totalDates.size() > 90) {
			throw new CustomException(BookingConstants.INVALID_BOOKING_DATE_RANGE,
					"Booking is not allowed for this number of days.");
		}

		// Fetch advertisement details from MDMS to enrich slots
		List<Advertisements> advertisementsList = mdmsUtil.fetchAdvertisementsData(requestInfo, criteria.getTenantId());
		Advertisements advertisementData = null;
		if (advertisementsList != null && criteria.getAdvertisementId() != null) {
			String advertisementIdStr = criteria.getAdvertisementId();
			advertisementData = advertisementsList.stream()
				.filter(ad -> ad.getId() != null && ad.getId().toString().equals(advertisementIdStr))
				.findFirst()
				.orElse(null);
		}

		// Create a slot availability detail for each date
		final Advertisements finalAdvertisementData = advertisementData;
		totalDates.forEach(date -> {
			AdvertisementSlotAvailabilityDetail slot = createAdvertisementSlotAvailabiltityDetail(criteria, date);
			// Enrich with advertisement details
			if (finalAdvertisementData != null) {
				enrichSlotWithAdvertisementDetails(slot, finalAdvertisementData);
			}
			availabiltityDetailsResponse.add(slot);
		});

	// Set slot status to match the actual booking status from database
	// Match slots based on critical fields: advertisementId, bookingDate, and other attributes
	availabiltityDetailsResponse.forEach(detail -> {
		// Find matching booked slot from database
		availabiltityDetails.stream()
			.filter(dbDetail -> isSlotMatching(detail, dbDetail))
			.findFirst()
			.ifPresent(bookedSlot -> {
				// Copy the actual booking status (BOOKING_IN_PROGRESS, PENDING_FOR_PAYMENT, BOOKED, etc.)
				if (bookedSlot.getSlotStaus() != null) {
					detail.setSlotStaus(bookedSlot.getSlotStaus());
				}
				if (bookedSlot.getBookingId() != null) {
					detail.setBookingId(bookedSlot.getBookingId());
				}
			});
	});

		log.info("Availability details response after updating status: " + availabiltityDetailsResponse);

		return availabiltityDetailsResponse;
	}

	public List<AdvertisementSlotAvailabilityDetail> updateSlotAvailaibilityStatusFromTimer(
			List<AdvertisementSlotAvailabilityDetail> availabilityDetailsResponse,
			AdvertisementSlotSearchCriteria criteria, RequestInfo requestInfo) {

		List<AdvertisementSlotAvailabilityDetail> bookedSlotsFromTimer = bookingRepository.getBookedSlots(criteria,
				requestInfo);
		if (bookedSlotsFromTimer == null || bookedSlotsFromTimer.isEmpty()) {
			log.info("Timer details are null or empty, returning availability details as is.");
			return availabilityDetailsResponse;
		}

		log.info("Timer Details from db : " + bookedSlotsFromTimer);

		// Check each timer entry against availability response using smart matching
		bookedSlotsFromTimer.forEach(timerDetail -> {
			// Find matching slot in availability response using smart matching
			availabilityDetailsResponse.stream()
				.filter(responseSlot -> isSlotMatching(responseSlot, timerDetail))
				.findFirst()
				.ifPresent(matchedSlot -> {
					boolean isCreatedByCurrentUser = timerDetail.getUuid().equals(requestInfo.getUserInfo().getUuid());
					boolean existingBookingId = timerDetail.getBookingId() != null && 
						timerDetail.getBookingId().equals(criteria.getBookingId());

					boolean existingDraftId = false;
					String draftId = getDraftId(availabilityDetailsResponse, requestInfo);
					if (!StringUtils.isBlank(criteria.getDraftId()) && !StringUtils.isBlank(draftId)) {
						existingDraftId = draftId.equals(criteria.getDraftId());
					}
					
				// If slot already has a booking status from DB (not AVAILABLE), check the status
				String currentStatus = matchedSlot.getSlotStaus();
				if (!BookingStatusEnum.AVAILABLE.toString().equals(currentStatus)) {
					// If the slot is BOOKED (payment completed), NEVER show as AVAILABLE to anyone
					if (BookingStatusEnum.BOOKED.toString().equals(currentStatus)) {
						log.info("Slot is BOOKED (payment completed) - keeping as BOOKED for everyone including same user");
						return; // Don't allow same user to rebook completed bookings
					}
					
					// For other statuses (BOOKING_IN_PROGRESS, PENDING_FOR_PAYMENT), 
					// allow same user to see as AVAILABLE only if it's their exact same booking
					if (isCreatedByCurrentUser && (existingBookingId || existingDraftId)) {
						log.info("Slot is {} by same user with same booking/draft - allowing modification", currentStatus);
						matchedSlot.setSlotStaus(BookingStatusEnum.AVAILABLE.toString());
						return;
					}
					
					// For other users or different bookings, preserve the actual status
					log.info("Slot already has booking status: {} - preserving it", currentStatus);
					return;
				}
				
				// Timer-only holds (no DB record yet) - apply timer logic
				// If user is checking their own timer hold, show as AVAILABLE so they can modify
				// Otherwise, show as BOOKED to prevent others from selecting
				if (isCreatedByCurrentUser && (existingBookingId || existingDraftId)) {
					log.info("Timer slot held by current user with same booking/draft id - showing as AVAILABLE");
					matchedSlot.setSlotStaus(BookingStatusEnum.AVAILABLE.toString());
				} else {
					log.info("Timer slot held by another user or different booking - showing as BOOKED");
					matchedSlot.setSlotStaus(BookingStatusEnum.BOOKED.toString());
				}
				});
		});

		return availabilityDetailsResponse;
	}

	@Override
	public String getDraftId(List<AdvertisementSlotAvailabilityDetail> availabiltityDetailsResponse,
			RequestInfo requestInfo) {
		List<AdvertisementDraftDetail> draftData = bookingRepository.getDraftData(requestInfo.getUserInfo().getUuid());

		if (draftData != null && !draftData.isEmpty()) {
			String draftId = draftData.get(0).getDraftId();
			return (draftId != null && !draftId.isEmpty()) ? draftId : null;
		}
		return null;
	}

	private AdvertisementSlotAvailabilityDetail createAdvertisementSlotAvailabiltityDetail(
			AdvertisementSlotSearchCriteria criteria, LocalDate date) {
		AdvertisementSlotAvailabilityDetail availabiltityDetail = AdvertisementSlotAvailabilityDetail.builder()
				.addType(criteria.getAddType()).faceArea(criteria.getFaceArea()).location(criteria.getLocation())
				.nightLight(criteria.getNightLight()).slotStaus(BookingStatusEnum.AVAILABLE.toString()).advertisementId(criteria.getAdvertisementId())
				.tenantId(criteria.getTenantId()).bookingDate(BookingUtil.parseLocalDateToString(date, "yyyy-MM-dd"))
				.bookingFromTime(criteria.getBookingFromTime())
				.bookingToTime(criteria.getBookingToTime())
				.build();
		return availabiltityDetail;
	}

	/**
	 * Enriches a slot with advertisement details from MDMS
	 */
	private void enrichSlotWithAdvertisementDetails(AdvertisementSlotAvailabilityDetail slot, Advertisements advertisement) {
		if (advertisement.getAmount() != null) {
			slot.setAmount(advertisement.getAmount().doubleValue());
		}
		slot.setAdvertisementName(advertisement.getName());
		if (advertisement.getPoleNo() != null) {
			try {
				slot.setPoleNo(Integer.parseInt(advertisement.getPoleNo()));
			} catch (NumberFormatException e) {
				log.warn("Unable to parse pole number: " + advertisement.getPoleNo());
			}
		}
		slot.setImageSrc(advertisement.getImageSrc());
		slot.setWidth(advertisement.getWidth());
		slot.setHeight(advertisement.getHeight());
		slot.setLightType(advertisement.getLight());
	}

	/**
	 * Helper method to match slots based on critical fields
	 * Matches on: advertisementId, bookingDate, and optional fields (addType, location, faceArea, nightLight)
	 */
	private boolean isSlotMatching(AdvertisementSlotAvailabilityDetail searchSlot, 
			AdvertisementSlotAvailabilityDetail dbSlot) {
		
		// Primary match: advertisementId and bookingDate must match
		if (!Objects.equals(searchSlot.getAdvertisementId(), dbSlot.getAdvertisementId())) {
			return false;
		}
		
		if (!Objects.equals(searchSlot.getBookingDate(), dbSlot.getBookingDate())) {
			return false;
		}
		
		// Secondary match: if search criteria has these fields, they must match DB
		if (StringUtils.isNotBlank(searchSlot.getAddType()) && 
			!Objects.equals(searchSlot.getAddType(), dbSlot.getAddType())) {
			return false;
		}
		
		if (StringUtils.isNotBlank(searchSlot.getLocation()) && 
			!Objects.equals(searchSlot.getLocation(), dbSlot.getLocation())) {
			return false;
		}
		
		if (StringUtils.isNotBlank(searchSlot.getFaceArea()) && 
			!Objects.equals(searchSlot.getFaceArea(), dbSlot.getFaceArea())) {
			return false;
		}
		
		if (searchSlot.getNightLight() != null && 
			!Objects.equals(searchSlot.getNightLight(), dbSlot.getNightLight())) {
			return false;
		}
		
		return true;
	}

	// This method updates booking from the booking number, searches the booking num
	// and get its details, if payment detail is not null the it sets the receipt
	// number and payment date
	@Override
	public BookingDetail updateBooking(BookingRequest advertisementBookingRequest, PaymentDetail paymentDetail,
			BookingStatusEnum status) {
		String bookingNo = advertisementBookingRequest.getBookingApplication().getBookingNo();
		log.info("Updating booking for booking no : " + bookingNo);
		if (bookingNo == null) {
			return null;
		}
		AdvertisementSearchCriteria advertisementSearchCriteria = AdvertisementSearchCriteria.builder()
				.bookingNo(bookingNo).build();
		List<BookingDetail> bookingDetails = bookingRepository.getBookingDetails(advertisementSearchCriteria);
		if (bookingDetails.size() == 0) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}

		List<OwnerInfo> owners = bookingDetails.get(0).getOwners();
		if (owners != null) {
			userService.createUser(advertisementBookingRequest.getRequestInfo(),advertisementBookingRequest.getBookingApplication());
		}
		// String tenantId = bookingDetails.get(0).getTenantId();
		// Object mdmsData =
		// mdmsUtil.mDMSCall(advertisementBookingRequest.getRequestInfo(), tenantId);
		// bookingValidator.validateUpdate(advertisementBookingRequest.getBookingApplication(),
		// mdmsData,
		// advertisementBookingRequest.getBookingApplication().getBookingStatus());

		// Preserve workflow/businessService from request (DB object won't have these)
		Workflow incomingWorkflow = advertisementBookingRequest.getBookingApplication().getWorkflow();
		String incomingBusinessService = advertisementBookingRequest.getBookingApplication().getBusinessService();

		convertBookingRequest(advertisementBookingRequest, bookingDetails.get(0));

		// Restore workflow/businessService onto the DB-loaded booking object
		advertisementBookingRequest.getBookingApplication().setWorkflow(incomingWorkflow);
//		if (incomingBusinessService != null)
//			advertisementBookingRequest.getBookingApplication().setBusinessService(incomingBusinessService);

		// If workflow action present, transition and set status from WF response
		boolean usedWorkflow = false;
		try {
			if (workflowIntegrator != null
					&& advertisementBookingRequest.getBookingApplication().getWorkflow() != null
					&& StringUtils.isNotBlank(
							advertisementBookingRequest.getBookingApplication().getWorkflow().getAction())) {

				String nextStatus = workflowIntegrator.transition(advertisementBookingRequest.getRequestInfo(),
						advertisementBookingRequest.getBookingApplication(),
						advertisementBookingRequest.getBookingApplication().getWorkflow().getAction());
				if(advertisementBookingRequest.getBookingApplication().getWorkflow().getAction().equalsIgnoreCase(BookingConstants.SUBMIT)){

					Object mdmsData = mdmsUtil.mDMSCall(advertisementBookingRequest.getRequestInfo(), advertisementBookingRequest.getBookingApplication().getTenantId());
					demandService.createDemand(advertisementBookingRequest, mdmsData, true);

				}

				if (StringUtils.isNotBlank(nextStatus)) {
					advertisementBookingRequest.getBookingApplication().setBookingStatus(nextStatus);
					if (advertisementBookingRequest.getBookingApplication().getCartDetails() != null) {
						advertisementBookingRequest.getBookingApplication().getCartDetails()
								.forEach(c -> c.setStatus(nextStatus));
					}
					usedWorkflow = true;
				}
			}
		} catch (Exception ex) {
			log.error("Workflow transition on update failed for booking {}", bookingNo, ex);
		}



		// Enrich (audit/payment date), and conditionally avoid overriding WF status
		enrichmentService.enrichUpdateBookingRequest(advertisementBookingRequest, usedWorkflow ? null : status);

		// Update payment date and receipt no on successful payment when payment detail
		// object is received
		if (paymentDetail != null) {
			advertisementBookingRequest.getBookingApplication().setReceiptNo(paymentDetail.getReceiptNumber());
			advertisementBookingRequest.getBookingApplication().setPaymentDate(paymentDetail.getReceiptDate());
		}



		bookingRepository.updateBooking(advertisementBookingRequest);
		log.info("fetched booking detail and updated status "
				+ advertisementBookingRequest.getBookingApplication().getBookingStatus());
		return advertisementBookingRequest.getBookingApplication();
	}

	@Transactional
	public BookingDetail updateBookingSynchronously(BookingRequest advertisementBookingRequest,
			PaymentDetail paymentDetail, BookingStatusEnum status) {
		String bookingNo = advertisementBookingRequest.getBookingApplication().getBookingNo();
		log.info("Updating booking for booking no : " + bookingNo);
		if (bookingNo == null) {
			return null;
		}
		AdvertisementSearchCriteria advertisementSearchCriteria = AdvertisementSearchCriteria.builder()
				.bookingNo(bookingNo).build();
		List<BookingDetail> bookingDetails = bookingRepository.getBookingDetails(advertisementSearchCriteria);
		if (bookingDetails.size() == 0) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}

		// String tenantId = bookingDetails.get(0).getTenantId();
		// Object mdmsData =
		// mdmsUtil.mDMSCall(advertisementBookingRequest.getRequestInfo(), tenantId);
		// bookingValidator.validateUpdate(advertisementBookingRequest.getBookingApplication(),
		// mdmsData,
		// advertisementBookingRequest.getBookingApplication().getBookingStatus());

		// Preserve workflow/businessService from request (DB object won't have these)
		Workflow incomingWorkflowSync = advertisementBookingRequest.getBookingApplication().getWorkflow();
		if(incomingWorkflowSync==null){
			incomingWorkflowSync = new Workflow();
			incomingWorkflowSync.setAction("PAY");
		}
		String incomingBusinessServiceSync = advertisementBookingRequest.getBookingApplication().getBusinessService();

		convertBookingRequest(advertisementBookingRequest, bookingDetails.get(0));

		// Restore workflow/businessService onto the DB-loaded booking object
		advertisementBookingRequest.getBookingApplication().setWorkflow(incomingWorkflowSync);
		if (incomingBusinessServiceSync != null)
			advertisementBookingRequest.getBookingApplication().setBusinessService(incomingBusinessServiceSync);

		boolean usedWorkflow = false;
		try {
			if (workflowIntegrator != null
					&& advertisementBookingRequest.getBookingApplication().getWorkflow() != null
					&& StringUtils.isNotBlank(
							advertisementBookingRequest.getBookingApplication().getWorkflow().getAction())) {
				advertisementBookingRequest.getBookingApplication().getWorkflow();
				String nextStatus = workflowIntegrator.transition(advertisementBookingRequest.getRequestInfo(),
						advertisementBookingRequest.getBookingApplication(),
						advertisementBookingRequest.getBookingApplication().getWorkflow().getAction());
				if (StringUtils.isNotBlank(nextStatus)) {
					advertisementBookingRequest.getBookingApplication().setBookingStatus(nextStatus);
					if (advertisementBookingRequest.getBookingApplication().getCartDetails() != null) {
						advertisementBookingRequest.getBookingApplication().getCartDetails()
								.forEach(c -> c.setStatus(nextStatus));
					}
					usedWorkflow = true;
				}
			}
		} catch (Exception ex) {
			log.error("Workflow transition on update (sync) failed for booking {}", bookingNo, ex);
		}

		enrichmentService.enrichUpdateBookingRequest(advertisementBookingRequest, usedWorkflow ? null : status);

		// Update payment date and receipt no on successful payment when payment detail
		// object is received
		if (paymentDetail != null) {
			advertisementBookingRequest.getBookingApplication().setReceiptNo(paymentDetail.getReceiptNumber());
			advertisementBookingRequest.getBookingApplication().setPaymentDate(paymentDetail.getReceiptDate());
		}

		bookingRepository.updateBookingSynchronously(advertisementBookingRequest);
		log.info("fetched booking detail and updated status "
				+ advertisementBookingRequest.getBookingApplication().getBookingStatus());
		return advertisementBookingRequest.getBookingApplication();
	}

	// This sets the paymennt receipt file store id and permission letter file store
	// id
	private void convertBookingRequest(BookingRequest advertisementbookingRequest, BookingDetail bookingDetailDB) {
		BookingDetail bookingDetailRequest = advertisementbookingRequest.getBookingApplication();
		List<DocumentDetail> documents = bookingDetailRequest.getUploadedDocumentDetails();
		if (bookingDetailDB.getPermissionLetterFilestoreId() == null
				&& bookingDetailRequest.getPermissionLetterFilestoreId() != null) {
			bookingDetailDB.setPermissionLetterFilestoreId(bookingDetailRequest.getPermissionLetterFilestoreId());
		}

		if (bookingDetailDB.getPaymentReceiptFilestoreId() == null
				&& bookingDetailRequest.getPaymentReceiptFilestoreId() != null) {
			bookingDetailDB.setPaymentReceiptFilestoreId(bookingDetailRequest.getPaymentReceiptFilestoreId());
		}
		advertisementbookingRequest.setBookingApplication(bookingDetailDB);
		advertisementbookingRequest.getBookingApplication().setUploadedDocumentDetails(documents);
	}

	@Override
	public BookingDetail createAdvertisementDraftApplication(BookingRequest bookingRequest) {

		String draftId = bookingRequest.getBookingApplication().getDraftId();
		userService.createUser(bookingRequest.getRequestInfo(),bookingRequest.getBookingApplication());

		if (StringUtils.isNotBlank(draftId)) {

			// Update existing draft
			enrichmentService.enrichUpdateAdvertisementDraftApplicationRequest(bookingRequest);
			bookingRepository.updateDraftApplication(bookingRequest);
		} else {
			enrichmentService.enrichCreateAdvertisementDraftApplicationRequest(bookingRequest);

			List<AdvertisementDraftDetail> draftData = bookingRepository
					.getDraftData(bookingRequest.getRequestInfo().getUserInfo().getUuid());

			if (draftData != null && !draftData.isEmpty()) {
				String draftIdInDraft = draftData.get(0).getDraftId();

				if (draftIdInDraft == null) {
					bookingRepository.saveDraftApplication(bookingRequest);
				}
			}

		}


		// Return the enriched booking application object
		return bookingRequest.getBookingApplication();
	}

	@Override
	public List<BookingDetail> getAdvertisementDraftApplicationDetails(@NonNull RequestInfo requestInfo,
			@Valid AdvertisementSearchCriteria criteria) {
		return bookingRepository.getAdvertisementDraftApplications(requestInfo, criteria);
	}

	public String deleteAdvertisementDraft(String draftId) {

		if (StringUtils.isNotBlank(draftId)) {
			log.info("Deleting draft entry for draft id: " + draftId);
			bookingRepository.deleteDraftApplication(draftId);
		}
		return BookingConstants.DRAFT_DISCARDED;
	}

}
