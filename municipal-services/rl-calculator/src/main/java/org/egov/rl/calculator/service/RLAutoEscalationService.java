package org.egov.rl.calculator.service;

import java.util.List;
import java.util.stream.Collectors;

import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.common.contract.request.RequestInfo;

import org.egov.rl.calculator.web.models.UserDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;


/**
 * Service to perform the Auto Escalation process
 * 
 *  @author Roshan chaudhary
 */
@Service
@Slf4j
public class RLAutoEscalationService {
	
	private ObjectMapper mapper;
		
	private UserService userService;
	
	@Autowired
	public RLAutoEscalationService(ObjectMapper mapper,
			UserService userService) {
		super();
		this.mapper = mapper;
		this.userService = userService;
	}

	
	/**
	 * Create the RequestInfo object of the System user
	 * 
	 * @return RequestInfo object
	 */
	public RequestInfo getDefaultRequestInfo() {

		RequestInfo requestInfo = new RequestInfo();

		UserDetailResponse ownerInfo = userService.searchSystemUser();
		User user = mapper.convertValue(ownerInfo.getUser().get(0), User.class);

		List<Role> r = user.getRoles().stream().map(d -> {
			d = Role.builder().code(d.getCode()).id(d.getId()).name(d.getName()).tenantId(d.getTenantId()).build();
			return d;
		}).collect(Collectors.toList());
		user.setRoles(r);
		
		requestInfo.setApiId("Rainmaker");
		requestInfo.setAuthToken("128b3831-98ab-4ac3-9424-545aecbe05c3");
		requestInfo.setMsgId("1756728031554|en_IN");
		requestInfo.setPlainAccessRequest(null);
		requestInfo.setUserInfo(user);
		System.out.println("----"+requestInfo);
		
		return requestInfo;

	}

	
}
