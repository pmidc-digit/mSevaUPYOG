package org.egov.dx.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.dx.util.Configurations;
import org.egov.dx.web.models.UserResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private Configurations configurations;

    public UserResponse getUser() {
        log.info("Fetching system user details via User Search flow");
        try {
            Map<String, Object> userSearchRequest = new HashMap<>();
            userSearchRequest.put("RequestInfo", new RequestInfo());
            userSearchRequest.put("uuid", Collections.singletonList(configurations.getAuthTokenVariable()));

            UserResponse userResponse = restTemplate.postForObject(
                    configurations.getUserHost() + configurations.getUserSearchEndPoint(),
                    userSearchRequest,
                    UserResponse.class
            );
            return userResponse;

        } catch (Exception e) {
            log.error("Error occurred while searching system user via user search flow", e);
            throw new CustomException("USER_SEARCH_ERROR", "Error occurred while searching system user: " + e.getMessage());
        }

    }

}
