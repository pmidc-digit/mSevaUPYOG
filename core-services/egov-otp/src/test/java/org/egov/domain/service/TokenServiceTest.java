package org.egov.domain.service;

import org.egov.domain.exception.TokenValidationFailureException;
import org.egov.domain.model.Token;
import org.egov.domain.model.TokenRequest;
import org.egov.domain.model.TokenSearchCriteria;
import org.egov.domain.model.Tokens;
import org.egov.domain.model.ValidateRequest;
import org.egov.persistence.repository.TokenRepository;
//import org.egov.web.util.LocalDateTimeFactory;
import org.egov.web.util.OtpConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TokenServiceTest {

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private LocalDateTimeFactory localDateTimeFactory;

    @InjectMocks
    private TokenService tokenService;

    private LocalDateTime now;

    @BeforeEach
    void setup() {
        now = LocalDateTime.now(ZoneId.of("UTC"));

        lenient().when(localDateTimeFactory.now()).thenReturn(now);

        tokenService = new TokenService(
                tokenRepository,
                new BCryptPasswordEncoder(),
                new OtpConfiguration(90, 6, true)
        );
    }

    @Test
    void test_should_save_new_token_with_given_identity_and_tenant() {

        Token savedToken = Token.builder().build();
        TokenRequest tokenRequest = mock(TokenRequest.class);

        when(tokenRepository.save(any(Token.class))).thenReturn(savedToken);

        Tokens tokens = mock(Tokens.class);
        when(tokenRepository.findByIdentityAndTenantId(any())).thenReturn(tokens);

        Token actualToken = tokenService.create(tokenRequest);

        assertEquals(savedToken, actualToken);
    }

    @Test
    @Disabled
    void test_should_validate_token_request() {

        TokenRequest tokenRequest = mock(TokenRequest.class);

        tokenService.create(tokenRequest);

        verify(tokenRequest).validate();
    }

    @Test
    void test_should_throw_exception_when_no_matching_non_expired_token_is_present() {

        ValidateRequest validateRequest =
                new ValidateRequest("tenant", "otpNumber", "identity");

        Tokens tokens = mock(Tokens.class);

        when(tokens.hasSingleNonExpiredToken(now)).thenReturn(false);
        when(tokenRepository.findByIdentityAndTenantId(validateRequest)).thenReturn(tokens);

        assertThrows(TokenValidationFailureException.class,
                () -> tokenService.validate(validateRequest));
    }

    @Test
    void test_should_throw_exception_when_token_already_validated() {

        ValidateRequest validateRequest =
                new ValidateRequest("tenant", "otpNumber", "identity");

        Token token = Token.builder()
                .uuid("")
                .identity("test")
                .validated(true)
                .timeToLiveInSeconds(300L)
                .number("12345")
                .tenantId("default")
                .createdTime(new Date().getTime())
                .build();

        List<Token> tokenList = new ArrayList<>();
        tokenList.add(token);

        Tokens tokens = new Tokens(tokenList);

        when(tokenRepository.findByIdentityAndTenantId(validateRequest)).thenReturn(tokens);

        Token result = tokenService.validate(validateRequest);

        assertTrue(result.isValidated());
    }

    @Test
    void test_should_return_token_when_token_is_successfully_updated_to_validated() {

        ValidateRequest validateRequest =
                new ValidateRequest("tenant", "12345", "identity");

        Token token = Token.builder()
                .uuid("")
                .identity("test")
                .validated(false)
                .timeToLiveInSeconds(300L)
                .number(new BCryptPasswordEncoder().encode("12345"))
                .tenantId("default")
                .createdTime(new Date().getTime())
                .build();

        List<Token> tokenList = new ArrayList<>();
        tokenList.add(token);

        Tokens tokens = new Tokens(tokenList);

        when(tokenRepository.findByIdentityAndTenantId(validateRequest)).thenReturn(tokens);

        Token result = tokenService.validate(validateRequest);

        assertTrue(result.isValidated());
    }

    @Test
    void test_should_return_token_for_given_search_criteria() {

        Token expectedToken = Token.builder().build();
        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria("uuid", "tenant");

        when(tokenRepository.findBy(searchCriteria)).thenReturn(expectedToken);

        Token actualToken = tokenService.search(searchCriteria);

        assertEquals(expectedToken, actualToken);
    }
}