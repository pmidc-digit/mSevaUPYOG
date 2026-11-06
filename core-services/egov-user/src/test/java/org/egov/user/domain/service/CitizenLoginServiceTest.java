package org.egov.user.domain.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.user.domain.model.User;
import org.egov.user.domain.model.UserSearchCriteria;
import org.egov.user.domain.model.enums.Gender;
import org.egov.user.domain.model.enums.GuardianRelation;
import org.egov.user.domain.model.enums.UserType;
import org.egov.user.domain.service.utils.EncryptionDecryptionUtil;
import org.egov.user.persistence.dto.CitizenLoginSession;
import org.egov.user.persistence.repository.OtpRepository;
import org.egov.user.persistence.repository.UserRepository;
import org.egov.user.persistence.repository.VerificationTokenRepository;
import org.egov.user.web.contract.CitizenLoginRequest;
import org.egov.user.web.contract.CitizenLoginResponse;
import org.egov.user.web.contract.OtpValidateRequest;
import org.egov.user.web.contract.factory.ResponseInfoFactory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.*;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CitizenLoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private UserService userService;

    @Mock
    private VerificationTokenRepository verificationTokenRepository;

    @Mock
    private EncryptionDecryptionUtil encryptionDecryptionUtil;

    @Mock
    private ResponseInfoFactory responseInfoFactory;

    private CitizenLoginService citizenLoginService;

    @Before
    public void setUp() {
        citizenLoginService = new CitizenLoginService(
                userRepository,
                otpRepository,
                userService,
                verificationTokenRepository,
                encryptionDecryptionUtil,
                responseInfoFactory
        );
        when(userService.getStateLevelTenantForCitizen(anyString(), any(UserType.class))).thenReturn("pb");
    }

    @Test
    public void test_should_return_auth_token_directly_when_only_one_profile_exists() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("pb.testing")
                .requestInfo(new RequestInfo())
                .build();

        User user = User.builder()
                .uuid("uuid-1")
                .userName("9876543210")
                .name("Citizen One")
                .mobileNumber("9876543210")
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(true);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(user));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(user));

        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "test-token-123");
        tokenResponse.put("token_type", "bearer");
        tokenResponse.put("expires_in", 36000);
        tokenResponse.put("UserRequest", Collections.singletonMap("name", "Citizen One"));
        when(userService.getAccess(eq(user), anyString())).thenReturn(tokenResponse);

        CitizenLoginResponse response = citizenLoginService.login(request);

        assertNotNull(response);
        assertFalse(response.isMultipleProfiles());
        assertEquals("test-token-123", response.getAccessToken());
        assertEquals("bearer", response.getTokenType());
        assertEquals(Long.valueOf(36000), response.getExpiresIn());
        assertNotNull(response.getUserRequest());
    }

    @Test
    public void test_should_return_profiles_and_verification_token_when_multiple_profiles_exist() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("pb.testing")
                .requestInfo(new RequestInfo())
                .build();

        User user1 = User.builder()
                .uuid("uuid-1")
                .userName("9876543210")
                .name("Citizen One")
                .mobileNumber("9876543210")
                .gender(Gender.MALE)
                .guardian("Guardian One")
                .guardianRelation(GuardianRelation.Father)
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        User user2 = User.builder()
                .uuid("uuid-2")
                .userName("uuid-2")
                .name("Citizen Two")
                .mobileNumber("9876543210")
                .gender(Gender.FEMALE)
                .guardian("Guardian Two")
                .guardianRelation(GuardianRelation.Husband)
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        List<User> userList = Arrays.asList(user1, user2);

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(true);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(userList);
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(userList);

        CitizenLoginResponse response = citizenLoginService.login(request);

        assertNotNull(response);
        assertTrue(response.isMultipleProfiles());
        assertNotNull(response.getVerificationToken());
        assertEquals(2, response.getProfiles().size());
        assertEquals("Citizen One", response.getProfiles().get(0).getName());
        assertEquals("Citizen Two", response.getProfiles().get(1).getName());

        verify(verificationTokenRepository, times(1)).saveSession(anyString(), any(CitizenLoginSession.class));
        verify(userService, never()).getAccess(any(User.class), anyString());
    }

    @Test
    public void test_should_generate_token_for_selected_profile_with_valid_verification_token() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("verify-token-xyz")
                .userUuid("uuid-2")
                .tenantId("pb.testing")
                .requestInfo(new RequestInfo())
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Arrays.asList("uuid-1", "uuid-2"))
                .createdAt(System.currentTimeMillis())
                .build();

        User selectedUser = User.builder()
                .uuid("uuid-2")
                .userName("uuid-2")
                .name("Citizen Two")
                .mobileNumber("9876543210")
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        when(verificationTokenRepository.getSession("verify-token-xyz")).thenReturn(session);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(selectedUser));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(selectedUser));

        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "token-for-user-2");
        tokenResponse.put("token_type", "bearer");
        tokenResponse.put("expires_in", 36000);
        when(userService.getAccess(eq(selectedUser), anyString())).thenReturn(tokenResponse);

        CitizenLoginResponse response = citizenLoginService.login(request);

        assertNotNull(response);
        assertFalse(response.isMultipleProfiles());
        assertEquals("token-for-user-2", response.getAccessToken());

        // Verifies verificationToken is deleted after single use
        verify(verificationTokenRepository, times(1)).deleteSession("verify-token-xyz");
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_request_is_null() {
        citizenLoginService.login(null);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_mobile_is_null() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber(null)
                .otp("123456")
                .tenantId("pb")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_mobile_is_blank() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("   ")
                .otp("123456")
                .tenantId("pb")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_mobile_is_not_10_digits() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("12345")
                .otp("123456")
                .tenantId("pb")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_otp_is_null() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp(null)
                .tenantId("pb")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_otp_is_blank() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("   ")
                .tenantId("pb")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_tenant_is_null() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId(null)
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_tenant_is_blank() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("   ")
                .build();
        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_verification_token_is_expired_or_invalid() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("expired-token")
                .userUuid("uuid-1")
                .tenantId("pb.testing")
                .build();

        when(verificationTokenRepository.getSession("expired-token")).thenReturn(null);

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_user_uuid_is_blank_in_profile_selection() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("   ")
                .tenantId("pb.testing")
                .build();

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_tenant_is_blank_in_profile_selection() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-1")
                .tenantId("   ")
                .build();

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_selected_uuid_is_not_in_session() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("unauthorized-uuid-999")
                .tenantId("pb.testing")
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Collections.singletonList("uuid-1"))
                .createdAt(System.currentTimeMillis())
                .build();

        when(verificationTokenRepository.getSession("valid-token")).thenReturn(session);

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_otp_is_invalid() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("000000")
                .tenantId("pb.testing")
                .build();

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(false);

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_no_user_found_for_mobile() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("pb.testing")
                .build();

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(true);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.emptyList());
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.emptyList());

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_token_response_is_null() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("pb.testing")
                .build();

        User user = User.builder()
                .uuid("uuid-1")
                .userName("9876543210")
                .name("Citizen One")
                .mobileNumber("9876543210")
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(true);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(user));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(user));
        when(userService.getAccess(eq(user), anyString())).thenReturn(null);

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_account_is_locked_in_profile_selection() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-1")
                .tenantId("pb.testing")
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Collections.singletonList("uuid-1"))
                .createdAt(System.currentTimeMillis())
                .build();

        User lockedUser = User.builder()
                .uuid("uuid-1")
                .userName("9876543210")
                .name("Locked Citizen")
                .mobileNumber("9876543210")
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .accountLocked(true)
                .build();

        when(verificationTokenRepository.getSession("valid-token")).thenReturn(session);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(lockedUser));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(lockedUser));

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_user_type_is_employee_in_profile_selection() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-emp")
                .tenantId("pb.testing")
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Collections.singletonList("uuid-emp"))
                .createdAt(System.currentTimeMillis())
                .build();

        User employeeUser = User.builder()
                .uuid("uuid-emp")
                .userName("emp-admin")
                .name("Employee Admin")
                .mobileNumber("9876543210")
                .type(UserType.EMPLOYEE)
                .tenantId("pb")
                .build();

        when(verificationTokenRepository.getSession("valid-token")).thenReturn(session);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(employeeUser));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(employeeUser));

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_tenant_mismatches_session() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-1")
                .tenantId("ch.chandigarh")
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Collections.singletonList("uuid-1"))
                .createdAt(System.currentTimeMillis())
                .build();

        when(verificationTokenRepository.getSession("valid-token")).thenReturn(session);
        when(userService.getStateLevelTenantForCitizen(eq("ch.chandigarh"), any(UserType.class))).thenReturn("ch");

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_mobile_in_request_mismatches_session() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-1")
                .tenantId("pb.testing")
                .mobileNumber("9111111111")
                .build();

        CitizenLoginSession session = CitizenLoginSession.builder()
                .mobileNumber("9876543210")
                .tenantId("pb")
                .allowedUuids(Collections.singletonList("uuid-1"))
                .createdAt(System.currentTimeMillis())
                .build();

        when(verificationTokenRepository.getSession("valid-token")).thenReturn(session);

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_malicious_characters_in_user_uuid() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .verificationToken("valid-token")
                .userUuid("uuid-1' OR '1'='1")
                .tenantId("pb.testing")
                .build();

        citizenLoginService.login(request);
    }

    @Test(expected = CustomException.class)
    public void test_should_throw_exception_when_malicious_characters_in_otp() {
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("12345; DROP TABLE users;--")
                .tenantId("pb.testing")
                .build();

        citizenLoginService.login(request);
    }

    @Test
    public void test_should_handle_null_ts_in_request_info_gracefully() {
        RequestInfo reqInfo = new RequestInfo();
        reqInfo.setTs(null);
        CitizenLoginRequest request = CitizenLoginRequest.builder()
                .mobileNumber("9876543210")
                .otp("123456")
                .tenantId("pb.testing")
                .requestInfo(reqInfo)
                .build();

        User user = User.builder()
                .uuid("uuid-1")
                .userName("9876543210")
                .name("Citizen One")
                .mobileNumber("9876543210")
                .type(UserType.CITIZEN)
                .tenantId("pb")
                .build();

        when(otpRepository.validateOtp(any(OtpValidateRequest.class))).thenReturn(true);
        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(user));
        when(encryptionDecryptionUtil.decryptObject(any(), any(), eq(User.class), any())).thenReturn(Collections.singletonList(user));

        Map<String, Object> tokenResponse = new HashMap<>();
        tokenResponse.put("access_token", "test-token-123");
        tokenResponse.put("token_type", "bearer");
        tokenResponse.put("expires_in", 36000);
        when(userService.getAccess(eq(user), anyString())).thenReturn(tokenResponse);

        CitizenLoginResponse response = citizenLoginService.login(request);
        assertNotNull(response);
        assertNotNull(response.getResponseInfo());
        assertNotNull(response.getResponseInfo().getTs());
    }
}
