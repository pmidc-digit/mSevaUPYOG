package org.egov.ptr.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.ptr.models.Owner;
import org.egov.ptr.models.PetRegistrationApplication;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.models.user.CreateUserRequest;
import org.egov.ptr.models.user.UserDetailResponse;
import org.egov.ptr.models.user.UserSearchRequest;
import org.egov.ptr.repository.ServiceRequestRepository;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserService {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;


	@Value("${egov.user.host}")
	private String userHost;

	@Value("${egov.user.context.path}")
	private String userContextPath;

	@Value("${egov.user.create.path}")
	private String userCreateEndpoint;

	@Value("${egov.user.search.path}")
	private String userSearchEndpoint;

	@Value("${egov.user.update.path}")
	private String userUpdateEndpoint;

	/**
	 * Creates user of the owners of pet if it is not created already
	 * 
	 * @param request PetRegistrationRequest received for creating application
	 */
	public void createUser(PetRegistrationRequest request) {

		PetRegistrationApplication petApplication = request.getPetRegistrationApplications().get(0);
		RequestInfo requestInfo = request.getRequestInfo();
		Role role = getCitizenRole();
		Owner owner = petApplication.getOwner();
		if (owner == null) {
			// Create owner from application data if not provided
			owner = Owner.builder()
				.name(petApplication.getOwner().getName())
				.mobileNumber(petApplication.getOwner().getMobileNumber())
				.emailId(petApplication.getOwner().getEmailId())
				.tenantId(petApplication.getTenantId())
				.build();
		}
		addUserDefaultFields(petApplication.getTenantId(), role, owner);

		// Ensure user-service compatible fields before create/update call
		owner.setCreatedBy(null);
		owner.setCreatedDate(null);
		owner.setLastModifiedBy(null);
		owner.setLastModifiedDate(null);
		owner.setDob(null);
		owner.setPwdExpiryDate(null);
		owner.setSignature(null);
		owner.setPhoto(null);
		owner.setAccountLocked(false);
		// Keep locale minimal or null as per user-service expectations
		// owner.setLocale("en_IN"); // uncomment if required by environment
		
		UserDetailResponse userDetailResponse = userExists(owner, requestInfo);
		List<org.egov.ptr.models.user.User> existingUsersFromService = userDetailResponse.getUser();
		Map<String, org.egov.ptr.models.user.User> ownerMapFromSearch = existingUsersFromService.stream()
				.collect(Collectors.toMap(org.egov.ptr.models.user.User::getUuid, Function.identity()));

		if (CollectionUtils.isEmpty(existingUsersFromService)) {

			// Preserve the original username provided by the user, don't generate random UUID
			// owner.setUserName(UUID.randomUUID().toString());
			userDetailResponse = createUser(requestInfo, owner);

		} else {

			String uuid = owner.getUuid();
			if (uuid != null && ownerMapFromSearch.containsKey(uuid)) {
				userDetailResponse = updateExistingUser(petApplication, requestInfo, role, owner,
						ownerMapFromSearch.get(uuid));
			} else {

				// Preserve the original username provided by the user, don't generate random UUID
				// owner.setUserName(UUID.randomUUID().toString());
				userDetailResponse = createUser(requestInfo, owner);
			}
		}
		setOwnerFields(owner, userDetailResponse, requestInfo);
		
		// OwnerInfo persistence handled by persister. No direct DB writes here.
	}

	/**
	 * update existing user
	 * 
	 */
	private UserDetailResponse updateExistingUser(PetRegistrationApplication petApplication, RequestInfo requestInfo,
			Role role, Owner ownerFromRequest, org.egov.ptr.models.user.User ownerInfoFromSearch) {

		UserDetailResponse userDetailResponse;

		ownerFromRequest.setId(ownerInfoFromSearch.getId());
		ownerFromRequest.setUuid(ownerInfoFromSearch.getUuid());
		addUserDefaultFields(petApplication.getTenantId(), role, ownerFromRequest);

		// Convert Owner to User for user service call
		org.egov.ptr.models.user.User user = convertOwnerToUser(ownerFromRequest);
		StringBuilder uri = new StringBuilder(userHost).append(userContextPath).append(userUpdateEndpoint);
		userDetailResponse = userCall(new CreateUserRequest(requestInfo, user), uri);
		if (userDetailResponse.getUser().get(0).getUuid() == null) {
			throw new CustomException("INVALID USER RESPONSE", "The user updated has uuid as null");
		}
		return userDetailResponse;
	}

	private UserDetailResponse createUser(RequestInfo requestInfo, Owner owner) {
		UserDetailResponse userDetailResponse;
		StringBuilder uri = new StringBuilder(userHost).append(userContextPath).append(userCreateEndpoint);

		// Convert Owner to User for user service call
		org.egov.ptr.models.user.User user = convertOwnerToUser(owner);
		CreateUserRequest userRequest = CreateUserRequest.builder().requestInfo(requestInfo).user(user).build();

		userDetailResponse = userCall(userRequest, uri);

		if (ObjectUtils.isEmpty(userDetailResponse)) {

			throw new CustomException("INVALID USER RESPONSE",
					"The user create has failed for the mobileNumber : " + owner.getUserName());

		}
		return userDetailResponse;
	}

	/**
	 * Sets the role,type,active and tenantId for a Citizen
	 * 
	 * @param tenantId TenantId of the pet application
	 * @param role     The role of the user set in this case to CITIZEN
	 * @param owner    The user whose fields are to be set
	 */
	private void addUserDefaultFields(String tenantId, Role role, Owner owner) {

		owner.setActive(true);
		owner.setTenantId(tenantId);
		owner.setRoles(Collections.singletonList(role));
		owner.setType("CITIZEN");
		owner.setCreatedDate(null);
		owner.setCreatedBy(null);
		owner.setLastModifiedDate(null);
		owner.setLastModifiedBy(null);
	}

	private Role getCitizenRole() {

		return Role.builder().code("CITIZEN").name("Citizen").build();
	}

	/**
	 * Searches if the owner is already created. Search is based on name of owner,
	 * uuid and mobileNumber
	 * 
	 * @param owner       Owner which is to be searched
	 * @param requestInfo RequestInfo from the PetRegistrationRequest
	 * @return UserDetailResponse containing the user if present and the
	 *         responseInfo
	 */
	private UserDetailResponse userExists(Owner owner, RequestInfo requestInfo) {

		UserSearchRequest userSearchRequest = getBaseUserSearchRequest(owner.getTenantId(), requestInfo);
		userSearchRequest.setMobileNumber(owner.getMobileNumber());
		userSearchRequest.setUserType(owner.getType());
		userSearchRequest.setName(owner.getName());

		StringBuilder uri = new StringBuilder(userHost).append(userSearchEndpoint);
		return userCall(userSearchRequest, uri);
	}

	/**
	 * Sets userName for the owner as mobileNumber if mobileNumber already assigned
	 * last 10 digits of currentTime is assigned as userName
	 * 
	 * @param owner              owner whose username has to be assigned
	 * @param listOfMobileNumber list of unique mobileNumbers in the
	 *                           PetRegistrationRequest
	 */
	private void setUserName(Owner owner, Set<String> listOfMobileNumber) {

		if (listOfMobileNumber.contains(owner.getMobileNumber())) {
			owner.setUserName(owner.getMobileNumber());
			// Once mobileNumber is set as userName it is removed from the list
			listOfMobileNumber.remove(owner.getMobileNumber());
		} else {
			String username = UUID.randomUUID().toString();
			owner.setUserName(username);
		}
	}

	/**
	 * Returns user using user search based on petApplicationCriteria(owner
	 * name,mobileNumber,userName)
	 * 
	 * @param userSearchRequest
	 * @return serDetailResponse containing the user if present and the responseInfo
	 */
	public UserDetailResponse getUser(UserSearchRequest userSearchRequest) {

		StringBuilder uri = new StringBuilder(userHost).append(userSearchEndpoint);
		UserDetailResponse userDetailResponse = userCall(userSearchRequest, uri);
		return userDetailResponse;
	}

	/**
	 * Returns UserDetailResponse by calling user service with given uri and object
	 * 
	 * @param userRequest Request object for user service
	 * @param url         The address of the endpoint
	 * @return Response from user service as parsed as userDetailResponse
	 */
	@SuppressWarnings("unchecked")
	private UserDetailResponse userCall(Object userRequest, StringBuilder url) {

		String dobFormat = null;
		if (url.indexOf(userSearchEndpoint) != -1 || url.indexOf(userUpdateEndpoint) != -1)
			dobFormat = "yyyy-MM-dd";
		else if (url.indexOf(userCreateEndpoint) != -1)
			dobFormat = "dd/MM/yyyy";
		try {
			Object response = serviceRequestRepository.fetchResult(url, userRequest);

			if (response!=null) {
				LinkedHashMap<String, Object> responseMap = (LinkedHashMap<String, Object>) response;
				parseResponse(responseMap, dobFormat);
				UserDetailResponse userDetailResponse = mapper.convertValue(responseMap, UserDetailResponse.class);
				return userDetailResponse;
			} else {
				return new UserDetailResponse();
			}
		}
		// Which Exception to throw?
		catch (IllegalArgumentException e) {
			throw new CustomException("IllegalArgumentException", "ObjectMapper not able to convertValue in userCall");
		}
	}

	/**
	 * Parses date formats to long for all users in responseMap
	 * 
	 * @param responeMap LinkedHashMap got from user api response
	 * @param dobFormat  dob format (required because dob is returned in different
	 *                   format's in search and create response in user service)
	 */
	@SuppressWarnings("unchecked")
	private void parseResponse(LinkedHashMap<String, Object> responeMap, String dobFormat) {

		List<LinkedHashMap<String, Object>> users = (List<LinkedHashMap<String, Object>>) responeMap.get("user");
		String format1 = "dd-MM-yyyy HH:mm:ss";

		if (null != users) {

			users.forEach(map -> {

				map.put("createdDate", dateTolong((String) map.get("createdDate"), format1));
				if ((String) map.get("lastModifiedDate") != null)
					map.put("lastModifiedDate", dateTolong((String) map.get("lastModifiedDate"), format1));
				if ((String) map.get("dob") != null)
					map.put("dob", dateTolong((String) map.get("dob"), dobFormat));
				if ((String) map.get("pwdExpiryDate") != null)
					map.put("pwdExpiryDate", dateTolong((String) map.get("pwdExpiryDate"), format1));
			});
		}
	}

	/**
	 * Converts date to long
	 * 
	 * @param date   date to be parsed
	 * @param format Format of the date
	 * @return Long value of date
	 */
	private Long dateTolong(String date, String format) {
		SimpleDateFormat f = new SimpleDateFormat(format);
		Date d = null;
		try {
			d = f.parse(date);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return d.getTime();
	}

	/**
	 * Sets owner fields (so that the owner table can be linked to user table)
	 * 
	 * @param owner              Owner in the pet detail whose user is created
	 * @param userDetailResponse userDetailResponse from the user Service
	 *                           corresponding to the given owner
	 */
	private void setOwnerFields(Owner owner, UserDetailResponse userDetailResponse, RequestInfo requestInfo) {
		org.egov.ptr.models.user.User user = userDetailResponse.getUser().get(0);
		
		// Convert User back to Owner and update the owner object
		Owner updatedOwner = convertUserToOwner(user);
		owner.setUuid(updatedOwner.getUuid());
		owner.setId(updatedOwner.getId());
		owner.setUserName(updatedOwner.getUserName());
		owner.setCreatedBy(requestInfo.getUserInfo().getUuid());
		owner.setCreatedDate(System.currentTimeMillis());
		owner.setLastModifiedBy(requestInfo.getUserInfo().getUuid());
		owner.setLastModifiedDate(System.currentTimeMillis());
		owner.setActive(updatedOwner.getActive());
	}

	/**
	 * Updates user if present else creates new user
	 * 
	 * @param request PetRequest received from update
	 */

	/**
	 * provides a user search request with basic mandatory parameters
	 * 
	 * @param tenantId
	 * @param requestInfo
	 * @return
	 */
	public UserSearchRequest getBaseUserSearchRequest(String tenantId, RequestInfo requestInfo) {

		return UserSearchRequest.builder().requestInfo(requestInfo).userType("CITIZEN").tenantId(tenantId).active(true)
				.build();
	}

	private UserDetailResponse searchByUserName(String userName, String tenantId) {
		UserSearchRequest userSearchRequest = new UserSearchRequest();
		userSearchRequest.setUserType("CITIZEN");
		userSearchRequest.setUserName(userName);
		userSearchRequest.setTenantId(tenantId);
		return getUser(userSearchRequest);
	}

	private String getStateLevelTenant(String tenantId) {
		return tenantId.split("\\.")[0];
	}

	private UserDetailResponse searchedSingleUserExists(Owner owner, RequestInfo requestInfo) {

		UserSearchRequest userSearchRequest = getBaseUserSearchRequest(owner.getTenantId(), requestInfo);
		userSearchRequest.setUserType(owner.getType());
		Set<String> uuids = new HashSet<String>();
		uuids.add(owner.getUuid());
		userSearchRequest.setUuid(uuids);

		StringBuilder uri = new StringBuilder(userHost).append(userSearchEndpoint);
		return userCall(userSearchRequest, uri);
	}

	/**
	 * Populates owner info from pet application data
	 * 
	 * @param owner Owner object to populate
	 * @param petApplication PetRegistrationApplication object
	 */
	private void populateOwnerFromApplication(Owner owner, PetRegistrationApplication petApplication) {
		// Set basic information from application
		owner.setName(petApplication.getOwner().getName());
		owner.setMobileNumber(petApplication.getOwner().getMobileNumber());
		owner.setEmailId(petApplication.getOwner().getEmailId());
		
		// Set owner-specific fields
		owner.setOwnerType("INDIVIDUAL"); // Default to individual owner
		owner.setIsPrimaryOwner(true); // Default to primary owner
		owner.setOwnershipPercentage("100"); // Default to 100% ownership
		
		// Set audit fields
		owner.setCreatedBy(petApplication.getAuditDetails() != null ? 
			petApplication.getAuditDetails().getCreatedBy() : null);
		owner.setCreatedDate(petApplication.getAuditDetails() != null ? 
			petApplication.getAuditDetails().getCreatedTime() : System.currentTimeMillis());
		owner.setLastModifiedBy(petApplication.getAuditDetails() != null ? 
			petApplication.getAuditDetails().getLastModifiedBy() : null);
		owner.setLastModifiedDate(petApplication.getAuditDetails() != null ? 
			petApplication.getAuditDetails().getLastModifiedTime() : System.currentTimeMillis());
	}

	// OwnerInfo reads happen via user search APIs; no direct owner table access here.

	/**
	 * Converts Owner to User for user service calls
	 */
	private org.egov.ptr.models.user.User convertOwnerToUser(Owner owner) {
		org.egov.ptr.models.user.User user = new org.egov.ptr.models.user.User();
		user.setId(owner.getId());
		user.setUuid(owner.getUuid());
		user.setUserName(owner.getUserName());
		user.setPassword(owner.getPassword());
		user.setSalutation(owner.getSalutation());
		user.setName(owner.getName());
		user.setGender(owner.getGender());
		user.setMobileNumber(owner.getMobileNumber());
		user.setEmailId(owner.getEmailId());
		user.setAltContactNumber(owner.getAltContactNumber());
		user.setPan(owner.getPan());
		user.setAadhaarNumber(owner.getAadhaarNumber());
		user.setPermanentAddress(owner.getPermanentAddress());
		user.setPermanentCity(owner.getPermanentCity());
		user.setPermanentPincode(owner.getPermanentPincode());
		user.setCorrespondenceCity(owner.getCorrespondenceCity());
		user.setCorrespondencePincode(owner.getCorrespondencePincode());
		user.setCorrespondenceAddress(owner.getCorrespondenceAddress());
		user.setActive(owner.getActive());
		user.setDob(owner.getDob());
		user.setPwdExpiryDate(owner.getPwdExpiryDate());
		user.setLocale(owner.getLocale());
		user.setType(owner.getType());
		user.setSignature(owner.getSignature());
		user.setAccountLocked(owner.getAccountLocked());
		user.setRoles(owner.getRoles());
		user.setFatherOrHusbandName(owner.getFatherOrHusbandName());
		user.setBloodGroup(owner.getBloodGroup());
		user.setIdentificationMark(owner.getIdentificationMark());
		user.setPhoto(owner.getPhoto());
		user.setCreatedBy(owner.getCreatedBy());
		user.setCreatedDate(owner.getCreatedDate());
		user.setLastModifiedBy(owner.getLastModifiedBy());
		user.setLastModifiedDate(owner.getLastModifiedDate());
		user.setTenantId(owner.getTenantId());
		return user;
	}

	/**
	 * Converts User to Owner for pet service use
	 */
	private Owner convertUserToOwner(org.egov.ptr.models.user.User user) {
		Owner owner = new Owner();
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
		return owner;
	}

}
