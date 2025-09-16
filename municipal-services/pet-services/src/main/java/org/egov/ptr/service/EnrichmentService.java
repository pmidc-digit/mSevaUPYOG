package org.egov.ptr.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.egov.common.contract.request.RequestInfo;
import org.egov.ptr.config.PetConfiguration;
import org.egov.ptr.models.Address;
import org.egov.ptr.models.AuditDetails;
import org.egov.ptr.models.Owner;
import org.egov.ptr.models.PetDetails;
import org.egov.ptr.models.PetRegistrationApplication;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.models.PetRenewalAuditDetails;
import org.egov.ptr.repository.OwnerRepository;
import org.egov.ptr.util.PetUtil;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

import static org.egov.ptr.util.PTRConstants.*;

@Slf4j
@Service
public class EnrichmentService {

	@Autowired
	private PetConfiguration config;

	@Autowired
	private UserService userService;

	@Autowired
	private PetUtil petUtil;

	@Autowired
	private OwnerRepository ownerRepository;

	public void enrichPetApplication(PetRegistrationRequest petRegistrationRequest) {
		RequestInfo requestInfo = petRegistrationRequest.getRequestInfo();
		List<PetRegistrationApplication> applications = petRegistrationRequest.getPetRegistrationApplications();
		String tenantId = applications.get(0).getTenantId();

		// Generate a list of application numbers using ID generator
		List<String> petRegistrationIdList = petUtil.getIdList(requestInfo, tenantId, config.getPetIdGenName(),
				config.getPetIdGenFormat(), applications.size());


//		List<String> petRegistrationIdList = Arrays.asList(UUID.randomUUID().toString());
		// Prepare audit details once (can be reused across applications)
		AuditDetails commonAuditDetails = AuditDetails.builder().createdBy(requestInfo.getUserInfo().getUuid())
				.createdTime(System.currentTimeMillis()).lastModifiedBy(requestInfo.getUserInfo().getUuid())
				.lastModifiedTime(System.currentTimeMillis()).build();

		LocalDateTime nextMarch31At8PM = calculateNextMarch31At8PM();
		long validityDateUnix = nextMarch31At8PM.atZone(ZoneId.systemDefault()).toEpochSecond();

		int index = 0;
		for (PetRegistrationApplication application : applications) {
			

			// Set common audit details, ID, and application number
			application.setAuditDetails(commonAuditDetails);
			application.setId(UUID.randomUUID().toString());
			application.setApplicationNumber(petRegistrationIdList.get(index++));
			application.setValidityDate(validityDateUnix);
//			application.setStatus(STATUS_APPLIED);
			application.setExpireFlag(false);

			// Enrich address, pet details, and owner
			enrichAddress(application);
			enrichPetDetails(application);
			enrichOwner(application, requestInfo);


			if (isRenewPetApplication(application)) {
				enrichRenewalDetails(application, validityDateUnix);
			}

			// Enrich documents if any
			if (!CollectionUtils.isEmpty(application.getDocuments())) {
				enrichDocuments(application);
			}
		}
	}

	private boolean isNewPetApplication(PetRegistrationApplication application) {
		String petToken = application.getPetToken();
		return NEW_PET_APPLICATION.equals(application.getApplicationType())
				&& (petToken == null || petToken.isEmpty());
	}

	private boolean isRenewPetApplication(PetRegistrationApplication application) {
		return RENEW_PET_APPLICATION.equals(application.getApplicationType());
	}

	private void enrichNewPetToken(PetRegistrationApplication application, RequestInfo requestInfo, String tenantId) {
		try {
			List<String> tokenIds = petUtil.getIdList(requestInfo, tenantId,
					config.getPetTokenName(), config.getPetTokenFormat(), 1);

			if (tokenIds == null || tokenIds.isEmpty()) {
				log.error("ID generation service returned empty list");
				throw new CustomException("IDGEN_ERROR", "Failed to generate pet token");
			}

			application.setPetToken(tokenIds.get(0));
		} catch (Exception e) {
			log.error("Error calling ID generation service: {}", e.getMessage());
			// Fallback token generation
			String fallbackToken = "PG-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
					+ "-" + System.currentTimeMillis();
			application.setPetToken(fallbackToken);
		}
	}

	private void enrichAddress(PetRegistrationApplication application) {
		Address address = application.getAddress();
		address.setRegistrationId(application.getId());
		address.setId(UUID.randomUUID().toString());
	}

	private void enrichPetDetails(PetRegistrationApplication application) {
		PetDetails petDetails = application.getPetDetails();
		petDetails.setPetDetailsId(application.getId());
		petDetails.setId(UUID.randomUUID().toString());
	}

	private void enrichOwner(PetRegistrationApplication application, RequestInfo requestInfo) {
		Owner owner = application.getOwner();
		if (owner != null) {
			// Set default values for owner
			owner.setUuid(UUID.randomUUID().toString());
			owner.setIsPrimaryOwner(true); // Default to primary owner
			owner.setOwnerType("INDIVIDUAL"); // Default owner type
			owner.setStatus("ACTIVE");
			owner.setTenantId(application.getTenantId());
			
			// Set owner name and mobile number from application for user service integration
			owner.setName(application.getOwner().getName());
			owner.setMobileNumber(application.getOwner().getMobileNumber());
			owner.setEmailId(application.getOwner().getEmailId());
		}
	}

