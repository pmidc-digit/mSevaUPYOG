package org.egov.persistence.repository;

import org.egov.domain.exception.TokenUpdateException;
import org.egov.domain.model.Token;
import org.egov.domain.model.TokenSearchCriteria;
import org.egov.domain.model.Tokens;
import org.egov.domain.model.ValidateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class TokenRepositoryTest {

    private final TokenRepository tokenRepository;

    @Autowired
    public TokenRepositoryTest(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.tokenRepository = new TokenRepository(namedParameterJdbcTemplate);
    }

    @Test
    void test_should_save_entity_token() {

        Token token = Token.builder()
                .uuid(UUID.randomUUID().toString())
                .number("99999")
                .identity("someIdentity")
                .timeToLiveInSeconds(400L)
                .createdDate(new Date())
                .tenantId("test")
                .build();

        Token savedToken = tokenRepository.save(token);

        assertNotNull(savedToken);
        assertEquals(token.getTenantId(), savedToken.getTenantId());
        assertEquals(token.getUuid(), savedToken.getUuid());
    }

    @Test
    @Sql(scripts = {"/sql/clearTokens.sql", "/sql/createTokens.sql"})
    void test_should_retrieve_otp_for_given_token_number_and_identity() {

        ValidateRequest validateRequest = ValidateRequest.builder()
                .otp("token2")
                .identity("identity2")
                .tenantId("tenant2")
                .build();

        Tokens actualTokens = tokenRepository.findByIdentityAndTenantId(validateRequest);

        assertNotNull(actualTokens);

        Token firstToken = actualTokens.getTokens().get(0);

        assertEquals("id2", firstToken.getUuid());
        assertEquals("identity2", firstToken.getIdentity());
        assertEquals("tenant2", firstToken.getTenantId());
        assertEquals("token2", firstToken.getNumber());
        assertEquals(Long.valueOf(200), firstToken.getTimeToLiveInSeconds());
        assertFalse(firstToken.isValidated());
        assertNotNull(firstToken.getCreatedDate());
    }

    @Test
    @Sql(scripts = {"/sql/clearTokens.sql", "/sql/createTokens.sql"})
    void test_should_fetch_token_by_id() {

        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria("id1", "tenant1");

        Token token = tokenRepository.findBy(searchCriteria);

        assertTrue(token.isValidated());
    }

    @Test
    @Sql(scripts = {"/sql/clearTokens.sql", "/sql/createTokens.sql"})
    void test_should_return_null_when_token_not_present_for_given_id() {

        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria("id5", "tenant6");

        Token token = tokenRepository.findBy(searchCriteria);

        assertNull(token);
    }

    @Test
    @Sql(scripts = {"/sql/clearTokens.sql", "/sql/createTokens.sql"})
    void test_should_return_true_when_token_is_updated_to_validated() {

        Token token = Token.builder()
                .uuid("id1")
                .build();

        tokenRepository.markAsValidated(token);

        assertTrue(token.isValidated());
    }

    @Test
    void test_should_throw_exception_when_token_is_not_updated_successfully() {

        Token token = Token.builder()
                .uuid("uuid")
                .build();

        assertThrows(TokenUpdateException.class,
                () -> tokenRepository.markAsValidated(token));
    }
}