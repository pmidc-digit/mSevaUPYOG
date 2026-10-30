package org.egov.user.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.user.domain.exception.*;
import org.egov.user.domain.model.LoggedInUserUpdatePasswordRequest;
import org.egov.user.domain.model.NonLoggedInUserUpdatePasswordRequest;
import org.egov.user.domain.model.User;
import org.egov.user.domain.model.UserSearchCriteria;
import org.egov.user.domain.model.enums.UserType;
import org.egov.user.domain.service.utils.EncryptionDecryptionUtil;
import org.egov.user.domain.service.utils.IpAddressUtil;
import org.egov.user.domain.service.utils.NotificationUtil;
import org.egov.user.persistence.dto.FailedLoginAttempt;
import org.egov.user.persistence.repository.FileStoreRepository;
import org.egov.user.persistence.repository.OtpRepository;
import org.egov.user.persistence.repository.UserRepository;
import org.egov.user.web.contract.Otp;
import org.egov.user.web.contract.OtpValidateRequest;
import org.egov.user.web.contract.UserUnlockRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;
import static org.apache.commons.lang3.StringUtils.isEmpty;
import static org.egov.user.config.UserServiceConstants.*;
import static org.springframework.util.CollectionUtils.isEmpty;

@Service
@Slf4j
public class UserService {

    private UserRepository userRepository;
    private OtpRepository otpRepository;
    private PasswordEncoder passwordEncoder;
    private int defaultPasswordExpiryInDays;
    private boolean isCitizenLoginOtpBased;
    private boolean isEmployeeLoginOtpBased;
    private FileStoreRepository fileRepository;
    private EncryptionDecryptionUtil encryptionDecryptionUtil;
    private TokenStore tokenStore;

    @Value("${egov.user.host}")
    private String userHost;

    @Value("${account.unlock.cool.down.period.minutes}")
    private Long accountUnlockCoolDownPeriod;

    @Value("${max.invalid.login.attempts.period.minutes}")
    private Long maxInvalidLoginAttemptsPeriod;

    @Value("${create.user.validate.name}")
    private boolean createUserValidateName;

    @Value("${max.invalid.login.attempts:7}")
    private Long maxInvalidLoginAttempts;

    @Value("${egov.user.pwd.pattern}")
    private String pwdRegex;

    @Value("${egov.user.pwd.pattern.min.length}")
    private Integer pwdMinLength;

    @Value("${egov.user.pwd.pattern.max.length}")
    private Integer pwdMaxLength;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private NotificationUtil notificationUtil;

