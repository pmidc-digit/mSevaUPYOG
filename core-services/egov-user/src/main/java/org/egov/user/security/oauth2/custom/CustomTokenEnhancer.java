package org.egov.user.security.oauth2.custom;

import org.egov.user.domain.model.SecureUser;
import org.egov.user.domain.model.User;
import org.egov.user.domain.service.UserService;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.TokenEnhancerChain;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;



@Service
public class CustomTokenEnhancer extends TokenEnhancerChain {
	 private UserService userService;
	 org.egov.user.domain.model.User user;
    @Override
    public OAuth2AccessToken enhance(final OAuth2AccessToken accessToken, final OAuth2Authentication authentication) {
        final DefaultOAuth2AccessToken token = (DefaultOAuth2AccessToken) accessToken;

        SecureUser su = (SecureUser) authentication.getUserAuthentication().getPrincipal();
        final Map<String, Object> info = new LinkedHashMap<String, Object>();
        final Map<String, Object> responseInfo = new LinkedHashMap<String, Object>();
        Object detailsObj = authentication.getUserAuthentication().getDetails();
        boolean isPasswordType = false; // default
        if (detailsObj instanceof Map) {
            Map<?, ?> detailsMap = (Map<?, ?>) detailsObj;
            if (detailsMap.containsKey("isPasswordType")) {
                isPasswordType = Boolean.TRUE.equals(detailsMap.get("isPasswordType"));
            }
        }

        org.egov.user.web.contract.auth.User webUser = su.getUser();
        User domainUser = User.builder()
                .id(webUser.getId())
                .userName(webUser.getUserName())
                .build();
        user = domainUser;
        responseInfo.put("api_id", "");
        responseInfo.put("ver", "");
        responseInfo.put("ts", "");
        responseInfo.put("res_msg_id", "");
        responseInfo.put("msg_id", "");
        responseInfo.put("status", "Access Token generated successfully");
        info.put("ResponseInfo", responseInfo);
        info.put("UserRequest", su.getUser());
        
        token.setAdditionalInformation(info);
     //   userService.removeTokensByUser(user);
        OAuth2AccessToken enhancedToken = super.enhance(token, authentication);

        if (isPasswordType) {
            ((DefaultOAuth2AccessToken) enhancedToken).setValue(null);
            ((DefaultOAuth2AccessToken) enhancedToken).setRefreshToken(null);
            ((DefaultOAuth2AccessToken) enhancedToken).setExpiration(null);
            ((DefaultOAuth2AccessToken) enhancedToken).setScope(null);
            ((DefaultOAuth2AccessToken) enhancedToken).setTokenType(null);
        }
     
        return super.enhance(token, authentication);
    }


}