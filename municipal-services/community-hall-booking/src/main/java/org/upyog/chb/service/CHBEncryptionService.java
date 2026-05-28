package org.upyog.chb.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.chb.constants.CommunityHallBookingConstants;
import org.upyog.chb.util.EncryptionDecryptionUtil;
import org.upyog.chb.web.models.ApplicantDetail;
import org.upyog.chb.web.models.CommunityHallBookingDetail;
import org.upyog.chb.web.models.CommunityHallBookingRequest;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CHBEncryptionService {

	@Autowired
	private EncryptionDecryptionUtil encryptionDecryptionUtil;

	public CommunityHallBookingDetail encryptObject(CommunityHallBookingRequest bookingRequest) {
		ApplicantDetail applicantDetail = bookingRequest.getHallsBookingApplication().getApplicantDetail();
		log.info("Applicant detail before encyption : " + applicantDetail.getApplicantMobileNo());
		applicantDetail.setApplicantName(encryptionDecryptionUtil.encryptValue(applicantDetail.getApplicantName()));
		applicantDetail.setApplicantMobileNo(encryptionDecryptionUtil.encryptValue(applicantDetail.getApplicantMobileNo()));
		applicantDetail.setApplicantAlternateMobileNo(
				encryptionDecryptionUtil.encryptValue(applicantDetail.getApplicantAlternateMobileNo()));
		applicantDetail.setApplicantEmailId(encryptionDecryptionUtil.encryptValue(applicantDetail.getApplicantEmailId()));
		log.info("Applicant detail after encyption : " + applicantDetail.getApplicantMobileNo());
		bookingRequest.getHallsBookingApplication().setApplicantDetail(applicantDetail);
		return bookingRequest.getHallsBookingApplication();
	}
	
	
	public CommunityHallBookingDetail decryptObject(CommunityHallBookingDetail bookingDetail, RequestInfo requestInfo) {
		ApplicantDetail applicantDetail = bookingDetail.getApplicantDetail();
		log.info("Applicant detail before decryption : " + applicantDetail.getApplicantMobileNo());
		applicantDetail.setApplicantName(encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantName()));
		applicantDetail.setApplicantMobileNo(encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantMobileNo()));
		applicantDetail.setApplicantAlternateMobileNo(
				encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantAlternateMobileNo()));
		applicantDetail.setApplicantEmailId(encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantEmailId()));
				
		log.info("Applicant detail after decryption : " + applicantDetail.getApplicantMobileNo());
		bookingDetail.setApplicantDetail(applicantDetail);

		return bookingDetail;
	}
	
	public List<CommunityHallBookingDetail> decryptObject(List<CommunityHallBookingDetail> bookingDetails, RequestInfo requestInfo) {
		List<ApplicantDetail> applicantDetails = bookingDetails.stream()
				.map(CommunityHallBookingDetail::getApplicantDetail)
				.collect(Collectors.toList());

		log.info("Applicant detail before decryption : " + applicantDetails.get(0).getApplicantMobileNo());
		bookingDetails.forEach(detail -> {
			ApplicantDetail applicantDetail = detail.getApplicantDetail();
			if (applicantDetail != null) {
				applicantDetail.setApplicantName(
						encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantName()));
				applicantDetail.setApplicantMobileNo(
						encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantMobileNo()));
				applicantDetail.setApplicantAlternateMobileNo(
						encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantAlternateMobileNo()));
				applicantDetail.setApplicantEmailId(
						encryptionDecryptionUtil.decryptValue(applicantDetail.getApplicantEmailId()));
			}
		});

		log.info("Applicant detail after decryption : " + applicantDetails.get(0).getApplicantMobileNo());

		return bookingDetails;
	}

}
