package org.egov.user.security.oauth2.custom;

import org.egov.user.domain.model.SecureUser;
import org.egov.user.domain.model.User;
import org.egov.user.domain.service.UserService;
import org.egov.user.persistence.dto.UserSession;
import org.egov.user.persistence.repository.UserRepository;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.TokenEnhancerChain;
import org.springframework.stereotype.Service;


import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import javax.servlet.http.HttpServletRequest;





@Service
public class CustomTokenEnhancer extends TokenEnhancerChain {
	 private UserService userService;
	 org.egov.user.domain.model.User user;

	 private UserRepository userRepository;
	  public CustomTokenEnhancer(UserRepository userRepository) {
	        this.userRepository = userRepository;
	    }
	  @Override
	  public OAuth2AccessToken enhance(final OAuth2AccessToken accessToken,
	                                   final OAuth2Authentication authentication) {

	      DefaultOAuth2AccessToken token = (DefaultOAuth2AccessToken) accessToken;

	      SecureUser su =
	              (SecureUser) authentication.getUserAuthentication().getPrincipal();

	      Map<String, Object> info = new LinkedHashMap<>();
	      Map<String, Object> responseInfo = new LinkedHashMap<>();

	      // ✅ Read isPasswordType from Authentication details
	      boolean isPasswordType = false;

	      Object detailsObj = authentication.getUserAuthentication().getDetails();
	      if (detailsObj instanceof Map) {
	          Map<?, ?> detailsMap = (Map<?, ?>) detailsObj;
	          Object value = detailsMap.get("isPasswordType");
	          if (value instanceof Boolean) {
	              isPasswordType = (Boolean) value;
	          }
	      }

	      responseInfo.put("api_id", "");
	      responseInfo.put("ver", "");
	      responseInfo.put("ts", "");
	      responseInfo.put("res_msg_id", "");
	      responseInfo.put("msg_id", "");
	      responseInfo.put("status", "Access Token generated successfully");

	      info.put("ResponseInfo", responseInfo);
	      info.put("UserRequest", su.getUser());

	      token.setAdditionalInformation(info);

	      // ✅ Call super ONLY ONCE
	      DefaultOAuth2AccessToken enhancedToken =
	              (DefaultOAuth2AccessToken) super.enhance(token, authentication);

	      // 🔐 If password login → hide token values
	      if (isPasswordType) {
	          enhancedToken.setValue(null);
	          enhancedToken.setRefreshToken(null);
	          enhancedToken.setExpiration(null);
	          enhancedToken.setScope(null);
	          enhancedToken.setTokenType(null);
	      }

	      // ✅ Save session
	      String ipAddress = "";
	      ServletRequestAttributes attr =
	              (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

	      if (attr != null) {
	          HttpServletRequest request = attr.getRequest();
	          ipAddress = request.getHeader("X-Forwarded-For");
	          if (ipAddress == null || ipAddress.isEmpty()) {
	              ipAddress = request.getRemoteAddr();
	          }
	      }

	      ZoneId IST = ZoneId.of("Asia/Kolkata");
	      ZonedDateTime nowIST = ZonedDateTime.now(IST);

	      UserSession session = UserSession.builder()
	              .id(UUID.randomUUID())
	              .userUuid(su.getUser().getUuid())
	              .userId(su.getUser().getId())
	              .loginTime(nowIST.toLocalDateTime())
	              .ipAddress(ipAddress)
	              .userName(su.getUsername())
	              .userType(su.getUser().getType())
	              .isCurrentlyLoggedIn(true)
	              .isautologout(false)
	              .build();

	      userRepository.insertUserSession(session);

	      return enhancedToken;   // ✅ RETURN THIS
	  }
}