package org.egov.user.domain.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.user.domain.model.Role;
import org.egov.user.domain.model.User;
import org.egov.user.domain.model.UserSearchCriteria;
import org.egov.user.domain.model.enums.Gender;
import org.egov.user.domain.model.enums.GuardianRelation;
import org.egov.user.domain.model.enums.UserType;
import org.egov.user.domain.service.utils.EncryptionDecryptionUtil;
import org.egov.user.persistence.repository.FileStoreRepository;
import org.egov.user.persistence.repository.OtpRepository;
import org.egov.user.persistence.repository.UserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.provider.token.TokenStore;

import java.util.*;

import static org.junit.Assert.*;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CitizenMultiProfileUpdateTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private FileStoreRepository fileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EncryptionDecryptionUtil encryptionDecryptionUtil;

    @Mock
    private TokenStore tokenStore;

    private UserService userService;

    private RequestInfo requestInfo;

    @Before
    public void setUp() {
        userService = new UserService(
                userRepository,
                otpRepository,
                fileRepository,
                passwordEncoder,
                encryptionDecryptionUtil,
                tokenStore,
                90,
                true,
                false,
                ".*",
                32,
                4
        );

        requestInfo = RequestInfo.builder()
                .userInfo(org.egov.common.contract.request.User.builder().id(100L).uuid("operator-uuid").type("EMPLOYEE").build())
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encoded-pwd");
    }

    private User buildCitizen(String uuid, String userName, String name, String guardian, String mobile) {
        return User.builder()
                .id(1L)
                .uuid(uuid)
                .userName(userName)
                .name(name)
                .guardian(guardian)
                .guardianRelation(GuardianRelation.Father)
                .gender(Gender.MALE)
                .mobileNumber(mobile)
                .tenantId("pb.amritsar")
                .type(UserType.CITIZEN)
                .active(true)
                .accountLocked(false)
                .roles(Collections.singleton(Role.builder().code("CITIZEN").build()))
                .build();
    }

    @Test
    public void test_updateWithoutOtpValidation_same_citizen_proceeds_normal_update() {
        // Arrange: Father's profile exists
        User fatherDb = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(fatherDb));

        when(encryptionDecryptionUtil.decryptObject(eq(fatherDb), eq("User"), eq(User.class), any()))
                .thenReturn(fatherDb);
        when(encryptionDecryptionUtil.encryptObject(any(User.class), eq("User"), eq(User.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);

        // Incoming update for Ramesh Kumar with new address/email
        User incomingUpdate = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");
        incomingUpdate.setEmailId("ramesh@newemail.com");

        User updatedDbResult = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");
        updatedDbResult.setEmailId("ramesh@newemail.com");

        when(encryptionDecryptionUtil.decryptObject(any(User.class), eq("User"), eq(User.class), any()))
                .thenReturn(updatedDbResult);

        // Act
        User result = userService.updateWithoutOtpValidation(incomingUpdate, requestInfo);

        // Assert: Standard update was performed on Father's UUID
        verify(userRepository, times(1)).update(any(User.class), eq(fatherDb), eq(100L), eq("operator-uuid"));
        assertEquals("ramesh@newemail.com", result.getEmailId());
    }

    @Test
    public void test_updateWithoutOtpValidation_different_citizen_finds_existing_profile() {
        // Arrange: Service passed Father's UUID, but applicant is Son (Amit Kumar)
        User fatherDb = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");
        User sonDb = buildCitizen("uuid-son", "uuid-son-username", "Amit Kumar", "Ramesh Kumar", "9876543210");

        when(userRepository.findAll(any(UserSearchCriteria.class))).thenAnswer(inv -> {
            UserSearchCriteria criteria = (UserSearchCriteria) inv.getArguments()[0];
            if (criteria.getUuid() != null && criteria.getUuid().contains("uuid-father")) {
                return Collections.singletonList(fatherDb);
            }
            if (criteria.getUuid() != null && criteria.getUuid().contains("uuid-son")) {
                return Collections.singletonList(sonDb);
            }
            if (criteria.getMobileNumber() != null && "Amit Kumar".equals(criteria.getName())) {
                return Collections.singletonList(sonDb);
            }
            return Collections.emptyList();
        });

        when(encryptionDecryptionUtil.decryptObject(eq(fatherDb), eq("User"), eq(User.class), any()))
                .thenReturn(fatherDb);

        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(encryptionDecryptionUtil.decryptObject(eq(Collections.singletonList(sonDb)), eq("UserListSelf"), eq(User.class), any()))
                .thenReturn(Collections.singletonList(sonDb));

        when(encryptionDecryptionUtil.encryptObject(any(User.class), eq("User"), eq(User.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(encryptionDecryptionUtil.decryptObject(eq(sonDb), eq("User"), eq(User.class), any()))
                .thenReturn(sonDb);

        // Incoming update has Father's UUID, but Amit Kumar's details
        User incomingUpdate = buildCitizen("uuid-father", "9876543210", "Amit Kumar", "Ramesh Kumar", "9876543210");

        // Act
        User result = userService.updateWithoutOtpValidation(incomingUpdate, requestInfo);

        // Assert: Father was NOT updated! Son was updated!
        verify(userRepository, never()).update(any(User.class), eq(fatherDb), anyLong(), anyString());
        verify(userRepository, times(1)).update(any(User.class), eq(sonDb), anyLong(), anyString());
        assertEquals("uuid-son", result.getUuid());
    }

    @Test
    public void test_updateWithoutOtpValidation_different_citizen_creates_new_profile_when_no_match_found() {
        // Arrange: Service passed Father's UUID, but applicant is Daughter (Pooja Sharma - new profile)
        User fatherDb = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");

        when(userRepository.findAll(any(UserSearchCriteria.class))).thenAnswer(inv -> {
            UserSearchCriteria criteria = (UserSearchCriteria) inv.getArguments()[0];
            if (criteria.getUuid() != null && criteria.getUuid().contains("uuid-father")) {
                return Collections.singletonList(fatherDb);
            }
            return Collections.emptyList();
        });

        when(encryptionDecryptionUtil.decryptObject(eq(fatherDb), eq("User"), eq(User.class), any()))
                .thenReturn(fatherDb);

        when(encryptionDecryptionUtil.encryptObject(any(UserSearchCriteria.class), eq("UserSearchCriteria"), eq(UserSearchCriteria.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);

        // createUser mocks
        User createdUser = buildCitizen("uuid-pooja", "random-uuid-user", "Pooja Sharma", "Ramesh Kumar", "9876543210");
        when(encryptionDecryptionUtil.encryptObject(any(User.class), eq("UserSelf"), eq(User.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(userRepository.isUserPresent(anyString(), anyString(), any(UserType.class))).thenReturn(false);
        when(userRepository.create(any(User.class))).thenReturn(createdUser);
        when(encryptionDecryptionUtil.decryptObject(eq(createdUser), isNull(String.class), eq(User.class), any()))
                .thenReturn(createdUser);

        // Incoming update has Father's UUID, but Pooja Sharma's details
        User incomingUpdate = buildCitizen("uuid-father", "9876543210", "Pooja Sharma", "Ramesh Kumar", "9876543210");

        // Act
        User result = userService.updateWithoutOtpValidation(incomingUpdate, requestInfo);

        // Assert: Father was NEVER touched! New profile for Pooja was created!
        verify(userRepository, never()).update(any(User.class), eq(fatherDb), anyLong(), anyString());
        verify(userRepository, times(1)).create(any(User.class));
        assertNotNull(result);
        assertEquals("Pooja Sharma", result.getName());
    }

    @Test
    public void test_updateWithoutOtpValidation_adopts_existing_name_and_guardian_when_omitted() {
        // Arrange: Father's profile exists
        User fatherDb = buildCitizen("uuid-father", "9876543210", "Ramesh Kumar", "Suresh Kumar", "9876543210");
        when(userRepository.findAll(any(UserSearchCriteria.class))).thenReturn(Collections.singletonList(fatherDb));
        when(encryptionDecryptionUtil.decryptObject(eq(fatherDb), eq("User"), eq(User.class), any()))
                .thenReturn(fatherDb);
        when(encryptionDecryptionUtil.encryptObject(any(User.class), eq("User"), eq(User.class)))
                .thenAnswer(inv -> inv.getArguments()[0]);
        when(encryptionDecryptionUtil.decryptObject(any(User.class), eq("User"), eq(User.class), any()))
                .thenReturn(fatherDb);

        // Incoming update has blank name and blank guardian (partial update of address/email)
        User incomingUpdate = buildCitizen("uuid-father", "9876543210", null, null, "9876543210");

        // Act
        User result = userService.updateWithoutOtpValidation(incomingUpdate, requestInfo);

        // Assert: Adopts existing name & guardian, proceeds with standard update
        verify(userRepository, times(1)).update(any(User.class), eq(fatherDb), anyLong(), anyString());
        assertEquals("Ramesh Kumar", incomingUpdate.getName());
        assertEquals("Suresh Kumar", incomingUpdate.getGuardian());
    }
}
