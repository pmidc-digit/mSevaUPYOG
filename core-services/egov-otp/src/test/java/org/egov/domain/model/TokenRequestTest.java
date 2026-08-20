package org.egov.domain.model;

import org.egov.domain.exception.InvalidTokenRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenRequestTest {

    @Test
    void should_not_throw_validation_exception_when_mandatory_fields_are_present() {
        TokenRequest token = new TokenRequest("identity", "tenant");
        assertDoesNotThrow(token::validate);
    }

    @Test
    void should_throw_validation_exception_when_identity_not_present() {
        TokenRequest token = new TokenRequest(null, "tenant");

        assertTrue(token.isIdentityAbsent());

        assertThrows(InvalidTokenRequestException.class, token::validate);
    }

    @Test
    void should_throw_validation_exception_when_tenant_not_present() {
        TokenRequest token = new TokenRequest("identity", null);

        assertTrue(token.isTenantIdAbsent());

        assertThrows(InvalidTokenRequestException.class, token::validate);
    }

    @Test
    void should_generate_5_digit_token() {
        TokenRequest token = new TokenRequest("identity", "tenant");

        String generated = token.generateToken();

        assertNotNull(generated);
        assertEquals(5, generated.length());
    }
}