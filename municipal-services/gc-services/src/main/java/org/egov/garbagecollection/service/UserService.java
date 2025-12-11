package org.egov.garbagecollection.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.garbagecollection.web.models.users.CreateUserRequest;
import org.egov.garbagecollection.web.models.users.User;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.web.models.*;
import org.egov.garbagecollection.web.models.users.UserDetailResponse;
import org.egov.garbagecollection.web.models.users.UserSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;


import com.fasterxml.jackson.databind.ObjectMapper;
@Slf4j
@Service
public class UserService {
	@Autowired
	private GCConfiguration configuration;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private EnrichmentService enrichmentService;

	/**
	 * Creates user of the connection holders of water connection if it is not
	 * created already
	 *
	 * @param request WaterConnectionRequest
	 */

	public void createUser(GarbageConnectionRequest request) {
		Role role = getCitizenRole(request.getGarbageConnection().getTenantId());
		if (request.getGarbageConnection().getConnectionHolders() == null) {
			throw new CustomException("INVALID USER", "The applications owners list is empty");
		}
		request.getGarbageConnection().getConnectionHolders().forEach(owner ->
		{
			if (owner.getUuid() == null) {
				addUserDefaultFields(request.getGarbageConnection().getTenantId(), role, owner);

				UserDetailResponse existingUserResponse = userExists(owner, request.getRequestInfo());

				if (!existingUserResponse.getUser().isEmpty()) {
					OwnerInfo existingUser = existingUserResponse.getUser().get(0);
					log.info("User already exists with UUID: " + existingUser.getUuid());
					owner.setUuid(existingUser.getUuid());
					setOwnerFields(owner, existingUserResponse, request.getRequestInfo());
				} else {
//						  UserResponse userResponse = userExists(owner,requestInfo);
					StringBuilder uri = new StringBuilder(configuration.getUserHost())
							.append(configuration.getUserContextPath()).append(configuration.getUserCreateEndPoint());
					setUserName(owner);
					UserDetailResponse userResponse = userCall(new CreateUserRequest(request.getRequestInfo(), owner), uri);
					if (userResponse.getUser().get(0).getUuid() == null) {
						throw new CustomException("INVALID USER RESPONSE", "The user created has uuid as null");
					}
					log.info("owner created --> " + userResponse.getUser().get(0).getUuid());
					setOwnerFields(owner, userResponse, request.getRequestInfo());
				}
			} else {
				UserDetailResponse userResponse = userExists(owner, request.getRequestInfo());
				if (userResponse.getUser().isEmpty())
					throw new CustomException("INVALID USER", "The uuid " + owner.getUuid() + " does not exists");
				StringBuilder uri = new StringBuilder(configuration.getUserHost())
						.append(configuration.getUserContextPath()).append(configuration.getUserUpdateEndPoint());
				OwnerInfo ownerInfo = new OwnerInfo();
				ownerInfo.addUserDetail(owner);
				addNonUpdatableFields(ownerInfo, userResponse.getUser().get(0));
				userResponse = userCall(new CreateUserRequest(request.getRequestInfo(), ownerInfo), uri);
				setOwnerFields(owner, userResponse, request.getRequestInfo());
			}
		});

	}

	private void addNonUpdatableFields(User user, User userFromSearchResult){
		user.setUserName(userFromSearchResult.getUserName());
		user.setId(userFromSearchResult.getId());
		user.setActive(userFromSearchResult.getActive());
		user.setPassword(userFromSearchResult.getPassword());
	}


	private void setUserName(OwnerInfo owner){
		String username;
		if(StringUtils.isNotBlank(owner.getMobileNumber()))
			username = owner.getMobileNumber();
		else
			username = UUID.randomUUID().toString();



		owner.setUserName(username);

	}
	/**
	 * Create citizen role
	 *
	 * @return Role
	 */
	private Role getCitizenRole(String tenantId){
		Role role = new Role();
		role.setCode("CITIZEN");
		role.setName("Citizen");
		role.setTenantId(getStateLevelTenant(tenantId));
		return role;
	}
	private String getStateLevelTenant(String tenantId){
		return tenantId.split("\\.")[0];
	}