	private void enrichRenewalDetails(PetRegistrationApplication application, long validityDateUnix) {
		PetRenewalAuditDetails petRenewalAuditDetails = new PetRenewalAuditDetails();
		petRenewalAuditDetails.setId(application.getPetToken());
		petRenewalAuditDetails.setApplicationNumber(application.getApplicationNumber());
		petRenewalAuditDetails.setPreviousapplicationnumber(application.getPreviousApplicationNumber());
		petRenewalAuditDetails.setExpiryDate(validityDateUnix);
		petRenewalAuditDetails.setRenewalDate(System.currentTimeMillis());
		petRenewalAuditDetails.setTokenNumber(application.getPetToken());
		petRenewalAuditDetails.setPetRegistrationId(application.getId());

	}

	private void enrichDocuments(PetRegistrationApplication application) {
		application.getDocuments().forEach(doc -> {
			if (doc.getId() == null) {
				doc.setId(UUID.randomUUID().toString());
				doc.setActive(true);
				doc.setTenantId(application.getTenantId());
				doc.setAuditDetails(application.getAuditDetails());
			}
		});
	}

	private LocalDateTime calculateNextMarch31At8PM() {
		LocalDate today = LocalDate.now();
		LocalDate nextMarch31 = LocalDate.of(today.getYear(), Month.MARCH, 31);
		if (today.isAfter(nextMarch31)) {
			nextMarch31 = nextMarch31.plusYears(1);
		}
		return LocalDateTime.of(nextMarch31, LocalTime.of(20, 0));
	}

	public void enrichPetApplicationUponUpdate(PetRegistrationRequest petRegistrationRequest) {
		// Enrich lastModifiedTime and lastModifiedBy in case of update
		enrichDocuments(petRegistrationRequest.getPetRegistrationApplications().get(0));
		for (PetRegistrationApplication application : petRegistrationRequest.getPetRegistrationApplications()) {
			application.getAuditDetails().setLastModifiedTime(System.currentTimeMillis());
			application.getAuditDetails()
					.setLastModifiedBy(petRegistrationRequest.getRequestInfo().getUserInfo().getUuid());
			if (application.getWorkflow().getAction().equals(ACTION_VERIFY)) {
				application.setStatus(STATUS_DOCVERIFIED);
			} else if (application.getWorkflow().getAction().equals(ACTION_REJECT)) {
				application.setStatus(STATUS_REJECTED);
			} else if (application.getWorkflow().getAction().equals(ACTION_APPROVE)) {
				application.setStatus(STATUS_APPROVED);
				if (isNewPetApplication(application)) {
					enrichNewPetToken(application, petRegistrationRequest.getRequestInfo(), application.getTenantId());
					log.info("Pet Token Generated : "+ application.getPetToken());
				}
			}
		}
	}

	/**
	 * Enriches user details for search results
	 *
	 * @param applications List of pet registration applications
	 * @param requestInfo Request info containing user information
	 */
	public void enrichUserDetails(List<PetRegistrationApplication> applications, RequestInfo requestInfo) {
		if (CollectionUtils.isEmpty(applications)) {
			return;
		}

		for (PetRegistrationApplication application : applications) {
			// Initialize owner from registration fields if missing
			if (application.getOwner() == null) {
				Owner owner = Owner.builder()
					.tenantId(application.getTenantId())
					.name("") // Will be populated from user service
					.mobileNumber("") // Will be populated from user service
					.emailId("") // Will be populated from user service
					.build();
				application.setOwner(owner);
			}

			// Enrich owner with user details from user service
			if (application.getOwner() != null) {
				enrichOwnerUserDetails(application.getOwner(), requestInfo);
			}
		}
	}

	/**
	 * Enriches owner user details by fetching from user service
	 *
	 * @param owner Owner object to enrich
	 * @param requestInfo Request info containing user information
	 */
	private void enrichOwnerUserDetails(Owner owner, RequestInfo requestInfo) {
		try {
			// Create user search request based on owner details
			org.egov.ptr.models.user.UserSearchRequest userSearchRequest = userService
					.getBaseUserSearchRequest(owner.getTenantId(), requestInfo);

			// Search by mobile number if available
			if (owner.getMobileNumber() != null) {
				userSearchRequest.setMobileNumber(owner.getMobileNumber());
			}

			// Search by name if available
			if (owner.getName() != null) {
				userSearchRequest.setName(owner.getName());
			}

			// Fetch user details
			org.egov.ptr.models.user.UserDetailResponse userDetailResponse = userService.getUser(userSearchRequest);

			// If user found, enrich owner with user details
			if (userDetailResponse != null && !CollectionUtils.isEmpty(userDetailResponse.getUser())) {
				org.egov.ptr.models.user.User user = userDetailResponse.getUser().get(0);
				enrichOwnerFromUser(owner, user);
			}
		} catch (Exception e) {
			log.warn("Failed to enrich user details for owner: {}", e.getMessage());
		}
	}

