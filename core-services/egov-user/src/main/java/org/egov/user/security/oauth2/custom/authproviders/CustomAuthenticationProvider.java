package org.egov.user.security.oauth2.custom.authproviders;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.ServiceCallException;
import org.egov.user.domain.exception.DuplicateUserNameException;
import org.egov.user.domain.exception.UserNotFoundException;
import org.egov.user.domain.model.SecureUser;
import org.egov.user.domain.model.User;
import org.egov.user.domain.model.enums.UserType;
import org.egov.user.domain.service.UserService;
import org.egov.user.domain.service.utils.EncryptionDecryptionUtil;
import org.egov.user.web.contract.auth.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;
import static org.egov.user.config.UserServiceConstants.IP_HEADER_NAME;
import static org.springframework.util.StringUtils.isEmpty;

@Component("customAuthProvider")
@Slf4j
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UserService userService;

    @Autowired
    private EncryptionDecryptionUtil encryptionDecryptionUtil;

    @Value("${citizen.login.password.otp.enabled}")
    private boolean citizenLoginPasswordOtpEnabled;

    @Value("${employee.login.password.otp.enabled}")
    private boolean employeeLoginPasswordOtpEnabled;

    @Value("${citizen.login.password.otp.fixed.value}")
    private String fixedOTPPassword;

    @Value("${citizen.login.password.otp.fixed.enabled}")
    private boolean fixedOTPEnabled;

    @Value("${otp.bypass.for}")
    private String thirdPartyCitizen;

    @Value("${bypass.otp}")
    private String otpForThirdparty;

    @Value("${default.employee.password}")
    private String defaultEmployeePassword;

    @Autowired
    private HttpServletRequest request;

    public CustomAuthenticationProvider(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) {

        String userName = authentication.getName();
        String password = authentication.getCredentials().toString();

        final LinkedHashMap<String, Object> details =
                (LinkedHashMap<String, Object>) authentication.getDetails();

        String thirdPartyValue = (String) details.get("thirdPartyName");
        String tenantId = (String) details.get("tenantId");
        String userType = (String) details.get("userType");

        // 🔹 Third party bypass logic (Citizen only)
        if (!isEmpty(thirdPartyValue)
                && thirdPartyCitizen.equalsIgnoreCase(thirdPartyValue)
                && "CITIZEN".equalsIgnoreCase(userType)
                && password.equalsIgnoreCase(otpForThirdparty)) {

            log.debug("Third Party authentication enabled.");
            password = fixedOTPPassword;
        }

        if (isEmpty(tenantId)) {
            throw new OAuth2Exception("TenantId is mandatory");
        }

        if (isEmpty(userType) || isNull(UserType.fromValue(userType))) {
            throw new OAuth2Exception("User Type is mandatory and has to be valid");
        }

        User user;
        RequestInfo requestInfo;

        try {
            user = userService.getUniqueUser(userName, tenantId, UserType.fromValue(userType));

            requestInfo = RequestInfo.builder().build();

            user = encryptionDecryptionUtil.decryptObject(
                    user, "UserListSelf", User.class, requestInfo
            );

        } catch (UserNotFoundException | DuplicateUserNameException e) {
            log.error("Login failed", e);
            throw new OAuth2Exception("Invalid login credentials");
        }

        if (user.getActive() == null || !user.getActive()) {
            throw new OAuth2Exception("Please activate your account");
        }

        if (user.getAccountLocked() != null && user.getAccountLocked()) {
            if (userService.isAccountUnlockAble(user)) {
                user = unlockAccount(user, requestInfo);
            } else {
                throw new OAuth2Exception("Account locked");
            }
        }

        boolean isCitizen = user.getType() != null &&
                user.getType().equals(UserType.CITIZEN);

        // ✅ Detect login type
        boolean isPasswordType = !password.matches("\\d{6}");

        // ✅ Pass to TokenEnhancer
        details.put("isPasswordType", isPasswordType);

        boolean isPasswordMatched;

        if (isCitizen) {

            if (fixedOTPEnabled
                    && !fixedOTPPassword.isEmpty()
                    && fixedOTPPassword.equals(password)) {

                isPasswordMatched = true;

            } else {

                isPasswordMatched = isPasswordMatch(
                        citizenLoginPasswordOtpEnabled,
                        password,
                        user,
                        authentication
                );
            }

        } else {

            if (employeeLoginPasswordOtpEnabled
                    && password.equals(defaultEmployeePassword)
                    && !isPasswordType) {

                isPasswordMatched = true;

            } else {

                boolean isOtpLogin = !isPasswordType;

                isPasswordMatched = isPasswordMatch(
                        isOtpLogin,
                        password,
                        user,
                        authentication
                );
            }
        }

        if (isPasswordMatched) {

        	userService.removeTokensByUsers(user);

            List<GrantedAuthority> grantedAuths = new ArrayList<>();
            grantedAuths.add(new SimpleGrantedAuthority("ROLE_" + user.getType()));

            SecureUser secureUser = new SecureUser(getUser(user));
            userService.resetFailedLoginAttempts(user);

            return new UsernamePasswordAuthenticationToken(
                    secureUser,
                    password,
                    grantedAuths
            );
        }

        userService.handleFailedLogin(
                user,
                request.getHeader(IP_HEADER_NAME),
                requestInfo
        );

        throw new OAuth2Exception("Invalid login credentials");
    }

    private boolean isPasswordMatch(Boolean isOtpBased,
                                    String password,
                                    User user,
                                    Authentication authentication) {

        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

        final LinkedHashMap<String, Object> details =
                (LinkedHashMap<String, Object>) authentication.getDetails();

        String isCallInternal = (String) details.get("isInternal");

        if (isOtpBased) {

            if ("true".equals(isCallInternal)) {
                return true;
            }

            user.setOtpReference(password);

            try {
                return userService.validateOtp(user);
            } catch (ServiceCallException e) {
                return false;
            }

        } else {

            if ("true".equals(isCallInternal)) {
                return true;
            }

            return bcrypt.matches(password, user.getPassword());
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class
                .isAssignableFrom(authentication);
    }

    private User unlockAccount(User user, RequestInfo requestInfo) {

        User updatedUser = userService.updateWithoutOtpValidation(
                user.toBuilder()
                        .accountLocked(false)
                        .password(user.getPassword())
                        .build(),
                requestInfo
        );

        userService.resetFailedLoginAttempts(updatedUser);
        return updatedUser;
    }

    private org.egov.user.web.contract.auth.User getUser(User user) {

        return org.egov.user.web.contract.auth.User.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .uuid(user.getUuid())
                .name(user.getName())
                .mobileNumber(user.getMobileNumber())
                .emailId(user.getEmailId())
                .locale(user.getLocale())
                .active(user.getActive())
                .type(user.getType().name())
                .roles(toAuthRole(user.getRoles()))
                .tenantId(user.getTenantId())
                .build();
    }

    private Set<Role> toAuthRole(
            Set<org.egov.user.domain.model.Role> domainRoles) {

        if (domainRoles == null)
            return new HashSet<>();

        return domainRoles.stream()
                .map(org.egov.user.web.contract.auth.Role::new)
                .collect(Collectors.toSet());
    }
}