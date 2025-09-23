package org.upyog.chb.service.impl;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.upyog.chb.constants.CommunityHallBookingConstants;
import org.upyog.chb.constants.WorkflowStatus;
import org.upyog.chb.enums.BookingStatusEnum;
import org.upyog.chb.repository.CommunityHallBookingRepository;
import org.upyog.chb.service.*;
import org.upyog.chb.util.CommunityHallBookingUtil;
import org.upyog.chb.util.MdmsUtil;
import org.upyog.chb.validator.CommunityHallBookingValidator;
import org.upyog.chb.web.models.*;
import org.upyog.chb.web.models.workflow.ProcessInstance;
import org.upyog.chb.web.models.workflow.State;
import org.upyog.chb.web.models.user.UserResponse;
import org.upyog.chb.web.models.OwnerInfo;
import digit.models.coremodels.PaymentDetail;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CommunityHallBookingServiceImpl implements CommunityHallBookingService {

	@Autowired
	private CommunityHallBookingRepository bookingRepository;
	@Autowired
	private CommunityHallBookingValidator hallBookingValidator;

	@Autowired
	private WorkflowService workflowService;
	@Autowired
	private EnrichmentService enrichmentService;

	@Autowired
	private DemandService demandService;

	@Autowired
	private MdmsUtil mdmsUtil;

	@Autowired
	private CHBEncryptionService encryptionService;

	@Autowired
	private BookingTimerService bookingTimerService;

	@Autowired
	private CHBUserService chbUserService;


	@Override
	public CommunityHallBookingDetail createBooking(@Valid CommunityHallBookingRequest communityHallsBookingRequest) {
		log.info("Create community hall booking for user : "
				+ communityHallsBookingRequest.getRequestInfo().getUserInfo().getUuid());
		// TODO move to util calss 
		String tenantId = communityHallsBookingRequest.getHallsBookingApplication().getTenantId().split("\\.")[0];
		if (communityHallsBookingRequest.getHallsBookingApplication().getTenantId().split("\\.").length == 1) {
			throw new CustomException(CommunityHallBookingConstants.INVALID_TENANT,
					"Please provide valid tenant id for booking creation");
		}

		Object mdmsData = mdmsUtil.mDMSCall(communityHallsBookingRequest.getRequestInfo(), tenantId);

		// 1. Validate request master data to confirm it has only valid data in records
		hallBookingValidator.validateCreate(communityHallsBookingRequest, mdmsData);
		// 2. Add fields that has custom logic like booking no, ids using UUID
		enrichmentService.enrichCreateBookingRequest(communityHallsBookingRequest);

		// ENcrypt PII data of applicant for storage
		encryptionService.encryptObject(communityHallsBookingRequest);

		/**
		 * Workflow will come into picture once hall location changes or booking is
		 * cancelled otherwise after payment booking will be auto approved
		 * 
		 */
		// 3.Update workflow of the application - only if workflow object is provided
		if (communityHallsBookingRequest.getHallsBookingApplication().getWorkflow() != null
				&& communityHallsBookingRequest.getHallsBookingApplication().getWorkflow().getAction() != null) {
			workflowService.updateWorkflow(communityHallsBookingRequest, WorkflowStatus.CREATE);
		}

		// 4.Persist the request using persister service
		bookingRepository.saveCommunityHallBooking(communityHallsBookingRequest);

		// 5. Decrypt the data before returning to client
		CommunityHallBookingDetail decryptedBookingDetail = encryptionService.decryptObject(
				communityHallsBookingRequest.getHallsBookingApplication(),
				communityHallsBookingRequest.getRequestInfo());

		return decryptedBookingDetail;
	}

	@Override
	public CommunityHallBookingDetail createInitBooking(
			@Valid CommunityHallBookingRequest communityHallsBookingRequest) {
		log.info("Create community hall temp booking for user : "
				+ communityHallsBookingRequest.getRequestInfo().getUserInfo().getUuid());
		bookingRepository.saveCommunityHallBookingInit(communityHallsBookingRequest);
		return null;
	}

	@Override
	public List<CommunityHallBookingDetail> getBookingDetails(CommunityHallBookingSearchCriteria bookingSearchCriteria,
			RequestInfo info) {
		hallBookingValidator.validateSearch(info, bookingSearchCriteria);
		List<CommunityHallBookingDetail> bookingDetails = new ArrayList<CommunityHallBookingDetail>();
		bookingSearchCriteria = addCreatedByMeToCriteria(bookingSearchCriteria, info);

		log.info("loading data based on criteria" + bookingSearchCriteria);

		// Keep search simple: first fetch from DB based on provided criteria; owner details hydrated after
		String plainMobile = bookingSearchCriteria.getMobileNumber();

		// Encrypt applicant mobile for DB side filter (applicant table)
		if (plainMobile != null && plainMobile.trim().length() > 9) {
			ApplicantDetail applicantDetail = ApplicantDetail.builder()
					.applicantMobileNo(plainMobile).build();
			CommunityHallBookingDetail communityHallBookingDetail = CommunityHallBookingDetail.builder()
					.applicantDetail(applicantDetail).build();
			CommunityHallBookingRequest bookingRequest = CommunityHallBookingRequest.builder()
					.hallsBookingApplication(communityHallBookingDetail).requestInfo(info).build();

			communityHallBookingDetail = encryptionService.encryptObject(bookingRequest);

			bookingSearchCriteria
					.setMobileNumber(communityHallBookingDetail.getApplicantDetail().getApplicantMobileNo());

			log.info("loading data based on criteria after encrypting mobile no : " + bookingSearchCriteria);
		}

		bookingDetails = bookingRepository.getBookingDetails(bookingSearchCriteria);
		if (CollectionUtils.isEmpty(bookingDetails)) {
			return bookingDetails;
		}
		bookingDetails = encryptionService.decryptObject(bookingDetails, info);

		// We will Populate owners using owner UUIDs from DB which will be fetched from the repository using the getUser and user-service user details
		try {
			java.util.List<String> bookingIds = bookingDetails.stream().map(CommunityHallBookingDetail::getBookingId).collect(java.util.stream.Collectors.toList());
			java.util.Map<String, java.util.List<String>> bookingToOwnerUuids = bookingRepository.getOwnerUuidsByBookingIds(bookingIds);
			java.util.Set<String> allOwnerUuids = bookingToOwnerUuids.values().stream().flatMap(java.util.Collection::stream).filter(java.util.Objects::nonNull).collect(java.util.stream.Collectors.toSet());
			if (!allOwnerUuids.isEmpty()) {
				org.upyog.chb.web.models.CommunityHallBookingSearchCriteria tmp = new org.upyog.chb.web.models.CommunityHallBookingSearchCriteria();
				tmp.setTenantId(bookingSearchCriteria.getTenantId());
				tmp.setOwnerIds(allOwnerUuids);
				org.upyog.chb.web.models.user.UserResponse users = chbUserService.getUser(tmp, info);
				java.util.Map<String, OwnerInfo> byUuid = new java.util.HashMap<>();
				if (users != null && users.getUser() != null) {
					for (OwnerInfo u : users.getUser()) {
						if (u.getUuid() != null) byUuid.put(u.getUuid(), u);
					}
				}
				for (CommunityHallBookingDetail bd : bookingDetails) {
					java.util.List<String> uuids = bookingToOwnerUuids.get(bd.getBookingId());
					if (uuids != null && !uuids.isEmpty()) {
						java.util.List<OwnerInfo> owners = new java.util.ArrayList<>();
						for (String uuid : uuids) {
							OwnerInfo o = byUuid.get(uuid);
							if (o != null) owners.add(o);
						}
						bd.setOwners(owners);
					}
				}
			}
		} catch (Exception e) {
			log.warn("Owner user hydration failed: {}", e.getMessage());
		}

		return bookingDetails;
	}

	@Override
	public Integer getBookingCount(@Valid CommunityHallBookingSearchCriteria criteria,
			@NonNull RequestInfo requestInfo) {
		criteria.setCountCall(true);
		Integer bookingCount = 0;

		// Keep count simple as well; do not prefetch ownerIds

		criteria = addCreatedByMeToCriteria(criteria, requestInfo);
		bookingCount = bookingRepository.getBookingCount(criteria);

		return bookingCount;
	}

	private CommunityHallBookingSearchCriteria addCreatedByMeToCriteria(CommunityHallBookingSearchCriteria criteria,
			RequestInfo requestInfo) {
		if (requestInfo.getUserInfo() == null) {
			log.info("Request info is null returning criteira");
			return criteria;
		}
		List<String> roles = new ArrayList<>();
		for (Role role : requestInfo.getUserInfo().getRoles()) {
			roles.add(role.getCode());
		}
		log.info("user roles for searching : " + roles);
		/**
		 * Citizen can see booking details only booked by him
		 */
		List<String> uuids = new ArrayList<>();
		if (roles.contains(CommunityHallBookingConstants.CITIZEN)
				&& !StringUtils.isEmpty(requestInfo.getUserInfo().getUuid())) {
			uuids.add(requestInfo.getUserInfo().getUuid());
			criteria.setCreatedBy(uuids);
			log.debug("loading data of created and by me" + uuids.toString());
		}
		return criteria;
	}

	public CommunityHallBookingDetail updateBooking(CommunityHallBookingRequest communityHallsBookingRequest,
													PaymentDetail paymentDetail, BookingStatusEnum status) {

		if (communityHallsBookingRequest == null || communityHallsBookingRequest.getHallsBookingApplication() == null) {
			throw new CustomException("INVALID_REQUEST", "Booking request or booking application cannot be null");
		}

		String bookingNo = communityHallsBookingRequest.getHallsBookingApplication().getBookingNo();
		String tenantId = communityHallsBookingRequest.getHallsBookingApplication().getTenantId().split("\\.")[0];
		Object mdmsData = mdmsUtil.mDMSCall(communityHallsBookingRequest.getRequestInfo(), tenantId);
		log.info("Updating booking for booking no : {}", bookingNo);

		if (bookingNo == null) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}

		CommunityHallBookingSearchCriteria bookingSearchCriteria = CommunityHallBookingSearchCriteria.builder()
				.bookingNo(bookingNo).build();
		List<CommunityHallBookingDetail> bookingDetails = bookingRepository.getBookingDetails(bookingSearchCriteria);

		if (bookingDetails.isEmpty()) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}

		CommunityHallBookingDetail dbBookingDetail = bookingDetails.get(0);

		hallBookingValidator.validateUpdate(communityHallsBookingRequest.getHallsBookingApplication(), dbBookingDetail);

		// FIRST: Make a copy of original DB documents BEFORE any conversion
		List<DocumentDetail> originalDbDocuments = dbBookingDetail.getUploadedDocumentDetails() == null
				? Collections.emptyList()
				: new ArrayList<>(dbBookingDetail.getUploadedDocumentDetails());

		// Also preserve owners sent by frontend (if any)
		List<OwnerInfo> ownersFromRequest = communityHallsBookingRequest.getHallsBookingApplication().getOwners();

		// Preserve workflow & documents from request
		List<DocumentDetail> uploadedDocumentDetailsFromRequest =
				communityHallsBookingRequest.getHallsBookingApplication().getUploadedDocumentDetails();
		ProcessInstance workflowFromRequest =
				communityHallsBookingRequest.getHallsBookingApplication().getWorkflow();

		convertBookingRequest(communityHallsBookingRequest, dbBookingDetail);

		// Restore workflow & documents
		if (workflowFromRequest != null) {
			communityHallsBookingRequest.getHallsBookingApplication().setWorkflow(workflowFromRequest);
		}
		if (uploadedDocumentDetailsFromRequest != null) {
			communityHallsBookingRequest.getHallsBookingApplication().setUploadedDocumentDetails(uploadedDocumentDetailsFromRequest);
		}

		// Restore owners from request if provided (owners are always sent in update requests)
		if (ownersFromRequest != null && !ownersFromRequest.isEmpty()) {
			communityHallsBookingRequest.getHallsBookingApplication().setOwners(ownersFromRequest);
		}

		// Extract existing document IDs from ORIGINAL DB documents (not the converted ones)
		Set<String> existingDocIds = originalDbDocuments.stream()
				.map(DocumentDetail::getDocumentDetailId)
				.collect(Collectors.toSet());

		log.info("Existing document IDs from DB: {}", existingDocIds);
		if (uploadedDocumentDetailsFromRequest != null) {
			uploadedDocumentDetailsFromRequest.forEach(doc ->
					log.info("Frontend document ID: {} for type: {}", doc.getDocumentDetailId(), doc.getDocumentType()));
		}

		enrichmentService.enrichUpdateBookingRequest(communityHallsBookingRequest, null, existingDocIds);

		if (communityHallsBookingRequest.getHallsBookingApplication().getWorkflow() != null
				&& "VERIFIED".equalsIgnoreCase(communityHallsBookingRequest.getHallsBookingApplication().getWorkflow().getAction())) {
			demandService.createDemand(communityHallsBookingRequest, mdmsData, true);
		}

		if (communityHallsBookingRequest.getHallsBookingApplication().getWorkflow() != null
				&& communityHallsBookingRequest.getHallsBookingApplication().getWorkflow().getAction() != null) {
			State wfState = workflowService.updateWorkflow(communityHallsBookingRequest, WorkflowStatus.UPDATE);
			if (wfState != null && wfState.getApplicationStatus() != null) {
				communityHallsBookingRequest.getHallsBookingApplication().setBookingStatus(wfState.getState());
				log.info("Synced bookingStatus from WF: {}", wfState.getApplicationStatus());
			}
		}

		//set the payment details
		if (paymentDetail != null) {
			communityHallsBookingRequest.getHallsBookingApplication().setReceiptNo(paymentDetail.getReceiptNumber());
			communityHallsBookingRequest.getHallsBookingApplication().setPaymentDate(paymentDetail.getReceiptDate());
		}

		bookingRepository.updateBooking(communityHallsBookingRequest);
		log.info("fetched booking detail and updated status {}",
				communityHallsBookingRequest.getHallsBookingApplication().getBookingStatus());

		return encryptionService.decryptObject(
				communityHallsBookingRequest.getHallsBookingApplication(),
				communityHallsBookingRequest.getRequestInfo());
	}


	/**
	 * We are updating booking status synchronously for updating booking status on
	 * payment success
	 * Deleting the timer entry here after successful update of booking
	 */
	@Transactional
	@Override
	public void updateBookingSynchronously(CommunityHallBookingRequest communityHallsBookingRequest,
			PaymentDetail paymentDetail, BookingStatusEnum status, boolean deleteBookingTimer) {
		String bookingNo = communityHallsBookingRequest.getHallsBookingApplication().getBookingNo();
		log.info("Updating booking synchronously for booking no : " + bookingNo);
		if (bookingNo == null) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}
		CommunityHallBookingSearchCriteria bookingSearchCriteria = CommunityHallBookingSearchCriteria.builder()
				.bookingNo(bookingNo).build();
		List<CommunityHallBookingDetail> bookingDetails = bookingRepository.getBookingDetails(bookingSearchCriteria);
		if (bookingDetails.size() == 0) {
			throw new CustomException("INVALID_BOOKING_CODE",
					"Booking no not valid. Failed to update booking status for : " + bookingNo);
		}
		CommunityHallBookingDetail bookingDetail = bookingDetails.get(0);
		communityHallsBookingRequest.setHallsBookingApplication(bookingDetail);

		// Handle workflow transition for synchronous updates - only if workflow action
		// is provided
		if (communityHallsBookingRequest.getHallsBookingApplication().getWorkflow() != null
				&& communityHallsBookingRequest.getHallsBookingApplication().getWorkflow().getAction() != null) {
			try {
				workflowService.updateWorkflow(communityHallsBookingRequest, WorkflowStatus.UPDATE);
			} catch (Exception e) {
				log.error("Error updating workflow for booking {}: {}", bookingNo, e.getMessage());
				// Continue with status update even if workflow fails
			}
		}

		bookingRepository.updateBookingSynchronously(bookingDetail.getBookingId(),
				communityHallsBookingRequest.getRequestInfo().getUserInfo().getUuid(), paymentDetail, status.toString());
		if (deleteBookingTimer) {
			log.info("Deleting booking timer with booking id  {}",
					communityHallsBookingRequest.getHallsBookingApplication().getBookingId());
			bookingTimerService.deleteBookingTimer(communityHallsBookingRequest.getHallsBookingApplication().getBookingId(),
					false);
		}
	}

	private void convertBookingRequest(CommunityHallBookingRequest communityHallsBookingRequest,
			CommunityHallBookingDetail bookingDetailDB) {
		CommunityHallBookingDetail bookingDetailRequest = communityHallsBookingRequest.getHallsBookingApplication();
		if (bookingDetailDB.getPermissionLetterFilestoreId() == null
				&& bookingDetailRequest.getPermissionLetterFilestoreId() != null) {
			bookingDetailDB.setPermissionLetterFilestoreId(bookingDetailRequest.getPermissionLetterFilestoreId());
		}

		if (bookingDetailDB.getPaymentReceiptFilestoreId() == null
				&& bookingDetailRequest.getPaymentReceiptFilestoreId() != null) {
			bookingDetailDB.setPaymentReceiptFilestoreId(bookingDetailRequest.getPaymentReceiptFilestoreId());
		}
		communityHallsBookingRequest.setHallsBookingApplication(bookingDetailDB);
	}

	@Override
	public CommunityHallSlotAvailabilityResponse getCommunityHallSlotAvailability(
			CommunityHallSlotSearchCriteria criteria, RequestInfo info) {
		if (criteria.getCommunityHallCode() == null && CollectionUtils.isEmpty(criteria.getHallCodes())) {
			throw new CustomException("INVALID_HALL_CODE", "Invalid hall code provided for slot search");
		}
		log.info("criteria : {}", criteria);
		List<CommunityHallSlotAvailabilityDetail> availabiltityDetails = bookingRepository
				.getCommunityHallSlotAvailability(criteria);
		log.info("Availabiltity details fetched from DB :" + availabiltityDetails);

		List<CommunityHallSlotAvailabilityDetail> availabiltityDetailsList = convertToCommunityHallAvailabilityResponse(
				criteria, availabiltityDetails);

		Long timerValue = -1l;
		availabiltityDetailsList = checkTimerTableForAvailaibility(info, criteria, availabiltityDetailsList);
		boolean bookingAllowed = availabiltityDetailsList.stream()
				.anyMatch(detail -> BookingStatusEnum.BOOKED.toString().equals(detail.getSlotStaus()));

		if (!bookingAllowed && criteria.getIsTimerRequired()) {
			timerValue = bookingTimerService.getTimerValue(criteria, info, availabiltityDetailsList);
		}

		CommunityHallSlotAvailabilityResponse hallSlotAvailabilityResponse = CommunityHallSlotAvailabilityResponse
				.builder().hallSlotAvailabiltityDetails(availabiltityDetailsList).timerValue(timerValue).build();

		log.info("Availabiltity details response after updating status :" + hallSlotAvailabilityResponse);
		return hallSlotAvailabilityResponse;
	}

	private List<CommunityHallSlotAvailabilityDetail> checkTimerTableForAvailaibility(
			RequestInfo info, CommunityHallSlotSearchCriteria criteria,
			List<CommunityHallSlotAvailabilityDetail> availabilityDetails) {

		List<BookingPaymentTimerDetails> timerDetails = bookingTimerService.getBookingFromTimerTable(info, criteria);

		// If timer details are null or empty, return availability details as is
		if (timerDetails == null || timerDetails.isEmpty()) {
			log.info("Timer details are null or empty, returning availability details as is.");
			return availabilityDetails;
		}

		Map<CommunityHallSlotAvailabilityDetail, CommunityHallSlotAvailabilityDetail> slotDetailsMap = availabilityDetails
				.stream().collect(Collectors.toMap(Function.identity(), Function.identity()));
		log.info("Timer Details from db : " + timerDetails);

		timerDetails.forEach(detail -> {
			// Create a Slot availability object for comparison
			CommunityHallSlotAvailabilityDetail availabilityDetail = CommunityHallSlotAvailabilityDetail.builder()
					.communityHallCode(detail.getCommunityHallcode()).hallCode(detail.getHallcode())
					.bookingDate(CommunityHallBookingUtil.parseLocalDateToString(detail.getBookingDate(),
							CommunityHallBookingConstants.DATE_FORMAT))
					.tenantId(detail.getTenantId()).build();

			// Check if the timerDetails set contains this booking and if it's created by
			// the current user
			// Update the slot status based on the comparison
			if (availabilityDetails.contains(availabilityDetail)) {
				log.info("Booking created by user id {} and booking id {} ", criteria.getBookingId(),
						info.getUserInfo().getUuid());
				CommunityHallSlotAvailabilityDetail slotAvailabilityDetail = slotDetailsMap.get(availabilityDetail);
				log.info("Slot Availability detail ::: " + slotAvailabilityDetail.toString());
				boolean isCreatedByCurrentUser = detail.getCreatedBy().equals(info.getUserInfo().getUuid());
				boolean existingBookingIdCheck = detail.getBookingId().equals(criteria.getBookingId());

				if (isCreatedByCurrentUser && existingBookingIdCheck) {
					log.info("inside booking created by me with same booking id ");
					slotAvailabilityDetail.setSlotStaus(BookingStatusEnum.AVAILABLE.toString());
				} else {
					slotAvailabilityDetail.setSlotStaus(BookingStatusEnum.BOOKED.toString());
				}
			}

		});

		return availabilityDetails;
	}

	/**
	 * 
	 * @param criteria
	 * @param availabiltityDetails
	 * @return
	 */
	private List<CommunityHallSlotAvailabilityDetail> convertToCommunityHallAvailabilityResponse(
			CommunityHallSlotSearchCriteria criteria, List<CommunityHallSlotAvailabilityDetail> availabiltityDetails) {

		List<CommunityHallSlotAvailabilityDetail> availabiltityDetailsList = new ArrayList<CommunityHallSlotAvailabilityDetail>();
		LocalDate startDate = CommunityHallBookingUtil.parseStringToLocalDate(criteria.getBookingStartDate());

		LocalDate endDate = CommunityHallBookingUtil.parseStringToLocalDate(criteria.getBookingEndDate());

		List<LocalDate> totalDates = new ArrayList<>();
		// Calculating list of dates for booking
		while (!startDate.isAfter(endDate)) {
			totalDates.add(startDate);
			startDate = startDate.plusDays(1);
		}

		// Move the no of days to application properties File
		if (totalDates.size() > 3) {
			throw new CustomException(CommunityHallBookingConstants.INVALID_BOOKING_DATE_RANGE,
					"Booking is not allowed for this no of days.");
		}

		totalDates.stream().forEach(date -> {
			List<String> hallCodes = new ArrayList<>();
			if (StringUtils.isNotBlank(criteria.getHallCode())) {
				hallCodes.add(criteria.getHallCode());
			} else {
				hallCodes.addAll(criteria.getHallCodes());
			}
			hallCodes.stream().forEach(data -> {
				availabiltityDetailsList.add(createCommunityHallSlotAvailabiltityDetail(criteria, date, data));
			});
		});

		// Setting hall status to booked if it is already booked by checking in the
		// database entry
		availabiltityDetailsList.stream().forEach(detail -> {
			if (availabiltityDetails.contains(detail)) {
				detail.setSlotStaus(BookingStatusEnum.BOOKED.toString());
			}
		});

		return availabiltityDetailsList;
	}

	private CommunityHallSlotAvailabilityDetail createCommunityHallSlotAvailabiltityDetail(
			CommunityHallSlotSearchCriteria criteria, LocalDate date, String hallCode) {
		CommunityHallSlotAvailabilityDetail availabiltityDetail = CommunityHallSlotAvailabilityDetail.builder()
				.communityHallCode(criteria.getCommunityHallCode()).hallCode(hallCode)
				// Setting slot status available for every hall and hall code
				.slotStaus(BookingStatusEnum.AVAILABLE.toString()).tenantId(criteria.getTenantId())
				.bookingDate(CommunityHallBookingUtil.parseLocalDateToString(date, "dd-MM-yyyy")).build();
		return availabiltityDetail;
	}

}