	/**
	 * Fetches all the unique mobileNumbers from a connection holders
	 *
	 * @param garbageConnectionRequest
	 * @return list of all unique mobileNumbers in the given water connection holder
	 * details
	 */
	private Set<String> getMobileNumbers(GarbageConnectionRequest garbageConnectionRequest) {
		Set<String> listOfMobileNumbers = garbageConnectionRequest.getGarbageConnection().getConnectionHolders().stream()
				.map(OwnerInfo::getMobileNumber).collect(Collectors.toSet());
		OwnerInfo maskedConnectionHolder = null;
		OwnerInfo plainConnectionHolderFromDb = null;
		OwnerInfo connectionHolder = garbageConnectionRequest.getGarbageConnection().getConnectionHolders().get(0);

		GarbageConnection newWaterConnection;

		/*
		 * Replacing the requestBody connectionHolder data and data from dB for those fields that come as masked (data containing "*" is
		 * identified as masked) in requestBody
		 *
		 * */
		if (!listOfMobileNumbers.isEmpty()) {
			newWaterConnection = garbageConnectionRequest.getGarbageConnection();
			maskedConnectionHolder = connectionHolder;

			/*
			 * If it is not _create call/connectionNo already exists (for Modify and Disconnection Applications),
			 * then a connHolder comparison with existing connHolder for application happens
			 * */
			if (!garbageConnectionRequest.isCreateCall() || !StringUtils.isEmpty(newWaterConnection.getConnectionNo())) {
				// Check if connHolder already exists
				if (maskedConnectionHolder != null && !StringUtils.isEmpty(maskedConnectionHolder.getUuid())) {

					plainConnectionHolderFromDb = enrichmentService.getConnectionHolderDetailsForUpdateCall(newWaterConnection,
							garbageConnectionRequest.getRequestInfo());
					if (maskedConnectionHolder.getMobileNumber().contains("*")) {
						connectionHolder.setMobileNumber(plainConnectionHolderFromDb.getMobileNumber());
					}
					if (!StringUtils.isEmpty(maskedConnectionHolder.getFatherOrHusbandName())
							&& maskedConnectionHolder.getFatherOrHusbandName().contains("*")) {
						connectionHolder.setFatherOrHusbandName(plainConnectionHolderFromDb.getFatherOrHusbandName());
					}
					if (!StringUtils.isEmpty(maskedConnectionHolder.getCorrespondenceAddress())
							&& maskedConnectionHolder.getCorrespondenceAddress().contains("*")) {
						connectionHolder.setCorrespondenceAddress(plainConnectionHolderFromDb.getCorrespondenceAddress());
					}
					if (maskedConnectionHolder.getUserName().contains("*")) {
						connectionHolder.setUserName(plainConnectionHolderFromDb.getUserName());
					}
					if (maskedConnectionHolder.getName().contains("*")) {
						connectionHolder.setName(plainConnectionHolderFromDb.getName());
					}
				}
			}
		}
		StringBuilder uri = new StringBuilder(configuration.getUserHost())
				.append(configuration.getUserSearchEndpoint());
		UserSearchRequest userSearchRequest = UserSearchRequest.builder()
				.requestInfo(garbageConnectionRequest.getRequestInfo()).userType("CITIZEN")
				.tenantId(garbageConnectionRequest.getGarbageConnection().getTenantId()).build();
		Set<String> availableMobileNumbers = new HashSet<>();
		listOfMobileNumbers.forEach(mobilenumber -> {
			userSearchRequest.setUserName(mobilenumber);
			UserDetailResponse userDetailResponse = userCall(userSearchRequest, uri);
			if (CollectionUtils.isEmpty(userDetailResponse.getUser()))
				availableMobileNumbers.add(mobilenumber);
		});
		return availableMobileNumbers;
	}

