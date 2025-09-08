package org.upyog.chb.service;

import java.util.List;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.upyog.chb.config.CommunityHallBookingConfiguration;
import org.upyog.chb.enums.BookingStatusEnum;
import org.upyog.chb.repository.IdGenRepository;
import org.upyog.chb.util.CommunityHallBookingUtil;
import org.upyog.chb.web.models.AuditDetails;
import org.upyog.chb.web.models.CommunityHallBookingDetail;
import org.upyog.chb.web.models.CommunityHallBookingRequest;
import org.upyog.chb.web.models.idgen.IdResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EnrichmentService {

	@Autowired
	private CommunityHallBookingConfiguration config;

	@Autowired
	private IdGenRepository idGenRepository;

	public void enrichCreateBookingRequest(CommunityHallBookingRequest bookingRequest) {
		String bookingId = CommunityHallBookingUtil.getRandonUUID();
		log.info("Enriching booking request for booking id :" + bookingId);
		
		CommunityHallBookingDetail bookingDetail = bookingRequest.getHallsBookingApplication();
		RequestInfo requestInfo = bookingRequest.getRequestInfo();
		AuditDetails auditDetails = CommunityHallBookingUtil.getAuditDetails(requestInfo.getUserInfo().getUuid(), true);
		
		bookingDetail.setAuditDetails(auditDetails);
		bookingDetail.setBookingId(bookingId);
		bookingDetail.setApplicationDate(auditDetails.getCreatedTime());
		// Remove manual status setting - let workflow engine handle status
		
		//Updating id for slot details (remove manual status setting)
		bookingDetail.getBookingSlotDetails().stream().forEach(slot -> {
			slot.setBookingId(bookingId);
			slot.setSlotId(CommunityHallBookingUtil.getRandonUUID());
			// Remove manual slot status setting - workflow will handle this
			slot.setAuditDetails(auditDetails);
		});
		
		//Updating id booking in documents
		bookingDetail.getUploadedDocumentDetails().stream().forEach(document -> {
			document.setBookingId(bookingId);
			document.setDocumentDetailId(CommunityHallBookingUtil.getRandonUUID());
			document.setAuditDetails(auditDetails);
		});


		bookingDetail.getApplicantDetail().setBookingId(bookingId);
		bookingDetail.getApplicantDetail().setApplicantDetailId(CommunityHallBookingUtil.getRandonUUID());
		bookingDetail.getApplicantDetail().setAuditDetails(auditDetails);
	
		
		bookingDetail.getAddress().setAddressId(CommunityHallBookingUtil.getRandonUUID());
		bookingDetail.getAddress().setApplicantDetailId(bookingDetail.getApplicantDetail().getApplicantDetailId());

		List<String> customIds = getIdList(requestInfo, bookingDetail.getTenantId(),
				config.getCommunityHallBookingIdKey(), config.getCommunityHallBookingIdFromat(), 1);
		
		log.info("Enriched booking request for booking no :" + customIds.get(0));

		bookingDetail.setBookingNo(customIds.get(0));

		// Set business service and module name in workflow if workflow object is provided
		if (bookingDetail.getWorkflow() != null) {
			bookingDetail.getWorkflow().setBusinessService(config.getBusinessServiceName());
			bookingDetail.getWorkflow().setModuleName(config.getModuleName());
			bookingDetail.getWorkflow().setTenantId(bookingDetail.getTenantId());
			bookingDetail.getWorkflow().setBusinessId(customIds.get(0));
		}

	}

	/**
	 * Returns a list of numbers generated from idgen
	 *
	 * @param requestInfo RequestInfo from the request
	 * @param tenantId    tenantId of the city
	 * @param idKey       code of the field defined in application properties for
	 *                    which ids are generated for
	 * @param idformat    format in which ids are to be generated
	 * @param count       Number of ids to be generated
	 * @return List of ids generated using idGen service
	 */
	private List<String> getIdList(RequestInfo requestInfo, String tenantId, String idKey, String idformat, int count) {
		List<IdResponse> idResponses = idGenRepository.getId(requestInfo, tenantId, idKey, idformat, count)
				.getIdResponses();

		if (CollectionUtils.isEmpty(idResponses))
			throw new CustomException("IDGEN ERROR", "No ids returned from idgen Service");

		return idResponses.stream().map(IdResponse::getId).collect(Collectors.toList());
	}

	public void enrichUpdateBookingRequest(CommunityHallBookingRequest communityHallsBookingRequest, BookingStatusEnum statusEnum) {
		AuditDetails auditDetails = CommunityHallBookingUtil.getAuditDetails(communityHallsBookingRequest.getRequestInfo().getUserInfo().getUuid(), false);
		CommunityHallBookingDetail bookingDetail = communityHallsBookingRequest.getHallsBookingApplication();
		
		// Remove manual status setting - workflow engine will handle all status transitions
		// Only set payment date for payment-related updates
		if (statusEnum != null && (statusEnum == BookingStatusEnum.BOOKED || statusEnum == BookingStatusEnum.PAYMENT_FAILED)) {
			communityHallsBookingRequest.getHallsBookingApplication().setPaymentDate(auditDetails.getLastModifiedTime());
		}
		
		communityHallsBookingRequest.getHallsBookingApplication().setAuditDetails(auditDetails);
		
		// Enrich workflow metadata if workflow object exists
		if (bookingDetail.getWorkflow() != null) {
			bookingDetail.getWorkflow().setBusinessService("CHB");
			bookingDetail.getWorkflow().setModuleName("CHB");
			bookingDetail.getWorkflow().setTenantId(bookingDetail.getTenantId());
			bookingDetail.getWorkflow().setBusinessId(bookingDetail.getBookingNo());
		}
	}

}
