package org.egov.user.domain.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.tracer.model.CustomException;
import org.egov.user.domain.model.User;
import org.egov.user.domain.model.UserSearchCriteria;
import org.egov.user.domain.model.enums.UserType;
import org.egov.user.domain.service.utils.EncryptionDecryptionUtil;
import org.egov.user.persistence.dto.CitizenLoginSession;
import org.egov.user.persistence.repository.OtpRepository;
import org.egov.user.persistence.repository.UserRepository;
import org.egov.user.persistence.repository.VerificationTokenRepository;
import org.egov.user.web.contract.*;
import org.egov.user.web.contract.factory.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CitizenLoginService {

    private static final Pattern MOBILE_PATTERN = Pattern.compile("^\\d{10}$");
    private static final Pattern OTP_PATTERN = Pattern.compile("^[0-9a-zA-Z]{4,10}$");
    private static final Pattern TENANT_PATTERN = Pattern.compile("^[a-zA-Z0-9\\.\\-_]{2,50}$");
    private static final Pattern SAFE_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9\\-_]{1,128}$");

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final UserService userService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EncryptionDecryptionUtil encryptionDecryptionUtil;
    private final ResponseInfoFactory responseInfoFactory;

    @Value("${citizen.login.password.otp.fixed.enabled:${fixed.otp.enabled:false}}")
    private boolean fixedOTPEnabled;

    @Value("${citizen.login.password.otp.fixed.value:${fixed.otp.password:}}")
    private String fixedOTPPassword;

    @Autowired
    public CitizenLoginService(UserRepository userRepository,
                               OtpRepository otpRepository,
                               UserService userService,
                               VerificationTokenRepository verificationTokenRepository,
                               EncryptionDecryptionUtil encryptionDecryptionUtil,
                               ResponseInfoFactory responseInfoFactory) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.userService = userService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.encryptionDecryptionUtil = encryptionDecryptionUtil;
        this.responseInfoFactory = responseInfoFactory;
    }

    public CitizenLoginResponse login(CitizenLoginRequest request) {
        if (request == null) {
            throw new CustomException("INVALID_REQUEST", "Request body cannot be null");
        }

        if (StringUtils.isNotBlank(request.getVerificationToken())) {
            return handleProfileSelection(request);
        }

        return handleOtpVerificationAndProfileLookup(request);
    }

    /**
     * Step 2: Handle Profile Selection using verificationToken and userUuid.
     * Validates session, verifies userUuid belongs to the verified session, burns the token (single-use),
     * enforces tenant boundary, confirms account state, and returns the OAuth2 access token.
     */
    private CitizenLoginResponse handleProfileSelection(CitizenLoginRequest request) {
        log.info("Processing profile selection with verificationToken");

        String token = request.getVerificationToken() != null ? request.getVerificationToken().trim() : null;
        if (StringUtils.isBlank(token)) {
            throw new CustomException("INVALID_REQUEST", "verificationToken is mandatory for profile selection");
        }
        if (!SAFE_ID_PATTERN.matcher(token).matches()) {
            log.warn("Invalid verification token format received");
            throw new CustomException("INVALID_REQUEST", "Invalid verification token format");
        }

        String userUuid = request.getUserUuid() != null ? request.getUserUuid().trim() : null;
        if (StringUtils.isBlank(userUuid)) {
            throw new CustomException("INVALID_REQUEST", "userUuid is mandatory when verificationToken is provided");
        }
        if (!SAFE_ID_PATTERN.matcher(userUuid).matches()) {
            log.warn("Invalid userUuid format received");
            throw new CustomException("INVALID_REQUEST", "Invalid userUuid format");
        }

        String tenantId = request.getTenantId() != null ? request.getTenantId().trim() : null;
        if (StringUtils.isBlank(tenantId)) {
            throw new CustomException("INVALID_REQUEST", "tenantId is mandatory");
        }
        if (!TENANT_PATTERN.matcher(tenantId).matches()) {
            log.warn("Invalid tenantId format received");
            throw new CustomException("INVALID_REQUEST", "Invalid tenantId format");
        }

        // 1. Fetch verification session from Redis / in-memory store
        CitizenLoginSession session = verificationTokenRepository.getSession(token);
        if (session == null || StringUtils.isBlank(session.getMobileNumber())) {
            log.warn("Verification session expired or invalid for token: {}", sanitizeForLog(token));
            throw new CustomException("SESSION_EXPIRED", "Verification session has expired or is invalid. Please request a new OTP.");
        }

        // 2. IDOR Prevention: Verify that userUuid belongs to the verified session
        boolean isUuidAllowed = !CollectionUtils.isEmpty(session.getAllowedUuids()) &&
                session.getAllowedUuids().stream().anyMatch(allowed -> allowed != null && allowed.equalsIgnoreCase(userUuid));

        if (!isUuidAllowed) {
            log.warn("Access denied: userUuid {} is not in allowed profiles for session", sanitizeForLog(userUuid));
            throw new CustomException("ACCESS_DENIED", "The selected profile does not belong to the verified mobile number.");
        }

        // 3. Single-Use Replay Protection: Invalidate token immediately upon valid verification
        verificationTokenRepository.deleteSession(token);

        // 4. Cross-Tenant Protection: Verify tenant boundary matches session tenant
        String stateTenant = userService.getStateLevelTenantForCitizen(tenantId, UserType.CITIZEN);
        if (StringUtils.isBlank(stateTenant)) {
            stateTenant = tenantId;
        }

        String sessionTenant = session.getTenantId();
        if (StringUtils.isNotBlank(sessionTenant) && !sessionTenant.equalsIgnoreCase(stateTenant)) {
            log.warn("Tenant mismatch in profile selection: session tenant={}, request tenant={}", sessionTenant, stateTenant);
            throw new CustomException("ACCESS_DENIED", "Tenant mismatch: the selected profile does not belong to this tenant session.");
        }

        // 5. Cross-Mobile Protection: If client also supplied mobileNumber, confirm it matches session mobile
        if (StringUtils.isNotBlank(request.getMobileNumber())) {
            String clientMobile = cleanMobileNumber(request.getMobileNumber().trim());
            if (!session.getMobileNumber().equals(clientMobile)) {
                log.warn("Mobile mismatch in profile selection: session mobile={}, request mobile={}",
                        maskMobileNumber(session.getMobileNumber()), maskMobileNumber(clientMobile));
                throw new CustomException("ACCESS_DENIED", "Mobile number mismatch: does not match verified session.");
            }
        }

        // 6. Double-binding database search: Match both uuid, mobileNumber, tenantId, and type CITIZEN
        UserSearchCriteria criteria = UserSearchCriteria.builder()
                .uuid(Collections.singletonList(userUuid))
                .tenantId(stateTenant)
                .type(UserType.CITIZEN)
                .active(true)
                .build();

        criteria = encryptionDecryptionUtil.encryptObject(criteria, "UserSearchCriteria", UserSearchCriteria.class);
        List<User> users = userRepository.findAll(criteria);
        RequestInfo requestInfo = request.getRequestInfo() != null ? request.getRequestInfo() : RequestInfo.builder().build();
        users = encryptionDecryptionUtil.decryptObject(users, "UserListSelf", User.class, requestInfo);

        if (CollectionUtils.isEmpty(users)) {
            log.warn("User profile not found in database for UUID: {}", sanitizeForLog(userUuid));
            throw new CustomException("USER_NOT_FOUND", "User profile not found for UUID: " + userUuid);
        }

        User selectedUser = users.get(0);
        if (selectedUser == null || StringUtils.isBlank(selectedUser.getUserName())) {
            throw new CustomException("USER_NOT_FOUND", "Corrupted user record found for UUID: " + userUuid);
        }

        // 7. Privilege Escalation Guard: Confirm user is strictly a CITIZEN
        if (selectedUser.getType() != null && !UserType.CITIZEN.equals(selectedUser.getType())) {
            log.warn("Privilege escalation blocked: user {} has non-citizen type {}", sanitizeForLog(userUuid), selectedUser.getType());
            throw new CustomException("ACCESS_DENIED", "Access denied: profile is not a citizen account");
        }

        // 8. Account Status Guard: Block deactivated or locked accounts
        if (Boolean.FALSE.equals(selectedUser.getActive())) {
            log.warn("Access denied: user {} is deactivated", sanitizeForLog(userUuid));
            throw new CustomException("ACCOUNT_INACTIVE", "Your account is deactivated. Please contact support.");
        }
        if (Boolean.TRUE.equals(selectedUser.getAccountLocked())) {
            log.warn("Access denied: user {} is temporarily locked", sanitizeForLog(userUuid));
            throw new CustomException("ACCOUNT_LOCKED", "Your account is temporarily locked due to multiple failed login attempts. Please try again later.");
        }

        // 9. Cross-Account Profile Integrity Guard: Match DB user mobile with verified session mobile
        if (StringUtils.isNotBlank(selectedUser.getMobileNumber())) {
            String dbUserMobile = cleanMobileNumber(selectedUser.getMobileNumber());
            if (!session.getMobileNumber().equals(dbUserMobile)) {
                log.warn("Access denied: user profile mobile does not match session verified mobile");
                throw new CustomException("ACCESS_DENIED", "Access denied: profile does not match the verified mobile number");
            }
        }

        log.info("Generating access token for verified user: {} (uuid: {})", selectedUser.getUserName(), selectedUser.getUuid());

        Map<String, Object> tokenResponse = userService.getAccess(selectedUser, "");
        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            log.error("Failed to generate access token for user: {}", selectedUser.getUserName());
            throw new CustomException("LOGIN_ERROR", "Failed to generate access token. Please try again.");
        }

        return buildSuccessResponse(tokenResponse, request.getRequestInfo());
    }

    /**
     * Step 1: Handle OTP validation and profile lookup.
     * Enforces strict OTP check BEFORE database lookup to prevent phone-number enumeration.
     * Returns direct token if single profile, or profile summary list with verificationToken if multiple.
     */
    private CitizenLoginResponse handleOtpVerificationAndProfileLookup(CitizenLoginRequest request) {
        if (StringUtils.isBlank(request.getMobileNumber())) {
            throw new CustomException("INVALID_REQUEST", "mobileNumber is mandatory");
        }
        if (StringUtils.isBlank(request.getOtp())) {
            throw new CustomException("INVALID_REQUEST", "otp is mandatory");
        }
        if (StringUtils.isBlank(request.getTenantId())) {
            throw new CustomException("INVALID_REQUEST", "tenantId is mandatory");
        }

        String rawMobile = request.getMobileNumber().trim();
        String mobileNumber = cleanMobileNumber(rawMobile);
        if (StringUtils.isBlank(mobileNumber) || !MOBILE_PATTERN.matcher(mobileNumber).matches()) {
            log.warn("Invalid mobile number format provided: {}", maskMobileNumber(rawMobile));
            throw new CustomException("INVALID_MOBILE_NUMBER", "Mobile number must be a valid 10-digit number");
        }

        String otp = request.getOtp().trim();
        if (!OTP_PATTERN.matcher(otp).matches()) {
            log.warn("Invalid OTP format provided for mobile: {}", maskMobileNumber(mobileNumber));
            throw new CustomException("INVALID_OTP", "Invalid OTP. Please enter the valid OTP.");
        }

        String tenantId = request.getTenantId().trim();
        if (!TENANT_PATTERN.matcher(tenantId).matches()) {
            log.warn("Invalid tenantId format provided");
            throw new CustomException("INVALID_REQUEST", "Invalid tenantId format");
        }

        String stateTenant = userService.getStateLevelTenantForCitizen(tenantId, UserType.CITIZEN);
        if (StringUtils.isBlank(stateTenant)) {
            stateTenant = tenantId;
        }

        // 1. Critical Security Step: Validate OTP first before touching database.
        // Prevents unauthenticated users from probing phone numbers or extracting profile info.
        validateOtp(mobileNumber, otp, stateTenant, request.getRequestInfo());

        // 2. Query registered citizen accounts for this verified mobile number
        UserSearchCriteria criteria = UserSearchCriteria.builder()
                .mobileNumber(mobileNumber)
                .tenantId(stateTenant)
                .type(UserType.CITIZEN)
                .active(true)
                .build();

        criteria = encryptionDecryptionUtil.encryptObject(criteria, "UserSearchCriteria", UserSearchCriteria.class);
        List<User> users = userRepository.findAll(criteria);
        RequestInfo requestInfo = request.getRequestInfo() != null ? request.getRequestInfo() : RequestInfo.builder().build();
        users = encryptionDecryptionUtil.decryptObject(users, "UserListSelf", User.class, requestInfo);

        if (CollectionUtils.isEmpty(users)) {
            log.warn("No active citizen found for mobileNumber: {}", maskMobileNumber(mobileNumber));
            throw new CustomException("USER_NOT_FOUND", "No registered citizen account found for mobile number: " + mobileNumber + ". Please register.");
        }

        // 3. Filter valid, active, non-locked CITIZEN profiles
        List<User> validUsers = users.stream()
                .filter(u -> u != null && StringUtils.isNotBlank(u.getUuid()))
                .filter(u -> u.getType() == null || UserType.CITIZEN.equals(u.getType()))
                .filter(u -> !Boolean.FALSE.equals(u.getActive()))
                .filter(u -> !Boolean.TRUE.equals(u.getAccountLocked()))
                .collect(Collectors.toList());

        if (CollectionUtils.isEmpty(validUsers)) {
            log.warn("No valid, active citizen profiles found for mobile: {}", maskMobileNumber(mobileNumber));
            throw new CustomException("USER_NOT_FOUND", "No valid citizen profiles found for mobile number: " + mobileNumber);
        }

        // Case A: Exactly 1 profile -> Generate access token directly
        if (validUsers.size() == 1) {
            User singleUser = validUsers.get(0);
            log.info("Single citizen profile found for mobile: {}. Generating access token directly.", maskMobileNumber(mobileNumber));
            Map<String, Object> tokenResponse = userService.getAccess(singleUser, "");
            if (tokenResponse == null || tokenResponse.get("access_token") == null) {
                log.error("Failed to generate access token for single citizen: {}", singleUser.getUserName());
                throw new CustomException("LOGIN_ERROR", "Failed to generate access token. Please try again.");
            }
            return buildSuccessResponse(tokenResponse, request.getRequestInfo());
        }

        // Case B: Multiple profiles (>1) -> Create secure session with verificationToken
        log.info("Multiple citizen profiles ({}) found for mobile: {}. Returning profile list.", validUsers.size(), maskMobileNumber(mobileNumber));
        String verificationToken = UUID.randomUUID().toString();
        List<String> allowedUuids = validUsers.stream().map(User::getUuid).collect(Collectors.toList());

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber(mobileNumber)
                .tenantId(stateTenant)
                .allowedUuids(allowedUuids)
                .createdAt(System.currentTimeMillis())
                .build();

        verificationTokenRepository.saveSession(verificationToken, session);

        // Data Minimization: Return only non-sensitive summary fields needed for UI disambiguation
        List<CitizenProfile> profiles = validUsers.stream().map(u -> CitizenProfile.builder()
                .uuid(u.getUuid())
                .name(StringUtils.isNotBlank(u.getName()) ? u.getName().trim() : "")
                .userName(StringUtils.isNotBlank(u.getUserName()) ? u.getUserName().trim() : "")
                .mobileNumber(StringUtils.isNotBlank(u.getMobileNumber()) ? u.getMobileNumber().trim() : mobileNumber)
                .gender(u.getGender() != null ? u.getGender().name() : null)
                .guardian(StringUtils.isNotBlank(u.getGuardian()) ? u.getGuardian().trim() : null)
                .fatherOrHusbandName(StringUtils.isNotBlank(u.getGuardian()) ? u.getGuardian().trim() : null)
                .guardianRelation(u.getGuardianRelation() != null ? u.getGuardianRelation().name() : null)
                .relationship(u.getGuardianRelation() != null ? u.getGuardianRelation().name() : null)
                .build()
        ).collect(Collectors.toList());

        return CitizenLoginResponse.builder()
                .responseInfo(createResponseInfo(request.getRequestInfo(), true))
                .multipleProfiles(true)
                .verificationToken(verificationToken)
                .profiles(profiles)
                .build();
    }

    private void validateOtp(String mobileNumber, String otpValue, String tenantId, RequestInfo requestInfo) {
        if (fixedOTPEnabled && StringUtils.isNotBlank(fixedOTPPassword) && fixedOTPPassword.equals(otpValue)) {
            log.info("Fixed OTP matched for mobile: {}", maskMobileNumber(mobileNumber));
            return;
        }

        Otp otp = Otp.builder()
                .otp(otpValue)
                .identity(mobileNumber)
                .tenantId(tenantId)
                .userType(UserType.CITIZEN)
                .build();

        RequestInfo reqInfo = requestInfo != null ? requestInfo : RequestInfo.builder().action("validate").ts(System.currentTimeMillis()).build();
        OtpValidateRequest otpValidateRequest = OtpValidateRequest.builder()
                .requestInfo(reqInfo)
                .otp(otp)
                .build();

        boolean isOtpValid = otpRepository.validateOtp(otpValidateRequest);
        if (!isOtpValid) {
            log.warn("OTP validation failed for mobile: {}", maskMobileNumber(mobileNumber));
            throw new CustomException("INVALID_OTP", "Invalid OTP. Please enter the valid OTP.");
        }
    }

    private CitizenLoginResponse buildSuccessResponse(Map<String, Object> tokenResponse, RequestInfo requestInfo) {
        if (tokenResponse == null) {
            throw new CustomException("LOGIN_ERROR", "Authentication failed: token response is empty");
        }

        Long expiresIn = null;
        if (tokenResponse.get("expires_in") != null) {
            try {
                expiresIn = ((Number) tokenResponse.get("expires_in")).longValue();
            } catch (Exception e) {
                log.warn("Unable to parse expires_in: {}", tokenResponse.get("expires_in"));
            }
        }

        return CitizenLoginResponse.builder()
                .responseInfo(createResponseInfo(requestInfo, true))
                .multipleProfiles(false)
                .accessToken(tokenResponse.get("access_token") != null ? String.valueOf(tokenResponse.get("access_token")) : null)
                .tokenType(tokenResponse.get("token_type") != null ? String.valueOf(tokenResponse.get("token_type")) : null)
                .refreshToken(tokenResponse.get("refresh_token") != null ? String.valueOf(tokenResponse.get("refresh_token")) : null)
                .expiresIn(expiresIn)
                .scope(tokenResponse.get("scope") != null ? String.valueOf(tokenResponse.get("scope")) : null)
                .userRequest(tokenResponse.get("UserRequest"))
                .build();
    }

    private ResponseInfo createResponseInfo(RequestInfo requestInfo, boolean success) {
        if (requestInfo != null && requestInfo.getTs() == null) {
            requestInfo.setTs(System.currentTimeMillis());
        }
        if (responseInfoFactory != null) {
            try {
                ResponseInfo res = responseInfoFactory.createResponseInfoFromRequestInfo(requestInfo, success);
                if (res != null) {
                    return res;
                }
            } catch (Exception e) {
                log.warn("Failed to create ResponseInfo via factory: {}", e.getMessage());
            }
        }
        return ResponseInfo.builder()
                .apiId(requestInfo != null ? requestInfo.getApiId() : "")
                .ver(requestInfo != null ? requestInfo.getVer() : "")
                .ts(requestInfo != null && requestInfo.getTs() != null ? requestInfo.getTs() : System.currentTimeMillis())
                .resMsgId("uief87324")
                .msgId(requestInfo != null ? requestInfo.getMsgId() : "")
                .status(success ? "successful" : "failed")
                .build();
    }

    private String maskMobileNumber(String mobile) {
        if (StringUtils.isBlank(mobile) || mobile.length() < 6) {
            return "******";
        }
        String clean = cleanMobileNumber(mobile);
        if (clean.length() == 10) {
            return clean.substring(0, 2) + "******" + clean.substring(8);
        }
        return "******";
    }

    private String cleanMobileNumber(String m) {
        if (StringUtils.isBlank(m)) {
            return "";
        }
        String clean = m.replaceAll("[^0-9]", "");
        if (clean.length() > 10) {
            clean = clean.substring(clean.length() - 10);
        }
        return clean;
    }

    private String sanitizeForLog(String input) {
        if (StringUtils.isBlank(input)) {
            return "";
        }
        return input.replaceAll("[\r\n]", "");
    }
}
