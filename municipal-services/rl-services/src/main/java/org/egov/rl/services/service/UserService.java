package org.egov.rl.services.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.rl.services.config.RentLeaseConfiguration;
import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.models.AllotmentRequest;
import org.egov.rl.services.models.Owner;
import org.egov.rl.services.models.OwnerInfo;
import org.egov.rl.services.models.user.CreateUserRequest;
import org.egov.rl.services.models.user.UserDetailResponse;
import org.egov.rl.services.models.user.UserSearchRequest;
import org.egov.rl.services.repository.ServiceRequestRepository;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class UserService {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;
	
	@Autowired
	private RentLeaseConfiguration config;

	/**
	 * Creates user of the owners of pet if it is not created already
	 * 
	 * @param request PetRegistrationRequest received for creating application
	 */
	public void createUser(AllotmentRequest allotmentRequest) {

		AllotmentDetails allotmentDetails = allotmentRequest.getAllotment().get(0);
		RequestInfo requestInfo = allotmentRequest.getRequestInfo();
		List<Role> roles = getCitizenRole();
		List<OwnerInfo> ownerInfos = allotmentDetails.getOwnerInfo();
		
		ownerInfos=ownerInfos.stream().map(u->{
			Owner owner=Owner.builder()
					.uuid(u.getOwnerId())
					.name(u.getName())
					.mobileNumber(u.getMobileNo())
					.emailId(u.getEmailId())
					.dob(u.getDob())
//					.aadhaarNumber(u.getAadharCardNumber())
//					.pan(u.getPanCardNumber())
					.gender(u.getGender())
					.permanentAddress(u.getPermanentAddress().getAddressId())
					.permanentCity(u.getPermanentAddress().getCity())
					.permanentPincode(u.getPermanentAddress().getPincode())
					.correspondenceAddress(u.getCorrespondenceAddress().getAddressId())
					.correspondenceCity(u.getCorrespondenceAddress().getCity())
					.correspondencePincode(u.getCorrespondenceAddress().getPincode())
					.roles(roles)
					.userName(u.getMobileNo())
					.build();
				 	addUserDefaultFields(allotmentDetails.getTenantId(), roles.get(0), owner);
					
		// Try to find existing user by multiple search methods
			UserDetailResponse userDetailResponse = null;
			org.egov.rl.services.models.user.User existingUser = null;
		// Method 1: Search by mobile number
			UserDetailResponse mobileSearch = userExists(owner, requestInfo);
			if (mobileSearch != null && !CollectionUtils.isEmpty(mobileSearch.getUser())) {
				existingUser = 	Optional.ofNullable(mobileSearch.getUser().get(0)).orElse(null);
				userDetailResponse = mobileSearch;
			}
			
		// Method 2: Search by userName (mobile number)
			if (existingUser == null) {
				UserDetailResponse userNameSearch = searchByUserName(owner.getMobileNumber(), owner.getTenantId());
				if (userNameSearch != null && !CollectionUtils.isEmpty(userNameSearch.getUser())) {
					existingUser = 	Optional.ofNullable( userNameSearch.getUser().get(0)).orElse(null);
					userDetailResponse = userNameSearch;
				}
			}
			
		// Method 3: Search by UUID if provided
			if (existingUser == null && owner.getUuid() != null) {
				UserDetailResponse uuidSearch = searchByUuid(owner.getUuid(), owner.getTenantId());
				if (uuidSearch != null && !CollectionUtils.isEmpty(uuidSearch.getUser())) {
					existingUser = Optional.ofNullable(uuidSearch.getUser().get(0)).orElse(null);
					userDetailResponse = uuidSearch;
				}
			}
			org.egov.rl.services.models.user.User existingUsers=null;
			if (existingUser != null) {
				// User exists - update it
				userDetailResponse = updateExistingUser(allotmentDetails, requestInfo, roles.get(0), owner, existingUser);
				existingUsers=userDetailResponse.getUser().get(0);
			} else {
				// User doesn't exist - create new user
				setUserName(owner);
				userDetailResponse = createUser(requestInfo, owner);
				existingUsers=userDetailResponse.getUser().get(0);
			}
//			setOwnerFields(owner, userDetailResponse, requestInfo);	
			u.setUserId(existingUsers.getId());
			u.setUserUuid(existingUsers.getUuid());
			u.setTenantId(existingUsers.getTenantId());
			return u;
		}).collect(Collectors.toList());
		allotmentRequest.getAllotment().get(0).setOwnerInfo(ownerInfos);
	}

	/**
	 * update existing user
	 * 
	 */
	private UserDetailResponse updateExistingUser(AllotmentDetails allotmentDetails, RequestInfo requestInfo,
			Role role, Owner ownerFromRequest, org.egov.rl.services.models.user.User ownerInfoFromSearch) {

		UserDetailResponse userDetailResponse;

		ownerFromRequest.setId(ownerInfoFromSearch.getId());
		ownerFromRequest.setUuid(ownerInfoFromSearch.getUuid());
		addUserDefaultFields(allotmentDetails.getTenantId(), role, ownerFromRequest);

		// Convert Owner to User for user service call
		org.egov.rl.services.models.user.User user = convertOwnerToUser(ownerFromRequest);
		StringBuilder uri = new StringBuilder(config.getUserHost()).append(config.getUserContextPath()).append(config.getUserUpdateEndpoint());
		userDetailResponse = userCall(new CreateUserRequest(requestInfo, user), uri);
		if (userDetailResponse.getUser().get(0).getUuid() == null) {
			throw new CustomException("INVALID USER RESPONSE", "The user updated has uuid as null");
		}
		return userDetailResponse;
	}

	private UserDetailResponse createUser(RequestInfo requestInfo, Owner owner) {
		UserDetailResponse userDetailResponse;
		StringBuilder uri = new StringBuilder(config.getUserHost()).append(config.getUserContextPath()).append(config.getUserCreateEndpoint());

		// Convert Owner to User for user service call
		org.egov.rl.services.models.user.User user = convertOwnerToUser(owner);
		CreateUserRequest userRequest = CreateUserRequest.builder().requestInfo(requestInfo).user(user).build();
		userDetailResponse = userCall(userRequest, uri);

		if (ObjectUtils.isEmpty(userDetailResponse)) {

			throw new CustomException("INVALID USER RESPONSE",
					"The user create has failed for the mobileNumber : " + owner.getUserName());

		}
		return userDetailResponse;
	}

	/**
	 * Fetches user UUIDs by mobile number from user service
	 *
	 * @param mobileNumber Mobile number to search for
	 * @param tenantId Tenant ID
	 * @param requestInfo Request info
	 * @return List of user UUIDs matching the mobile number
	 */
	public List<String> getUserUuidsByMobileNumber(String mobileNumber, String tenantId, RequestInfo requestInfo) {
		List<String> userUuids = new ArrayList<>();

		log.info("DEBUG: UserService - Searching for mobile number: " + mobileNumber + " in tenant: " + tenantId);

		try {
			UserSearchRequest userSearchRequest = getBaseUserSearchRequest(tenantId, requestInfo);
			userSearchRequest.setMobileNumber(mobileNumber);
			userSearchRequest.setUserName(mobileNumber);
			log.info("DEBUG: UserService - UserSearchRequest: " + userSearchRequest);

			UserDetailResponse response = getUser(userSearchRequest);

			log.info("DEBUG: UserService - Response: " + response);

			if (response != null && !CollectionUtils.isEmpty(response.getUser())) {
				userUuids = response.getUser().stream()
						.map(org.egov.rl.services.models.user.User::getUuid)
						.collect(java.util.stream.Collectors.toList());
				log.info("DEBUG: UserService - Found UUIDs: " + userUuids);
			} else {
				log.info("DEBUG: UserService - No users found or null response");
			}
		} catch (Exception e) {
			log.info("DEBUG: UserService - Exception: " + e.getMessage());
			log.error("Error fetching user UUIDs for mobile number: " + mobileNumber, e);
		}

		return userUuids;
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
		
		owner.setPwdExpiryDate(null);
		owner.setSignature(null);
		owner.setPhoto(null);
		owner.setAccountLocked(false);
		
	}

	private List<Role> getCitizenRole() {
		List<Role> roleList=new ArrayList<>();
		roleList.add(Role.builder().code("CITIZEN").name("Citizen").build());
		return roleList;
		
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
	public UserDetailResponse userExists(Owner owner, RequestInfo requestInfo) {

		UserSearchRequest userSearchRequest = getBaseUserSearchRequest(owner.getTenantId(), requestInfo);
		userSearchRequest.setMobileNumber(owner.getMobileNumber());
//		userSearchRequest.setUserName(owner.getMobileNumber());
		// Remove all other criteria - search by mobile number only to avoid search failures
		// userSearchRequest.setUserType(owner.getType());
		// userSearchRequest.setName(owner.getName());

		StringBuilder uri = new StringBuilder(config.getUserHost()).append(config.getUserSearchEndpoint());
		UserDetailResponse response = userCall(userSearchRequest, uri);
		
		// Debug: Log search results to understand what's happening
		if (response != null && response.getUser() != null) {
			log.info("Search found " + response.getUser().size() + " users for mobile: " + owner.getMobileNumber());
		} else {
			log.info("Search found no users for mobile: " + owner.getMobileNumber());
		}
		
		return response;
	}

	/**
	 * Sets userName for the owner as mobileNumber if mobileNumber already assigned
	 * last 10 digits of currentTime is assigned as userName
	 * 
	 * @param owner              owner whose username has to be assigned
	 *
	 */
	private void setUserName(Owner owner) {
		String username;
		if (owner.getMobileNumber() != null && !owner.getMobileNumber().isEmpty()) {
			username = owner.getMobileNumber();
		} else {
			username = UUID.randomUUID().toString();
		}
		owner.setUserName(username);
	}

	/**
	 * Returns user using user search based on petApplicationCriteria(owner
	 * name,mobileNumber,userName)
	 * 
	 * @param userSearchRequest
	 * @return serDetailResponse containing the user if present and the responseInfo
	 */
	public UserDetailResponse getUser(UserSearchRequest userSearchRequest) {

		StringBuilder uri = new StringBuilder(config.getUserHost()).append(config.getUserSearchEndpoint());
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
		if (url.indexOf(config.getUserSearchEndpoint()) != -1 || url.indexOf(config.getUserUpdateEndpoint()) != -1)
			dobFormat = "yyyy-MM-dd";
		else if (url.indexOf(config.getUserCreateEndpoint()) != -1)
			dobFormat = "dd/MM/yyyy";
		try {
			Object response = serviceRequestRepository.fetchResult(url, userRequest).get();
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
		org.egov.rl.services.models.user.User user = userDetailResponse.getUser().get(0);
		
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

		return UserSearchRequest.builder().requestInfo(requestInfo).userType("CITIZEN").tenantId(tenantId)
				// Remove active criteria - it's causing search failures
				// .active(true)
				.build();
	}

	private UserDetailResponse searchByUserName(String userName, String tenantId) {
		UserSearchRequest userSearchRequest = new UserSearchRequest();
		userSearchRequest.setUserType("CITIZEN");
		userSearchRequest.setUserName(userName);
		userSearchRequest.setTenantId(tenantId);
		
		UserDetailResponse response = getUser(userSearchRequest);
		
		// Debug: Log alternative search results
		if (response != null && response.getUser() != null) {
			log.info("Alternative search found " + response.getUser().size() + " users for userName: " + userName);
		} else {
			log.info("Alternative search found no users for userName: " + userName);
		}
		
		return response;
	}
	
	public UserDetailResponse searchByUuid(String uuid, String tenantId) {
		UserSearchRequest userSearchRequest = new UserSearchRequest();
		userSearchRequest.setUserType("CITIZEN");
		userSearchRequest.setUuid(Collections.singleton(uuid));
		userSearchRequest.setTenantId(tenantId);
		
		UserDetailResponse response = getUser(userSearchRequest);
		
		// Debug: Log UUID search results
		if (response != null && response.getUser() != null) {
			log.info("UUID search found " + response.getUser().size() + " users for UUID: " + uuid);
		} else {
			log.info("UUID search found no users for UUID: " + uuid);
		}
		
		return response;
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

		StringBuilder uri = new StringBuilder(config.getUserHost()).append(config.getUserSearchEndpoint());
		return userCall(userSearchRequest, uri);
	}


	/**
	 * Converts Owner to User for user service calls
	 */
	private org.egov.rl.services.models.user.User convertOwnerToUser(Owner owner) {
		org.egov.rl.services.models.user.User user = new org.egov.rl.services.models.user.User();
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
	private Owner convertUserToOwner(org.egov.rl.services.models.user.User user) {
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
