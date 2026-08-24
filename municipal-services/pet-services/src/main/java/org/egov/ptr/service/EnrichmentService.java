package org.egov.ptr.service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.egov.common.contract.request.RequestInfo;
import org.egov.ptr.config.PetConfiguration;
import org.egov.ptr.models.*;
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

	@Autowired
	private org.egov.ptr.repository.PetRegistrationRepository petRegistrationRepository;

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
				// Try to copy petRegistrationNumber and petToken from previous application if available
				copyPetRegistrationNumberFromPreviousApplication(application, requestInfo);
				// Calculate and update pet age based on previous application age and time elapsed
				calculateUpdatedPetAge(application, requestInfo);
				enrichRenewalDetails(application, validityDateUnix);

				// Final verification: Log the petRegistrationNumber and petToken values after enrichment
				log.info("FINAL CHECK - Renewal application enriched - ApplicationNumber: {}, petRegistrationNumber: {}, petToken: {}",
						application.getApplicationNumber(),
						application.getPetRegistrationNumber() != null ? application.getPetRegistrationNumber() : "NULL - WILL NOT BE SAVED TO DB",
						application.getPetToken() != null ? application.getPetToken() : "NULL - WILL NOT BE SAVED TO DB");
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

	/**
	 * Copies petRegistrationNumber and petToken from previous application for renewal applications
	 * This method ensures that renewal applications inherit these values from the previous application
	 * and they are saved to the database at create time.
	 */
	private void copyPetRegistrationNumberFromPreviousApplication(PetRegistrationApplication application, RequestInfo requestInfo) {
		try {
			// Check if both values are already set
			boolean petRegNumSet = application.getPetRegistrationNumber() != null && !application.getPetRegistrationNumber().isEmpty();
			boolean petTokenSet = application.getPetToken() != null && !application.getPetToken().isEmpty();
			
			if (petRegNumSet && petTokenSet) {
				log.info("petRegistrationNumber and petToken already set for renewal application: {} - petRegNum: {}, petToken: {}", 
						application.getApplicationNumber(), application.getPetRegistrationNumber(), application.getPetToken());
				return;
			}

			// Validate that previousApplicationNumber is provided
			if (application.getPreviousApplicationNumber() == null || application.getPreviousApplicationNumber().isEmpty()) {
				log.error("previousApplicationNumber is null or empty for renewal application: {}. Cannot copy petToken and petRegistrationNumber.", 
						application.getApplicationNumber());
				throw new CustomException("PREVIOUS_APPLICATION_NUMBER_REQUIRED", 
						"previousApplicationNumber is required for renewal applications to copy petToken and petRegistrationNumber");
			}

			log.info("Looking for petRegistrationNumber and petToken in previous application: {} for renewal: {}", 
					application.getPreviousApplicationNumber(), application.getApplicationNumber());
			
			// Search for previous application by application number
			PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
					.applicationNumber(Collections.singletonList(application.getPreviousApplicationNumber()))
					.tenantId(application.getTenantId())
					.build();
			List<PetRegistrationApplication> previousApps = petRegistrationRepository.getApplications(criteria);
			
			if (previousApps == null || previousApps.isEmpty()) {
				log.error("Previous application not found: {} for renewal: {}. Cannot copy petToken and petRegistrationNumber.", 
						application.getPreviousApplicationNumber(), application.getApplicationNumber());
				throw new CustomException("PREVIOUS_APPLICATION_NOT_FOUND", 
						"Previous application with number " + application.getPreviousApplicationNumber() + " not found. Cannot copy petToken and petRegistrationNumber for renewal.");
			}

			PetRegistrationApplication previousApp = previousApps.get(0);
			log.info("Found previous application: {} with petRegistrationNumber: {}, petToken: {}", 
					previousApp.getApplicationNumber(), 
					previousApp.getPetRegistrationNumber(), 
					previousApp.getPetToken());
			
			boolean copiedAny = false;
			
			// Copy petRegistrationNumber if not already set and available in previous app
			if (!petRegNumSet) {
				if (previousApp.getPetRegistrationNumber() != null && !previousApp.getPetRegistrationNumber().isEmpty()) {
					application.setPetRegistrationNumber(previousApp.getPetRegistrationNumber());
					copiedAny = true;
					log.info("Copied petRegistrationNumber: {} from previous application: {} to renewal: {}", 
							previousApp.getPetRegistrationNumber(), 
							application.getPreviousApplicationNumber(), 
							application.getApplicationNumber());
				} else {
					log.warn("Previous application: {} exists but petRegistrationNumber is null or empty", previousApp.getApplicationNumber());
				}
			}
			
			// Copy petToken if not already set and available in previous app
			if (!petTokenSet) {
				if (previousApp.getPetToken() != null && !previousApp.getPetToken().isEmpty()) {
					application.setPetToken(previousApp.getPetToken());
					copiedAny = true;
					log.info("Copied petToken: {} from previous application: {} to renewal: {}", 
							previousApp.getPetToken(), 
							application.getPreviousApplicationNumber(), 
							application.getApplicationNumber());
				} else {
					log.warn("Previous application: {} exists but petToken is null or empty", previousApp.getApplicationNumber());
				}
			}
			
			if (copiedAny) {
				log.info("SUCCESS: Copied values from previous application: {} to renewal: {} - petRegistrationNumber: {}, petToken: {}. Values will be persisted to DB at create time.", 
						application.getPreviousApplicationNumber(), 
						application.getApplicationNumber(),
						application.getPetRegistrationNumber() != null ? application.getPetRegistrationNumber() : "null",
						application.getPetToken() != null ? application.getPetToken() : "null");
			} else {
				log.warn("No values were copied from previous application: {} to renewal: {}. Both petRegistrationNumber and petToken may be missing in previous application.", 
						application.getPreviousApplicationNumber(), application.getApplicationNumber());
			}
			
		} catch (CustomException e) {
			// Re-throw CustomException as-is
			throw e;
		} catch (Exception e) {
			log.error("Error copying petRegistrationNumber and petToken from previous application for renewal: {}. Error: {}",
					application.getApplicationNumber(), e.getMessage(), e);
			throw new CustomException("ERROR_COPYING_PREVIOUS_APPLICATION_DATA",
					"Failed to copy petToken and petRegistrationNumber from previous application: " + e.getMessage());
		}
	}

	/**
	 * Calculates the updated pet age for renewal applications based on the previous application's
	 * age and the time elapsed since the previous application was created.
	 * Formula: newAge = oldAge + (currentDate - previousAppCreatedTime)
	 */
	private void calculateUpdatedPetAge(PetRegistrationApplication application, RequestInfo requestInfo) {
		try {
			// Check if previousApplicationNumber is provided
			if (application.getPreviousApplicationNumber() == null || application.getPreviousApplicationNumber().isEmpty()) {
				log.warn("previousApplicationNumber is null or empty for renewal application: {}. Cannot calculate updated pet age.",
						application.getApplicationNumber());
				return;
			}

			log.info("Calculating updated pet age for renewal application: {} from previous: {}",
					application.getApplicationNumber(), application.getPreviousApplicationNumber());

			// Search for previous application
			PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
					.applicationNumber(Collections.singletonList(application.getPreviousApplicationNumber()))
					.tenantId(application.getTenantId())
					.build();
			List<PetRegistrationApplication> previousApps = petRegistrationRepository.getApplications(criteria);

			if (previousApps == null || previousApps.isEmpty()) {
				log.warn("Previous application not found: {} for renewal: {}. Cannot calculate updated pet age.",
						application.getPreviousApplicationNumber(), application.getApplicationNumber());
				return;
			}

			PetRegistrationApplication previousApp = previousApps.get(0);

			// Get previous application's pet age and created time
			PetDetails previousPetDetails = previousApp.getPetDetails();
			AuditDetails previousAuditDetails = previousApp.getAuditDetails();

			if (previousPetDetails == null || previousPetDetails.getPetAge() == null || previousPetDetails.getPetAge().isEmpty()) {
				log.warn("Previous application: {} has no pet age. Cannot calculate updated pet age.",
						previousApp.getApplicationNumber());
				return;
			}

			if (previousAuditDetails == null || previousAuditDetails.getCreatedTime() == null) {
				log.warn("Previous application: {} has no createdTime. Cannot calculate updated pet age.",
						previousApp.getApplicationNumber());
				return;
			}

			String oldPetAge = previousPetDetails.getPetAge();
			long previousCreatedTime = previousAuditDetails.getCreatedTime();
			long currentTime = System.currentTimeMillis();

			// Parse old age to get years and months
			AgeComponents oldAgeComponents = parsePetAge(oldPetAge);
			if (oldAgeComponents == null) {
				log.warn("Could not parse pet age: {} from previous application: {}",
						oldPetAge, previousApp.getApplicationNumber());
				return;
			}

			// Calculate time elapsed in months
			long elapsedMillis = currentTime - previousCreatedTime;
			long elapsedMonths = elapsedMillis / (1000L * 60 * 60 * 24 * 30);

			// Calculate new age
			int totalOldMonths = oldAgeComponents.years * 12 + oldAgeComponents.months;
			int totalNewMonths = (int) (totalOldMonths + elapsedMonths);

			int newYears = totalNewMonths / 12;
			int newMonths = totalNewMonths % 12;

			String newPetAge = formatPetAge(newYears, newMonths);

			// Update the current application's pet age
			application.getPetDetails().setPetAge(newPetAge);

			log.info("Updated pet age for renewal application: {} - Old age: {} ({}), Elapsed: {} months, New age: {}",
					application.getApplicationNumber(), oldPetAge, oldAgeComponents,
					elapsedMonths, newPetAge);

		} catch (Exception e) {
			log.error("Error calculating updated pet age for renewal application: {}. Error: {}",
					application.getApplicationNumber(), e.getMessage(), e);
			// Don't throw - just log the error and let the application proceed with existing age
		}
	}

	/**
	 * Parses pet age string where decimal format means years.months
	 * e.g., "2.5" = 2 years 5 months, "4.9" = 4 years 9 months
	 */
	private AgeComponents parsePetAge(String petAge) {
		if (petAge == null || petAge.isEmpty()) {
			return null;
		}

		String trimmedAge = petAge.trim();

		try {
			// Handle format like "2.5" = 2 years 5 months, "4.9" = 4 years 9 months
			double age = Double.parseDouble(trimmedAge);
			int years = (int) Math.floor(age);
			int months = (int) Math.round((age - years) * 10);
			// Handle case like "2.10" should be 2 years 10 months, not 2 years 1 month
			// Actually if someone enters 2.10, it would be parsed as 2.1 = 2 years 1 month
			// So we keep it as is - 2.5 means 2 years 5 months
			return new AgeComponents(years, months);
		} catch (NumberFormatException e) {
			log.warn("Could not parse pet age: {}", petAge);
			return null;
		}
	}

	/**
	 * Formats years and months into pet age string
	 */
	private String formatPetAge(int years, int months) {
		if (years == 0) {
			return months + (months == 1 ? " month" : " months");
		} else if (months == 0) {
			return years + (years == 1 ? " year" : " years");
		} else {
			return years + (years == 1 ? " year" : " years") + " " + months + (months == 1 ? " month" : " months");
		}
	}

	/**
	 * Helper class to store age components
	 */
	private static class AgeComponents {
		int years;
		int months;

		AgeComponents(int years, int months) {
			this.years = years;
			this.months = months;
		}

		@Override
		public String toString() {
			return "AgeComponents{years=" + years + ", months=" + months + "}";
		}
	}


	private void enrichDocuments(PetRegistrationApplication application) {
		if (application.getDocuments() == null || application.getDocuments().isEmpty()) {
			return;
		}

		application.getDocuments().forEach(doc -> {
			// Generate ID for new documents (documents without ID)
			if (doc.getId() == null) {
				doc.setId(UUID.randomUUID().toString());
				log.info("Generated new ID: {} for new document of type: {} for application: {}",
						doc.getId(), doc.getDocumentType(), application.getApplicationNumber());
			} else {
				log.info("Processing existing document with ID: {} of type: {} for application: {}",
						doc.getId(), doc.getDocumentType(), application.getApplicationNumber());
			}

			// Set common fields for all documents (new and existing)
			doc.setTenantId(application.getTenantId());
			doc.setActive(true);
			doc.setAuditDetails(application.getAuditDetails());
		});

		log.info("Application {} will upsert {} documents (new + existing)",
				application.getApplicationNumber(), application.getDocuments().size());
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
		// First update application audit details
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
					log.info("Pet Token Generated : " + application.getPetToken());
				}
			}

			// Always enrich documents if they exist (handles both new and existing documents via upsert)
			if (application.getDocuments() != null && !application.getDocuments().isEmpty()) {
				enrichDocuments(application);
				log.info("Enriched {} documents for application: {} (includes new and existing documents for upsert)",
						application.getDocuments().size(), application.getApplicationNumber());
			} else {
				// No documents to process
				log.info("No documents found for application: {}", application.getApplicationNumber());
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
