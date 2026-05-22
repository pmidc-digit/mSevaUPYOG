package org.egov.persistence.repository;

import org.egov.domain.model.User;
import org.egov.persistence.contract.UserSearchRequest;
import org.egov.persistence.contract.UserSearchResponseContent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @InjectMocks
    private UserRepository userRepository;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(
                userRepository,
                "SEARCH_USER_URL",
                "user/_search"
        );

        ReflectionTestUtils.setField(
                userRepository,
                "HOST",
                "http://localhost:8081/"
        );
    }

    @Test
    void shouldCreateUser() {

        List<UserSearchResponseContent> list = new ArrayList<>();

        UserSearchResponseContent searchContent =
                new UserSearchResponseContent(
                        1L,
                        "test@gmail.com",
                        "123456789"
                );

        list.add(searchContent);

        Map<String, Object> map = new HashMap<>();
        map.put("user", list);

        when(restTemplate.postForObject(
                any(String.class),
                any(UserSearchRequest.class),
                eq(Map.class)
        )).thenReturn(map);

        User actualUser = userRepository.fetchUser(
                "123456789",
                "tenantId",
                "CITIZEN"
        );

        User expectedUser = new User(
                1L,
                "test@gmail.com",
                "123456789"
        );

        assertEquals(expectedUser, actualUser);
    }

    @Test
    void shouldReturnNullWhenResponseIsNull() {

        when(restTemplate.postForObject(
                any(String.class),
                any(UserSearchRequest.class),
                eq(Map.class)
        )).thenReturn(null);

        User actualUser = userRepository.fetchUser(
                "123456789",
                "tenantId",
                "CITIZEN"
        );

        assertNull(actualUser);
    }

    @Test
    void shouldReturnNullWhenUserIsNotFound() {

        Map<String, Object> map = new HashMap<>();

        when(restTemplate.postForObject(
                any(String.class),
                any(UserSearchRequest.class),
                eq(Map.class)
        )).thenReturn(map);

        User actualUser = userRepository.fetchUser(
                "123456789",
                "tenantId",
                "CITIZEN"
        );

        assertNull(actualUser);
    }

    @Test
    void shouldNotMatchExpectedUser() {

        List<UserSearchResponseContent> list = new ArrayList<>();

        UserSearchResponseContent searchContent =
                new UserSearchResponseContent(
                        1L,
                        "test@gmail.com",
                        "123456789"
                );

        list.add(searchContent);

        Map<String, Object> map = new HashMap<>();
        map.put("user", list);

        when(restTemplate.postForObject(
                any(String.class),
                any(UserSearchRequest.class),
                eq(Map.class)
        )).thenReturn(map);

        User actualUser = userRepository.fetchUser(
                "123456789",
                "tenantId",
                "CITIZEN"
        );

        User expectedUser = new User(
                2L,
                "test123@gmail.com",
                "123456789"
        );

        assertNotEquals(expectedUser, actualUser);
    }
}