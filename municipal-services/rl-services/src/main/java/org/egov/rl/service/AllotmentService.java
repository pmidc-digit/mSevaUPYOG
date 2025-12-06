package org.egov.rl.service;

import java.security.acl.Owner;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.models.user.User;
import org.egov.rl.models.user.UserDetailResponse;
import org.egov.rl.producer.PropertyProducer;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class AllotmentService {

	@Autowired
	private PropertyProducer producer;

	@Autowired
	private RentLeaseConfiguration config;

	@Autowired
	private AllotmentEnrichmentService allotmentEnrichmentService;

	@Autowired
	private AllotmentValidator allotmentValidator;

	@Autowired
	private AllotmentWorkflowService wfService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;

	@Autowired
	BoundaryService boundaryService;

	@Autowired
	UserService userService;
	
	@Autowired
	AllotmentRepository allotmentRepository;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public AllotmentDetails allotmentCreate(AllotmentRequest allotmentRequest) {

		allotmentValidator.validateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichCreateRequest(allotmentRequest);
		userService.createUser(allotmentRequest);

		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().setStatus("ACTIVE");
		}
		String previousApplicationNumber = allotmentRequest.getAllotment().getPreviousApplicationNumber();
		if (previousApplicationNumber != null && previousApplicationNumber.trim().length() > 0) {
			AllotmentDetails allotment = allotmentRequest.getAllotment();
			allotment.setApplicationType("RENEWAL");
			allotmentRequest.setAllotment(allotment);
		} else {
			AllotmentDetails allotment = allotmentRequest.getAllotment();
			allotment.setApplicationType("NEW");
			allotmentRequest.setAllotment(allotment);
		}
		producer.push(config.getSaveRLAllotmentTopic(), allotmentRequest);
		allotmentRequest.getAllotment().setWorkflow(null);
		return allotmentRequest.getAllotment();
	}

	public AllotmentDetails allotmentUpdate(AllotmentRequest allotmentRequest) {

		allotmentValidator.validateUpdateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichUpdateRequest(allotmentRequest);
		userService.createUser(allotmentRequest);
		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment();
		allotmentRequest.setAllotment(allotmentDetails);
		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().setStatus("ACTIVE");
		}

		producer.push(config.getUpdateRLAllotmentTopic(), allotmentRequest);
		allotmentRequest.getAllotment().setWorkflow(null);
		return allotmentRequest.getAllotment();
	}

	public AllotmentRequest allotmentSearch(AllotmentRequest allotmentRequest) {
		allotmentRequest.setAllotment(searchAllotedProperty(allotmentRequest));
		return allotmentRequest;
	}

	public AllotmentDetails searchAllotedProperty(AllotmentRequest allotmentRequest) {

		AllotmentCriteria allotmentCriteria = new AllotmentCriteria();
		Set<String> id = new HashSet<>();
		id.add(allotmentRequest.getAllotment().getId());
		allotmentCriteria.setAllotmentIds(id);
		allotmentCriteria.setTenantId(allotmentRequest.getAllotment().getTenantId());

//		AllotmentDetails allotmentDetails= Optional.ofNullable(.get(0)).orElse(null);
		AllotmentDetails allotmentDetails = allotmentEnrichmentService
				.searchAllotment(allotmentRequest.getRequestInfo(), allotmentCriteria).stream().findFirst()
				.orElse(null);
		List<OwnerInfo> ownerList = allotmentDetails.getOwnerInfo().stream().map(u -> {
			String[] tenantId = allotmentRequest.getAllotment().getTenantId().split("\\.");
			User userDetails = userService
					.searchByUuid(u.getUserUuid(),
							tenantId.length > 1 ? tenantId[0] : allotmentRequest.getAllotment().getTenantId())
					.getUser().get(0);
			String[] names = userDetails.getName().split("\\s+");
			u.setFirstName(names.length > 0 ? names[0] : "");
			u.setMiddleName(names.length > 1 ? names[1] : "");
			u.setLastName(names.length > 2 ? names[2] : "");
			org.egov.rl.models.oldProperty.Address permemantAddress = Address.builder()
					.addressLine1(userDetails.getPermanentAddress()).city(userDetails.getPermanentCity())
					.pincode(userDetails.getPermanentPincode()).build();
			u.setPermanentAddress(permemantAddress);
			org.egov.rl.models.oldProperty.Address crosAddress = Address.builder()
					.addressLine1(userDetails.getCorrespondenceAddress()).city(userDetails.getCorrespondenceCity())
					.pincode(userDetails.getCorrespondencePincode()).build();
			u.setCorrespondenceAddress(crosAddress);
			u.setMobileNo(userDetails.getMobileNumber());
			u.setEmailId(userDetails.getEmailId());
			u.setDob(userDetails.getDob());
			u.setActive(userDetails.getActive());
			return u;
		}).collect(Collectors.toList());
		allotmentDetails.setOwnerInfo(ownerList);
		JsonNode additionalDetails = boundaryService.loadPropertyData(allotmentRequest);
		allotmentDetails.setAdditionalDetails(additionalDetails);

		return allotmentDetails;
	}

	public List<AllotmentDetails> searchAllotedApplications(RequestInfo requestInfo,
			AllotmentCriteria allotmentCriteria) {

// Handle mobile number search by converting to owner UUIDs
		if (!ObjectUtils.isEmpty(allotmentCriteria.getMobileNumber())) {
			System.out.println("DEBUG: Searching by mobile number: " + allotmentCriteria.getMobileNumber());

			List<String> userUuids1 = userService.getUserUuidsByMobileNumber(
					allotmentCriteria.getMobileNumber(), allotmentCriteria.getTenantId(),
					requestInfo);
			Set<String> userUuidSet = new HashSet<>(userUuids1);
			System.out.println("DEBUG: Found user UUIDs: " + userUuidSet);

			if (CollectionUtils.isEmpty(userUuidSet)) {
// No users found for this mobile number, return empty list
				System.out.println("DEBUG: No users found for mobile number, returning empty list");
				return new ArrayList<>();
			}

// Set owner UUIDs for search and clear mobile number
			allotmentCriteria.setOwnerIds(userUuidSet);
			allotmentCriteria.setMobileNumber(null);
			System.out.println("DEBUG: Set ownerUuids in criteria: " + allotmentCriteria.getOwnerIds());
		}

		List<AllotmentDetails> applications = allotmentRepository.getAllotedApplications(allotmentCriteria);
		applications=applications.stream().map(d->{
		d.setOwnerInfo(allotmentRepository.getOwnerInfoListByAllotmentId(d.getId()));
		return d;}).collect(Collectors.toList());
		if (CollectionUtils.isEmpty(applications))
			return new ArrayList<>();
		allotmentEnrichmentService.enrichOwnerDetailsFromUserService(applications, requestInfo);

		return applications;
	}

}
