package org.egov.rl.calculator.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.ArrayList;
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
import org.egov.rl.calculator.repository.ServiceRequestRepository;
import org.egov.rl.calculator.web.models.CreateUserRequest;
import org.egov.rl.calculator.web.models.Owner;
import org.egov.rl.calculator.web.models.User;
import org.egov.rl.calculator.web.models.UserDetailResponse;
import org.egov.rl.calculator.web.models.UserSearchRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
@Slf4j
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
		// Remove all other criteria - search by mobile number only to avoid search failures
		// userSearchRequest.setUserType(owner.getType());
		// userSearchRequest.setName(owner.getName());

		StringBuilder uri = new StringBuilder(userHost).append(userSearchEndpoint);
		UserDetailResponse response = userCall(userSearchRequest, uri);
		
		// Debug: Log search results to understand what's happening
		if (response != null && response.getUser() != null) {
			System.out.println("Search found " + response.getUser().size() + " users for mobile: " + owner.getMobileNumber());
		} else {
			System.out.println("Search found no users for mobile: " + owner.getMobileNumber());
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
			System.out.println("Alternative search found " + response.getUser().size() + " users for userName: " + userName);
		} else {
			System.out.println("Alternative search found no users for userName: " + userName);
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
			System.out.println("UUID search found " + response.getUser().size() + " users for UUID: " + uuid);
		} else {
			System.out.println("UUID search found no users for UUID: " + uuid);
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

		StringBuilder uri = new StringBuilder(userHost).append(userSearchEndpoint);
		return userCall(userSearchRequest, uri);
	}
}
