package org.egov.user.web.controller;

import org.egov.user.security.oauth2.custom.CustomAuthenticationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static org.egov.user.config.UserServiceConstants.USER_CLIENT_ID;

@RestController
public class OAuthTokenController {

    @Autowired
    private CustomAuthenticationManager authenticationManager;

    @Autowired
    private DefaultTokenServices customTokenServices;

    @PostMapping("/oauth/token")
    public ResponseEntity<?> getAccessToken(@RequestParam Map<String, String> parameters,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // 1. Validate grant type
        String grantType = parameters.get("grant_type");
        if (grantType == null) {
            return new ResponseEntity<>(Map.of("error", "invalid_request", "error_description", "Missing grant_type"), HttpStatus.BAD_REQUEST);
        }

        // 2. Determine client ID
        String clientId = null;
        if (authHeader != null && authHeader.toLowerCase().startsWith("basic ")) {
            try {
                String decoded = new String(Base64.getDecoder().decode(authHeader.substring(6)));
                String[] split = decoded.split(":");
                clientId = split[0];
            } catch (Exception e) {
                // ignore
            }
        }
        if (clientId == null) {
            clientId = parameters.get("client_id");
        }
        if (clientId == null) {
            clientId = USER_CLIENT_ID; // fallback
        }

        if (grantType.equalsIgnoreCase("password")) {
            String username = parameters.get("username");
            String password = parameters.get("password");
            String tenantId = parameters.get("tenantId");
            String userType = parameters.get("userType");
            String thirdPartyName = parameters.get("thirdPartyName");

            // Build request details
            LinkedHashMap<String, Object> details = new LinkedHashMap<>();
            details.put("tenantId", tenantId);
            details.put("userType", userType);
            details.put("thirdPartyName", thirdPartyName);

            UsernamePasswordAuthenticationToken userAuth = new UsernamePasswordAuthenticationToken(username, password);
            userAuth.setDetails(details);

            // Authenticate user
            Authentication authenticatedUser = authenticationManager.authenticate(userAuth);

            // Build OAuth2Request
            Map<String, String> requestParameters = new HashMap<>(parameters);
            String scopeStr = parameters.get("scope");
            Set<String> scope = scopeStr != null ? new HashSet<>(Arrays.asList(scopeStr.split(" "))) : Collections.emptySet();
            OAuth2Request oAuth2Request = new OAuth2Request(requestParameters, clientId, null, true, scope, null, null, null, null);

            // Build OAuth2Authentication
            OAuth2Authentication oAuth2Authentication = new OAuth2Authentication(oAuth2Request, authenticatedUser);

            // Create token
            OAuth2AccessToken token = customTokenServices.createAccessToken(oAuth2Authentication);

            return new ResponseEntity<>(token, HttpStatus.OK);
        } else if (grantType.equalsIgnoreCase("refresh_token")) {
            String refreshToken = parameters.get("refresh_token");
            if (refreshToken == null) {
                return new ResponseEntity<>(Map.of("error", "invalid_request", "error_description", "Missing refresh_token"), HttpStatus.BAD_REQUEST);
            }
            try {
                OAuth2AccessToken token = customTokenServices.refreshAccessToken(refreshToken, null);
                return new ResponseEntity<>(token, HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>(Map.of("error", "invalid_grant", "error_description", e.getMessage()), HttpStatus.BAD_REQUEST);
            }
        } else {
            return new ResponseEntity<>(Map.of("error", "unsupported_grant_type", "error_description", "Unsupported grant type: " + grantType), HttpStatus.BAD_REQUEST);
        }
    }
}