    public UserService(UserRepository userRepository, OtpRepository otpRepository, FileStoreRepository fileRepository,
            PasswordEncoder passwordEncoder, EncryptionDecryptionUtil encryptionDecryptionUtil, TokenStore tokenStore,
            @Value("${default.password.expiry.in.days}") int defaultPasswordExpiryInDays,
            @Value("${citizen.login.password.otp.enabled}") boolean isCitizenLoginOtpBased,
            @Value("${employee.login.password.otp.enabled}") boolean isEmployeeLoginOtpBased,
            @Value("${egov.user.pwd.pattern}") String pwdRegex,
            @Value("${egov.user.pwd.pattern.max.length}") Integer pwdMaxLength,
            @Value("${egov.user.pwd.pattern.min.length}") Integer pwdMinLength) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultPasswordExpiryInDays = defaultPasswordExpiryInDays;
        this.isCitizenLoginOtpBased = isCitizenLoginOtpBased;
        this.isEmployeeLoginOtpBased = isEmployeeLoginOtpBased;
        this.fileRepository = fileRepository;
        this.encryptionDecryptionUtil = encryptionDecryptionUtil;
        this.tokenStore = tokenStore;
        this.pwdRegex = pwdRegex;
        this.pwdMaxLength = pwdMaxLength;
        this.pwdMinLength = pwdMinLength;

    }

    /**
     * get user By UserName And TenantId
     *
     * @param userName
     * @param tenantId
     * @return
     */
    public User getUniqueUser(String userName, String tenantId, UserType userType) {

        UserSearchCriteria userSearchCriteria = null;

        boolean isMobileNumber = userName.matches("[1-9]\\d{9}");
        if (isMobileNumber && !userType.equals(UserType.CITIZEN)) {
            userSearchCriteria = UserSearchCriteria.builder().mobileNumber(userName)
                    .tenantId(getStateLevelTenantForCitizen(tenantId, userType)).type(userType).build();
        } else {
            userSearchCriteria = UserSearchCriteria.builder().userName(userName)
                    .tenantId(getStateLevelTenantForCitizen(tenantId, userType)).type(userType).build();
        }

        if (isEmpty(userName) || isEmpty(tenantId) || isNull(userType)) {
            log.error("Invalid lookup, mandatory fields are absent");
            throw new UserNotFoundException(userSearchCriteria);
        }

        /* encrypt here */

        userSearchCriteria = encryptionDecryptionUtil.encryptObject(userSearchCriteria, "UserSearchCriteria",
                UserSearchCriteria.class);
        List<User> users = userRepository.findAll(userSearchCriteria);

        if (users.isEmpty())
            throw new UserNotFoundException(userSearchCriteria);
        if (users.size() > 1)
            throw new DuplicateUserNameException(userSearchCriteria);

        return users.get(0);
    }

    public User getUserByUuid(String uuid) {

        UserSearchCriteria userSearchCriteria = UserSearchCriteria.builder()
                .uuid(Collections.singletonList(uuid))
                .build();

        if (isEmpty(uuid)) {
            log.error("UUID is mandatory");
            throw new UserNotFoundException(userSearchCriteria);
        }

        List<User> users = userRepository.findAll(userSearchCriteria);

        if (users.isEmpty())
            throw new UserNotFoundException(userSearchCriteria);
        return users.get(0);
    }

    /**
     * get the users based on on userSearch criteria
     *
     * @param searchCriteria
     * @return
     */

    public List<org.egov.user.domain.model.User> searchUsers(UserSearchCriteria searchCriteria,
            boolean isInterServiceCall, RequestInfo requestInfo) {

        searchCriteria.validate(isInterServiceCall);

        searchCriteria
                .setTenantId(getStateLevelTenantForCitizen(searchCriteria.getTenantId(), searchCriteria.getType()));
        /* encrypt here / encrypted searchcriteria will be used for search */

        String altmobnumber = null;

        /*
         * if(searchCriteria.getMobileNumber()!=null) { altmobnumber =
         * searchCriteria.getMobileNumber(); }
         */
        // org.egov.user.domain.model.User user=
        // encryptionDecryptionUtil.encryptObject(searchCriteria, "User", User.class);
        searchCriteria = encryptionDecryptionUtil.encryptObject(searchCriteria, "UserSearchCriteria",
                UserSearchCriteria.class);

        if (altmobnumber != null) {
            searchCriteria.setAlternatemobilenumber(altmobnumber);
        }

        List<org.egov.user.domain.model.User> list = userRepository.findAll(searchCriteria);

        /* decrypt here / final reponse decrypted */

        list = encryptionDecryptionUtil.decryptObject(list, "UserListSelf", User.class, requestInfo);

        // setFileStoreUrlsByFileStoreIds(list);
        return list;
    }

    /**
     * api will create the user based on some validations
     *
     * @param user
     * @return
     */
    public User createUser(User user, RequestInfo requestInfo) {
        user.setUuid(UUID.randomUUID().toString());
        if (UserType.CITIZEN.equals(user.getType())) {
            if (user.getUserName() == null || isEmpty(user.getUserName()) || StringUtils.isBlank(user.getUserName())) {
                user.setUserName(UUID.randomUUID().toString());
            } else {
                handleCitizenDuplicateCheck(user, requestInfo);
            }
        }
        user.validateNewUser(createUserValidateName);
        if (!CLIENT_ID.equals(user.getClientId())) {
            conditionallyValidateOtp(user);
        }

        /* encrypt here */
        user = encryptionDecryptionUtil.encryptObject(user, "UserSelf", User.class);
        validateUserUniqueness(user);
        if (isEmpty(user.getPassword())) {
            user.setPassword(UUID.randomUUID().toString());
        } else {
            validatePassword(user.getPassword());
        }
        user.setPassword(encryptPwd(user.getPassword()));
        user.setDefaultPasswordExpiry(defaultPasswordExpiryInDays);
        user.setTenantId(getStateLevelTenantForCitizen(user.getTenantId(), user.getType()));
        User persistedNewUser = persistNewUser(user);
        return encryptionDecryptionUtil.decryptObject(persistedNewUser, null, User.class, requestInfo);

        /* decrypt here because encrypted data coming from DB */

    }

    private void validateUserUniqueness(User user) {
        if (userRepository.isUserPresent(user.getUserName(), getStateLevelTenantForCitizen(user.getTenantId(), user
                .getType()), user.getType()))
            throw new DuplicateUserNameException(UserSearchCriteria.builder().userName(user.getUserName()).type(user
                    .getType()).tenantId(user.getTenantId()).build());
    }

    private String getStateLevelTenantForCitizen(String tenantId, UserType userType) {
        if (!isNull(userType) && userType.equals(UserType.CITIZEN) && !isEmpty(tenantId) && tenantId.contains("."))
            return tenantId.split("\\.")[0];
        else
            return tenantId;
    }

    private void handleCitizenDuplicateCheck(User user, RequestInfo requestInfo) {
        String stateTenant = getStateLevelTenantForCitizen(user.getTenantId(), user.getType());
        if (!userRepository.isUserPresent(user.getUserName(), stateTenant, user.getType())) {
            return;
        }

        try {
            UserSearchCriteria userSearchCriteria = UserSearchCriteria.builder()
                    .userName(user.getUserName())
                    .tenantId(stateTenant)
                    .type(UserType.CITIZEN)
                    .build();
            userSearchCriteria = encryptionDecryptionUtil.encryptObject(userSearchCriteria, "UserSearchCriteria", UserSearchCriteria.class);
            List<User> existingUsers = userRepository.findAll(userSearchCriteria);

            if (!CollectionUtils.isEmpty(existingUsers)) {
                User existingUser = encryptionDecryptionUtil.decryptObject(existingUsers.get(0), null, User.class, requestInfo);
                if (isSameCitizen(user, existingUser)) {
                    log.info("Citizen with userName {} already exists with matching details. Throwing duplicate user exception.", user.getUserName());
                    throw new DuplicateUserNameException(UserSearchCriteria.builder()
                            .userName(user.getUserName())
                            .type(user.getType())
                            .tenantId(user.getTenantId())
                            .build());
                } else {
                    String newUuidUserName = UUID.randomUUID().toString();
                    log.info("Citizen with userName {} already exists but details differ. Assigning new random UUID userName: {}", user.getUserName(), newUuidUserName);
                    user.setUserName(newUuidUserName);
                }
            } else {
                String newUuidUserName = UUID.randomUUID().toString();
                log.warn("Citizen userName {} is present in DB but findAll returned empty. Assigning new UUID: {}", user.getUserName(), newUuidUserName);
                user.setUserName(newUuidUserName);
            }
        } catch (DuplicateUserNameException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error occurred while checking citizen duplicates for userName: " + user.getUserName(), e);
            throw e;
        }
    }

    private boolean isSameCitizen(User newUser, User existingUser) {
        if (existingUser == null) {
            return false;
        }

        boolean mobileMatches = isMobileMatching(newUser.getMobileNumber(), existingUser.getMobileNumber());
        boolean nameMatches = isFuzzyMatching(newUser.getName(), existingUser.getName());
        boolean guardianMatches = isGuardianMatching(newUser.getGuardian(), existingUser.getGuardian());

        return mobileMatches && nameMatches && guardianMatches;
    }

    private boolean isMobileMatching(String m1, String m2) {
        if (StringUtils.isBlank(m1) || StringUtils.isBlank(m2)) {
            return false;
        }
        String clean1 = m1.replaceAll("[^0-9]", "");
        String clean2 = m2.replaceAll("[^0-9]", "");
        if (clean1.length() > 10) clean1 = clean1.substring(clean1.length() - 10);
        if (clean2.length() > 10) clean2 = clean2.substring(clean2.length() - 10);
        return !clean1.isEmpty() && clean1.equals(clean2);
    }

    private boolean isGuardianMatching(String g1, String g2) {
        if (StringUtils.isBlank(g1) && StringUtils.isBlank(g2)) {
            return true;
        }
        if (StringUtils.isBlank(g1) || StringUtils.isBlank(g2)) {
            return true;
        }
        return isFuzzyMatching(g1, g2);
    }

    private boolean isFuzzyMatching(String s1, String s2) {
        if (StringUtils.isBlank(s1) && StringUtils.isBlank(s2)) {
            return true;
        }
        if (StringUtils.isBlank(s1) || StringUtils.isBlank(s2)) {
            return false;
        }
        String norm1 = normalizeString(s1).toLowerCase();
        String norm2 = normalizeString(s2).toLowerCase();

        if (norm1.equals(norm2)) {
            return true;
        }

        String[] tokens1 = norm1.split("\\s+");
        String[] tokens2 = norm2.split("\\s+");

        if (tokens1.length > 0 && tokens2.length > 0) {
            String firstName1 = tokens1[0];
            String firstName2 = tokens2[0];
            if (!isWordClose(firstName1, firstName2)) {
                return false;
            }
        }

        int maxLen = Math.max(norm1.length(), norm2.length());
        int distance = StringUtils.getLevenshteinDistance(norm1, norm2);
        return distance <= 2 && ((double) distance / maxLen) <= 0.20;
    }

    private boolean isWordClose(String w1, String w2) {
        if (w1.equals(w2)) {
            return true;
        }
        int maxLen = Math.max(w1.length(), w2.length());
        if (maxLen <= 3) {
            return false;
        }
        int dist = StringUtils.getLevenshteinDistance(w1, w2);
        return dist <= 1;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll("(?i)\\b(mr|mrs|ms|shri|smt|dr)\\.?\\b", "");
        return cleaned.replaceAll("[^a-zA-Z0-9\\s]", " ").trim().replaceAll("\\s+", " ");
    }

    /**
     * api will create the citizen with otp
     *
     * @param user
     * @return
     */
    public User createCitizen(User user, RequestInfo requestInfo) {
        validateAndEnrichCitizen(user);
        return createUser(user, requestInfo);
    }

    private void validateAndEnrichCitizen(User user) {
        log.info("Validating User........");
        if (isCitizenLoginOtpBased && !StringUtils.isNumeric(user.getUserName()))
            throw new UserNameNotValidException();
        else if (isCitizenLoginOtpBased)
            user.setMobileNumber(user.getUserName());
        if (!isCitizenLoginOtpBased)
            validatePassword(user.getPassword());
        user.setRoleToCitizen();
        user.setTenantId(getStateLevelTenantForCitizen(user.getTenantId(), user.getType()));
    }

    /**
     * api will create the citizen with otp
     *
     * @param user
     * @return
     */
    public Object registerWithLogin(User user, RequestInfo requestInfo) {
        user.setActive(true);
        createCitizen(user, requestInfo);
        return getAccess(user, user.getOtpReference());
    }

    private Object getAccess(User user, String password) {
        log.info("Fetch access token for register with login flow");
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0");

            ServletRequestAttributes attr =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attr != null) {
                HttpServletRequest currentRequest = attr.getRequest();
                String clientIp = IpAddressUtil.getClientIp(currentRequest);
                if (!isEmpty(clientIp)) {
                    headers.set("X-Forwarded-For", clientIp);
                    headers.set("x-real-ip", clientIp);
                }
                String userAgent = currentRequest.getHeader("User-Agent");
                if (!isEmpty(userAgent)) {
                    headers.set("User-Agent", userAgent);
                }
            }

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("username", user.getUserName());
            if (!isEmpty(password))
                map.add("password", password);
            else
                map.add("password", user.getPassword());
            map.add("grant_type", "password");
            map.add("scope", "read");
            map.add("tenantId", user.getTenantId());
            map.add("isInternal", "true");
            map.add("userType", UserType.CITIZEN.name());
            if (CLIENT_ID.equals(user.getClientId())) {
                map.add("thirdPartyName", CLIENT_ID);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<MultiValueMap<String, String>>(map,
                    headers);
            return restTemplate.postForEntity(userHost + "/user/oauth/token", request, Map.class).getBody();

        } catch (Exception e) {
            log.error("Error occurred while logging-in via register flow", e);
            throw new CustomException("LOGIN_ERROR",
                    "Error occurred while logging in via register flow: " + e.getMessage());
        }
    }

    /**
     * dependent on otpValidationMandatory filed,it will validate the otp.
     *
     * @param user
     */
    private void conditionallyValidateOtp(User user) {
        if (user.isOtpValidationMandatory()) {
            if (!validateOtp(user))
                throw new OtpValidationPendingException();
        }
    }

    /**
     * This api will validate the otp
     *
     * @param user
     * @return
     */
    public Boolean validateOtp(User user) {
        Otp otp = null;
        if (user.getType().equals(UserType.CITIZEN) && isCitizenLoginOtpBased)

            otp = Otp.builder().otp(user.getOtpReference()).identity(user.getUserName()).tenantId(user.getTenantId())
                    .userType(user.getType()).build();
        else
            otp = Otp.builder().otp(user.getOtpReference()).identity(user.getMobileNumber())
                    .tenantId(user.getTenantId())
                    .userType(user.getType()).build();

        RequestInfo requestInfo = RequestInfo.builder().action("validate").ts(System.currentTimeMillis()).build();
        OtpValidateRequest otpValidationRequest = OtpValidateRequest.builder().requestInfo(requestInfo).otp(otp)
                .build();
        return otpRepository.validateOtp(otpValidationRequest);

    }

    /**
     * api will update user details without otp
     *
     * @param user
     * @return
     */
    // TODO Fix date formats
    public User updateWithoutOtpValidation(User user, RequestInfo requestInfo) {
        final User existingUser = getUserByUuid(user.getUuid());
        user.setTenantId(getStateLevelTenantForCitizen(user.getTenantId(), user.getType()));
        validateUserRoles(user);
        user.validateUserModification();
        validatePassword(user.getPassword());
        user.setPassword(encryptPwd(user.getPassword()));
        /* encrypt */
        user = encryptionDecryptionUtil.encryptObject(user, "User", User.class);
        userRepository.update(user, existingUser, requestInfo.getUserInfo().getId(),
                requestInfo.getUserInfo().getUuid());

        // If user is being unlocked via update, reset failed login attempts
        if (user.getAccountLocked() != null && !user.getAccountLocked() && existingUser.getAccountLocked())
            resetFailedLoginAttempts(user);

        User encryptedUpdatedUserfromDB = getUserByUuid(user.getUuid());
        User decryptedupdatedUserfromDB = encryptionDecryptionUtil.decryptObject(encryptedUpdatedUserfromDB, "User",
                User.class, requestInfo);
        return decryptedupdatedUserfromDB;
    }

    public void removeTokensByUser(User user) {
        Collection<OAuth2AccessToken> tokens = tokenStore.findTokensByClientIdAndUserName(USER_CLIENT_ID,
                user.getUserName());

        for (OAuth2AccessToken token : tokens) {
            if (token.getAdditionalInformation() != null
                    && token.getAdditionalInformation().containsKey("UserRequest")) {
                if (token.getAdditionalInformation()
                        .get("UserRequest") instanceof org.egov.user.web.contract.auth.User) {
                    org.egov.user.web.contract.auth.User userInfo = (org.egov.user.web.contract.auth.User) token
                            .getAdditionalInformation().get(
                                    "UserRequest");
                    if (user.getUserName().equalsIgnoreCase(userInfo.getUserName())
                            && user.getTenantId().equalsIgnoreCase(userInfo.getTenantId())
                            && user.getType().equals(UserType.fromValue(userInfo.getType())))
                        tokenStore.removeAccessToken(token);
                    userRepository.updateUserLogoutSession(user.getUuid(), true);

                }
            }
        }

    }

    public void removeTokensByUsers(User user) {

        if (user == null || user.getUserName() == null) {
            return;
        }

        Collection<OAuth2AccessToken> tokens = tokenStore.findTokensByClientIdAndUserName(
                USER_CLIENT_ID,
                user.getUserName());

        if (tokens == null || tokens.isEmpty()) {
            return;
        }

        for (OAuth2AccessToken token : tokens) {

            // Remove refresh token first
            if (token.getRefreshToken() != null) {
                tokenStore.removeRefreshToken(token.getRefreshToken());
            }

            // Remove access token
            tokenStore.removeAccessToken(token);
        }

        // Update logout session once (not inside loop)
        userRepository.updateUserLogoutSession(user.getUuid(), true);
    }

    /**
     * this api will validate whether user roles exist in Database or not
     *
     * @param user
     */
    private void validateUserRoles(User user) {
        if (user.getRoles() == null || user.getRoles() != null && user.getRoles().isEmpty()) {
            throw new AtleastOneRoleCodeException();
        }
    }

    /**
     * this api will update user profile data except these fields userName ,
     * mobileNumber type , password ,pwsExpiryData, roles
     *
     * @param user
     * @return
     */
    public User partialUpdate(User user, RequestInfo requestInfo) {
        /* encrypt here */
        user = encryptionDecryptionUtil.encryptObject(user, "User", User.class);

        User existingUser = getUserByUuid(user.getUuid());
        validateProfileUpdateIsDoneByTheSameLoggedInUser(user);
        user.nullifySensitiveFields();
        validatePassword(user.getPassword());
        userRepository.update(user, existingUser, requestInfo.getUserInfo().getId(),
                requestInfo.getUserInfo().getUuid());
        User updatedUser = getUserByUuid(user.getUuid());

        updatedUser = encryptionDecryptionUtil.decryptObject(updatedUser, "User", User.class, requestInfo);

        setFileStoreUrlsByFileStoreIds(Collections.singletonList(updatedUser));
        String oldEmail = existingUser.getEmailId();
        String newEmail = updatedUser.getEmailId();
        if ((oldEmail != null && !oldEmail.isEmpty()) && newEmail != null && !(newEmail.equalsIgnoreCase(oldEmail))) {
            // Sending sms and email to old email to notify that email has been changed
            // notificationUtil.sendEmail(requestInfo, existingUser, updatedUser);
        }
        return updatedUser;
    }

    /**
     * This api will update the password for logged-in user
     *
     * @param updatePasswordRequest
     */
    public void updatePasswordForLoggedInUser(LoggedInUserUpdatePasswordRequest updatePasswordRequest) {
        updatePasswordRequest.validate();
        final User user = getUniqueUser(updatePasswordRequest.getUserName(), updatePasswordRequest.getTenantId(),
                updatePasswordRequest.getType());

        if (user.getType().toString().equals(UserType.CITIZEN.toString()) && isCitizenLoginOtpBased)
            throw new InvalidUpdatePasswordRequestException();
        if (user.getType().toString().equals(UserType.EMPLOYEE.toString()) && isEmployeeLoginOtpBased)
            throw new InvalidUpdatePasswordRequestException();

        validateExistingPassword(user, updatePasswordRequest.getExistingPassword());
        validatePassword(updatePasswordRequest.getNewPassword());
        user.updatePassword(encryptPwd(updatePasswordRequest.getNewPassword()));
        userRepository.update(user, user, user.getId(), user.getUuid());
    }

    /**
     * This Api will update the password for non logged-in user
     *
     * @param request
     */
    public void updatePasswordForNonLoggedInUser(NonLoggedInUserUpdatePasswordRequest request,
            RequestInfo requestInfo) {
        request.validate();
        // validateOtp(request.getOtpValidationRequest());
        User user = getUniqueUser(request.getUserName(), request.getTenantId(), request.getType());
        if (user.getType().toString().equals(UserType.CITIZEN.toString()) && isCitizenLoginOtpBased) {
            log.info("CITIZEN forgot password flow is disabled");
            throw new InvalidUpdatePasswordRequestException();
        }
//        if (user.getType().toString().equals(UserType.EMPLOYEE.toString()) && isEmployeeLoginOtpBased) {
//            log.info("EMPLOYEE forgot password flow is disabled");
//            throw new InvalidUpdatePasswordRequestException();
//        }
        /* decrypt here */
        /*
         * the reason for decryption here is the otp service requires decrypted username
         */
        user = encryptionDecryptionUtil.decryptObject(user, "UserListSelf", User.class, requestInfo);
        user.setOtpReference(request.getOtpReference());
        validateOtp(user);
        validatePassword(request.getNewPassword());
        user.updatePassword(encryptPwd(request.getNewPassword()));
        /* encrypt here */
        /* encrypted value is stored in DB */
        user = encryptionDecryptionUtil.encryptObject(user, "User", User.class);
        userRepository.update(user, user, user.getId() != null ? user.getId() : 0,
                user.getUuid() != null ? user.getUuid() : "NA");
    }

    /**
     * Deactivate failed login attempts for provided user
     *
     * @param user whose failed login attempts are to be reset
     */
    public void resetFailedLoginAttempts(User user) {
        if (user.getUuid() != null)
            userRepository.resetFailedLoginAttemptsForUser(user.getUuid());
    }

    /**
     * Checks if user is eligible for unlock
     * returns true,
     * - If configured cool down period has passed since last lock
     * else false
     *
     * @param user to be checked for eligibility for unlock
     * @return if unlock able
     */
    public boolean isAccountUnlockAble(User user) {
        if (user != null && Boolean.TRUE.equals(user.getAccountLocked())) {
            if (user.getAccountLockedDate() == null) {
                log.warn("User '{}' account is marked locked but accountLockedDate is null. Treating as eligible for unlock.", user.getUserName());
                return true;
            }
            long coolDownMillis = TimeUnit.MINUTES.toMillis(accountUnlockCoolDownPeriod != null ? accountUnlockCoolDownPeriod : 60L);
            boolean unlockAble = System.currentTimeMillis() - user.getAccountLockedDate() > coolDownMillis;

            log.info("Account eligible for unlock - " + unlockAble);
            log.info("Current time {}, last lock time {} , cool down period {} ", System.currentTimeMillis(),
                    user.getAccountLockedDate(), coolDownMillis);
            return unlockAble;
        } else {
            return true;
        }
    }

    /**
     * Builds a detailed OAuth2Exception when an account is locked, including:
     * - Last locked time
     * - Expected unlock time
     * - Remaining cool-down time in minutes/seconds
     * - Configured cool down period
     *
     * @param user user whose account is locked
     * @return OAuth2Exception with detailed error message and additional attributes
     */
    public OAuth2Exception buildAccountLockedException(User user) {
        Long lockTime = user != null ? user.getAccountLockedDate() : null;
        long coolDownMins = accountUnlockCoolDownPeriod != null ? accountUnlockCoolDownPeriod : 60L;
        long coolDownMillis = TimeUnit.MINUTES.toMillis(coolDownMins);
        long now = System.currentTimeMillis();

        ZoneId istZone = ZoneId.of("Asia/Kolkata");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm:ss a z");

        String msg;
        String lockTimeStr;
        String unlockTimeStr;
        long remainingMinutes = coolDownMins;

        if (lockTime != null && lockTime > 0) {
            long unlockTimeMillis = lockTime + coolDownMillis;
            long remainingMillis = Math.max(0, unlockTimeMillis - now);
            remainingMinutes = TimeUnit.MILLISECONDS.toMinutes(remainingMillis);
            long remainingSeconds = TimeUnit.MILLISECONDS.toSeconds(remainingMillis) % 60;

            String remainingTimeStr;
            if (remainingMinutes > 0) {
                remainingTimeStr = remainingMinutes + " minute(s)";
            } else if (remainingSeconds > 0) {
                remainingTimeStr = remainingSeconds + " second(s)";
            } else {
                remainingTimeStr = "a few seconds";
            }

            lockTimeStr = Instant.ofEpochMilli(lockTime).atZone(istZone).format(formatter);
            unlockTimeStr = Instant.ofEpochMilli(unlockTimeMillis).atZone(istZone).format(formatter);

            msg = String.format(
                "Account is locked due to multiple failed login attempts. Locked at: %s. It will unlock at: %s (%s remaining).",
                lockTimeStr, unlockTimeStr, remainingTimeStr
            );
        } else {
            lockTimeStr = "N/A";
            unlockTimeStr = "later";
            msg = "Account is locked due to multiple failed login attempts. Please try again later or contact administrator.";
        }

        OAuth2Exception exception = new OAuth2Exception(msg);
        exception.addAdditionalInformation("account_locked", "true");
        if (lockTime != null && lockTime > 0) {
            exception.addAdditionalInformation("locked_at", lockTimeStr);
            exception.addAdditionalInformation("unlock_at", unlockTimeStr);
            exception.addAdditionalInformation("remaining_minutes", String.valueOf(remainingMinutes));
        }
        return exception;
    }

    /**
     * Perform actions where a user login fails
     * - Fetch existing failed login attempts within configured time
     * period{@link UserService#maxInvalidLoginAttemptsPeriod}
     * - If failed login attempts exceeds configured
     * {@link UserService#maxInvalidLoginAttempts}
     * - then lock account
     * - Add failed login attempt entry to repository
     *
     * @param user      user whose failed login attempt to be handled
     * @param ipAddress IP address of remote
     */
    public long handleFailedLogin(User user, String ipAddress, RequestInfo requestInfo) {
    	int attempCount = 0;
        if (!Objects.isNull(user.getUuid())) {
            if (isEmpty(ipAddress) || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = IpAddressUtil.getClientIp();
            } else {
                ipAddress = IpAddressUtil.sanitizeIp(ipAddress);
            }
            List<FailedLoginAttempt> failedLoginAttempts = userRepository.fetchFailedAttemptsByUserAndTime(
                    user.getUuid(),
                    System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(maxInvalidLoginAttemptsPeriod));
            attempCount = failedLoginAttempts.size() + 1;
            long attemptsLeft = Math.max(0, maxInvalidLoginAttempts - attempCount);

            if (failedLoginAttempts.size() + 1 >= maxInvalidLoginAttempts) {
                User userToBeUpdated = user.toBuilder()
                        .accountLocked(true)
                        .password(null)
                        .accountLockedDate(System.currentTimeMillis())
                        .build();

                user = updateWithoutOtpValidation(userToBeUpdated, requestInfo);
                removeTokensByUser(user);
                log.warn(
                        "Account locked for user '{}' (uuid: {}) for {} minutes. Exceeded max allowed attempts of {} within {} minutes",
                        user.getUserName(), user.getUuid(), accountUnlockCoolDownPeriod, maxInvalidLoginAttempts,
                        maxInvalidLoginAttemptsPeriod);
                throw buildAccountLockedException(userToBeUpdated);
            }

            log.warn("Failed login attempt {}/{} for user '{}', type: {}, tenant: {}. {} attempt(s) remaining.",
                    attempCount, maxInvalidLoginAttempts, user.getUserName(), user.getType(), user.getTenantId(), attemptsLeft);

            userRepository.insertFailedLoginAttempt(new FailedLoginAttempt(user.getUuid(), ipAddress,
                    System.currentTimeMillis(), true));
        }
        return maxInvalidLoginAttempts-attempCount;
    }

    /**
     * Authenticates an employee based on username and password without generating an auth token.
     *
     * @param userName
     * @param password
     * @param tenantId
     * @param requestInfo
     * @return
     */
    public User authenticateEmployee(String userName, String password, String tenantId, RequestInfo requestInfo) {
        User user = getUniqueUser(userName, tenantId, UserType.EMPLOYEE);

        if (user == null) {
            throw new UserNotFoundException(null);
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            log.error("Login failed: User '{}' in tenant '{}' has no roles assigned in the database.", userName, tenantId);
            OAuth2Exception exception = new OAuth2Exception(
                    "No roles assigned for user: " + userName + ". Your account does not have access permissions configured. Please contact your system administrator.");
            exception.addAdditionalInformation("roles_missing", "true");
            exception.addAdditionalInformation("user_name", userName);
            throw exception;
        }

        if (user.getAccountLocked() != null && user.getAccountLocked()) {
            if (isAccountUnlockAble(user)) {
                resetFailedLoginAttempts(user);
                user = user.toBuilder().accountLocked(false).build();
            } else {
                throw buildAccountLockedException(user);
            }
        }

        try {
            validateExistingPassword(user, password);
        } catch (PasswordMismatchException e) {
            handleFailedLogin(user, null, requestInfo);
            throw e;
        }

        resetFailedLoginAttempts(user);

        // Decrypt user details before returning
        return encryptionDecryptionUtil.decryptObject(user, "User", User.class, requestInfo);
    }

    /**
     * This api will validate existing password and current password matching or
     * not
     *
     * @param user
     * @param existingRawPassword
     */
    private void validateExistingPassword(User user, String existingRawPassword) {
        if (!passwordEncoder.matches(existingRawPassword, user.getPassword())) {
            throw new PasswordMismatchException("Invalid username or password");
        }
    }

    /**
     * this api will update, updating the profile for same logged-in user or
     * not
     *
     * @param user
     */
    private void validateProfileUpdateIsDoneByTheSameLoggedInUser(User user) {
        if (user.isLoggedInUserDifferentFromUpdatedUser()) {
            throw new UserProfileUpdateDeniedException();
        }
    }

    String encryptPwd(String pwd) {
        if (!isNull(pwd))
            return passwordEncoder.encode(pwd);
        else
            return null;
    }

    /**
     * This api will persist the user
     *
     * @param user
     * @return
     */
    private User persistNewUser(User user) {
        return userRepository.create(user);
    }

    /**
     * This api will fetch the fileStoreUrl By fileStoreId
     *
     * @param userList
     */
    private void setFileStoreUrlsByFileStoreIds(List<User> userList) {
        List<String> fileStoreIds = userList.parallelStream().filter(p -> p.getPhoto() != null).map(User::getPhoto)
                .collect(Collectors.toList());
        if (!isEmpty(fileStoreIds)) {
            Map<String, String> fileStoreUrlList = null;
            try {
                fileStoreUrlList = fileRepository.getUrlByFileStoreId(userList.get(0).getTenantId(), fileStoreIds);
            } catch (Exception e) {
                // TODO Auto-generated catch block

                log.error("Error while fetching fileStore url list: " + e.getMessage());
            }

            if (fileStoreUrlList != null && !fileStoreUrlList.isEmpty()) {
                for (User user : userList) {
                    user.setPhoto(fileStoreUrlList.get(user.getPhoto()));
                }
            }
        }
    }

    public void validatePassword(String password) {
        Map<String, String> errorMap = new HashMap<>();
        if (!StringUtils.isEmpty(password)) {
            if (password.length() < pwdMinLength || password.length() > pwdMaxLength)
                errorMap.put("INVALID_PWD_LENGTH",
                        "Password must be of minimum: " + pwdMinLength + " and maximum: " + pwdMaxLength
                                + " characters.");
            Pattern p = Pattern.compile(pwdRegex);
            Matcher m = p.matcher(password);
            if (!m.find()) {
                errorMap.put("INVALID_PWD_PATTERN",
                        "Password MUST HAVE: Atleast one digit, one upper case, one lower case, one special character (@#$%) and MUST NOT contain any spaces");
            }
        }
        if (!CollectionUtils.isEmpty(errorMap.keySet())) {
            throw new CustomException(errorMap);
        }
    }

    public Long getMaxInvalidLoginAttempts() {
        return maxInvalidLoginAttempts != null ? maxInvalidLoginAttempts : 7L;
    }

    /**
     * Unlocks a locked/blocked user account and resets failed login attempts.
     *
     * @param unlockRequest Request containing user identifiers (uuid, id, or userName + tenantId)
     * @return Decrypted unlocked user details
     */
    public User unlockUser(UserUnlockRequest unlockRequest) {
        if (unlockRequest == null) {
            throw new CustomException("INVALID_UNLOCK_REQUEST", "Unlock request cannot be null");
        }

        validateUnlockAuthorization(unlockRequest.getRequestInfo());

        User user = null;
        if (!isEmpty(unlockRequest.getUuid())) {
            user = getUserByUuid(unlockRequest.getUuid());
        } else if (unlockRequest.getId() != null) {
            UserSearchCriteria criteria = UserSearchCriteria.builder()
                    .id(Collections.singletonList(unlockRequest.getId()))
                    .build();
            List<User> users = userRepository.findAll(criteria);
            if (users.isEmpty()) {
                throw new UserNotFoundException(criteria);
            }
            user = users.get(0);
        } else if (!isEmpty(unlockRequest.getUserName()) && !isEmpty(unlockRequest.getTenantId())) {
            if (unlockRequest.getUserType() != null) {
                user = getUniqueUser(unlockRequest.getUserName(), unlockRequest.getTenantId(), unlockRequest.getUserType());
            } else {
                try {
                    user = getUniqueUser(unlockRequest.getUserName(), unlockRequest.getTenantId(), UserType.EMPLOYEE);
                } catch (UserNotFoundException e) {
                    user = getUniqueUser(unlockRequest.getUserName(), unlockRequest.getTenantId(), UserType.CITIZEN);
                }
            }
        } else {
            throw new CustomException("INVALID_UNLOCK_REQUEST", "Either uuid, id, or (userName and tenantId) must be provided to unlock a user");
        }

        RequestInfo requestInfo = unlockRequest.getRequestInfo() != null ? unlockRequest.getRequestInfo() : new RequestInfo();
        Long modifiedBy = (requestInfo.getUserInfo() != null && requestInfo.getUserInfo().getId() != null)
                ? requestInfo.getUserInfo().getId()
                : 0L;

        userRepository.unlockUser(user.getUuid(), modifiedBy);

        log.info("User '{}' (uuid: {}, tenant: {}) successfully unlocked by user id: {}",
                user.getUserName(), user.getUuid(), user.getTenantId(), modifiedBy);

        User updatedUserFromDb = getUserByUuid(user.getUuid());
        return encryptionDecryptionUtil.decryptObject(updatedUserFromDb, "User", User.class, requestInfo);
    }

    private void validateUnlockAuthorization(RequestInfo requestInfo) {
        if (requestInfo == null || requestInfo.getUserInfo() == null) {
            throw new CustomException("ACCESS_DENIED", "User info is mandatory to unblock user. Caller must contain SYSTEM or SUPERUSER.");
        }

        org.egov.common.contract.request.User userInfo = requestInfo.getUserInfo();
        boolean isAuthorized = false;

        // Check user type
        if (!isEmpty(userInfo.getType()) &&
                ("SYSTEM".equalsIgnoreCase(userInfo.getType().trim()) || "SUPERUSER".equalsIgnoreCase(userInfo.getType().trim()))) {
            isAuthorized = true;
        }

        // Check roles
        if (!isAuthorized && !CollectionUtils.isEmpty(userInfo.getRoles())) {
            for (org.egov.common.contract.request.Role role : userInfo.getRoles()) {
                if (role != null) {
                    if (!isEmpty(role.getCode()) &&
                            ("SYSTEM".equalsIgnoreCase(role.getCode().trim()) || "SUPERUSER".equalsIgnoreCase(role.getCode().trim()))) {
                        isAuthorized = true;
                        break;
                    }
                    if (!isEmpty(role.getName()) &&
                            ("SYSTEM".equalsIgnoreCase(role.getName().trim()) || "SUPERUSER".equalsIgnoreCase(role.getName().trim()))) {
                        isAuthorized = true;
                        break;
                    }
                }
            }
        }

        if (!isAuthorized) {
            log.warn("Unauthorized attempt to unlock user by caller id: {}, type: {}", userInfo.getId(), userInfo.getType());
            throw new CustomException("ACCESS_DENIED", "User info must contain SYSTEM or SUPERUSER to unblock user.");
        }
    }

}