	/**
	 * Returns UserDetailResponse by calling user service with given uri and object
	 *
	 * @param userRequest Request object for user service
	 * @param uri         The address of the endpoint
	 * @return Response from user service as parsed as userDetailResponse
	 */
	@SuppressWarnings("unchecked")
	private UserDetailResponse userCall(Object userRequest, StringBuilder uri) {
		String dobFormat = null;
		log.info(uri.toString());
		log.info(configuration.getUserSearchEndpoint());
		dobFormat = "yyyy-MM-dd";
		try {
			LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(uri, userRequest);
			parseResponse(responseMap, dobFormat);
			UserDetailResponse userDetailResponse = mapper.convertValue(responseMap, UserDetailResponse.class);
			return userDetailResponse;
		} catch (IllegalArgumentException e) {
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
	 * Sets the role,type,active and tenantId for a Citizen
	 *
	 * @param tenantId   TenantId of the water connection
	 * @param role       The role of the user set in this case to CITIZEN
	 * @param holderInfo The user whose fields are to be set
	 */
	private void addUserDefaultFields(String tenantId, Role role, OwnerInfo holderInfo) {
		holderInfo.setActive(true);
		holderInfo.setStatus(Status.ACTIVE);
		holderInfo.setTenantId(tenantId);
		holderInfo.setRoles(Collections.singletonList(role));
		holderInfo.setType("CITIZEN");
		holderInfo.setCreatedDate(null);
		holderInfo.setCreatedBy(null);
		holderInfo.setLastModifiedDate(null);
		holderInfo.setLastModifiedBy(null);
	}

	/**
	 * Searches if the connection holder is already created. Search is based on name
	 * of owner, uuid and mobileNumbe
	 *
	 * @param connectionHolderInfo ConnectionHolderInfo which is to be searched
	 * @param requestInfo          RequestInfo from the waterConnectionRequest
	 * @return UserDetailResponse containing the user if present and the
	 * responseInfo
	 */
	private UserDetailResponse userExists(OwnerInfo connectionHolderInfo, RequestInfo requestInfo) {
		UserSearchRequest userSearchRequest = getBaseUserSearchRequest(connectionHolderInfo.getTenantId(), requestInfo);
		if(connectionHolderInfo.getUuid()!=null){
			userSearchRequest.setUuid(new HashSet<>(Collections.singletonList(connectionHolderInfo.getUuid())));
		}
		else {
			userSearchRequest.setMobileNumber(connectionHolderInfo.getMobileNumber());
			userSearchRequest.setUserType(connectionHolderInfo.getType());
			userSearchRequest.setName(connectionHolderInfo.getName());
		}
		StringBuilder uri = new StringBuilder(configuration.getUserHost())
				.append(configuration.getUserSearchEndpoint());
		return userCall(userSearchRequest, uri);
	}

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

	/**
	 * @param holderInfo         holder whose username has to be assigned
	 * @param listOfMobileNumber list of unique mobileNumbers in the waterconnection
	 *                           request
	 */
	private void setUserName(OwnerInfo holderInfo, Set<String> listOfMobileNumber) {

		if (listOfMobileNumber.contains(holderInfo.getMobileNumber())) {
			holderInfo.setUserName(holderInfo.getMobileNumber());
			// Once mobileNumber is set as userName it is removed from the list
			listOfMobileNumber.remove(holderInfo.getMobileNumber());
		} else {
			String username = UUID.randomUUID().toString();
			holderInfo.setUserName(username);
		}
	}

	/**
	 * @param holderInfo
	 * @param userDetailResponse
	 * @param requestInfo
	 */
	private void setOwnerFields(OwnerInfo holderInfo, UserDetailResponse userDetailResponse,
								RequestInfo requestInfo) {

		holderInfo.setUuid(userDetailResponse.getUser().get(0).getUuid());
		holderInfo.setId(userDetailResponse.getUser().get(0).getId());
		holderInfo.setUserName((userDetailResponse.getUser().get(0).getUserName()));
		holderInfo.setCreatedBy(requestInfo.getUserInfo().getUuid());
		holderInfo.setCreatedDate(System.currentTimeMillis());
		holderInfo.setLastModifiedBy(requestInfo.getUserInfo().getUuid());
		holderInfo.setLastModifiedDate(System.currentTimeMillis());
		holderInfo.setActive(userDetailResponse.getUser().get(0).getActive());
	}

	/**
	 * @param userSearchRequest
	 * @return serDetailResponse containing the user if present and the responseInfo
	 */
	public UserDetailResponse getUser(UserSearchRequest userSearchRequest) {
		StringBuilder uri = new StringBuilder(configuration.getUserHost())
				.append(configuration.getUserSearchEndpoint());
		UserDetailResponse userDetailResponse = userCall(userSearchRequest, uri);
		return userDetailResponse;
	}

	/**
	 * Get user based on given property
	 * @param userSearchRequest
	 * @return combination of uuid given in search criteria
	 */
	private Set<String> getUsersUUID(UserSearchRequest userSearchRequest) {
		StringBuilder uri = new StringBuilder(configuration.getUserHost())
				.append(configuration.getUserSearchEndpoint());
		UserDetailResponse userDetailResponse = userCall(userSearchRequest, uri);
		if (CollectionUtils.isEmpty(userDetailResponse.getUser()))
			return Collections.emptySet();
		return userDetailResponse.getUser().stream().map(OwnerInfo::getUuid).collect(Collectors.toSet());
	}

	/**
	 * @param mobileNumber
	 * @param tenantId
	 * @param requestInfo
	 * @return
	 */
	public Set<String> getUUIDForUsers(String mobileNumber, String ownerName, String tenantId, RequestInfo requestInfo) {
		//TenantId is not mandatory when Citizen searches. So it can be empty. Refer the value from UserInfo
		tenantId = StringUtils.isEmpty(tenantId) ? requestInfo.getUserInfo().getTenantId() : tenantId;
		UserSearchRequest userSearchRequest = UserSearchRequest.builder()
				.requestInfo(requestInfo).userType("CITIZEN")
				.tenantId(tenantId).mobileNumber(mobileNumber).name(ownerName).build();
		return getUsersUUID(userSearchRequest);
	}

	public void updateUser(GarbageConnectionRequest request, GarbageConnection existingWaterConnection) {
		if (!CollectionUtils.isEmpty(existingWaterConnection.getConnectionHolders())) {
			// We have connection holder in the existing application.
			if (CollectionUtils.isEmpty(request.getGarbageConnection().getConnectionHolders())) {
				// New update request removed the connectionHolder - need to clear the records.
				OwnerInfo conHolder = new OwnerInfo();
				request.getGarbageConnection().addConnectionHolderInfo(conHolder);
				return;
			}
		}

		//Update connection holder.
		createUser(request);
	}
}