	/**
	 * Enriches owner object with user details
	 *
	 * @param owner Owner object to enrich
	 * @param user User object containing user details
	 */
	private void enrichOwnerFromUser(Owner owner, org.egov.ptr.models.user.User user) {
		// Set user-specific fields
		owner.setId(user.getId());
		owner.setUuid(user.getUuid());
		owner.setUserName(user.getUserName());
		owner.setActive(user.getActive());
		owner.setCreatedBy(user.getCreatedBy());
		owner.setCreatedDate(user.getCreatedDate());
		owner.setLastModifiedBy(user.getLastModifiedBy());
		owner.setLastModifiedDate(user.getLastModifiedDate());
		// Set roles directly since Owner model uses the same Role type
		owner.setRoles(user.getRoles());
		owner.setType(user.getType());
		owner.setTenantId(user.getTenantId());
		// Set father/husband name
		owner.setFatherOrHusbandName(user.getFatherOrHusbandName());
	}

	/**
	 * Saves owner metadata to the ptr_owner table
	 */
	public void saveOwnerMetadata(PetRegistrationRequest petRegistrationRequest) {
		PetRegistrationApplication application = petRegistrationRequest.getPetRegistrationApplications().get(0);
		Owner owner = application.getOwner();
		
		if (owner != null) {
			ownerRepository.saveOwner(
				owner,
				application.getId(),
				application.getTenantId(),
				petRegistrationRequest.getRequestInfo().getUserInfo().getUuid(),
				System.currentTimeMillis()
			);
		}
	}

	/**
	 * Enriches owner details from user service for search results
	 */
	public void enrichOwnerDetailsFromUserService(List<PetRegistrationApplication> applications, RequestInfo requestInfo) {
		for (PetRegistrationApplication application : applications) {
			Owner owner = application.getOwner();
			if (owner != null && owner.getUuid() != null) {
				try {
					// Fetch user details from user service using the stored UUID
					org.egov.ptr.models.user.UserSearchRequest userSearchRequest = 
						userService.getBaseUserSearchRequest(application.getTenantId(), requestInfo);
					userSearchRequest.setUuid(java.util.Collections.singleton(owner.getUuid()));
					
					org.egov.ptr.models.user.UserDetailResponse userDetailResponse = 
						userService.getUser(userSearchRequest);
					
					if (userDetailResponse != null && !CollectionUtils.isEmpty(userDetailResponse.getUser())) {
						org.egov.ptr.models.user.User user = userDetailResponse.getUser().get(0);
						
						// Populate owner with complete user details
						owner.setId(user.getId());
						owner.setUuid(user.getUuid());
						owner.setUserName(user.getUserName());
						owner.setPassword(user.getPassword());
						owner.setSalutation(user.getSalutation());
						owner.setName(user.getName());
						owner.setGender(user.getGender());
						owner.setMobileNumber(user.getMobileNumber());
						owner.setEmailId(user.getEmailId());
						owner.setAltContactNumber(user.getAltContactNumber());
						owner.setPan(user.getPan());
						owner.setAadhaarNumber(user.getAadhaarNumber());
						owner.setPermanentAddress(user.getPermanentAddress());
						owner.setPermanentCity(user.getPermanentCity());
						owner.setPermanentPincode(user.getPermanentPincode());
						owner.setCorrespondenceCity(user.getCorrespondenceCity());
						owner.setCorrespondencePincode(user.getCorrespondencePincode());
						owner.setCorrespondenceAddress(user.getCorrespondenceAddress());
						owner.setActive(user.getActive());
						owner.setDob(user.getDob());
						owner.setPwdExpiryDate(user.getPwdExpiryDate());
						owner.setLocale(user.getLocale());
						owner.setType(user.getType());
						owner.setSignature(user.getSignature());
						owner.setAccountLocked(user.getAccountLocked());
						owner.setRoles(user.getRoles());
						owner.setFatherOrHusbandName(user.getFatherOrHusbandName());
						owner.setBloodGroup(user.getBloodGroup());
						owner.setIdentificationMark(user.getIdentificationMark());
						owner.setPhoto(user.getPhoto());
						owner.setCreatedBy(user.getCreatedBy());
						owner.setCreatedDate(user.getCreatedDate());
						owner.setLastModifiedBy(user.getLastModifiedBy());
						owner.setLastModifiedDate(user.getLastModifiedDate());
						owner.setTenantId(user.getTenantId());
						
						// Populate father name in the application from user service
						application.setFatherName(user.getFatherOrHusbandName());
					}
				} catch (Exception e) {
					// Log error but don't fail the search
					System.err.println("Error fetching user details for owner: " + owner.getUuid() + ", Error: " + e.getMessage());
				}
			}
		}
	}
}
