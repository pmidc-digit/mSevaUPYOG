package org.egov.domain.model;

import org.egov.domain.model.Token;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class TokensTest {

    @Test
    void test_should_return_true_when_single_non_expired_token_is_present() {
        Token token1 = mock(Token.class);
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

        when(token1.isExpired(now)).thenReturn(false);

        Tokens tokens = new Tokens(Collections.singletonList(token1));

        assertTrue(tokens.hasSingleNonExpiredToken(now));
        assertEquals(token1, tokens.getNonExpiredToken(now));
    }

    @Test
    void test_should_return_false_when_no_matching_tokens_are_present() {
        Tokens tokens = new Tokens(Collections.emptyList());
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

        assertFalse(tokens.hasSingleNonExpiredToken(now));
        assertNull(tokens.getNonExpiredToken(now));
    }

    @Test
    void test_should_return_false_when_matching_tokens_is_null() {
        Tokens tokens = new Tokens(null);
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

        assertFalse(tokens.hasSingleNonExpiredToken(now));
    }

    @Test
    void test_should_return_false_when_all_tokens_are_expired() {
        Token token1 = mock(Token.class);
        Token token2 = mock(Token.class);
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));

        when(token1.isExpired(now)).thenReturn(true);
        when(token2.isExpired(now)).thenReturn(true);

        Tokens tokens = new Tokens(Arrays.asList(token1, token2));

        assertFalse(tokens.hasSingleNonExpiredToken(now));
    }
}